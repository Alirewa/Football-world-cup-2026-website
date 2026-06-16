# راهنمای دپلوی روی هاست چابکان
## پروژه پیش‌بینی جام جهانی ۲۰۲۶

---

## پاسخ سریع: کدام سرویس؟

**توصیه: سرویس Next.js** — ساده‌ترین راه برای بالا آوردن فرانت‌اند.

اما این پروژه به **PostgreSQL** و **Redis** هم نیاز دارد. پس باید ۳ سرویس جداگانه بگیری:

| سرویس | کجا |
|-------|-----|
| **Next.js** (وب اپ) | چابکان — پلتفرم Next.js |
| **PostgreSQL** | چابکان مدیریت‌شده یا Neon.tech (رایگان) |
| **Redis** | Upstash.com (رایگان) یا چابکان |
| **Worker** | چابکان — پلتفرم Node.js (جداگانه) |

---

## گزینه A: Next.js + دیتابیس‌های مدیریت‌شده (ساده‌ترین)

### مرحله ۱: دیتابیس PostgreSQL رایگان

روی **[Neon.tech](https://neon.tech)** ثبت‌نام کن (رایگان):

```
1. New Project → نام: football
2. Region: Europe West (نزدیک‌ترین به ایران)
3. Connection string را کپی کن:
   postgresql://user:pass@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### مرحله ۲: Redis رایگان

روی **[Upstash.com](https://upstash.com)** ثبت‌نام کن:

```
1. Create Database → نام: football-redis
2. Region: eu-west-1
3. Connection string: rediss://default:xxx@xxx.upstash.io:6379
```

> ⚠️ چون Upstash TLS دارد، باید در کد Redis connection رو با `tls: true` تنظیم کنی.

### مرحله ۳: آماده‌سازی پروژه برای Next.js standalone

مطمئن شو `next.config.ts` حاوی این است:

```typescript
output: 'standalone'
```

### مرحله ۴: ساختن ریپو گیت

```bash
# اگر ریپو گیت نداری:
cd "D:/VSCODE Project/Project/Football"
git init
git add .
git commit -m "initial commit"

# یک ریپو خصوصی در GitHub بساز و push کن:
git remote add origin https://github.com/your-username/football.git
git push -u origin main
```

### مرحله ۵: ایجاد سرویس در چابکان

```
1. پنل چابکان → New Service
2. Platform: Next.js
3. Connect GitHub → ریپو football رو انتخاب کن
4. Branch: main
5. Root Directory: / (ریشه پروژه)
```

### مرحله ۶: تنظیم متغیرهای محیطی در چابکان

در بخش **Environment Variables** پنل چابکان، تک‌تک اضافه کن:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.chabukan.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-key

# دیتابیس — از Neon.tech
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Redis — از Upstash
REDIS_URL=rediss://default:pass@xxx.upstash.io:6379

# JWT Keys (با \n برای newline)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIj...\n-----END PUBLIC KEY-----"
NATIONAL_ID_ENCRYPTION_KEY=your-64-hex-chars

# SMS
KAVEH_NEGAR_API_KEY=your-key
KAVEH_NEGAR_SENDER=your-sender
KAVEH_NEGAR_TEMPLATE_OTP=your-template
KAVEH_NEGAR_WEBHOOK_SECRET=your-secret

# S3 (Arvan Cloud)
S3_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.ir
S3_REGION=ir-thr-at1
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_BUCKET=football-assets
S3_URL_EXPIRY=900

# Email (اختیاری)
SMTP_HOST=mail.football.ir
SMTP_PORT=587
SMTP_USER=noreply@football.ir
SMTP_PASS=your-pass
SMTP_FROM="جام جهانی ۲۰۲۶ <noreply@football.ir>"

# Turnstile
TURNSTILE_SECRET_KEY=your-secret
```

### مرحله ۷: تنظیم Build Command در چابکان

```
Build Command: npm run build
Start Command: node .next/standalone/server.js
Port: 3000
```

### مرحله ۸: مایگریشن دیتابیس

بعد از اولین دپلوی، باید مایگریشن‌ها رو اجرا کنی.

**گزینه A: از لوکال** (اگر `DATABASE_URL` ست کردی):
```bash
npx prisma migrate deploy
npx prisma db seed
```

**گزینه B: از طریق Neon Console**:
```
Neon Dashboard → SQL Editor → پیست کردن محتوای migration files
```

### مرحله ۹: Deploy

چابکان با هر push به main، اتوماتیک دپلوی می‌کند.

```bash
git add .
git commit -m "deploy"
git push origin main
```

---

## گزینه B: Docker (اگر چابکان Docker Compose پشتیبانی کند)

اگر چابکان `docker-compose.yml` قبول می‌کند:

### مرحله ۱: آماده‌سازی

```bash
# تنظیم .env
cp .env.production.template .env
nano .env  # مقادیر را پر کن
```

### مرحله ۲: تغییر در docker-compose.prod.yml

برای چابکان، MinIO رو غیرفعال کن (از Arvan Cloud S3 استفاده می‌کنیم):

```yaml
# در docker-compose.prod.yml این سرویس رو کامنت کن:
# minio:
#   ...
```

### مرحله ۳: دپلوی

```
چابکان Panel → New Service → Docker
Repository: your-repo
Compose File: docker/docker-compose.prod.yml
```

---

## اجرای بدون Docker (لوکال یا VPS ساده)

### پیش‌نیازها روی سرور

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Redis
sudo apt-get install -y redis-server

# PM2
npm install -g pm2 tsx
```

### تنظیم دیتابیس

```bash
sudo -u postgres psql
CREATE DATABASE football;
CREATE USER football WITH PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE football TO football;
\q
```

### کلون و راه‌اندازی

```bash
git clone https://github.com/your-username/football.git /opt/football
cd /opt/football

# نصب dependencies
npm ci

# تنظیم محیط
cp .env.production.template .env
nano .env  # مقادیر را پر کن

# مایگریشن
npx prisma migrate deploy
npx prisma db seed

# بیلد
npm run build

# اجرا با PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Nginx (reverse proxy)

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx

# /etc/nginx/sites-available/football
cat > /etc/nginx/sites-available/football << 'EOF'
server {
    listen 80;
    server_name football.ir www.football.ir;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/football /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL
certbot --nginx -d football.ir -d www.football.ir
```

---

## سوالات متداول

### Worker چطور اجرا بشه؟

Worker مسئول محاسبه امتیازات است. بدون Worker، بعد از نهایی کردن بازی، امتیازات محاسبه نمی‌شوند.

**با PM2** (روی سرور لوکال):
```bash
pm2 start ecosystem.config.js --env production
# هر دو football-web و football-worker اجرا می‌شوند
```

**روی چابکان** (سرویس جداگانه):
```
New Service → Node.js
Start Command: npx tsx workers/scoring-worker.ts
```

### چطور تست کنم که همه چیز درست است؟

```bash
# Health check
curl https://your-app.chabukan.com/api/v1/health

# باید برگرده:
# {"status":"ok","timestamp":"..."}
```

### NEXT_PUBLIC_* چرا کار نمی‌کند؟

این متغیرها باید **قبل از بیلد** ست شوند. در چابکان:
1. Environment Variables رو تنظیم کن
2. سرویس رو Rebuild (نه فقط Restart) کن

### چطور بک‌آپ بگیرم؟

```bash
# بک‌آپ دستی از دیتابیس
pg_dump -U football football | gzip > backup_$(date +%Y%m%d).sql.gz

# آپلود به S3
aws s3 cp backup_*.sql.gz s3://football-backups/ --endpoint-url https://s3.ir-thr-at1.arvanstorage.ir
```

---

## خلاصه مراحل برای چابکان

```
✅ مرحله ۱: ریپو GitHub بساز و کد رو push کن
✅ مرحله ۲: دیتابیس PostgreSQL روی Neon.tech بگیر (رایگان)
✅ مرحله ۳: Redis روی Upstash.com بگیر (رایگان)
✅ مرحله ۴: سرویس Next.js در چابکان بساز
✅ مرحله ۵: Environment Variables رو تنظیم کن
✅ مرحله ۶: Deploy کن
✅ مرحله ۷: مایگریشن دیتابیس رو اجرا کن
✅ مرحله ۸: برای Worker سرویس Node.js جداگانه بساز
✅ مرحله ۹: تست: curl https://your-app/api/v1/health
```
