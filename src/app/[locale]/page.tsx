import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Logo } from '@/components/shared/Logo'
import { HomeMatches } from './_home/HomeMatches'
import { HomeHowItWorks } from './_home/HomeHowItWorks'
import { HomeBracket } from './_home/HomeBracket'
import { HomeGroups } from './_home/HomeGroups'
import { ArrowRight, Star, Zap } from 'lucide-react'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')

  const stats = [
    { value: '۴۸', label: 'بازی گروهی',     sub: '+ ۱۶ بازی حذفی' },
    { value: '۴۸', label: 'تیم شرکت‌کننده', sub: 'از ۶ قاره' },
    { value: '∞',  label: 'رایگان',           sub: 'ثبت‌نام رایگان' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/bg-stadium.jpg)' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E7A43]/30 via-black/25 to-background" />

        <div className="relative w-full mx-auto max-w-3xl text-center space-y-6 px-4 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E7A43]/20 border border-[#0E7A43]/30 text-[#4ade80] text-xs font-bold backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            جام جهانی ۲۰۲۶ — کانادا · مکزیک · آمریکا
          </div>

          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-lg">
            {t('hero_title')}
          </h1>
          <p className="text-lg text-white/85 max-w-xl mx-auto leading-relaxed drop-shadow">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/predictions"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0E7A43] text-white px-8 py-3.5 text-base font-bold hover:bg-[#0a5e32] transition-all active:scale-95 shadow-lg shadow-[#0E7A43]/40 cursor-pointer"
            >
              {t('cta_predict')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link
              href="/rankings"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 px-6 py-3.5 text-base font-bold hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
            >
              <Star className="h-4 w-4" />
              {t('cta_rankings')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quick stats strip ──────────────────────────────────── */}
      <section className="px-4 py-5 mx-auto w-full max-w-4xl">
        <div className="glass rounded-2xl border border-[#0E7A43]/20 grid grid-cols-3 divide-x divide-[#0E7A43]/15 rtl:divide-x-reverse">
          {stats.map((item, i) => (
            <div key={i} className="flex flex-col items-center py-4 px-2 text-center">
              <span className="text-2xl font-black text-[#0E7A43]">{item.value}</span>
              <span className="text-xs font-semibold text-foreground mt-0.5">{item.label}</span>
              <span className="text-[10px] text-muted-foreground">{item.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tournament Bracket ─────────────────────────────────── */}
      <section className="px-4 pt-6 pb-4 mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black">{t('section_bracket')}</h2>
          <Link href="/predictions" className="text-sm text-[#0E7A43] font-semibold hover:underline flex items-center gap-1 cursor-pointer">
            {t('view_all')}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
        <HomeBracket />
      </section>

      {/* ── Live / Upcoming matches ─────────────────────────────── */}
      <section className="px-4 py-8 mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black">{t('section_matches')}</h2>
          <Link href="/predictions" className="text-sm text-[#0E7A43] font-semibold hover:underline flex items-center gap-1 cursor-pointer">
            {t('view_all')}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
        <HomeMatches />
      </section>

      {/* ── Groups & Teams ─────────────────────────────────────── */}
      <section className="px-4 py-8 mx-auto w-full max-w-7xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black">گروه‌های جام جهانی ۲۰۲۶</h2>
          <Link href="/predictions" className="text-sm text-[#0E7A43] font-semibold hover:underline flex items-center gap-1 cursor-pointer">
            {t('view_all')}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
        <HomeGroups />
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="px-4 py-14 mx-auto w-full max-w-4xl pb-28 md:pb-14">
        <div className="text-center mb-8">
          <h2 className="text-xl font-black">{t('section_how')}</h2>
          <p className="text-sm text-muted-foreground mt-2">سه قدم ساده برای شرکت در رقابت</p>
        </div>
        <HomeHowItWorks />
      </section>
    </div>
  )
}
