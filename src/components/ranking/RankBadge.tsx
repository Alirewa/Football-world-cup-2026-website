import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'

interface RankBadgeProps {
  rank:      number
  className?: string
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  if (rank === 1) return (
    <div className={cn('rank-gold flex items-center justify-center w-8 h-8 rounded-full', className)}>
      <Trophy className="h-3.5 w-3.5" />
    </div>
  )
  if (rank === 2) return (
    <div className={cn('rank-silver flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm', className)}>
      2
    </div>
  )
  if (rank === 3) return (
    <div className={cn('rank-bronze flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm', className)}>
      3
    </div>
  )
  return (
    <div className={cn('flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-muted-foreground border border-border', className)}>
      {rank}
    </div>
  )
}
