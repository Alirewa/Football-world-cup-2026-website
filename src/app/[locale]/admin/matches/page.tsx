'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/DataTable'
import { MatchScoreForm } from '@/components/admin/MatchScoreForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAdminMatches } from '@/hooks/useAdminData'
import { api } from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SyncResult {
  checked:     number
  finalized:   number
  liveUpdated: number
  skipped:     number
  errors:      string[]
}

export default function AdminMatchesPage() {
  const t      = useTranslations('admin')
  const { matches, isLoading, mutate } = useAdminMatches()

  const [syncing,    setSyncing]    = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await api.post<SyncResult>('/api/v1/admin/sync-matches', {})
      setSyncResult(result)
      if (result.finalized > 0 || result.liveUpdated > 0) {
        mutate()
        toast.success(`${result.finalized} بازی نهایی شد، ${result.liveUpdated} نتیجه زنده به‌روز شد`)
      } else {
        toast.info('تغییری یافت نشد')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در همگام‌سازی'
      toast.error(msg)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">{t('matches')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('matches_subtitle')}</p>
        </div>

        {/* Sync from football-data.org */}
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="gap-2 border-[#0E7A43]/30 text-[#0E7A43] hover:bg-[#0E7A43]/10"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'در حال همگام‌سازی...' : 'همگام‌سازی نتایج'}
          </Button>
          <p className="text-[10px] text-muted-foreground">از football-data.org</p>
        </div>
      </div>

      {/* Sync result banner */}
      {syncResult && (
        <div className={`glass rounded-xl border p-4 text-sm flex items-start gap-3 ${
          syncResult.errors.length > 0
            ? 'border-yellow-500/30 bg-yellow-500/5'
            : 'border-green-500/30 bg-green-500/5'
        }`}>
          {syncResult.errors.length > 0
            ? <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
            : <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />}
          <div className="flex-1">
            <p className="font-semibold">
              {`بررسی شده: ${syncResult.checked} | نهایی شد: ${syncResult.finalized} | زنده: ${syncResult.liveUpdated} | رد شده: ${syncResult.skipped}`}
            </p>
            {syncResult.errors.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-yellow-400/80">
                {syncResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        data={matches ?? []}
        keyExtractor={r => r.id}
        pageSize={25}
        columns={[
          {
            key: 'kickoffAt',
            header: t('col_date'),
            cell: r => <span className="text-xs font-mono whitespace-nowrap">{formatDate(r.kickoffAt)}</span>,
          },
          {
            key: 'stage',
            header: t('col_stage'),
            cell: r => <Badge variant="outline" className="text-[10px] uppercase">{r.stage}</Badge>,
          },
          {
            key: 'home',
            header: t('col_match'),
            cell: r => (
              <span className="font-medium text-sm whitespace-nowrap">
                {r.homeTeam?.nameFa}
                {' vs '}
                {r.awayTeam?.nameFa}
              </span>
            ),
          },
          {
            key: 'score',
            header: t('col_score'),
            cell: r => (
              <MatchScoreForm
                matchId={r.id}
                homeScore={r.homeScore}
                awayScore={r.awayScore}
                isFinalized={r.isFinalized}
                onSuccess={mutate}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
