import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'

export async function GET(_req: NextRequest) {
  try {
    const avatars = await prisma.avatar.findMany({
      where:   { isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id:       true,
        name:     true,
        url:      true,
        category: true,
        teamId:   true,
      },
    })

    // Group by category for easier frontend consumption
    const byCategory = avatars.reduce<Record<string, typeof avatars>>(
      (acc, avatar) => {
        const cat = avatar.category ?? 'other'
        if (!acc[cat]) acc[cat] = []
        acc[cat]!.push(avatar)
        return acc
      },
      {}
    )

    return ok({ avatars: byCategory })
  } catch {
    return errors.internal()
  }
}
