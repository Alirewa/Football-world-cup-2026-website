import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { ok, errors, noContent } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params

  const user = await prisma.user.findUnique({
    where:  { id },
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      mobile:    true,      // Full mobile for admins
      email:     true,
      role:      true,
      isActive:  true,
      locale:    true,
      theme:     true,
      createdAt: true,
      deletedAt: true,
      avatar:    { select: { id: true, category: true, url: true } },
    },
  })

  if (!user) return errors.notFound()
  return ok(user)
}

const updateSchema = z.object({
  isActive: z.boolean().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params

  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await req.json())
  } catch {
    return errors.unprocessable()
  }

  const before = await prisma.user.findUnique({ where: { id } })
  if (!before) return errors.notFound()

  const updated = await prisma.user.update({
    where: { id },
    data:  body,
    select: { id: true, isActive: true, role: true },
  })

  await prisma.adminAuditLog.create({
    data: {
      adminId:    guard.adminId,
      action:     'USER_UPDATE',
      entityType: 'user',
      entityId:   id,
      beforeJson: { isActive: before.isActive },
      afterJson:  body,
      ipAddress:  req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
      userAgent:  req.headers.get('user-agent')?.slice(0, 200) ?? null,
    },
  })

  logger.info({ targetUserId: id, adminId: guard.adminId }, 'Admin updated user')
  return ok(updated)
}

// Admin soft-delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params

  await prisma.user.update({
    where: { id },
    data:  { deletedAt: new Date(), isActive: false },
  })

  await prisma.adminAuditLog.create({
    data: {
      adminId:    guard.adminId,
      action:     'USER_DELETE',
      entityType: 'user',
      entityId:   id,
      ipAddress:  req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
      userAgent:  req.headers.get('user-agent')?.slice(0, 200) ?? null,
    },
  })

  logger.info({ targetUserId: id, adminId: guard.adminId }, 'Admin soft-deleted user')
  return noContent()
}
