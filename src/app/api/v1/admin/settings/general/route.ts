import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'

// Known writable general settings
const ALLOWED_KEYS = new Set([
  'site_name_fa',
  'site_name_en',
  'maintenance_mode',
  'sms_provider',
  'scoring_exact',
  'scoring_result',
  'registration_open',
  'predictions_open',
])

const UpdateSchema = z.record(z.string(), z.string())

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const rows = await prisma.siteSetting.findMany()
  const settings: Record<string, string> = {}
  for (const row of rows) settings[row.key] = row.value

  return ok({ settings })
}

export async function PUT(req: NextRequest) {
  const admin  = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const body   = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  // Only allow updating known keys
  const unknown = Object.keys(parsed.data).filter(k => !ALLOWED_KEYS.has(k))
  if (unknown.length > 0) {
    return errors.validation({ message: `Unknown settings: ${unknown.join(', ')}` })
  }

  await prisma.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where:  { key },
        update: { value },
        create: { key, value },
      })
    )
  )

  return ok({ updated: Object.keys(parsed.data) })
}
