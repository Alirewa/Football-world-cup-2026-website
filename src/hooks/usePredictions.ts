'use client'

import useSWRInfinite from 'swr/infinite'
import { api } from '@/lib/api-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> => api.get(url)
import { useAuthStore } from '@/store/auth'

export interface PredictionItem {
  id:           string
  homeScore:    number
  awayScore:    number
  pointsEarned: number | null
  createdAt:    string
  updatedAt:    string
  match: {
    id:          string
    bracketSlot: string
    stage:       string
    kickoffAt:   string
    homeScore:   number | null
    awayScore:   number | null
    isFinalized: boolean
    homeTeam:    { id: string; fifaCode: string; nameEn: string; nameFa: string } | null
    awayTeam:    { id: string; fifaCode: string; nameEn: string; nameFa: string } | null
  }
}

interface PredictionsPage {
  items:      PredictionItem[]
  nextCursor: string | null
}

export function usePredictions(limit = 20) {
  const token = useAuthStore(s => s.accessToken)

  const getKey = (pageIndex: number, prev: PredictionsPage | null) => {
    if (!token) return null
    if (prev && !prev.nextCursor) return null
    const cursor = prev?.nextCursor
    return `/api/v1/predictions?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`
  }

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<PredictionsPage>(
    getKey,
    fetcher,
  )

  const predictions = data?.flatMap(p => p.items) ?? []
  const hasMore     = data ? !!data[data.length - 1]?.nextCursor : false

  return { predictions, hasMore, error, isLoading, loadMore: () => setSize(size + 1), mutate }
}

export async function submitPrediction(matchId: string, homeScore: number, awayScore: number, turnstileToken: string) {
  return api.post('/api/v1/predictions', { matchId, homeScore, awayScore, turnstileToken })
}

export async function updatePrediction(id: string, homeScore: number, awayScore: number) {
  return api.put(`/api/v1/predictions/${id}`, { homeScore, awayScore })
}

