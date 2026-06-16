'use client'

import Link from 'next/link'
import { MatchCard, MatchCardSkeleton } from '@/components/match/MatchCard'
import { useMatches, type Match } from '@/hooks/useMatches'
import { Database } from 'lucide-react'

// Mock matches shown when DB is empty (before npm run db:seed)
const MOCK_MATCHES: Match[] = [
  {
    id: 'mock-1',
    stage: 'GROUP',
    bracketSlot: 'GROUP-A1',
    kickoffAt: '2026-06-11T18:00:00Z',
    predictionLockedAt: '2026-06-11T17:45:00Z',
    homeScore: null,
    awayScore: null,
    isFinalized: false,
    venue: 'SoFi Stadium',
    city: 'Los Angeles',
    country: 'USA',
    homeTeam: { id: 'usa', fifaCode: 'USA', nameEn: 'United States', nameFa: 'ایالات متحده', flagUrl: null },
    awayTeam: { id: 'pan', fifaCode: 'PAN', nameEn: 'Panama',        nameFa: 'پاناما',        flagUrl: null },
  },
  {
    id: 'mock-2',
    stage: 'GROUP',
    bracketSlot: 'GROUP-B1',
    kickoffAt: '2026-06-12T21:00:00Z',
    predictionLockedAt: '2026-06-12T20:45:00Z',
    homeScore: null,
    awayScore: null,
    isFinalized: false,
    venue: 'Estadio Azteca',
    city: 'Mexico City',
    country: 'Mexico',
    homeTeam: { id: 'mex', fifaCode: 'MEX', nameEn: 'Mexico',  nameFa: 'مکزیک',   flagUrl: null },
    awayTeam: { id: 'uru', fifaCode: 'URU', nameEn: 'Uruguay', nameFa: 'اروگوئه', flagUrl: null },
  },
  {
    id: 'mock-3',
    stage: 'GROUP',
    bracketSlot: 'GROUP-C1',
    kickoffAt: '2026-06-13T00:00:00Z',
    predictionLockedAt: '2026-06-12T23:45:00Z',
    homeScore: null,
    awayScore: null,
    isFinalized: false,
    venue: 'BC Place',
    city: 'Vancouver',
    country: 'Canada',
    homeTeam: { id: 'fra', fifaCode: 'FRA', nameEn: 'France',  nameFa: 'فرانسه', flagUrl: null },
    awayTeam: { id: 'arg', fifaCode: 'ARG', nameEn: 'Argentina', nameFa: 'آرژانتین', flagUrl: null },
  },
]

export function HomeMatches() {
  const { matches, isLoading } = useMatches({ limit: 3 })

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <MatchCardSkeleton key={i} />)}
      </div>
    )
  }

  const displayMatches = matches.length > 0 ? matches.slice(0, 3) : MOCK_MATCHES
  const isMock = matches.length === 0

  return (
    <div className="space-y-3">
      {isMock && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-amber-400">
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            <span className="font-bold">داده‌های نمونه</span> — دیتابیس هنوز seed نشده.
            برای نمایش بازی‌های واقعی دستور{' '}
            <code className="rounded bg-amber-500/20 px-1 font-mono text-[11px]">npm run db:seed</code>
            {' '}را اجرا کنید.
          </p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayMatches.map(match => (
          <Link key={match.id} href="/predictions">
            <MatchCard match={match} compact />
          </Link>
        ))}
      </div>
    </div>
  )
}
