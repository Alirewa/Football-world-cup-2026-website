'use client'

import Image from 'next/image'
import { RankBadge } from '@/components/ranking/RankBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRankings } from '@/hooks/useRankings'
import { cn } from '@/lib/utils'

export function HomeRankings() {
  const { rankings, isLoading } = useRankings(5)

  if (isLoading) {
    return (
      <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl overflow-hidden divide-y divide-border/50">
      {rankings.map(row => (
        <div
          key={row.userId}
          className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
        >
          <RankBadge rank={row.rank} />
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border/50 bg-muted/40 shrink-0">
            {row.avatarUrl ? (
              <Image src={row.avatarUrl} alt={row.firstName} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                {row.firstName[0]}
              </div>
            )}
          </div>
          <span className="flex-1 text-sm font-medium truncate">{row.firstName}</span>
          <span className={cn(
            'text-sm font-black tabular-nums',
            row.rank <= 3 ? 'text-[#F5B700]' : 'text-foreground',
          )}>
            {row.totalPoints}
          </span>
        </div>
      ))}
    </div>
  )
}
