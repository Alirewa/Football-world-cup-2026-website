import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible'
import type { RateLimiterAbstract } from 'rate-limiter-flexible'
import { redis } from './redis'
import { logger } from './logger'

// ── Generic factory ───────────────────────────────────────────

function createLimiter(opts: {
  keyPrefix:  string
  points:     number  // max requests
  duration:   number  // window in seconds
  blockDuration?: number
}): RateLimiterAbstract {
  try {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix:   opts.keyPrefix,
      points:      opts.points,
      duration:    opts.duration,
      blockDuration: opts.blockDuration,
      insuranceLimiter: new RateLimiterMemory({
        keyPrefix:   opts.keyPrefix,
        points:      opts.points,
        duration:    opts.duration,
        blockDuration: opts.blockDuration,
      }),
    })
  } catch (err) {
    logger.error({ err }, 'Redis unavailable for rate limiter — using memory fallback')
    return new RateLimiterMemory({
      keyPrefix:   opts.keyPrefix,
      points:      opts.points,
      duration:    opts.duration,
      blockDuration: opts.blockDuration,
    })
  }
}

// ── Limiters ──────────────────────────────────────────────────

/** General API limiter: 100 req / 60s per IP */
export const apiLimiter = createLimiter({
  keyPrefix: 'rl:api',
  points:    100,
  duration:  60,
})

/** Prediction submit: 20 req / 60s per user (prevents burst) */
export const predictionLimiter = createLimiter({
  keyPrefix: 'rl:pred',
  points:    20,
  duration:  60,
})

/** Refresh token: 10 req / 60s per cookie */
export const refreshLimiter = createLimiter({
  keyPrefix: 'rl:refresh',
  points:    10,
  duration:  60,
})

// ── Consume helper ────────────────────────────────────────────

/**
 * Consume one point. Returns { allowed, msBeforeNext }.
 * Never throws — fails open with a warn log if limiter itself errors.
 */
export async function consumeLimit(
  limiter: RateLimiterAbstract,
  key: string,
): Promise<{ allowed: boolean; msBeforeNext: number }> {
  try {
    const res = await limiter.consume(key)
    return { allowed: true, msBeforeNext: res.msBeforeNext }
  } catch (err: unknown) {
    // RateLimiterRes thrown when blocked
    if (err && typeof err === 'object' && 'msBeforeNext' in err) {
      const res = err as { msBeforeNext: number }
      return { allowed: false, msBeforeNext: res.msBeforeNext }
    }
    // Unexpected error — fail open (don't block legitimate users)
    logger.error({ err }, 'Rate limiter unexpected error — failing open')
    return { allowed: true, msBeforeNext: 0 }
  }
}
