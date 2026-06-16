import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:                      z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL:           z.string().url(),
  DATABASE_URL:                  z.string().min(1),

  // Redis Sentinel
  REDIS_SENTINEL_HOSTS:          z.string().min(1),
  REDIS_SENTINEL_NAME:           z.string().default('mymaster'),
  REDIS_PASSWORD:                z.string().optional(),

  // JWT RS256
  JWT_PRIVATE_KEY:               z.string().min(1),
  JWT_PUBLIC_KEY:                z.string().min(1),

  // S3 / Arvan Object Storage
  S3_ENDPOINT:                   z.string().url(),
  S3_ENDPOINT_HOSTNAME:          z.string().min(1),
  S3_REGION:                     z.string().min(1),
  S3_ACCESS_KEY:                 z.string().min(1),
  S3_SECRET_KEY:                 z.string().min(1),
  S3_BUCKET:                     z.string().min(1),
  S3_URL_EXPIRY:                 z.coerce.number().int().positive().default(900),

  // National ID encryption
  NATIONAL_ID_ENCRYPTION_KEY:    z.string().length(64),

  // Kaveh Negar
  KAVEH_NEGAR_API_KEY:           z.string().min(1),
  KAVEH_NEGAR_SENDER:            z.string().min(1),
  KAVEH_NEGAR_TEMPLATE_OTP:      z.string().min(1),
  KAVEH_NEGAR_WEBHOOK_SECRET:    z.string().min(1),

  // Rate limits
  OTP_MAX_PER_MOBILE_PER_15MIN:   z.coerce.number().int().positive().default(5),
  OTP_LOCKOUT_MAX_FAILURES_PER_HOUR: z.coerce.number().int().positive().default(5),
  OTP_LOCKOUT_DURATION_SECONDS:   z.coerce.number().int().positive().default(3600),
  OTP_SESSION_EXPIRY_SECONDS:     z.coerce.number().int().positive().default(120),
  OTP_MAX_ATTEMPTS_PER_SESSION:   z.coerce.number().int().positive().default(3),

  // Cloudflare Turnstile
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY:           z.string().min(1),

  // SMTP email (optional — also configurable via admin panel in DB)
  SMTP_HOST:    z.string().optional(),
  SMTP_PORT:    z.coerce.number().int().positive().default(587),
  SMTP_USER:    z.string().optional(),
  SMTP_PASS:    z.string().optional(),
  SMTP_FROM:    z.string().optional(),
  SMTP_SECURE:  z.string().transform(v => v === 'true').default('false'),

  // football-data.org API (free tier — auto-sync match results)
  FOOTBALL_DATA_API_KEY:          z.string().optional().default(''),

  // Feature flags
  MAINTENANCE_MODE:               z.string().transform(v => v === 'true').default('false'),
})

function parseEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    console.error(result.error.flatten().fieldErrors)
    throw new Error('Missing or invalid environment variables — check .env.example')
  }
  return result.data
}

// Singleton — parsed once at module load
export const env = parseEnv()
export type Env = z.infer<typeof envSchema>
