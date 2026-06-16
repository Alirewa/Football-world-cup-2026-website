'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/auth'
import { Logo } from '@/components/shared/Logo'
import { HamburgerMenu } from './HamburgerMenu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const navLinks = [
  { key: 'nav.home',        href: '/' },
  { key: 'nav.predictions', href: '/predictions' },
  { key: 'nav.rankings',    href: '/rankings' },
]

export function Navbar() {
  const t    = useTranslations()
  const user = useAuthStore(s => s.user)

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border/50 glass">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">

        {/* Logo + Nav group (start) */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions (end) */}
        <div className="flex items-center gap-2">
          {/* Live stream button */}
          <a
            href="https://football360.ir/live/section"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            <span className="live-dot" />
            پخش زنده
          </a>

          {user ? (
            <Link href="/profile" className={cn('hidden md:flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-accent transition-colors')}>
              <Avatar className="h-7 w-7">
                {user.avatar?.url && <AvatarImage src={user.avatar.url} />}
                <AvatarFallback className="text-xs">{user.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.firstName}</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:inline-flex h-9 items-center gap-2 rounded-xl bg-[#0E7A43] px-4 text-sm font-medium text-white hover:bg-[#0a5e32] transition-colors"
            >
              {t('nav.login')}
            </Link>
          )}

          <HamburgerMenu />
        </div>
      </div>
    </header>
  )
}
