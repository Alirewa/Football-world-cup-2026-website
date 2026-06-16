import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { env } from './env'
import { logger } from './logger'

let _s3: S3Client | null = null

export function getS3Client(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      endpoint:        env.S3_ENDPOINT,
      region:          env.S3_REGION,
      credentials: {
        accessKeyId:     env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true, // required for MinIO & Arvan
    })
  }
  return _s3
}

/**
 * Upload a buffer to object storage.
 * @returns The object key (stored in DB, not a full URL)
 */
export async function uploadObject(opts: {
  key:         string
  body:        Buffer
  contentType: string
}): Promise<string> {
  const client = getS3Client()

  await client.send(new PutObjectCommand({
    Bucket:      env.S3_BUCKET,
    Key:         opts.key,
    Body:        opts.body,
    ContentType: opts.contentType,
    // Objects are NOT public — accessed only via signed URLs
  }))

  logger.info({ key: opts.key }, 'Object uploaded to storage')
  return opts.key
}

/**
 * Generate a signed URL for a stored object.
 * Valid for env.S3_URL_EXPIRY seconds (default 15 min).
 * All avatar access goes through this — no public URLs.
 */
export async function getSignedObjectUrl(key: string): Promise<string> {
  const client = getS3Client()

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key:    key,
  })

  return getSignedUrl(client, command, { expiresIn: env.S3_URL_EXPIRY })
}

/**
 * Delete an object from storage (e.g., when admin replaces an avatar).
 */
export async function deleteObject(key: string): Promise<void> {
  const client = getS3Client()

  await client.send(new DeleteObjectCommand({
    Bucket: env.S3_BUCKET,
    Key:    key,
  }))

  logger.info({ key }, 'Object deleted from storage')
}

/** Build an avatar object key from its ID */
export function avatarKey(avatarId: string): string {
  return `avatars/${avatarId}.webp`
}

/** Build a flag object key from FIFA code */
export function flagKey(fifaCode: string): string {
  return `flags/${fifaCode.toLowerCase()}.webp`
}
