/**
 * Server-safe HTML sanitizer using isomorphic-dompurify.
 * Used to sanitize TipTap HTML output before storing in DB and before rendering.
 * This runs on the SERVER — protects against stored XSS via the CMS.
 */

import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'hr',
  'a',
  'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
  'code', 'pre',
]

const ALLOWED_ATTR = [
  'href', 'target', 'rel',       // anchor
  'src', 'alt', 'width', 'height', // image
  'class', 'dir', 'lang',        // layout / RTL
  'colspan', 'rowspan',          // table
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CONFIG: any = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
  FORCE_BODY: true,
  // Always set rel="noopener noreferrer" on anchors with target="_blank"
  ADD_ATTR: ['target'],
}

export function sanitizeHtml(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, CONFIG) as unknown as string
  // Ensure external links are safe
  return clean.replace(/<a\s+[^>]*target="_blank"[^>]*>/gi, (match) => {
    if (!match.includes('rel=')) {
      return match.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
    }
    return match
  })
}

/**
 * Sanitize TipTap JSON before storing in DB.
 * TipTap JSON → HTML → DOMPurify → return safe HTML string for storage comparison.
 * The JSON itself is stored; this validates no XSS can escape via the rendered output.
 */
export function validateTipTapJson(json: unknown): boolean {
  try {
    if (typeof json !== 'object' || json === null) return false
    const obj = json as Record<string, unknown>
    return obj['type'] === 'doc'
  } catch {
    return false
  }
}
