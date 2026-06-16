import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { ok, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  try {
    // CONCURRENTLY: does not block reads during refresh
    await prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY rankings_view`

    // Bust cached ranking pages
    const keys = await redis.keys('rankings:*').catch(() => [] as string[])
    if (keys.length > 0) {
      await redis.del(...keys).catch(() => null)
    }

    await prisma.adminAuditLog.create({
      data: {
        adminId:    guard.adminId,
        action:     'RANKINGS_RECALCULATE',
        entityType: 'rankings_view',
        entityId:   'rankings_view',
        ipAddress:  req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
        userAgent:  req.headers.get('user-agent')?.slice(0, 200) ?? null,
      },
    })

    logger.info({ adminId: guard.adminId }, 'Rankings materialized view refreshed')
    return ok({ message: 'Rankings recalculated successfully' })
  } catch (err) {
    logger.error({ err }, 'Failed to refresh rankings materialized view')
    return errors.internal('Rankings recalculation failed')
  }
}
