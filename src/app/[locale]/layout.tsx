import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AuthHydrator } from '@/components/auth/AuthHydrator'
import { PWAInstallPrompt } from '@/components/shared/PWAInstallPrompt'
import { NavigationProgress } from '@/components/shared/NavigationProgress'
import { ProfileCompleteModal } from '@/components/profile/ProfileCompleteModal'
import '@/app/globals.css'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const vazirmatn = localFont({
  src: [
    { path: '../../../public/fonts/Vazirmatn-RD-FD-Light.woff2',     weight: '300' },
    { path: '../../../public/fonts/Vazirmatn-RD-FD-Regular.woff2',   weight: '400' },
    { path: '../../../public/fonts/Vazirmatn-RD-FD-Medium.woff2',    weight: '500' },
    { path: '../../../public/fonts/Vazirmatn-RD-FD-SemiBold.woff2',  weight: '600' },
    { path: '../../../public/fonts/Vazirmatn-RD-FD-Bold.woff2',      weight: '700' },
    { path: '../../../public/fonts/Vazirmatn-RD-FD-ExtraBold.woff2', weight: '800' },
    { path: '../../../public/fonts/Vazirmatn-RD-FD-Black.woff2',     weight: '900' },
  ],
  variable: '--font-vazirmatn',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'پیش‌بینی جام جهانی ۲۰۲۶',
  description: 'پیش‌بینی نتایج جام جهانی ۲۰۲۶ و رقابت برای جوایز نقدی',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:           true,
    statusBarStyle:    'black-translucent',
    title:             'WC2026',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor:          '#0E7A43',
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
  viewportFit:         'cover',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children:  React.ReactNode
  params:    Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages   = await getMessages()
  const dir        = 'rtl'

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* FOUC prevention */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.add(t)}catch(e){}`,
          }}
        />
        {/* PWA iOS splash */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} ${vazirmatn.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <NavigationProgress />
          <AuthHydrator />
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pb-20 md:pb-0">
                {children}
              </main>
              <BottomNav />
            </div>
            <ProfileCompleteModal />
            <PWAInstallPrompt />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'rgba(15, 25, 38, 0.95)',
                  border:     '1px solid rgba(255,255,255,0.08)',
                  color:      '#fff',
                  backdropFilter: 'blur(12px)',
                },
              }}
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
