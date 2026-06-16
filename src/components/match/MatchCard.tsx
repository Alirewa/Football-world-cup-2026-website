'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Calendar, MapPin } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { LiveScoreBadge } from './LiveScoreBadge'
import type { Match } from '@/hooks/useMatches'

interface MatchCardProps {
  match:    Match
  onClick?: () => void
  compact?: boolean
}

function TeamDisplay({ team, score, isHome }: {
  team:   Match['homeTeam']
  score:  number | null
  isHome: boolean
}) {
  const name = team?.nameFa ?? '?'
  return (
    <div className={cn('flex flex-col items-center gap-2 flex-1', !isHome && 'items-center')}>
      <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-border/50 bg-muted/30">
        {team?.flagUrl ? (
          <Image src={team.flagUrl} alt={team.nameEn} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
            {team?.fifaCode?.[0] ?? '?'}
          </div>
        )}
      </div>
      <span className="text-xs font-semibold text-center max-w-[80px] leading-tight">{name}</span>
      {score !== null && (
        <span className="text-2xl font-black tabular-nums">{score}</span>
      )}
    </div>
  )
}

export function MatchCard({ match, onClick, compact = false }: MatchCardProps) {
  const t = useTranslations('match')

  const stageLabels: Record<string, string> = {
    group:       t('stage_group'),
    r32:         t('stage_r32'),
    r16:         t('stage_r16'),
    qf:          t('stage_qf'),
    sf:          t('stage_sf'),
    third_place: t('stage_third'),
    final:       t('stage_final'),
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass glass-hover rounded-2xl transition-all duration-200',
        compact ? 'p-4' : 'p-5',
        onClick && 'cursor-pointer',
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {stageLabels[match.stage] ?? match.stage}
          {match.stage === 'group' && match.bracketSlot.includes('-') && (
            <> · {t('group')} {match.bracketSlot.split('-')[1]}</>
          )}
        </span>
        <LiveScoreBadge matchId={match.id} isFinalized={match.isFinalized} kickoffAt={match.kickoffAt} />
      </div>

      {/* Teams & score */}
      <div className="flex items-center gap-3">
        <TeamDisplay team={match.homeTeam} score={match.homeScore} isHome />

        <div className="flex flex-col items-center gap-1 px-2">
          {match.isFinalized ? (
            <span className="text-3xl font-black tabular-nums text-[#F5B700]">
              {match.homeScore} – {match.awayScore}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground font-medium">{t('vs')}</span>
          )}
        </div>

        <TeamDisplay team={match.awayTeam} score={match.awayScore} isHome={false} />
      </div>

      {!compact && (
        <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(match.kickoffAt)}
          </span>
          {match.venue && (
            <span className="flex items-center gap-1 max-w-[140px] truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {match.venue}
            </span>
          )}
        </div>
      )}

      {/* User prediction banner */}
      {match.prediction && (
        <div className={cn(
          'mt-3 rounded-xl px-3 py-2 flex items-center justify-between text-xs',
          match.isFinalized ? 'bg-[#0E7A43]/10 border border-[#0E7A43]/20' : 'bg-muted/30',
        )}>
          <span className="text-muted-foreground">{t('your_prediction')}</span>
          <span className="font-bold">
            {match.prediction.homeScore} – {match.prediction.awayScore}
            {match.prediction.pointsEarned !== null && (
              <span className="ms-2 text-[#F5B700]">+{match.prediction.pointsEarned} {t('pts')}</span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

export function MatchCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-2 flex-1">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-8" />
        <div className="flex flex-col items-center gap-2 flex-1">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
