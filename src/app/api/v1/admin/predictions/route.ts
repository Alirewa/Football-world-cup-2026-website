import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '50', 10), 200)

  const predictions = await prisma.prediction.findMany({
    take:    limit,
    orderBy: { submittedAt: 'desc' },
    select: {
      id:           true,
      homeScore:    true,
      awayScore:    true,
      pointsEarned: true,
      submittedAt:  true,
      user:  { select: { firstName: true } },
      match: {
        select: {
          homeTeam: { select: { nameFa: true, nameEn: true } },
          awayTeam: { select: { nameFa: true, nameEn: true } },
        },
      },
    },
  })

  const data = predictions.map((p) => ({ ...p, createdAt: p.submittedAt }))
  return ok({ data })
}
