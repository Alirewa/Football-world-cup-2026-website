'use client'

import { useRef } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?:   number
  value:     string
  onChange:  (value: string) => void
  disabled?: boolean
  error?:    string
}

export function OtpInput({ length = 6, value, onChange, disabled, error }: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits    = value.padEnd(length, '').split('').slice(0, length)

  function focus(index: number) {
    inputRefs.current[index]?.focus()
    inputRefs.current[index]?.select()
  }

  function handleChange(index: number, val: string) {
    const cleaned = val.replace(/\D/g, '')
    if (!cleaned) return

    const newDigits = [...digits]
    newDigits[index] = cleaned[cleaned.length - 1]!
    const newValue   = newDigits.join('').replace(/\s/g, '').slice(0, length)
    onChange(newValue)

    if (cleaned && index < length - 1) focus(index + 1)
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join(''))
      } else if (index > 0) {
        focus(index - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      focus(Math.max(0, index - 1))
    } else if (e.key === 'ArrowRight') {
      focus(Math.min(length - 1, index + 1))
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted.padEnd(length, '').slice(0, length).trimEnd())
    if (pasted.length > 0) focus(Math.min(pasted.length, length - 1))
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 dir-ltr" dir="ltr">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ''}
            disabled={disabled}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={e => e.target.select()}
            className={cn(
              'otp-box',
              error && 'border-red-500',
            )}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
