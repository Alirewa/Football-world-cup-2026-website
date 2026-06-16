import { NextRequest } from 'next/server'
import { z } from 'zod'
import { AvatarCategory } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'

const UpdateSchema = z.object({
  name:      z.string().min(1).max(100).optional(),
  category:  z.nativeEnum(AvatarCategory).optional(),
  sortOrder: z.number().int().optional(),
  isActive:  z.boolean().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const avatar  = await prisma.avatar.findUnique({ where: { id } })
  if (!avatar) return errors.notFound()

  return ok(avatar)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const body    = await req.json().catch(() => null)
  const parsed  = UpdateSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  const existing = await prisma.avatar.findUnique({ where: { id } })
  if (!existing) return errors.notFound()

  const updated = await prisma.avatar.update({ where: { id }, data: parsed.data })
  return ok(updated)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const existing = await prisma.avatar.findUnique({ where: { id } })
  if (!existing) return errors.notFound()

  // Check if any users reference this avatar
  const inUse = await prisma.user.count({ where: { avatarId: id } })
  if (inUse > 0) {
    return errors.conflict('Avatar is in use by users')
  }

  await prisma.avatar.delete({ where: { id } })
  return ok({ deleted: true })
}
