// Static fixtures for the GitHub Pages demo build (NEXT_PUBLIC_DEMO_MODE=true).
// No backend exists in that build — this data stands in for the real API.

export interface MockTeam {
  id:       string
  fifaCode: string
  nameEn:   string
  nameFa:   string
  flagUrl:  string | null
}

function team(fifaCode: string, nameEn: string, nameFa: string, iso2: string): MockTeam {
  return { id: fifaCode.toLowerCase(), fifaCode, nameEn, nameFa, flagUrl: `https://flagcdn.com/w40/${iso2}.png` }
}

export const MOCK_TEAMS: Record<string, MockTeam> = {
  USA: team('USA', 'United States', 'آمریکا', 'us'),
  MEX: team('MEX', 'Mexico', 'مکزیک', 'mx'),
  CAN: team('CAN', 'Canada', 'کانادا', 'ca'),
  ARG: team('ARG', 'Argentina', 'آرژانتین', 'ar'),
  BRA: team('BRA', 'Brazil', 'برزیل', 'br'),
  FRA: team('FRA', 'France', 'فرانسه', 'fr'),
  GER: team('GER', 'Germany', 'آلمان', 'de'),
  ESP: team('ESP', 'Spain', 'اسپانیا', 'es'),
  ENG: team('ENG', 'England', 'انگلستان', 'gb-eng'),
  POR: team('POR', 'Portugal', 'پرتغال', 'pt'),
  NED: team('NED', 'Netherlands', 'هلند', 'nl'),
  JPN: team('JPN', 'Japan', 'ژاپن', 'jp'),
  ITA: team('ITA', 'Italy', 'ایتالیا', 'it'),
  MAR: team('MAR', 'Morocco', 'مراکش', 'ma'),
  URU: team('URU', 'Uruguay', 'اروگوئه', 'uy'),
  KOR: team('KOR', 'South Korea', 'کره جنوبی', 'kr'),
  BEL: team('BEL', 'Belgium', 'بلژیک', 'be'),
  CRO: team('CRO', 'Croatia', 'کرواسی', 'hr'),
  SUI: team('SUI', 'Switzerland', 'سوئیس', 'ch'),
  COL: team('COL', 'Colombia', 'کلمبیا', 'co'),
}

export interface MockMatch {
  id:                 string
  stage:              string
  bracketSlot:        string
  kickoffAt:          string
  predictionLockedAt: string
  homeScore:          number | null
  awayScore:          number | null
  isFinalized:        boolean
  venue:              string | null
  city:               string | null
  country:            string
  homeTeam:           MockTeam | null
  awayTeam:           MockTeam | null
}

function match(
  id: string, bracketSlot: string, stage: string,
  home: string, away: string, kickoffAt: string,
  venue: string, city: string, country: string,
  homeScore: number | null = null, awayScore: number | null = null,
): MockMatch {
  return {
    id, bracketSlot, stage, kickoffAt,
    predictionLockedAt: kickoffAt,
    homeScore, awayScore,
    isFinalized: homeScore !== null && awayScore !== null,
    venue, city, country,
    homeTeam: MOCK_TEAMS[home] ?? null,
    awayTeam: MOCK_TEAMS[away] ?? null,
  }
}

export const MOCK_MATCHES: MockMatch[] = [
  match('m1', 'GRP-A-M1', 'group', 'USA', 'MEX', '2026-06-11T19:00:00Z', 'SoFi Stadium', 'Los Angeles', 'USA', 2, 1),
  match('m2', 'GRP-A-M2', 'group', 'CAN', 'ARG', '2026-06-12T00:00:00Z', 'BC Place', 'Vancouver', 'Canada', 0, 3),
  match('m3', 'GRP-B-M1', 'group', 'BRA', 'GER', '2026-06-13T19:00:00Z', 'Estadio Azteca', 'Mexico City', 'Mexico', 2, 2),
  match('m4', 'GRP-B-M2', 'group', 'ESP', 'ENG', '2026-06-14T00:00:00Z', 'AT&T Stadium', 'Dallas', 'USA', 1, 0),
  match('m5', 'GRP-C-M1', 'group', 'POR', 'NED', '2026-06-15T19:00:00Z', 'Hard Rock Stadium', 'Miami', 'USA', null, null),
  match('m6', 'GRP-C-M2', 'group', 'FRA', 'JPN', '2026-06-16T00:00:00Z', 'MetLife Stadium', 'New York', 'USA', null, null),
  match('m7', 'GRP-A-M3', 'group', 'USA', 'CAN', '2026-06-17T19:00:00Z', 'Rose Bowl', 'Los Angeles', 'USA', null, null),
  match('m8', 'GRP-B-M3', 'group', 'GER', 'ENG', '2026-06-18T19:00:00Z', 'Levi’s Stadium', 'San Francisco', 'USA', null, null),
  match('m9', 'GRP-C-M3', 'group', 'NED', 'JPN', '2026-06-19T19:00:00Z', 'Empower Field', 'Denver', 'USA', null, null),
  // ── Round of 16 ──
  match('m10', 'R16-1', 'r16', 'ARG', 'ESP', '2026-06-30T19:00:00Z', 'Arrowhead Stadium', 'Kansas City', 'USA', 2, 1),
  match('m13', 'R16-2', 'r16', 'BRA', 'URU', '2026-06-30T23:00:00Z', 'Rose Bowl', 'Los Angeles', 'USA', 3, 0),
  match('m14', 'R16-3', 'r16', 'FRA', 'MAR', '2026-07-01T19:00:00Z', 'AT&T Stadium', 'Dallas', 'USA', 1, 1),
  match('m15', 'R16-4', 'r16', 'GER', 'KOR', '2026-07-01T23:00:00Z', 'MetLife Stadium', 'New York', 'USA', null, null),
  match('m16', 'R16-5', 'r16', 'ENG', 'COL', '2026-07-02T19:00:00Z', 'SoFi Stadium', 'Los Angeles', 'USA', null, null),
  match('m17', 'R16-6', 'r16', 'POR', 'CRO', '2026-07-02T23:00:00Z', 'Hard Rock Stadium', 'Miami', 'USA', null, null),
  match('m18', 'R16-7', 'r16', 'NED', 'SUI', '2026-07-03T19:00:00Z', 'Levi’s Stadium', 'San Francisco', 'USA', null, null),
  match('m19', 'R16-8', 'r16', 'USA', 'ITA', '2026-07-03T23:00:00Z', 'Estadio Azteca', 'Mexico City', 'Mexico', null, null),
  // ── Quarter-finals ──
  match('m11', 'QF-1', 'qf', 'BRA', 'FRA', '2026-07-04T19:00:00Z', 'AT&T Stadium', 'Dallas', 'USA', 2, 1),
  match('m20', 'QF-2', 'qf', 'ARG', 'GER', '2026-07-05T19:00:00Z', 'Empower Field', 'Denver', 'USA', null, null),
  match('m21', 'QF-3', 'qf', 'ENG', 'NED', '2026-07-05T23:00:00Z', 'BC Place', 'Vancouver', 'Canada', null, null),
  match('m22', 'QF-4', 'qf', 'POR', 'USA', '2026-07-06T19:00:00Z', 'BMO Field', 'Toronto', 'Canada', null, null),
  // ── Semi-finals ──
  match('m23', 'SF-1', 'sf', 'BRA', 'ARG', '2026-07-10T19:00:00Z', 'MetLife Stadium', 'New York', 'USA', null, null),
  match('m24', 'SF-2', 'sf', 'ENG', 'POR', '2026-07-10T23:00:00Z', 'AT&T Stadium', 'Dallas', 'USA', null, null),
  // ── Third place & final ──
  match('m25', '3RD', 'third_place', 'ARG', 'POR', '2026-07-18T19:00:00Z', 'Hard Rock Stadium', 'Miami', 'USA', null, null),
  match('m12', 'FINAL', 'final', 'BRA', 'ENG', '2026-07-19T19:00:00Z', 'MetLife Stadium', 'New York', 'USA', null, null),
]

export interface MockRankingRow {
  rank:         number
  userId:       string
  firstName:    string
  mobileMasked: string
  totalPoints:  number
  avatarUrl:    string | null
}

export const MOCK_RANKINGS: MockRankingRow[] = [
  { rank: 1, userId: 'u1', firstName: 'علی',     mobileMasked: '0912****345', totalPoints: 27, avatarUrl: null },
  { rank: 2, userId: 'u2', firstName: 'سارا',     mobileMasked: '0935****112', totalPoints: 24, avatarUrl: null },
  { rank: 3, userId: 'u3', firstName: 'رضا',      mobileMasked: '0919****890', totalPoints: 21, avatarUrl: null },
  { rank: 4, userId: 'u4', firstName: 'مریم',     mobileMasked: '0903****221', totalPoints: 18, avatarUrl: null },
  { rank: 5, userId: 'u5', firstName: 'حسین',     mobileMasked: '0938****556', totalPoints: 16, avatarUrl: null },
  { rank: 6, userId: 'u6', firstName: 'زهرا',     mobileMasked: '0912****778', totalPoints: 14, avatarUrl: null },
  { rank: 7, userId: 'u7', firstName: 'محمد',     mobileMasked: '0901****334', totalPoints: 12, avatarUrl: null },
  { rank: 8, userId: 'u8', firstName: 'فاطمه',    mobileMasked: '0933****990', totalPoints: 9,  avatarUrl: null },
]

export const MOCK_RULES = [
  {
    id: 'r1', sortOrder: 1,
    titleFa: 'شرکت رایگان', titleEn: 'Free Participation',
    contentFa: '<p>شرکت در مسابقه پیش‌بینی جام جهانی ۲۰۲۶ کاملاً رایگان است. فقط باید با شماره موبایل ثبت‌نام کنی.</p>',
    contentEn: '<p>Participation is completely free. You only need to register with a mobile number.</p>',
  },
  {
    id: 'r2', sortOrder: 2,
    titleFa: 'نحوه پیش‌بینی', titleEn: 'How to Predict',
    contentFa: '<p>برای هر بازی، نتیجه دقیق را پیش از شروع بازی وارد کن. پس از قفل شدن بازی، پیش‌بینی امکان‌پذیر نیست.</p>',
    contentEn: '<p>For each match, enter the exact score before kick-off. Once locked, no predictions are allowed.</p>',
  },
  {
    id: 'r3', sortOrder: 3,
    titleFa: 'سیستم امتیازدهی', titleEn: 'Scoring System',
    contentFa: '<ul><li><strong>۳ امتیاز</strong> — نتیجه دقیق</li><li><strong>۱ امتیاز</strong> — نتیجه درست</li><li><strong>۰ امتیاز</strong> — پیش‌بینی اشتباه</li></ul>',
    contentEn: '<ul><li><strong>3 points</strong> — exact score</li><li><strong>1 point</strong> — correct result</li><li><strong>0 points</strong> — wrong prediction</li></ul>',
  },
]

export const MOCK_PRIZES = [
  {
    id: 'p1', sortOrder: 1, rankPosition: 1, prizeValue: '۵۰,۰۰۰,۰۰۰ تومان',
    titleFa: 'مقام اول', titleEn: 'First Place',
    contentFa: '<p>نفر اول جدول رتبه‌بندی برنده جایزه نقدی می‌شود.</p>',
    contentEn: '<p>The top-ranked participant wins the grand cash prize.</p>',
  },
  {
    id: 'p2', sortOrder: 2, rankPosition: 2, prizeValue: '۲۰,۰۰۰,۰۰۰ تومان',
    titleFa: 'مقام دوم', titleEn: 'Second Place',
    contentFa: '<p>نفر دوم رتبه‌بندی جایزه نقدی دریافت می‌کند.</p>',
    contentEn: '<p>The second-ranked participant receives a cash prize.</p>',
  },
  {
    id: 'p3', sortOrder: 3, rankPosition: 3, prizeValue: '۱۰,۰۰۰,۰۰۰ تومان',
    titleFa: 'مقام سوم', titleEn: 'Third Place',
    contentFa: '<p>نفر سوم رتبه‌بندی جایزه نقدی دریافت می‌کند.</p>',
    contentEn: '<p>The third-ranked participant receives a cash prize.</p>',
  },
]

export const MOCK_ANNOUNCEMENTS = [
  {
    id: 'a1', publishedAt: '2026-06-10T08:00:00Z',
    titleFa: 'شروع مسابقه پیش‌بینی', titleEn: 'Prediction Contest Begins',
    bodyFa: 'مسابقه پیش‌بینی جام جهانی ۲۰۲۶ از امروز شروع شد. زود ثبت‌نام کن و پیش‌بینی‌هات رو ثبت کن!',
    bodyEn: 'The World Cup 2026 prediction contest starts today. Register early and submit your predictions!',
  },
  {
    id: 'a2', publishedAt: '2026-06-05T08:00:00Z',
    titleFa: 'جدول گروه‌ها نهایی شد', titleEn: 'Group Stage Finalized',
    bodyFa: 'جدول کامل ۱۲ گروه و ۴۸ تیم جام جهانی ۲۰۲۶ نهایی شد. می‌تونی از صفحه اصلی ببینی.',
    bodyEn: 'The full schedule of 12 groups and 48 teams has been finalized. Check it out on the homepage.',
  },
]

export const MOCK_PROFILE = {
  id: 'demo-user',
  firstName: 'کاربر',
  lastName: 'دمو',
  mobile: '0912****000',
  email: 'demo@example.com',
  role: 'admin' as const,
  locale: 'fa' as const,
  theme: 'dark' as const,
  avatar: null,
  avatarId: null,
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00Z',
}

export const MOCK_AVATARS: Record<string, { id: string; name: string; url: string; category: string; teamId: string | null }[]> = {
  male:    Array.from({ length: 8 }, (_, i) => ({ id: `m${i + 1}`, name: `m${i + 1}`, url: `/avatars/male/m${i + 1}.png`, category: 'male', teamId: null })),
  female:  Array.from({ length: 8 }, (_, i) => ({ id: `f${i + 1}`, name: `f${i + 1}`, url: `/avatars/female/f${i + 1}.png`, category: 'female', teamId: null })),
  neutral: Array.from({ length: 5 }, (_, i) => ({ id: `n${i + 1}`, name: `n${i + 1}`, url: `/avatars/neutral/n${i + 1}.png`, category: 'neutral', teamId: null })),
}
