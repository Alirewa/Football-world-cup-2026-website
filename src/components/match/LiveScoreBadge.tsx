'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { useLiveScore } from '@/hooks/useLiveScore'

interface LiveScoreBadgeProps {
  matchId:     string
  isFinalized: boolean
  kickoffAt:   string
}

export function LiveScoreBadge({ matchId, isFinalized, kickoffAt }: LiveScoreBadgeProps) {
  const t    = useTranslations('match')
  const live = useLiveScore(matchId)
  const now  = new Date()
  const kick = new Date(kickoffAt)

  if (isFinalized) return <Badge variant="finalized">{t('finalized')}</Badge>
  if (now < kick)  return <Badge variant="locked" className="text-[10px]">{t('upcoming')}</Badge>

  if (live?.isLive || (now >= kick && !isFinalized)) {
    return (
      <Badge variant="live" className="gap-1">
        <span className="live-dot" />
        {t('live')}
      </Badge>
    )
  }
  return null
}
