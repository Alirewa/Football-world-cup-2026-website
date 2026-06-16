import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/redis'
import { refreshTokenExpiresAt } from './jwt'
import { logger } from '@/lib/logger'

// ── Rotation lock ─────────────────────────────────────────────
// Prevents two concurrent tabs from racing to refresh the same token.
// Only one refresh wins per 5-second window; the other gets the already-issued token.

const ROTATION_LOCK_TTL = 5 // seconds
const ROTATION_RESULT_TTL = 6 // slightly longer than lock

async function acquireRotationLock(jti: string): Promise<boolean> {
  const lockKey = `rt:lock:${jti}`
  const result = await redis.set(lockKey, '1', 'EX', ROTATION_LOCK_TTL, 'NX')
  return result === 'OK'
}

async function getCachedRotationResult(jti: string): Promise<string | null> {
  return redis.get(`rt:result:${jti}`)
}

async function cacheRotationResult(oldJti: string, newJti: string): Promise<void> {
  await redis.setex(`rt:result:${oldJti}`, ROTATION_RESULT_TTL, newJti)
}

// ── CRUD ─────────────────────────────────────────────────────

export async function createRefreshToken(opts: {
  userId: string
  deviceHint?: string
  ipAddress?: string
}): Promise<{ jti: string }> {
  const { jti } = await prisma.refreshToken.create({
    data: {
      userId:     opts.userId,
      expiresAt:  refreshTokenExpiresAt(),
      deviceHint: opts.deviceHint,
      ipAddress:  opts.ipAddress,
    },
    select: { jti: true },
  })
  return { jti }
}

/**
 * Rotate a refresh token: atomically revoke the old jti and issue a new one.
 * Uses a Redis lock to prevent concurrent refresh races.
 * Returns the new jti, or throws if the old jti is invalid/revoked.
 */
export async function rotateRefreshToken(opts: {
  oldJti:     string
  userId:     string
  deviceHint?: string
  ipAddress?: string
}): Promise<{ jti: string }> {
  // Check if another tab already rotated this jti
  const cached = await getCachedRotationResult(opts.oldJti)
  if (cached) {
    logger.debug({ oldJti: opts.oldJti, newJti: cached }, 'Refresh token rotation: serving cached result')
    return { jti: cached }
  }

  const acquired = await acquireRotationLock(opts.oldJti)
  if (!acquired) {
    // Another request holds the lock — poll for result
    await new Promise(r => setTimeout(r, 200))
    const retried = await getCachedRotationResult(opts.oldJti)
    if (retried) return { jti: retried }
    throw new Error('Refresh token rotation conflict — please retry')
  }

  // Validate that the token exists and is not revoked
  const existing = await prisma.refreshToken.findUnique({
    where: { jti: opts.oldJti },
    select: { userId: true, revokedAt: true, expiresAt: true },
  })

  if (!existing) throw new Error('Refresh token not found')
  if (existing.revokedAt) throw new Error('Refresh token has been revoked')
  if (existing.userId !== opts.userId) throw new Error('Refresh token user mismatch')
  if (existing.expiresAt < new Date()) throw new Error('Refresh token expired')

  // Create new token + revoke old — within a single transaction
  const [newToken] = await prisma.$transaction([
    prisma.refreshToken.create({
      data: {
        userId:     opts.userId,
        expiresAt:  refreshTokenExpiresAt(),
        deviceHint: opts.deviceHint,
        ipAddress:  opts.ipAddress,
      },
      select: { jti: true },
    }),
    prisma.refreshToken.update({
      where: { jti: opts.oldJti },
      data:  { revokedAt: new Date() },
    }),
  ])

  if (!newToken) throw new Error('Failed to create refresh token')

  await cacheRotationResult(opts.oldJti, newToken.jti)
  logger.info({ userId: opts.userId, oldJti: opts.oldJti, newJti: newToken.jti }, 'Refresh token rotated')

  return { jti: newToken.jti }
}

/** Revoke a single refresh token (logout) */
export async function revokeRefreshToken(jti: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { jti, revokedAt: null },
    data:  { revokedAt: new Date() },
  })
}

/** Revoke ALL active tokens for a user (role change, password reset) */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data:  { revokedAt: new Date() },
  })
  logger.info({ userId }, 'All refresh tokens revoked')
}
