import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { redis } from '@/lib/redis'

const CACHE_TTL = 60 // seconds

const querySchema = z.object({
  stage:  z.string().optional(),
  group:  z.string().toUpperCase().optional(),
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!query.success) return errors.unprocessable('Invalid query parameters')

  const { stage, group, page, limit } = query.data
  const skip = (page - 1) * limit

  const cacheKey = `matches:${stage ?? 'all'}:${group ?? 'all'}:${page}:${limit}`
  const cached   = await redis.get(cacheKey).catch(() => null)
  if (cached) {
    return ok(JSON.parse(cached))
  }

  const where: Record<string, unknown> = {}
  if (stage) where.stage = stage
  if (group) {
    where.OR = [
      { homeTeam: { group: { name: group } } },
      { awayTeam: { group: { name: group } } },
    ]
  }

  const [matches, total] = await prisma.$transaction([
    prisma.match.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { kickoffAt: 'asc' },
      select: {
        id:                 true,
        stage:              true,
        bracketSlot:        true,
        kickoffAt:          true,
        predictionLockedAt: true,
        homeScore:          true,
        awayScore:          true,
        isFinalized:        true,
        venue:              true,
        city:               true,
        country:            true,
        homeTeam: {
          select: {
            id:      true,
            fifaCode: true,
            nameEn:  true,
            nameFa:  true,
            flagUrl: true,
          },
        },
        awayTeam: {
          select: {
            id:      true,
            fifaCode: true,
            nameEn:  true,
            nameFa:  true,
            flagUrl: true,
          },
        },
      },
    }),
    prisma.match.count({ where }),
  ])

  const result = {
    data:  matches,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  }

  await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL).catch(() => null)

  return ok(result)
}
