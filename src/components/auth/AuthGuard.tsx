'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { PageLoader } from '@/components/shared/LoadingSpinner'

interface AuthGuardProps {
  children:     React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const user       = useAuthStore(s => s.user)
  const isLoading  = useAuthStore(s => s.isLoading)
  const isHydrated = useAuthStore(s => s.isHydrated)
  const router     = useRouter()

  useEffect(() => {
    if (!isHydrated) return
    if (!user) {
      router.replace('/auth/login')
      return
    }
    if (requireAdmin && user.role !== 'admin') {
      router.replace('/')
    }
  }, [user, isHydrated, requireAdmin, router])

  if (isLoading || !isHydrated) return <PageLoader />
  if (!user) return null
  if (requireAdmin && user.role !== 'admin') return null

  return <>{children}</>
}
