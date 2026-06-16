'use client'

import { Menu, BookOpen, Trophy, Megaphone, LogIn, LogOut, Settings, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { useAuthStore } from '@/store/auth'

export function HamburgerMenu() {
  const t            = useTranslations()
  const user         = useAuthStore(s => s.user)
  const logout       = useAuthStore(s => s.logout)
  const { theme, setTheme } = useTheme()

  const menuItems = [
    { href: '/rules',         icon: BookOpen,   label: t('nav.rules') },
    { href: '/prizes',        icon: Trophy,     label: t('nav.prizes') },
    { href: '/announcements', icon: Megaphone,  label: t('nav.announcements') },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('nav.menu')}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <SheetTitle asChild>
            <div><Logo size="md" /></div>
          </SheetTitle>
        </SheetHeader>

        <nav className="p-4 space-y-1">
          {menuItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Icon className="h-4 w-4 text-[#0E7A43]" />
              {label}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#F5B700] hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              {t('nav.admin')}
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === 'dark'
              ? <Sun  className="h-4 w-4 text-yellow-400" />
              : <Moon className="h-4 w-4 text-slate-400" />
            }
            {theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          {user ? (
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={logout}>
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button className="w-full" variant="default">
                <LogIn className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('nav.login')}
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
