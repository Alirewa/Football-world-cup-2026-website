import { NextRequest } from 'next/server'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'
import { syncMatchResults } from '@/lib/sync/football-data'
import { ok, errors } from '@/lib/response'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

/**
 * POST /api/v1/admin/sync-matches
 * Fetches latest WC 2026 results from football-data.org and auto-finalizes finished matches.
 * Requires admin token. Add FOOTBALL_DATA_API_KEY to .env to enable.
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  if (!env.FOOTBALL_DATA_API_KEY) {
    return errors.badRequest(
      'FOOTBALL_DATA_API_KEY is not configured. ' +
      'Get a free key at https://www.football-data.org/client/register and add it to your .env file.',
    )
  }

  try {
    const result = await syncMatchResults()
    logger.info({ adminId: guard.adminId, ...result }, 'match sync completed')
    return ok({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    logger.error({ adminId: guard.adminId, error: message }, 'match sync failed')
    return errors.internal(message)
  }
}
