# Production Deployment Guide

World Cup 2026 Prediction Platform — step-by-step deployment for two environments.

---

## Prerequisites (both options)

- Domain `football.ir` DNS A record → server IP
- Arvan Cloud S3 bucket created (`football-assets` and `football-assets-backups`)
- Kaveh Negar account with OTP template configured
- Cloudflare Turnstile site/secret key pair

---

## Option A: Linux VPS + Docker Compose

### 1. Server Setup (Ubuntu 22.04)

```bash
# Update and install Docker
apt-get update && apt-get upgrade -y
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Install Compose plugin
apt-get install -y docker-compose-plugin

# Firewall: only SSH, HTTP, HTTPS
ufw default deny incoming
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Install fail2ban
apt-get install -y fail2ban
systemctl enable --now fail2ban

# App directory
mkdir -p /opt/football /var/log/football
```

### 2. Clone Repository

```bash
cd /opt/football
git clone https://github.com/your-org/football.git .
```

### 3. Generate Secrets

```bash
# RS256 JWT keys
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Show private key with escaped newlines (for .env)
awk '{printf "%s\\n", $0}' private.pem

# AES-256 key for national ID encryption (32 bytes)
openssl rand -hex 32

# Strong passwords
openssl rand -base64 32   # for POSTGRES_PASSWORD
openssl rand -base64 32   # for REDIS_PASSWORD
```

### 4. Configure Environment

```bash
cp .env.production.template .env
nano .env   # fill all <placeholder> values
```

Key fields to fill:
- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` — paste output from step 3 (newlines as `\n`)
- `NATIONAL_ID_ENCRYPTION_KEY` — 64 hex chars from `openssl rand -hex 32`
- `POSTGRES_PASSWORD` / `REDIS_PASSWORD` — strong random passwords
- `DATABASE_URL` — replace `<password>` with `POSTGRES_PASSWORD` value
- All `KAVEH_NEGAR_*`, `S3_*`, `SMTP_*`, `TURNSTILE_*` values

### 5. SSL Certificates

```bash
cd /opt/football
sudo bash scripts/ssl-setup.sh football.ir admin@football.ir
```

### 6. Database Init + Start Services

```bash
cd /opt/football

# Start database first and wait for it to be ready
docker compose -f docker/docker-compose.prod.yml up postgres -d
sleep 15

# Run migrations and seed
docker compose -f docker/docker-compose.prod.yml run --rm nextjs \
  sh -c "npx prisma migrate deploy && npx prisma db seed"

# Start all services
docker compose -f docker/docker-compose.prod.yml up -d
```

### 7. Verify Deployment

```bash
# Check all services are healthy
docker compose -f docker/docker-compose.prod.yml ps

# Health endpoint
curl -sf https://football.ir/api/v1/health | python3 -m json.tool

# Logs
docker compose -f docker/docker-compose.prod.yml logs -f nextjs
```

### 8. Cron Jobs

Add to root crontab (`sudo crontab -e`):

```cron
# SSL auto-renewal (3 AM daily)
0 3 * * * /opt/football/scripts/ssl-renew.sh >> /var/log/football/ssl-renew.log 2>&1

# Health monitoring (every 5 minutes)
*/5 * * * * bash -c 'source /opt/football/.env && /opt/football/scripts/health-check.sh' >> /var/log/football/health.log 2>&1
```

### 9. GitHub Actions CI/CD

Add these secrets in your GitHub repository settings:

| Secret | Value |
|--------|-------|
| `SSH_HOST` | VPS IP address |
| `SSH_USER` | `root` or deploy user |
| `SSH_PRIVATE_KEY` | Deploy SSH private key |
| `GHCR_TOKEN` | GitHub personal access token (write:packages) |
| `NEXT_PUBLIC_APP_URL` | `https://football.ir` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |

Push to `main` → auto-deploys to staging. Tag `v*` → auto-deploys to production.

### Update Procedure

```bash
cd /opt/football
git pull

# Rolling restart (zero-downtime with Docker's replicas)
docker compose -f docker/docker-compose.prod.yml pull
docker compose -f docker/docker-compose.prod.yml up -d --remove-orphans

# Run migrations if schema changed
docker compose -f docker/docker-compose.prod.yml run --rm nextjs npx prisma migrate deploy
```

### Rollback Procedure

```bash
# Redeploy previous image tag
IMAGE_TAG=v1.2.3 docker compose -f docker/docker-compose.prod.yml up -d nextjs worker

# Or restore database from backup
bash scripts/db-restore.sh football_20260612_030000.sql.gz
```

---

## Option B: Shared Hosting + PM2

### 1. Prerequisites

```bash
# Install Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2 and tsx globally
npm i -g pm2 tsx

# Verify system has PostgreSQL 16 and Redis 7
psql --version
redis-cli --version
```

### 2. App Setup

```bash
git clone https://github.com/your-org/football.git ~/football
cd ~/football

# Install dependencies (no dev tools needed)
npm ci --frozen-lockfile

# Generate Prisma client
npx prisma generate

# Set environment variables BEFORE building (NEXT_PUBLIC_* are baked at build time)
cp .env.production.template .env
nano .env   # fill all values

# Build Next.js (reads NEXT_PUBLIC_* from .env)
npm run build
```

### 3. Database Setup

```bash
# Create database (adjust for your hosting's PostgreSQL setup)
createdb football

# Run migrations
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

### 4. Start with PM2

```bash
cd ~/football

# Create log directory
mkdir -p /var/log/football

# Start both processes
pm2 start ecosystem.config.js --env production

# Save process list (survives reboots)
pm2 save

# Auto-start on server boot
pm2 startup   # follow the command it outputs
```

### 5. Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/football
server {
    listen 80;
    server_name football.ir www.football.ir;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name football.ir www.football.ir;

    ssl_certificate     /etc/letsencrypt/live/football.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/football.ir/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/football /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Get SSL certificate (auto-configures nginx)
certbot --nginx -d football.ir -d www.football.ir
```

### 6. Update Procedure

```bash
cd ~/football
git pull
npm ci
npm run build           # re-bakes NEXT_PUBLIC_* vars from .env
npx prisma migrate deploy
pm2 reload ecosystem.config.js --env production
```

### 7. PM2 Commands

```bash
pm2 status              # show all processes
pm2 logs football-web   # tail web logs
pm2 logs football-worker
pm2 monit               # live CPU/memory dashboard
pm2 restart all
pm2 stop all
```

---

## Post-Deploy Checklist

- [ ] `curl -sf https://football.ir/api/v1/health` returns `{"status":"ok"}`
- [ ] Registration flow: enter mobile → receive OTP SMS within 30s → account created
- [ ] Prediction submission: Turnstile widget visible → prediction saved
- [ ] Admin panel: `/admin` loads for admin account, shows stats
- [ ] Live scores: finalize a match in admin → score updates in predictions page via SSE
- [ ] SSL grade: A+ at [SSL Labs](https://www.ssllabs.com/ssltest/)
- [ ] Database backup: manually run backup script → file appears in Arvan S3 console
- [ ] Health check cron: check `/var/log/football/health.log` after 5 minutes
