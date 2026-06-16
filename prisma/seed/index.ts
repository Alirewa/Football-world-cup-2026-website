import { PrismaClient, MatchStage, MatchCountry } from '@prisma/client'
import { TEAMS } from './teams'
import { ALL_MATCHES } from './matches'
import { TOURNAMENT_CONFIG } from './tournament-config'
import { seedLanguages } from './languages'
import { seedRules } from './rules'
import { seedPrizes } from './prizes'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ── Tournament config ────────────────────────────────────
  console.log('  → tournament_config')
  for (const [key, value] of Object.entries(TOURNAMENT_CONFIG)) {
    await prisma.tournamentConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }

  // ── Groups A–L ───────────────────────────────────────────
  console.log('  → groups')
  const groupNames = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const groupMap: Record<string, string> = {}

  for (const name of groupNames) {
    const group = await prisma.group.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    groupMap[name] = group.id
  }

  // ── Teams ────────────────────────────────────────────────
  console.log('  → teams (48)')
  const teamMap: Record<string, string> = {}

  for (const t of TEAMS) {
    const team = await prisma.team.upsert({
      where: { fifaCode: t.fifaCode },
      update: { nameEn: t.nameEn, nameFa: t.nameFa, groupId: groupMap[t.group] },
      create: {
        fifaCode: t.fifaCode,
        nameEn:   t.nameEn,
        nameFa:   t.nameFa,
        groupId:  groupMap[t.group],
      },
    })
    teamMap[t.fifaCode] = team.id
  }

  // ── Avatars — flag category (one per team) ───────────────
  console.log('  → avatars (flags)')
  for (const t of TEAMS) {
    await prisma.avatar.upsert({
      where: {
        // No unique field — use findFirst pattern
        id: (await prisma.avatar.findFirst({
          where: { teamId: teamMap[t.fifaCode], category: 'flag' },
        }))?.id ?? '00000000-0000-0000-0000-000000000000',
      },
      update: {},
      create: {
        category: 'flag',
        name:     t.nameEn,
        url:      `flags/${t.fifaCode.toLowerCase()}.webp`,
        teamId:   teamMap[t.fifaCode],
        sortOrder: 0,
        isActive: true,
      },
    })
  }

  // ── Avatars — generic (male, female, neutral) ────────────
  console.log('  → avatars (generic)')
  const genericAvatars = [
    { category: 'male'    as const, name: 'Player 1',   url: 'avatars/male-1.webp' },
    { category: 'male'    as const, name: 'Player 2',   url: 'avatars/male-2.webp' },
    { category: 'male'    as const, name: 'Player 3',   url: 'avatars/male-3.webp' },
    { category: 'female'  as const, name: 'Fan 1',      url: 'avatars/female-1.webp' },
    { category: 'female'  as const, name: 'Fan 2',      url: 'avatars/female-2.webp' },
    { category: 'female'  as const, name: 'Fan 3',      url: 'avatars/female-3.webp' },
    { category: 'neutral' as const, name: 'Neutral 1',  url: 'avatars/neutral-1.webp' },
    { category: 'neutral' as const, name: 'Neutral 2',  url: 'avatars/neutral-2.webp' },
    { category: 'neutral' as const, name: 'Neutral 3',  url: 'avatars/neutral-3.webp' },
    { category: 'neutral' as const, name: 'Robot',      url: 'avatars/robot.webp' },
  ]
  for (let i = 0; i < genericAvatars.length; i++) {
    const a = genericAvatars[i]!
    const existing = await prisma.avatar.findFirst({ where: { url: a.url } })
    if (!existing) {
      await prisma.avatar.create({ data: { ...a, sortOrder: i, isActive: true } })
    }
  }

  // ── Matches ──────────────────────────────────────────────
  console.log('  → matches (104)')
  const matchMap: Record<string, string> = {}

  for (const m of ALL_MATCHES) {
    const existing = await prisma.match.findFirst({ where: { bracketSlot: m.bracketSlot } })

    const data = {
      stage:              m.stage as MatchStage,
      bracketSlot:        m.bracketSlot,
      homeTeamId:         m.homeTeamCode ? teamMap[m.homeTeamCode] : null,
      awayTeamId:         m.awayTeamCode ? teamMap[m.awayTeamCode] : null,
      kickoffAt:          new Date(m.kickoffAt),
      predictionLockedAt: new Date(m.kickoffAt),
      venue:              m.venue,
      city:               m.city,
      country:            m.country as MatchCountry,
    }

    const match = existing
      ? await prisma.match.update({ where: { id: existing.id }, data })
      : await prisma.match.create({ data })

    matchMap[m.bracketSlot] = match.id
  }

  // ── CMS pages ────────────────────────────────────────────
  console.log('  → cms_pages')
  const cmsPages = [
    { slug: 'rules',   titleFa: 'قوانین',          titleEn: 'Rules' },
    { slug: 'prizes',  titleFa: 'جوایز',            titleEn: 'Prizes' },
    { slug: 'privacy', titleFa: 'حریم خصوصی',       titleEn: 'Privacy Policy' },
    { slug: 'terms',   titleFa: 'شرایط استفاده',    titleEn: 'Terms of Use' },
  ]
  const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] }
  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where:  { slug: page.slug },
      update: {},
      create: {
        slug:       page.slug,
        titleFa:    page.titleFa,
        titleEn:    page.titleEn,
        contentFa:  emptyDoc,
        contentEn:  emptyDoc,
        updatedAt:  new Date(),
      },
    })
  }

  // ── Site settings ────────────────────────────────────────
  console.log('  → site_settings')
  const settings = [
    { key: 'site_name_fa',        value: 'پیش‌بینی جام جهانی ۲۰۲۶' },
    { key: 'site_name_en',        value: 'WC 2026 Prediction' },
    { key: 'maintenance_mode',    value: 'false' },
    { key: 'sms_provider',        value: 'kaveh_negar' },
    { key: 'scoring_exact',       value: '3' },
    { key: 'scoring_result',      value: '1' },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where:  { key: s.key },
      update: {},
      create: s,
    })
  }

  // ── Languages ────────────────────────────────────────────
  console.log('  → languages')
  await seedLanguages(prisma)

  // ── Rules ────────────────────────────────────────────────
  console.log('  → rules')
  await seedRules(prisma)

  // ── Prizes ───────────────────────────────────────────────
  console.log('  → prizes')
  await seedPrizes(prisma)

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
