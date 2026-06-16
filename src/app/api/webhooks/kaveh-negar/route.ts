import { NextRequest } from 'next/server'
import { verifyWebhookSignature } from '@/lib/kaveh-negar'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { ok, errors } from '@/lib/response'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-kaveh-negar-signature') ?? ''
  const rawBody   = await req.text()

  // HMAC-SHA256 signature verification
  if (!verifyWebhookSignature(rawBody, signature)) {
    logger.warn('Kaveh Negar webhook signature verification failed')
    return errors.forbidden('Invalid signature')
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return errors.badRequest('Invalid JSON')
  }

  // Status update for SMS delivery receipts
  const { messageId, status } = payload as { messageId?: string; status?: string }

  if (messageId && status) {
    await prisma.smsLog.updateMany({
      where: { messageId },
      data:  { status },
    })
    logger.info({ messageId, status }, 'SMS delivery status updated via webhook')
  }

  return ok({ received: true })
}
