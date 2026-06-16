import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { predictionLimiter, consumeLimit } from '@/lib/rate-limiter'
import { ok, errors } from '@/lib/response'
import { env } from '@/lib/env'

// ── Turnstile verification ────────────────────────────────────

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (env.NODE_ENV !== 'production') return true // skip in dev

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret:   env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    })
    const data = await res.json() as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}

// ── GET /api/v1/predictions — user's own predictions ─────────

const listSchema = z.object({
  cursor: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return errors.unauthorized()

  const query  = listSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!query.success) return errors.unprocessable('Invalid query')
  const { cursor, limit } = query.data

  const predictions = await prisma.prediction.findMany({
    where:   { userId },
    take:    limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { submittedAt: 'desc' },
    select: {
      id:           true,
      homeScore:    true,
      awayScore:    true,
      pointsEarned: true,
      submittedAt:  true,
      match: {
        select: {
          id:          true,
          bracketSlot: true,
          stage:       true,
          kickoffAt:   true,
          homeScore:   true,
          awayScore:   true,
          isFinalized: true,
          homeTeam: { select: { id: true, fifaCode: true, nameEn: true, nameFa: true } },
          awayTeam: { select: { id: true, fifaCode: true, nameEn: true, nameFa: true } },
        },
      },
    },
  })

  const hasMore   = predictions.length > limit
  const items     = hasMore ? predictions.slice(0, -1) : predictions
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return ok({ items, nextCursor })
}

// ── POST /api/v1/predictions — submit prediction ─────────────

const createSchema = z.object({
  matchId:        z.string().uuid(),
  homeScore:      z.number().int().min(0).max(99),
  awayScore:      z.number().int().min(0).max(99),
  turnstileToken: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return errors.unauthorized()

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const limited = await consumeLimit(predictionLimiter, `pred:${userId}`)
  if (!limited) return errors.tooManyRequests()

  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(await req.json())
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0]?.message : 'Invalid input'
    return errors.unprocessable(msg ?? 'Invalid input')
  }

  // Turnstile bot protection
  const turnstileOk = await verifyTurnstile(body.turnstileToken, ip)
  if (!turnstileOk) {
    return errors.badRequest('تأیید Turnstile ناموفق بود. صفحه را رفرش کنید')
  }

  // Fetch match and check prediction deadline
  const match = await prisma.match.findUnique({
    where:  { id: body.matchId },
    select: { id: true, predictionLockedAt: true, isFinalized: true },
  })

  if (!match) return errors.notFound('بازی یافت نشد')

  if (match.isFinalized) {
    return errors.conflict('این بازی نهایی شده است و قابل پیش‌بینی نیست')
  }

  if (match.predictionLockedAt && new Date() >= match.predictionLockedAt) {
    return errors.conflict('زمان ثبت پیش‌بینی برای این بازی به پایان رسیده است')
  }

  // Upsert prediction (DB UNIQUE constraint + trigger enforces deadline again)
  try {
    const prediction = await prisma.$transaction(async (tx) => {
      const existing = await tx.prediction.findUnique({
        where: { uq_prediction_user_match: { userId, matchId: body.matchId } },
      })

      if (existing) {
        // Record edit in audit trail
        await tx.predictionEdit.create({
          data: {
            predictionId: existing.id,
            oldHome:      existing.homeScore,
            oldAway:      existing.awayScore,
            newHome:      body.homeScore,
            newAway:      body.awayScore,
          },
        })
        return tx.prediction.update({
          where: { id: existing.id },
          data:  { homeScore: body.homeScore, awayScore: body.awayScore },
          select: { id: true, homeScore: true, awayScore: true, submittedAt: true },
        })
      }

      return tx.prediction.create({
        data: {
          userId:    userId,
          matchId:   body.matchId,
          homeScore: body.homeScore,
          awayScore: body.awayScore,
        },
        select: { id: true, homeScore: true, awayScore: true, submittedAt: true },
      })
    })

    logger.info({ userId, matchId: body.matchId }, 'Prediction submitted')
    return ok(prediction, 201)
  } catch (err: unknown) {
    // DB trigger fired (past deadline)
    if ((err as { code?: string }).code === 'P2010' || (err as { message?: string }).message?.includes('prediction_deadline')) {
      return errors.conflict('زمان ثبت پیش‌بینی به پایان رسیده است')
    }
    logger.error({ err }, 'Prediction creation failed')
    return errors.internal()
  }
}
