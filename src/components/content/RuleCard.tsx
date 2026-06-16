import type { Rule } from '@/hooks/useContent'

interface RuleCardProps {
  rule:   Rule
  index:  number
}

export function RuleCard({ rule, index }: RuleCardProps) {
  const title   = rule.titleFa
  const content = rule.contentFa

  return (
    <div className="glass glass-hover rounded-2xl p-6 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0E7A43]/15 border border-[#0E7A43]/20">
          <span className="text-sm font-black text-[#0E7A43]">{index + 1}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <div
            className="text-sm text-muted-foreground leading-relaxed prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  )
}
