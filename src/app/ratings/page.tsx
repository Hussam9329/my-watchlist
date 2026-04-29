'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

/* ============================================================
   CSS Import
   ============================================================ */
// We load the CSS via a link tag in useEffect to avoid Next.js CSS module issues

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
type SortOption = 'latest_added' | 'rating_desc' | 'year_desc' | 'year_asc' | 'title_asc'

/* ============================================================
   Constants
   ============================================================ */
const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Anime', 'Animation', 'Biography', 'Comedy',
  'Comics', 'Crime', 'Disaster', 'Documentary', 'Drama', 'Fantasy',
  'History', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
  'War', 'Western', 'Other'
]

const STATUS_OPTIONS = ['watched', 'watching', 'plan']

const STATUS_LABELS: Record<string, string> = {
  watched: 'Watched',
  watching: 'Watching',
  plan: 'Plan to Watch',
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest_added', label: 'Latest added' },
  { value: 'rating_desc', label: 'الأعلى تقييمًا' },
  { value: 'year_desc', label: 'الأحدث سنة' },
  { value: 'year_asc', label: 'الأقدم سنة' },
  { value: 'title_asc', label: 'A-Z' },
]

/* ============================================================
   Helpers
   ============================================================ */
function getRatingClass(rating: number) {
  if (rating >= 70) return 'rating-high'
  if (rating >= 40) return 'rating-mid'
  return 'rating-low'
}

function getStatusClass(status: string) {
  if (status === 'watched') return 'status-watched'
  if (status === 'watching') return 'status-watching'
  return 'status-plan'
}

function formatRating(num: number) {
  const n = Math.round(Number(num) * 100) / 100
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/* ============================================================
   Main Component
   ============================================================ */
export default function RatingsPage() {
  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Data
  const [allItems, setAllItems] = useState<RatedItem[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('movies')
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<RatedItem | null>(null)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [accentColor, setAccentColor] = useState('#d4a843')

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Movie filters
  const [movieSearch, setMovieSearch] = useState('')
  const [movieGenreFilter, setMovieGenreFilter] = useState('all')
  const [movieYearFilter, setMovieYearFilter] = useState('')
  const [movieMinRating, setMovieMinRating] = useState('')
  const [movieStatusFilter, setMovieStatusFilter] = useState('all')
  const [movieSort, setMovieSort] = useState<SortOption>('latest_added')

  // Series filters
  const [seriesSearch, setSeriesSearch] = useState('')
  const [seriesYearFilter, setSeriesYearFilter] = useState('')
  const [seriesMinRating, setSeriesMinRating] = useState('')
  const [seriesSort, setSeriesSort] = useState<SortOption>('latest_added')

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

  // Print select
  const [printSort, setPrintSort] = useState('alpha')

  /* ============================================================
     Load CSS
     ============================================================ */
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/ratings-style.css'
    link.id = 'ratings-style'
    document.head.appendChild(link)
    return () => {
      const el = document.getElementById('ratings-style')
      if (el) el.remove()
    }
  }, [])

  /* ============================================================
     Theme & Accent
     ============================================================ */
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.remove('light-theme')
    } else {
      document.body.classList.add('light-theme')
    }
  }, [isDarkTheme])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor)
    // Derive glow
    const r = parseInt(accentColor.slice(1, 3), 16)
    const g = parseInt(accentColor.slice(3, 5), 16)
    const b = parseInt(accentColor.slice(5, 7), 16)
    document.documentElement.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.15)`)
  }, [accentColor])

  /* ============================================================
     Toast
     ============================================================ */
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

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
      const itemsRes = await fetch('/api/watchlist')
      const itemsData = await itemsRes.json()

      let items: RatedItem[] = []
      if (itemsData.items && Array.isArray(itemsData.items)) {
        items = itemsData.items
      } else if (Array.isArray(itemsData)) {
        items = itemsData
      }

      const ratedItems = items.filter(
        (i: any) => (i.type === 'movie' || i.type === 'series') && i.userRating != null
      )
      setAllItems(ratedItems)

      const statsRes = await fetch('/api/ratings-stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch {
      showToast('حدث خطأ أثناء تحميل البيانات', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

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

    switch (seriesSort) {
      case 'rating_desc': result.sort((a, b) => b.userRating - a.userRating); break
      case 'year_desc': result.sort((a, b) => parseInt(b.year) - parseInt(a.year)); break
      case 'year_asc': result.sort((a, b) => parseInt(a.year) - parseInt(b.year)); break
      case 'title_asc': result.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })); break
      default: result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    }

    return result
  }, [series, seriesSearch, seriesYearFilter, seriesMinRating, seriesSort])

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

    if (!title) return showToast('اسم الفيلم مطلوب', 'error')
    if (!genre) return showToast('اختر التصنيف', 'error')
    if (isNaN(rating) || rating < 0 || rating > 100) return showToast('التقييم يجب أن يكون بين 0 و 100', 'error')
    if (isNaN(year) || year < 1900 || year > 2100) return showToast('سنة غير صالحة', 'error')

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
        showToast('⚠️ موجود مسبقاً!', 'error')
        return
      }

      if (data && data.id) {
        await fetchData()
        resetMovieForm()
        showToast(`تم إضافة "${title}" بنجاح`)
      }
    } catch {
      showToast('حدث خطأ أثناء الإضافة', 'error')
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

    if (!title) return showToast('اسم المسلسل مطلوب', 'error')
    if (isNaN(seasons) || seasons < 1 || seasons > 100) return showToast('عدد المواسم غير صحيح', 'error')
    if (isNaN(rating) || rating < 0 || rating > 100) return showToast('التقييم يجب أن يكون بين 0 و 100', 'error')
    if (isNaN(year) || year < 1900 || year > 2100) return showToast('سنة غير صالحة', 'error')

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
        showToast('⚠️ موجود مسبقاً!', 'error')
        return
      }

      if (data && data.id) {
        await fetchData()
        resetSeriesForm()
        showToast(`تم إضافة "${title}" بنجاح`)
      }
    } catch {
      showToast('حدث خطأ أثناء الإضافة', 'error')
    }
  }

  /* ============================================================
     CRUD: Edit
     ============================================================ */
  const openEdit = (item: RatedItem) => {
    setEditingItem(item)
    setIsEditing(true)
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
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return

    try {
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
        showToast('تم حفظ التعديلات بنجاح')
      }

      setIsEditing(false)
      setEditingItem(null)
    } catch {
      showToast('حدث خطأ أثناء الحفظ', 'error')
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingItem(null)
    resetMovieForm()
    resetSeriesForm()
  }

  /* ============================================================
     CRUD: Delete
     ============================================================ */
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return

    try {
      await fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
      setAllItems(prev => prev.filter(i => i.id !== id))
      showToast(`تم حذف "${title}"`)
      fetchData()
    } catch {
      showToast('حدث خطأ أثناء الحذف', 'error')
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
      showToast('لا توجد نتائج للطباعة', 'error')
      return
    }

    if (printSort === 'alpha') {
      itemsToPrint.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }))
    } else if (printSort === 'rating') {
      itemsToPrint.sort((a, b) => b.userRating - a.userRating)
    } else if (printSort === 'year') {
      itemsToPrint.sort((a, b) => parseInt(b.year) - parseInt(a.year))
    }

    const rows = itemsToPrint.map((m, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${m.title}</td>
        <td>${m.year}</td>
        <td>${m.genres?.[0] || '-'}</td>
        <td>${STATUS_LABELS[m.ratingStatus] || 'Watched'}</td>
        <td>${formatRating(m.userRating)}</td>
        <td>${m.rewatch ? '✅ نعم' : '❌ لا'}</td>
      </tr>
    `).join('')

    const printWindow = window.open('', '_blank', 'width=1100,height=800')
    if (!printWindow) {
      showToast('المتصفح منع فتح نافذة الطباعة', 'error')
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

  /* ============================================================
     Determine if editing a movie or series
     ============================================================ */
  const isEditingMovie = editingItem?.type === 'movie'
  const isEditingSeries = editingItem?.type === 'series'

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div className="ratings-page" dir="rtl">
      {/* Background effects */}
      <div className="bg-effects">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="glow glow-3" />
      </div>

      <div className="ratings-container">
        {/* Header */}
        <div className="ratings-header">
          <div className="top-controls">
            <a href="/" className="icon-btn" title="رجوع">→</a>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="icon-btn"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                title="تبديل السمة"
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
              <div className="accent-wrap">
                <input
                  type="color"
                  className="accent-picker-input"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  title="لون التمييز"
                />
              </div>
            </div>
          </div>
          <div className="logo-icon">🎬</div>
          <h1>قائمة المشاهدة</h1>
          <p className="subtitle">آخر 5 عناصر فقط للعرض + إحصائيات دقيقة من كل البيانات</p>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="dashboard-card">
            <div className="list-title">
              <span style={{ color: 'var(--accent)' }}>📊</span>
              إحصائيات
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span>إجمالي المقيّم</span>
                <strong>{stats.totalRated}</strong>
              </div>
              <div className="stat-item">
                <span>أكثر تصنيف</span>
                <strong>{stats.topGenre}</strong>
              </div>
              <div className="stat-item">
                <span>متوسط التقييم</span>
                <strong>{formatRating(stats.avgRating)}</strong>
              </div>
              <div className="stat-item">
                <span>أكثر سنة إنتاج</span>
                <strong>{stats.topYear}</strong>
              </div>
              <div className="stat-item">
                <span>أُضيف هذا الشهر</span>
                <strong>{stats.thisMonth}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            🎬 أفلام
          </button>
          <button
            className={`tab-btn ${activeTab === 'series' ? 'active' : ''}`}
            onClick={() => setActiveTab('series')}
          >
            📺 مسلسلات
          </button>
        </div>

        {/* ============================== MOVIES TAB ============================== */}
        {activeTab === 'movies' && (
          <>
            {/* Add/Edit Movie Form Card */}
            <div className="form-card">
              <div className="form-title">
                <span style={{ color: 'var(--accent)' }}>{isEditing && isEditingMovie ? '✏️' : '➕'}</span>
                {isEditing && isEditingMovie ? 'تعديل الفيلم' : 'إضافة فيلم جديد'}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>اسم الفيلم</label>
                  <input
                    type="text"
                    value={movieForm.title}
                    onChange={e => setMovieForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="اسم الفيلم"
                  />
                </div>
                <div className="form-group">
                  <label>سنة الإنتاج</label>
                  <input
                    type="number"
                    value={movieForm.year}
                    onChange={e => setMovieForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="سنة الإنتاج"
                    min={1900}
                    max={2100}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>التصنيف</label>
                  <select
                    value={movieForm.genre}
                    onChange={e => setMovieForm(p => ({ ...p, genre: e.target.value }))}
                  >
                    <option value="">اختر التصنيف</option>
                    {GENRE_OPTIONS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>التقييم</label>
                  <div className="rating-input-wrapper">
                    <span className="rating-max">/100</span>
                    <input
                      type="number"
                      value={movieForm.rating}
                      onChange={e => setMovieForm(p => ({ ...p, rating: e.target.value }))}
                      placeholder="0-100"
                      min={0}
                      max={100}
                      step="any"
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>المدة (دقائق)</label>
                  <input
                    type="number"
                    value={movieForm.runtime}
                    onChange={e => setMovieForm(p => ({ ...p, runtime: e.target.value }))}
                    placeholder="اختياري"
                    min={1}
                    max={400}
                  />
                </div>
                <div className="form-group">
                  <label>الحالة</label>
                  <select
                    value={movieForm.status}
                    onChange={e => setMovieForm(p => ({ ...p, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>إعادة مشاهدة؟</label>
                  <select
                    value={movieForm.rewatch}
                    onChange={e => setMovieForm(p => ({ ...p, rewatch: e.target.value }))}
                  >
                    <option value="true">✅ نعم</option>
                    <option value="false">❌ لا</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                {isEditing && isEditingMovie ? (
                  <>
                    <button className="btn-submit" onClick={handleSaveEdit}>💾 حفظ التعديلات</button>
                    <button className="btn-secondary" onClick={cancelEdit}>إلغاء</button>
                  </>
                ) : (
                  <button className="btn-submit" onClick={handleAddMovie}>➕ إضافة الفيلم</button>
                )}
              </div>
            </div>

            {/* Filters Card */}
            <div className="form-card">
              <div className="form-title">
                <span style={{ color: 'var(--accent)' }}>🔍</span>
                بحث + فلترة + ترتيب
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={movieSearch}
                  onChange={e => setMovieSearch(e.target.value)}
                  placeholder="ابحث باسم الفيلم..."
                />
              </div>
              <div className="filters-grid">
                <div className="form-group">
                  <label>التصنيف</label>
                  <select value={movieGenreFilter} onChange={e => setMovieGenreFilter(e.target.value)}>
                    <option value="all">الكل</option>
                    {GENRE_OPTIONS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>السنة</label>
                  <input
                    type="number"
                    value={movieYearFilter}
                    onChange={e => setMovieYearFilter(e.target.value)}
                    placeholder="السنة"
                    min={1900}
                    max={2100}
                  />
                </div>
                <div className="form-group">
                  <label>تقييم أعلى من</label>
                  <input
                    type="number"
                    value={movieMinRating}
                    onChange={e => setMovieMinRating(e.target.value)}
                    placeholder="تقييم أدنى"
                    min={0}
                    max={100}
                  />
                </div>
                <div className="form-group">
                  <label>الحالة</label>
                  <select value={movieStatusFilter} onChange={e => setMovieStatusFilter(e.target.value)}>
                    <option value="all">الكل</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>الترتيب</label>
                  <select value={movieSort} onChange={e => setMovieSort(e.target.value as SortOption)}>
                    {SORT_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="filter-actions">
                <button className="btn-secondary" onClick={clearMovieFilters}>✖ مسح الفلاتر</button>
                <button className="btn-secondary" onClick={printFilteredMovies}>🖨️ طباعة النتائج</button>
                <button className="btn-accent" onClick={pickMovieNight}>🎲 اختار لي فيلم الليلة</button>
              </div>
              {movieNightResult && (
                <div className="picker-result">
                  {movieNightResult}
                </div>
              )}
            </div>

            {/* Movies List */}
            <div className="list-card">
              <div className="list-title">
                <span style={{ color: 'var(--accent)' }}>🎬</span>
                آخر الأفلام
                <span className="count-badge">{filteredMovies.length}</span>
              </div>
              {recentMovies.length === 0 ? (
                <div className="empty-state">
                  <p>لا يوجد أفلام مقيّمة</p>
                </div>
              ) : (
                <div className="items-list">
                  {recentMovies.map(item => (
                    <div className="item-card" key={item.id}>
                      <div className={`item-rating ${getRatingClass(item.userRating)}`}>
                        {formatRating(item.userRating)}
                      </div>
                      <div className="item-info">
                        <div className="item-title">{item.title}</div>
                        <div className="item-meta">
                          <span>{item.year}</span>
                          {item.genres?.[0] && (
                            <span className="genre-badge">{item.genres[0]}</span>
                          )}
                          <span className={`status-pill ${getStatusClass(item.ratingStatus)}`}>
                            {STATUS_LABELS[item.ratingStatus] || 'Watched'}
                          </span>
                          {item.runtime && <span>{item.runtime} د</span>}
                          <span className={item.rewatch ? 'rewatch-yes' : 'rewatch-no'}>
                            {item.rewatch ? '🔄 إعادة' : '🚫'}
                          </span>
                        </div>
                      </div>
                      <div className="item-actions">
                        <button
                          className="btn-icon"
                          onClick={() => openEdit(item)}
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(item.id, item.title)}
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================== SERIES TAB ============================== */}
        {activeTab === 'series' && (
          <>
            {/* Add/Edit Series Form Card */}
            <div className="form-card">
              <div className="form-title">
                <span style={{ color: 'var(--accent)' }}>{isEditing && isEditingSeries ? '✏️' : '➕'}</span>
                {isEditing && isEditingSeries ? 'تعديل المسلسل' : 'إضافة مسلسل جديد'}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>اسم المسلسل</label>
                  <input
                    type="text"
                    value={seriesForm.title}
                    onChange={e => setSeriesForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="اسم المسلسل"
                  />
                </div>
                <div className="form-group">
                  <label>سنة الإنتاج</label>
                  <input
                    type="number"
                    value={seriesForm.year}
                    onChange={e => setSeriesForm(p => ({ ...p, year: e.target.value }))}
                    placeholder="سنة الإنتاج"
                    min={1900}
                    max={2100}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>عدد المواسم</label>
                  <input
                    type="number"
                    value={seriesForm.seasons}
                    onChange={e => setSeriesForm(p => ({ ...p, seasons: e.target.value }))}
                    placeholder="عدد المواسم"
                    min={1}
                    max={100}
                  />
                </div>
                <div className="form-group">
                  <label>التقييم</label>
                  <div className="rating-input-wrapper">
                    <span className="rating-max">/100</span>
                    <input
                      type="number"
                      value={seriesForm.rating}
                      onChange={e => setSeriesForm(p => ({ ...p, rating: e.target.value }))}
                      placeholder="0-100"
                      min={0}
                      max={100}
                      step="any"
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>إعادة مشاهدة؟</label>
                  <select
                    value={seriesForm.rewatch}
                    onChange={e => setSeriesForm(p => ({ ...p, rewatch: e.target.value }))}
                  >
                    <option value="true">✅ نعم</option>
                    <option value="false">❌ لا</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                {isEditing && isEditingSeries ? (
                  <>
                    <button className="btn-submit" onClick={handleSaveEdit}>💾 حفظ التعديلات</button>
                    <button className="btn-secondary" onClick={cancelEdit}>إلغاء</button>
                  </>
                ) : (
                  <button className="btn-submit" onClick={handleAddSeries}>➕ إضافة المسلسل</button>
                )}
              </div>
            </div>

            {/* Series Filters Card */}
            <div className="form-card">
              <div className="form-title">
                <span style={{ color: 'var(--accent)' }}>🔍</span>
                بحث + فلترة + ترتيب
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={seriesSearch}
                  onChange={e => setSeriesSearch(e.target.value)}
                  placeholder="ابحث باسم المسلسل..."
                />
              </div>
              <div className="filters-grid">
                <div className="form-group">
                  <label>السنة</label>
                  <input
                    type="number"
                    value={seriesYearFilter}
                    onChange={e => setSeriesYearFilter(e.target.value)}
                    placeholder="السنة"
                    min={1900}
                    max={2100}
                  />
                </div>
                <div className="form-group">
                  <label>تقييم أعلى من</label>
                  <input
                    type="number"
                    value={seriesMinRating}
                    onChange={e => setSeriesMinRating(e.target.value)}
                    placeholder="تقييم أدنى"
                    min={0}
                    max={100}
                  />
                </div>
                <div className="form-group">
                  <label>الترتيب</label>
                  <select value={seriesSort} onChange={e => setSeriesSort(e.target.value as SortOption)}>
                    {SORT_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="filter-actions">
                <button className="btn-secondary" onClick={clearSeriesFilters}>✖ مسح الفلاتر</button>
              </div>
            </div>

            {/* Series List */}
            <div className="list-card">
              <div className="list-title">
                <span style={{ color: 'var(--accent)' }}>📺</span>
                آخر المسلسلات
                <span className="count-badge">{filteredSeries.length}</span>
              </div>
              {recentSeries.length === 0 ? (
                <div className="empty-state">
                  <p>لا يوجد مسلسلات مقيّمة</p>
                </div>
              ) : (
                <div className="items-list">
                  {recentSeries.map(item => (
                    <div className="item-card" key={item.id}>
                      <div className={`item-rating ${getRatingClass(item.userRating)}`}>
                        {formatRating(item.userRating)}
                      </div>
                      <div className="item-info">
                        <div className="item-title">{item.title}</div>
                        <div className="item-meta">
                          <span>{item.year}</span>
                          {item.seasons && <span>{item.seasons} مواسم</span>}
                          <span className={item.rewatch ? 'rewatch-yes' : 'rewatch-no'}>
                            {item.rewatch ? '🔄 إعادة' : '🚫'}
                          </span>
                        </div>
                      </div>
                      <div className="item-actions">
                        <button
                          className="btn-icon"
                          onClick={() => openEdit(item)}
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(item.id, item.title)}
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="page-footer">
          صُنع بـ ❤️ بواسطة Hussam
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast-container show ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
