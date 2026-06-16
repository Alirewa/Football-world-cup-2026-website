import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, created, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'
import { sanitizeHtml } from '@/lib/sanitize'

const CreateSchema = z.object({
  titleFa:   z.string().min(1).max(200),
  titleEn:   z.string().min(1).max(200),
  contentFa: z.string().min(1),
  contentEn: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive:  z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const rules = await prisma.rule.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      updatedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return ok({ data: rules })
}

export async function POST(req: NextRequest) {
  const guard  = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const body   = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  const { titleFa, titleEn, contentFa, contentEn, sortOrder, isActive } = parsed.data

  const rule = await prisma.rule.create({
    data: {
      titleFa,
      titleEn,
      contentFa:  sanitizeHtml(contentFa),
      contentEn:  sanitizeHtml(contentEn),
      sortOrder,
      isActive,
      updatedById: guard.adminId,
    },
  })

  return created(rule)
}
