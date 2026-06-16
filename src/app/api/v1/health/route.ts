import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/redis'
import { getS3Client } from '@/lib/storage'
import { HeadBucketCommand } from '@aws-sdk/client-s3'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

interface HealthStatus {
  status:   'ok' | 'degraded' | 'down'
  services: Record<string, 'ok' | 'error'>
  ts:       string
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const results: Record<string, 'ok' | 'error'> = {}

  // DB ping
  try {
    await prisma.$queryRaw`SELECT 1`
    results.database = 'ok'
  } catch (err) {
    logger.error({ err }, 'Health: DB ping failed')
    results.database = 'error'
  }

  // Redis ping
  try {
    await redis.ping()
    results.redis = 'ok'
  } catch (err) {
    logger.error({ err }, 'Health: Redis ping failed')
    results.redis = 'error'
  }

  // Object storage ping
  try {
    const s3 = getS3Client()
    await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }))
    results.storage = 'ok'
  } catch (err) {
    logger.error({ err }, 'Health: Storage ping failed')
    results.storage = 'error'
  }

  const allOk    = Object.values(results).every((v) => v === 'ok')
  const anyOk    = Object.values(results).some((v) => v === 'ok')
  const status: HealthStatus['status'] = allOk ? 'ok' : anyOk ? 'degraded' : 'down'
  const httpStatus = allOk ? 200 : anyOk ? 200 : 503

  return NextResponse.json(
    { status, services: results, ts: new Date().toISOString() },
    { status: httpStatus },
  )
}
