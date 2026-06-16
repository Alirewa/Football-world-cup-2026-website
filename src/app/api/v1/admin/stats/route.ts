import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const [totalUsers, totalPredictions, finalizedMatches] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, role: 'user' } }),
    prisma.prediction.count(),
    prisma.match.count({ where: { isFinalized: true } }),
  ])

  return ok({ totalUsers, totalPredictions, finalizedMatches, pendingJobs: 0 })
}
