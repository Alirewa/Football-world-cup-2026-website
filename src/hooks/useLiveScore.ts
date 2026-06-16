'use client'

import { useEffect, useRef, useState } from 'react'
import { useSWRConfig } from 'swr'

export interface LiveScoreEvent {
  matchId:   string
  homeScore: number
  awayScore: number
  isLive:    boolean
}

export function useLiveScore(matchId: string | null) {
  const { mutate }   = useSWRConfig()
  const [live, setLive] = useState<LiveScoreEvent | null>(null)
  const esRef        = useRef<EventSource | null>(null)
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCount   = useRef(0)

  useEffect(() => {
    if (!matchId) return

    function connect() {
      const es = new EventSource(`/api/v1/matches/${matchId}/stream`)
      esRef.current = es

      es.addEventListener('score', (e: MessageEvent) => {
        try {
          const payload: LiveScoreEvent = JSON.parse(e.data)
          setLive(payload)
          // Bust SWR cache for this match so MatchCard re-renders
          mutate(`/api/v1/matches/${matchId}`)
          retryCount.current = 0
        } catch { /* ignore parse errors */ }
      })

      es.addEventListener('ping', () => { /* keep-alive */ })

      es.onerror = () => {
        es.close()
        const delay = Math.min(1000 * 2 ** retryCount.current, 30_000)
        retryCount.current++
        retryTimeout.current = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      esRef.current?.close()
      if (retryTimeout.current) clearTimeout(retryTimeout.current)
    }
  }, [matchId, mutate])

  return live
}
