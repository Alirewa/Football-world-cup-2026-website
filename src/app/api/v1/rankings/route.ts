import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/redis'
import { ok, errors } from '@/lib/response'
import { getSignedObjectUrl, avatarKey } from '@/lib/storage'

const CACHE_TTL = 60 // 1 minute

const querySchema = z.object({
  cursor: z.coerce.number().int().min(1).optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(50),
})

export async function GET(req: NextRequest) {
  const query = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!query.success) return errors.unprocessable('Invalid query')

  const { cursor, limit } = query.data
  const cacheKey = `rankings:${cursor ?? 1}:${limit}`

  const cached = await redis.get(cacheKey).catch(() => null)
  if (cached) return ok(JSON.parse(cached))

  // Rankings materialized view: rank, userId, firstName, mobileMasked, avatarId, totalPoints
  let rows: Array<{
    rank:          bigint
    user_id:       string
    first_name:    string | null
    mobile_masked: string
    avatar_id:     string | null
    total_points:  number
  }>
  try {
    rows = await prisma.$queryRaw`
      SELECT rank, user_id, first_name, mobile_masked, avatar_id, total_points
      FROM   rankings_view
      WHERE  (${cursor ?? 1}::bigint = 1 OR rank >= ${cursor ?? 1}::bigint)
      ORDER BY rank ASC
      LIMIT  ${limit + 1}
    `
  } catch {
    // View not yet populated (no scored predictions) — return empty list
    return ok({ items: [], nextCursor: null })
  }

  const hasMore = rows.length > limit
  const items   = hasMore ? rows.slice(0, -1) : rows

  // Batch resolve signed avatar URLs
  const enriched = await Promise.all(
    items.map(async (row) => ({
      rank:         Number(row.rank),
      userId:       row.user_id,
      firstName:    row.first_name ?? '',
      mobileMasked: row.mobile_masked,
      totalPoints:  row.total_points,
      avatarUrl:    row.avatar_id
        ? await getSignedObjectUrl(avatarKey(row.avatar_id)).catch(() => null)
        : null,
    }))
  )

  const nextCursor = hasMore ? Number(items[items.length - 1]?.rank) + 1 : null
  const result = { items: enriched, nextCursor }

  await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL).catch(() => null)

  return ok(result)
}
