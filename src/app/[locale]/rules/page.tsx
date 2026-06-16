import { useTranslations } from 'next-intl'
import { RulesContent } from './_content'
import Link from 'next/link'
import { Gift, ArrowRight } from 'lucide-react'

export default function RulesPage() {
  const t = useTranslations('rules')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 md:pb-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0E7A43] mb-3">
          <span className="h-1 w-6 rounded-full bg-[#0E7A43]" />
          جام جهانی ۲۰۲۶
        </div>
        <h1 className="text-3xl font-black mb-2">{t('title')}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{t('subtitle')}</p>
      </div>

      <RulesContent />

      {/* CTA to prizes */}
      <div className="mt-8 glass rounded-2xl border border-yellow-500/20 p-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-sm">جوایز رقابت را ببینید</p>
          <p className="text-xs text-muted-foreground mt-0.5">برترین پیش‌بینی‌کننده‌ها جوایز نقدی می‌برند</p>
        </div>
        <Link
          href="/prizes"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-yellow-500/15 border border-yellow-500/20 text-yellow-300 px-4 py-2 text-sm font-bold hover:bg-yellow-500/25 transition-colors cursor-pointer"
        >
          <Gift className="h-4 w-4" />
          جوایز
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  )
}
