/**
 * Iranian National ID (Kode Melli) validator.
 * 10-digit number with weighted checksum (mod 11 algorithm).
 * Reference: https://www.codeiran.ir/national-id-validation
 */

export function validateNationalId(id: string): boolean {
  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(id)) return false

  // All identical digits are invalid (e.g. 1111111111)
  if (/^(\d)\1{9}$/.test(id)) return false

  const digits = id.split('').map(Number)
  const checkDigit = digits[9]!

  // Weighted sum of first 9 digits (weights: 10, 9, 8, ..., 2)
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i]! * (10 - i)
  }

  const remainder = sum % 11

  if (remainder < 2) {
    return checkDigit === remainder
  } else {
    return checkDigit === 11 - remainder
  }
}
