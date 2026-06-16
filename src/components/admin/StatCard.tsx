import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title:      string
  value:      string | number
  icon:       LucideIcon
  trend?:     string
  trendUp?:   boolean
  color?:     'green' | 'gold' | 'blue' | 'red'
}

const colors = {
  green: { bg: 'bg-[#0E7A43]/15', border: 'border-[#0E7A43]/20', icon: 'text-[#0E7A43]' },
  gold:  { bg: 'bg-[#F5B700]/15', border: 'border-[#F5B700]/20', icon: 'text-[#F5B700]' },
  blue:  { bg: 'bg-blue-500/15',  border: 'border-blue-500/20',  icon: 'text-blue-400'  },
  red:   { bg: 'bg-red-500/15',   border: 'border-red-500/20',   icon: 'text-red-400'   },
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'green' }: StatCardProps) {
  const c = colors[color]
  return (
    <div className="glass rounded-2xl p-5 flex items-start gap-4">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border', c.bg, c.border)}>
        <Icon className={cn('h-5 w-5', c.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-black tabular-nums mt-0.5">{value}</p>
        {trend && (
          <p className={cn('text-[10px] mt-1 font-medium', trendUp ? 'text-[#0E7A43]' : 'text-red-400')}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  )
}
