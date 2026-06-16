/**
 * POST /admin/matches/:id/score
 * Updates live score during a match (before finalization).
 * Publishes to Redis Pub/Sub → SSE clients receive update.
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { ok, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

const schema = z.object({
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
  minute:    z.number().int().min(0).max(120).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await req.json())
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0]?.message : 'Invalid input'
    return errors.unprocessable(msg ?? 'Invalid input')
  }

  const match = await prisma.match.findUnique({
    where:  { id },
    select: { id: true, isFinalized: true, bracketSlot: true },
  })

  if (!match) return errors.notFound('Match not found')
  if (match.isFinalized) return errors.conflict('Match already finalized — use /finalize instead')

  // Update live score
  await prisma.match.update({
    where: { id },
    data:  { homeScore: body.homeScore, awayScore: body.awayScore },
  })

  // Publish to SSE subscribers via Redis Pub/Sub
  const channel = `match:${id}:updates`
  const event   = JSON.stringify({
    type:      'SCORE_UPDATE',
    matchId:   id,
    homeScore: body.homeScore,
    awayScore: body.awayScore,
    minute:    body.minute ?? null,
    ts:        new Date().toISOString(),
  })

  await redis.publish(channel, event)

  logger.info({ matchId: id, adminId: guard.adminId, homeScore: body.homeScore, awayScore: body.awayScore }, 'Live score updated')

  return ok({ message: 'Score updated and broadcasted' })
}
