import { NextRequest } from 'next/server'
import { z } from 'zod'
import { normalizeMobile, isValidMobile } from '@/lib/validators/mobile'
import { validateNationalId } from '@/lib/validators/national-id'
import { encryptNationalId } from '@/lib/db/pii.service'
import { signAccessToken, signRefreshToken, refreshTokenExpiresAt } from '@/lib/auth/jwt'
import { createRefreshToken } from '@/lib/auth/refresh-tokens'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { apiLimiter, consumeLimit } from '@/lib/rate-limiter'
import { ok, errors } from '@/lib/response'
import { env } from '@/lib/env'

const schema = z.object({
  mobile:     z.string().min(1),
  code:       z.string().length(6).regex(/^\d{6}$/),
  firstName:  z.string().min(2).max(50).trim(),
  lastName:   z.string().min(2).max(50).trim(),
  nationalId: z.string().length(10).regex(/^\d{10}$/),
  email:      z.string().email().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const limited = await consumeLimit(apiLimiter, `ip:${ip}`)
  if (!limited) return errors.tooManyRequests()

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await req.json())
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0]?.message : 'Invalid input'
    return errors.unprocessable(msg ?? 'Invalid input')
  }

  const mobile = normalizeMobile(body.mobile)
  if (!isValidMobile(mobile)) {
    return errors.unprocessable('شماره موبایل نامعتبر است')
  }

  // Validate national ID checksum
  if (!validateNationalId(body.nationalId)) {
    return errors.unprocessable('کد ملی نامعتبر است')
  }

  // Re-verify OTP session is still valid (prevent replay of registration without fresh OTP)
  const session = await prisma.otpSession.findUnique({ where: { mobile } })
  if (!session || !session.usedAt) {
    return errors.badRequest('احراز هویت شماره موبایل الزامی است. ابتدا کد تأیید را وارد کنید')
  }
  // Session must have been used within last 10 minutes
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000)
  if (session.usedAt < tenMinAgo) {
    return errors.badRequest('جلسه احراز هویت منقضی شده است. دوباره تلاش کنید')
  }
  // Accept both 'register' purpose and 'login' purpose (new user detected during login flow)

  // Check mobile not already registered
  const existing = await prisma.user.findUnique({
    where:  { mobile },
    select: { id: true, deletedAt: true },
  })

  if (existing) {
    if (existing.deletedAt) {
      return errors.conflict('این شماره قبلاً ثبت‌نام کرده اما حساب حذف شده است. با پشتیبانی تماس بگیرید')
    }
    return errors.conflict('این شماره قبلاً ثبت‌نام کرده است. وارد شوید')
  }

  // Encrypt national ID
  const { enc, iv } = encryptNationalId(body.nationalId)

  // Create user
  let user: { id: string; role: string }
  try {
    user = await prisma.user.create({
      data: {
        mobile,
        firstName:     body.firstName,
        lastName:      body.lastName,
        nationalIdEnc: enc,
        nationalIdIv:  iv,
        email:         body.email || null,
        role:          'user',
        isActive:      true,
        locale:        'fa',
        theme:         'dark',
      },
      select: { id: true, role: true },
    })
  } catch (err: unknown) {
    // Unique constraint on mobile (race condition)
    if ((err as { code?: string }).code === 'P2002') {
      return errors.conflict('این شماره قبلاً ثبت‌نام کرده است. وارد شوید')
    }
    logger.error({ err }, 'User creation failed')
    return errors.internal()
  }

  // Invalidate OTP session so it can't be reused
  await prisma.otpSession.delete({ where: { mobile } }).catch(() => null)

  // Issue tokens
  const accessToken = await signAccessToken({ userId: user.id, role: user.role as 'user' | 'admin' })
  const { jti }     = await createRefreshToken({
    userId:    user.id,
    ipAddress: ip,
    deviceHint: req.headers.get('user-agent')?.slice(0, 200) ?? undefined,
  })
  const refreshToken = await signRefreshToken(jti, user.id)
  const expiresAt    = refreshTokenExpiresAt()

  logger.info({ userId: user.id }, 'New user registered')

  const response = ok({ accessToken, userId: user.id }, 201)
  response.cookies.set({
    name:     '__Host-refresh',
    value:    refreshToken,
    httpOnly: true,
    secure:   env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    expires:  expiresAt,
  })
  return response
}

