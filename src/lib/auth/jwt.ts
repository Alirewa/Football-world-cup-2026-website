import { SignJWT, jwtVerify, importPKCS8, importSPKI, type KeyLike } from 'jose'
import { env } from '@/lib/env'

const ALGORITHM   = 'RS256'
const ACCESS_TTL  = '15m'
const REFRESH_TTL = '30d'

export interface AccessTokenPayload {
  sub:  string   // userId
  role: 'user' | 'admin'
  iat:  number
  exp:  number
}

export interface RefreshTokenPayload {
  sub: string   // userId
  jti: string   // refresh token ID (matches refresh_tokens.jti)
  iat: number
  exp: number
}

// ── Key caching ──────────────────────────────────────────────

let _privateKey: KeyLike | null = null
let _publicKey:  KeyLike | null = null

async function getPrivateKey(): Promise<KeyLike> {
  if (!_privateKey) {
    // Replace escaped newlines from env vars
    const pem = env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n')
    _privateKey = await importPKCS8(pem, ALGORITHM)
  }
  return _privateKey
}

async function getPublicKey(): Promise<KeyLike> {
  if (!_publicKey) {
    const pem = env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n')
    _publicKey = await importSPKI(pem, ALGORITHM)
  }
  return _publicKey
}

// ── Token issuance ───────────────────────────────────────────

export async function signAccessToken(payload: {
  userId: string
  role: 'user' | 'admin'
}): Promise<string> {
  const key = await getPrivateKey()
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(key)
}

export async function signRefreshToken(jti: string, userId: string): Promise<string> {
  const key = await getPrivateKey()
  return new SignJWT({})
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(key)
}

// ── Token verification ───────────────────────────────────────

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const key = await getPublicKey()
  const { payload } = await jwtVerify(token, key, { algorithms: [ALGORITHM] })

  if (!payload.sub || !payload.role) {
    throw new Error('Invalid access token payload')
  }

  return {
    sub:  payload.sub,
    role: payload['role'] as 'user' | 'admin',
    iat:  payload.iat ?? 0,
    exp:  payload.exp ?? 0,
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const key = await getPublicKey()
  const { payload } = await jwtVerify(token, key, { algorithms: [ALGORITHM] })

  if (!payload.sub || !payload.jti) {
    throw new Error('Invalid refresh token payload')
  }

  return {
    sub: payload.sub,
    jti: payload.jti,
    iat: payload.iat ?? 0,
    exp: payload.exp ?? 0,
  }
}

// ── Helpers ──────────────────────────────────────────────────

/** 30 days from now as a Date object (for refresh_tokens.expires_at) */
export function refreshTokenExpiresAt(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d
}

/** Extract access token from Authorization: Bearer <token> header */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
