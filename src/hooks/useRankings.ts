'use client'

import useSWRInfinite from 'swr/infinite'
import useSWR from 'swr'
import { api } from '@/lib/api-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> => api.get(url)
import { useAuthStore } from '@/store/auth'

export interface RankingRow {
  rank:         number
  userId:       string
  firstName:    string
  mobileMasked: string
  totalPoints:  number
  avatarUrl:    string | null
}

interface RankingsPage {
  items:      RankingRow[]
  nextCursor: number | null
}

export function useRankings(limit = 50) {
  const getKey = (pageIndex: number, prev: RankingsPage | null) => {
    if (prev && !prev.nextCursor) return null
    const cursor = prev?.nextCursor
    return `/api/v1/rankings?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<RankingsPage>(
    getKey,
    fetcher,
    { refreshInterval: 60_000 },
  )

  const rankings = data?.flatMap(p => p.items) ?? []
  const hasMore  = data ? !!data[data.length - 1]?.nextCursor : false

  return { rankings, hasMore, error, isLoading, loadMore: () => setSize(size + 1) }
}

export function useMyRank() {
  const token = useAuthStore(s => s.accessToken)
  const { data, error, isLoading } = useSWR(
    token ? '/api/v1/users/me/rank' : null,
    (url: string) => api.get<{ rank: number; totalPoints: number }>(url),
  )
  return { rank: data, error, isLoading }
}

