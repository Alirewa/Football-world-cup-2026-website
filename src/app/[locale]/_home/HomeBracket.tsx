'use client'

import { useTranslations } from 'next-intl'
import { useMatches, type Match } from '@/hooks/useMatches'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface BracketTeam {
  name: string
  flag?: string | null
  score?: number | null
  winner?: boolean
}
interface BracketMatch {
  id: string
  home: BracketTeam | null
  away: BracketTeam | null
  status: 'upcoming' | 'live' | 'finished'
  bracketSlot: string
}

const R16_SLOTS = ['R16-1','R16-2','R16-3','R16-4','R16-5','R16-6','R16-7','R16-8']
const QF_SLOTS  = ['QF-1','QF-2','QF-3','QF-4']
const SF_SLOTS  = ['SF-1','SF-2']

function emptyMatch(slot: string, tbd: string): BracketMatch {
  return { id: slot, bracketSlot: slot, status: 'upcoming', home: { name: tbd }, away: { name: tbd } }
}

function buildBracket(matches: Match[], tbd: string) {
  const r16: BracketMatch[] = []
  const qf:  BracketMatch[] = []
  const sf:  BracketMatch[] = []
  let   final: BracketMatch | undefined
  let   third: BracketMatch | undefined

  for (const m of matches) {
    if (!m.bracketSlot) continue
    const slot = m.bracketSlot.toUpperCase()
    const status: BracketMatch['status'] = m.isFinalized
      ? 'finished'
      : new Date(m.kickoffAt) < new Date()
      ? 'live'
      : 'upcoming'
    const bm: BracketMatch = {
      id: m.id,
      bracketSlot: slot,
      status,
      home: m.homeTeam
        ? { name: m.homeTeam.nameFa, flag: m.homeTeam.flagUrl, score: m.homeScore,
            winner: m.isFinalized && m.homeScore != null && m.awayScore != null && m.homeScore > m.awayScore }
        : { name: tbd },
      away: m.awayTeam
        ? { name: m.awayTeam.nameFa, flag: m.awayTeam.flagUrl, score: m.awayScore,
            winner: m.isFinalized && m.homeScore != null && m.awayScore != null && m.awayScore > m.homeScore }
        : { name: tbd },
    }
    if (slot.startsWith('R16')) r16.push(bm)
    else if (slot.startsWith('QF')) qf.push(bm)
    else if (slot.startsWith('SF')) sf.push(bm)
    else if (slot === '3RD')   third = bm
    else if (slot === 'FINAL') final = bm
  }
  r16.sort((a, b) => a.bracketSlot.localeCompare(b.bracketSlot))
  qf.sort((a, b)  => a.bracketSlot.localeCompare(b.bracketSlot))
  sf.sort((a, b)  => a.bracketSlot.localeCompare(b.bracketSlot))
  return { r16, qf, sf, final, third }
}

function fillSlots(matches: BracketMatch[], slots: string[], tbd: string) {
  return slots.map(s => matches.find(m => m.bracketSlot === s) ?? emptyMatch(s, tbd))
}

function TeamRow({ team, isWinner }: { team: BracketTeam | null; isWinner?: boolean }) {
  const name = team?.name ?? '?'
  return (
    <div className={cn('flex items-center gap-2 px-2.5 py-1.5 min-w-0', isWinner && 'font-semibold')}>
      {team?.flag ? (
        <div className="relative w-5 h-3.5 shrink-0 rounded-[2px] overflow-hidden border border-white/10">
          <Image src={team.flag} alt={name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="w-5 h-3.5 shrink-0 rounded-[2px] bg-white/10" />
      )}
      <span className={cn(
        'text-xs truncate flex-1',
        isWinner ? 'text-foreground' : 'text-muted-foreground',
      )}>
        {name}
      </span>
      {team?.score != null && (
        <span className={cn('text-xs font-black tabular-nums shrink-0', isWinner ? 'text-[#F5B700]' : '')}>
          {team.score}
        </span>
      )}
    </div>
  )
}

function MatchCard({ match, highlight = false }: { match: BracketMatch; highlight?: boolean }) {
  return (
    <div className={cn(
      'glass rounded-xl border overflow-hidden transition-all min-w-[130px]',
      match.status === 'live'     && 'border-[#0E7A43]/60 shadow-[0_0_10px_rgba(14,122,67,0.2)]',
      match.status === 'finished' && 'border-border/50',
      match.status === 'upcoming' && 'border-border/30',
      highlight && 'border-[#F5B700]/40 shadow-[0_0_14px_rgba(245,183,0,0.12)]',
    )}>
      {match.status === 'live' && (
        <div className="px-2.5 pt-1 flex items-center gap-1">
          <span className="live-dot scale-75" />
          <span className="text-[9px] text-[#0E7A43] font-bold uppercase tracking-wider">Live</span>
        </div>
      )}
      <div className="divide-y divide-border/30">
        <TeamRow team={match.home} isWinner={match.home?.winner} />
        <TeamRow team={match.away} isWinner={match.away?.winner} />
      </div>
    </div>
  )
}

export function HomeBracket() {
  const t      = useTranslations('home')
  const tbd    = t('bracket_tbd')

  const { matches, isLoading } = useMatches({ stage: 'KNOCKOUT', limit: 50 })
  const { r16, qf, sf, final: finalMatch, third: thirdMatch } = buildBracket(matches, tbd)

  const r16All = fillSlots(r16, R16_SLOTS, tbd)
  const qfAll  = fillSlots(qf,  QF_SLOTS,  tbd)
  const sfAll  = fillSlots(sf,  SF_SLOTS,  tbd)
  const final  = finalMatch ?? emptyMatch('FINAL', tbd)
  const third  = thirdMatch ?? emptyMatch('3RD',   tbd)

  const r16L = r16All.slice(0, 4)
  const r16R = r16All.slice(4, 8)
  const qfL  = qfAll.slice(0, 2)
  const qfR  = qfAll.slice(2, 4)
  const sfL  = sfAll[0] ?? emptyMatch('SF-1', tbd)
  const sfR  = sfAll[1] ?? emptyMatch('SF-2', tbd)

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-4 min-h-[220px] items-center justify-center">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[130px] h-36 rounded-xl skeleton" />
        ))}
      </div>
    )
  }

  const roundLabel = (text: string) => (
    <div className="text-center mb-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-border/20">
        {text}
      </span>
    </div>
  )

  const ColGap = () => <div className="w-5 shrink-0" />

  return (
    <div className="overflow-x-auto pb-4 scrollbar-thin" dir="ltr">
      <div className="min-w-[900px]">

        {/* Round labels */}
        <div className="flex gap-0 mb-0">
          <div className="flex-1">{roundLabel(t('bracket_round_r16'))}</div>
          <ColGap />
          <div className="flex-[0.8]">{roundLabel(t('bracket_round_qf'))}</div>
          <ColGap />
          <div className="flex-[0.65]">{roundLabel(t('bracket_round_sf'))}</div>
          <ColGap />
          <div className="w-[150px] shrink-0">{roundLabel(t('bracket_round_final'))}</div>
          <ColGap />
          <div className="flex-[0.65]">{roundLabel(t('bracket_round_sf'))}</div>
          <ColGap />
          <div className="flex-[0.8]">{roundLabel(t('bracket_round_qf'))}</div>
          <ColGap />
          <div className="flex-1">{roundLabel(t('bracket_round_r16'))}</div>
        </div>

        {/* Bracket */}
        <div className="flex gap-0 items-stretch" style={{ minHeight: 360 }}>

          {/* R16 Left */}
          <div className="flex-1 flex flex-col justify-around gap-2 py-1">
            {r16L.map(m => <MatchCard key={m.id} match={m} />)}
          </div>

          {/* Connector R16→QF Left */}
          <div className="w-5 shrink-0 flex flex-col justify-around py-1">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full h-px bg-border/30" />
              </div>
            ))}
          </div>

          {/* QF Left */}
          <div className="flex-[0.8] flex flex-col justify-around gap-2 py-1">
            <div className="flex-1 flex items-center"><MatchCard match={qfL[0] ?? emptyMatch('QF-1', tbd)} /></div>
            <div className="flex-1 flex items-center"><MatchCard match={qfL[1] ?? emptyMatch('QF-2', tbd)} /></div>
          </div>

          {/* Connector QF→SF Left */}
          <div className="w-5 shrink-0 flex flex-col justify-around py-1">
            {[0,1].map(i => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full h-px bg-border/30" />
              </div>
            ))}
          </div>

          {/* SF Left */}
          <div className="flex-[0.65] flex flex-col justify-center py-1">
            <MatchCard match={sfL} />
          </div>

          {/* Connector SF→Final */}
          <div className="w-5 shrink-0 flex items-center">
            <div className="w-full h-px bg-border/30" />
          </div>

          {/* Final + 3rd place */}
          <div className="w-[150px] shrink-0 flex flex-col items-stretch justify-center gap-3 py-1">
            <MatchCard match={final} highlight />
            <div className="h-px bg-border/20 mx-2" />
            <div>
              <div className="text-center mb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#F5B700]/50">
                  {t('bracket_round_third')}
                </span>
              </div>
              <MatchCard match={third} />
            </div>
          </div>

          {/* Connector Final→SF Right */}
          <div className="w-5 shrink-0 flex items-center">
            <div className="w-full h-px bg-border/30" />
          </div>

          {/* SF Right */}
          <div className="flex-[0.65] flex flex-col justify-center py-1">
            <MatchCard match={sfR} />
          </div>

          {/* Connector SF→QF Right */}
          <div className="w-5 shrink-0 flex flex-col justify-around py-1">
            {[0,1].map(i => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full h-px bg-border/30" />
              </div>
            ))}
          </div>

          {/* QF Right */}
          <div className="flex-[0.8] flex flex-col justify-around gap-2 py-1">
            <div className="flex-1 flex items-center"><MatchCard match={qfR[0] ?? emptyMatch('QF-3', tbd)} /></div>
            <div className="flex-1 flex items-center"><MatchCard match={qfR[1] ?? emptyMatch('QF-4', tbd)} /></div>
          </div>

          {/* Connector QF→R16 Right */}
          <div className="w-5 shrink-0 flex flex-col justify-around py-1">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full h-px bg-border/30" />
              </div>
            ))}
          </div>

          {/* R16 Right */}
          <div className="flex-1 flex flex-col justify-around gap-2 py-1">
            {r16R.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
