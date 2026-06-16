import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-[#0E7A43] text-white',
        secondary:   'border-transparent bg-[#F5B700]/20 text-[#F5B700]',
        destructive: 'border-transparent bg-red-500/20 text-red-400',
        outline:     'border-border text-foreground',
        live:        'border-red-500/30 bg-red-500/15 text-red-400',
        locked:      'border-border/50 bg-muted/50 text-muted-foreground',
        finalized:   'border-[#0E7A43]/30 bg-[#0E7A43]/15 text-[#12a05a]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
