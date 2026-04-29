'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Star, Film, Tv, Sparkles, Gamepad2, BookOpen, Search, Loader2,
  ArrowRight, Dice5, Download, Edit3, Trash2, Check, X,
  BarChart3, CalendarDays, Filter, ArrowUpDown, Eye
} from 'lucide-react'

interface RatedItem {
  id: string
  title: string
  originalTitle?: string
  year: string
  type: string
  poster?: string | null
  rating?: string | null
  overview?: string | null
  genres: string | string[]
  episodes?: number | null
  seasons?: number | null
  duration?: string | null
  status?: string | null
  author?: string | null
  tags: string | string[]
  notes: string
  favorite: boolean
  watched: boolean
  watchedAt?: string | null
  userRating?: number | null
  addedAt: string
  updatedAt: string
}

type TabType = 'all' | 'movie' | 'series' | 'anime' | 'game' | 'book'
type SortBy = 'userRating' | 'year' | 'title' | 'addedAt'

const TYPE_CONFIG: Record<TabType, { icon: typeof Star; label: string; plural: string; color: string; bgColor: string }> = {
  all: { icon: Star, label: 'الكل', plural: 'جميع التقييمات', color: 'from-yellow-500 to-amber-600', bgColor: 'bg-yellow-500/10' },
  movie: { icon: Film, label: 'فيلم', plural: 'أفلام', color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/10' },
  series: { icon: Tv, label: 'مسلسل', plural: 'مسلسلات', color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-500/10' },
  anime: { icon: Sparkles, label: 'أنمي', plural: 'أنميات', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10' },
  game: { icon: Gamepad2, label: 'لعبة', plural: 'ألعاب', color: 'from-teal-500 to-cyan-500', bgColor: 'bg-teal-500/10' },
  book: { icon: BookOpen, label: 'كتاب', plural: 'كتب', color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-500/10' },
}

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Anime', 'Animation', 'Biography', 'Comedy', 'Comics',
  'Crime', 'Disaster', 'Documentary', 'Drama', 'Fantasy', 'History', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western', 'Other'
]

const YEARS_RANGE = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

const APP_PASSWORD = '20262028'

function getRatingColor(rating: number): string {
  if (rating >= 70) return 'text-green-400 bg-green-500/15 border-green-500/25'
  if (rating >= 40) return 'text-amber-400 bg-amber-500/15 border-amber-500/25'
  return 'text-red-400 bg-red-500/15 border-red-500/25'
}

function getRatingBarColor(rating: number): string {
  if (rating >= 70) return 'bg-green-500'
  if (rating >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

function getDisplayTitle(item: RatedItem): string {
  return item.originalTitle || item.title || ''
}

export default function RatingsPage() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showLogin, setShowLogin] = useState(true)

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [allItems, setAllItems] = useState<RatedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('userRating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterGenre, setFilterGenre] = useState<string>('all')
  const [filterMinRating, setFilterMinRating] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const [editingItem, setEditingItem] = useState<RatedItem | null>(null)
  const [editRating, setEditRating] = useState<string>('')
  const [showEditDialog, setShowEditDialog] = useState(false)

  const [pickerResult, setPickerResult] = useState<string>('')

  // Fetch all items
  const fetchAllItems = useCallback(async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/watchlist')
      const data = await response.json()
      if (data.items && Array.isArray(data.items)) {
        setAllItems(data.items.filter((i: RatedItem) => i.userRating !== null && i.userRating !== undefined))
        setSyncStatus('synced')
      } else {
        setAllItems([])
        setSyncStatus('error')
      }
    } catch {
      setSyncStatus('error')
      setAllItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const auth = localStorage.getItem('ratings_auth')
    if (auth === 'true') { setIsAuthenticated(true); setShowLogin(false) }
  }, [])

  useEffect(() => { fetchAllItems() }, [fetchAllItems])

  // Computed
  const filteredItems = useMemo(() => {
    let items = activeTab === 'all' ? [...allItems] : allItems.filter(i => i.type === activeTab)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.originalTitle?.toLowerCase().includes(q)
      )
    }

    if (filterYear !== 'all') items = items.filter(i => i.year === filterYear)

    if (filterGenre !== 'all') {
      items = items.filter(i => {
        const genres = typeof i.genres === 'string' ? i.genres : (i.genres || []).join(', ')
        return genres.toLowerCase().includes(filterGenre.toLowerCase())
      })
    }

    if (filterMinRating) {
      const minR = parseFloat(filterMinRating)
      if (!isNaN(minR)) items = items.filter(i => (i.userRating || 0) >= minR)
    }

    items.sort((a, b) => {
      let c = 0
      if (sortBy === 'userRating') c = (a.userRating || 0) - (b.userRating || 0)
      else if (sortBy === 'year') c = parseInt(a.year) - parseInt(b.year)
      else if (sortBy === 'title') c = getDisplayTitle(a).localeCompare(getDisplayTitle(b))
      else c = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
      return sortOrder === 'asc' ? c : -c
    })

    return items
  }, [allItems, activeTab, searchQuery, filterYear, filterGenre, filterMinRating, sortBy, sortOrder])

  const stats = useMemo(() => {
    const items = activeTab === 'all' ? allItems : allItems.filter(i => i.type === activeTab)
    const ratings = items.map(i => i.userRating || 0).filter(r => r > 0)
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    const genreMap: Record<string, number> = {}
    items.forEach(i => {
      const genres = typeof i.genres === 'string' ? i.genres.split(',').map(g => g.trim()).filter(Boolean) : (i.genres || [])
      genres.forEach(g => { genreMap[g] = (genreMap[g] || 0) + 1 })
    })
    const topGenre = Object.keys(genreMap).sort((a, b) => genreMap[b] - genreMap[a])[0] || '-'

    const yearMap: Record<string, number> = {}
    items.forEach(i => { if (i.year) yearMap[i.year] = (yearMap[i.year] || 0) + 1 })
    const topYear = Object.keys(yearMap).sort((a, b) => yearMap[b] - yearMap[a])[0] || '-'

    const now = new Date()
    const thisMonth = items.filter(i => {
      const d = new Date(i.addedAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length

    return { total: items.length, avg: avg.toFixed(1), topGenre, topYear, thisMonth }
  }, [allItems, activeTab])

  const tabStats = useMemo(() => {
    const base = (type: string) => allItems.filter(i => i.type === type).length
    return {
      all: allItems.length,
      movie: base('movie'),
      series: base('series'),
      anime: base('anime'),
      game: base('game'),
      book: base('book'),
    }
  }, [allItems])

  // Actions
  const handleLogin = () => {
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true); setShowLogin(false)
      localStorage.setItem('ratings_auth', 'true')
      toast({ title: 'مرحباً بك!', description: 'تم تسجيل الدخول بنجاح' })
    } else {
      toast({ title: 'خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false); setShowLogin(true)
    localStorage.removeItem('ratings_auth'); setPasswordInput('')
  }

  const openEditRating = (item: RatedItem) => {
    setEditingItem(item)
    setEditRating(item.userRating?.toString() || '')
    setShowEditDialog(true)
  }

  const saveRating = async () => {
    if (!editingItem) return
    const rating = parseFloat(editRating)
    if (isNaN(rating) || rating < 0 || rating > 100) {
      toast({ title: 'خطأ', description: 'التقييم يجب أن يكون بين 0 و 100', variant: 'destructive' })
      return
    }
    try {
      await fetch(`/api/watchlist/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRating: rating, watched: true })
      })
      setAllItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, userRating: rating } : i))
      toast({ title: 'تم الحفظ', description: `تم تحديث تقييم "${getDisplayTitle(editingItem)}" إلى ${rating}/100` })
      setShowEditDialog(false); setEditingItem(null)
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحفظ', variant: 'destructive' })
    }
  }

  const removeRating = async (item: RatedItem) => {
    try {
      await fetch(`/api/watchlist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRating: null })
      })
      setAllItems(prev => prev.filter(i => i.id !== item.id))
      toast({ title: 'تم الحذف', description: `تم إزالة تقييم "${getDisplayTitle(item)}"` })
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحذف', variant: 'destructive' })
    }
  }

  const movieNightPicker = () => {
    const unwatched = allItems.filter(i => i.type === 'movie' && !i.watched)
    const candidates = unwatched.length > 0 ? unwatched : allItems.filter(i => i.type === 'movie')
    if (!candidates.length) {
      setPickerResult('لا توجد أفلام للتقييم حالياً')
      return
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    setPickerResult(`اختيار الليلة: ${getDisplayTitle(picked)} (${picked.year}) - تقييمك: ${picked.userRating || 'لم يُقيّم'}/100`)
  }

  const exportData = () => {
    const d = JSON.stringify(allItems, null, 2)
    const b = new Blob([d], { type: 'application/json' })
    const u = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = u; a.download = `ratings_${new Date().toISOString().split('T')[0]}.json`; a.click()
    URL.revokeObjectURL(u)
    toast({ title: 'تم التصدير', description: 'تم تصدير التقييمات بنجاح' })
  }

  const clearFilters = () => {
    setSearchQuery(''); setFilterYear('all'); setFilterGenre('all'); setFilterMinRating('')
  }

  // Login Screen
  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-full max-w-sm px-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
              <Star className="w-10 h-10 text-black fill-black" />
            </div>
            <h1 className="text-3xl font-bold mb-2">تقييماتي</h1>
            <p className="text-neutral-500">أدخل كلمة المرور للدخول</p>
          </div>
          <div className="space-y-4">
            <Input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="كلمة المرور"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-yellow-500 h-12 text-center text-lg" />
            <Button onClick={handleLogin} className="w-full bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold h-12">دخول</Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-yellow-500" /></div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-yellow-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8" dir="rtl">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <Button onClick={() => window.location.href = '/'} variant="ghost" size="icon" className="text-neutral-500 hover:text-white hover:bg-[#1a1a1a]">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
              <Star className="w-5 h-5 sm:w-7 sm:h-7 text-black fill-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">تقييماتي</h1>
              <div className="flex items-center gap-2">
                <p className="text-neutral-500 text-sm">قائمة التقييمات</p>
                <span className={`text-xs flex items-center gap-1 ${syncStatus === 'synced' ? 'text-green-500' : syncStatus === 'syncing' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {syncStatus === 'synced' ? 'متزامن' : syncStatus === 'syncing' ? 'مزامنة...' : 'خطأ'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button onClick={() => setShowStats(!showStats)} variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><BarChart3 className="w-5 h-5" /></Button>
            <Button onClick={handleLogout} variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><X className="w-5 h-5" /></Button>
            <Button onClick={exportData} variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><Download className="w-5 h-5" /></Button>
            <Button onClick={movieNightPicker} className="bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold gap-2">
              <Dice5 className="w-4 h-4" /><span className="hidden sm:inline">فيلم الليلة</span>
            </Button>
          </div>
        </header>

        {/* Picker Result */}
        {pickerResult && (
          <div className="bg-yellow-500/10 border border-dashed border-yellow-500/40 rounded-xl p-4 mb-6 text-center">
            <p className="text-yellow-300 font-medium">{pickerResult}</p>
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-yellow-500" />إحصائيات التقييمات</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-yellow-500">{stats.total}</p>
                <p className="text-sm text-neutral-400">إجمالي المُقيّمة</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-amber-400">{stats.avg}</p>
                <p className="text-sm text-neutral-400">متوسط التقييم</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-yellow-300">{stats.topGenre}</p>
                <p className="text-sm text-neutral-400">أكثر تصنيف</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-amber-300">{stats.topYear}</p>
                <p className="text-sm text-neutral-400">أكثر سنة</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-yellow-400">{stats.thisMonth}</p>
                <p className="text-sm text-neutral-400">هذا الشهر</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'movie', 'series', 'anime', 'game', 'book'] as TabType[]).map((type) => {
            const c = TYPE_CONFIG[type]; const I = c.icon; const active = activeTab === type
            return (
              <button key={type} onClick={() => setActiveTab(type)}
                className={`flex-shrink-0 min-w-[90px] sm:min-w-0 rounded-xl p-3 transition-all ${active ? 'bg-gradient-to-br ' + c.color + ' text-black shadow-lg' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'}`}>
                <div className="flex items-center gap-2">
                  <I className="w-5 h-5" />
                  <div className="text-right">
                    <p className="font-bold text-sm">{c.plural}</p>
                    <p className={`text-xs ${active ? 'opacity-80' : 'text-neutral-500'}`}>{tabStats[type]}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Search & Filters */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 sm:p-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث عن عمل مُقيّم..."
                className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-yellow-500 pr-9 h-10" />
            </div>
            <div className="hidden sm:flex">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-10">
                  <ArrowUpDown className="w-4 h-4 ml-2" /><SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="userRating">التقييم</SelectItem>
                  <SelectItem value="year">السنة</SelectItem>
                  <SelectItem value="title">العنوان</SelectItem>
                  <SelectItem value="addedAt">تاريخ الإضافة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')} className="h-10 w-10 text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`gap-2 h-10 ${showFilters ? 'border-yellow-500 text-yellow-500' : 'border-[#2a2a2a] text-neutral-400'}`}>
              <Filter className="w-4 h-4" /><span className="hidden sm:inline">فلاتر</span>
            </Button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#2a2a2a]">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[100px] sm:w-[120px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><CalendarDays className="w-4 h-4 ml-2" /><SelectValue placeholder="السنة" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]">
                  <SelectItem value="all">كل السنوات</SelectItem>
                  {YEARS_RANGE.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterGenre} onValueChange={setFilterGenre}>
                <SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="التصنيف" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]">
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {GENRE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" value={filterMinRating} onChange={(e) => setFilterMinRating(e.target.value)} placeholder="تقييم أعلى من..." min={0} max={100}
                className="w-[150px] bg-[#1a1a1a] border-[#2a2a2a] h-9" />
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-neutral-400"><X className="w-4 h-4 ml-1" />مسح</Button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-400">{filteredItems.length} نتيجة</p>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
              <Star className="w-12 h-12 text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">{allItems.length === 0 ? 'لا توجد تقييمات' : 'لا توجد نتائج'}</h3>
            <p className="text-neutral-500 mb-4">{allItems.length === 0 ? 'قم بتقييم أعمالك من صفحات الأقسام' : 'جرب تغيير الفلاتر'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const rating = item.userRating || 0
              const typeConfig = TYPE_CONFIG[item.type as TabType] || TYPE_CONFIG.all
              const TypeIcon = typeConfig.icon
              const genres = typeof item.genres === 'string' ? item.genres.split(',').map(g => g.trim()).filter(Boolean) : (item.genres || [])

              return (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-[#1a1a1a]/50 hover:bg-[#2a2a2a]/50 border border-[#2a2a2a]/50 transition-all group">
                  {/* Rating Badge */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl border flex flex-col items-center justify-center ${getRatingColor(rating)}`}>
                    <span className="text-lg font-black leading-none">{rating}</span>
                    <span className="text-[9px] opacity-60">/100</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold line-clamp-1">{getDisplayTitle(item)}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-neutral-400">{item.year}</span>
                          {item.seasons && <span className="text-xs text-neutral-400">• {item.seasons} موسم</span>}
                          {(item as any).author && item.type === 'game' && <span className="text-xs text-neutral-400">• {(item as any).author}</span>}
                          <Badge className={`text-[9px] bg-gradient-to-r ${typeConfig.color} text-white`}>{typeConfig.label}</Badge>
                          {genres.slice(0, 2).map(g => (
                            <Badge key={g} className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/25">{g}</Badge>
                          ))}
                          {item.favorite && <span className="text-red-400 text-xs">مفضلة</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" onClick={() => openEditRating(item)} className="w-8 h-8 text-neutral-400 hover:text-yellow-400">
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => removeRating(item)} className="w-8 h-8 text-neutral-400 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Rating Bar */}
                    <div className="mt-2 w-full h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${getRatingBarColor(rating)}`} style={{ width: `${rating}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Top Rated Section */}
        {allItems.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              أعلى 10 تقييمات
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[...allItems].sort((a, b) => (b.userRating || 0) - (a.userRating || 0)).slice(0, 10).map((item, idx) => {
                const rating = item.userRating || 0
                const typeConfig = TYPE_CONFIG[item.type as TabType] || TYPE_CONFIG.all
                return (
                  <div key={item.id} className="relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] hover:border-yellow-500/30 transition-all hover:scale-[1.02]">
                    <div className="aspect-[2/3] bg-[#1a1a1a]">
                      {item.poster ? (
                        <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${typeConfig.bgColor}`}>
                          <Star className="w-12 h-12 text-neutral-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      {/* Rank */}
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/70 flex items-center justify-center text-xs font-black text-yellow-400">
                        {idx + 1}
                      </div>
                      {/* Rating */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg border text-xs font-black ${getRatingColor(rating)}`}>
                        {rating}
                      </div>
                      <div className="absolute bottom-0 right-0 left-0 p-2">
                        <h4 className="font-bold text-xs line-clamp-1">{getDisplayTitle(item)}</h4>
                        <p className="text-[10px] text-neutral-400">{item.year} • {typeConfig.label}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-neutral-600 text-xs">صُنع بـ ❤️ بواسطة Hussam</p>
        </div>
      </div>

      {/* Edit Rating Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm bg-[#0f0f0f] border-[#2a2a2a]">
          <DialogHeader><DialogTitle className="text-lg">تعديل التقييم</DialogTitle></DialogHeader>
          {editingItem && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-neutral-300">{getDisplayTitle(editingItem)} ({editingItem.year})</p>
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">التقييم (0-100)</label>
                <div className="flex items-center gap-3">
                  <Input type="number" value={editRating} onChange={(e) => setEditRating(e.target.value)}
                    min={0} max={100} step="0.1" className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-yellow-500 h-12 text-center text-xl font-bold" />
                  <span className="text-neutral-500">/ 100</span>
                </div>
                {/* Quick rating buttons */}
                <div className="flex gap-1 mt-3 flex-wrap">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(r => (
                    <button key={r} onClick={() => setEditRating(r.toString())}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${parseFloat(editRating) === r ? 'bg-yellow-500 text-black' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a]'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveRating} className="flex-1 bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold">حفظ</Button>
                <Button onClick={() => setShowEditDialog(false)} variant="outline" className="flex-1 border-[#2a2a2a]">إلغاء</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
