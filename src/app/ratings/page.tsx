'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import {
  Star, Film, Tv, ArrowRight, Dice5, Edit3, Trash2,
  BarChart3, CalendarDays, Filter, ArrowUpDown, Search, Loader2, X, Plus, Check
} from 'lucide-react'

/* ===========================
   Types
   =========================== */
interface Movie {
  id: number
  title: string
  year: number
  genre: string
  rating: number
  status: string
  rewatch: boolean
  runtime: number | null
  created_at: string
}

interface Series {
  id: number
  title: string
  year: number
  seasons: number
  rating: number
  rewatch: boolean
  created_at: string
}

type TabType = 'movies' | 'series'
type SortBy = 'latest_added' | 'rating_desc' | 'year_desc' | 'year_asc' | 'title_asc'

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Anime', 'Animation', 'Biography', 'Comedy', 'Comics',
  'Crime', 'Disaster', 'Documentary', 'Drama', 'Fantasy', 'History', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western', 'Other'
]

const STATUS_OPTIONS = [
  { value: 'watched', label: 'Watched' },
  { value: 'watching', label: 'Watching' },
  { value: 'plan', label: 'Plan to Watch' },
]

/* ===========================
   Helpers
   =========================== */
function formatRating(num: number) {
  const n = Math.round(Number(num) * 100) / 100
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

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

function statusLabel(status: string) {
  if (status === 'watched') return 'Watched'
  if (status === 'watching') return 'Watching'
  return 'Plan'
}

function statusColor(status: string) {
  if (status === 'watched') return 'text-green-400 border-green-500/30 bg-green-500/10'
  if (status === 'watching') return 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  return 'text-amber-400 border-amber-500/30 bg-amber-500/10'
}

/* ===========================
   Component
   =========================== */
export default function RatingsPage() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [activeTab, setActiveTab] = useState<TabType>('movies')
  const [isLoading, setIsLoading] = useState(true)

  // Movies data
  const [recentMovies, setRecentMovies] = useState<Movie[]>([])
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [movieSearch, setMovieSearch] = useState('')
  const [filterGenre, setFilterGenre] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterMinRating, setFilterMinRating] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortMovies, setSortMovies] = useState<SortBy>('latest_added')

  // Series data
  const [recentSeries, setRecentSeries] = useState<Series[]>([])
  const [allSeries, setAllSeries] = useState<Series[]>([])
  const [seriesSearch, setSeriesSearch] = useState('')
  const [filterSeriesYear, setFilterSeriesYear] = useState('')
  const [filterSeriesMinRating, setFilterSeriesMinRating] = useState('')
  const [filterSeriesRewatch, setFilterSeriesRewatch] = useState('')
  const [sortSeries, setSortSeries] = useState<SortBy>('latest_added')

  // Movie form
  const [showMovieForm, setShowMovieForm] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [movieForm, setMovieForm] = useState({
    title: '', year: new Date().getFullYear().toString(), genre: 'Action',
    rating: '', status: 'watched', rewatch: 'true', runtime: ''
  })

  // Series form
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [seriesForm, setSeriesForm] = useState({
    title: '', year: new Date().getFullYear().toString(), seasons: '1',
    rating: '', rewatch: 'true'
  })

  // Stats & UI
  const [showStats, setShowStats] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [pickerResult, setPickerResult] = useState('')

  // Auth check
  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth !== 'true') {
      window.location.href = '/'
      return
    }
    setIsAuthenticated(true)
  }, [])

  // Fetch data
  const fetchMovies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setAllMovies(data || [])
      setRecentMovies((data || []).slice(0, 5))
    } catch (err) {
      console.error(err)
      toast({ title: 'خطأ', description: 'خطأ في تحميل الأفلام', variant: 'destructive' })
    }
  }, [toast])

  const fetchSeries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setAllSeries(data || [])
      setRecentSeries((data || []).slice(0, 5))
    } catch (err) {
      console.error(err)
      toast({ title: 'خطأ', description: 'خطأ في تحميل المسلسلات', variant: 'destructive' })
    }
  }, [toast])

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([fetchMovies(), fetchSeries()]).finally(() => setIsLoading(false))
    }
  }, [isAuthenticated, fetchMovies, fetchSeries])

  // Filtered movies
  const filteredMovies = (() => {
    let result = [...recentMovies]
    if (movieSearch.trim()) {
      const q = movieSearch.toLowerCase()
      result = result.filter(m => m.title.toLowerCase().includes(q))
    }
    if (filterGenre) result = result.filter(m => m.genre === filterGenre)
    if (filterYear) result = result.filter(m => Number(m.year) === Number(filterYear))
    if (filterMinRating) result = result.filter(m => Number(m.rating) >= Number(filterMinRating))
    if (filterStatus) result = result.filter(m => (m.status || 'watched') === filterStatus)
    switch (sortMovies) {
      case 'rating_desc': result.sort((a, b) => Number(b.rating) - Number(a.rating)); break
      case 'year_desc': result.sort((a, b) => Number(b.year) - Number(a.year)); break
      case 'year_asc': result.sort((a, b) => Number(a.year) - Number(b.year)); break
      case 'title_asc': result.sort((a, b) => a.title.localeCompare(b.title)); break
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return result
  })()

  // Filtered series
  const filteredSeries = (() => {
    let result = [...recentSeries]
    if (seriesSearch.trim()) {
      const q = seriesSearch.toLowerCase()
      result = result.filter(s => s.title.toLowerCase().includes(q))
    }
    if (filterSeriesYear) result = result.filter(s => Number(s.year) === Number(filterSeriesYear))
    if (filterSeriesMinRating) result = result.filter(s => Number(s.rating) >= Number(filterSeriesMinRating))
    if (filterSeriesRewatch) result = result.filter(s => String(s.rewatch === true || s.rewatch === 'true') === filterSeriesRewatch)
    switch (sortSeries) {
      case 'rating_desc': result.sort((a, b) => Number(b.rating) - Number(a.rating)); break
      case 'year_desc': result.sort((a, b) => Number(b.year) - Number(a.year)); break
      case 'year_asc': result.sort((a, b) => Number(a.year) - Number(b.year)); break
      case 'title_asc': result.sort((a, b) => a.title.localeCompare(b.title)); break
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return result
  })()

  // Stats
  const stats = (() => {
    const total = allMovies.length + allSeries.length
    const genreMap: Record<string, number> = {}
    allMovies.forEach(m => { genreMap[m.genre || 'Other'] = (genreMap[m.genre || 'Other'] || 0) + 1 })
    const topGenre = Object.keys(genreMap).sort((a, b) => genreMap[b] - genreMap[a])[0] || '-'
    const ratings = [...allMovies, ...allSeries].map(x => Number(x.rating)).filter(x => Number.isFinite(x))
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    const yearMap: Record<string, number> = {}
    allMovies.forEach(m => { const y = Number(m.year); if (Number.isInteger(y)) yearMap[y] = (yearMap[y] || 0) + 1 })
    const topYear = Object.keys(yearMap).sort((a, b) => yearMap[b] - yearMap[a])[0] || '-'
    const now = new Date()
    const thisMonth = [...allMovies, ...allSeries].filter(x => {
      const d = new Date(x.created_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
    return { total, topGenre, avg, topYear, thisMonth }
  })()

  // Movie CRUD
  const handleMovieSubmit = async () => {
    if (!movieForm.title.trim()) return toast({ title: 'خطأ', description: 'اسم الفيلم مطلوب', variant: 'destructive' })
    const year = parseInt(movieForm.year)
    const rating = parseFloat(movieForm.rating)
    if (isNaN(year) || year < 1900 || year > 2100) return toast({ title: 'خطأ', description: 'سنة غير صالحة', variant: 'destructive' })
    if (isNaN(rating) || rating < 0 || rating > 100) return toast({ title: 'خطأ', description: 'التقييم يجب أن يكون بين 0 و 100', variant: 'destructive' })

    const data = {
      title: movieForm.title.trim(),
      year,
      genre: movieForm.genre,
      rating,
      status: movieForm.status,
      rewatch: movieForm.rewatch === 'true',
      runtime: movieForm.runtime ? parseInt(movieForm.runtime) : null,
    }

    try {
      if (editingMovie) {
        const { error } = await supabase.from('movies').update(data).eq('id', editingMovie.id)
        if (error) throw error
        toast({ title: 'تم التحديث', description: 'تم تحديث الفيلم بنجاح' })
      } else {
        const { error } = await supabase.from('movies').insert([data])
        if (error) throw error
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة الفيلم بنجاح' })
      }
      resetMovieForm()
      fetchMovies()
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'فشلت العملية', variant: 'destructive' })
    }
  }

  const editMovie = (m: Movie) => {
    setEditingMovie(m)
    setMovieForm({
      title: m.title, year: m.year.toString(), genre: m.genre || 'Action',
      rating: m.rating.toString(), status: m.status || 'watched',
      rewatch: String(m.rewatch === true || m.rewatch === 'true'),
      runtime: m.runtime?.toString() || ''
    })
    setShowMovieForm(true)
  }

  const deleteMovie = async (id: number) => {
    try {
      const { error } = await supabase.from('movies').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'تم الحذف', description: 'تم حذف الفيلم' })
      fetchMovies()
    } catch {
      toast({ title: 'خطأ', description: 'فشل حذف الفيلم', variant: 'destructive' })
    }
  }

  const resetMovieForm = () => {
    setEditingMovie(null)
    setMovieForm({ title: '', year: new Date().getFullYear().toString(), genre: 'Action', rating: '', status: 'watched', rewatch: 'true', runtime: '' })
    setShowMovieForm(false)
  }

  // Series CRUD
  const handleSeriesSubmit = async () => {
    if (!seriesForm.title.trim()) return toast({ title: 'خطأ', description: 'اسم المسلسل مطلوب', variant: 'destructive' })
    const year = parseInt(seriesForm.year)
    const seasons = parseInt(seriesForm.seasons)
    const rating = parseFloat(seriesForm.rating)
    if (isNaN(year) || year < 1900 || year > 2100) return toast({ title: 'خطأ', description: 'سنة غير صالحة', variant: 'destructive' })
    if (isNaN(seasons) || seasons < 1 || seasons > 100) return toast({ title: 'خطأ', description: 'عدد المواسم غير صحيح', variant: 'destructive' })
    if (isNaN(rating) || rating < 0 || rating > 100) return toast({ title: 'خطأ', description: 'التقييم يجب أن يكون بين 0 و 100', variant: 'destructive' })

    const data = {
      title: seriesForm.title.trim(),
      year,
      seasons,
      rating,
      rewatch: seriesForm.rewatch === 'true',
    }

    try {
      if (editingSeries) {
        const { error } = await supabase.from('series').update(data).eq('id', editingSeries.id)
        if (error) throw error
        toast({ title: 'تم التحديث', description: 'تم تحديث المسلسل بنجاح' })
      } else {
        const { error } = await supabase.from('series').insert([data])
        if (error) throw error
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة المسلسل بنجاح' })
      }
      resetSeriesForm()
      fetchSeries()
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'فشلت العملية', variant: 'destructive' })
    }
  }

  const editSeriesFn = (s: Series) => {
    setEditingSeries(s)
    setSeriesForm({
      title: s.title, year: s.year.toString(), seasons: s.seasons.toString(),
      rating: s.rating.toString(), rewatch: String(s.rewatch === true || s.rewatch === 'true')
    })
    setShowSeriesForm(true)
  }

  const deleteSeries = async (id: number) => {
    try {
      const { error } = await supabase.from('series').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'تم الحذف', description: 'تم حذف المسلسل' })
      fetchSeries()
    } catch {
      toast({ title: 'خطأ', description: 'فشل حذف المسلسل', variant: 'destructive' })
    }
  }

  const resetSeriesForm = () => {
    setEditingSeries(null)
    setSeriesForm({ title: '', year: new Date().getFullYear().toString(), seasons: '1', rating: '', rewatch: 'true' })
    setShowSeriesForm(false)
  }

  // Movie Night Picker
  const movieNightPicker = () => {
    const plan = allMovies.filter(m => (m.status || 'watched') === 'plan')
    if (!plan.length && !allMovies.length) {
      setPickerResult('لا توجد أفلام حالياً')
      return
    }
    const source = plan.length > 0 ? plan : allMovies
    const under150 = source.filter(m => !m.runtime || Number(m.runtime) <= 150)
    const pool = under150.length ? under150 : source
    const picked = pool[Math.floor(Math.random() * pool.length)]
    setPickerResult(`اختيار الليلة: ${picked.title} (${picked.year}) - ${picked.genre || 'Other'} - تقييمك: ${formatRating(picked.rating)}${picked.runtime ? ` - ${picked.runtime} د` : ''}`)
  }

  // Print movies
  const printMovies = () => {
    const filtered = allMovies
    if (!filtered.length) return toast({ title: 'خطأ', description: 'لا توجد أفلام للطباعة', variant: 'destructive' })

    const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }))
    const rows = sorted.map((m, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${m.title}</td>
        <td>${m.year}</td>
        <td>${m.genre || '-'}</td>
        <td>${statusLabel(m.status || 'watched')}</td>
        <td>${formatRating(m.rating)}</td>
        <td>${(m.rewatch === true || m.rewatch === 'true') ? 'نعم' : 'لا'}</td>
      </tr>
    `).join('')

    const w = window.open('', '_blank', 'width=1100,height=800')
    if (!w) return toast({ title: 'خطأ', description: 'المتصفح منع فتح نافذة الطباعة', variant: 'destructive' })
    w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>طباعة الأفلام</title>
      <style>body{font-family:Tahoma,Arial,sans-serif;padding:22px;color:#111}h1{font-size:22px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #888;padding:8px;font-size:12px;text-align:center}th{background:#f1f1f1}</style>
      </head><body><h1>قائمة الأفلام</h1><p>عدد الأفلام: ${sorted.length}</p><table><thead><tr><th>#</th><th>اسم الفيلم</th><th>السنة</th><th>النوع</th><th>الحالة</th><th>تقييمي</th><th>إعادة مشاهدة</th></tr></thead><tbody>${rows}</tbody></table></body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 250)
  }

  // Clear filters
  const clearMovieFilters = () => {
    setMovieSearch(''); setFilterGenre(''); setFilterYear(''); setFilterMinRating(''); setFilterStatus(''); setSortMovies('latest_added')
  }
  const clearSeriesFilters = () => {
    setSeriesSearch(''); setFilterSeriesYear(''); setFilterSeriesMinRating(''); setFilterSeriesRewatch(''); setSortSeries('latest_added')
  }

  const handleLogout = () => {
    localStorage.removeItem('hussamvision_auth')
    window.location.href = '/'
  }

  if (!isAuthenticated) return null

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-yellow-500" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-yellow-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8" dir="rtl">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <Button onClick={() => window.location.href = '/'} variant="ghost" size="icon" className="text-neutral-500 hover:text-white hover:bg-[#1a1a1a]">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
              <Film className="w-5 h-5 sm:w-7 sm:h-7 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">قائمة المشاهدة</h1>
              <p className="text-neutral-500 text-sm">آخر 5 عناصر فقط للعرض + إحصائيات من كل البيانات</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button onClick={() => setShowStats(!showStats)} variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><BarChart3 className="w-5 h-5" /></Button>
            <Button onClick={handleLogout} variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><X className="w-5 h-5" /></Button>
          </div>
        </header>

        {/* Stats */}
        {showStats && (
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 sm:p-6 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-yellow-500" />إحصائيات سريعة</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-yellow-500">{stats.total}</p><p className="text-xs text-neutral-400">عدد الأعمال الكلي</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-amber-400">{stats.topGenre}</p><p className="text-xs text-neutral-400">أكثر Genre</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-yellow-300">{formatRating(stats.avg)}</p><p className="text-xs text-neutral-400">متوسط التقييم</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-amber-300">{stats.topYear}</p><p className="text-xs text-neutral-400">أكثر سنة إنتاج</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-yellow-400">{stats.thisMonth}</p><p className="text-xs text-neutral-400">عدد هذا الشهر</p></div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('movies')}
            className={`flex-1 rounded-xl p-3 transition-all flex items-center justify-center gap-2 ${activeTab === 'movies' ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold shadow-lg' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'}`}>
            <Film className="w-5 h-5" /><span>الأفلام</span><span className={`text-xs ${activeTab === 'movies' ? 'opacity-80' : 'text-neutral-500'}`}>({allMovies.length})</span>
          </button>
          <button onClick={() => setActiveTab('series')}
            className={`flex-1 rounded-xl p-3 transition-all flex items-center justify-center gap-2 ${activeTab === 'series' ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold shadow-lg' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'}`}>
            <Tv className="w-5 h-5" /><span>المسلسلات</span><span className={`text-xs ${activeTab === 'series' ? 'opacity-80' : 'text-neutral-500'}`}>({allSeries.length})</span>
          </button>
        </div>

        {/* ===================== Movies Tab ===================== */}
        {activeTab === 'movies' && (
          <>
            {/* Add Movie Button */}
            <div className="flex gap-2 mb-4">
              <Button onClick={() => { resetMovieForm(); setShowMovieForm(true) }} className="bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold gap-2">
                <Plus className="w-4 h-4" />إضافة فيلم
              </Button>
              <Button onClick={movieNightPicker} variant="outline" className="border-[#2a2a2a] text-neutral-400 gap-2">
                <Dice5 className="w-4 h-4" />فيلم الليلة
              </Button>
              <Button onClick={printMovies} variant="outline" className="border-[#2a2a2a] text-neutral-400 gap-2 hidden sm:flex">
                طباعة الكل
              </Button>
            </div>

            {/* Picker Result */}
            {pickerResult && (
              <div className="bg-yellow-500/10 border border-dashed border-yellow-500/40 rounded-xl p-4 mb-4 text-center">
                <p className="text-yellow-300 font-medium">{pickerResult}</p>
              </div>
            )}

            {/* Movie Form Dialog */}
            {showMovieForm && (
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 sm:p-6 mb-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-yellow-500" />
                  {editingMovie ? 'تعديل فيلم' : 'إضافة فيلم جديد'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-neutral-400 mb-1 block">اسم الفيلم *</label>
                    <Input value={movieForm.title} onChange={e => setMovieForm(p => ({ ...p, title: e.target.value }))} placeholder="مثال: Interstellar" className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-yellow-500 h-10" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">سنة الإنتاج *</label>
                    <Input type="number" value={movieForm.year} onChange={e => setMovieForm(p => ({ ...p, year: e.target.value }))} placeholder="2024" className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-yellow-500 h-10" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">التصنيف *</label>
                    <Select value={movieForm.genre} onValueChange={v => setMovieForm(p => ({ ...p, genre: v }))}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]">
                        {GENRE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">التقييم (0-100) *</label>
                    <Input type="number" value={movieForm.rating} onChange={e => setMovieForm(p => ({ ...p, rating: e.target.value }))} placeholder="85" min={0} max={100} className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-yellow-500 h-10" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">المدة بالدقائق</label>
                    <Input type="number" value={movieForm.runtime} onChange={e => setMovieForm(p => ({ ...p, runtime: e.target.value }))} placeholder="120" className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-yellow-500 h-10" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">الحالة</label>
                    <Select value={movieForm.status} onValueChange={v => setMovieForm(p => ({ ...p, status: v }))}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                        {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">هل يستحق إعادة مشاهدة؟</label>
                    <Select value={movieForm.rewatch} onValueChange={v => setMovieForm(p => ({ ...p, rewatch: v }))}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                        <SelectItem value="true">نعم</SelectItem>
                        <SelectItem value="false">لا</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleMovieSubmit} className="flex-1 bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold">{editingMovie ? 'حفظ التعديل' : 'إضافة الفيلم'}</Button>
                  <Button onClick={resetMovieForm} variant="outline" className="border-[#2a2a2a]">إلغاء</Button>
                </div>
              </div>
            )}

            {/* Movie Filters */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 sm:p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-bold">بحث + فلترة + ترتيب (على آخر 5)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input value={movieSearch} onChange={e => setMovieSearch(e.target.value)} placeholder="ابحث باسم الفيلم..." className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-yellow-500 pr-9 h-9" />
                </div>
                <Select value={filterGenre || '_all'} onValueChange={v => setFilterGenre(v === '_all' ? '' : v)}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="النوع" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]">
                    <SelectItem value="_all">الكل</SelectItem>
                    {GENRE_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" value={filterYear} onChange={e => setFilterYear(e.target.value)} placeholder="السنة" className="bg-[#1a1a1a] border-[#2a2a2a] h-9" />
                <Input type="number" value={filterMinRating} onChange={e => setFilterMinRating(e.target.value)} placeholder="تقييم أعلى من" className="bg-[#1a1a1a] border-[#2a2a2a] h-9" />
                <Select value={filterStatus || '_all'} onValueChange={v => setFilterStatus(v === '_all' ? '' : v)}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="الحالة" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="_all">الكل</SelectItem>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sortMovies} onValueChange={v => setSortMovies(v as SortBy)}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-9"><ArrowUpDown className="w-4 h-4 ml-2" /><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="latest_added">Latest added</SelectItem>
                    <SelectItem value="rating_desc">الأعلى تقييمًا</SelectItem>
                    <SelectItem value="year_desc">الأحدث</SelectItem>
                    <SelectItem value="year_asc">الأقدم</SelectItem>
                    <SelectItem value="title_asc">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" onClick={clearMovieFilters} className="text-neutral-400">مسح الفلاتر</Button>
              </div>
            </div>

            {/* Movies List */}
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-yellow-500" />آخر الأفلام
                <Badge className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/25">{filteredMovies.length}</Badge>
              </h2>
              {filteredMovies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Film className="w-12 h-12 text-neutral-600 mb-4" />
                  <p className="text-neutral-500">{allMovies.length === 0 ? 'لا توجد أفلام بعد' : 'لا يوجد نتائج ضمن آخر 5 أفلام'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMovies.map(m => {
                    const rewatch = m.rewatch === true || m.rewatch === 'true'
                    return (
                      <div key={m.id} className="flex gap-3 p-3 rounded-xl bg-[#1a1a1a]/50 hover:bg-[#2a2a2a]/50 border border-[#2a2a2a]/50 transition-all group">
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl border flex flex-col items-center justify-center ${getRatingColor(m.rating)}`}>
                          <span className="text-lg font-black leading-none">{formatRating(m.rating)}</span>
                          <span className="text-[8px] opacity-60">/100</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold line-clamp-1">{m.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-neutral-400">{m.year}</span>
                            <Badge className="text-[9px] bg-yellow-500/15 text-yellow-400 border-yellow-500/25">{m.genre || 'Other'}</Badge>
                            <span className={`text-[10px] rounded-full px-2 py-0.5 border ${statusColor(m.status || 'watched')}`}>{statusLabel(m.status || 'watched')}</span>
                            {m.runtime && <span className="text-xs text-neutral-400">{m.runtime} د</span>}
                            <span className={`text-xs ${rewatch ? 'text-green-400' : 'text-red-400'}`}>{rewatch ? '✅ إعادة مشاهدة' : '❌ لا يُعاد'}</span>
                          </div>
                          <div className="mt-2 w-full h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${getRatingBarColor(m.rating)}`} style={{ width: `${m.rating}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => editMovie(m)} className="w-8 h-8 text-neutral-400 hover:text-yellow-400"><Edit3 className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMovie(m.id)} className="w-8 h-8 text-neutral-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ===================== Series Tab ===================== */}
        {activeTab === 'series' && (
          <>
            {/* Add Series Button */}
            <div className="flex gap-2 mb-4">
              <Button onClick={() => { resetSeriesForm(); setShowSeriesForm(true) }} className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold gap-2">
                <Plus className="w-4 h-4" />إضافة مسلسل
              </Button>
            </div>

            {/* Series Form Dialog */}
            {showSeriesForm && (
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 sm:p-6 mb-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-500" />
                  {editingSeries ? 'تعديل مسلسل' : 'إضافة مسلسل جديد'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-neutral-400 mb-1 block">اسم المسلسل *</label>
                    <Input value={seriesForm.title} onChange={e => setSeriesForm(p => ({ ...p, title: e.target.value }))} placeholder="مثال: Breaking Bad" className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-blue-500 h-10" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">سنة الإنتاج *</label>
                    <Input type="number" value={seriesForm.year} onChange={e => setSeriesForm(p => ({ ...p, year: e.target.value }))} placeholder="2024" className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-blue-500 h-10" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">عدد المواسم *</label>
                    <Input type="number" value={seriesForm.seasons} onChange={e => setSeriesForm(p => ({ ...p, seasons: e.target.value }))} placeholder="3" className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-blue-500 h-10" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">التقييم (0-100) *</label>
                    <Input type="number" value={seriesForm.rating} onChange={e => setSeriesForm(p => ({ ...p, rating: e.target.value }))} placeholder="90" min={0} max={100} className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-blue-500 h-10" />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">هل يستحق إعادة مشاهدة؟</label>
                    <Select value={seriesForm.rewatch} onValueChange={v => setSeriesForm(p => ({ ...p, rewatch: v }))}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                        <SelectItem value="true">نعم</SelectItem>
                        <SelectItem value="false">لا</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSeriesSubmit} className="flex-1 bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold">{editingSeries ? 'حفظ التعديل' : 'إضافة المسلسل'}</Button>
                  <Button onClick={resetSeriesForm} variant="outline" className="border-[#2a2a2a]">إلغاء</Button>
                </div>
              </div>
            )}

            {/* Series Filters */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 sm:p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold">بحث + فلترة + ترتيب (على آخر 5)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input value={seriesSearch} onChange={e => setSeriesSearch(e.target.value)} placeholder="ابحث باسم المسلسل..." className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-blue-500 pr-9 h-9" />
                </div>
                <Input type="number" value={filterSeriesYear} onChange={e => setFilterSeriesYear(e.target.value)} placeholder="السنة" className="bg-[#1a1a1a] border-[#2a2a2a] h-9" />
                <Input type="number" value={filterSeriesMinRating} onChange={e => setFilterSeriesMinRating(e.target.value)} placeholder="تقييم أعلى من" className="bg-[#1a1a1a] border-[#2a2a2a] h-9" />
                <Select value={filterSeriesRewatch || '_all'} onValueChange={v => setFilterSeriesRewatch(v === '_all' ? '' : v)}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="إعادة مشاهدة" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="_all">الكل</SelectItem>
                    <SelectItem value="true">نعم</SelectItem>
                    <SelectItem value="false">لا</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortSeries} onValueChange={v => setSortSeries(v as SortBy)}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-9"><ArrowUpDown className="w-4 h-4 ml-2" /><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="latest_added">Latest added</SelectItem>
                    <SelectItem value="rating_desc">الأعلى تقييمًا</SelectItem>
                    <SelectItem value="year_desc">الأحدث</SelectItem>
                    <SelectItem value="year_asc">الأقدم</SelectItem>
                    <SelectItem value="title_asc">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2">
                <Button variant="ghost" size="sm" onClick={clearSeriesFilters} className="text-neutral-400">مسح الفلاتر</Button>
              </div>
            </div>

            {/* Series List */}
            <div className="mb-4">
              <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Tv className="w-4 h-4 text-blue-500" />آخر المسلسلات
                <Badge className="text-[9px] bg-blue-500/15 text-blue-400 border-blue-500/25">{filteredSeries.length}</Badge>
              </h2>
              {filteredSeries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Tv className="w-12 h-12 text-neutral-600 mb-4" />
                  <p className="text-neutral-500">{allSeries.length === 0 ? 'لا توجد مسلسلات بعد' : 'لا يوجد نتائج ضمن آخر 5 مسلسلات'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSeries.map(s => {
                    const rewatch = s.rewatch === true || s.rewatch === 'true'
                    const seasonWord = Number(s.seasons) === 1 ? 'موسم' : 'مواسم'
                    return (
                      <div key={s.id} className="flex gap-3 p-3 rounded-xl bg-[#1a1a1a]/50 hover:bg-[#2a2a2a]/50 border border-[#2a2a2a]/50 transition-all group">
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl border flex flex-col items-center justify-center ${getRatingColor(s.rating)}`}>
                          <span className="text-lg font-black leading-none">{formatRating(s.rating)}</span>
                          <span className="text-[8px] opacity-60">/100</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold line-clamp-1">{s.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-neutral-400">{s.year}</span>
                            <span className="text-xs text-neutral-400">{s.seasons} {seasonWord}</span>
                            <span className={`text-xs ${rewatch ? 'text-green-400' : 'text-red-400'}`}>{rewatch ? '✅ إعادة مشاهدة' : '❌ لا يُعاد'}</span>
                          </div>
                          <div className="mt-2 w-full h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${getRatingBarColor(s.rating)}`} style={{ width: `${s.rating}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => editSeriesFn(s)} className="w-8 h-8 text-neutral-400 hover:text-blue-400"><Edit3 className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteSeries(s.id)} className="w-8 h-8 text-neutral-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-neutral-600 text-xs">صُنع بـ ❤️ بواسطة Hussam</p>
        </div>
      </div>
    </div>
  )
}
