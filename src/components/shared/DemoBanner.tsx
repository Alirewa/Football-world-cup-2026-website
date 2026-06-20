'use client'

import { Info } from 'lucide-react'

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null

  return (
    <div className="relative z-10 flex items-center justify-center gap-2 bg-amber-500/95 px-3 py-1.5 text-center text-xs font-medium text-black sm:text-sm">
      <Info className="size-4 shrink-0" />
      <span>
        این یک نمایش آفلاین (Demo) است — داده‌ها نمایشی‌اند و هر بخش که به API نیاز دارد در نسخه واقعی به سرور زنده وصل می‌شود.
      </span>
    </div>
  )
}
