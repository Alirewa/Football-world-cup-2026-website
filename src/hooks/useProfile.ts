'use client'

import useSWR from 'swr'
import { api } from '@/lib/api-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string): Promise<any> => api.get(url)
import { useAuthStore, type UserProfile } from '@/store/auth'

export function useProfile() {
  const token   = useAuthStore(s => s.accessToken)
  const setUser = useAuthStore(s => s.setUser)

  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    token ? '/api/v1/users/me' : null,
    fetcher,
    {
      onSuccess(user) { setUser(user) },
    },
  )

  async function updateProfile(body: { firstName?: string; lastName?: string; email?: string | null; avatarId?: string | null; locale?: 'fa' | 'en'; theme?: 'dark' | 'light' }) {
    const updated = await api.put<UserProfile>('/api/v1/users/me', body)
    await mutate(updated, false)
    setUser(updated)
    return updated
  }

  async function deleteAccount() {
    await api.delete('/api/v1/users/me')
  }

  return { profile: data, error, isLoading, mutate, updateProfile, deleteAccount }
}

