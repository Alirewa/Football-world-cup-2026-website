'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { MatchCard, MatchCardSkeleton } from './MatchCard'
import { useMatches } from '@/hooks/useMatches'
import { EmptyState } from '@/components/shared/EmptyState'
import { Swords } from 'lucide-react'

type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third_place' | 'final' | 'all'
const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

interface MatchGridProps {
  onMatchClick?: (matchId: string) => void
  showPredictions?: boolean
}

export function MatchGrid({ onMatchClick, showPredictions: _showPredictions = false }: MatchGridProps) {
  const t = useTranslations('match')
  const [stage, setStage] = useState<Stage>('all')
  const [group, setGroup] = useState<string | undefined>(undefined)

  const { matches, isLoading } = useMatches({
    stage: stage === 'all' ? undefined : stage,
    group: stage === 'group' ? group : undefined,
    limit: 48,
  })

  const stages: { key: Stage; label: string }[] = [
    { key: 'all',        label: t('stage_all')   },
    { key: 'group',      label: t('stage_group')  },
    { key: 'r32',        label: t('stage_r32')    },
    { key: 'r16',        label: t('stage_r16')    },
    { key: 'qf',         label: t('stage_qf')     },
    { key: 'sf',         label: t('stage_sf')     },
    { key: 'third_place',label: t('stage_third')  },
    { key: 'final',      label: t('stage_final')  },
  ]

  return (
    <div className="space-y-4">
      {/* Stage tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {stages.map(s => (
          <button
            key={s.key}
            onClick={() => { setStage(s.key); setGroup(undefined) }}
            className={cn(
              'shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
              stage === s.key
                ? 'bg-[#0E7A43] text-white'
                : 'glass text-muted-foreground hover:text-foreground',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Group sub-tabs */}
      {stage === 'group' && (
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setGroup(undefined)}
            className={cn(
              'shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all',
              !group ? 'bg-[#F5B700] text-black' : 'glass text-muted-foreground hover:text-foreground',
            )}
          >
            {t('all_groups')}
          </button>
          {GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={cn(
                'shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all',
                group === g ? 'bg-[#F5B700] text-black' : 'glass text-muted-foreground hover:text-foreground',
              )}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Match grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <MatchCardSkeleton key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState icon={<Swords className="h-8 w-8" />} title={t('no_matches')} description={t('no_matches_desc')} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={onMatchClick ? () => onMatchClick(match.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
