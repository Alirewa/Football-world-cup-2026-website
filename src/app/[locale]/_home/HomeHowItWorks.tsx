'use client'

import { useTranslations } from 'next-intl'
import { UserPlus, Target, Trophy } from 'lucide-react'

export function HomeHowItWorks() {
  const t = useTranslations('home')

  const steps = [
    { icon: UserPlus, title: t('how_step1_title'), desc: t('how_step1_desc'), color: '#0E7A43' },
    { icon: Target,   title: t('how_step2_title'), desc: t('how_step2_desc'), color: '#F5B700' },
    { icon: Trophy,   title: t('how_step3_title'), desc: t('how_step3_desc'), color: '#0E7A43' },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {steps.map((step, i) => {
        const Icon = step.icon
        return (
          <div key={i} className="glass rounded-2xl p-6 text-center space-y-3">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}
            >
              <Icon className="h-6 w-6" style={{ color: step.color }} />
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-black text-muted-foreground">
                {i + 1}
              </span>
              <h3 className="font-bold text-foreground">{step.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        )
      })}
    </div>
  )
}
