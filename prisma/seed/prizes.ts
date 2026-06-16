import type { PrismaClient } from '@prisma/client'

const PRIZES = [
  {
    titleFa:      'مقام اول',
    titleEn:      'First Place',
    contentFa:    '<p>نفر اول جدول رتبه‌بندی پس از پایان جام جهانی ۲۰۲۶ برنده جایزه نقدی می‌شود. واریز مستقیم به حساب برنده.</p>',
    contentEn:    '<p>The top-ranked participant at the end of World Cup 2026 wins the grand cash prize, transferred directly to their bank account.</p>',
    rankPosition: 1,
    prizeValue:   '۵۰,۰۰۰,۰۰۰ تومان',
    sortOrder:    1,
  },
  {
    titleFa:      'مقام دوم',
    titleEn:      'Second Place',
    contentFa:    '<p>نفر دوم رتبه‌بندی جایزه نقدی دریافت می‌کند.</p>',
    contentEn:    '<p>The second-ranked participant receives a cash prize.</p>',
    rankPosition: 2,
    prizeValue:   '۲۰,۰۰۰,۰۰۰ تومان',
    sortOrder:    2,
  },
  {
    titleFa:      'مقام سوم',
    titleEn:      'Third Place',
    contentFa:    '<p>نفر سوم رتبه‌بندی جایزه نقدی دریافت می‌کند.</p>',
    contentEn:    '<p>The third-ranked participant receives a cash prize.</p>',
    rankPosition: 3,
    prizeValue:   '۱۰,۰۰۰,۰۰۰ تومان',
    sortOrder:    3,
  },
  {
    titleFa:      'مقام چهارم تا دهم',
    titleEn:      'Ranks 4–10',
    contentFa:    '<p>نفرات چهارم تا دهم هر کدام جایزه نقدی دریافت می‌کنند.</p>',
    contentEn:    '<p>Participants ranked 4th through 10th each receive a cash prize.</p>',
    rankPosition: 4,
    prizeValue:   '۵,۰۰۰,۰۰۰ تومان',
    sortOrder:    4,
  },
]

export async function seedPrizes(prisma: PrismaClient) {
  for (const prize of PRIZES) {
    await prisma.prize.create({ data: { ...prize, isActive: true } })
  }
  console.log(`✓ Seeded ${PRIZES.length} prizes`)
}
