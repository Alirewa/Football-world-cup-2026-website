'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname          = usePathname()
  const [visible, setVisible] = useState(false)
  const [width, setWidth]     = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef   = useRef<number | null>(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname

    // Clear any pending timers
    if (timerRef.current) clearTimeout(timerRef.current)
    if (rafRef.current)   cancelAnimationFrame(rafRef.current)

    // Start: show bar at 5% immediately
    setVisible(true)
    setWidth(5)

    // Animate to 85% over ~600ms with easing
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / 600, 1)
      const eased    = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
      setWidth(5 + eased * 80) // 5% → 85%
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)

    // Complete bar after 700ms (navigation usually done by then)
    timerRef.current = setTimeout(() => {
      setWidth(100)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 300)
    }, 700)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current)   cancelAnimationFrame(rafRef.current)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      style={{
        background: 'transparent',
      }}
    >
      <div
        style={{
          height:     '100%',
          width:      `${width}%`,
          background: 'linear-gradient(90deg, #0E7A43, #10B981)',
          boxShadow:  '0 0 8px rgba(14,122,67,0.7)',
          transition: width === 100 ? 'width 0.2s ease-out' : 'none',
        }}
      />
    </div>
  )
}
