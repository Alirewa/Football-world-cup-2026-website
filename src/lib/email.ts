/**
 * SMTP Email service.
 * Config priority: DB email_settings table → env vars → disabled.
 * Transport is cached and recreated only when DB settings change.
 */

import nodemailer, { type Transporter } from 'nodemailer'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

interface EmailConfig {
  host:   string
  port:   number
  secure: boolean
  user:   string
  pass:   string
  from:   string
}

interface SendEmailOpts {
  to:       string
  subject:  string
  html:     string
  replyTo?: string
}

// ── Transport cache ───────────────────────────────────────────

let _transporter: Transporter | null = null
let _configHash: string | null = null

function hashConfig(cfg: EmailConfig): string {
  return `${cfg.host}:${cfg.port}:${cfg.user}:${cfg.secure}`
}

function buildTransport(cfg: EmailConfig): Transporter {
  return nodemailer.createTransport({
    host:   cfg.host,
    port:   cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    tls: { rejectUnauthorized: false }, // allow self-signed certs in dev
  })
}

// ── Config loading ────────────────────────────────────────────

async function loadEmailConfig(): Promise<EmailConfig | null> {
  // 1. Try DB config first
  try {
    const rows = await prisma.emailSetting.findMany()
    const dbCfg: Record<string, string> = {}
    for (const row of rows) dbCfg[row.key] = row.value

    if (dbCfg['enabled'] === 'true' && dbCfg['smtp_host']) {
      return {
        host:   dbCfg['smtp_host'] ?? '',
        port:   parseInt(dbCfg['smtp_port'] ?? '587', 10),
        secure: dbCfg['smtp_secure'] === 'true',
        user:   dbCfg['smtp_user'] ?? '',
        pass:   dbCfg['smtp_pass'] ?? '',
        from:   dbCfg['smtp_from'] ?? '',
      }
    }
  } catch {
    // DB might not be available; fall through to env vars
  }

  // 2. Fall back to env vars
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return {
      host:   env.SMTP_HOST,
      port:   env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user:   env.SMTP_USER,
      pass:   env.SMTP_PASS,
      from:   env.SMTP_FROM ?? `"WC2026" <${env.SMTP_USER}>`,
    }
  }

  return null
}

async function getTransporter(): Promise<{ transporter: Transporter; from: string } | null> {
  const cfg = await loadEmailConfig()
  if (!cfg) return null

  const hash = hashConfig(cfg)
  if (!_transporter || _configHash !== hash) {
    _transporter  = buildTransport(cfg)
    _configHash   = hash
  }

  return { transporter: _transporter, from: cfg.from }
}

// ── Public API ────────────────────────────────────────────────

/**
 * Send an email. Returns true on success, false if email is disabled/unconfigured.
 */
export async function sendEmail(opts: SendEmailOpts): Promise<boolean> {
  const transport = await getTransporter()
  if (!transport) {
    logger.warn({ to: opts.to }, 'Email send skipped — SMTP not configured')
    return false
  }

  try {
    const info = await transport.transporter.sendMail({
      from:    opts.replyTo ? `${transport.from}` : transport.from,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
      ...(opts.replyTo && { replyTo: opts.replyTo }),
    })
    logger.info({ to: opts.to, messageId: info.messageId }, 'Email sent')
    return true
  } catch (err) {
    logger.error({ err, to: opts.to }, 'Email send failed')
    return false
  }
}

/**
 * Test SMTP connection. Used by admin settings test endpoint.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export async function testSmtpConnection(): Promise<{ ok: boolean; error?: string }> {
  const transport = await getTransporter()
  if (!transport) {
    return { ok: false, error: 'SMTP not configured' }
  }

  try {
    await transport.transporter.verify()
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, error: message }
  }
}

/**
 * Send a welcome email after registration.
 */
export async function sendWelcomeEmail(opts: {
  to:        string
  firstName: string
}): Promise<void> {
  await sendEmail({
    to:      opts.to,
    subject: `خوش آمدید، ${opts.firstName}!`,
    html:    `<p>سلام ${opts.firstName} عزیز،</p><p>ثبت‌نام شما در پلتفرم پیش‌بینی جام جهانی ۲۰۲۶ با موفقیت انجام شد.</p>`,
  })
}
