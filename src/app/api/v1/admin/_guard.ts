/**
 * Admin guard — re-verifies role from DB on every admin handler call.
 * Middleware JWT check is NOT sufficient because role may have changed
 * after the token was issued without a refresh cycle.
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { errors } from '@/lib/response'
import type { NextResponse } from 'next/server'
import type { ApiError } from '@/lib/response'

export async function requireAdmin(
  req: NextRequest,
): Promise<{ adminId: string } | NextResponse<ApiError>> {
  const userId = req.headers.get('x-user-id')
  const role   = req.headers.get('x-user-role')

  // Fast-path: middleware already verified the JWT; role is 'admin' in token
  // But we MUST re-verify from DB (token may be stale after role downgrade)
  if (!userId || role !== 'admin') {
    return errors.forbidden('Admin access required')
  }

  const user = await prisma.user.findUnique({
    where:  { id: userId, deletedAt: null, isActive: true },
    select: { role: true },
  })

  if (!user || user.role !== 'admin') {
    return errors.forbidden('Admin access required')
  }

  return { adminId: userId }
}

/** Type guard — if result has adminId, guard passed */
export function isAdminGuardError(
  result: { adminId: string } | Awaited<ReturnType<typeof errors.forbidden>>,
): result is Awaited<ReturnType<typeof errors.forbidden>> {
  return !('adminId' in result)
}
