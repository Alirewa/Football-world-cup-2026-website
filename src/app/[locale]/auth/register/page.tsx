'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { useAuthStore } from '@/store/auth'
import type { UserProfile } from '@/store/auth'
import { api, ApiError } from '@/lib/api-client'
import { validateNationalId } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

export default function RegisterPage() {
  const t      = useTranslations()
  const router = useRouter()
  const login  = useAuthStore(s => s.login)

  const [ready,       setReady]       = useState(false)
  const [mobile,      setMobile]      = useState('')
  const [code,        setCode]        = useState('')
  const [firstName,   setFirstName]   = useState('')
  const [lastName,    setLastName]    = useState('')
  const [nationalId,  setNationalId]  = useState('')
  const [email,       setEmail]       = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  useEffect(() => {
    const m = sessionStorage.getItem('reg_mobile')
    const c = sessionStorage.getItem('reg_code')
    if (!m || !c) {
      router.replace('/auth/login')
      return
    }
    setMobile(m)
    setCode(c)
    setReady(true)
  }, [router])

  const nationalIdValid = nationalId.length === 10 && validateNationalId(nationalId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!firstName.trim() || firstName.length < 2) newErrors.firstName = 'نام الزامی است (حداقل ۲ حرف)'
    if (!lastName.trim()  || lastName.length  < 2) newErrors.lastName  = 'نام خانوادگی الزامی است'
    if (!nationalIdValid) newErrors.nationalId = 'کد ملی معتبر نیست'
    if (!termsAgreed) newErrors.terms = 'موافقت با قوانین الزامی است'

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      const data = await api.post<{ accessToken: string }>(
        '/api/v1/auth/register',
        { mobile, code, firstName: firstName.trim(), lastName: lastName.trim(), nationalId, email: email || undefined },
        { skipAuth: true },
      )
      useAuthStore.setState({ accessToken: data.accessToken })
      const profileData = await api.get<UserProfile>('/api/v1/users/me')
      login(data.accessToken, profileData)
      sessionStorage.removeItem('reg_mobile')
      sessionStorage.removeItem('reg_code')
      toast.success('ثبت‌نام با موفقیت انجام شد!')
      router.push('/predictions')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setErrors({ mobile: 'این شماره قبلاً ثبت‌نام کرده است' })
        else if (err.status === 422) toast.error('کد OTP منقضی شده. دوباره وارد شوید.')
        else toast.error('خطای سرور. لطفاً دوباره تلاش کنید.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E7A43] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 py-10">
      <div className="absolute inset-0 pitch-gradient pointer-events-none" />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-center mb-1">{t('auth.register_title')}</h1>
          <p className="text-center text-xs text-muted-foreground mb-6">{t('auth.register_subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('auth.first_name')}</label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} error={errors.firstName} disabled={loading} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('auth.last_name')}</label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} error={errors.lastName} disabled={loading} />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('auth.national_id')}</label>
              <div className="relative">
                <Input
                  value={nationalId}
                  onChange={e => {
                    setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))
                    setErrors(prev => ({ ...prev, nationalId: '' }))
                  }}
                  placeholder={t('auth.national_id_placeholder')}
                  error={errors.nationalId}
                  disabled={loading}
                  dir="ltr"
                  className="font-mono pr-10"
                  maxLength={10}
                  inputMode="numeric"
                />
                {nationalId.length === 10 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nationalIdValid
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <XCircle    className="h-4 w-4 text-red-500" />
                    }
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('auth.email')}</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                disabled={loading}
                dir="ltr"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={e => setTermsAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[#0E7A43]"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                {t('auth.terms_agree')}
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}

            {errors.mobile && (
              <p className="text-xs text-red-400 text-center bg-red-500/10 rounded-lg px-3 py-2">
                {errors.mobile}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {loading ? t('auth.registering') : t('auth.register_btn')}
            </Button>
          </form>
        </div>

        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-1 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          بازگشت
        </button>
      </div>
    </div>
  )
}
