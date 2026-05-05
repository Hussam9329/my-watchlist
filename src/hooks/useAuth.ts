// ==================== Shared Auth Hook ====================

'use client'

import { useState, useEffect } from 'react'

export function useAuth() {
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth !== 'true') {
      window.location.href = '/'
      return
    }
    setIsAuthChecked(true)
  }, [])

  return isAuthChecked
}
