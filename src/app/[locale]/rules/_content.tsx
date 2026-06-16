'use client'

import { useRules } from '@/hooks/useContent'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, Clock, Trophy, Users, Zap, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Static fallback rules (shown when DB has no rules yet) ────
const STATIC_RULES = [
  {
    icon:    <Zap className="h-5 w-5" />,
    title:   'شرکت رایگان',
    content: 'شرکت در مسابقه پیش‌بینی جام جهانی ۲۰۲۶ کاملاً رایگان است. فقط با شماره موبایل ثبت‌نام کن.',
    color:   'green',
  },
  {
    icon:    <Trophy className="h-5 w-5" />,
    title:   'سیستم امتیازدهی',
    content: null,
    points:  [
      { label: 'نتیجه دقیق (مثلاً ۲–۱)', value: '۳ امتیاز', highlight: true },
      { label: 'نتیجه صحیح (برد/مساوی/باخت)', value: '۱ امتیاز', highlight: false },
      { label: 'پیش‌بینی اشتباه', value: '۰ امتیاز', highlight: false },
    ],
    color: 'yellow',
  },
  {
    icon:    <Clock className="h-5 w-5" />,
    title:   'ضرب‌الاجل پیش‌بینی',
    content: 'پیش‌بینی‌ها باید قبل از شروع هر بازی ثبت شوند. پس از قفل شدن بازی، ویرایش یا ثبت جدید امکان‌پذیر نیست.',
    color:   'blue',
  },
  {
    icon:    <CheckCircle2 className="h-5 w-5" />,
    title:   'تعیین برنده در تساوی امتیاز',
    content: 'اگر چند نفر امتیاز برابر داشتند، اول تعداد پیش‌بینی‌های دقیق‌تر ملاک است، سپس قرعه‌کشی عادلانه انجام می‌شود.',
    color:   'purple',
  },
  {
    icon:    <Users className="h-5 w-5" />,
    title:   'شرایط دریافت جایزه',
    content: 'برای دریافت جایزه باید اطلاعات کاربری (نام و کد ملی) را تکمیل کرده باشید. برندگان از طریق پیامک مطلع می‌شوند.',
    color:   'orange',
  },
  {
    icon:    <Award className="h-5 w-5" />,
    title:   'اعلام برندگان',
    content: 'برندگان پس از پایان مسابقات جام جهانی ۲۰۲۶ از طریق اطلاعیه سایت معرفی می‌شوند و جوایز واریز می‌شود.',
    color:   'green',
  },
]

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: 'text-green-400',  badge: 'bg-green-500/15 text-green-300' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', badge: 'bg-yellow-500/15 text-yellow-300' },
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: 'text-blue-400',   badge: 'bg-blue-500/15 text-blue-300' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-300' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-400', badge: 'bg-orange-500/15 text-orange-300' },
}

// ── Dynamic rules from DB ─────────────────────────────────────

function DynamicRules() {
  const { rules } = useRules()

  return (
    <div className="space-y-3">
      {rules.map((rule, i) => {
        const colors = Object.values(colorMap)[i % Object.keys(colorMap).length]!

        return (
          <div
            key={rule.id}
            className={cn('glass rounded-2xl border p-5 transition-all hover:scale-[1.01]', colors.border)}
          >
            <div className="flex items-start gap-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border', colors.bg, colors.border)}>
                <span className={cn('text-sm font-black', colors.icon)}>{i + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2">{rule.titleFa}</h3>
                <div
                  className="text-sm text-muted-foreground leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: rule.contentFa }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Static rules (fallback) ───────────────────────────────────

function StaticRules() {
  return (
    <div className="space-y-3">
      {STATIC_RULES.map((rule, i) => {
        const colors = colorMap[rule.color] ?? colorMap['green']!
        return (
          <div
            key={i}
            className={cn('glass rounded-2xl border p-5 transition-all hover:scale-[1.01]', colors.border)}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                colors.bg, colors.border,
              )}>
                <span className={colors.icon}>{rule.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2">{rule.title}</h3>
                {rule.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{rule.content}</p>
                )}
                {rule.points && (
                  <div className="space-y-2 mt-2">
                    {rule.points.map((p, pi) => (
                      <div key={pi} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">{p.label}</span>
                        <span className={cn(
                          'text-sm font-black px-2.5 py-0.5 rounded-full',
                          p.highlight ? 'bg-yellow-500/20 text-yellow-300' : colors.badge,
                        )}>
                          {p.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────

export function RulesContent() {
  const { rules, isLoading } = useRules()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return rules.length > 0 ? <DynamicRules /> : <StaticRules />
}
