'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Home, List, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { key: 'nav.home',        icon: Home,   href: '/' },
  { key: 'nav.predictions', icon: List,   href: '/predictions' },
  { key: 'nav.rankings',    icon: Trophy, href: '/rankings' },
  { key: 'nav.profile',     icon: User,   href: '/profile' },
]

export function BottomNav() {
  const t        = useTranslations()
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe glass border-t border-border/50">
      <div className="flex items-stretch h-16">
        {navItems.map(({ key, icon: Icon, href }) => {
          const isActive  = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'text-[#0E7A43]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_rgba(14,122,67,0.6)]')} />
              <span className="text-[10px]">{t(key as Parameters<typeof t>[0])}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[#0E7A43]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
