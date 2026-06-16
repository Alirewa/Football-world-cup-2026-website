import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeMobile, isValidMobile } from '@/lib/validators/mobile'
import {
  verifyOtpCode,
  isLockedOut,
  recordFailure,
  clearFailures,
} from '@/lib/auth/otp'
import { signAccessToken, signRefreshToken, refreshTokenExpiresAt } from '@/lib/auth/jwt'
import { createRefreshToken } from '@/lib/auth/refresh-tokens'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { apiLimiter, consumeLimit } from '@/lib/rate-limiter'
import { ok, errors } from '@/lib/response'
import { env } from '@/lib/env'

const MAX_ATTEMPTS = 3

const schema = z.object({
  mobile: z.string().min(1),
  code:   z.string().length(6).regex(/^\d{6}$/),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const limited = await consumeLimit(apiLimiter, `ip:${ip}`)
  if (!limited) return errors.tooManyRequests()

  const rawBody = await req.json().catch(() => null)

  // DEV-only: test account bypass (09123456789 / 1234)
  if (process.env.NODE_ENV !== 'production') {
    const rawMobile = normalizeMobile(String(rawBody?.mobile ?? ''))
    if (rawMobile === '09123456789' && String(rawBody?.code) === '1234') {
      return handleDevLogin(rawMobile, ip, req)
    }
  }

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(rawBody)
  } catch {
    return errors.unprocessable('کد نامعتبر است')
  }

  const mobile = normalizeMobile(body.mobile)
  if (!isValidMobile(mobile)) {
    return errors.unprocessable('شماره موبایل نامعتبر است')
  }

  // Check lockout
  const locked = await isLockedOut(mobile, ip)
  if (locked) {
    return errors.tooManyRequests('حساب موقتاً قفل شده است. لطفاً ۱ ساعت دیگر تلاش کنید')
  }

  // Fetch OTP session
  const session = await prisma.otpSession.findFirst({ where: { mobile } })
  if (!session) {
    return errors.badRequest('درخواست کد تأیید یافت نشد. ابتدا کد را دریافت کنید')
  }

  // Expired?
  if (session.expiresAt < new Date()) {
    return errors.badRequest('کد تأیید منقضی شده است. کد جدید دریافت کنید')
  }

  // Already used?
  if (session.usedAt) {
    return errors.badRequest('این کد قبلاً استفاده شده است')
  }

  // Attempt limit per session
  if (session.attempts >= MAX_ATTEMPTS) {
    await recordFailure(mobile, ip)
    return errors.tooManyRequests('تعداد تلاش‌ها بیش از حد مجاز است. کد جدید دریافت کنید')
  }

  // Verify code
  const valid = await verifyOtpCode(body.code, session.codeHash)
  if (!valid) {
    // Increment attempts
    await prisma.otpSession.update({
      where:  { id: session.id },
      data:   { attempts: { increment: 1 } },
    })
    await recordFailure(mobile, ip)

    const remaining = MAX_ATTEMPTS - (session.attempts + 1)
    logger.warn({ mobile: '[REDACTED]', remaining }, 'OTP verification failed')

    if (remaining <= 0) {
      return errors.tooManyRequests('تعداد تلاش‌ها بیش از حد مجاز است. کد جدید دریافت کنید')
    }
    return errors.badRequest(`کد نادرست است. ${remaining} تلاش باقی مانده`)
  }

  // Mark session as used
  await prisma.otpSession.update({
    where: { id: session.id },
    data:  { usedAt: new Date() },
  })
  await clearFailures(mobile, ip)

  // Check if user exists
  const user = await prisma.user.findUnique({
    where:  { mobile },
    select: { id: true, role: true, isActive: true, deletedAt: true },
  })

  // If no user exists and purpose = login, prompt registration
  if (!user && session.purpose === 'login') {
    return ok({ requiresRegistration: true, mobile }, 200)
  }

  // Banned or soft-deleted
  if (user) {
    if (user.deletedAt) {
      return errors.forbidden('حساب شما حذف شده است')
    }
    if (!user.isActive) {
      return errors.forbidden('حساب شما غیرفعال است. با پشتیبانی تماس بگیرید')
    }
  }

  // If user exists — issue tokens
  if (user) {
    const accessToken = await signAccessToken({ userId: user.id, role: user.role })

    const { jti } = await createRefreshToken({
      userId:     user.id,
      ipAddress:  ip,
      deviceHint: req.headers.get('user-agent')?.slice(0, 200) ?? undefined,
    })

    const refreshToken  = await signRefreshToken(jti, user.id)
    const expiresAt     = refreshTokenExpiresAt()

    logger.info({ userId: user.id }, 'User logged in via OTP')

    const response = ok({ accessToken, requiresRegistration: false })
    setRefreshCookie(response, refreshToken, expiresAt)
    return response
  }

  // purpose === 'register' — OTP is valid, proceed to registration step
  // Return a short-lived verified-mobile token (just the mobile; registration route will re-check session)
  return ok({ requiresRegistration: true, mobile })
}

// ── Dev test account login helper ─────────────────────────────

async function handleDevLogin(mobile: string, ip: string, req: NextRequest) {
  let user = await prisma.user.findUnique({
    where:  { mobile },
    select: { id: true, role: true, isActive: true, deletedAt: true },
  })

  if (!user) {
    user = await prisma.user.create({
      data: { mobile, firstName: '', lastName: '', role: 'user', isActive: true, locale: 'fa', theme: 'dark' },
      select: { id: true, role: true, isActive: true, deletedAt: true },
    })
  }

  if (user.deletedAt) return errors.forbidden('حساب شما حذف شده است')
  if (!user.isActive) return errors.forbidden('حساب شما غیرفعال است')

  const accessToken = await signAccessToken({ userId: user.id, role: user.role })
  const { jti } = await createRefreshToken({
    userId:     user.id,
    ipAddress:  ip,
    deviceHint: req.headers.get('user-agent')?.slice(0, 200) ?? undefined,
  })
  const refreshToken = await signRefreshToken(jti, user.id)
  const expiresAt    = refreshTokenExpiresAt()

  const response = ok({ accessToken, requiresRegistration: false })
  setRefreshCookie(response, refreshToken, expiresAt)
  return response
}

// ── Cookie helper ─────────────────────────────────────────────

function setRefreshCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set({
    name:     '__Host-refresh',
    value:    token,
    httpOnly: true,
    secure:   env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    expires:  expiresAt,
  })
}
