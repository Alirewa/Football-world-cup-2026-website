import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales:       ['fa'] as const,
  defaultLocale: 'fa',
  localePrefix:  'as-needed', // /fa/... = /..., /en/... = /en/...
})
