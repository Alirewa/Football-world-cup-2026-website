import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'
import createMiddleware from 'next-intl/middleware'

// ── Locale middleware (next-intl) ─────────────────────────────

const intlMiddleware = createMiddleware({
  locales:       ['fa'],
  defaultLocale: 'fa',
  localePrefix:  'as-needed',
})

// ── Route classification ──────────────────────────────────────

// These paths (without locale prefix) are publicly accessible without auth
const PUBLIC_PATH_PATTERNS = [
  /^\/$/,
  /^\/rules$/,
  /^\/prizes$/,
  /^\/privacy$/,
  /^\/terms$/,
  /^\/auth\//,
  /^\/api\/v1\/auth\//,
  /^\/api\/v1\/health$/,
  /^\/api\/v1\/cms\//,
  /^\/api\/v1\/matches(\/.*)?$/,       // read-only match list + bracket (GET)
  /^\/api\/v1\/rankings$/,             // public ranking (masked)
  /^\/api\/v1\/prizes$/,              // public prize list
  /^\/api\/v1\/rules$/,               // public rules
  /^\/api\/v1\/announcements(\/.*)?$/, // public announcements
  /^\/api\/v1\/teams$/,               // public team+group list
  /^\/api\/cron\//,                   // cron jobs — protected by CRON_SECRET header
  /^\/_next\//,
  /^\/fonts\//,
  /^\/images\//,
  /^\/favicon\.ico$/,
]

// Paths that start with /admin require role=admin
const ADMIN_PATH_PATTERNS = [
  /^\/admin\//,
  /^\/admin$/,
  /^\/api\/v1\/admin\//,
]

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix (/fa/..., /en/...) before matching
  const stripped = pathname.replace(/^\/fa/, '') || '/'
  return PUBLIC_PATH_PATTERNS.some((p) => p.test(stripped))
}

function isAdminPath(pathname: string): boolean {
  const stripped = pathname.replace(/^\/fa/, '') || '/'
  return ADMIN_PATH_PATTERNS.some((p) => p.test(stripped))
}

// ── JWT extraction ────────────────────────────────────────────

function extractAccessToken(req: NextRequest): string | null {
  // 1. Authorization: Bearer <token>  (API routes)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // 2. Cookie: access_token  (SSR page routes — set by auth flow)
  const cookie = req.cookies.get('access_token')
  if (cookie?.value) {
    return cookie.value
  }
  return null
}

// ── Main middleware ───────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Let next-intl handle locale routing (rewrites, redirects)
  // For non-locale paths like /api/*, skip intl middleware
  const isApiRoute = pathname.startsWith('/api/')
  if (!isApiRoute) {
    const intlResponse = intlMiddleware(req)
    // If intl middleware returned a redirect (locale negotiation), use it
    if (intlResponse.status === 307 || intlResponse.status === 308 || intlResponse.status === 301 || intlResponse.status === 302) {
      return intlResponse
    }
  }

  // Skip auth checks for Next.js internals + static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/images/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Public paths — no auth required
  if (isPublicPath(pathname)) {
    if (!isApiRoute) {
      return intlMiddleware(req)
    }
    return NextResponse.next()
  }

  // ── Page routes: auth is handled client-side by AuthGuard + AuthHydrator
  //    Middleware only enforces auth on API routes (Bearer token in Authorization header)
  if (!isApiRoute) {
    return intlMiddleware(req)
  }

  // ── API routes: enforce JWT ───────────────────────────────────
  const token = extractAccessToken(req)

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  let payload: Awaited<ReturnType<typeof verifyAccessToken>>
  try {
    payload = await verifyAccessToken(token)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Token expired or invalid', code: 'TOKEN_INVALID' },
      { status: 401 },
    )
  }

  // Admin-only API paths — role check
  if (isAdminPath(pathname)) {
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 },
      )
    }
  }

  // Forward user identity to route handlers via request headers
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-id',   payload.sub)
  requestHeaders.set('x-user-role', payload.role)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('x-locale', 'fa')
  return response
}

export const config = {
  matcher: [
    // All routes except static files handled by Next.js
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
