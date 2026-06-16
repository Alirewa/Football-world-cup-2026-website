'use client'

import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/badge'
import { useAdminUsers } from '@/hooks/useAdminData'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

export default function AdminUsersPage() {
  const t      = useTranslations('admin')
  const { users, isLoading } = useAdminUsers()

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black">{t('users')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('users_subtitle')}</p>
      </div>

      <DataTable
        isLoading={isLoading}
        data={users ?? []}
        keyExtractor={r => r.id}
        pageSize={25}
        columns={[
          {
            key: 'avatar',
            header: '',
            cell: r => (
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border/50 bg-muted shrink-0">
                {r.avatarUrl ? (
                  <Image src={r.avatarUrl} alt={r.firstName ?? ''} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                    {r.firstName?.[0] ?? '?'}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'name',
            header: t('col_name'),
            cell: r => <span className="font-medium">{r.firstName} {r.lastName}</span>,
          },
          {
            key: 'mobile',
            header: t('col_mobile'),
            cell: r => <span className="font-mono text-xs">{r.mobile}</span>,
          },
          {
            key: 'role',
            header: t('col_role'),
            cell: r => (
              <Badge variant={r.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                {r.role}
              </Badge>
            ),
          },
          {
            key: 'createdAt',
            header: t('col_joined'),
            cell: r => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
          },
          {
            key: 'totalPoints',
            header: t('col_points'),
            cell: r => <span className="font-bold tabular-nums">{r.totalPoints ?? 0}</span>,
          },
        ]}
      />
    </div>
  )
}
