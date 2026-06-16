'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { DataTable } from '@/components/admin/DataTable'
import { TipTapEditor } from '@/components/admin/TipTapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import * as DP from '@radix-ui/react-dialog'
import { Badge } from '@/components/ui/badge'
import { useAdminAnnouncements } from '@/hooks/useAdminData'
import { api } from '@/lib/api-client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Ann = { id: string; titleFa: string; titleEn: string; bodyFa: string; bodyEn: string; isPublished: boolean; publishedAt: string | null; createdAt: string }

export default function AdminAnnouncementsPage() {
  const t = useTranslations('admin')
  const { announcements, isLoading, mutate } = useAdminAnnouncements()

  const [open,    setOpen]    = useState(false)
  const [editing, setEditing] = useState<Ann | null>(null)
  const [titleFa, setTitleFa] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [bodyFa, setBodyFa] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null); setTitleFa(''); setTitleEn(''); setBodyFa(''); setBodyEn(''); setPublished(false)
    setOpen(true)
  }
  function openEdit(ann: Ann) {
    setEditing(ann); setTitleFa(ann.titleFa); setTitleEn(ann.titleEn)
    setBodyFa(ann.bodyFa); setBodyEn(ann.bodyEn); setPublished(ann.isPublished)
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const body = { titleFa, titleEn, bodyFa, bodyEn, isPublished: published }
      if (editing) {
        await api.put(`/api/v1/admin/announcements/${editing.id}`, body)
      } else {
        await api.post('/api/v1/admin/announcements', body)
      }
      toast.success(editing ? t('updated') : t('created'))
      mutate(); setOpen(false)
    } catch { toast.error(t('save_error')) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirm_delete'))) return
    try {
      await api.delete(`/api/v1/admin/announcements/${id}`)
      toast.success(t('deleted')); mutate()
    } catch { toast.error(t('delete_error')) }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{t('announcements')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('announcements_subtitle')}</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 me-1.5" /> {t('new_announcement')}
        </Button>
      </div>

      <DataTable
        isLoading={isLoading}
        data={announcements ?? []}
        keyExtractor={r => r.id}
        columns={[
          { key: 'titleFa', header: t('col_title_fa'), cell: r => <span className="font-medium">{r.titleFa}</span> },
          { key: 'titleEn', header: t('col_title_en') },
          {
            key: 'isPublished',
            header: t('col_status'),
            cell: r => <Badge variant={r.isPublished ? 'finalized' : 'locked'}>{r.isPublished ? t('published') : t('draft')}</Badge>,
          },
          {
            key: 'createdAt',
            header: t('col_date'),
            cell: r => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
          },
        ]}
        actions={r => (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DP.Portal>
          <DP.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DP.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 glass rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <DP.Title className="text-lg font-bold">{editing ? t('edit_announcement') : t('new_announcement')}</DP.Title>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label={t('title_fa')} value={titleFa} onChange={e => setTitleFa(e.target.value)} dir="rtl" />
              <Input label={t('title_en')} value={titleEn} onChange={e => setTitleEn(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{t('content_fa')}</p>
              <TipTapEditor content={bodyFa} onChange={setBodyFa} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{t('content_en')}</p>
              <TipTapEditor content={bodyEn} onChange={setBodyEn} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4 accent-[#0E7A43]" />
              <span className="text-sm">{t('publish_now')}</span>
            </label>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>{t('cancel')}</Button>
              <Button loading={saving} onClick={handleSave}>{editing ? t('update') : t('create')}</Button>
            </div>
          </DP.Content>
        </DP.Portal>
      </Dialog>
    </div>
  )
}
