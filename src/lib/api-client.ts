/**
 * API client — wraps fetch with:
 * 1. Bearer token injection from Zustand auth store
 * 2. Automatic token refresh on 401 (one retry)
 * 3. Typed error throwing on non-2xx
 */

import { useAuthStore } from '@/store/auth'

export class ApiError extends Error {
  constructor(
    public status:  number,
    public code:    string | undefined,
    message:        string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options

  // GitHub Pages demo build has no backend — resolve against fixture data instead.
  if (isDemoMode) {
    const { mockRequest } = await import('@/lib/demo/mock-router')
    const method = fetchOptions.method ?? 'GET'
    const body   = typeof fetchOptions.body === 'string' ? JSON.parse(fetchOptions.body) : undefined
    try {
      return (await mockRequest(url, method, body)) as T
    } catch (err) {
      const status = (err as { status?: number }).status ?? 404
      throw new ApiError(status, 'NOT_FOUND', 'این بخش در دموی استاتیک شبیه‌سازی نشده است')
    }
  }

  const store = useAuthStore.getState()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': 'fa',
    ...((fetchOptions.headers as Record<string, string>) ?? {}),
  }

  if (!skipAuth && store.accessToken) {
    headers['Authorization'] = `Bearer ${store.accessToken}`
  }

  let res = await fetch(url, { ...fetchOptions, headers })

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    const refreshed = await store.refresh()
    if (refreshed) {
      const newToken = useAuthStore.getState().accessToken
      if (newToken) headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(url, { ...fetchOptions, headers })
    }
  }

  if (!res.ok) {
    let body: { error?: string; code?: string } = {}
    try { body = await res.json() } catch { /* ignore parse error */ }
    throw new ApiError(res.status, body.code, body.error ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T

  const json = await res.json()
  // Unwrap { success: true, data: T } envelope
  return json.data !== undefined ? json.data : json
}

export const api = {
  get:    <T>(url: string, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'GET' }),

  post:   <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),

  put:    <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'PUT', body: JSON.stringify(body) }),

  patch:  <T>(url: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(url: string, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'DELETE' }),
}
