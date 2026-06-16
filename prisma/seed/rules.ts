import type { PrismaClient } from '@prisma/client'

const RULES = [
  {
    titleFa:   'شرکت رایگان',
    titleEn:   'Free Participation',
    contentFa: '<p>شرکت در مسابقه پیش‌بینی جام جهانی ۲۰۲۶ کاملاً رایگان است. فقط باید با شماره موبایل ایرانی ثبت‌نام کنی.</p>',
    contentEn: '<p>Participation in the World Cup 2026 prediction contest is completely free. You only need to register with an Iranian mobile number.</p>',
    sortOrder: 1,
  },
  {
    titleFa:   'نحوه پیش‌بینی',
    titleEn:   'How to Predict',
    contentFa: '<p>برای هر بازی، نتیجه دقیق (تعداد گل‌های هر تیم) را پیش از شروع بازی وارد کن. پس از قفل شدن بازی، پیش‌بینی امکان‌پذیر نیست.</p>',
    contentEn: '<p>For each match, enter the exact score (goals per team) before match kick-off. Once the match is locked, no predictions are allowed.</p>',
    sortOrder: 2,
  },
  {
    titleFa:   'سیستم امتیازدهی',
    titleEn:   'Scoring System',
    contentFa: '<ul><li><strong>۳ امتیاز</strong> — نتیجه دقیق (مثلاً ۲–۱ پیش‌بینی کردی و همین شد)</li><li><strong>۱ امتیاز</strong> — نتیجه درست (برنده درست را حدس زدی یا مساوی را)</li><li><strong>۰ امتیاز</strong> — پیش‌بینی اشتباه</li></ul>',
    contentEn: '<ul><li><strong>3 points</strong> — Exact score (e.g. you predicted 2–1 and that was the result)</li><li><strong>1 point</strong> — Correct result (right winner or draw)</li><li><strong>0 points</strong> — Wrong prediction</li></ul>',
    sortOrder: 3,
  },
  {
    titleFa:   'ضرب‌الاجل پیش‌بینی',
    titleEn:   'Prediction Deadline',
    contentFa: '<p>پیش‌بینی‌ها باید قبل از شروع هر بازی ثبت شوند. زمان دقیق قفل شدن برای هر بازی مشخص است و پس از آن ویرایش امکان‌پذیر نیست.</p>',
    contentEn: '<p>Predictions must be submitted before each match kick-off. The exact lock time is shown per match and no edits are allowed after the lock.</p>',
    sortOrder: 4,
  },
  {
    titleFa:   'تعیین برنده در صورت تساوی امتیاز',
    titleEn:   'Tiebreaker Rules',
    contentFa: '<p>اگر دو یا چند نفر امتیاز یکسان داشته باشند، ملاک تصمیم‌گیری به ترتیب است: تعداد پیش‌بینی‌های دقیق بیشتر، سپس قرعه‌کشی عادلانه.</p>',
    contentEn: '<p>If two or more participants have equal points, the tiebreaker is first the number of exact score predictions, then a fair random draw.</p>',
    sortOrder: 5,
  },
  {
    titleFa:   'اعلام برندگان',
    titleEn:   'Winner Announcement',
    contentFa: '<p>برندگان پس از پایان مسابقات جام جهانی ۲۰۲۶ و تسویه نهایی امتیازات از طریق اطلاعیه سایت معرفی می‌شوند. جوایز نقدی به حساب برندگان واریز می‌شود.</p>',
    contentEn: '<p>Winners will be announced after the end of the 2026 World Cup and final score settlement via site announcements. Cash prizes are transferred to winners\' bank accounts.</p>',
    sortOrder: 6,
  },
]

export async function seedRules(prisma: PrismaClient) {
  for (const rule of RULES) {
    await prisma.rule.create({ data: { ...rule, isActive: true } })
  }
  console.log(`✓ Seeded ${RULES.length} rules`)
}
