import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'

export async function GET(_req: NextRequest) {
  try {
    const languages = await prisma.language.findMany({
      where:   { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        code:       true,
        name:       true,
        nativeName: true,
        direction:  true,
        isDefault:  true,
      },
    })

    return ok({ languages })
  } catch {
    return errors.internal()
  }
}
