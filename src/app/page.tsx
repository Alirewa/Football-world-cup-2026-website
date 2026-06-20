'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Only reached in the static export build (no middleware to rewrite "/" -> "/fa").
export default function RootRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/fa') }, [router])
  return null
}
