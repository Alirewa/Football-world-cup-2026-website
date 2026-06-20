// Pattern-matches API URLs and returns fixture data, simulating the real backend
// for the static GitHub Pages demo build. Mirrors the exact response shapes the
// real /api/v1/* routes return (post `{ success, data }` envelope unwrap).

import {
  MOCK_MATCHES, MOCK_RANKINGS, MOCK_RULES, MOCK_PRIZES,
  MOCK_ANNOUNCEMENTS, MOCK_PROFILE, MOCK_AVATARS,
} from './mock-data'

let demoProfile = { ...MOCK_PROFILE }
let demoPredictions: Array<{
  id: string; homeScore: number; awayScore: number; pointsEarned: number | null
  createdAt: string; updatedAt: string
  match: MockMatch
}> = []

type MockMatch = (typeof MOCK_MATCHES)[number]

function notFound(): never {
  const err = new Error('Not found in demo')
  ;(err as { status?: number }).status = 404
  throw err
}

function paginate<T>(items: T[], limit: number, cursor: string | null, idOf: (item: T) => string) {
  const startIdx = cursor ? items.findIndex(i => idOf(i) === cursor) + 1 : 0
  const slice    = items.slice(startIdx, startIdx + limit)
  const hasMore  = startIdx + limit < items.length
  const last     = slice[slice.length - 1]
  return { items: slice, nextCursor: hasMore && last ? idOf(last) : null, hasMore }
}

export async function mockRequest(
  url: string,
  method: string,
  body?: unknown,
): Promise<unknown> {
  const [path = '', queryString] = url.split('?')
  const query = new URLSearchParams(queryString ?? '')
  const segs  = path.replace(/^\/api\/v1\//, '').split('/')

  // ── Auth ───────────────────────────────────────────────────
  if (path === '/api/v1/auth/request-otp' && method === 'POST') {
    return { message: 'کد تأیید ارسال شد (دمو)', expiresIn: 300 }
  }
  if (path === '/api/v1/auth/verify-otp' && method === 'POST') {
    return { accessToken: 'demo-access-token', requiresRegistration: false }
  }
  if (path === '/api/v1/auth/register' && method === 'POST') {
    return { accessToken: 'demo-access-token', userId: 'demo-user' }
  }

  // ── Matches ────────────────────────────────────────────────
  if (segs[0] === 'matches' && segs.length === 1 && method === 'GET') {
    const stage = query.get('stage')
    const list  = stage ? MOCK_MATCHES.filter(m => m.stage === stage) : MOCK_MATCHES
    return { data: list, total: list.length, page: 1, limit: list.length, pages: 1 }
  }
  if (segs[0] === 'matches' && segs[1] && method === 'GET') {
    const found = MOCK_MATCHES.find(m => m.id === segs[1])
    if (!found) notFound()
    return found
  }

  // ── Teams — intentionally unmocked: HomeGroups.tsx has a built-in
  //    static 48-team fallback that renders automatically on fetch failure.
  if (segs[0] === 'teams') notFound()

  // ── Rankings ───────────────────────────────────────────────
  if (path === '/api/v1/rankings' && method === 'GET') {
    const limit  = Number(query.get('limit') ?? 50)
    const cursor = query.get('cursor')
    const start  = cursor ? Number(cursor) : 0
    const items  = MOCK_RANKINGS.slice(start, start + limit)
    const hasMore = start + limit < MOCK_RANKINGS.length
    return { items, nextCursor: hasMore ? String(start + limit) : null }
  }
  if (path === '/api/v1/users/me/rank' && method === 'GET') {
    return { rank: 1, totalPoints: 27 }
  }

  // ── Content ────────────────────────────────────────────────
  if (path === '/api/v1/rules' && method === 'GET')  return { rules: MOCK_RULES }
  if (path === '/api/v1/prizes' && method === 'GET') return { prizes: MOCK_PRIZES }
  if (path === '/api/v1/avatars' && method === 'GET') return { avatars: MOCK_AVATARS }
  if (path === '/api/v1/announcements' && method === 'GET') {
    const limit = Number(query.get('limit') ?? 10)
    return paginate(MOCK_ANNOUNCEMENTS, limit, query.get('cursor'), a => a.id)
  }

  // ── Profile ────────────────────────────────────────────────
  if (path === '/api/v1/users/me' && method === 'GET') return demoProfile
  if (path === '/api/v1/users/me' && method === 'PUT') {
    demoProfile = { ...demoProfile, ...(body as object) }
    return demoProfile
  }
  if (path === '/api/v1/users/me' && method === 'DELETE') return undefined

  // ── Predictions ────────────────────────────────────────────
  if (path === '/api/v1/predictions' && method === 'GET') {
    const limit = Number(query.get('limit') ?? 20)
    return paginate(demoPredictions, limit, query.get('cursor'), p => p.id)
  }
  if (path === '/api/v1/predictions' && method === 'POST') {
    const b = body as { matchId: string; homeScore: number; awayScore: number }
    const m = MOCK_MATCHES.find(x => x.id === b.matchId)
    const prediction = {
      id: `pred-${Date.now()}`, homeScore: b.homeScore, awayScore: b.awayScore,
      pointsEarned: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      match: m ?? (MOCK_MATCHES[0] as MockMatch),
    }
    demoPredictions = [prediction, ...demoPredictions]
    return prediction
  }
  if (segs[0] === 'predictions' && segs[1] && method === 'PUT') {
    const b = body as { homeScore: number; awayScore: number }
    demoPredictions = demoPredictions.map(p =>
      p.id === segs[1] ? { ...p, homeScore: b.homeScore, awayScore: b.awayScore, updatedAt: new Date().toISOString() } : p,
    )
    return demoPredictions.find(p => p.id === segs[1])
  }

  // ── Admin ──────────────────────────────────────────────────
  if (segs[0] === 'admin') {
    if (segs[1] === 'stats' && method === 'GET') {
      return { totalUsers: 248, totalPredictions: 1862, finalizedMatches: 4, pendingJobs: 0 }
    }
    if (segs[1] === 'matches' && method === 'GET') return { data: MOCK_MATCHES }
    if (segs[1] === 'users' && method === 'GET') {
      return {
        data: MOCK_RANKINGS.map(r => ({
          id: r.userId, firstName: r.firstName, lastName: null, mobile: r.mobileMasked,
          role: 'user', avatarUrl: null, totalPoints: r.totalPoints, createdAt: '2026-01-01T00:00:00Z',
        })),
      }
    }
    if (segs[1] === 'predictions' && method === 'GET') {
      return {
        data: demoPredictions.map(p => ({
          id: p.id, homeScore: p.homeScore, awayScore: p.awayScore, pointsEarned: p.pointsEarned,
          createdAt: p.createdAt,
          user: { firstName: demoProfile.firstName },
          match: { homeTeam: p.match.homeTeam, awayTeam: p.match.awayTeam },
        })),
      }
    }
    if (segs[1] === 'announcements' && method === 'GET') return { data: MOCK_ANNOUNCEMENTS }
    if (segs[1] === 'rules' && method === 'GET')  return { data: MOCK_RULES }
    if (segs[1] === 'prizes' && method === 'GET') return { data: MOCK_PRIZES }
    // Any admin write (POST/PUT/DELETE) — accept and echo back, no real persistence.
    if (['POST', 'PUT', 'DELETE'].includes(method)) return body ?? { ok: true }
  }

  notFound()
}
