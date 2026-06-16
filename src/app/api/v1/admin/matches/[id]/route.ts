import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'
import { logger } from '@/lib/logger'

const UpdateMatchSchema = z.object({
  homeTeamId:         z.string().uuid().nullable().optional(),
  awayTeamId:         z.string().uuid().nullable().optional(),
  kickoffAt:          z.string().datetime().optional(),
  predictionLockedAt: z.string().datetime().optional(),
  venue:              z.string().max(200).nullable().optional(),
  city:               z.string().max(100).nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const match   = await prisma.match.findUnique({
    where:   { id },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })
  if (!match) return errors.notFound()

  return ok(match)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const body    = await req.json().catch(() => null)
  const parsed  = UpdateMatchSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  const existing = await prisma.match.findUnique({ where: { id } })
  if (!existing) return errors.notFound()

  // Disallow editing a finalized match's teams
  if (existing.finalizedAt && (parsed.data.homeTeamId !== undefined || parsed.data.awayTeamId !== undefined)) {
    return errors.conflict('Cannot change teams on a finalized match')
  }

  const { kickoffAt, predictionLockedAt, homeTeamId, awayTeamId, venue, city } = parsed.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {
    ...(homeTeamId !== undefined      && { homeTeamId }),
    ...(awayTeamId !== undefined      && { awayTeamId }),
    ...(venue !== undefined           && { venue }),
    ...(city !== undefined            && { city }),
    ...(kickoffAt                     && { kickoffAt:          new Date(kickoffAt) }),
    ...(predictionLockedAt            && { predictionLockedAt: new Date(predictionLockedAt) }),
  }

  const updated = await prisma.match.update({ where: { id }, data })

  logger.info({ adminId: (admin as { adminId: string }).adminId, matchId: id }, 'Admin updated match metadata')

  return ok(updated)
}
