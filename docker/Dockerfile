# ── Stage 1: deps ────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install native deps (sharp, bcrypt)
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
COPY prisma/schema.prisma ./prisma/

RUN npm ci --frozen-lockfile

# ── Stage 2: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# NEXT_PUBLIC_* vars must be baked at build time (not available at runtime in standalone mode)
# Pass via: docker build --build-arg NEXT_PUBLIC_APP_URL=https://football.ir ...
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME_FA
ARG NEXT_PUBLIC_APP_NAME_EN
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME_FA=$NEXT_PUBLIC_APP_NAME_FA
ENV NEXT_PUBLIC_APP_NAME_EN=$NEXT_PUBLIC_APP_NAME_EN
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Build Next.js
RUN npm run build

# ── Stage 3: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Public assets
COPY --from=builder /app/public ./public

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

# Prisma engine (needed for migrations)
COPY --from=builder /app/node_modules/.prisma           ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma           ./node_modules/@prisma
COPY --from=builder /app/prisma                         ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "server.js"]
