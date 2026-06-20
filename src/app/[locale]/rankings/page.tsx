import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RankingTable } from '@/components/ranking/RankingTable'
import { Trophy } from 'lucide-react'

export default async function RankingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('ranking')
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5B700]/15 border border-[#F5B700]/20">
          <Trophy className="h-5 w-5 text-[#F5B700]" />
        </div>
        <div>
          <h1 className="text-2xl font-black">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>
      <RankingTable />
    </div>
  )
}
