'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAvatars, type AvatarItem } from '@/hooks/useContent'
import { Skeleton } from '@/components/ui/skeleton'
import { Check } from 'lucide-react'

interface AvatarPickerProps {
  selectedId?: string | null
  onSelect:    (avatar: AvatarItem) => void
}

const CATEGORIES = ['flag', 'male', 'female', 'neutral'] as const

export function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps) {
  const t = useTranslations('profile')
  const [tab, setTab] = useState<string>('flag')
  const { avatarsByCategory, isLoading } = useAvatars()

  const tabLabels: Record<string, string> = {
    flag:    t('avatar_flag'),
    male:    t('avatar_male'),
    female:  t('avatar_female'),
    neutral: t('avatar_neutral'),
  }

  const items = avatarsByCategory[tab] ?? []

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-1 rounded-xl border border-border p-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setTab(cat)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition-all',
              tab === cat
                ? 'bg-[#0E7A43] text-white'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tabLabels[cat]}
          </button>
        ))}
      </div>

      {/* Avatar grid */}
      {isLoading ? (
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto scrollbar-thin">
          {items.map(avatar => (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-xl border-2 transition-all',
                selectedId === avatar.id
                  ? 'border-[#0E7A43] scale-95'
                  : 'border-transparent hover:border-[#0E7A43]/40',
              )}
            >
              {avatar.url ? (
                <Image src={avatar.url} alt={avatar.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-bold">
                  {avatar.name[0]}
                </div>
              )}
              {selectedId === avatar.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0E7A43]/30">
                  <Check className="h-5 w-5 text-white drop-shadow" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
