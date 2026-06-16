import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok } from '@/lib/response'
import { redis } from '@/lib/redis'

const CACHE_TTL = 300 // 5 min — groups rarely change

export async function GET(_req: NextRequest) {
  const cached = await redis.get('groups:teams').catch(() => null)
  if (cached) return ok(JSON.parse(cached))

  const groups = await prisma.group.findMany({
    orderBy: { name: 'asc' },
    include: {
      teams: {
        select: { id: true, nameEn: true, nameFa: true, fifaCode: true, flagUrl: true },
        orderBy: { nameEn: 'asc' },
      },
    },
  })

  await redis.set('groups:teams', JSON.stringify(groups), 'EX', CACHE_TTL).catch(() => null)
  return ok(groups)
}
