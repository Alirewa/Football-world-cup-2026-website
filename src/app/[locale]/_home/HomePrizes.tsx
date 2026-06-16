'use client'

import { usePrizes } from '@/hooks/useContent'
import { PrizeTier } from '@/components/content/PrizeTier'
import { Skeleton } from '@/components/ui/skeleton'

export function HomePrizes() {
  const { prizes, isLoading } = usePrizes()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 space-y-3">
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {prizes.slice(0, 3).map(prize => <PrizeTier key={prize.id} prize={prize} />)}
    </div>
  )
}
