import { useTranslations } from 'next-intl'
import { PrizesContent } from './_content'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'

export default function PrizesPage() {
  const t = useTranslations('prizes')

  return (
    <div className="min-h-screen">
      {/* Hero banner — stadium SVG background */}
      <div className="relative overflow-hidden h-56 md:h-72">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/bg-stadium.svg)' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />

        <div className="relative h-full flex flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold mb-1">
            <span>🏆</span>
            جام جهانی ۲۰۲۶
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
            {t('title')}
          </h1>
          <p className="text-sm md:text-base text-white/85 max-w-md">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8 -mt-2">
        <PrizesContent />

        {/* Link to rules */}
        <div className="mt-8 text-center">
          <Link
            href="/rules"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            مطالعه قوانین کامل
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  )
}
