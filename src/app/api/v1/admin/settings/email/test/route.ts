import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, errors } from '@/lib/response'
import { requireAdmin } from '@/app/api/v1/admin/_guard'
import { testSmtpConnection, sendEmail } from '@/lib/email'

const TestSchema = z.object({
  sendTo: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return errors.forbidden()

  const body   = await req.json().catch(() => ({}))
  const parsed = TestSchema.safeParse(body)
  if (!parsed.success) return errors.validation(parsed.error.flatten())

  // Verify connection first
  const conn = await testSmtpConnection()
  if (!conn.ok) {
    return ok({ ok: false, error: conn.error })
  }

  // Optionally send a test email
  if (parsed.data.sendTo) {
    const sent = await sendEmail({
      to:      parsed.data.sendTo,
      subject: 'WC2026 — SMTP Test',
      html:    '<p>This is a test email from WC2026 Prediction Platform admin panel.</p>',
    })
    return ok({ ok: sent, error: sent ? undefined : 'Email send failed — check logs' })
  }

  return ok({ ok: true })
}
