'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Film, Tv, Plus, Search, Filter, ArrowRight, Star, Trash2, Edit,
  Dice5, Printer, RefreshCw, X, Clock, Calendar, BarChart3,
  Loader2, Clapperboard, CheckCircle2, Eye, BookmarkPlus, RotateCcw
} from 'lucide-react'

/* ============================================================
   Types
   ============================================================ */
interface RatedItem {
  id: string
  title: string
  originalTitle?: string
  year: string
  type: 'movie' | 'series'
  genres: string[]
  userRating: number
  ratingStatus: string
  rewatch: boolean
  runtime?: number | null
  seasons?: number | null
  addedAt: string
  updatedAt: string
}

interface DashboardStats {
  totalRated: number
  topGenre: string
  avgRating: number
  topYear: string
  thisMonth: number
  movieCount: number
  seriesCount: number
  avgMovieRating: number
  avgSeriesRating: number
  planMovieCount: number
}

type TabType = 'movies' | 'series'
type MovieSortOption = 'latest_added' | 'rating_desc' | 'year_desc' | 'year_asc' | 'title_asc'
type SeriesSortOption = 'latest_added' | 'rating_desc' | 'year_desc' | 'year_asc' | 'title_asc'

/* ============================================================
   Constants
   ============================================================ */
const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Anime', 'Animation', 'Biography', 'Comedy',
  'Comics', 'Crime', 'Disaster', 'Documentary', 'Drama', 'Fantasy',
  'History', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
  'War', 'Western', 'Other'
]

const STATUS_OPTIONS = [
  { value: 'watched', label: 'Watched', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'watching', label: 'Watching', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'plan', label: 'Plan to Watch', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
]

const YEARS_RANGE = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

/* ============================================================
   Helpers
   ============================================================ */
function getRatingColor(rating: number) {
  if (rating >= 70) return 'bg-green-500 text-white'
  if (rating >= 40) return 'bg-yellow-500 text-black'
  return 'bg-red-500 text-white'
}

function getRatingTextColor(rating: number) {
  if (rating >= 70) return 'text-green-400'
  if (rating >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function getStatusConfig(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
}

function formatRating(num: number) {
  const n = Math.round(Number(num) * 100) / 100
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/* ============================================================
   Main Component
   ============================================================ */
export default function RatingsPage() {
  const { toast } = useToast()

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Data
  const [allItems, setAllItems] = useState<RatedItem[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('movies')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<RatedItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Movie filters
  const [movieSearch, setMovieSearch] = useState('')
  const [movieGenreFilter, setMovieGenreFilter] = useState('all')
  const [movieYearFilter, setMovieYearFilter] = useState('')
  const [movieMinRating, setMovieMinRating] = useState('')
  const [movieStatusFilter, setMovieStatusFilter] = useState('all')
  const [movieSort, setMovieSort] = useState<MovieSortOption>('latest_added')

  // Series filters
  const [seriesSearch, setSeriesSearch] = useState('')
  const [seriesYearFilter, setSeriesYearFilter] = useState('')
  const [seriesMinRating, setSeriesMinRating] = useState('')
  const [seriesRewatchFilter, setSeriesRewatchFilter] = useState('all')
  const [seriesSort, setSeriesSort] = useState<SeriesSortOption>('latest_added')

  // Movie form
  const [movieForm, setMovieForm] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    genre: '',
    rating: '',
    status: 'watched',
    rewatch: 'true',
    runtime: '',
  })

  // Series form
  const [seriesForm, setSeriesForm] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    seasons: '',
    rating: '',
    rewatch: 'true',
  })

  // Movie night picker
  const [movieNightResult, setMovieNightResult] = useState<string | null>(null)

  /* ============================================================
     Auth Check
     ============================================================ */
  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth !== 'true') {
      window.location.href = '/'
      return
    }
    setIsAuthenticated(true)
  }, [])

  /* ============================================================
     Fetch Data
     ============================================================ */
  const fetchData = useCallback(async () => {
    try {
      setSyncStatus('syncing')

      // Fetch rated items
      const itemsRes = await fetch('/api/watchlist')
      const itemsData = await itemsRes.json()

      let items: RatedItem[] = []
      if (itemsData.items && Array.isArray(itemsData.items)) {
        items = itemsData.items
      } else if (Array.isArray(itemsData)) {
        items = itemsData
      }

      // Filter: only movie/series with userRating
      const ratedItems = items.filter(
        (i: any) => (i.type === 'movie' || i.type === 'series') && i.userRating != null
      )
      setAllItems(ratedItems)

      // Fetch stats
      const statsRes = await fetch('/api/ratings-stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchData()
  }, [isAuthenticated, fetchData])

  /* ============================================================
     Computed: Movies & Series
     ============================================================ */
  const movies = useMemo(() => allItems.filter(i => i.type === 'movie'), [allItems])
  const series = useMemo(() => allItems.filter(i => i.type === 'series'), [allItems])

  /* ============================================================
     Filtered Movies
     ============================================================ */
  const filteredMovies = useMemo(() => {
    let result = [...movies]

    if (movieSearch.trim()) {
      const q = movieSearch.toLowerCase()
      result = result.filter(i => i.title.toLowerCase().includes(q) || (i.originalTitle || '').toLowerCase().includes(q))
    }
    if (movieGenreFilter !== 'all') {
      result = result.filter(i => i.genres?.includes(movieGenreFilter))
    }
    if (movieYearFilter) {
      result = result.filter(i => i.year === movieYearFilter)
    }
    if (movieMinRating) {
      const minR = parseFloat(movieMinRating)
      if (!isNaN(minR)) result = result.filter(i => i.userRating >= minR)
    }
    if (movieStatusFilter !== 'all') {
      result = result.filter(i => i.ratingStatus === movieStatusFilter)
    }

    switch (movieSort) {
      case 'rating_desc': result.sort((a, b) => b.userRating - a.userRating); break
      case 'year_desc': result.sort((a, b) => parseInt(b.year) - parseInt(a.year)); break
      case 'year_asc': result.sort((a, b) => parseInt(a.year) - parseInt(b.year)); break
      case 'title_asc': result.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })); break
      default: result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    }

    return result
  }, [movies, movieSearch, movieGenreFilter, movieYearFilter, movieMinRating, movieStatusFilter, movieSort])

  /* ============================================================
     Filtered Series
     ============================================================ */
  const filteredSeries = useMemo(() => {
    let result = [...series]

    if (seriesSearch.trim()) {
      const q = seriesSearch.toLowerCase()
      result = result.filter(i => i.title.toLowerCase().includes(q) || (i.originalTitle || '').toLowerCase().includes(q))
    }
    if (seriesYearFilter) {
      result = result.filter(i => i.year === seriesYearFilter)
    }
    if (seriesMinRating) {
      const minR = parseFloat(seriesMinRating)
      if (!isNaN(minR)) result = result.filter(i => i.userRating >= minR)
    }
    if (seriesRewatchFilter !== 'all') {
      const rewatchVal = seriesRewatchFilter === 'true'
      result = result.filter(i => i.rewatch === rewatchVal)
    }

    switch (seriesSort) {
      case 'rating_desc': result.sort((a, b) => b.userRating - a.userRating); break
      case 'year_desc': result.sort((a, b) => parseInt(b.year) - parseInt(a.year)); break
      case 'year_asc': result.sort((a, b) => parseInt(a.year) - parseInt(b.year)); break
      case 'title_asc': result.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })); break
      default: result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    }

    return result
  }, [series, seriesSearch, seriesYearFilter, seriesMinRating, seriesRewatchFilter, seriesSort])

  /* Recent 5 */
  const recentMovies = useMemo(() => filteredMovies.slice(0, 5), [filteredMovies])
  const recentSeries = useMemo(() => filteredSeries.slice(0, 5), [filteredSeries])

  /* ============================================================
     CRUD: Add Movie
     ============================================================ */
  const handleAddMovie = async () => {
    const title = movieForm.title.trim()
    const year = parseInt(movieForm.year, 10)
    const genre = movieForm.genre
    const rating = parseFloat(movieForm.rating)
    const status = movieForm.status
    const rewatch = movieForm.rewatch === 'true'
    const runtime = movieForm.runtime ? parseInt(movieForm.runtime, 10) : null

    if (!title) return toast({ title: 'خطأ', description: 'اسم الفيلم مطلوب', variant: 'destructive' })
    if (!genre) return toast({ title: 'خطأ', description: 'اختر التصنيف', variant: 'destructive' })
    if (isNaN(rating) || rating < 0 || rating > 100) return toast({ title: 'خطأ', description: 'التقييم يجب أن يكون بين 0 و 100', variant: 'destructive' })
    if (isNaN(year) || year < 1900 || year > 2100) return toast({ title: 'خطأ', description: 'سنة غير صالحة', variant: 'destructive' })

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalTitle: title,
          year: movieForm.year,
          type: 'movie',
          genres: genre,
          userRating: rating,
          ratingStatus: status,
          rewatch,
          runtime,
          watched: status === 'watched',
        })
      })

      const data = await res.json()
      if (res.status === 409) {
        toast({ title: '⚠️ موجود مسبقاً!', description: data.error, variant: 'destructive' })
        return
      }

      if (data && data.id) {
        await fetchData()
        setShowAddDialog(false)
        resetMovieForm()
        toast({ title: '✅ تمت الإضافة', description: `تم إضافة "${title}" بنجاح` })
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الإضافة', variant: 'destructive' })
    }
  }

  /* ============================================================
     CRUD: Add Series
     ============================================================ */
  const handleAddSeries = async () => {
    const title = seriesForm.title.trim()
    const year = parseInt(seriesForm.year, 10)
    const seasons = parseInt(seriesForm.seasons, 10)
    const rating = parseFloat(seriesForm.rating)
    const rewatch = seriesForm.rewatch === 'true'

    if (!title) return toast({ title: 'خطأ', description: 'اسم المسلسل مطلوب', variant: 'destructive' })
    if (isNaN(seasons) || seasons < 1 || seasons > 100) return toast({ title: 'خطأ', description: 'عدد المواسم غير صحيح', variant: 'destructive' })
    if (isNaN(rating) || rating < 0 || rating > 100) return toast({ title: 'خطأ', description: 'التقييم يجب أن يكون بين 0 و 100', variant: 'destructive' })
    if (isNaN(year) || year < 1900 || year > 2100) return toast({ title: 'خطأ', description: 'سنة غير صالحة', variant: 'destructive' })

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalTitle: title,
          year: seriesForm.year,
          type: 'series',
          seasons,
          userRating: rating,
          ratingStatus: 'watched',
          rewatch,
          watched: true,
        })
      })

      const data = await res.json()
      if (res.status === 409) {
        toast({ title: '⚠️ موجود مسبقاً!', description: data.error, variant: 'destructive' })
        return
      }

      if (data && data.id) {
        await fetchData()
        setShowAddDialog(false)
        resetSeriesForm()
        toast({ title: '✅ تمت الإضافة', description: `تم إضافة "${title}" بنجاح` })
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الإضافة', variant: 'destructive' })
    }
  }

  /* ============================================================
     CRUD: Edit
     ============================================================ */
  const openEditDialog = (item: RatedItem) => {
    setEditingItem(item)
    if (item.type === 'movie') {
      setMovieForm({
        title: item.title,
        year: item.year,
        genre: item.genres?.[0] || '',
        rating: String(item.userRating),
        status: item.ratingStatus || 'watched',
        rewatch: String(item.rewatch),
        runtime: item.runtime ? String(item.runtime) : '',
      })
    } else {
      setSeriesForm({
        title: item.title,
        year: item.year,
        seasons: item.seasons ? String(item.seasons) : '',
        rating: String(item.userRating),
        rewatch: String(item.rewatch),
      })
    }
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return

    try {
      setSyncStatus('syncing')

      const body: any = {
        title: editingItem.type === 'movie' ? movieForm.title : seriesForm.title,
        originalTitle: editingItem.type === 'movie' ? movieForm.title : seriesForm.title,
        year: editingItem.type === 'movie' ? movieForm.year : seriesForm.year,
        type: editingItem.type,
      }

      if (editingItem.type === 'movie') {
        body.genres = movieForm.genre
        body.userRating = parseFloat(movieForm.rating)
        body.ratingStatus = movieForm.status
        body.rewatch = movieForm.rewatch === 'true'
        body.runtime = movieForm.runtime ? parseInt(movieForm.runtime, 10) : null
        body.watched = movieForm.status === 'watched'
      } else {
        body.seasons = seriesForm.seasons ? parseInt(seriesForm.seasons, 10) : null
        body.userRating = parseFloat(seriesForm.rating)
        body.rewatch = seriesForm.rewatch === 'true'
        body.ratingStatus = 'watched'
        body.watched = true
      }

      const res = await fetch(`/api/watchlist/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data) {
        await fetchData()
        setSyncStatus('synced')
        toast({ title: '✅ تم التعديل', description: 'تم حفظ التعديلات بنجاح' })
      }

      setShowEditDialog(false)
      setEditingItem(null)
    } catch {
      setSyncStatus('error')
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الحفظ', variant: 'destructive' })
    }
  }

  /* ============================================================
     CRUD: Delete
     ============================================================ */
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return

    try {
      setSyncStatus('syncing')
      await fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
      setAllItems(prev => prev.filter(i => i.id !== id))
      setSyncStatus('synced')
      toast({ title: '🗑️ تم الحذف', description: `تم حذف "${title}"` })
      // Refresh stats
      fetchData()
    } catch {
      setSyncStatus('error')
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الحذف', variant: 'destructive' })
    }
  }

  /* ============================================================
     Reset Forms
     ============================================================ */
  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      year: new Date().getFullYear().toString(),
      genre: '',
      rating: '',
      status: 'watched',
      rewatch: 'true',
      runtime: '',
    })
  }

  const resetSeriesForm = () => {
    setSeriesForm({
      title: '',
      year: new Date().getFullYear().toString(),
      seasons: '',
      rating: '',
      rewatch: 'true',
    })
  }

  /* ============================================================
     Clear Filters
     ============================================================ */
  const clearMovieFilters = () => {
    setMovieSearch('')
    setMovieGenreFilter('all')
    setMovieYearFilter('')
    setMovieMinRating('')
    setMovieStatusFilter('all')
    setMovieSort('latest_added')
  }

  const clearSeriesFilters = () => {
    setSeriesSearch('')
    setSeriesYearFilter('')
    setSeriesMinRating('')
    setSeriesRewatchFilter('all')
    setSeriesSort('latest_added')
  }

  /* ============================================================
     Movie Night Picker
     ============================================================ */
  const pickMovieNight = () => {
    const planMovies = movies.filter(m => m.ratingStatus === 'plan')
    if (!planMovies.length) {
      setMovieNightResult('ماكو أفلام داخل Plan to Watch حاليًا 😅')
      return
    }
    const under150 = planMovies.filter(m => !m.runtime || m.runtime <= 150)
    const source = under150.length ? under150 : planMovies
    const picked = source[Math.floor(Math.random() * source.length)]
    setMovieNightResult(
      `🎬 اختيار الليلة: ${picked.title} — ${picked.year} • ${picked.genres?.[0] || 'Other'} • تقييمك: ${formatRating(picked.userRating)}${picked.runtime ? ` • ${picked.runtime} د` : ''}`
    )
  }

  /* ============================================================
     Print Filtered Movies
     ============================================================ */
  const printFilteredMovies = () => {
    const itemsToPrint = [...filteredMovies]
    if (!itemsToPrint.length) {
      toast({ title: 'خطأ', description: 'لا توجد نتائج للطباعة', variant: 'destructive' })
      return
    }

    // Sort alphabetically for print
    itemsToPrint.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }))

    const rows = itemsToPrint.map((m, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${m.title}</td>
        <td>${m.year}</td>
        <td>${m.genres?.[0] || '-'}</td>
        <td>${getStatusConfig(m.ratingStatus).label}</td>
        <td>${formatRating(m.userRating)}</td>
        <td>${m.rewatch ? '✅ نعم' : '❌ لا'}</td>
      </tr>
    `).join('')

    const printWindow = window.open('', '_blank', 'width=1100,height=800')
    if (!printWindow) {
      toast({ title: 'خطأ', description: 'المتصفح منع فتح نافذة الطباعة', variant: 'destructive' })
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>طباعة الأفلام المفلترة</title>
        <style>
          body { font-family: Tahoma, Arial, sans-serif; padding: 22px; color: #111; }
          h1 { margin: 0 0 6px; font-size: 22px; }
          .count { margin: 8px 0 12px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #888; padding: 8px; font-size: 12px; text-align: center; }
          th { background: #f1f1f1; }
        </style>
      </head>
      <body>
        <h1>قائمة الأفلام المفلترة</h1>
        <div class="count">عدد النتائج: ${itemsToPrint.length}</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الفيلم</th>
              <th>السنة</th>
              <th>النوع</th>
              <th>الحالة</th>
              <th>تقييمي</th>
              <th>إعادة مشاهدة</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
  }

  /* ============================================================
     Loading State
     ============================================================ */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div className="min-h-screen bg-[#030712] text-white" dir="rtl">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/3 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/3 rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <Button
              onClick={() => window.location.href = '/'}
              variant="ghost"
              size="icon"
              className="text-neutral-500 hover:text-white hover:bg-[#1a1a1a]"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
              <Star className="w-5 h-5 sm:w-7 sm:h-7 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">تقييماتي</h1>
              <div className="flex items-center gap-2">
                <p className="text-neutral-500 text-sm">أفلام ومسلسلات</p>
                <span className={`text-xs flex items-center gap-1 ${syncStatus === 'synced' ? 'text-green-500' : syncStatus === 'syncing' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {syncStatus === 'syncing' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {syncStatus === 'synced' ? 'متزامن' : syncStatus === 'syncing' ? 'مزامنة...' : 'خطأ'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              onClick={() => fetchData()}
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => {
                resetMovieForm()
                resetSeriesForm()
                setShowAddDialog(true)
              }}
              className="bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-bold gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Stats */}
        {stats && (
          <section className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-4 sm:p-6 mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-amber-400">
              <BarChart3 className="w-5 h-5" />
              إحصائيات سريعة
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-[#111827] rounded-lg p-3 sm:p-4 border border-[#1e293b]">
                <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats.totalRated}</p>
                <p className="text-xs sm:text-sm text-neutral-400">إجمالي المقيّم</p>
              </div>
              <div className="bg-[#111827] rounded-lg p-3 sm:p-4 border border-[#1e293b]">
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.topGenre}</p>
                <p className="text-xs sm:text-sm text-neutral-400">أكثر تصنيف</p>
              </div>
              <div className="bg-[#111827] rounded-lg p-3 sm:p-4 border border-[#1e293b]">
                <p className="text-xl sm:text-2xl font-bold text-amber-300">{formatRating(stats.avgRating)}</p>
                <p className="text-xs sm:text-sm text-neutral-400">متوسط التقييم</p>
              </div>
              <div className="bg-[#111827] rounded-lg p-3 sm:p-4 border border-[#1e293b]">
                <p className="text-xl sm:text-2xl font-bold text-yellow-300">{stats.topYear}</p>
                <p className="text-xs sm:text-sm text-neutral-400">أكثر سنة إنتاج</p>
              </div>
              <div className="bg-[#111827] rounded-lg p-3 sm:p-4 border border-[#1e293b] col-span-2 sm:col-span-1">
                <p className="text-xl sm:text-2xl font-bold text-amber-500">{stats.thisMonth}</p>
                <p className="text-xs sm:text-sm text-neutral-400">أُضيف هذا الشهر</p>
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <nav className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex-shrink-0 rounded-xl p-3 transition-all flex items-center gap-2 ${
              activeTab === 'movies'
                ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black shadow-lg'
                : 'bg-[#111827] text-neutral-400 hover:bg-[#1e293b] border border-[#1e293b]/50'
            }`}
          >
            <Film className="w-5 h-5" />
            <div className="text-right">
              <p className="font-bold text-sm">الأفلام</p>
              <p className={`text-xs ${activeTab === 'movies' ? 'opacity-80' : 'text-neutral-500'}`}>
                {movies.length} فيلم
              </p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`flex-shrink-0 rounded-xl p-3 transition-all flex items-center gap-2 ${
              activeTab === 'series'
                ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black shadow-lg'
                : 'bg-[#111827] text-neutral-400 hover:bg-[#1e293b] border border-[#1e293b]/50'
            }`}
          >
            <Tv className="w-5 h-5" />
            <div className="text-right">
              <p className="font-bold text-sm">المسلسلات</p>
              <p className={`text-xs ${activeTab === 'series' ? 'opacity-80' : 'text-neutral-500'}`}>
                {series.length} مسلسل
              </p>
            </div>
          </button>
        </nav>

        {/* ============================== MOVIES TAB ============================== */}
        {activeTab === 'movies' && (
          <div className="space-y-6">
            {/* Add Movie Form Card */}
            <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-4 sm:p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2 text-amber-400">
                <Plus className="w-5 h-5" />
                إضافة فيلم جديد
              </h2>
              <div className="space-y-3">
                <Input
                  value={movieForm.title}
                  onChange={e => setMovieForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="اسم الفيلم"
                  className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={movieForm.year}
                    onChange={e => setMovieForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="سنة الإنتاج"
                    type="number"
                    min={1900}
                    max={2100}
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                  <Select value={movieForm.genre} onValueChange={v => setMovieForm(p => ({ ...p, genre: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="التصنيف" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b] max-h-[200px]">
                      {GENRE_OPTIONS.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      value={movieForm.rating}
                      onChange={e => setMovieForm(p => ({ ...p, rating: e.target.value }))}
                      placeholder="التقييم"
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">/ 100</span>
                  </div>
                  <Input
                    value={movieForm.runtime}
                    onChange={e => setMovieForm(p => ({ ...p, runtime: e.target.value }))}
                    placeholder="المدة بالدقائق (اختياري)"
                    type="number"
                    min={1}
                    max={400}
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={movieForm.status} onValueChange={v => setMovieForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="watched">Watched</SelectItem>
                      <SelectItem value="watching">Watching</SelectItem>
                      <SelectItem value="plan">Plan to Watch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={movieForm.rewatch} onValueChange={v => setMovieForm(p => ({ ...p, rewatch: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="إعادة مشاهدة؟" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="true">✅ نعم</SelectItem>
                      <SelectItem value="false">❌ لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddMovie}
                  className="w-full bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-bold gap-2 h-10"
                >
                  <Plus className="w-4 h-4" />
                  إضافة الفيلم
                </Button>
              </div>
            </div>

            {/* Filters Card */}
            <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold flex items-center gap-2 text-amber-400">
                  <Filter className="w-5 h-5" />
                  بحث + فلترة + ترتيب
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-neutral-400"
                >
                  {showFilters ? 'إخفاء' : 'عرض'}
                </Button>
              </div>

              {/* Search always visible */}
              <div className="relative mb-3">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  value={movieSearch}
                  onChange={e => setMovieSearch(e.target.value)}
                  placeholder="ابحث باسم الفيلم..."
                  className="bg-[#111827] border-[#1e293b] focus:border-amber-500 pr-9 h-10"
                />
              </div>

              {showFilters && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Select value={movieGenreFilter} onValueChange={setMovieGenreFilter}>
                      <SelectTrigger className="bg-[#111827] border-[#1e293b] h-9">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-[#1e293b] max-h-[200px]">
                        <SelectItem value="all">الكل</SelectItem>
                        {GENRE_OPTIONS.map(g => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={movieYearFilter}
                      onChange={e => setMovieYearFilter(e.target.value)}
                      placeholder="السنة"
                      type="number"
                      min={1900}
                      max={2100}
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-9"
                    />
                    <Input
                      value={movieMinRating}
                      onChange={e => setMovieMinRating(e.target.value)}
                      placeholder="تقييم أعلى من"
                      type="number"
                      min={0}
                      max={100}
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-9"
                    />
                    <Select value={movieStatusFilter} onValueChange={setMovieStatusFilter}>
                      <SelectTrigger className="bg-[#111827] border-[#1e293b] h-9">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-[#1e293b]">
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="watched">Watched</SelectItem>
                        <SelectItem value="watching">Watching</SelectItem>
                        <SelectItem value="plan">Plan to Watch</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={movieSort} onValueChange={v => setMovieSort(v as MovieSortOption)}>
                      <SelectTrigger className="bg-[#111827] border-[#1e293b] h-9">
                        <SelectValue placeholder="الترتيب" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-[#1e293b]">
                        <SelectItem value="latest_added">Latest added</SelectItem>
                        <SelectItem value="rating_desc">الأعلى تقييمًا</SelectItem>
                        <SelectItem value="year_desc">الأحدث</SelectItem>
                        <SelectItem value="year_asc">الأقدم</SelectItem>
                        <SelectItem value="title_asc">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={clearMovieFilters} className="text-neutral-400">
                      <X className="w-4 h-4 ml-1" />
                      مسح الفلاتر
                    </Button>
                    <Button variant="ghost" size="sm" onClick={printFilteredMovies} className="text-neutral-400">
                      <Printer className="w-4 h-4 ml-1" />
                      طباعة النتائج
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={pickMovieNight}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <Dice5 className="w-4 h-4 ml-1" />
                      اختار لي فيلم الليلة
                    </Button>
                  </div>
                </div>
              )}

              {/* Movie Night Result */}
              {movieNightResult && (
                <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
                  {movieNightResult}
                </div>
              )}
            </div>

            {/* Movies List */}
            <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2 text-amber-400">
                  <Clapperboard className="w-5 h-5" />
                  آخر الأفلام
                </h2>
                <Badge variant="secondary" className="bg-[#111827] text-neutral-400 border border-[#1e293b]">
                  {filteredMovies.length} نتيجة
                </Badge>
              </div>

              {recentMovies.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-neutral-500">
                  <Film className="w-16 h-16 mb-4 opacity-30" />
                  <p>لا يوجد أفلام مقيّمة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMovies.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#111827]/50 hover:bg-[#1e293b]/50 border border-[#1e293b]/50 transition-colors"
                    >
                      {/* Rating Badge */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center font-bold text-sm ${getRatingColor(item.userRating)}`}>
                        {formatRating(item.userRating)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{item.title}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.year}
                          </span>
                          {item.genres?.[0] && (
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-[#1e293b] text-neutral-300">
                              {item.genres[0]}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${getStatusConfig(item.ratingStatus).color}`}>
                            {getStatusConfig(item.ratingStatus).label}
                          </Badge>
                          {item.runtime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.runtime} د
                            </span>
                          )}
                          <span className={item.rewatch ? 'text-green-400' : 'text-red-400'}>
                            {item.rewatch ? '✅ إعادة مشاهدة' : '❌ لا يُعاد'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-amber-400"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-red-400"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show all count */}
              {filteredMovies.length > 5 && (
                <p className="text-center text-xs text-neutral-500 mt-3">
                  عرض آخر 5 من أصل {filteredMovies.length} فيلم مفلتر
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============================== SERIES TAB ============================== */}
        {activeTab === 'series' && (
          <div className="space-y-6">
            {/* Add Series Form Card */}
            <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-4 sm:p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2 text-amber-400">
                <Plus className="w-5 h-5" />
                إضافة مسلسل جديد
              </h2>
              <div className="space-y-3">
                <Input
                  value={seriesForm.title}
                  onChange={e => setSeriesForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="اسم المسلسل"
                  className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={seriesForm.year}
                    onChange={e => setSeriesForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="سنة الإنتاج"
                    type="number"
                    min={1900}
                    max={2100}
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                  <Input
                    value={seriesForm.seasons}
                    onChange={e => setSeriesForm(p => ({ ...p, seasons: e.target.value }))}
                    placeholder="عدد المواسم"
                    type="number"
                    min={1}
                    max={100}
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      value={seriesForm.rating}
                      onChange={e => setSeriesForm(p => ({ ...p, rating: e.target.value }))}
                      placeholder="التقييم"
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">/ 100</span>
                  </div>
                  <Select value={seriesForm.rewatch} onValueChange={v => setSeriesForm(p => ({ ...p, rewatch: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="إعادة مشاهدة؟" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="true">✅ نعم</SelectItem>
                      <SelectItem value="false">❌ لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddSeries}
                  className="w-full bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-bold gap-2 h-10"
                >
                  <Plus className="w-4 h-4" />
                  إضافة المسلسل
                </Button>
              </div>
            </div>

            {/* Series Filters Card */}
            <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold flex items-center gap-2 text-amber-400">
                  <Filter className="w-5 h-5" />
                  بحث + فلترة + ترتيب
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-neutral-400"
                >
                  {showFilters ? 'إخفاء' : 'عرض'}
                </Button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  value={seriesSearch}
                  onChange={e => setSeriesSearch(e.target.value)}
                  placeholder="ابحث باسم المسلسل..."
                  className="bg-[#111827] border-[#1e293b] focus:border-amber-500 pr-9 h-10"
                />
              </div>

              {showFilters && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Input
                      value={seriesYearFilter}
                      onChange={e => setSeriesYearFilter(e.target.value)}
                      placeholder="السنة"
                      type="number"
                      min={1900}
                      max={2100}
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-9"
                    />
                    <Input
                      value={seriesMinRating}
                      onChange={e => setSeriesMinRating(e.target.value)}
                      placeholder="تقييم أعلى من"
                      type="number"
                      min={0}
                      max={100}
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-9"
                    />
                    <Select value={seriesRewatchFilter} onValueChange={setSeriesRewatchFilter}>
                      <SelectTrigger className="bg-[#111827] border-[#1e293b] h-9">
                        <SelectValue placeholder="إعادة مشاهدة" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-[#1e293b]">
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="true">✅ نعم</SelectItem>
                        <SelectItem value="false">❌ لا</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={seriesSort} onValueChange={v => setSeriesSort(v as SeriesSortOption)}>
                      <SelectTrigger className="bg-[#111827] border-[#1e293b] h-9">
                        <SelectValue placeholder="الترتيب" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-[#1e293b]">
                        <SelectItem value="latest_added">Latest added</SelectItem>
                        <SelectItem value="rating_desc">الأعلى تقييمًا</SelectItem>
                        <SelectItem value="year_desc">الأحدث</SelectItem>
                        <SelectItem value="year_asc">الأقدم</SelectItem>
                        <SelectItem value="title_asc">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearSeriesFilters} className="text-neutral-400">
                    <X className="w-4 h-4 ml-1" />
                    مسح الفلاتر
                  </Button>
                </div>
              )}
            </div>

            {/* Series List */}
            <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2 text-amber-400">
                  <Tv className="w-5 h-5" />
                  آخر المسلسلات
                </h2>
                <Badge variant="secondary" className="bg-[#111827] text-neutral-400 border border-[#1e293b]">
                  {filteredSeries.length} نتيجة
                </Badge>
              </div>

              {recentSeries.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-neutral-500">
                  <Tv className="w-16 h-16 mb-4 opacity-30" />
                  <p>لا يوجد مسلسلات مقيّمة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSeries.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#111827]/50 hover:bg-[#1e293b]/50 border border-[#1e293b]/50 transition-colors"
                    >
                      {/* Rating Badge */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center font-bold text-sm ${getRatingColor(item.userRating)}`}>
                        {formatRating(item.userRating)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{item.title}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.year}
                          </span>
                          {item.seasons && (
                            <span className="flex items-center gap-1">
                              <BookmarkPlus className="w-3 h-3" />
                              {item.seasons} {item.seasons === 1 ? 'موسم' : 'مواسم'}
                            </span>
                          )}
                          <span className={item.rewatch ? 'text-green-400' : 'text-red-400'}>
                            {item.rewatch ? '✅ إعادة مشاهدة' : '❌ لا يُعاد'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-amber-400"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-red-400"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredSeries.length > 5 && (
                <p className="text-center text-xs text-neutral-500 mt-3">
                  عرض آخر 5 من أصل {filteredSeries.length} مسلسل مفلتر
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-neutral-600 text-xs py-6">
          صُنع بـ ❤️ بواسطة Hussam
        </footer>
      </div>

      {/* ============================== ADD DIALOG ============================== */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md bg-[#0a0f1e] border-[#1e293b]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              إضافة جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  resetMovieForm()
                  resetSeriesForm()
                  setEditingItem({ type: 'movie' } as RatedItem)
                }}
                className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  editingItem?.type === 'movie'
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black'
                    : 'bg-[#111827] text-neutral-400 hover:bg-[#1e293b] border border-[#1e293b]/50'
                }`}
              >
                <Film className="w-5 h-5" />
                <span className="text-xs font-bold">فيلم</span>
              </button>
              <button
                onClick={() => {
                  resetMovieForm()
                  resetSeriesForm()
                  setEditingItem({ type: 'series' } as RatedItem)
                }}
                className={`p-3 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  editingItem?.type === 'series'
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black'
                    : 'bg-[#111827] text-neutral-400 hover:bg-[#1e293b] border border-[#1e293b]/50'
                }`}
              >
                <Tv className="w-5 h-5" />
                <span className="text-xs font-bold">مسلسل</span>
              </button>
            </div>

            {/* Movie form in dialog */}
            {(editingItem?.type === 'movie' || !editingItem) && (
              <div className="space-y-3">
                <Input
                  value={movieForm.title}
                  onChange={e => setMovieForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="اسم الفيلم"
                  className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={movieForm.year}
                    onChange={e => setMovieForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="السنة"
                    type="number"
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                  <Select value={movieForm.genre} onValueChange={v => setMovieForm(p => ({ ...p, genre: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="التصنيف" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b] max-h-[200px]">
                      {GENRE_OPTIONS.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      value={movieForm.rating}
                      onChange={e => setMovieForm(p => ({ ...p, rating: e.target.value }))}
                      placeholder="التقييم"
                      type="number"
                      min={0}
                      max={100}
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">/100</span>
                  </div>
                  <Input
                    value={movieForm.runtime}
                    onChange={e => setMovieForm(p => ({ ...p, runtime: e.target.value }))}
                    placeholder="المدة (د)"
                    type="number"
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={movieForm.status} onValueChange={v => setMovieForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="watched">Watched</SelectItem>
                      <SelectItem value="watching">Watching</SelectItem>
                      <SelectItem value="plan">Plan to Watch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={movieForm.rewatch} onValueChange={v => setMovieForm(p => ({ ...p, rewatch: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="إعادة مشاهدة؟" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="true">✅ نعم</SelectItem>
                      <SelectItem value="false">❌ لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddMovie}
                  className="w-full bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-bold gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة الفيلم
                </Button>
              </div>
            )}

            {/* Series form in dialog */}
            {editingItem?.type === 'series' && (
              <div className="space-y-3">
                <Input
                  value={seriesForm.title}
                  onChange={e => setSeriesForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="اسم المسلسل"
                  className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={seriesForm.year}
                    onChange={e => setSeriesForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="السنة"
                    type="number"
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                  <Input
                    value={seriesForm.seasons}
                    onChange={e => setSeriesForm(p => ({ ...p, seasons: e.target.value }))}
                    placeholder="عدد المواسم"
                    type="number"
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      value={seriesForm.rating}
                      onChange={e => setSeriesForm(p => ({ ...p, rating: e.target.value }))}
                      placeholder="التقييم"
                      type="number"
                      min={0}
                      max={100}
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">/100</span>
                  </div>
                  <Select value={seriesForm.rewatch} onValueChange={v => setSeriesForm(p => ({ ...p, rewatch: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="إعادة مشاهدة؟" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="true">✅ نعم</SelectItem>
                      <SelectItem value="false">❌ لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddSeries}
                  className="w-full bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-bold gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة المسلسل
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================== EDIT DIALOG ============================== */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md bg-[#0a0f1e] border-[#1e293b]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-400" />
              تعديل {editingItem?.type === 'movie' ? 'الفيلم' : 'المسلسل'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {editingItem?.type === 'movie' ? (
              <div className="space-y-3">
                <Input
                  value={movieForm.title}
                  onChange={e => setMovieForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="اسم الفيلم"
                  className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={movieForm.year}
                    onChange={e => setMovieForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="السنة"
                    type="number"
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                  <Select value={movieForm.genre} onValueChange={v => setMovieForm(p => ({ ...p, genre: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="التصنيف" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b] max-h-[200px]">
                      {GENRE_OPTIONS.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      value={movieForm.rating}
                      onChange={e => setMovieForm(p => ({ ...p, rating: e.target.value }))}
                      placeholder="التقييم"
                      type="number"
                      min={0}
                      max={100}
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">/100</span>
                  </div>
                  <Input
                    value={movieForm.runtime}
                    onChange={e => setMovieForm(p => ({ ...p, runtime: e.target.value }))}
                    placeholder="المدة (د)"
                    type="number"
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={movieForm.status} onValueChange={v => setMovieForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="watched">Watched</SelectItem>
                      <SelectItem value="watching">Watching</SelectItem>
                      <SelectItem value="plan">Plan to Watch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={movieForm.rewatch} onValueChange={v => setMovieForm(p => ({ ...p, rewatch: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="إعادة مشاهدة؟" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="true">✅ نعم</SelectItem>
                      <SelectItem value="false">❌ لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  value={seriesForm.title}
                  onChange={e => setSeriesForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="اسم المسلسل"
                  className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={seriesForm.year}
                    onChange={e => setSeriesForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="السنة"
                    type="number"
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                  <Input
                    value={seriesForm.seasons}
                    onChange={e => setSeriesForm(p => ({ ...p, seasons: e.target.value }))}
                    placeholder="عدد المواسم"
                    type="number"
                    className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      value={seriesForm.rating}
                      onChange={e => setSeriesForm(p => ({ ...p, rating: e.target.value }))}
                      placeholder="التقييم"
                      type="number"
                      min={0}
                      max={100}
                      className="bg-[#111827] border-[#1e293b] focus:border-amber-500 h-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">/100</span>
                  </div>
                  <Select value={seriesForm.rewatch} onValueChange={v => setSeriesForm(p => ({ ...p, rewatch: v }))}>
                    <SelectTrigger className="bg-[#111827] border-[#1e293b] h-10">
                      <SelectValue placeholder="إعادة مشاهدة؟" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-[#1e293b]">
                      <SelectItem value="true">✅ نعم</SelectItem>
                      <SelectItem value="false">❌ لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-bold gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                حفظ التعديل
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowEditDialog(false); setEditingItem(null) }}
                className="text-neutral-400"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
