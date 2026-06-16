import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return errors.unauthorized()

  const rows = await prisma.$queryRaw<Array<{
    rank:         bigint
    total_points: number
    first_name:   string
    mobile_masked: string
  }>>`
    SELECT rank, total_points, first_name, mobile_masked
    FROM   rankings_view
    WHERE  user_id = ${userId}::uuid
  `

  if (!rows.length) {
    // User hasn't made any predictions yet
    return ok({ rank: null, totalPoints: 0 })
  }

  const row = rows[0]!
  return ok({
    rank:         Number(row.rank),
    totalPoints:  row.total_points,
    firstName:    row.first_name,
    mobileMasked: row.mobile_masked,
  })
}
