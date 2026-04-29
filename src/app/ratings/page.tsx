'use client'

import { useEffect, useState } from 'react'

export default function RatingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth !== 'true') {
      window.location.href = '/'
      return
    }
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4a843',
        fontSize: '2rem',
        fontFamily: 'Tajawal, sans-serif',
      }}>
        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <iframe
      src="/ratings/index.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="تقييماتي"
    />
  )
}
