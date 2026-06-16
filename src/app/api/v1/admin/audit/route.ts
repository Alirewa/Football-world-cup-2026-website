import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

const querySchema = z.object({
  adminId:    z.string().uuid().optional(),
  entityType: z.string().optional(),
  entityId:   z.string().optional(),
  cursor:     z.coerce.bigint().optional(),
  limit:      z.coerce.number().int().min(1).max(100).default(50),
})

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const query = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!query.success) return errors.unprocessable('Invalid query')
  const { adminId, entityType, entityId, cursor, limit } = query.data

  const where: Record<string, unknown> = {}
  if (adminId)    where.adminId    = adminId
  if (entityType) where.entityType = entityType
  if (entityId)   where.entityId   = entityId

  const logs = await prisma.adminAuditLog.findMany({
    where,
    take:    limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { id: 'desc' },
    select: {
      id:         true,
      action:     true,
      entityType: true,
      entityId:   true,
      beforeJson: true,
      afterJson:  true,
      ipAddress:  true,
      createdAt:  true,
      admin: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  })

  const hasMore    = logs.length > limit
  const items      = hasMore ? logs.slice(0, -1) : logs
  const nextCursor = hasMore ? String(items[items.length - 1]?.id) : null

  return ok({ items, nextCursor })
}
