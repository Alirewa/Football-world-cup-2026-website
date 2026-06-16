import { NextRequest } from 'next/server'
import { verifyRefreshToken, signAccessToken, signRefreshToken, refreshTokenExpiresAt } from '@/lib/auth/jwt'
import { rotateRefreshToken } from '@/lib/auth/refresh-tokens'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { refreshLimiter, consumeLimit } from '@/lib/rate-limiter'
import { ok, errors } from '@/lib/response'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  // Rate limit: 10 refreshes / 60s per refresh cookie identity
  const rawCookie = req.cookies.get('__Host-refresh')?.value
  if (!rawCookie) {
    return errors.unauthorized('No refresh token')
  }

  const limited = await consumeLimit(refreshLimiter, `refresh:${rawCookie.slice(-20)}`)
  if (!limited) return errors.tooManyRequests()

  // Verify refresh token signature + expiry
  let payload: Awaited<ReturnType<typeof verifyRefreshToken>>
  try {
    payload = await verifyRefreshToken(rawCookie)
  } catch {
    const response = errors.unauthorized('Refresh token invalid or expired')
    response.cookies.delete('__Host-refresh')
    return response
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'

  // Rotate: Redis lock prevents 2-tab race condition
  let rotated: { jti: string }
  try {
    rotated = await rotateRefreshToken({
      oldJti:    payload.jti,
      userId:    payload.sub,
      ipAddress: ip,
      deviceHint: req.headers.get('user-agent')?.slice(0, 200) ?? undefined,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('not found') || msg.includes('revoked')) {
      // Revoked token â€” possible theft; revoke all sessions
      logger.warn({ userId: payload.sub }, 'Revoked refresh token reuse detected â€” revoking all sessions')
      await revokeAllSessions(payload.sub)
      const response = errors.unauthorized('Session revoked due to security policy')
      response.cookies.delete('__Host-refresh')
      return response
    }
    if (msg.includes('rotation locked')) {
      // Race condition resolved â€” wait for the winner
      return errors.tooManyRequests('Token rotation in progress, retry in 1 second')
    }
    logger.error({ err, userId: payload.sub }, 'Refresh token rotation failed')
    return errors.internal('Token rotation failed')
  }

  // Fetch fresh user data (role may have changed since token was issued)
  const user = await prisma.user.findUnique({
    where:  { id: payload.sub },
    select: { id: true, role: true, isActive: true, deletedAt: true },
  })

  if (!user || user.deletedAt || !user.isActive) {
    const response = errors.unauthorized('Account not available')
    response.cookies.delete('__Host-refresh')
    return response
  }

  // Issue new access token with fresh role claim
  const accessToken  = await signAccessToken({ userId: user.id, role: user.role })
  const refreshToken = await signRefreshToken(rotated.jti, user.id)
  const expiresAt    = refreshTokenExpiresAt()

  const response = ok({ accessToken })
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

async function revokeAllSessions(userId: string) {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data:  { revokedAt: new Date() },
    })
  } catch (err) {
    logger.error({ err, userId }, 'Failed to revoke all sessions')
  }
}

