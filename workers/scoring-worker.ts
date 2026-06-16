/**
 * BullMQ Scoring Worker — standalone Node process.
 * Run via: npm run worker:start
 *
 * Processes predictions in 500-row pages to avoid:
 *  - HTTP timeout (sync scoring times out at ~500 concurrent users)
 *  - Memory spikes (never loads all predictions into RAM at once)
 *  - DB overload (chunked updates, single transaction per page)
 *
 * After all pages are processed, refreshes the rankings materialized view CONCURRENTLY.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { createScoringWorker, getScoringQueueEvents } from '../src/lib/queue/bullmq'
import { calculatePoints, DEFAULT_SCORING_CONFIG } from '../src/lib/scoring/calculator'
import { redis } from '../src/lib/redis'
import type { ScoringJobData } from '../src/lib/queue/bullmq'
import pino from 'pino'

const PAGE_SIZE = 500

const logger = pino({ name: 'scoring-worker', redact: [] })
const prisma  = new PrismaClient()

// ── Worker processor ──────────────────────────────────────────

async function processScoringJob(job: { data: ScoringJobData }): Promise<void> {
  const { matchId, homeScore, awayScore, scoringJobId } = job.data

  logger.info({ matchId, scoringJobId }, 'Scoring job started')

  // Mark job as processing
  await prisma.scoringJob.update({
    where: { id: scoringJobId },
    data:  { status: 'processing', startedAt: new Date() },
  })

  // Count total predictions for progress reporting
  const totalRows = await prisma.prediction.count({ where: { matchId } })

  await prisma.scoringJob.update({
    where: { id: scoringJobId },
    data:  { totalRows },
  })

  const actual = { home: homeScore, away: awayScore }
  let processed = 0
  let cursor: string | undefined

  // Load scoring config from DB (or use defaults)
  const configRows = await prisma.tournamentConfig.findMany({
    where: { key: { in: ['scoring_exact', 'scoring_result'] } },
  })
  const config = { ...DEFAULT_SCORING_CONFIG }
  for (const row of configRows) {
    if (row.key === 'scoring_exact')  config.exactScore     = parseInt(row.value, 10)
    if (row.key === 'scoring_result') config.correctResult  = parseInt(row.value, 10)
  }

  // ── Page through predictions ──────────────────────────────────
  while (true) {
    const page = await prisma.prediction.findMany({
      where:   { matchId },
      take:    PAGE_SIZE,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { id: 'asc' },
      select:  { id: true, homeScore: true, awayScore: true },
    })

    if (page.length === 0) break

    // Calculate points for each prediction in this page
    const updates = page.map((pred) => ({
      id:     pred.id,
      points: calculatePoints(
        { home: pred.homeScore, away: pred.awayScore },
        actual,
        config,
      ),
    }))

    // Batch update in a single transaction
    await prisma.$transaction(
      updates.map(({ id, points }) =>
        prisma.prediction.update({
          where: { id },
          data:  { pointsEarned: points },
        })
      )
    )

    processed += page.length
    cursor = page[page.length - 1]?.id

    // Update progress
    await prisma.scoringJob.update({
      where: { id: scoringJobId },
      data:  { processed },
    })

    logger.info({ matchId, processed, total: totalRows }, 'Scoring page completed')
  }

  // ── Refresh materialized rankings view ────────────────────────
  // CONCURRENTLY: reads are NOT blocked during refresh
  await prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY rankings_view`

  // Bust ranking cache
  const keys = await redis.keys('rankings:*').catch(() => [] as string[])
  if (keys.length > 0) {
    await redis.del(...keys).catch(() => null)
  }

  // Mark job complete
  await prisma.scoringJob.update({
    where: { id: scoringJobId },
    data:  { status: 'done', completedAt: new Date(), processed },
  })

  logger.info({ matchId, scoringJobId, processed }, 'Scoring job completed')
}

// ── Boot worker ───────────────────────────────────────────────

const worker = createScoringWorker(processScoringJob)

worker.on('failed', async (job, err) => {
  logger.error({ err, jobId: job?.id }, 'Scoring job failed')
  if (job?.data.scoringJobId) {
    await prisma.scoringJob.update({
      where: { id: job.data.scoringJobId },
      data:  {
        status:       'failed',
        completedAt:  new Date(),
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      },
    }).catch(() => null)
  }
})

worker.on('ready', () => {
  logger.info('Scoring worker ready — waiting for jobs')
})

// Graceful shutdown
async function shutdown() {
  logger.info('Scoring worker shutting down...')
  await worker.close()
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT',  shutdown)
