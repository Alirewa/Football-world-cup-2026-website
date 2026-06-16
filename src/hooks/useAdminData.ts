import useSWR from 'swr'
import { api } from '@/lib/api-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> => api.get(url)

// --- Types ---

export interface AdminUser {
  id:          string
  firstName:   string | null
  lastName:    string | null
  mobile:      string
  role:        string
  avatarUrl:   string | null
  totalPoints: number | null
  createdAt:   string
}

export interface AdminMatch {
  id:          string
  kickoffAt:   string
  stage:       string
  bracketSlot: string
  venue:       string | null
  homeScore:   number | null
  awayScore:   number | null
  isFinalized: boolean
  homeTeam:    { nameFa: string; nameEn: string; fifaCode: string } | null
  awayTeam:    { nameFa: string; nameEn: string; fifaCode: string } | null
}

export interface AdminPrediction {
  id:          string
  homeScore:   number
  awayScore:   number
  pointsEarned: number | null
  createdAt:   string
  user:        { firstName: string | null } | null
  match:       {
    homeTeam: { nameFa: string; nameEn: string } | null
    awayTeam: { nameFa: string; nameEn: string } | null
  } | null
}

export interface AdminAnnouncement {
  id:          string
  titleFa:     string
  titleEn:     string
  bodyFa:      string
  bodyEn:      string
  isPublished: boolean
  publishedAt: string | null
  createdAt:   string
}

export interface AdminRule {
  id:        string
  titleFa:   string
  titleEn:   string
  contentFa: string
  contentEn: string
  isActive:  boolean
  sortOrder: number
}

export interface AdminPrize {
  id:           string
  titleFa:      string
  titleEn:      string
  contentFa:    string
  contentEn:    string
  prizeValue:   string | null
  rankPosition: number | null
  isActive:     boolean
  sortOrder:    number
}

export interface AdminStats {
  totalUsers:      number
  totalPredictions: number
  finalizedMatches: number
  pendingJobs:     number
}

// --- Hooks ---

export function useAdminUsers() {
  const { data, error, isLoading } = useSWR<{ data: AdminUser[] }>('/api/v1/admin/users', fetcher)
  return { users: data?.data, isLoading, error }
}

export function useAdminMatches() {
  const { data, error, isLoading, mutate } = useSWR<{ data: AdminMatch[] }>(
    '/api/v1/admin/matches?limit=104',
    fetcher,
    { revalidateOnFocus: false },
  )
  return { matches: data?.data, isLoading, error, mutate }
}

export function useAdminPredictions() {
  const { data, error, isLoading } = useSWR<{ data: AdminPrediction[] }>(
    '/api/v1/admin/predictions?limit=200',
    fetcher,
    { revalidateOnFocus: false },
  )
  return { predictions: data?.data, isLoading, error }
}

export function useAdminAnnouncements() {
  const { data, error, isLoading, mutate } = useSWR<{ data: AdminAnnouncement[] }>(
    '/api/v1/admin/announcements?limit=100',
    fetcher,
  )
  return { announcements: data?.data, isLoading, error, mutate }
}

export function useAdminRules() {
  const { data, error, isLoading, mutate } = useSWR<{ data: AdminRule[] }>(
    '/api/v1/admin/rules',
    fetcher,
  )
  return { rules: data?.data, isLoading, error, mutate }
}

export function useAdminPrizes() {
  const { data, error, isLoading, mutate } = useSWR<{ data: AdminPrize[] }>(
    '/api/v1/admin/prizes',
    fetcher,
  )
  return { prizes: data?.data, isLoading, error, mutate }
}

export function useAdminStats() {
  const { data, error, isLoading } = useSWR<AdminStats>(
    '/api/v1/admin/stats',
    fetcher,
    { refreshInterval: 30_000 },
  )
  return { stats: data, isLoading, error }
}

export function useAdminRecentMatches() {
  const { data, error, isLoading } = useSWR<{ data: AdminMatch[] }>(
    '/api/v1/admin/matches?limit=10&finalized=true',
    fetcher,
    { refreshInterval: 60_000 },
  )
  return { matches: data?.data, isLoading, error }
}
