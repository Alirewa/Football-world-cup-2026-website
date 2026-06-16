import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { ok, errors } from '@/lib/response'
import { getSignedObjectUrl, avatarKey } from '@/lib/storage'
import { maskMobile } from '@/lib/validators/mobile'
import { validateNationalId } from '@/lib/validators/national-id'
import { encryptNationalId } from '@/lib/db/pii.service'

// ── GET /api/v1/users/me ──────────────────────────────────────

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return errors.unauthorized()

  const user = await prisma.user.findUnique({
    where:  { id: userId, deletedAt: null },
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      mobile:    true,
      email:     true,
      role:      true,
      locale:    true,
      theme:     true,
      createdAt: true,
      avatar:    { select: { id: true, url: true, category: true } },
    },
  })

  if (!user) return errors.notFound('User not found')

  let avatarUrl: string | null = null
  if (user.avatar?.url) {
    avatarUrl = await getSignedObjectUrl(avatarKey(user.avatar.id)).catch(() => null)
  }

  return ok({
    id:        user.id,
    firstName: user.firstName,
    lastName:  user.lastName,
    // Mobile returned to own profile (NOT in rankings)
    mobile:    maskMobile(user.mobile),
    email:     user.email,
    role:      user.role,
    locale:    user.locale,
    theme:     user.theme,
    createdAt: user.createdAt,
    avatar:    user.avatar ? { id: user.avatar.id, category: user.avatar.category, url: avatarUrl } : null,
  })
}

// ── PUT /api/v1/users/me ──────────────────────────────────────

const updateSchema = z.object({
  firstName:  z.string().min(2).max(50).trim().optional(),
  lastName:   z.string().min(2).max(50).trim().optional(),
  email:      z.string().email().optional().or(z.literal('')),
  nationalId: z.string().length(10).regex(/^\d{10}$/).optional(),
  avatarId:   z.string().uuid().optional().or(z.null()),
  locale:     z.enum(['fa']).optional(),
  theme:      z.enum(['dark', 'light']).optional(),
})

export async function PUT(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return errors.unauthorized()

  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await req.json())
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0]?.message : 'Invalid input'
    return errors.unprocessable(msg ?? 'Invalid input')
  }

  // Validate avatarId belongs to a real avatar
  if (body.avatarId) {
    const avatarExists = await prisma.avatar.findUnique({ where: { id: body.avatarId } })
    if (!avatarExists) return errors.unprocessable('آواتار انتخابی وجود ندارد')
  }

  // Validate national ID checksum
  if (body.nationalId && !validateNationalId(body.nationalId)) {
    return errors.unprocessable('کد ملی نامعتبر است')
  }

  let nationalIdFields = {}
  if (body.nationalId) {
    const { enc, iv } = encryptNationalId(body.nationalId)
    nationalIdFields = { nationalIdEnc: enc, nationalIdIv: iv }
  }

  const updated = await prisma.user.update({
    where: { id: userId, deletedAt: null },
    data:  {
      ...(body.firstName  !== undefined && { firstName: body.firstName }),
      ...(body.lastName   !== undefined && { lastName: body.lastName }),
      ...(body.email      !== undefined && { email: body.email || null }),
      ...(body.avatarId   !== undefined && { avatarId: body.avatarId }),
      ...(body.locale     !== undefined && { locale: body.locale }),
      ...(body.theme      !== undefined && { theme: body.theme }),
      ...nationalIdFields,
    },
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      mobile:    true,
      email:     true,
      role:      true,
      locale:    true,
      theme:     true,
      createdAt: true,
      avatar:    { select: { id: true, url: true, category: true } },
    },
  })

  let avatarUrl: string | null = null
  if (updated.avatar?.url) {
    avatarUrl = await getSignedObjectUrl(avatarKey(updated.avatar.id)).catch(() => null)
  }

  logger.info({ userId }, 'User profile updated')
  return ok({
    id:        updated.id,
    firstName: updated.firstName,
    lastName:  updated.lastName,
    mobile:    maskMobile(updated.mobile),
    email:     updated.email,
    role:      updated.role,
    locale:    updated.locale,
    theme:     updated.theme,
    createdAt: updated.createdAt,
    avatar:    updated.avatar
      ? { id: updated.avatar.id, category: updated.avatar.category, url: avatarUrl }
      : null,
  })
}

// ── DELETE /api/v1/users/me — soft-delete (GDPR) ─────────────

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return errors.unauthorized()

  await prisma.user.update({
    where: { id: userId },
    data:  {
      deletedAt:     new Date(),
      isActive:      false,
      // Anonymize PII
      email:         null,
      nationalIdEnc: '',
      nationalIdIv:  '',
    },
  })

  logger.info({ userId }, 'User account soft-deleted')

  const { noContent } = await import('@/lib/response')
  return noContent()
}
