'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import * as DP from '@radix-ui/react-dialog'
import { User, Mail, CreditCard, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import type { UserProfile } from '@/store/auth'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

function isProfileIncomplete(user: { firstName: string; lastName: string | null } | null) {
  if (!user) return false
  return !user.firstName || user.firstName.trim() === '' || !user.lastName || user.lastName.trim() === ''
}

export function ProfileCompleteModal() {
  const t = useTranslations('profile_modal')
  const { user, setUser, isHydrated } = useAuthStore()
  const [open, setOpen]       = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [nationalId, setNationalId] = useState('')
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState<Record<string, string>>({})

  useEffect(() => {
    if (isHydrated && user && isProfileIncomplete(user)) {
      setOpen(true)
    }
  }, [isHydrated, user])

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!firstName.trim() || firstName.trim().length < 2) errs.firstName = t('err_firstname')
    if (!lastName.trim()  || lastName.trim().length < 2)  errs.lastName  = t('err_lastname')
    if (nationalId && (nationalId.length !== 10 || !/^\d{10}$/.test(nationalId))) {
      errs.nationalId = t('err_national_id')
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    try {
      await api.put('/api/v1/users/me', {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        ...(email      && { email }),
        ...(nationalId && { nationalId }),
      })

      // Refresh user in store
      const profileRes = await api.get<UserProfile>('/api/v1/users/me')
      setUser(profileRes)
      toast.success(t('saved'))
      setOpen(false)
    } catch {
      toast.error(t('save_error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DP.Root open={open} onOpenChange={() => {}}>
      <DP.Portal>
        <DP.Overlay className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm" />
        <DP.Content
          className="fixed left-1/2 top-1/2 z-[201] w-full max-w-md -translate-x-1/2 -translate-y-1/2 glass rounded-2xl p-6 focus:outline-none"
          onEscapeKeyDown={e => e.preventDefault()}
          onPointerDownOutside={e => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#0E7A43]/20 flex items-center justify-center mb-3">
              <User className="h-7 w-7 text-[#0E7A43]" />
            </div>
            <DP.Title className="text-lg font-bold text-foreground">{t('title')}</DP.Title>
            <DP.Description className="text-sm text-muted-foreground mt-1">{t('subtitle')}</DP.Description>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">{t('firstname')}</label>
                <Input
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); setErrors(p => ({...p, firstName: ''})) }}
                  placeholder={t('firstname_ph')}
                  dir="rtl"
                  error={errors.firstName}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">{t('lastname')}</label>
                <Input
                  value={lastName}
                  onChange={e => { setLastName(e.target.value); setErrors(p => ({...p, lastName: ''})) }}
                  placeholder={t('lastname_ph')}
                  dir="rtl"
                  error={errors.lastName}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-foreground">
                {t('national_id')}
                <span className="text-muted-foreground font-normal mr-1">({t('optional')})</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={nationalId}
                  onChange={e => { setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({...p, nationalId: ''})) }}
                  placeholder="0123456789"
                  dir="ltr"
                  className="pr-10"
                  inputMode="numeric"
                  error={errors.nationalId}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-foreground">
                {t('email')}
                <span className="text-muted-foreground font-normal mr-1">({t('optional')})</span>
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="pr-10"
                />
              </div>
            </div>
          </div>

          {/* Action */}
          <Button
            className="w-full mt-5 gap-2"
            onClick={handleSubmit}
            loading={saving}
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('save')}
          </Button>
        </DP.Content>
      </DP.Portal>
    </DP.Root>
  )
}
