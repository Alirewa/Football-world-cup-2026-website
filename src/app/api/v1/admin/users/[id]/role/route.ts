import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { revokeAllUserTokens } from '@/lib/auth/refresh-tokens'
import { logger } from '@/lib/logger'
import { ok, errors } from '@/lib/response'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

const schema = z.object({
  role: z.enum(['user', 'admin']),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const { id } = await params

  // Prevent admin from demoting themselves
  if (id === guard.adminId) {
    return errors.conflict('Cannot change your own role')
  }

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await req.json())
  } catch {
    return errors.unprocessable()
  }

  const before = await prisma.user.findUnique({
    where:  { id },
    select: { role: true },
  })
  if (!before) return errors.notFound()

  await prisma.user.update({
    where: { id },
    data:  { role: body.role },
  })

  // Force re-login — revoke all refresh tokens so role change takes effect immediately
  await revokeAllUserTokens(id)

  await prisma.adminAuditLog.create({
    data: {
      adminId:    guard.adminId,
      action:     'USER_ROLE_CHANGE',
      entityType: 'user',
      entityId:   id,
      beforeJson: { role: before.role },
      afterJson:  { role: body.role },
      ipAddress:  req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
      userAgent:  req.headers.get('user-agent')?.slice(0, 200) ?? null,
    },
  })

  logger.info({ targetUserId: id, adminId: guard.adminId, newRole: body.role }, 'User role changed — sessions revoked')

  return ok({ message: 'Role updated. All user sessions have been revoked.' })
}
