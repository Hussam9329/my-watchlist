'use client'

import { useEffect, useState } from 'react'

export default function RatingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth !== 'true') {
      window.location.href = '/'
      return
    }
    setIsAuthenticated(true)
  }, [])

  if (!isAuthenticated) return null

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/ratings/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
          display: 'block'
        }}
        title="قائمة المشاهدة"
      />
    </div>
  )
}
