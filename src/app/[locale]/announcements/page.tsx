import { useTranslations } from 'next-intl'
import { AnnouncementsContent } from './_content'
import { Bell } from 'lucide-react'

export default function AnnouncementsPage() {
  const t = useTranslations('announcements')
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E7A43]/15 border border-[#0E7A43]/20">
          <Bell className="h-5 w-5 text-[#0E7A43]" />
        </div>
        <div>
          <h1 className="text-2xl font-black">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>
      <AnnouncementsContent />
    </div>
  )
}
