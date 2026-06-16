import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { sanitizeHtml } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { redis } from '@/lib/redis'
import { ok, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

const updateSchema = z.object({
  titleFa:   z.string().min(1).max(200).optional(),
  titleEn:   z.string().min(1).max(200).optional(),
  contentFa: z.string().optional(),
  contentEn: z.string().optional(),
})

type Params = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { slug } = await params
  const page = await prisma.cmsPage.findUnique({
    where:  { slug },
    select: { slug: true, titleFa: true, titleEn: true, contentFa: true, contentEn: true, updatedAt: true },
  })

  if (!page) return errors.notFound('CMS page not found')
  return ok(page)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { slug } = await params

  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await req.json())
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0]?.message : 'Invalid input'
    return errors.unprocessable(msg ?? 'Invalid input')
  }

  const sanitizedFa = body.contentFa ? sanitizeHtml(body.contentFa) : undefined
  const sanitizedEn = body.contentEn ? sanitizeHtml(body.contentEn) : undefined

  const updated = await prisma.cmsPage.update({
    where: { slug },
    data:  {
      ...(body.titleFa   !== undefined && { titleFa: body.titleFa }),
      ...(body.titleEn   !== undefined && { titleEn: body.titleEn }),
      ...(sanitizedFa    !== undefined && { contentFa: sanitizedFa }),
      ...(sanitizedEn    !== undefined && { contentEn: sanitizedEn }),
      updatedBy: { connect: { id: guard.adminId } },
    },
    select: { slug: true, updatedAt: true },
  })

  await Promise.all([
    redis.del(`cms:${slug}:fa`).catch(() => null),
    redis.del(`cms:${slug}:en`).catch(() => null),
  ])

  await prisma.adminAuditLog.create({
    data: {
      adminId:    guard.adminId,
      action:     'CMS_UPDATE',
      entityType: 'cms_page',
      entityId:   slug,
      afterJson:  { titleFa: body.titleFa, titleEn: body.titleEn },
      ipAddress:  req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
      userAgent:  req.headers.get('user-agent')?.slice(0, 200) ?? null,
    },
  })

  logger.info({ slug, adminId: guard.adminId }, 'CMS page updated')
  return ok(updated)
}
