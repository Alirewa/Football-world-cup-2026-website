import { NextResponse } from 'next/server'

// ── Standard API response envelope ───────────────────────────

export interface ApiSuccess<T> {
  success: true
  data:    T
}

export interface ApiError {
  success: false
  error:   string
  code?:   string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, 201)
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function err(
  error: string,
  status = 400,
  code?: string,
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error, code }, { status })
}

export const errors = {
  badRequest:       (msg = 'Bad request')           => err(msg, 400),
  unauthorized:     (msg = 'Unauthorized')           => err(msg, 401, 'UNAUTHORIZED'),
  forbidden:        (msg = 'Forbidden')              => err(msg, 403, 'FORBIDDEN'),
  notFound:         (msg = 'Not found')              => err(msg, 404, 'NOT_FOUND'),
  conflict:         (msg = 'Conflict')               => err(msg, 409, 'CONFLICT'),
  unprocessable:    (msg = 'Validation error')       => err(msg, 422, 'UNPROCESSABLE'),
  validation:       (detail: unknown)                => err(typeof detail === 'string' ? detail : (detail as { message?: string })?.message ?? 'Validation error', 422, 'UNPROCESSABLE'),
  tooManyRequests:  (msg = 'Too many requests')      => err(msg, 429, 'RATE_LIMITED'),
  internal:         (msg = 'Internal server error')  => err(msg, 500, 'INTERNAL'),
  maintenance:      ()                               => err('Platform under maintenance', 503, 'MAINTENANCE'),
}

// ── Header helpers ────────────────────────────────────────────

export function withCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin',  process.env.NEXT_PUBLIC_APP_URL ?? '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}
