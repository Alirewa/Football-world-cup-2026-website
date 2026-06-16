'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScoringJobProgressProps {
  jobId:     string
  onComplete?: () => void
}

type JobStatus = 'waiting' | 'active' | 'completed' | 'failed'

export function ScoringJobProgress({ jobId, onComplete }: ScoringJobProgressProps) {
  const [status,   setStatus]   = useState<JobStatus>('waiting')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    let delay = 1000

    async function poll() {
      if (cancelled) return
      try {
        const data = await api.get<{ status: JobStatus; progress: number }>(`/api/v1/admin/jobs/${jobId}`)
        if (!cancelled) {
          setStatus(data.status)
          setProgress(data.progress ?? 0)
          if (data.status === 'completed' || data.status === 'failed') {
            onComplete?.()
            return
          }
        }
      } catch { /* ignore */ }
      delay = Math.min(delay * 1.5, 5000)
      setTimeout(poll, delay)
    }

    poll()
    return () => { cancelled = true }
  }, [jobId, onComplete])

  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        {status === 'completed' && <CheckCircle2 className="h-4 w-4 text-[#0E7A43]" />}
        {status === 'failed'    && <XCircle      className="h-4 w-4 text-red-400"    />}
        {(status === 'waiting' || status === 'active') && (
          <Loader2 className="h-4 w-4 animate-spin text-[#F5B700]" />
        )}
        <span className={cn(
          'font-medium capitalize',
          status === 'completed' ? 'text-[#0E7A43]' : status === 'failed' ? 'text-red-400' : 'text-muted-foreground',
        )}>
          {status === 'active' ? 'Scoring in progress…' : status}
        </span>
        {(status === 'waiting' || status === 'active') && (
          <span className="ms-auto text-xs text-muted-foreground">{Math.round(progress)}%</span>
        )}
      </div>
      {(status === 'waiting' || status === 'active') && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0E7A43] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
