import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params

  const job = await prisma.scoringJob.findFirst({
    where:   { matchId: id },
    orderBy: { id: 'desc' },
    select: {
      id:           true,
      status:       true,
      totalRows:    true,
      processed:    true,
      startedAt:    true,
      completedAt:  true,
      errorMessage: true,
    },
  })

  if (!job) return errors.notFound('No scoring job found for this match')

  const progress = job.totalRows && job.totalRows > 0
    ? Math.round((job.processed / job.totalRows) * 100)
    : null

  return ok({ ...job, progress })
}
