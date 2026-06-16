import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/redis'
import { ok } from '@/lib/response'

const CACHE_KEY = 'bracket:full'
const CACHE_TTL = 300 // 5 minutes

export async function GET(_req: NextRequest) {
  const cached = await redis.get(CACHE_KEY).catch(() => null)
  if (cached) {
    return ok(JSON.parse(cached))
  }

  const matches = await prisma.match.findMany({
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
      homeTeam: { select: { id: true, fifaCode: true, nameEn: true, nameFa: true, flagUrl: true } },
      awayTeam: { select: { id: true, fifaCode: true, nameEn: true, nameFa: true, flagUrl: true } },
    },
  })

  // Bracket advancement edges
  const advancements = await prisma.bracketAdvancement.findMany({
    select: {
      sourceMatchId: true,
      targetMatchId: true,
      teamSlot:      true,
      isWinner:      true,
    },
  })

  const result = { matches, advancements }
  await redis.set(CACHE_KEY, JSON.stringify(result), 'EX', CACHE_TTL).catch(() => null)

  return ok(result)
}
