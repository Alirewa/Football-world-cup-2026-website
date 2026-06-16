import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const limit  = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
    const cursor = searchParams.get('cursor')

    const announcements = await prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor:  { id: cursor },
        skip:    1,
      }),
      select: {
        id:          true,
        titleFa:     true,
        titleEn:     true,
        bodyFa:      true,
        bodyEn:      true,
        publishedAt: true,
      },
    })

    const hasMore = announcements.length > limit
    const items   = hasMore ? announcements.slice(0, limit) : announcements
    const nextCursor = hasMore ? items[items.length - 1]!.id : null

    return ok({ items, nextCursor, hasMore })
  } catch {
    return errors.internal()
  }
}
