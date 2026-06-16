import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'
import { redis } from '@/lib/redis'
import { env } from '@/lib/env'
import { createHash } from 'crypto'

const BCRYPT_ROUNDS = 10

// ── OTP generation ───────────────────────────────────────────

/** Generate a cryptographically random 6-digit OTP */
export function generateOtpCode(): string {
  return String(randomInt(100_000, 999_999))
}

export async function hashOtpCode(code: string): Promise<string> {
  return bcrypt.hash(code, BCRYPT_ROUNDS)
}

export async function verifyOtpCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash)
}

// ── Rate limiting ─────────────────────────────────────────────
// Two layers:
//   1. Per-mobile send rate: max N requests per 15 minutes
//   2. Per-(mobile, ip) failure lockout: max N failures per hour → 1hr lockout

function mobileHash(mobile: string): string {
  return createHash('sha256').update(mobile).digest('hex').slice(0, 16)
}

function ipHash(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

// ── Send rate limit ───────────────────────────────────────────

/** Returns true if the mobile can send an OTP (not rate-limited) */
export async function checkSendRateLimit(mobile: string): Promise<boolean> {
  const key = `otp:send:${mobileHash(mobile)}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 15 * 60) // 15-minute window
  }
  return count <= env.OTP_MAX_PER_MOBILE_PER_15MIN
}

// ── Failure lockout ───────────────────────────────────────────

/** Check if mobile is locked out due to too many failures */
export async function isLockedOut(mobile: string, ip: string): Promise<boolean> {
  const lockKey = `otp:lockout:${mobileHash(mobile)}:${ipHash(ip)}`
  const locked = await redis.exists(lockKey)
  return locked === 1
}

/**
 * Record a failed OTP attempt. Locks out the (mobile, ip) pair after
 * OTP_LOCKOUT_MAX_FAILURES_PER_HOUR failures within an hour.
 * Returns true if now locked out.
 */
export async function recordFailure(mobile: string, ip: string): Promise<boolean> {
  const mh = mobileHash(mobile)
  const ih = ipHash(ip)
  const failKey = `otp:failures:${mh}:${ih}`
  const lockKey = `otp:lockout:${mh}:${ih}`

  const count = await redis.incr(failKey)
  if (count === 1) {
    await redis.expire(failKey, 3600) // 1-hour rolling window
  }

  if (count >= env.OTP_LOCKOUT_MAX_FAILURES_PER_HOUR) {
    await redis.setex(lockKey, env.OTP_LOCKOUT_DURATION_SECONDS, '1')
    await redis.del(failKey)
    return true
  }

  return false
}

/** Clear failure counter after a successful OTP verification */
export async function clearFailures(mobile: string, ip: string): Promise<void> {
  const mh = mobileHash(mobile)
  const ih = ipHash(ip)
  await redis.del(`otp:failures:${mh}:${ih}`)
}
