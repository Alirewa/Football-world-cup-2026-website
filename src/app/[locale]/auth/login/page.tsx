'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { normalizeMobile } from '@/lib/utils'
import { api, ApiError } from '@/lib/api-client'

export default function LoginPage() {
  const t      = useTranslations()
  const router = useRouter()

  const [mobile,  setMobile]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const normalized = normalizeMobile(mobile)
    if (!/^09\d{9}$/.test(normalized)) {
      setError(t('errors.invalid_mobile'))
      return
    }

    setLoading(true)
    try {
      await api.post('/api/v1/auth/request-otp', { mobile: normalized })
      sessionStorage.setItem('otp_mobile', normalized)
      router.push('/auth/verify')
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t('errors.rate_limit'))
      } else {
        setError(t('errors.server_error'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 pitch-gradient pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,122,67,0.08)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-1">{t('auth.login')}</h1>
          <p className="text-center text-sm text-muted-foreground mb-7">{t('auth.mobile_hint')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PhoneInput
              value={mobile}
              onChange={e => { setMobile(e.target.value); setError('') }}
              error={error}
              placeholder={t('auth.mobile_placeholder')}
              disabled={loading}
              autoFocus
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              {loading ? t('auth.sending') : t('auth.send_otp')}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {t('auth.new_user')}{' '}
          <Link href="/auth/login" className="text-[#0E7A43] hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
