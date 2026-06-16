/**
 * PII Service — the ONLY place in the codebase where national IDs are decrypted.
 * Every decryption is logged to pii_access_log for audit compliance.
 *
 * Encryption: AES-256-GCM with a per-record random 12-byte IV.
 * Key source: env.NATIONAL_ID_ENCRYPTION_KEY (must be in Arvan Vault in production).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { prisma } from './prisma'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const ALGORITHM   = 'aes-256-gcm'
const KEY_BUFFER  = Buffer.from(env.NATIONAL_ID_ENCRYPTION_KEY, 'hex')
const IV_LENGTH   = 12  // 96-bit IV for GCM
const TAG_LENGTH  = 16  // 128-bit auth tag

// ── Encryption ────────────────────────────────────────────────

export function encryptNationalId(nationalId: string): { enc: string; iv: string } {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, KEY_BUFFER, iv)

  const encrypted = Buffer.concat([
    cipher.update(nationalId, 'utf8'),
    cipher.final(),
    cipher.getAuthTag(),
  ])

  return {
    enc: encrypted.toString('base64'),
    iv:  iv.toString('base64'),
  }
}

// ── Decryption ────────────────────────────────────────────────

function decrypt(enc: string, ivB64: string): string {
  const encBuffer = Buffer.from(enc, 'base64')
  const iv        = Buffer.from(ivB64, 'base64')

  // Last TAG_LENGTH bytes are the GCM auth tag
  const authTag   = encBuffer.subarray(encBuffer.length - TAG_LENGTH)
  const ciphertext = encBuffer.subarray(0, encBuffer.length - TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, KEY_BUFFER, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

/**
 * Decrypt a user's national ID.
 * Logs every access to pii_access_log.
 *
 * @param accessorId - the admin/user requesting the data
 * @param targetUserId - whose national ID is being read
 * @param reason - why it's being accessed (stored in audit log)
 */
export async function decryptNationalId(opts: {
  accessorId:   string
  targetUserId: string
  reason:       string
}): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where:  { id: opts.targetUserId },
    select: { nationalIdEnc: true, nationalIdIv: true },
  })

  if (!user?.nationalIdEnc || !user.nationalIdIv) return null

  // Log BEFORE decryption — if we crash after, the log still exists
  await prisma.piiAccessLog.create({
    data: {
      accessorId:     opts.accessorId,
      accessedUserId: opts.targetUserId,
      reason:         opts.reason,
    },
  })

  try {
    const plaintext = decrypt(user.nationalIdEnc, user.nationalIdIv)
    logger.info({ accessorId: opts.accessorId, targetUserId: opts.targetUserId }, 'National ID decrypted')
    return plaintext
  } catch (err) {
    logger.error({ err, targetUserId: opts.targetUserId }, 'National ID decryption failed')
    return null
  }
}
