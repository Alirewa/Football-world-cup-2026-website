'use client'

import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { api } from '@/lib/api-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> => api.get(url)

export interface Rule {
  id:        string
  titleFa:   string
  titleEn:   string
  contentFa: string
  contentEn: string
  sortOrder: number
}

export interface Prize {
  id:           string
  titleFa:      string
  titleEn:      string
  contentFa:    string
  contentEn:    string
  rankPosition: number | null
  prizeValue:   string | null
  sortOrder:    number
}

export interface Announcement {
  id:          string
  titleFa:     string
  titleEn:     string
  bodyFa:      string
  bodyEn:      string
  publishedAt: string
}

export interface AvatarItem {
  id:       string
  name:     string
  url:      string
  category: string
  teamId:   string | null
}

export function useRules() {
  const { data, error, isLoading } = useSWR<{ rules: Rule[] }>(
    '/api/v1/rules',
    fetcher,
  )
  return { rules: data?.rules ?? [], error, isLoading }
}

export function usePrizes() {
  const { data, error, isLoading } = useSWR<{ prizes: Prize[] }>(
    '/api/v1/prizes',
    fetcher,
  )
  return { prizes: data?.prizes ?? [], error, isLoading }
}

interface AnnPage {
  items:      Announcement[]
  nextCursor: string | null
  hasMore:    boolean
}

export function useAnnouncements(limit = 10) {
  const getKey = (pageIndex: number, prev: AnnPage | null) => {
    if (prev && !prev.hasMore) return null
    const cursor = prev?.nextCursor
    return `/api/v1/announcements?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<AnnPage>(
    getKey,
    fetcher,
  )

  const announcements = data?.flatMap(p => p.items) ?? []
  const hasMore       = data ? !!data[data.length - 1]?.hasMore : false

  return { announcements, hasMore, error, isLoading, loadMore: () => setSize(size + 1) }
}

export function useAvatars() {
  const { data, error, isLoading } = useSWR<{ avatars: Record<string, AvatarItem[]> }>(
    '/api/v1/avatars',
    fetcher,
  )
  return { avatarsByCategory: data?.avatars ?? {}, error, isLoading }
}
