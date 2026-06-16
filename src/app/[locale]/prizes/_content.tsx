'use client'

import { PrizeTier } from '@/components/content/PrizeTier'
import { usePrizes, type Prize } from '@/hooks/useContent'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ── Static fallback prizes (shown when DB has no prizes yet) ──

const STATIC_PRIZES: Prize[] = [
  {
    id: 's1', rankPosition: 1, sortOrder: 1,
    titleFa: 'مقام اول', titleEn: 'First Place',
    contentFa: '<p>نفر اول جدول رتبه‌بندی در پایان مسابقات جام جهانی ۲۰۲۶ برنده جایزه نقدی می‌شود.</p>',
    contentEn: '<p>Top-ranked participant at the end of World Cup 2026 wins the grand cash prize.</p>',
    prizeValue: '۵۰,۰۰۰,۰۰۰ تومان',
  },
  {
    id: 's2', rankPosition: 2, sortOrder: 2,
    titleFa: 'مقام دوم', titleEn: 'Second Place',
    contentFa: '<p>نفر دوم جدول رتبه‌بندی جایزه نقدی دریافت می‌کند.</p>',
    contentEn: '<p>Second-ranked participant receives a cash prize.</p>',
    prizeValue: '۲۰,۰۰۰,۰۰۰ تومان',
  },
  {
    id: 's3', rankPosition: 3, sortOrder: 3,
    titleFa: 'مقام سوم', titleEn: 'Third Place',
    contentFa: '<p>نفر سوم جدول رتبه‌بندی جایزه نقدی دریافت می‌کند.</p>',
    contentEn: '<p>Third-ranked participant receives a cash prize.</p>',
    prizeValue: '۱۰,۰۰۰,۰۰۰ تومان',
  },
  {
    id: 's4', rankPosition: 4, sortOrder: 4,
    titleFa: 'مقام چهارم تا دهم', titleEn: 'Ranks 4–10',
    contentFa: '<p>نفرات چهارم تا دهم هر کدام جایزه نقدی دریافت می‌کنند.</p>',
    contentEn: '<p>Participants ranked 4–10 each receive a cash prize.</p>',
    prizeValue: '۵,۰۰۰,۰۰۰ تومان',
  },
]

// ── Points explainer banner ───────────────────────────────────

function PointsExplainer() {
  return (
    <div className="glass rounded-2xl border border-[#0E7A43]/20 p-5 mb-6">
      <h3 className="font-bold text-sm text-[#0E7A43] mb-3">نحوه کسب امتیاز</h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { pts: '3', label: 'نتیجه دقیق',   bg: 'bg-yellow-500/15 border-yellow-500/20 text-yellow-300' },
          { pts: '1', label: 'نتیجه صحیح',   bg: 'bg-green-500/15 border-green-500/20 text-green-300' },
          { pts: '0', label: 'اشتباه',        bg: 'bg-zinc-500/15 border-zinc-500/20 text-zinc-400' },
        ].map(item => (
          <div key={item.pts} className={cn('rounded-xl border p-3', item.bg)}>
            <div className="text-2xl font-black">{item.pts}</div>
            <div className="text-xs mt-0.5 opacity-80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────

export function PrizesContent() {
  const { prizes, isLoading } = usePrizes()
  const prizeList = prizes.length > 0 ? prizes : STATIC_PRIZES

  if (isLoading) {
    return (
      <>
        <div className="glass rounded-2xl border border-[#0E7A43]/20 p-5 mb-6 space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 space-y-3">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <PointsExplainer />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prizeList.map(prize => <PrizeTier key={prize.id} prize={prize} />)}
      </div>
    </>
  )
}
