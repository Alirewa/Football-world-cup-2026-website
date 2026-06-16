'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { toast } from 'sonner'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AvatarPicker } from '@/components/profile/AvatarPicker'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { useProfile } from '@/hooks/useProfile'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Camera, User } from 'lucide-react'
import type { AvatarItem } from '@/hooks/useContent'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { profile, isLoading, updateProfile } = useProfile()
  const [showPicker, setShowPicker] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)

  async function handleAvatarSelect(avatar: AvatarItem) {
    setSavingAvatar(true)
    try {
      await updateProfile({ avatarId: avatar.id })
      toast.success(t('avatar_saved'))
      setShowPicker(false)
    } catch {
      toast.error(t('save_error'))
    } finally {
      setSavingAvatar(false)
    }
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E7A43]/15 border border-[#0E7A43]/20">
            <User className="h-5 w-5 text-[#0E7A43]" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>

        {/* Avatar section */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {isLoading ? (
                <Skeleton className="h-20 w-20 rounded-full" />
              ) : (
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#0E7A43]/40 bg-muted">
                  {profile?.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-muted-foreground">
                      {profile?.firstName?.[0] ?? '?'}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <p className="font-bold text-lg">{profile?.firstName} {profile?.lastName}</p>
                  <p className="text-sm text-muted-foreground font-mono">{profile?.mobile}</p>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPicker(v => !v)}>
              <Camera className="h-4 w-4 me-1.5" />
              {t('change_avatar')}
            </Button>
          </div>

          {showPicker && (
            <div className="border-t border-border pt-4">
              <AvatarPicker
                selectedId={profile?.avatarId}
                onSelect={handleAvatarSelect}
              />
              {savingAvatar && (
                <p className="text-center text-xs text-muted-foreground mt-2">{t('saving')}</p>
              )}
            </div>
          )}
        </div>

        {/* Profile form */}
        <div className="glass rounded-2xl p-6">
          <ProfileForm />
        </div>
      </div>
    </AuthGuard>
  )
}
