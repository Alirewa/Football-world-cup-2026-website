import { NextRequest } from 'next/server'
import { z } from 'zod'
import { normalizeMobile, isValidMobile } from '@/lib/validators/mobile'
import { checkSendRateLimit, isLockedOut, generateOtpCode, hashOtpCode } from '@/lib/auth/otp'
import { sendOtp } from '@/lib/kaveh-negar'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { apiLimiter, consumeLimit } from '@/lib/rate-limiter'
import { ok, errors } from '@/lib/response'
import { env } from '@/lib/env'

const schema = z.object({
  mobile:  z.string().min(1),
  purpose: z.enum(['login', 'register']).optional().default('login'),
})

export async function POST(req: NextRequest) {
  // 1. Global rate limit per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const limited = await consumeLimit(apiLimiter, `ip:${ip}`)
  if (!limited) return errors.tooManyRequests()

  // 2. Parse and validate body
  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await req.json())
  } catch {
    return errors.unprocessable('Invalid request body')
  }

  // 3. Normalize and validate mobile
  const mobile = normalizeMobile(body.mobile)
  if (!isValidMobile(mobile)) {
    return errors.unprocessable('شماره موبایل نامعتبر است')
  }

  // 4. Check per-mobile send rate limit (5 OTPs / 15 min)
  const canSend = await checkSendRateLimit(mobile)
  if (!canSend) {
    logger.warn({ mobile: '[REDACTED]' }, 'OTP send rate limit exceeded')
    return errors.tooManyRequests('تعداد درخواست رمز یکبار مصرف بیش از حد مجاز است. لطفاً ۱۵ دقیقه صبر کنید')
  }

  // 5. Check lockout (failed attempts from this IP)
  const locked = await isLockedOut(mobile, ip)
  if (locked) {
    logger.warn({ mobile: '[REDACTED]', ip: '[REDACTED]' }, 'OTP request from locked-out session')
    return errors.tooManyRequests('حساب شما موقتاً قفل شده است. لطفاً ۱ ساعت دیگر تلاش کنید')
  }

  // 6. Generate OTP (dev: bypass SMS for test account)
  const isDevTestAccount = process.env.NODE_ENV !== 'production' && mobile === '09123456789'
  const code     = isDevTestAccount ? '000000' : generateOtpCode()
  const codeHash = await hashOtpCode(code)

  const expiresAt = new Date(Date.now() + env.OTP_SESSION_EXPIRY_SECONDS * 1000)

  // 7. Upsert OTP session — one session per mobile (replace existing)
  const existingSession = await prisma.otpSession.findFirst({ where: { mobile } })
  if (existingSession) {
    await prisma.otpSession.update({
      where: { id: existingSession.id },
      data:  { codeHash, purpose: body.purpose, expiresAt, attempts: 0, usedAt: null, ipAddress: ip },
    })
  } else {
    await prisma.otpSession.create({
      data: { mobile, codeHash, purpose: body.purpose, expiresAt, attempts: 0, ipAddress: ip },
    })
  }

  // 8. Send SMS (skip for dev test account)
  if (!isDevTestAccount) {
    try {
      await sendOtp(mobile, code)
    } catch (err) {
      logger.error({ err }, 'Failed to send OTP SMS')
      return errors.internal('ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید')
    }
  }

  logger.info({ mobile: '[REDACTED]', purpose: body.purpose }, 'OTP sent')

  return ok({
    message:    'کد تأیید ارسال شد',
    expiresIn:  env.OTP_SESSION_EXPIRY_SECONDS,
  })
}
