'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { Skeleton } from '@/components/ui/skeleton'

interface Team {
  id: string
  nameEn: string
  nameFa: string
  fifaCode: string
  flagUrl: string | null
}

interface Group {
  id: string
  name: string
  teams: Team[]
}

// FIFA country flag via flagcdn.com using fifaCode → ISO2 map
const FIFA_TO_ISO2: Record<string, string> = {
  USA: 'us', PAN: 'pa', HON: 'hn', BOL: 'bo',
  CAN: 'ca', URU: 'uy', CHI: 'cl', PER: 'pe',
  MEX: 'mx', JAM: 'jm', VEN: 've', SUR: 'sr',
  ARG: 'ar', COL: 'co', ECU: 'ec', PAR: 'py',
  BRA: 'br', NGA: 'ng', AUS: 'au', JPN: 'jp',
  FRA: 'fr', MAR: 'ma', BEL: 'be', SEN: 'sn',
  ESP: 'es', GER: 'de', NED: 'nl', CRO: 'hr',
  POR: 'pt', ENG: 'gb-eng', POL: 'pl', TUR: 'tr',
  KOR: 'kr', IRI: 'ir', IRN: 'ir', SAU: 'sa', JOR: 'jo',
  ITA: 'it', SUI: 'ch', DEN: 'dk', CMR: 'cm',
  QAT: 'qa', EGY: 'eg', CIV: 'ci', GHA: 'gh',
  UZB: 'uz', NZL: 'nz', SLV: 'sv',
  SCO: 'gb-sct', WAL: 'gb-wls',
}

// Static WC2026 groups (fallback when DB is empty/unreachable)
const STATIC_GROUPS: Group[] = [
  { id: 'A', name: 'A', teams: [
    { id: 'usa', nameEn: 'United States', nameFa: 'ایالات متحده', fifaCode: 'USA', flagUrl: null },
    { id: 'pan', nameEn: 'Panama',        nameFa: 'پاناما',        fifaCode: 'PAN', flagUrl: null },
    { id: 'hon', nameEn: 'Honduras',      nameFa: 'هندوراس',      fifaCode: 'HON', flagUrl: null },
    { id: 'bol', nameEn: 'Bolivia',       nameFa: 'بولیوی',        fifaCode: 'BOL', flagUrl: null },
  ]},
  { id: 'B', name: 'B', teams: [
    { id: 'can', nameEn: 'Canada',   nameFa: 'کانادا',   fifaCode: 'CAN', flagUrl: null },
    { id: 'uru', nameEn: 'Uruguay',  nameFa: 'اروگوئه',  fifaCode: 'URU', flagUrl: null },
    { id: 'chi', nameEn: 'Chile',    nameFa: 'شیلی',     fifaCode: 'CHI', flagUrl: null },
    { id: 'per', nameEn: 'Peru',     nameFa: 'پرو',      fifaCode: 'PER', flagUrl: null },
  ]},
  { id: 'C', name: 'C', teams: [
    { id: 'mex', nameEn: 'Mexico',    nameFa: 'مکزیک',    fifaCode: 'MEX', flagUrl: null },
    { id: 'jam', nameEn: 'Jamaica',   nameFa: 'جامائیکا', fifaCode: 'JAM', flagUrl: null },
    { id: 'ven', nameEn: 'Venezuela', nameFa: 'ونزوئلا',  fifaCode: 'VEN', flagUrl: null },
    { id: 'sur', nameEn: 'Suriname',  nameFa: 'سورینام',  fifaCode: 'SUR', flagUrl: null },
  ]},
  { id: 'D', name: 'D', teams: [
    { id: 'arg', nameEn: 'Argentina', nameFa: 'آرژانتین',  fifaCode: 'ARG', flagUrl: null },
    { id: 'col', nameEn: 'Colombia',  nameFa: 'کلمبیا',    fifaCode: 'COL', flagUrl: null },
    { id: 'ecu', nameEn: 'Ecuador',   nameFa: 'اکوادور',   fifaCode: 'ECU', flagUrl: null },
    { id: 'par', nameEn: 'Paraguay',  nameFa: 'پاراگوئه',  fifaCode: 'PAR', flagUrl: null },
  ]},
  { id: 'E', name: 'E', teams: [
    { id: 'bra', nameEn: 'Brazil',    nameFa: 'برزیل',     fifaCode: 'BRA', flagUrl: null },
    { id: 'nga', nameEn: 'Nigeria',   nameFa: 'نیجریه',    fifaCode: 'NGA', flagUrl: null },
    { id: 'aus', nameEn: 'Australia', nameFa: 'استرالیا',  fifaCode: 'AUS', flagUrl: null },
    { id: 'jpn', nameEn: 'Japan',     nameFa: 'ژاپن',      fifaCode: 'JPN', flagUrl: null },
  ]},
  { id: 'F', name: 'F', teams: [
    { id: 'fra', nameEn: 'France',  nameFa: 'فرانسه',   fifaCode: 'FRA', flagUrl: null },
    { id: 'mar', nameEn: 'Morocco', nameFa: 'مراکش',    fifaCode: 'MAR', flagUrl: null },
    { id: 'bel', nameEn: 'Belgium', nameFa: 'بلژیک',    fifaCode: 'BEL', flagUrl: null },
    { id: 'sen', nameEn: 'Senegal', nameFa: 'سنگال',    fifaCode: 'SEN', flagUrl: null },
  ]},
  { id: 'G', name: 'G', teams: [
    { id: 'esp', nameEn: 'Spain',       nameFa: 'اسپانیا',  fifaCode: 'ESP', flagUrl: null },
    { id: 'ger', nameEn: 'Germany',     nameFa: 'آلمان',    fifaCode: 'GER', flagUrl: null },
    { id: 'ned', nameEn: 'Netherlands', nameFa: 'هلند',     fifaCode: 'NED', flagUrl: null },
    { id: 'cro', nameEn: 'Croatia',     nameFa: 'کرواسی',   fifaCode: 'CRO', flagUrl: null },
  ]},
  { id: 'H', name: 'H', teams: [
    { id: 'por', nameEn: 'Portugal', nameFa: 'پرتغال',   fifaCode: 'POR', flagUrl: null },
    { id: 'eng', nameEn: 'England',  nameFa: 'انگلستان', fifaCode: 'ENG', flagUrl: null },
    { id: 'pol', nameEn: 'Poland',   nameFa: 'لهستان',   fifaCode: 'POL', flagUrl: null },
    { id: 'tur', nameEn: 'Turkey',   nameFa: 'ترکیه',    fifaCode: 'TUR', flagUrl: null },
  ]},
  { id: 'I', name: 'I', teams: [
    { id: 'kor', nameEn: 'South Korea',  nameFa: 'کره جنوبی', fifaCode: 'KOR', flagUrl: null },
    { id: 'iri', nameEn: 'Iran',         nameFa: 'ایران',     fifaCode: 'IRI', flagUrl: null },
    { id: 'sau', nameEn: 'Saudi Arabia', nameFa: 'عربستان',   fifaCode: 'SAU', flagUrl: null },
    { id: 'jor', nameEn: 'Jordan',       nameFa: 'اردن',      fifaCode: 'JOR', flagUrl: null },
  ]},
  { id: 'J', name: 'J', teams: [
    { id: 'ita', nameEn: 'Italy',       nameFa: 'ایتالیا', fifaCode: 'ITA', flagUrl: null },
    { id: 'sui', nameEn: 'Switzerland', nameFa: 'سوئیس',   fifaCode: 'SUI', flagUrl: null },
    { id: 'den', nameEn: 'Denmark',     nameFa: 'دانمارک', fifaCode: 'DEN', flagUrl: null },
    { id: 'cmr', nameEn: 'Cameroon',    nameFa: 'کامرون',  fifaCode: 'CMR', flagUrl: null },
  ]},
  { id: 'K', name: 'K', teams: [
    { id: 'qat', nameEn: 'Qatar',        nameFa: 'قطر',        fifaCode: 'QAT', flagUrl: null },
    { id: 'egy', nameEn: 'Egypt',        nameFa: 'مصر',        fifaCode: 'EGY', flagUrl: null },
    { id: 'civ', nameEn: "Côte d'Ivoire",nameFa: 'ساحل عاج',  fifaCode: 'CIV', flagUrl: null },
    { id: 'gha', nameEn: 'Ghana',        nameFa: 'غنا',        fifaCode: 'GHA', flagUrl: null },
  ]},
  { id: 'L', name: 'L', teams: [
    { id: 'prt', nameEn: 'Portugal',    nameFa: 'پرتغال',   fifaCode: 'POR', flagUrl: null },
    { id: 'uzb', nameEn: 'Uzbekistan',  nameFa: 'ازبکستان', fifaCode: 'UZB', flagUrl: null },
    { id: 'nzl', nameEn: 'New Zealand', nameFa: 'نیوزیلند', fifaCode: 'NZL', flagUrl: null },
    { id: 'slv', nameEn: 'El Salvador', nameFa: 'السالوادور',fifaCode: 'SLV', flagUrl: null },
  ]},
]

function getFlagUrl(team: Team): string {
  if (team.flagUrl) return team.flagUrl
  const code = team.fifaCode.toUpperCase()
  const iso = FIFA_TO_ISO2[code]
  if (!iso) return `https://flagcdn.com/w40/${code.toLowerCase()}.png`
  return `https://flagcdn.com/w40/${iso}.png`
}

export function HomeGroups() {
  const [groups, setGroups]   = useState<Group[]>(STATIC_GROUPS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Group[]>('/api/v1/teams', { skipAuth: true })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setGroups(data)
        // if DB empty, keep static fallback
      })
      .catch(() => { /* keep static fallback */ })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 space-y-2">
            <Skeleton className="h-4 w-16" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <Skeleton className="h-5 w-7 rounded" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {groups.map(group => (
        <Link
          key={group.id}
          href={`/predictions?group=${group.name}`}
          className="glass glass-hover rounded-2xl p-4 block cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0E7A43]/20 border border-[#0E7A43]/30">
              <span className="text-xs font-black text-[#0E7A43]">{group.name}</span>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {`گروه ${group.name}`}
            </span>
          </div>

          <div className="space-y-2">
            {group.teams.map(team => (
              <div key={team.id} className="flex items-center gap-2">
                <div className="w-7 h-5 overflow-hidden rounded-sm shrink-0 bg-white/10 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFlagUrl(team)}
                    alt={team.fifaCode}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <span className="text-xs font-medium truncate">
                  {team.nameFa}
                </span>
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  )
}
