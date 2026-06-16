'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api-client'
import { Mail, MessageSquare, Globe } from 'lucide-react'

function Section({ icon: Icon, title, children }: { icon: typeof Mail; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-[#0E7A43]" />
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function AdminSettingsPage() {
  const t = useTranslations('admin')

  // Email
  const [smtpHost,     setSmtpHost]     = useState('')
  const [smtpPort,     setSmtpPort]     = useState('')
  const [smtpUser,     setSmtpUser]     = useState('')
  const [smtpPass,     setSmtpPass]     = useState('')
  const [fromEmail,    setFromEmail]    = useState('')
  const [savingEmail,  setSavingEmail]  = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testAddress,  setTestAddress]  = useState('')

  // SMS
  const [smsProvider, setSmsProvider] = useState('')
  const [smsApiKey,   setSmsApiKey]   = useState('')
  const [smsSender,   setSmsSender]   = useState('')
  const [savingSms,   setSavingSms]   = useState(false)

  // General
  const [siteName,   setSiteName]   = useState('')
  const [siteUrl,    setSiteUrl]    = useState('')
  const [savingGen,  setSavingGen]  = useState(false)

  useEffect(() => {
    api.get<Record<string, string>>('/api/v1/admin/settings/email').then(d => {
      setSmtpHost(d.smtp_host ?? ''); setSmtpPort(d.smtp_port ?? '')
      setSmtpUser(d.smtp_user ?? ''); setSmtpPass(d.smtp_pass === '***' ? '' : (d.smtp_pass ?? ''))
      setFromEmail(d.from_email ?? '')
    }).catch(() => {})
    api.get<Record<string, string>>('/api/v1/admin/settings/sms').then(d => {
      setSmsProvider(d.provider ?? ''); setSmsApiKey(d.api_key === '***' ? '' : (d.api_key ?? ''))
      setSmsSender(d.sender ?? '')
    }).catch(() => {})
    api.get<Record<string, string>>('/api/v1/admin/settings/general').then(d => {
      setSiteName(d.site_name ?? ''); setSiteUrl(d.site_url ?? '')
    }).catch(() => {})
  }, [])

  async function saveEmail() {
    setSavingEmail(true)
    try {
      const keys: Record<string, string> = { smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, from_email: fromEmail }
      if (smtpPass) keys.smtp_pass = smtpPass
      await api.put('/api/v1/admin/settings/email', { keys })
      toast.success(t('saved'))
    } catch { toast.error(t('save_error')) }
    finally { setSavingEmail(false) }
  }

  async function testEmail() {
    setTestingEmail(true)
    try {
      await api.post('/api/v1/admin/settings/email/test', { sendTestTo: testAddress || undefined })
      toast.success(t('email_test_ok'))
    } catch { toast.error(t('email_test_fail')) }
    finally { setTestingEmail(false) }
  }

  async function saveSms() {
    setSavingSms(true)
    try {
      const keys: Record<string, string> = { provider: smsProvider, sender: smsSender }
      if (smsApiKey) keys.api_key = smsApiKey
      await api.put('/api/v1/admin/settings/sms', { keys })
      toast.success(t('saved'))
    } catch { toast.error(t('save_error')) }
    finally { setSavingSms(false) }
  }

  async function saveGeneral() {
    setSavingGen(true)
    try {
      await api.put('/api/v1/admin/settings/general', { keys: { site_name: siteName, site_url: siteUrl } })
      toast.success(t('saved'))
    } catch { toast.error(t('save_error')) }
    finally { setSavingGen(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black">{t('settings')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('settings_subtitle')}</p>
      </div>

      <Section icon={Mail} title={t('email_settings')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label={t('smtp_host')} value={smtpHost} onChange={e => setSmtpHost(e.target.value)} />
          <Input label={t('smtp_port')} value={smtpPort} onChange={e => setSmtpPort(e.target.value)} type="number" />
          <Input label={t('smtp_user')} value={smtpUser} onChange={e => setSmtpUser(e.target.value)} />
          <Input label={t('smtp_pass')} value={smtpPass} onChange={e => setSmtpPass(e.target.value)} type="password" placeholder="(unchanged)" />
          <Input label={t('from_email')} value={fromEmail} onChange={e => setFromEmail(e.target.value)} className="sm:col-span-2" />
        </div>
        <div className="flex gap-2 items-end">
          <Input label={t('test_address')} value={testAddress} onChange={e => setTestAddress(e.target.value)} placeholder="test@example.com" className="flex-1" />
          <Button variant="outline" size="sm" loading={testingEmail} onClick={testEmail}>{t('test_email')}</Button>
        </div>
        <Button loading={savingEmail} onClick={saveEmail}>{t('save_email_settings')}</Button>
      </Section>

      <Section icon={MessageSquare} title={t('sms_settings')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label={t('sms_provider')} value={smsProvider} onChange={e => setSmsProvider(e.target.value)} placeholder="kavenegar" />
          <Input label={t('sms_sender')} value={smsSender} onChange={e => setSmsSender(e.target.value)} />
          <Input label={t('sms_api_key')} value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} type="password" placeholder="(unchanged)" className="sm:col-span-2" />
        </div>
        <Button loading={savingSms} onClick={saveSms}>{t('save_sms_settings')}</Button>
      </Section>

      <Section icon={Globe} title={t('general_settings')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label={t('site_name')} value={siteName} onChange={e => setSiteName(e.target.value)} />
          <Input label={t('site_url')} value={siteUrl} onChange={e => setSiteUrl(e.target.value)} />
        </div>
        <Button loading={savingGen} onClick={saveGeneral}>{t('save_general_settings')}</Button>
      </Section>
    </div>
  )
}
