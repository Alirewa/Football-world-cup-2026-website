'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard, Users, Calendar, ClipboardList,
  Megaphone, BookOpen, Trophy, Settings, ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/Logo'

const adminLinks = [
  { key: 'admin.dashboard',    icon: LayoutDashboard, href: '' },
  { key: 'admin.users',        icon: Users,           href: '/users' },
  { key: 'admin.matches',      icon: Calendar,        href: '/matches' },
  { key: 'admin.predictions',  icon: ClipboardList,   href: '/predictions' },
  { key: 'admin.announcements',icon: Megaphone,        href: '/announcements' },
  { key: 'admin.rules',        icon: BookOpen,        href: '/rules' },
  { key: 'admin.prizes',       icon: Trophy,          href: '/prizes' },
  { key: 'admin.settings',     icon: Settings,        href: '/settings' },
]

export function AdminSidebar() {
  const t        = useTranslations()
  const pathname = usePathname()
  const base     = '/admin'

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 glass border-r border-border/50 flex flex-col">
      <div className="p-5 border-b border-border/50">
        <Logo size="sm" />
        <p className="mt-1 text-[10px] text-muted-foreground">Admin Panel</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {adminLinks.map(({ key, icon: Icon, href }) => {
          const fullHref = `${base}${href}`
          const isActive = href === ''
            ? pathname === fullHref
            : pathname.startsWith(fullHref)
          return (
            <Link
              key={key}
              href={fullHref}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#0E7A43]/15 text-[#0E7A43] border border-[#0E7A43]/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key as Parameters<typeof t>[0])}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border/50">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          بازگشت به سایت
        </Link>
      </div>
    </aside>
  )
}
