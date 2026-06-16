'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

export function AuthHydrator() {
  const hydrate    = useAuthStore(s => s.hydrate)
  const isHydrated = useAuthStore(s => s.isHydrated)

  useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [hydrate, isHydrated])

  return null
}
