/**
 * Iranian mobile number validator and normalizer.
 * Valid format: 09XXXXXXXXX (11 digits, must start with 09)
 * Supports input formats: +989..., 00989..., 9..., 09...
 */

const MOBILE_REGEX = /^09[0-9]{9}$/

export function normalizeMobile(input: string): string {
  // Strip all non-digit characters
  const digits = input.replace(/\D/g, '')

  // +98XXXXXXXXXX or 0098XXXXXXXXXX → 09XXXXXXXXX
  if ((digits.startsWith('98') && digits.length === 12)) {
    return '0' + digits.slice(2)
  }

  // 9XXXXXXXXX (10 digits starting with 9) → 09XXXXXXXXX
  if (digits.length === 10 && digits.startsWith('9')) {
    return '0' + digits
  }

  // Already 09XXXXXXXXX
  return digits
}

export function isValidMobile(mobile: string): boolean {
  return MOBILE_REGEX.test(mobile)
}

export function normalizeMobileAndValidate(
  input: string,
): { mobile: string; valid: boolean } {
  const mobile = normalizeMobile(input)
  return { mobile, valid: isValidMobile(mobile) }
}

/** Mask for public display: 09121234567 → 0912****567 */
export function maskMobile(mobile: string): string {
  if (!isValidMobile(mobile)) return '***'
  return mobile.slice(0, 4) + '****' + mobile.slice(-3)
}
