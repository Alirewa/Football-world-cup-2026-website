'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, error, onChange, ...props }, ref) => {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const cleaned = e.target.value.replace(/[^\d]/g, '').slice(0, 11)
      e.target.value = cleaned
      onChange?.(e)
    }

    return (
      <div className="w-full">
        <div className="relative">
          <span className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono select-none pointer-events-none">
            🇮🇷
          </span>
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="09XXXXXXXXX"
            onChange={handleChange}
            className={cn(
              'flex h-12 w-full rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-mono',
              'pl-10 rtl:pl-4 rtl:pr-10',
              'placeholder:text-muted-foreground tracking-widest',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A43]/60 focus-visible:border-[#0E7A43]',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              error && 'border-red-500 focus-visible:ring-red-500/40',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
PhoneInput.displayName = 'PhoneInput'
