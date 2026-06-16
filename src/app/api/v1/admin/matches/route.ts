import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (isAdminGuardError(admin)) return admin

  const { searchParams } = req.nextUrl
  const stage  = searchParams.get('stage')
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200)
  const cursor = searchParams.get('cursor')

  const matches = await prisma.match.findMany({
    where:   stage ? { stage: stage as never } : {},
    orderBy: { kickoffAt: 'asc' },
    take:    limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      homeTeam: { select: { nameEn: true, nameFa: true, fifaCode: true } },
      awayTeam: { select: { nameEn: true, nameFa: true, fifaCode: true } },
    },
  })

  const items = matches.length > limit ? matches.slice(0, limit) : matches

  return ok({ data: items })
}
