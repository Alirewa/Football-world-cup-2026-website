import Redis from 'ioredis'
import { env } from './env'
import { logger } from './logger'

function createClient(): Redis {
  // In development, use a direct Redis URL (no Sentinel needed)
  // Set REDIS_URL=redis://localhost:6379 in .env.local
  if (env.NODE_ENV !== 'production' && process.env.REDIS_URL) {
    const client = new Redis(process.env.REDIS_URL, {
      lazyConnect:          true,
      retryStrategy:        (times) => Math.min(times * 100, 3000),
      enableOfflineQueue:   true,
      maxRetriesPerRequest: null,
    })
    client.on('connect',      () => logger.info('Redis connected (direct)'))
    client.on('ready',        () => logger.info('Redis ready'))
    client.on('error',        (err) => logger.error({ err }, 'Redis error'))
    client.on('reconnecting', () => logger.warn('Redis reconnecting'))
    return client
  }

  // Production: Redis Sentinel for high availability
  const sentinels = env.REDIS_SENTINEL_HOSTS.split(',').map((h) => {
    const [host, port] = h.trim().split(':')
    return { host: host ?? 'localhost', port: parseInt(port ?? '26379', 10) }
  })

  const client = new Redis({
    sentinels,
    name:                 env.REDIS_SENTINEL_NAME,
    password:             env.REDIS_PASSWORD || undefined,
    lazyConnect:          true,
    retryStrategy:        (times) => Math.min(times * 100, 3000),
    enableOfflineQueue:   true,
    maxRetriesPerRequest: null,
  })

  client.on('connect',      () => logger.info('Redis connected (sentinel)'))
  client.on('ready',        () => logger.info('Redis ready'))
  client.on('error',        (err) => logger.error({ err }, 'Redis error'))
  client.on('reconnecting', () => logger.warn('Redis reconnecting'))

  return client
}

// Singleton — safe across Next.js hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined
}

export const redis: Redis = globalThis.__redis ?? createClient()

if (env.NODE_ENV !== 'production') {
  globalThis.__redis = redis
}

// Helper: dedicated connection for pub/sub (cannot share with commands)
export function createSubscriberClient(): Redis {
  return redis.duplicate()
}
