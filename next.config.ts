import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
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
  // Security headers set in Nginx; these are fallbacks for dev
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
