import type { PrismaClient } from '@prisma/client'

export async function seedLanguages(prisma: PrismaClient) {
  const languages = [
    {
      code:       'fa',
      name:       'Persian',
      nativeName: 'فارسی',
      direction:  'rtl',
      isActive:   true,
      isDefault:  true,
      sortOrder:  1,
    },
    {
      code:       'en',
      name:       'English',
      nativeName: 'English',
      direction:  'ltr',
      isActive:   true,
      isDefault:  false,
      sortOrder:  2,
    },
  ]

  for (const lang of languages) {
    await prisma.language.upsert({
      where:  { code: lang.code },
      create: lang,
      update: { name: lang.name, nativeName: lang.nativeName, direction: lang.direction },
    })
  }

  console.log(`✓ Seeded ${languages.length} languages`)
}
