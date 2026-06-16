'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const t = useTranslations('pwa')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow]     = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // Already dismissed in this session
    if (sessionStorage.getItem('pwa-dismissed')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show banner after 3s delay
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari: show generic banner (no native prompt)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator as { standalone?: boolean }).standalone
    if (isIOS) {
      setTimeout(() => setShow(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (installed || !show) return null

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShow(false)
      setDeferredPrompt(null)
    }
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('pwa-dismissed', '1')
  }

  return (
    <div
      className="fixed bottom-20 md:bottom-4 inset-x-3 md:inset-x-auto md:start-4 md:end-4 md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300"
      role="banner"
      aria-label="Install App"
    >
      <div className="glass rounded-2xl border border-[#0E7A43]/30 bg-[#0a0f1e]/90 backdrop-blur-xl p-4 shadow-2xl flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-[#0E7A43]/20 border border-[#0E7A43]/30 flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-[#0E7A43]" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">{t('banner_title')}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t('banner_desc')}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 bg-[#0E7A43] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#0a5e32] transition-colors active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              {t('install')}
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
