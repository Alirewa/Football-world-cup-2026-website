'use client'

import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/DataTable'
import { useAdminPredictions } from '@/hooks/useAdminData'
import { formatDate } from '@/lib/utils'

export default function AdminPredictionsPage() {
  const t      = useTranslations('admin')
  const { predictions, isLoading } = useAdminPredictions()

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black">{t('predictions')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('predictions_subtitle')}</p>
      </div>

      <DataTable
        isLoading={isLoading}
        data={predictions ?? []}
        keyExtractor={r => r.id}
        pageSize={30}
        columns={[
          {
            key: 'user',
            header: t('col_user'),
            cell: r => <span className="font-medium text-sm">{r.user?.firstName}</span>,
          },
          {
            key: 'match',
            header: t('col_match'),
            cell: r => (
              <span className="text-sm">
                {r.match?.homeTeam?.nameFa}
                {' vs '}
                {r.match?.awayTeam?.nameFa}
              </span>
            ),
          },
          {
            key: 'score',
            header: t('col_prediction'),
            cell: r => <span className="font-black tabular-nums">{r.homeScore}–{r.awayScore}</span>,
          },
          {
            key: 'pointsEarned',
            header: t('col_points'),
            cell: r => r.pointsEarned !== null
              ? <span className="font-bold text-[#F5B700]">{r.pointsEarned}</span>
              : <span className="text-muted-foreground">—</span>,
          },
          {
            key: 'createdAt',
            header: t('col_date'),
            cell: r => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
          },
        ]}
      />
    </div>
  )
}
