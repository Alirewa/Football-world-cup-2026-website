'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface Column<T> {
  key:       keyof T | string
  header:    string
  cell?:     (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns:    Column<T>[]
  data:       T[]
  isLoading?: boolean
  keyExtractor: (row: T) => string
  pageSize?:  number
  actions?:   (row: T) => React.ReactNode
}

export function DataTable<T>({
  columns, data, isLoading, keyExtractor, pageSize = 20, actions,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(data.length / pageSize)
  const slice      = data.slice(page * pageSize, (page + 1) * pageSize)

  if (isLoading) {
    return (
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map(c => (
                  <th key={String(c.key)} className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                    {c.header}
                  </th>
                ))}
                {actions && <th className="px-4 py-3 text-end text-xs font-semibold text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {columns.map(c => (
                    <td key={String(c.key)} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3"><Skeleton className="h-4 w-16 ms-auto" /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map(c => (
                  <th
                    key={String(c.key)}
                    className={cn('px-4 py-3 text-start text-xs font-semibold text-muted-foreground whitespace-nowrap', c.className)}
                  >
                    {c.header}
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-end text-xs font-semibold text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {slice.map(row => (
                <tr key={keyExtractor(row)} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                  {columns.map(c => (
                    <td key={String(c.key)} className={cn('px-4 py-3 text-sm', c.className)}>
                      {c.cell ? c.cell(row) : String((row as Record<string, unknown>)[String(c.key)] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-end">{actions(row)}</td>
                  )}
                </tr>
              ))}
              {slice.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" disabled={page === 0} onClick={() => setPage(0)}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
