import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'
import { sanitizeHtml } from '@/lib/sanitize'

const UpdateSchema = z.object({
  titleFa:   z.string().min(1).max(200).optional(),
  titleEn:   z.string().min(1).max(200).optional(),
  contentFa: z.string().min(1).optional(),
  contentEn: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  isActive:  z.boolean().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params
  const rule    = await prisma.rule.findUnique({
    where:   { id },
    include: { updatedBy: { select: { id: true, firstName: true } } },
  })
  if (!rule) return errors.notFound()

  return ok(rule)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard  = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params
  const body    = await req.json().catch(() => null)
  const parsed  = UpdateSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  const existing = await prisma.rule.findUnique({ where: { id } })
  if (!existing) return errors.notFound()

  const data = parsed.data
  const updated = await prisma.rule.update({
    where: { id },
    data: {
      ...data,
      ...(data.contentFa && { contentFa: sanitizeHtml(data.contentFa) }),
      ...(data.contentEn && { contentEn: sanitizeHtml(data.contentEn) }),
      updatedById: guard.adminId,
    },
  })

  return ok(updated)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params
  const existing = await prisma.rule.findUnique({ where: { id } })
  if (!existing) return errors.notFound()

  await prisma.rule.delete({ where: { id } })
  return ok({ deleted: true })
}
