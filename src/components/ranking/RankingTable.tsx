'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { RankBadge } from './RankBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useRankings, useMyRank } from '@/hooks/useRankings'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'

const MOCK_RANKINGS = [
  { userId: 'm1', rank: 1, firstName: 'علی',     mobileMasked: '091****1234', totalPoints: 87, avatarUrl: null },
  { userId: 'm2', rank: 2, firstName: 'سارا',    mobileMasked: '093****5678', totalPoints: 74, avatarUrl: null },
  { userId: 'm3', rank: 3, firstName: 'رضا',     mobileMasked: '091****9012', totalPoints: 63, avatarUrl: null },
  { userId: 'm4', rank: 4, firstName: 'مریم',    mobileMasked: '090****3456', totalPoints: 55, avatarUrl: null },
  { userId: 'm5', rank: 5, firstName: 'محمد',    mobileMasked: '091****7890', totalPoints: 42, avatarUrl: null },
]

export function RankingTable() {
  const t    = useTranslations('ranking')
  const user = useAuthStore(s => s.user)
  const { rankings, hasMore, isLoading, loadMore } = useRankings()
  const { rank: myRank } = useMyRank()

  if (isLoading && rankings.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="glass rounded-xl px-4 py-3 flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  const displayRankings = rankings.length > 0 ? rankings : MOCK_RANKINGS
  const isMock = !isLoading && rankings.length === 0

  return (
    <div className="space-y-3">
      {isMock && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-amber-400">
          <Users className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            <span className="font-bold">داده‌های نمونه</span> — هنوز کاربری پیش‌بینی ثبت نکرده.
            پس از ثبت‌نام کاربران و پیش‌بینی بازی‌ها، جدول واقعی نمایش داده می‌شود.
          </p>
        </div>
      )}

      {/* My rank sticky banner */}
      {user && myRank && (
        <div className="glass rounded-xl px-4 py-3 border border-[#0E7A43]/30 flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{t('your_rank', { rank: myRank.rank })}</span>
          <span className="text-sm font-bold text-[#F5B700]">{myRank.totalPoints} {t('points')}</span>
        </div>
      )}

      {/* Ranking rows */}
      <div className="space-y-1.5">
        {displayRankings.map((row) => (
          <div
            key={row.userId}
            className={cn(
              'glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all',
              row.userId === user?.id && 'border border-[#0E7A43]/40 bg-[#0E7A43]/5',
            )}
          >
            <RankBadge rank={row.rank} />

            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border/50 bg-muted/40 shrink-0">
              {row.avatarUrl ? (
                <Image src={row.avatarUrl} alt={row.firstName} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                  {row.firstName[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{row.firstName}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{row.mobileMasked}</p>
            </div>

            <div className="text-right">
              <span className={cn(
                'text-base font-black tabular-nums',
                row.rank <= 3 ? 'text-[#F5B700]' : 'text-foreground',
              )}>
                {row.totalPoints}
              </span>
              <p className="text-[10px] text-muted-foreground">{t('points')}</p>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={loadMore}>
            {t('load_more')}
          </Button>
        </div>
      )}
    </div>
  )
}
