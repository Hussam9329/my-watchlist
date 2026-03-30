'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, BookOpen, Lightbulb, Gamepad2 } from 'lucide-react'

export default function HussamVisionHome() {
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden relative" dir="rtl">
      {/* شبكة هندسية خلفية */}
      <div className="fixed inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <polygon points="150,50 250,200 50,200" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="350,30 450,180 250,180" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="600,80 700,230 500,230" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="850,20 950,170 750,170" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="100,300 200,450 0,450" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="400,350 500,500 300,500" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="700,300 800,450 600,450" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="1000,250 1100,400 900,400" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="250,500 350,650 150,650" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="550,550 650,700 450,700" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <polygon points="850,500 950,650 750,650" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
          <line x1="200" y1="180" x2="400" y2="350" stroke="url(#grad1)" strokeWidth="0.3" />
          <line x1="450" y1="180" x2="700" y2="300" stroke="url(#grad1)" strokeWidth="0.3" />
          <line x1="700" y1="230" x2="950" y2="170" stroke="url(#grad1)" strokeWidth="0.3" />
          <line x1="200" y1="450" x2="300" y2="500" stroke="url(#grad1)" strokeWidth="0.3" />
          <line x1="500" y1="500" x2="600" y2="450" stroke="url(#grad1)" strokeWidth="0.3" />
          <line x1="800" y1="450" x2="750" y2="500" stroke="url(#grad1)" strokeWidth="0.3" />
          <circle cx="250" cy="200" r="2" fill="#818cf8" opacity="0.8" />
          <circle cx="450" cy="180" r="2" fill="#818cf8" opacity="0.6" />
          <circle cx="700" cy="230" r="2" fill="#818cf8" opacity="0.7" />
          <circle cx="950" cy="170" r="2" fill="#818cf8" opacity="0.5" />
          <circle cx="500" cy="500" r="2" fill="#818cf8" opacity="0.8" />
          <circle cx="800" cy="450" r="2" fill="#818cf8" opacity="0.6" />
          <circle cx="200" cy="450" r="2" fill="#818cf8" opacity="0.7" />
          <circle cx="650" cy="700" r="2" fill="#818cf8" opacity="0.5" />
        </svg>

        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-[100px]" />

        <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
        <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[60%] left-[10%] w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[70%] right-[25%] w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[45%] right-[40%] w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] left-[40%] w-1 h-1 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* المحتوى */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        
        {/* الشعار */}
        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                  <div className="absolute inset-0 w-8 h-8 bg-indigo-400/30 blur-xl rounded-full" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-6xl sm:text-7xl md:text-8xl font-bold mb-4 tracking-tight"
              >
                <span className="bg-gradient-to-l from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  Hussam
                </span>
                <span className="bg-gradient-to-l from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  Vision
                </span>
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="w-32 h-[1px] mx-auto mb-5 bg-gradient-to-l from-transparent via-indigo-500 to-transparent"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-sm sm:text-base tracking-[0.3em] text-emerald-400/70 font-light"
              >
                PRECISION ANALYTICS &bull; STRATEGIC FORESIGHT
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* بطاقات التطبيقات */}
        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full max-w-4xl"
            >
              {/* بطاقة أريد مشاهدته */}
              <motion.a
                href="/archive"
                onHoverStart={() => setHoveredCard('archive')}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-indigo-500/20 bg-gradient-to-b from-[#0f1629] to-[#0a0f1e] p-6 text-center transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent transition-opacity duration-300 ${hoveredCard === 'archive' ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-xl transition-opacity duration-300 rounded-2xl ${hoveredCard === 'archive' ? 'opacity-50' : 'opacity-0'}`} />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotateY: hoveredCard === 'archive' ? 5 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-24 h-24 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500/15 to-amber-700/10 border border-amber-500/25 shadow-lg shadow-amber-500/10"
                  >
                    <BookOpen className="w-11 h-11 text-amber-400" />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-l from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    أريد مشاهدته
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    تتبع أفلامك ومسلسلاتك وأنمياتك
                  </p>

                  <motion.div
                    animate={{ x: hoveredCard === 'archive' ? -5 : 0 }}
                    className="mt-4 flex items-center justify-center gap-1 text-blue-400 text-sm"
                  >
                    <span>ادخل الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.a>

              {/* بطاقة أريد قرائته */}
              <motion.a
                href="/books"
                onHoverStart={() => setHoveredCard('books')}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-emerald-500/20 bg-gradient-to-b from-[#0f1629] to-[#0a0f1e] p-6 text-center transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent transition-opacity duration-300 ${hoveredCard === 'books' ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute -inset-1 bg-gradient-to-b from-emerald-500/20 to-emerald-700/20 blur-xl transition-opacity duration-300 rounded-2xl ${hoveredCard === 'books' ? 'opacity-50' : 'opacity-0'}`} />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotateY: hoveredCard === 'books' ? -5 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-24 h-24 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500/15 to-emerald-700/10 border border-emerald-500/25 shadow-lg shadow-emerald-500/10"
                  >
                    <BookOpen className="w-11 h-11 text-emerald-400" />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-l from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent">
                    أريد قرائته
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    تتبع كتبك ومؤلفاتك المفضلة
                  </p>

                  <motion.div
                    animate={{ x: hoveredCard === 'books' ? -5 : 0 }}
                    className="mt-4 flex items-center justify-center gap-1 text-emerald-400 text-sm"
                  >
                    <span>ادخل الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.a>

              {/* بطاقة أفكاري */}
              <motion.a
                href="/ideas"
                onHoverStart={() => setHoveredCard('ideas')}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-purple-500/20 bg-gradient-to-b from-[#0f1629] to-[#0a0f1e] p-6 text-center transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent transition-opacity duration-300 ${hoveredCard === 'ideas' ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute -inset-1 bg-gradient-to-b from-purple-500/20 to-pink-500/20 blur-xl transition-opacity duration-300 rounded-2xl ${hoveredCard === 'ideas' ? 'opacity-50' : 'opacity-0'}`} />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotateY: hoveredCard === 'ideas' ? -5 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-24 h-24 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500/15 to-purple-700/10 border border-purple-500/25 shadow-lg shadow-purple-500/10"
                  >
                    <Lightbulb className="w-11 h-11 text-purple-400" />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-l from-purple-300 via-violet-400 to-purple-500 bg-clip-text text-transparent">
                    أفكاري
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    دوّن أفكارك وخطط لمشاريعك المستقبلية
                  </p>

                  <motion.div
                    animate={{ x: hoveredCard === 'ideas' ? -5 : 0 }}
                    className="mt-4 flex items-center justify-center gap-1 text-purple-400 text-sm"
                  >
                    <span>ادخل الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.a>

              {/* بطاقة أريد لعبها */}
              <motion.a
                href="/games"
                onHoverStart={() => setHoveredCard('games')}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-teal-500/20 bg-gradient-to-b from-[#0f1629] to-[#0a0f1e] p-6 text-center transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent transition-opacity duration-300 ${hoveredCard === 'games' ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute -inset-1 bg-gradient-to-b from-teal-500/20 to-cyan-500/20 blur-xl transition-opacity duration-300 rounded-2xl ${hoveredCard === 'games' ? 'opacity-50' : 'opacity-0'}`} />

                <div className="relative z-10">
                  <motion.div
                    animate={{ rotateY: hoveredCard === 'games' ? 5 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-24 h-24 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-gradient-to-br from-teal-500/15 to-cyan-700/10 border border-teal-500/25 shadow-lg shadow-teal-500/10"
                  >
                    <Gamepad2 className="w-11 h-11 text-teal-400" />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-l from-teal-300 via-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    أريد لعبها
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    تتبع ألعابك المفضلة على كل المنصات
                  </p>

                  <motion.div
                    animate={{ x: hoveredCard === 'games' ? -5 : 0 }}
                    className="mt-4 flex items-center justify-center gap-1 text-teal-400 text-sm"
                  >
                    <span>ادخل الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* تذييل */}
        <AnimatePresence>
          {mounted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="mt-16 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-neutral-600 text-xs">
                <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-neutral-700" />
                <span>صُنع بـ ❤️ بواسطة Hussam</span>
                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-neutral-700" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
