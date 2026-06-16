import sharp from 'sharp'

// Allowed image magic bytes
const MAGIC_BYTES: Record<string, Buffer> = {
  'image/jpeg': Buffer.from([0xff, 0xd8, 0xff]),
  'image/png':  Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  'image/webp': Buffer.from([0x52, 0x49, 0x46, 0x46]),
  'image/gif':  Buffer.from([0x47, 0x49, 0x46, 0x38]),
}

const MAX_FILE_SIZE = 500 * 1024 // 500 KB
const OUTPUT_SIZE   = 256        // Avatar output: 256×256 px

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageValidationError'
  }
}

/**
 * Validate and process an avatar upload:
 *  1. Enforce 500 KB size limit
 *  2. Verify magic bytes (reject renamed files)
 *  3. Decode through sharp (rejects corrupt/non-image data)
 *  4. Strip all EXIF metadata (GPS, device info)
 *  5. Resize to 256×256 (cover, no upscaling)
 *  6. Re-encode as WebP (consistent format, smaller size)
 *
 * @returns Buffer of the safe WebP image
 */
export async function processAvatarUpload(input: Buffer): Promise<Buffer> {
  // 1. Size check (before any processing)
  if (input.length > MAX_FILE_SIZE) {
    throw new ImageValidationError(`File too large: max ${MAX_FILE_SIZE / 1024}KB`)
  }

  // 2. Magic byte validation
  const detectedType = detectMimeType(input)
  if (!detectedType) {
    throw new ImageValidationError('Invalid image format — only JPEG, PNG, WebP, GIF allowed')
  }

  // 3–6. Process through sharp
  try {
    const output = await sharp(input, { failOn: 'error' })
      .rotate()                // auto-orient from EXIF before stripping
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit:         'cover',
        withoutEnlargement: true,
      })
      .withMetadata({})        // strip all metadata (pass empty object = strip EXIF)
      .webp({ quality: 85 })
      .toBuffer()

    return output
  } catch (err) {
    throw new ImageValidationError(
      `Invalid or corrupt image: ${err instanceof Error ? err.message : 'unknown error'}`
    )
  }
}

function detectMimeType(buffer: Buffer): string | null {
  for (const [mime, magic] of Object.entries(MAGIC_BYTES)) {
    if (buffer.subarray(0, magic.length).equals(magic)) {
      return mime
    }
  }
  return null
}
