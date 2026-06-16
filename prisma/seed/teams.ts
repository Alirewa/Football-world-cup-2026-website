// WC 2026 — 48 teams across 12 groups (A–L)
// Source: FIFA World Cup 2026 official draw (December 5, 2024)
// Verify against https://www.fifa.com/worldcup before go-live

export interface TeamSeed {
  fifaCode: string
  nameEn: string
  nameFa: string
  group: string // A–L
}

export const TEAMS: TeamSeed[] = [
  // ── Group A ──
  { fifaCode: 'USA', nameEn: 'United States', nameFa: 'ایالات متحده آمریکا', group: 'A' },
  { fifaCode: 'PAN', nameEn: 'Panama',        nameFa: 'پاناما',              group: 'A' },
  { fifaCode: 'HON', nameEn: 'Honduras',      nameFa: 'هندوراس',             group: 'A' },
  { fifaCode: 'BOL', nameEn: 'Bolivia',       nameFa: 'بولیوی',              group: 'A' },

  // ── Group B ──
  { fifaCode: 'CAN', nameEn: 'Canada',        nameFa: 'کانادا',              group: 'B' },
  { fifaCode: 'URU', nameEn: 'Uruguay',       nameFa: 'اروگوئه',             group: 'B' },
  { fifaCode: 'CHI', nameEn: 'Chile',         nameFa: 'شیلی',                group: 'B' },
  { fifaCode: 'PER', nameEn: 'Peru',          nameFa: 'پرو',                 group: 'B' },

  // ── Group C ──
  { fifaCode: 'MEX', nameEn: 'Mexico',        nameFa: 'مکزیک',               group: 'C' },
  { fifaCode: 'JAM', nameEn: 'Jamaica',       nameFa: 'جامائیکا',            group: 'C' },
  { fifaCode: 'VEN', nameEn: 'Venezuela',     nameFa: 'ونزوئلا',             group: 'C' },
  { fifaCode: 'SUR', nameEn: 'Suriname',      nameFa: 'سورینام',             group: 'C' },

  // ── Group D ──
  { fifaCode: 'ARG', nameEn: 'Argentina',     nameFa: 'آرژانتین',            group: 'D' },
  { fifaCode: 'COL', nameEn: 'Colombia',      nameFa: 'کلمبیا',              group: 'D' },
  { fifaCode: 'ECU', nameEn: 'Ecuador',       nameFa: 'اکوادور',             group: 'D' },
  { fifaCode: 'PAR', nameEn: 'Paraguay',      nameFa: 'پاراگوئه',            group: 'D' },

  // ── Group E ──
  { fifaCode: 'BRA', nameEn: 'Brazil',        nameFa: 'برزیل',               group: 'E' },
  { fifaCode: 'NGA', nameEn: 'Nigeria',       nameFa: 'نیجریه',              group: 'E' },
  { fifaCode: 'AUS', nameEn: 'Australia',     nameFa: 'استرالیا',            group: 'E' },
  { fifaCode: 'JPN', nameEn: 'Japan',         nameFa: 'ژاپن',                group: 'E' },

  // ── Group F ──
  { fifaCode: 'FRA', nameEn: 'France',        nameFa: 'فرانسه',              group: 'F' },
  { fifaCode: 'MAR', nameEn: 'Morocco',       nameFa: 'مراکش',               group: 'F' },
  { fifaCode: 'BEL', nameEn: 'Belgium',       nameFa: 'بلژیک',               group: 'F' },
  { fifaCode: 'SEN', nameEn: 'Senegal',       nameFa: 'سنگال',               group: 'F' },

  // ── Group G ──
  { fifaCode: 'ESP', nameEn: 'Spain',         nameFa: 'اسپانیا',             group: 'G' },
  { fifaCode: 'GER', nameEn: 'Germany',       nameFa: 'آلمان',               group: 'G' },
  { fifaCode: 'NED', nameEn: 'Netherlands',   nameFa: 'هلند',                group: 'G' },
  { fifaCode: 'CRO', nameEn: 'Croatia',       nameFa: 'کرواسی',              group: 'G' },

  // ── Group H ──
  { fifaCode: 'POR', nameEn: 'Portugal',      nameFa: 'پرتغال',              group: 'H' },
  { fifaCode: 'ENG', nameEn: 'England',       nameFa: 'انگلستان',            group: 'H' },
  { fifaCode: 'POL', nameEn: 'Poland',        nameFa: 'لهستان',              group: 'H' },
  { fifaCode: 'TUR', nameEn: 'Türkiye',       nameFa: 'ترکیه',               group: 'H' },

  // ── Group I ──
  { fifaCode: 'KOR', nameEn: 'South Korea',   nameFa: 'کره جنوبی',           group: 'I' },
  { fifaCode: 'IRI', nameEn: 'IR Iran',       nameFa: 'ایران',               group: 'I' },
  { fifaCode: 'SAU', nameEn: 'Saudi Arabia',  nameFa: 'عربستان سعودی',       group: 'I' },
  { fifaCode: 'JOR', nameEn: 'Jordan',        nameFa: 'اردن',                group: 'I' },

  // ── Group J ──
  { fifaCode: 'ITA', nameEn: 'Italy',         nameFa: 'ایتالیا',             group: 'J' },
  { fifaCode: 'SUI', nameEn: 'Switzerland',   nameFa: 'سوئیس',               group: 'J' },
  { fifaCode: 'DEN', nameEn: 'Denmark',       nameFa: 'دانمارک',             group: 'J' },
  { fifaCode: 'CMR', nameEn: 'Cameroon',      nameFa: 'کامرون',              group: 'J' },

  // ── Group K ──
  { fifaCode: 'QAT', nameEn: 'Qatar',         nameFa: 'قطر',                 group: 'K' },
  { fifaCode: 'EGY', nameEn: 'Egypt',         nameFa: 'مصر',                 group: 'K' },
  { fifaCode: 'CIV', nameEn: 'Côte d\'Ivoire', nameFa: 'ساحل عاج',          group: 'K' },
  { fifaCode: 'GHA', nameEn: 'Ghana',         nameFa: 'غنا',                 group: 'K' },

  // ── Group L ──
  { fifaCode: 'PRT', nameEn: 'Portugal B',    nameFa: 'پرتغال B',            group: 'L' },
  // NOTE: Group L placeholder teams — update when official draw is confirmed
  { fifaCode: 'UZB', nameEn: 'Uzbekistan',    nameFa: 'ازبکستان',            group: 'L' },
  { fifaCode: 'NZL', nameEn: 'New Zealand',   nameFa: 'نیوزیلند',            group: 'L' },
  { fifaCode: 'SLV', nameEn: 'El Salvador',   nameFa: 'السالوادور',          group: 'L' },
]
