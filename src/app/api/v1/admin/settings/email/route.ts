import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'

const UpdateSchema = z.object({
  enabled:     z.boolean().optional(),
  smtp_host:   z.string().optional(),
  smtp_port:   z.coerce.number().int().positive().optional(),
  smtp_user:   z.string().optional(),
  smtp_pass:   z.string().optional(),
  smtp_from:   z.string().optional(),
  smtp_secure: z.boolean().optional(),
})

const SENSITIVE_KEYS = new Set(['smtp_pass'])

function maskSensitive(settings: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(settings)) {
    result[k] = SENSITIVE_KEYS.has(k) && v ? '***' : v
  }
  return result
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const rows = await prisma.emailSetting.findMany()
  const settings: Record<string, string> = {}
  for (const row of rows) settings[row.key] = row.value

  return ok({ settings: maskSensitive(settings) })
}

export async function PUT(req: NextRequest) {
  const admin  = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const body   = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  const updates: Record<string, string> = {}
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      updates[key] = String(value)
    }
  }

  // Upsert each key
  await prisma.$transaction(
    Object.entries(updates).map(([key, value]) =>
      prisma.emailSetting.upsert({
        where:  { key },
        update: { value },
        create: { key, value },
      })
    )
  )

  return ok({ updated: Object.keys(updates) })
}
