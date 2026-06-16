import { NextRequest } from 'next/server'
import { z } from 'zod'
import { AvatarCategory } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { ok, created, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'

const CreateSchema = z.object({
  name:      z.string().min(1).max(100),
  url:       z.string().min(1).max(500),
  category:  z.nativeEnum(AvatarCategory),
  teamId:    z.string().uuid().optional(),
  sortOrder: z.number().int().default(0),
  isActive:  z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { searchParams } = req.nextUrl
  const category = searchParams.get('category')

  const avatars = await prisma.avatar.findMany({
    where:   category ? { category: category as AvatarCategory } : undefined,
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })

  return ok({ avatars })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const body   = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  const avatar = await prisma.avatar.create({ data: parsed.data })
  return created(avatar)
}
