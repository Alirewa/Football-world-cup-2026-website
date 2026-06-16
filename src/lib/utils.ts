import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPoints(pts: number | null | undefined): string {
  if (pts == null) return '—'
  return pts.toLocaleString()
}

export function maskMobile(mobile: string): string {
  if (mobile.length !== 11) return mobile
  return mobile.slice(0, 4) + '****' + mobile.slice(7)
}

export function formatDate(iso: string, _locale?: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fa-IR', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
    hour:  '2-digit',
    minute: '2-digit',
  })
}

export function isPredictionLocked(predictionLockedAt: string): boolean {
  return new Date() >= new Date(predictionLockedAt)
}

export function validateNationalId(id: string): boolean {
  if (!/^\d{10}$/.test(id)) return false
  if (/^(.)\1{9}$/.test(id)) return false // all same digit
  const digits = id.split('').map(Number)
  let sum = 0
  for (let i = 0; i < 9; i++) sum += digits[i]! * (10 - i)
  const remainder = sum % 11
  const check = digits[9]!
  return remainder < 2 ? check === remainder : check === (11 - remainder)
}

export function normalizeMobile(mobile: string): string {
  const cleaned = mobile.replace(/\D/g, '')
  if (cleaned.startsWith('98') && cleaned.length === 12) return '0' + cleaned.slice(2)
  if (cleaned.startsWith('+98') && cleaned.length === 13) return '0' + cleaned.slice(3)
  return cleaned
}
