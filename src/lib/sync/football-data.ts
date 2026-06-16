import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'
import { getScoringQueue } from '@/lib/queue/bullmq'
import { logger } from '@/lib/logger'

const API_BASE = 'https://api.football-data.org/v4'

// ── football-data.org response types ─────────────────────────

interface FdTeam {
  tla: string
  name: string
}

interface FdScore {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
}

interface FdMatch {
  id: number
  status: 'FINISHED' | 'IN_PLAY' | 'PAUSED' | 'TIMED' | 'SCHEDULED'
  stage: string
  utcDate: string
  homeTeam: FdTeam
  awayTeam: FdTeam
  score: FdScore
}

export interface SyncResult {
  checked: number
  finalized: number
  liveUpdated: number
  skipped: number
  errors: string[]
}

// ── API fetch helper ──────────────────────────────────────────

async function fetchApi(path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Auth-Token': env.FOOTBALL_DATA_API_KEY ?? '' },
    cache: 'no-store',
  })

  if (res.status === 429) throw new Error('football-data.org rate limit hit — retry later')
  if (!res.ok) throw new Error(`football-data.org API ${res.status}: ${res.statusText}`)

  return res.json()
}

// ── Main sync function ────────────────────────────────────────

export async function syncMatchResults(): Promise<SyncResult> {
  if (!env.FOOTBALL_DATA_API_KEY) {
    throw new Error('FOOTBALL_DATA_API_KEY is not configured')
  }

  const result: SyncResult = {
    checked: 0, finalized: 0, liveUpdated: 0, skipped: 0, errors: [],
  }

  // Fetch finished + live matches for WC 2026
  const data = await fetchApi('/competitions/WC/matches?status=FINISHED,IN_PLAY,PAUSED') as {
    matches?: FdMatch[]
  }

  const fdMatches = data.matches ?? []
  if (fdMatches.length === 0) return result

  // Build team lookup: fifaCode → DB id
  const allTeams = await prisma.team.findMany({ select: { id: true, fifaCode: true } })
  const teamById = new Map<string, string>(
    allTeams.map(t => [t.fifaCode.toUpperCase(), t.id]),
  )

  for (const fd of fdMatches) {
    result.checked++

    const homeTla = fd.homeTeam?.tla?.toUpperCase()
    const awayTla = fd.awayTeam?.tla?.toUpperCase()

    if (!homeTla || !awayTla) { result.skipped++; continue }

    const homeTeamId = teamById.get(homeTla)
    const awayTeamId = teamById.get(awayTla)

    if (!homeTeamId || !awayTeamId) {
      result.errors.push(`Unknown team codes: ${homeTla} vs ${awayTla}`)
      result.skipped++
      continue
    }

    // Find our match by both team IDs within ±24 h of the API kickoff date
    const fdKickoff = new Date(fd.utcDate)
    const windowMs  = 24 * 60 * 60 * 1000
    const ourMatch  = await prisma.match.findFirst({
      where: {
        homeTeamId,
        awayTeamId,
        kickoffAt: {
          gte: new Date(fdKickoff.getTime() - windowMs),
          lte: new Date(fdKickoff.getTime() + windowMs),
        },
      },
      select: { id: true, isFinalized: true, homeScore: true, awayScore: true },
    })

    if (!ourMatch) {
      result.errors.push(`DB match not found: ${homeTla} vs ${awayTla} ~${fdKickoff.toISOString()}`)
      result.skipped++
      continue
    }

    // ── FINISHED: finalize if not already done ────────────────
    if (fd.status === 'FINISHED') {
      const homeScore = fd.score.fullTime.home
      const awayScore = fd.score.fullTime.away

      if (homeScore === null || awayScore === null) { result.skipped++; continue }
      if (ourMatch.isFinalized) { result.skipped++; continue }

      // Atomic idempotency guard — same pattern as admin finalize route
      const updated = await prisma.$queryRaw<Array<{ id: string }>>`
        UPDATE matches
        SET    home_score   = ${homeScore},
               away_score   = ${awayScore},
               is_finalized = true,
               finalized_at = NOW()
        WHERE  id            = ${ourMatch.id}::uuid
          AND  finalized_at IS NULL
        RETURNING id
      `

      if (!updated || updated.length === 0) { result.skipped++; continue }

      // Create scoring_jobs row + enqueue BullMQ job
      const scoringJob = await prisma.scoringJob.create({
        data:   { matchId: ourMatch.id, status: 'pending' },
        select: { id: true },
      })

      await getScoringQueue().add(
        `score-match-${ourMatch.id}`,
        { matchId: ourMatch.id, homeScore, awayScore, scoringJobId: scoringJob.id },
        { jobId: `score-${ourMatch.id}` },
      )

      logger.info({ matchId: ourMatch.id, homeScore, awayScore }, 'auto-finalized via sync')
      result.finalized++
      continue
    }

    // ── IN_PLAY / PAUSED: update live score without finalizing ─
    if (fd.status === 'IN_PLAY' || fd.status === 'PAUSED') {
      if (ourMatch.isFinalized) { result.skipped++; continue }

      const homeScore = fd.score.fullTime.home ?? 0
      const awayScore = fd.score.fullTime.away ?? 0

      // Only write if score actually changed
      if (ourMatch.homeScore !== homeScore || ourMatch.awayScore !== awayScore) {
        await prisma.match.update({
          where: { id: ourMatch.id },
          data:  { homeScore, awayScore },
        })
        result.liveUpdated++
      } else {
        result.skipped++
      }
    }
  }

  return result
}
