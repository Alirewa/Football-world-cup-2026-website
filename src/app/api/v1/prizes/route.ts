import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'

export async function GET(_req: NextRequest) {
  try {
    const prizes = await prisma.prize.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id:           true,
        titleFa:      true,
        titleEn:      true,
        contentFa:    true,
        contentEn:    true,
        rankPosition: true,
        prizeValue:   true,
        sortOrder:    true,
      },
    })

    return ok({ prizes })
  } catch {
    return errors.internal()
  }
}
