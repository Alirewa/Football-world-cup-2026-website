import { PrismaClient } from '@prisma/client'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

function createPrismaClient() {
  const client = new PrismaClient({
    log: env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
    datasources: {
      db: {
        // In production, DATABASE_URL points to PgBouncer which adds
        // ?pgbouncer=true&connection_limit=1 to prevent prepared statement issues
        url: env.DATABASE_URL,
      },
    },
  })

  if (env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(client as any).$on('query', (e: any) => {
      logger.debug({ query: e.query, duration: `${e.duration}ms` }, 'Prisma query')
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(client as any).$on('error', (e: any) => {
    logger.error({ message: e.message }, 'Prisma error')
  })

  return client
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
