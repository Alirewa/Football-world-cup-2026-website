import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sanitizeHtml } from '@/lib/sanitize'
import { ok, errors } from '@/lib/response'
import { redis } from '@/lib/redis'

const CACHE_TTL    = 300 // 5 min
const VALID_SLUGS  = ['rules', 'prizes', 'privacy', 'terms'] as const

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  if (!VALID_SLUGS.includes(slug as typeof VALID_SLUGS[number])) {
    return errors.notFound('Page not found')
  }

  const locale = req.headers.get('x-locale') ?? 'fa'
  const cacheKey = `cms:${slug}:${locale}`

  const cached = await redis.get(cacheKey).catch(() => null)
  if (cached) return ok(JSON.parse(cached))

  const page = await prisma.cmsPage.findUnique({
    where:  { slug },
    select: {
      slug:      true,
      titleFa:   true,
      titleEn:   true,
      contentFa: true,
      contentEn: true,
      updatedAt: true,
    },
  })

  if (!page) return errors.notFound('Page not found')

  const rawContent = typeof page.contentFa === 'string' ? page.contentFa : ''
  const safeHtml   = rawContent ? sanitizeHtml(rawContent) : ''
  const title      = typeof page.titleFa === 'string' ? page.titleFa : ''

  const result = {
    slug:      page.slug,
    title,
    content:   safeHtml,
    updatedAt: page.updatedAt,
  }

  await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL).catch(() => null)


  return ok(result)
}
