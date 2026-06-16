'use client'

import { useTranslations } from 'next-intl'
import { useAnnouncements } from '@/hooks/useContent'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { Bell, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function AnnouncementsContent() {
  const t = useTranslations('announcements')
  const { announcements, hasMore, isLoading, loadMore } = useAnnouncements()

  if (isLoading && announcements.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (!announcements.length) {
    return <EmptyState icon={<Bell className="h-8 w-8" />} title={t('empty')} description={t('empty_desc')} />
  }

  return (
    <div className="space-y-3">
      {announcements.map(ann => {
        const title   = ann.titleFa
        const content = ann.bodyFa
        return (
          <div key={ann.id} className="glass glass-hover rounded-2xl p-6 transition-all">
            <h3 className="font-semibold text-foreground mb-2">{title}</h3>
            <div
              className="text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {ann.publishedAt && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                <Calendar className="h-3 w-3" />
                {formatDate(ann.publishedAt)}
              </div>
            )}
          </div>
        )
      })}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={loadMore}>
            {t('load_more')}
          </Button>
        </div>
      )}
    </div>
  )
}
