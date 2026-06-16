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
import { useAdminRules } from '@/hooks/useAdminData'
import { api } from '@/lib/api-client'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type Rule = { id: string; titleFa: string; titleEn: string; contentFa: string; contentEn: string; isActive: boolean; sortOrder: number }

export default function AdminRulesPage() {
  const t = useTranslations('admin')
  const { rules, isLoading, mutate } = useAdminRules()

  const [open,    setOpen]    = useState(false)
  const [editing, setEditing] = useState<Rule | null>(null)
  const [titleFa, setTitleFa] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [contentFa, setContentFa] = useState('')
  const [contentEn, setContentEn] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [active,    setActive]    = useState(true)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null); setTitleFa(''); setTitleEn(''); setContentFa(''); setContentEn('')
    setSortOrder((rules?.length ?? 0) + 1); setActive(true); setOpen(true)
  }
  function openEdit(r: Rule) {
    setEditing(r); setTitleFa(r.titleFa); setTitleEn(r.titleEn)
    setContentFa(r.contentFa); setContentEn(r.contentEn); setSortOrder(r.sortOrder); setActive(r.isActive)
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const body = { titleFa, titleEn, contentFa, contentEn, sortOrder, isActive: active }
      if (editing) {
        await api.put(`/api/v1/admin/rules/${editing.id}`, body)
      } else {
        await api.post('/api/v1/admin/rules', body)
      }
      toast.success(editing ? t('updated') : t('created')); mutate(); setOpen(false)
    } catch { toast.error(t('save_error')) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirm_delete'))) return
    try { await api.delete(`/api/v1/admin/rules/${id}`); toast.success(t('deleted')); mutate() }
    catch { toast.error(t('delete_error')) }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{t('rules')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('rules_subtitle')}</p>
        </div>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 me-1.5" /> {t('new_rule')}</Button>
      </div>

      <DataTable
        isLoading={isLoading}
        data={rules ?? []}
        keyExtractor={r => r.id}
        columns={[
          { key: 'sortOrder', header: '#', cell: r => <span className="font-bold">{r.sortOrder}</span> },
          { key: 'titleFa', header: t('col_title_fa'), cell: r => <span className="font-medium">{r.titleFa}</span> },
          { key: 'titleEn', header: t('col_title_en') },
          { key: 'isActive', header: t('col_status'), cell: r => <Badge variant={r.isActive ? 'finalized' : 'locked'}>{r.isActive ? t('active') : t('inactive')}</Badge> },
        ]}
        actions={r => (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DP.Portal>
          <DP.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DP.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 glass rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <DP.Title className="text-lg font-bold">{editing ? t('edit_rule') : t('new_rule')}</DP.Title>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label={t('title_fa')} value={titleFa} onChange={e => setTitleFa(e.target.value)} dir="rtl" />
              <Input label={t('title_en')} value={titleEn} onChange={e => setTitleEn(e.target.value)} />
            </div>
            <Input label={t('sort_order')} type="number" value={String(sortOrder)} onChange={e => setSortOrder(Number(e.target.value))} />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{t('content_fa')}</p>
              <TipTapEditor content={contentFa} onChange={setContentFa} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">{t('content_en')}</p>
              <TipTapEditor content={contentEn} onChange={setContentEn} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-[#0E7A43]" />
              <span className="text-sm">{t('active')}</span>
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
