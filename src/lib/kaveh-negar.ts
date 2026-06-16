import { createHmac, timingSafeEqual } from 'crypto'
import { env } from './env'
import { prisma } from './db/prisma'
import { logger } from './logger'

const BASE_URL = 'https://api.kavenegar.com/v1'

// ── Send OTP ──────────────────────────────────────────────────

interface SendOtpResult {
  success:   boolean
  messageId: string | null
  error?:    string
}

export async function sendOtp(mobile: string, code: string): Promise<SendOtpResult> {
  const apiKey = env.KAVEH_NEGAR_API_KEY

  try {
    // Use template API (more reliable and cheaper than raw SMS)
    const url = `${BASE_URL}/${apiKey}/verify/lookup.json`
    const params = new URLSearchParams({
      receptor: mobile,
      template: env.KAVEH_NEGAR_TEMPLATE_OTP,
      token:    code,
      type:     'sms',
    })

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    })

    const data = await response.json() as {
      return?: { status: number; message: string }
      entries?: Array<{ messageid: number; status: number }>
    }

    const status   = data.return?.status
    const messageId = data.entries?.[0]?.messageid?.toString() ?? null

    const success = status === 200

    // Audit log every SMS send
    await prisma.smsLog.create({
      data: {
        mobile,
        message:   `OTP to ${mobile}`,
        provider:  'kaveh_negar',
        messageId,
        status:    success ? 'sent' : `error:${status}`,
      },
    })

    if (!success) {
      logger.warn({ mobile, status, message: data.return?.message }, 'Kaveh Negar send failed')
      return { success: false, messageId: null, error: data.return?.message }
    }

    logger.info({ mobile, messageId }, 'OTP SMS sent')
    return { success: true, messageId }
  } catch (err) {
    logger.error({ err, mobile }, 'Kaveh Negar request failed')

    // Attempt fallback (retry once)
    try {
      await new Promise(r => setTimeout(r, 2000))
      return await sendOtpFallback(mobile, code)
    } catch (fallbackErr) {
      logger.error({ fallbackErr }, 'Kaveh Negar fallback also failed')
      return { success: false, messageId: null, error: 'SMS service unavailable' }
    }
  }
}

async function sendOtpFallback(mobile: string, code: string): Promise<SendOtpResult> {
  // Retry with raw SMS endpoint as fallback
  const apiKey = env.KAVEH_NEGAR_API_KEY
  const url = `${BASE_URL}/${apiKey}/sms/send.json`
  const params = new URLSearchParams({
    receptor: mobile,
    message:  `کد تأیید شما: ${code}\nاعتبار: ۲ دقیقه`,
    sender:   env.KAVEH_NEGAR_SENDER,
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    signal: AbortSignal.timeout(8_000),
  })

  const data = await response.json() as { return?: { status: number } }
  const success = data.return?.status === 200

  await prisma.smsLog.create({
    data: {
      mobile,
      message:   `OTP fallback to ${mobile}`,
      provider:  'kaveh_negar_raw',
      messageId: null,
      status:    success ? 'sent_fallback' : 'failed',
    },
  })

  return { success, messageId: null }
}

// ── Webhook HMAC verification ─────────────────────────────────

/**
 * Verify Kaveh Negar delivery receipt webhook.
 * The signature is sent as X-KavehNegar-Signature header.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false

  const expected = createHmac('sha256', env.KAVEH_NEGAR_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')

  try {
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex'),
    )
  } catch {
    return false
  }
}
