import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'
import { processAvatarUpload } from '@/lib/image'
import { uploadObject } from '@/lib/storage'

// Allowed image magic bytes (first bytes of the file)
const MAGIC_BYTES: Record<string, Buffer> = {
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
  png:  Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  webp: Buffer.from([0x52, 0x49, 0x46, 0x46]),
  gif:  Buffer.from([0x47, 0x49, 0x46, 0x38]),
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

type Params = { params: Promise<{ id: string }> }

function detectImageType(buffer: Buffer): string | null {
  for (const [type, magic] of Object.entries(MAGIC_BYTES)) {
    if (buffer.subarray(0, magic.length).equals(magic)) return type
  }
  return null
}

export async function POST(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const { id } = await params
  const existing = await prisma.avatar.findUnique({ where: { id } })
  if (!existing) return errors.notFound()

  const formData = await req.formData().catch(() => null)
  if (!formData) return errors.validation({ message: 'Invalid form data' })

  const file = formData.get('file')
  if (!file || !(file instanceof Blob)) {
    return errors.validation({ message: 'No file provided' })
  }

  if (file.size > MAX_FILE_SIZE) {
    return errors.validation({ message: 'File exceeds 2MB limit' })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)

  // Magic byte check — reject disguised files
  const imageType = detectImageType(buffer)
  if (!imageType) {
    return errors.validation({ message: 'File is not a recognized image type' })
  }

  // Process: resize to 256×256 WebP, strip EXIF
  let webpBuffer: Buffer
  try {
    webpBuffer = await processAvatarUpload(buffer)
  } catch {
    return errors.validation({ message: 'Image processing failed' })
  }

  // Upload to object storage
  const storageKey = `avatars/${id}.webp`
  let publicUrl: string
  try {
    publicUrl = await uploadObject({
      key:         storageKey,
      body:        webpBuffer,
      contentType: 'image/webp',
    })
  } catch {
    return errors.internal('Storage upload failed')
  }

  // Update avatar record with new URL
  const updated = await prisma.avatar.update({
    where: { id },
    data:  { url: publicUrl },
  })

  return ok({ url: updated.url })
}
