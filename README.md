# FIFA World Cup 2026 Prediction Platform

A full-stack match prediction platform for FIFA World Cup 2026 — built with **Next.js 15**, **TypeScript**, **Prisma**, **PostgreSQL**, and a glassmorphism UI. Persian language (RTL), dark/light mode, and mobile-first design.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **OTP Authentication** — SMS-based login via Kaveh Negar
- **Match Predictions** — Predict all 104 WC2026 matches (group stage + knockout)
- **Auto Scoring** — BullMQ worker calculates points after match finalization
- **Live Rankings** — Leaderboard with masked mobile numbers for privacy
- **Bracket Chart** — Full knockout stage bracket visualization
- **48 Teams / 12 Groups** — Complete WC2026 group data seeded
- **Admin Panel** — Manage matches, users, announcements, rules, and prizes
- **Live Sync** — Sync live results from football-data.org API
- **Dark / Light Mode** — Per-user theme preference saved to DB
- **Fully Responsive** — Optimized for mobile and desktop
- **Persian UI (RTL)** — Glassmorphism design, next-intl i18n

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3 + Glassmorphism |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Cache / Queue | Redis + BullMQ |
| Auth | JWT RS256 + OTP |
| SMS | Kaveh Negar |
| Email | Nodemailer (SMTP) |
| File Storage | AWS S3 / Arvan Cloud |
| i18n | next-intl (Persian) |
| UI Components | Radix UI + shadcn/ui |

---

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### Install

```bash
git clone https://github.com/Alirewa/Football-world-cup-2026-website.git
cd Football-world-cup-2026-website
npm install
```

### Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Minimum required values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/football
REDIS_URL=redis://localhost:6379

JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."

NATIONAL_ID_ENCRYPTION_KEY=<32-byte hex>

# Optional: live match results from football-data.org
FOOTBALL_DATA_API_KEY=
```

### Setup database

```bash
# Create tables
npx prisma db push

# Seed: 48 teams + 104 WC2026 matches
npm run db:seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test account (dev only)

| Mobile | OTP Code |
|---|---|
| `09123456789` | `1234` |

---

## Production Deployment

### Requirements

```bash
# Ubuntu 22/24
sudo apt install -y nodejs postgresql redis-server nginx
sudo npm install -g pm2 tsx
```

### Steps

```bash
git clone https://github.com/Alirewa/Football-world-cup-2026-website.git
cd Football-world-cup-2026-website
npm install
cp .env.production.template .env   # fill in all values
npx prisma migrate deploy
npm run db:seed
npm run build
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

```bash
sudo certbot --nginx -d yourdomain.com   # free SSL
```

### Cron for live match sync

```cron
*/5 * * * * curl -s -H "x-cron-secret: YOUR_CRON_SECRET" https://yourdomain.com/api/cron/sync-matches
```

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/              # Pages (Next.js App Router)
│   │   ├── page.tsx           # Homepage
│   │   ├── predictions/       # Match predictions
│   │   ├── rankings/          # Leaderboard
│   │   ├── matches/           # Match schedule + bracket
│   │   ├── auth/              # Login / Register
│   │   └── admin/             # Admin panel
│   └── api/v1/                # 50+ API routes
├── components/                # React components
├── hooks/                     # SWR data hooks
├── lib/                       # Auth, DB, sync, storage
└── store/                     # Zustand auth state
prisma/
├── schema.prisma              # Database models
└── seed/                      # WC2026 seed data
workers/
└── scoring-worker.ts          # BullMQ scoring worker
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/request-otp` | Request OTP via SMS | Public |
| POST | `/api/v1/auth/verify-otp` | Verify OTP code | Public |
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/refresh` | Refresh access token | Cookie |
| GET | `/api/v1/users/me` | Get own profile | User |
| PUT | `/api/v1/users/me` | Update profile | User |
| GET | `/api/v1/matches` | List all matches | Public |
| GET | `/api/v1/matches/bracket` | Knockout bracket | Public |
| GET | `/api/v1/teams` | Teams + groups | Public |
| GET | `/api/v1/rankings` | Public leaderboard | Public |
| GET/POST | `/api/v1/predictions` | My predictions | User |
| GET | `/api/v1/announcements` | Announcements | Public |
| GET | `/api/v1/admin/stats` | Dashboard stats | Admin |
| GET/POST | `/api/v1/admin/matches` | Manage matches | Admin |
| GET | `/api/v1/admin/users` | User list | Admin |
| GET | `/api/v1/admin/predictions` | All predictions | Admin |
| GET/POST | `/api/v1/admin/announcements` | Manage announcements | Admin |
| POST | `/api/v1/admin/sync-matches` | Trigger live sync | Admin |

---

## Scoring Worker

BullMQ worker that computes user points after each match is finalized:

```bash
npm run worker:dev    # development
pm2 start ecosystem.config.js   # production (auto-managed)
```

The app runs without it — points just won't be calculated until the worker is active.

---

## Live Data

1. Register free at [football-data.org](https://www.football-data.org/client/register)
2. Add to `.env`: `FOOTBALL_DATA_API_KEY=your_key_here`
3. Trigger sync from admin panel or wait for the cron job

---

## License

MIT
