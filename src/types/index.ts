// ── Shared TypeScript types across the app ────────────────────

export type UserRole = 'user' | 'admin'
export type Locale   = 'fa'
export type Theme    = 'dark' | 'light'
export type MatchStage =
  | 'GROUP'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL'

export type ScoringJobStatus = 'pending' | 'processing' | 'done' | 'failed'

// ── API response shapes (client-facing) ───────────────────────

export interface UserProfile {
  id:        string
  firstName: string
  mobile:    string  // always masked on client (0912****567)
  email:     string | null
  role:      UserRole
  locale:    Locale
  theme:     Theme
  avatar:    { id: string; category: string; url: string | null } | null
  createdAt: string
}

export interface MatchSummary {
  id:                 string
  stage:              MatchStage
  bracketSlot:        string
  kickoffAt:          string
  predictionLockedAt: string | null
  homeScore:          number | null
  awayScore:          number | null
  isFinalized:        boolean
  homeTeam:           TeamSummary | null
  awayTeam:           TeamSummary | null
}

export interface TeamSummary {
  id:      string
  fifaCode: string
  nameEn:  string
  nameFa:  string
  flagUrl: string | null
}

export interface PredictionWithMatch {
  id:           string
  homeScore:    number
  awayScore:    number
  pointsEarned: number | null
  match:        MatchSummary
}

export interface RankingRow {
  rank:         number
  userId:       string
  firstName:    string
  mobileMasked: string    // always 0912****567 format
  totalPoints:  number
  avatarUrl:    string | null
}

export interface ScoringJobProgress {
  id:          string
  status:      ScoringJobStatus
  totalRows:   number | null
  processed:   number
  progress:    number | null  // 0–100
  startedAt:   string | null
  completedAt: string | null
  errorMessage: string | null
}

// ── JWT payload shapes ────────────────────────────────────────

export interface AccessTokenPayload {
  sub:  string     // userId
  role: UserRole
  iat:  number
  exp:  number
}

export interface RefreshTokenPayload {
  sub: string     // userId
  jti: string     // token ID
  iat: number
  exp: number
}

// ── Next.js request augmentation ──────────────────────────────

declare module 'next/server' {
  // x-user-id and x-user-role are forwarded by middleware
  // Access via: req.headers.get('x-user-id')
}
