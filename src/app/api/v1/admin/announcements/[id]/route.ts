import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'

const UpdateSchema = z.object({
  titleFa:     z.string().min(1).max(200).optional(),
  titleEn:     z.string().min(1).max(200).optional(),
  bodyFa:      z.string().min(1).optional(),
  bodyEn:      z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const announcement = await prisma.announcement.findUnique({ where: { id } })
  if (!announcement) return errors.notFound()

  return ok(announcement)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const body   = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return errors.unprocessable(parsed.error.errors[0]?.message ?? 'Validation error')

  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) return errors.notFound()

  const data = parsed.data
  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...data,
      publishedAt: data.publishedAt !== undefined
        ? data.publishedAt ? new Date(data.publishedAt) : null
        : undefined,
      ...(data.isPublished && !existing.publishedAt && !data.publishedAt
        ? { publishedAt: new Date() }
        : {}),
    },
  })

  return ok(updated)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) return errors.notFound()

  await prisma.announcement.delete({ where: { id } })
  return ok({ deleted: true })
}
