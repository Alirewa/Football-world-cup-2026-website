import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { maskMobile } from '@/lib/validators/mobile'
import { requireAdmin, isAdminGuardError } from '@/app/api/v1/admin/_guard'

const querySchema = z.object({
  search: z.string().optional(),
  cursor: z.string().uuid().optional(),
  limit:  z.coerce.number().int().min(1).max(100).default(50),
  role:   z.enum(['user', 'admin']).optional(),
  active: z.enum(['true', 'false']).optional(),
})

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (isAdminGuardError(guard)) return guard

  const query = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!query.success) return errors.unprocessable('Invalid query')
  const { search, cursor, limit, role, active } = query.data

  const where: Record<string, unknown> = { deletedAt: null }
  if (role)   where.role     = role
  if (active !== undefined) where.isActive = active === 'true'
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName:  { contains: search, mode: 'insensitive' } },
      { mobile:    { contains: search } },
      { email:     { contains: search, mode: 'insensitive' } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    take:    limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      mobile:    true,
      email:     true,
      role:      true,
      isActive:  true,
      createdAt: true,
      avatar:    { select: { id: true, category: true } },
    },
  })

  const items = users.length > limit ? users.slice(0, -1) : users

  // Admins see mobile masked in list (unmasked on individual profile fetch)
  const sanitized = items.map((u) => ({
    ...u,
    mobile: maskMobile(u.mobile),
  }))

  return ok({ data: sanitized })
}
