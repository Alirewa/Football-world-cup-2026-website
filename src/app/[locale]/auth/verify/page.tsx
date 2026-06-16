'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { OtpInput } from '@/components/auth/OtpInput'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { useAuthStore } from '@/store/auth'
import type { UserProfile } from '@/store/auth'
import { api, ApiError } from '@/lib/api-client'

const OTP_TTL = 120 // seconds

export default function VerifyPage() {
  const t      = useTranslations()
  const router = useRouter()

  const login = useAuthStore(s => s.login)

  const [otp,       setOtp]       = useState('')
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [error,     setError]     = useState('')
  const [countdown, setCountdown] = useState(OTP_TTL)
  const [mobile,    setMobile]    = useState('')

  const isDevTestAccount = process.env.NODE_ENV !== 'production' && mobile === '09123456789'
  const otpLength        = isDevTestAccount ? 4 : 6

  useEffect(() => {
    const m = sessionStorage.getItem('otp_mobile')
    if (!m) { router.replace('/auth/login'); return }
    setMobile(m)
  }, [router])

  useEffect(() => {
    if (countdown <= 0) return
    const id = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(id)
  }, [countdown])

  const handleVerify = useCallback(async (code: string) => {
    if (code.length !== otpLength) return
    setError('')
    setLoading(true)
    try {
      const data = await api.post<{ accessToken?: string; requiresRegistration?: boolean; mobile?: string }>(
        '/api/v1/auth/verify-otp',
        { mobile, code },
        { skipAuth: true },
      )

      if (data.requiresRegistration) {
        sessionStorage.setItem('reg_mobile', mobile)
        sessionStorage.setItem('reg_code', code)
        router.push('/auth/register')
        return
      }

      if (data.accessToken) {
        useAuthStore.setState({ accessToken: data.accessToken })
        try {
          const profileData = await api.get<UserProfile>('/api/v1/users/me')
          login(data.accessToken, profileData)
        } catch {
          // profile fetch failed but token is valid — still redirect
        }
        toast.success('خوش آمدید!')
        router.push('/predictions')
        return
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) setError(t('errors.invalid_otp'))
        else if (err.status === 429) setError(t('errors.rate_limit'))
        else setError(t('errors.server_error'))
      }
      setOtp('')
    } finally {
      setLoading(false)
    }
  }, [mobile, login, router, t])

  useEffect(() => {
    if (otp.length === otpLength) handleVerify(otp)
  }, [otp, otpLength, handleVerify])

  async function handleResend() {
    if (countdown > 0) return
    setResending(true)
    try {
      await api.post('/api/v1/auth/request-otp', { mobile }, { skipAuth: true })
      setCountdown(OTP_TTL)
      setOtp('')
      setError('')
      toast.info('کد جدید ارسال شد')
    } catch {
      toast.error(t('errors.server_error'))
    } finally {
      setResending(false)
    }
  }

  const maskedMobile = mobile ? mobile.slice(0, 4) + '****' + mobile.slice(7) : ''

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="absolute inset-0 pitch-gradient pointer-events-none" />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-1">{t('auth.verify_title')}</h1>
          <p className="text-center text-sm text-muted-foreground mb-7">
            {t('auth.verify_subtitle', { mobile: maskedMobile })}
          </p>

          <div className="space-y-6">
            <OtpInput
              length={otpLength}
              value={otp}
              onChange={setOtp}
              disabled={loading}
              error={error}
            />

            <Button
              className="w-full"
              size="lg"
              loading={loading}
              onClick={() => handleVerify(otp)}
              disabled={otp.length !== otpLength}
            >
              {loading ? t('auth.verifying') : t('auth.verify_btn')}
            </Button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t('auth.resend_in', { seconds: countdown })}
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs text-[#0E7A43] hover:underline disabled:opacity-50"
                >
                  {resending ? t('common.loading') : t('auth.resend')}
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="mt-5 flex items-center gap-1 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {t('auth.back_to_login')}
        </button>
      </div>
    </div>
  )
}
