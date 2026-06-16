import { NextRequest } from 'next/server'
import { createSubscriberClient } from '@/lib/redis'
import { logger } from '@/lib/logger'

// SSE live match score stream — uses Redis Pub/Sub
// Nginx must set: proxy_buffering off; proxy_read_timeout 3600s;

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: matchId } = await params
  const channel = `match:${matchId}:updates`

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const subscriber = createSubscriberClient()

      // Send initial heartbeat immediately
      controller.enqueue(encoder.encode(': heartbeat\n\n'))

      // Subscribe to Redis channel for this match
      await subscriber.subscribe(channel, (message) => {
        try {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`))
        } catch {
          // Client disconnected
        }
      })

      // Heartbeat every 30s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30_000)

      // Cleanup when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        subscriber.unsubscribe(channel).catch(() => null)
        subscriber.quit().catch(() => null)
        try { controller.close() } catch { /* already closed */ }
        logger.debug({ matchId }, 'SSE client disconnected')
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
