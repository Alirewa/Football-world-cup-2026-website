import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, created, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

const CreateSchema = z.object({
  titleFa:     z.string().min(1).max(200),
  titleEn:     z.string().min(1).max(200),
  bodyFa:      z.string().min(1),
  bodyEn:      z.string().min(1),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
})

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (isAdminGuardError(admin)) return admin

  const { searchParams } = req.nextUrl
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
  const cursor = searchParams.get('cursor')

  const announcements = await prisma.announcement.findMany({
    orderBy: { publishedAt: 'desc' },
    take:    limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  })

  const items = announcements.length > limit ? announcements.slice(0, limit) : announcements

  return ok({ data: items })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (isAdminGuardError(admin)) return admin

  const body = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  const { titleFa, titleEn, bodyFa, bodyEn, isPublished, publishedAt } = parsed.data

  const announcement = await prisma.announcement.create({
    data: {
      titleFa,
      titleEn,
      bodyFa,
      bodyEn,
      isPublished,
      publishedAt: publishedAt
        ? new Date(publishedAt)
        : isPublished ? new Date() : null,
    },
  })

  return created(announcement)
}
