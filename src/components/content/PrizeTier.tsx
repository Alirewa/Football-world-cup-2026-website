'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Prize } from '@/hooks/useContent'

interface PrizeTierProps {
  prize: Prize
}

const tierConfig = {
  1: {
    gradient:  'from-yellow-500/30 via-yellow-600/10 to-transparent',
    border:    'border-yellow-500/40',
    badge:     'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    label:     'text-yellow-300',
    glow:      'shadow-[0_0_40px_rgba(245,183,0,0.15)]',
    prizeImg:  '/images/prize-1st.svg',
    rankLabel: '🥇',
  },
  2: {
    gradient:  'from-slate-400/25 via-slate-500/10 to-transparent',
    border:    'border-slate-400/35',
    badge:     'bg-slate-400/20 text-slate-200 border-slate-400/30',
    label:     'text-slate-200',
    glow:      'shadow-[0_0_30px_rgba(148,163,184,0.12)]',
    prizeImg:  '/images/prize-2nd.svg',
    rankLabel: '🥈',
  },
  3: {
    gradient:  'from-orange-600/25 via-orange-700/10 to-transparent',
    border:    'border-orange-600/35',
    badge:     'bg-orange-600/20 text-orange-300 border-orange-600/30',
    label:     'text-orange-300',
    glow:      'shadow-[0_0_30px_rgba(234,88,12,0.12)]',
    prizeImg:  '/images/prize-3rd.svg',
    rankLabel: '🥉',
  },
}

const defaultCfg = tierConfig[3]

export function PrizeTier({ prize }: PrizeTierProps) {
  const t      = useTranslations('prizes')
  const title   = prize.titleFa
  const content = prize.contentFa
  const rank = prize.rankPosition as 1 | 2 | 3
  const cfg  = rank && rank <= 3 ? tierConfig[rank] : defaultCfg

  return (
    <div className={cn(
      'relative overflow-hidden glass rounded-3xl border bg-gradient-to-br flex flex-col',
      cfg.gradient, cfg.border, cfg.glow,
    )}>
      {/* Prize image */}
      <div className="relative h-52 w-full overflow-hidden rounded-t-3xl bg-black/20">
        <Image
          src={cfg.prizeImg}
          alt={title}
          fill
          className="object-contain p-4 drop-shadow-2xl"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {/* Rank badge */}
        <div className={cn(
          'absolute top-3 start-3 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold backdrop-blur-sm',
          cfg.badge,
        )}>
          <span>{cfg.rankLabel}</span>
          {prize.rankPosition && (
            <span>{t('place', { rank: prize.rankPosition })}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-black text-xl text-foreground">{title}</h3>

        {prize.prizeValue && (
          <div className={cn('text-3xl font-black tracking-tight', cfg.label)}>
            {prize.prizeValue}
          </div>
        )}

        <div
          className="text-sm text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}
