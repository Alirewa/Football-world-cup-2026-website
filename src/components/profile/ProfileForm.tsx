'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/store/auth'
import { Dialog } from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Sun, Moon, Trash2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProfileForm() {
  const t      = useTranslations('profile')
  const { theme, setTheme } = useTheme()
  const logout = useAuthStore(s => s.logout)
  const router = useRouter()

  const { profile, isLoading, updateProfile, deleteAccount } = useProfile()

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting,   setDeleting]  = useState(false)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '')
      setLastName(profile.lastName  ?? '')
      setEmail(profile.email        ?? '')
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ firstName, lastName, email: email || undefined })
      toast.success(t('saved'))
    } catch {
      toast.error(t('save_error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteAccount()
      toast.success(t('account_deleted'))
      await logout()
      router.push('/')
    } catch {
      toast.error(t('delete_error'))
      setDeleting(false)
      setShowDelete(false)
    }
  }

  if (isLoading) return null

  return (
    <>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t('first_name')}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
          <Input
            label={t('last_name')}
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label={t('email')}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('email_optional')}
        />

        <Input
          label={t('mobile')}
          value={profile?.mobile ?? ''}
          disabled
          className="opacity-60"
        />

        {/* Theme toggle */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">{t('theme')}</p>
          <div className="flex gap-2">
            {[
              { key: 'light', icon: Sun,  label: t('theme_light') },
              { key: 'dark',  icon: Moon, label: t('theme_dark')  },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all',
                  theme === key
                    ? 'border-[#0E7A43] bg-[#0E7A43]/10 text-[#0E7A43]'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" loading={saving}>
          {t('save_changes')}
        </Button>
      </form>

      {/* Danger zone */}
      <div className="mt-8 border-t border-border pt-6 space-y-3">
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 me-2" />
          {t('logout')}
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="h-4 w-4 me-2" />
          {t('delete_account')}
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 glass rounded-2xl p-6 space-y-4">
            <DialogPrimitive.Title className="text-lg font-bold text-destructive">
              {t('delete_account')}
            </DialogPrimitive.Title>
            <p className="text-sm text-muted-foreground">{t('delete_confirm')}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>
                {t('cancel')}
              </Button>
              <Button variant="destructive" className="flex-1" loading={deleting} onClick={handleDelete}>
                {t('confirm_delete')}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>
    </>
  )
}
