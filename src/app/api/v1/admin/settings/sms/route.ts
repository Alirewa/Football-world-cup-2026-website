import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'

const UpdateSchema = z.object({
  provider:          z.enum(['kaveh_negar', 'disabled']).optional(),
  api_key:           z.string().optional(),
  sender:            z.string().optional(),
  template_otp:      z.string().optional(),
  fallback_enabled:  z.boolean().optional(),
})

const SENSITIVE_KEYS = new Set(['api_key'])

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

  const rows = await prisma.smsSetting.findMany()
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

  await prisma.$transaction(
    Object.entries(updates).map(([key, value]) =>
      prisma.smsSetting.upsert({
        where:  { key },
        update: { value },
        create: { key, value },
      })
    )
  )

  return ok({ updated: Object.keys(updates) })
}
