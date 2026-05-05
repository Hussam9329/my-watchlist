// ==================== Shared Auth Hook ====================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth !== 'true') {
      router.replace('/')
      return
    }
    setIsAuthChecked(true)
  }, [router])

  return isAuthChecked
}
