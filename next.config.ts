import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Static GitHub Pages demo build — no Node server, no DB/Redis, no API routes.
// See scripts/build-demo.mjs (moves src/app/api + src/middleware.ts aside before
// running `next build` with this flag set, then restores them).
const isDemoExport = process.env.DEMO_EXPORT === 'true'
const demoBasePath = '/Football-world-cup-2026-website'

const nextConfig: NextConfig = {
  output: isDemoExport ? 'export' : 'standalone',
  ...(isDemoExport && {
    basePath:    demoBasePath,
    assetPrefix: `${demoBasePath}/`,
  }),
  images: isDemoExport
    ? { unoptimized: true }
    : {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: process.env.S3_ENDPOINT_HOSTNAME ?? 'localhost',
            port: '',
            pathname: '/**',
          },
        ],
        formats: ['image/webp', 'image/avif'],
      },
  // Security headers set in Nginx; these are fallbacks for dev.
  // Not applicable to static export (no server to attach headers to).
  ...(!isDemoExport && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          ],
        },
      ]
    },
  }),
  // Next.js 15: moved out of experimental
  serverExternalPackages: ['pino', 'pino-pretty', 'sharp', 'nodemailer'],
  // Logging via pino — disable Next.js default fetch logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
}

export default withNextIntl(nextConfig)
