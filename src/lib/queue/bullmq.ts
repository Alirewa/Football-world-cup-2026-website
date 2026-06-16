import { Queue, Worker, QueueEvents } from 'bullmq'
import type { ConnectionOptions } from 'bullmq'
import { env } from '@/lib/env'

// Parse sentinel hosts from env
const sentinelHosts = env.REDIS_SENTINEL_HOSTS.split(',').map((h) => {
  const [host, port] = h.trim().split(':')
  return { host: host ?? 'localhost', port: parseInt(port ?? '26379', 10) }
})

export const redisConnection: ConnectionOptions = {
  sentinels: sentinelHosts,
  name:      env.REDIS_SENTINEL_NAME,
  password:  env.REDIS_PASSWORD || undefined,
}

// ── Queue names ───────────────────────────────────────────────

export const QUEUE_NAMES = {
  SCORING: 'scoring',
} as const

// ── Scoring queue ─────────────────────────────────────────────

export interface ScoringJobData {
  matchId:     string
  homeScore:   number
  awayScore:   number
  scoringJobId: string  // ID of the scoring_jobs DB row
}

let _scoringQueue: Queue<ScoringJobData> | null = null

export function getScoringQueue(): Queue<ScoringJobData> {
  if (!_scoringQueue) {
    _scoringQueue = new Queue<ScoringJobData>(QUEUE_NAMES.SCORING, {
      connection:     redisConnection,
      defaultJobOptions: {
        removeOnComplete: 100,  // keep last 100 completed jobs
        removeOnFail:     200,  // keep last 200 failed jobs for debugging
        attempts:         3,
        backoff: {
          type:  'exponential',
          delay: 5_000,
        },
      },
    })
  }
  return _scoringQueue
}

export function getScoringQueueEvents(): QueueEvents {
  return new QueueEvents(QUEUE_NAMES.SCORING, { connection: redisConnection })
}

export function createScoringWorker(
  processor: (job: { data: ScoringJobData }) => Promise<void>,
): Worker<ScoringJobData> {
  return new Worker<ScoringJobData>(
    QUEUE_NAMES.SCORING,
    processor,
    {
      connection: redisConnection,
      concurrency: 1,  // one scoring job at a time — prevents DB overload
    },
  )
}
