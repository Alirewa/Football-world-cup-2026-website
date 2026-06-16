import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'

const UpdateLanguageSchema = z.object({
  code:       z.string().min(2).max(5),
  name:       z.string().min(1).max(50).optional(),
  nativeName: z.string().min(1).max(50).optional(),
  direction:  z.enum(['ltr', 'rtl']).optional(),
  isActive:   z.boolean().optional(),
  isDefault:  z.boolean().optional(),
  sortOrder:  z.number().int().optional(),
})

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const languages = await prisma.language.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return ok({ languages })
}

export async function PUT(req: NextRequest) {
  const admin  = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const body = await req.json().catch(() => null)

  // Accept either a single language update or an array
  const input = Array.isArray(body) ? body : [body]
  const results = []

  for (const item of input) {
    const parsed = UpdateLanguageSchema.safeParse(item)
    if (!parsed.success) return errors.validation(parsed.error.flatten())

    const { code, ...data } = parsed.data

    // If setting a new default, clear old default first
    if (data.isDefault) {
      await prisma.language.updateMany({
        where: { isDefault: true, NOT: { code } },
        data:  { isDefault: false },
      })
    }

    const lang = await prisma.language.upsert({
      where:  { code },
      update: data,
      create: { code, name: data.name ?? code, nativeName: data.nativeName ?? code, ...data },
    })

    results.push(lang)
  }

  return ok({ languages: results })
}
