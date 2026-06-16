'use client'

import useSWR from 'swr'
import { api } from '@/lib/api-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> => api.get(url)

export interface Team {
  id:       string
  fifaCode: string
  nameEn:   string
  nameFa:   string
  flagUrl:  string | null
}

export interface Match {
  id:                 string
  stage:              string
  bracketSlot:        string
  kickoffAt:          string
  predictionLockedAt: string
  homeScore:          number | null
  awayScore:          number | null
  isFinalized:        boolean
  venue:              string | null
  city:               string | null
  country:            string
  homeTeam:           Team | null
  awayTeam:           Team | null
  prediction?: {
    homeScore:    number
    awayScore:    number
    pointsEarned: number | null
  } | null
}

interface MatchesResponse {
  data:   Match[]
  total:  number
  page:   number
  limit:  number
  pages:  number
}

export function useMatches(params: { stage?: string; group?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.stage)  query.set('stage',  params.stage)
  if (params.group)  query.set('group',  params.group)
  if (params.page)   query.set('page',   String(params.page))
  if (params.limit)  query.set('limit',  String(params.limit))

  const { data, error, isLoading, mutate } = useSWR<MatchesResponse>(
    `/api/v1/matches?${query.toString()}`,
    fetcher,
    { refreshInterval: 60_000 },
  )

  return { matches: data?.data ?? [], total: data?.total ?? 0, pages: data?.pages ?? 1, error, isLoading, mutate }
}

export function useMatch(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Match>(
    id ? `/api/v1/matches/${id}` : null,
    fetcher,
  )
  return { match: data, error, isLoading, mutate }
}

