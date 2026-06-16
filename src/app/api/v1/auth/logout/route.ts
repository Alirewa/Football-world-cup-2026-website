import { NextRequest } from 'next/server'
import { verifyRefreshToken } from '@/lib/auth/jwt'
import { revokeRefreshToken } from '@/lib/auth/refresh-tokens'
import { logger } from '@/lib/logger'
import { ok } from '@/lib/response'

export async function POST(req: NextRequest) {
  const rawCookie = req.cookies.get('__Host-refresh')?.value

  if (rawCookie) {
    try {
      const payload = await verifyRefreshToken(rawCookie)
      await revokeRefreshToken(payload.jti)
      logger.info({ userId: payload.sub }, 'User logged out, refresh token revoked')
    } catch {
      // Token already expired/invalid â€” still clear the cookie
    }
  }

  const response = ok({ message: 'Logged out successfully' })
  response.cookies.set({
    name:     '__Host-refresh',
    value:    '',
    httpOnly: true,
    secure:   true,
    sameSite: 'strict',
    path:     '/',
    maxAge:   0,
  })
  // Clear access token cookie if set
  response.cookies.set({
    name:   'access_token',
    value:  '',
    path:   '/',
    maxAge: 0,
  })
  return response
}

