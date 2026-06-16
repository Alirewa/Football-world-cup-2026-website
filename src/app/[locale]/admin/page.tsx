'use client'

import { useTranslations } from 'next-intl'
import { Users, Target, Trophy, Zap } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/badge'
import { useAdminStats, useAdminRecentMatches } from '@/hooks/useAdminData'
import { formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const t      = useTranslations('admin')
  const { stats, isLoading: statsLoading }     = useAdminStats()
  const { matches, isLoading: matchesLoading } = useAdminRecentMatches()

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black">{t('dashboard')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('dashboard_subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stat_users')}
          value={statsLoading ? '—' : (stats?.totalUsers ?? 0).toLocaleString()}
          icon={Users}
          color="green"
        />
        <StatCard
          title={t('stat_predictions')}
          value={statsLoading ? '—' : (stats?.totalPredictions ?? 0).toLocaleString()}
          icon={Target}
          color="blue"
        />
        <StatCard
          title={t('stat_finalized')}
          value={statsLoading ? '—' : (stats?.finalizedMatches ?? 0)}
          icon={Trophy}
          color="gold"
        />
        <StatCard
          title={t('stat_pending_jobs')}
          value={statsLoading ? '—' : (stats?.pendingJobs ?? 0)}
          icon={Zap}
          color={stats?.pendingJobs ? 'red' : 'green'}
        />
      </div>

      {/* Recent matches */}
      <div>
        <h2 className="text-base font-bold mb-4">{t('recent_matches')}</h2>
        <DataTable
          isLoading={matchesLoading}
          data={matches ?? []}
          keyExtractor={r => r.id}
          columns={[
            {
              key: 'kickoffAt',
              header: t('col_date'),
              cell: r => <span className="text-xs font-mono">{formatDate(r.kickoffAt)}</span>,
            },
            {
              key: 'home',
              header: t('col_match'),
              cell: r => (
                <span className="font-medium text-sm">
                  {r.homeTeam?.nameFa}
                  {' '}<span className="text-muted-foreground">vs</span>{' '}
                  {r.awayTeam?.nameFa}
                </span>
              ),
            },
            {
              key: 'score',
              header: t('col_score'),
              cell: r => r.isFinalized
                ? <span className="font-black">{r.homeScore}–{r.awayScore}</span>
                : <span className="text-muted-foreground">—</span>,
            },
            {
              key: 'isFinalized',
              header: t('col_status'),
              cell: r => r.isFinalized
                ? <Badge variant="finalized">{t('finalized')}</Badge>
                : <Badge variant="locked">{t('upcoming')}</Badge>,
            },
          ]}
        />
      </div>
    </div>
  )
}
