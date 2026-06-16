/**
 * GET /api/cron/sync-matches
 * Called by an external cron (PM2 cron, system crontab, or Vercel Cron Jobs).
 * Protected by CRON_SECRET header to prevent public access.
 *
 * Setup: add to crontab or PM2 ecosystem:
 *   * /5 * * * * curl -s -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/cron/sync-matches
 *
 * Or add CRON_SECRET to .env and configure your scheduler.
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncMatchResults } from '@/lib/sync/football-data'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

export async function GET(req: NextRequest) {
  // Validate cron secret (optional but recommended)
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get('x-cron-secret')
    if (authHeader !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!env.FOOTBALL_DATA_API_KEY) {
    return NextResponse.json({ error: 'FOOTBALL_DATA_API_KEY not configured' }, { status: 400 })
  }

  try {
    const result = await syncMatchResults()
    logger.info({ ...result }, 'cron sync-matches completed')
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    logger.error({ error: message }, 'cron sync-matches failed')
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
