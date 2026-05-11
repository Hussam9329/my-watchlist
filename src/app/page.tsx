'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, BookOpen, Gamepad2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || '204871'

export default function HussamVisionHome() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [passwordInput, setPasswordInput] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      setShowLogin(false)
    }
  }, [])

  const handleLogin = () => {
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true)
      setShowLogin(false)
      localStorage.setItem('hussamvision_auth', 'true')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowLogin(true)
    localStorage.removeItem('hussamvision_auth')
    setPasswordInput('')
  }

  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-[#030712] text-white flex items-center justify-center safe-top safe-bottom">
        <div className="w-full max-w-sm px-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-l from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Hussam</span>
              <span className="bg-gradient-to-l from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">Vision</span>
            </h1>
            <p className="text-neutral-500">أدخل كلمة المرور للدخول</p>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="كلمة المرور"
              autoFocus
              autoComplete="current-password"
              enterKeyHint="go"
              className="bg-[#1a1a2a] border-[#2a2a3a] focus:border-indigo-500 h-14 text-center text-lg rounded-xl"

            />
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold h-14 rounded-xl text-lg active:scale-[0.97] transition-transform"
            >
              دخول
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const cards = [
    { href: '/archive', icon: BookOpen, title: 'أرشيف حسام', desc: 'أرشيفك الشامل: أفلام، مسلسلات، أنمي وتقييمات', color: 'amber', border: 'border-indigo-500/20', gradient: 'from-amber-500/15 to-amber-700/10', iconBorder: 'border-amber-500/25', iconShadow: 'shadow-amber-500/10', textGradient: 'from-amber-300 via-yellow-400 to-amber-500', textColor: 'text-blue-400' },
    { href: '/books', icon: BookOpen, title: 'أريد قرائته', desc: 'تتبع كتبك ومؤلفاتك المفضلة', color: 'emerald', border: 'border-emerald-500/20', gradient: 'from-emerald-500/15 to-emerald-700/10', iconBorder: 'border-emerald-500/25', iconShadow: 'shadow-emerald-500/10', textGradient: 'from-emerald-300 via-green-400 to-emerald-500', textColor: 'text-emerald-400' },
    { href: '/games', icon: Gamepad2, title: 'أريد لعبها', desc: 'تتبع ألعابك المفضلة على كل المنصات', color: 'teal', border: 'border-teal-500/20', gradient: 'from-teal-500/15 to-cyan-700/10', iconBorder: 'border-teal-500/25', iconShadow: 'shadow-teal-500/10', textGradient: 'from-teal-300 via-emerald-400 to-teal-500', textColor: 'text-teal-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#030712] text-white" dir="rtl">
      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-6 sm:py-12 safe-top safe-bottom">
        {/* الشعار */}
        <div className="text-center mb-6 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-8 h-8 text-indigo-400">✦</div>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 sm:mb-4 tracking-tight">
            <span className="bg-gradient-to-l from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Hussam</span>
            <span className="bg-gradient-to-l from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">Vision</span>
          </h1>
          <div className="w-20 sm:w-32 h-[1px] mx-auto mb-3 sm:mb-5 bg-gradient-to-l from-transparent via-indigo-500 to-transparent" />
          <p className="text-[10px] sm:text-sm tracking-[0.15em] sm:tracking-[0.3em] text-emerald-400/70 font-light">
            PRECISION ANALYTICS &bull; STRATEGIC FORESIGHT
          </p>
        </div>

        {/* بطاقات التطبيقات */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-5xl">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <a
                key={card.href}
                href={card.href}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border bg-gradient-to-b from-[#0f1629] to-[#0a0f1e] p-4 sm:p-6 text-center transition-all duration-150 touch-active active:scale-[0.97]"
                style={{ borderColor: `var(--card-border, rgba(99,102,241,0.2))` }}
              >
                <div className="relative z-10">
                  <div className={`w-14 h-14 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-5 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br ${card.gradient} border ${card.iconBorder} shadow-lg ${card.iconShadow}`}>
                    <Icon className={`w-7 h-7 sm:w-11 sm:h-11 text-${card.color}-400`} />
                  </div>
                  <h3 className={`text-base sm:text-2xl font-bold mb-1 sm:mb-2 bg-gradient-to-l ${card.textGradient} bg-clip-text text-transparent`}>
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed hidden sm:block">
                    {card.desc}
                  </p>
                  <div className={`mt-3 sm:mt-4 flex items-center justify-center gap-1 ${card.textColor} text-sm sm:text-sm`}>
                    <span>ادخل الآن</span>
                    <ArrowLeft className="w-4 h-4 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* تذييل */}
        <div className="mt-8 sm:mt-16 text-center safe-bottom">
          <div className="flex items-center justify-center gap-4 text-neutral-600 text-xs">
            <div className="flex items-center gap-2 text-neutral-500 cursor-pointer hover:text-neutral-300 active:text-neutral-200" onClick={handleLogout}>
              خروج
            </div>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-neutral-700" />
            <span>صُنع بـ ❤️ بواسطة Hussam</span>
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-neutral-700" />
          </div>
        </div>
      </div>
    </div>
  )
}
