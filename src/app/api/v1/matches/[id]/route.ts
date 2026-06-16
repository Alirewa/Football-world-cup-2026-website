import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = req.headers.get('x-user-id')
  const { id } = await params

  const match = await prisma.match.findUnique({
    where: { id },
    select: {
      id:                 true,
      stage:              true,
      bracketSlot:        true,
      kickoffAt:          true,
      predictionLockedAt: true,
      homeScore:          true,
      awayScore:          true,
      isFinalized:        true,
      finalizedAt:        true,
      venue:              true,
      city:               true,
      country:            true,
      homeTeam: {
        select: { id: true, fifaCode: true, nameEn: true, nameFa: true, flagUrl: true },
      },
      awayTeam: {
        select: { id: true, fifaCode: true, nameEn: true, nameFa: true, flagUrl: true },
      },
    },
  })

  if (!match) return errors.notFound('Match not found')

  // Attach user's prediction if authenticated
  let prediction: { homeScore: number; awayScore: number; pointsEarned: number | null } | null = null
  if (userId) {
    const pred = await prisma.prediction.findUnique({
      where:  { uq_prediction_user_match: { userId, matchId: id } },
      select: { homeScore: true, awayScore: true, pointsEarned: true },
    })
    prediction = pred ?? null
  }

  return ok({ ...match, prediction })
}
