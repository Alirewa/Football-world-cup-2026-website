// Service Worker — WC2026 Prediction Platform
const CACHE_NAME = 'wc2026-v1'
const STATIC_ASSETS = [
  '/',
  '/fa',
  '/en',
  '/manifest.json',
  '/images/bg-stadium.jpg',
  '/images/medal-daily.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) return

  // Network first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }

  // Cache first for static assets
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|woff2|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
      )
    )
    return
  }

  // Network first for pages
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
