'use client'

import { create } from 'zustand'

export interface UserProfile {
  id:        string
  firstName: string
  lastName:  string | null
  mobile:    string
  email:     string | null
  role:      'user' | 'admin'
  locale:    'fa'
  theme:     'dark' | 'light'
  avatar:    { id: string; category: string; url: string | null } | null
  avatarId:  string | null
  avatarUrl: string | null
  createdAt: string
}

interface AuthStore {
  user:         UserProfile | null
  accessToken:  string | null
  isLoading:    boolean
  isHydrated:   boolean

  login:    (token: string, user: UserProfile) => void
  logout:   () => void
  setUser:  (user: UserProfile) => void
  setToken: (token: string) => void
  refresh:  () => Promise<boolean>
  hydrate:  () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:        null,
  accessToken: null,
  isLoading:   false,
  isHydrated:  false,

  login(token, user) {
    set({ accessToken: token, user, isHydrated: true })
  },

  logout() {
    set({ accessToken: null, user: null })
    fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {})
  },

  setUser(user) {
    set({ user })
  },

  setToken(token) {
    set({ accessToken: token })
  },

  async refresh(): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/auth/refresh', { method: 'POST' })
      if (!res.ok) {
        set({ accessToken: null, user: null, isHydrated: true })
        return false
      }
      const data = await res.json()
      const token = data.data?.accessToken
      if (!token) {
        set({ accessToken: null, user: null, isHydrated: true })
        return false
      }

      // Fetch user profile with new token
      const profileRes = await fetch('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (profileRes.ok) {
        const profile = await profileRes.json()
        set({ accessToken: token, user: profile.data, isHydrated: true })
      } else {
        set({ accessToken: token, user: null, isHydrated: true })
      }
      return true
    } catch {
      set({ accessToken: null, user: null, isHydrated: true })
      return false
    }
  },

  async hydrate() {
    if (get().isHydrated) return
    set({ isLoading: true })
    await get().refresh()
    set({ isLoading: false })
  },
}))
