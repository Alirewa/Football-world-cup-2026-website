'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { MatchGrid } from '@/components/match/MatchGrid'
import { PredictionForm } from '@/components/match/PredictionForm'
import { useMatch } from '@/hooks/useMatches'
import { Sheet } from '@/components/ui/sheet'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { MatchCard } from '@/components/match/MatchCard'
import { Crosshair } from 'lucide-react'

function MatchDetailSheet({ matchId, open, onClose }: { matchId: string; open: boolean; onClose: () => void }) {
  const t = useTranslations('match')
  const { match, isLoading } = useMatch(matchId)

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <SheetPrimitive.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl glass border-t border-border p-6 pb-safe max-h-[85dvh] overflow-y-auto">
          {isLoading || !match ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              {t('loading')}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="h-1 w-12 rounded-full bg-border" />
              </div>
              <MatchCard match={match} />
              <div>
                <p className="text-sm font-semibold mb-3">{t('enter_prediction')}</p>
                <PredictionForm match={match} onSuccess={onClose} />
              </div>
            </div>
          )}
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </Sheet>
  )
}

export default function PredictionsPage() {
  const t = useTranslations('match')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E7A43]/15 border border-[#0E7A43]/20">
            <Crosshair className="h-5 w-5 text-[#0E7A43]" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{t('predictions_title')}</h1>
            <p className="text-sm text-muted-foreground">{t('predictions_subtitle')}</p>
          </div>
        </div>

        <MatchGrid onMatchClick={id => setSelectedId(id)} showPredictions />

        {selectedId && (
          <MatchDetailSheet
            matchId={selectedId}
            open={!!selectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </AuthGuard>
  )
}
