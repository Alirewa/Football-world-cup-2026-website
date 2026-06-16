import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { predictionLimiter, consumeLimit } from '@/lib/rate-limiter'
import { ok, errors } from '@/lib/response'

const updateSchema = z.object({
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return errors.unauthorized()

  const limited = await consumeLimit(predictionLimiter, `pred:${userId}`)
  if (!limited) return errors.tooManyRequests()

  const { id } = await params

  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await req.json())
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0]?.message : 'Invalid input'
    return errors.unprocessable(msg ?? 'Invalid input')
  }

  // Fetch prediction (must belong to this user)
  const prediction = await prisma.prediction.findUnique({
    where:  { id },
    select: {
      id:        true,
      userId:    true,
      homeScore: true,
      awayScore: true,
      match: {
        select: { predictionLockedAt: true, isFinalized: true },
      },
    },
  })

  if (!prediction) return errors.notFound('پیش‌بینی یافت نشد')
  if (prediction.userId !== userId) return errors.forbidden()

  if (prediction.match.isFinalized) {
    return errors.conflict('این بازی نهایی شده است')
  }

  if (prediction.match.predictionLockedAt && new Date() >= prediction.match.predictionLockedAt) {
    return errors.conflict('زمان ویرایش پیش‌بینی به پایان رسیده است')
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.predictionEdit.create({
      data: {
        predictionId: prediction.id,
        oldHome:      prediction.homeScore,
        oldAway:      prediction.awayScore,
        newHome:      body.homeScore,
        newAway:      body.awayScore,
      },
    })
    return tx.prediction.update({
      where: { id: prediction.id },
      data:  { homeScore: body.homeScore, awayScore: body.awayScore },
      select: { id: true, homeScore: true, awayScore: true, submittedAt: true },
    })
  })

  logger.info({ userId, predictionId: id }, 'Prediction updated')
  return ok(updated)
}
