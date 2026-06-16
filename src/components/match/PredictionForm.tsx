'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { submitPrediction, updatePrediction } from '@/hooks/usePredictions'
import { isPredictionLocked } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'
import type { Match } from '@/hooks/useMatches'
import { Lock } from 'lucide-react'

interface PredictionFormProps {
  match:      Match
  onSuccess?: () => void
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export function PredictionForm({ match, onSuccess }: PredictionFormProps) {
  const t = useTranslations('match')

  const [home,      setHome]      = useState<string>(String(match.prediction?.homeScore ?? ''))
  const [away,      setAway]      = useState<string>(String(match.prediction?.awayScore ?? ''))
  const [loading,   setLoading]   = useState(false)
  const [tsToken,   setTsToken]   = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined)

  const locked    = isPredictionLocked(match.predictionLockedAt)
  const existing  = match.prediction
  const homeNum   = parseInt(home, 10)
  const awayNum   = parseInt(away, 10)
  const valid     = !isNaN(homeNum) && !isNaN(awayNum) && homeNum >= 0 && awayNum >= 0 && homeNum <= 20 && awayNum <= 20

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || locked) return

    if (!existing && !tsToken) {
      toast.error(t('errors.turnstile_failed' as never) ?? 'Security check required')
      return
    }

    setLoading(true)
    try {
      if (existing) {
        await updatePrediction(existing.homeScore.toString(), homeNum, awayNum)
      } else {
        await submitPrediction(match.id, homeNum, awayNum, tsToken!)
      }
      toast.success(t('submit_prediction'))
      onSuccess?.()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(t('lock_notice'))
      } else {
        toast.error('errors.server_error')
      }
      turnstileRef.current?.reset()
      setTsToken(null)
    } finally {
      setLoading(false)
    }
  }

  if (locked) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
        <Lock className="h-3.5 w-3.5" />
        {t('lock_notice')}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={0}
          max={20}
          value={home}
          onChange={e => setHome(e.target.value)}
          className="w-16 h-12 text-center text-xl font-bold rounded-xl border-2 border-border bg-transparent focus:border-[#0E7A43] focus:outline-none focus:ring-2 focus:ring-[#0E7A43]/30 transition-all tabular-nums"
          disabled={loading}
          placeholder="0"
        />
        <span className="text-muted-foreground text-sm font-medium">–</span>
        <input
          type="number"
          min={0}
          max={20}
          value={away}
          onChange={e => setAway(e.target.value)}
          className="w-16 h-12 text-center text-xl font-bold rounded-xl border-2 border-border bg-transparent focus:border-[#0E7A43] focus:outline-none focus:ring-2 focus:ring-[#0E7A43]/30 transition-all tabular-nums"
          disabled={loading}
          placeholder="0"
        />
        <Button type="submit" size="sm" loading={loading} disabled={!valid} className="flex-1">
          {existing ? t('edit_prediction') : t('submit_prediction')}
        </Button>
      </div>

      {!existing && SITE_KEY && (
        <div className="flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={SITE_KEY}
            onSuccess={setTsToken}
            onError={() => setTsToken(null)}
            options={{ theme: 'dark', size: 'compact' }}
          />
        </div>
      )}
    </form>
  )
}
