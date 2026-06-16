# Security Checklist

Production security requirements for the WC2026 Prediction Platform.

---

## Server Hardening

- [ ] **SSH key-only auth** — disable password login: `PasswordAuthentication no` in `/etc/ssh/sshd_config`
- [ ] **Root SSH disabled** — `PermitRootLogin no`; use a dedicated deploy user with `sudo`
- [ ] **UFW firewall** — only ports 22, 80, 443 open; `ufw default deny incoming`
- [ ] **fail2ban** — installed and active with jails: `sshd` + `nginx-limit-req`
- [ ] **Unattended-upgrades** — enabled for automatic security patches
- [ ] **App runs as non-root** — Docker containers use `nextjs:1001` user; PM2 runs as app user

---

## Secrets Management

- [ ] **JWT_PRIVATE_KEY** — stored in Arvan Vault or GitHub Secrets, not in plaintext `.env` on disk
- [ ] **NATIONAL_ID_ENCRYPTION_KEY** — 32 random bytes (`openssl rand -hex 32`), never in git
- [ ] **All secrets** — absent from git history, Docker image layers, and CI logs
- [ ] **`.env` file permissions** — `chmod 600 /opt/football/.env`
- [ ] **Key rotation schedule** — RS256 keys: every 6 months; passwords: on any breach suspicion

### RS256 Key Rotation

```bash
# 1. Generate new keypair
openssl genrsa -out new-private.pem 2048
openssl rsa -in new-private.pem -pubout -out new-public.pem

# 2. Update .env with new keys (keep old public key accessible for 1 hour for in-flight tokens)
# 3. Restart app
# 4. After 1 hour: remove old public key from verification logic
```

---

## Application Security

- [ ] **Rate limiting** — Nginx `limit_req_zone` + `rate-limiter-flexible` in app; OTP: 5/15min per mobile
- [ ] **Cloudflare Turnstile** — enabled on prediction submission (not reCAPTCHA — blocked in Iran)
- [ ] **CSP header** — configured in `docker/nginx/nginx.conf`; restricts script/style sources
- [ ] **HSTS** — `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [ ] **X-Frame-Options: DENY** — prevents clickjacking
- [ ] **X-Content-Type-Options: nosniff** — prevents MIME sniffing
- [ ] **Referrer-Policy: strict-origin-when-cross-origin**
- [ ] **No sensitive data in logs** — mobile numbers masked in Pino output; nationalId never logged
- [ ] **JWT in httpOnly cookie** — refresh token httpOnly + Secure; access token in memory only (Zustand)

---

## Database Security

- [ ] **Not exposed publicly** — PostgreSQL bound to Docker internal network only (no port 5432 on host)
- [ ] **POSTGRES_PASSWORD** — strong random ≥32 chars
- [ ] **scram-sha-256 auth** — verify in `pg_hba.conf`
- [ ] **National IDs encrypted** — AES-256-GCM at rest; only decrypted in memory during auth
- [ ] **PgBouncer** — transaction pooling; Next.js never holds long-lived DB connections
- [ ] **Backups encrypted** — pg_dump → gzip → uploaded to S3 (Arvan Cloud server-side encryption)

---

## Redis Security

- [ ] **REDIS_PASSWORD** — strong random ≥32 chars; required by `requirepass` + sentinel `auth-pass`
- [ ] **Bound to internal network** — Redis not accessible on host `0.0.0.0`
- [ ] **Sentinel authentication** — `$$REDIS_PASSWORD` in sentinel entrypoint config
- [ ] **No persistence of PII** — Redis stores session tokens and BullMQ jobs, not user personal data

---

## SSL / TLS

- [ ] **Let's Encrypt certificate** — auto-renew cron running (`0 3 * * *`)
- [ ] **TLS 1.2 + 1.3 only** — `ssl_protocols TLSv1.2 TLSv1.3;` in nginx
- [ ] **Strong ciphers** — ECDHE + AES-256 preferred; RC4/3DES disabled
- [ ] **OCSP stapling** — `ssl_stapling on; ssl_stapling_verify on;` in nginx
- [ ] **SSL Labs rating** — verify A+ at https://www.ssllabs.com/ssltest/analyze.html?d=football.ir
- [ ] **HSTS preload** — submit domain to [hstspreload.org](https://hstspreload.org) after confirming HTTPS-only operation

---

## Monitoring & Incident Response

- [ ] **Health check cron** — `*/5 * * * *` runs `scripts/health-check.sh`
- [ ] **SMS alert** — Kaveh Negar SMS sent after 3 consecutive health check failures (~15 min downtime)
- [ ] **Container resource limits** — set in `docker-compose.prod.yml`; prevents OOM cascade
- [ ] **Log rotation** — PM2 `log_rotate` or Docker `json-file` with `max-size: 100m, max-file: 5`
- [ ] **Backup verification** — monthly: download a backup and run a test restore on staging

### Incident Response Steps

1. **Check health**: `curl https://football.ir/api/v1/health`
2. **Check containers**: `docker compose -f docker/docker-compose.prod.yml ps`
3. **Check logs**: `docker compose logs --tail=100 nextjs`
4. **Rollback**: redeploy previous image tag (see DEPLOYMENT.md)
5. **Database restore**: `bash scripts/db-restore.sh <backup-filename>`

---

## Dependency Security

- [ ] **npm audit** — run `npm audit` before each deployment; fix high/critical issues
- [ ] **Dependabot** — enable GitHub Dependabot for automated dependency PRs
- [ ] **Lock file committed** — `package-lock.json` in git; use `npm ci` (not `npm install`) in CI
- [ ] **Docker image pinning** — use specific image versions (e.g., `postgres:16-alpine`, not `postgres:latest`)

---

## Compliance Notes

- **National ID storage** — encrypted at rest (AES-256-GCM) per Iranian data protection requirements
- **Mobile number** — masked in all log output; stored in plaintext (needed for OTP delivery)
- **Data retention** — no automatic deletion; admin must manually remove inactive accounts
- **GDPR note** — if serving international users, add privacy policy and deletion workflow
