import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { getScoringQueue } from '@/lib/queue/bullmq'
import { logger } from '@/lib/logger'
import { ok, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

const schema = z.object({
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // DB-verified admin check
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { adminId } = guard
  const { id } = await params

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await req.json())
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0]?.message : 'Invalid input'
    return errors.unprocessable(msg ?? 'Invalid input')
  }

  // Fetch match before-state for audit log
  const match = await prisma.match.findUnique({
    where:  { id },
    select: { id: true, homeScore: true, awayScore: true, isFinalized: true, finalizedAt: true, bracketSlot: true },
  })

  if (!match) return errors.notFound('Match not found')

  // ── Idempotency guard ─────────────────────────────────────────
  // Atomic: only update if NOT already finalized
  const updated = await prisma.$queryRaw<Array<{ id: string }>>`
    UPDATE matches
    SET    home_score    = ${body.homeScore},
           away_score    = ${body.awayScore},
           is_finalized  = true,
           finalized_at  = NOW(),
           finalized_by  = ${adminId}::uuid
    WHERE  id = ${id}::uuid
      AND  finalized_at IS NULL
    RETURNING id
  `

  if (!updated || updated.length === 0) {
    // Already finalized — idempotent 409
    logger.warn({ matchId: id, adminId }, 'Attempted to finalize already-finalized match')
    return errors.conflict('این بازی قبلاً نهایی شده است')
  }

  // Create scoring_jobs row
  const scoringJob = await prisma.scoringJob.create({
    data: {
      matchId: id,
      status:  'pending',
    },
    select: { id: true },
  })

  // Enqueue BullMQ scoring job (async — returns 202 immediately)
  await getScoringQueue().add(
    `score-match-${id}`,
    {
      matchId:      id,
      homeScore:    body.homeScore,
      awayScore:    body.awayScore,
      scoringJobId: scoringJob.id,
    },
    { jobId: `score-${id}` }, // deduplicate by matchId
  )

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action:     'MATCH_FINALIZE',
      entityType: 'match',
      entityId:   id,
      beforeJson: {
        homeScore:   match.homeScore,
        awayScore:   match.awayScore,
        isFinalized: match.isFinalized,
      },
      afterJson: {
        homeScore:   body.homeScore,
        awayScore:   body.awayScore,
        isFinalized: true,
      },
      ipAddress:  req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
      userAgent:  req.headers.get('user-agent')?.slice(0, 200) ?? null,
    },
  })

  logger.info({ matchId: id, adminId, scoringJobId: scoringJob.id }, 'Match finalized, scoring job enqueued')

  return ok({ message: 'Match finalized. Scoring job started.', scoringJobId: scoringJob.id }, 202)
}
