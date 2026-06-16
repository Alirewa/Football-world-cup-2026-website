'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { CheckCircle, Loader2 } from 'lucide-react'

interface MatchScoreFormProps {
  matchId:     string
  homeScore:   number | null
  awayScore:   number | null
  isFinalized: boolean
  onSuccess?:  () => void
}

export function MatchScoreForm({ matchId, homeScore: hs, awayScore: as_, isFinalized, onSuccess }: MatchScoreFormProps) {
  const [home,     setHome]     = useState<string>(hs !== null ? String(hs) : '')
  const [away,     setAway]     = useState<string>(as_ !== null ? String(as_) : '')
  const [saving,   setSaving]   = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  async function handleSave() {
    const h = parseInt(home, 10), a = parseInt(away, 10)
    if (isNaN(h) || isNaN(a)) return
    setSaving(true)
    try {
      await api.put(`/api/v1/admin/matches/${matchId}`, { homeScore: h, awayScore: a })
      toast.success('Score updated')
      onSuccess?.()
    } catch {
      toast.error('Failed to update score')
    } finally {
      setSaving(false)
    }
  }

  async function handleFinalize() {
    const h = parseInt(home, 10), a = parseInt(away, 10)
    if (isNaN(h) || isNaN(a)) return
    setFinalizing(true)
    try {
      await api.put(`/api/v1/admin/matches/${matchId}`, { homeScore: h, awayScore: a, isFinalized: true })
      toast.success('Match finalized — scoring job queued')
      onSuccess?.()
    } catch {
      toast.error('Failed to finalize match')
    } finally {
      setFinalizing(false)
    }
  }

  if (isFinalized) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#0E7A43]">
        <CheckCircle className="h-3.5 w-3.5" />
        Finalized: {hs}–{as_}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number" min={0} max={20} value={home}
        onChange={e => setHome(e.target.value)}
        className="w-12 h-8 text-center text-sm font-bold rounded-lg border border-border bg-transparent focus:border-[#0E7A43] focus:outline-none focus:ring-1 focus:ring-[#0E7A43]/30"
        placeholder="0"
      />
      <span className="text-muted-foreground text-xs">–</span>
      <input
        type="number" min={0} max={20} value={away}
        onChange={e => setAway(e.target.value)}
        className="w-12 h-8 text-center text-sm font-bold rounded-lg border border-border bg-transparent focus:border-[#0E7A43] focus:outline-none focus:ring-1 focus:ring-[#0E7A43]/30"
        placeholder="0"
      />
      <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="h-8 px-2 text-xs">
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
      </Button>
      <Button size="sm" onClick={handleFinalize} disabled={finalizing} className="h-8 px-2 text-xs">
        {finalizing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Finalize'}
      </Button>
    </div>
  )
}
