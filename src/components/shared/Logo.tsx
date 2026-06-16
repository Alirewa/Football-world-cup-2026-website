import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Ball icon */}
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <circle cx="20" cy="20" r="19" stroke="#0E7A43" strokeWidth="2" fill="rgba(14,122,67,0.12)" />
        <circle cx="20" cy="20" r="19" stroke="url(#logo-grad)" strokeWidth="2" />
        {/* Pentagon pattern */}
        <path d="M20 6 L25 14 L32 14 L27 21 L29 28 L20 24 L11 28 L13 21 L8 14 L15 14 Z" fill="none" stroke="#F5B700" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="20" cy="20" r="3" fill="#F5B700" />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#0E7A43" />
            <stop offset="100%" stopColor="#F5B700" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn(
            'font-bold text-white',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-xl',
          )}>
            WC<span className="text-[#F5B700]">2026</span>
          </span>
          <span className={cn(
            'text-muted-foreground',
            size === 'sm' && 'text-[9px]',
            size === 'md' && 'text-[10px]',
            size === 'lg' && 'text-xs',
          )}>
            Prediction
          </span>
        </div>
      )}
    </div>
  )
}
