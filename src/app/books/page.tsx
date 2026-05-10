'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/hooks/useAuth'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { toast } from 'sonner'
import {
  Plus, BookOpen, Star, Check, X, Search, Loader2, Edit3, Grid3X3, List,
  Download, Upload as UploadIcon, BarChart3,
  Settings, Trash2, ArrowRight, SlidersHorizontal
} from 'lucide-react'
import { MediaItem, MetadataResult } from '@/lib/types'
import { compressImage } from '@/lib/image'
import { getRatingColor, getRatingBg } from '@/lib/rating'
import { RT_SORT_OPTIONS } from '@/lib/constants'
import { buildItemBody, itemToFormData, exportDataToFile, importDataFromFile } from '@/lib/crud'
import { sortMediaItems, filterMediaItems } from '@/lib/sort'
import { SkeletonGrid } from '@/components/shared/SkeletonGrid'
import { RatingStars } from '@/components/shared/RatingStars'

// ==================== Memoized Card ====================
interface BookCardProps {
  item: MediaItem
  onClick: () => void
  onDelete: () => void
  onQuickRate: () => void
  viewMode: 'grid' | 'list'
}

const BookCard = React.memo(function BookCard({ item, onClick, onDelete, onQuickRate, viewMode }: BookCardProps) {
  if (viewMode === 'list') {
    return (
      <div
        className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 active:scale-[0.97] transition-transform cursor-pointer hover:border-[#3a3a3a]"
        onClick={onClick}
      >
        <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#2a2a2a] shrink-0">
          {item.poster ? (
            <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#555]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.author && <span className="text-xs text-[#888] truncate max-w-[120px]">{item.author}</span>}
            <span className="text-xs text-[#666]">{item.year}</span>
            {item.userRating != null && (
              <span className={`text-xs font-bold ${getRatingColor(item.userRating, 10, 'emerald')}`}>
                {item.userRating}/10
              </span>
            )}
          </div>
        </div>

      </div>
    )
  }

  return (
    <div
      className="group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden active:scale-[0.97] transition-transform cursor-pointer hover:border-[#3a3a3a]"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative bg-[#2a2a2a]">
        {item.poster ? (
          <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-[#444]" />
          </div>
        )}

        {/* Book badge */}
        <div className="absolute top-2 left-2">
          <div className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-l from-emerald-500 to-emerald-700 text-white">
            كتاب
          </div>
        </div>
        {/* Rating overlay */}
        {item.userRating != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
            <div className={`text-lg font-bold ${getRatingColor(item.userRating, 10, 'emerald')}`}>
              {item.userRating}/10
            </div>
          </div>
        )}
        {item.userRating == null && item.rating && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
            <div className="text-sm font-bold text-emerald-400">⭐ {item.rating}</div>
          </div>
        )}
        {/* Quick actions on hover (desktop) */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-3" onClick={e => e.stopPropagation()}>
          <button
            onClick={onQuickRate}
            className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
            title="تقييم"
          >
            <Star className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="w-11 h-11 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:scale-110 transition-transform"
            title="حذف"
          >
            <Trash2 className="w-5 h-5" />
          </button>

        </div>
        {/* Mobile quick actions - always visible on touch devices */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2.5 md:hidden" onClick={e => e.stopPropagation()}>
          <button
            onClick={onQuickRate}
            className="w-11 h-11 rounded-full bg-emerald-500/90 text-white flex items-center justify-center active:scale-90 transition-transform backdrop-blur-sm"
            title="تقييم"
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="w-11 h-11 rounded-full bg-red-500/70 text-white flex items-center justify-center active:scale-90 transition-transform backdrop-blur-sm"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-2.5">
        <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.author && <span className="text-[10px] text-[#999] truncate max-w-[100px]">{item.author}</span>}
          <span className="text-xs text-[#666]">{item.year}</span>
          {item.pages != null && <span className="text-[10px] text-[#555]">{item.pages} صفحة</span>}
        </div>
      </div>
    </div>
  )
})

// ==================== Main Component ====================
export default function BooksPage() {
  const isMobile = useIsMobile()

  // Auth
  const isAuthChecked = useAuth()

  // Data
  const [books, setBooks] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalBooks, setTotalBooks] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  // UI
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebouncedValue(searchQuery)
  const [sortBy, setSortBy] = useState('addedAt_desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showSortFilter, setShowSortFilter] = useState(false)
  const [filterGenre, setFilterGenre] = useState('')
  const [filterYear, setFilterYear] = useState('')

  // Modals
  const [showDetails, setShowDetails] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showQuickRate, setShowQuickRate] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Form
  const [formData, setFormData] = useState<Record<string, string>>({
    title: '', originalTitle: '', year: '', type: 'book', poster: '', rating: '',
    overview: '', genres: '', author: '', pages: '', tags: '', notes: '',
    userRating: '',
    rewatch: 'false', ratingStatus: 'watched',
  })
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Metadata search
  const [metaQuery, setMetaQuery] = useState('')
  const [metaResults, setMetaResults] = useState<MetadataResult[]>([])
  const [metaLoading, setMetaLoading] = useState(false)

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  // ==================== Fetch Books (Progressive Auto-Load) ====================
  const fetchBooks = useCallback(async (pageNum: number = 1, reset = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    try {
      const params = new URLSearchParams()
      params.set('type', 'book')
      params.set('limit', '50')
      params.set('page', String(pageNum))
      params.set('sortBy', sortBy)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      if (reset || pageNum === 1) {
        setBooks(data.items || [])
      } else {
        setBooks(prev => {
          const existingIds = new Set(prev.map(i => i.id))
          const newItems = (data.items || []).filter((i: MediaItem) => !existingIds.has(i.id))
          return [...prev, ...newItems]
        })
      }
      setTotalBooks(data.total || 0)
      setHasMore(data.hasMore || false)
      setPage(pageNum)
      // Auto-load next page if there are more items
      if (data.hasMore) {
        setTimeout(() => fetchBooks(pageNum + 1), 100)
      }
    } catch {
      toast.error('خطأ في جلب البيانات')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedSearch, sortBy])

  useEffect(() => {
    if (!isAuthChecked) return
    setPage(1)
    fetchBooks(1, true)
  }, [isAuthChecked, fetchBooks])

  // ==================== CRUD ====================
  const createItem = async () => {
    if (!formData.title.trim()) {
      toast.error('ابحث عن الكتاب أولاً باستخدام البحث التلقائي')
      return
    }
    if (!formData.year.trim()) {
      toast.error('السنة مطلوبة - اختر كتاباً يحتوي على سنة من نتائج البحث')
      return
    }
    setFormSubmitting(true)
    try {
      const body = buildItemBody(formData, 'book')
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json()
        if (errData.duplicate) {
          toast.error('هذا الكتاب موجود مسبقاً!')
          return
        }
        throw new Error(errData.error)
      }
      toast.success('تمت إضافة الكتاب بنجاح')
      setShowAddForm(false)
      resetForm()
      fetchBooks(1, true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'خطأ في الإضافة')
    } finally {
      setFormSubmitting(false)
    }
  }

  const updateItem = async () => {
    if (!selectedItem) return
    setFormSubmitting(true)
    try {
      const body = buildItemBody(formData, 'book')
      const res = await fetch(`/api/watchlist/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('خطأ في التحديث')
      toast.success('تم التحديث بنجاح')
      setShowEditForm(false)
      setShowDetails(false)
      setSelectedItem(null)
      fetchBooks(1, true)
    } catch {
      toast.error('خطأ في التحديث')
    } finally {
      setFormSubmitting(false)
    }
  }

  const deleteItem = async () => {
    if (!selectedItem) return
    try {
      const res = await fetch(`/api/watchlist/${selectedItem.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('خطأ في الحذف')
      toast.success('تم حذف الكتاب')
      setShowDeleteConfirm(false)
      setShowDetails(false)
      setSelectedItem(null)
      fetchBooks(1, true)
    } catch {
      toast.error('خطأ في الحذف')
    }
  }

  // ==================== Metadata Search ====================
  const searchMetadata = async () => {
    if (!metaQuery.trim()) return
    setMetaLoading(true)
    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: metaQuery, type: 'book' }),
      })
      const data = await res.json()
      setMetaResults(data.results || [])
    } catch {
      toast.error('خطأ في البحث')
    } finally {
      setMetaLoading(false)
    }
  }

  const selectMetadata = (result: MetadataResult) => {
    setFormData(prev => ({
      ...prev,
      title: result.title || prev.title,
      originalTitle: result.originalTitle || prev.originalTitle,
      year: result.year || prev.year,
      poster: result.poster || prev.poster,
      overview: result.overview || prev.overview,
      rating: result.rating || prev.rating,
      genres: result.genres ? result.genres.join(', ') : prev.genres,
      author: result.author || prev.author,
      pages: result.pages != null ? String(result.pages) : prev.pages,
    }))
    setMetaResults([])
    setMetaQuery('')
    toast.success('تم استيراد البيانات')
  }

  // ==================== Image Upload ====================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const compressed = await compressImage(file)
      setFormData(prev => ({ ...prev, poster: compressed }))
      toast.success('تم رفع الصورة')
    } catch {
      toast.error('خطأ في رفع الصورة')
    } finally {
      setUploadingImage(false)
    }
  }

  // ==================== Form Helpers ====================
  const resetForm = () => {
    setFormData({
      title: '', originalTitle: '', year: '', type: 'book', poster: '', rating: '',
      overview: '', genres: '', author: '', pages: '', tags: '', notes: '',
      userRating: '',
      rewatch: 'false', ratingStatus: 'watched',
    })
    setMetaResults([])
    setMetaQuery('')
  }

  const openAddForm = () => {
    resetForm()
    setShowAddForm(true)
  }

  const openEditForm = (item: MediaItem) => {
    setFormData(itemToFormData(item))
    setSelectedItem(item)
    setShowEditForm(true)
  }

  const openDetails = (item: MediaItem) => {
    setSelectedItem(item)
    setShowDetails(true)
  }

  const openQuickRate = (item: MediaItem) => {
    setSelectedItem(item)
    setShowQuickRate(true)
  }

  // ==================== Sort & Filter ====================
  const processedItems = useMemo(() => {
    return filterMediaItems(sortMediaItems(books, sortBy), { filterGenre, filterYear })
  }, [books, sortBy, filterGenre, filterYear])

  // ==================== Unique genres/years for filters ====================
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>()
    books.forEach(b => {
      const genreList = typeof b.genres === 'string'
        ? b.genres.split(',').map(g => g.trim()).filter(Boolean)
        : Array.isArray(b.genres) ? b.genres : []
      genreList.forEach(g => { if (g.trim()) genreSet.add(g.trim()) })
    })
    return Array.from(genreSet).sort()
  }, [books])

  const allYears = useMemo(() => {
    const yearSet = new Set<string>()
    books.forEach(b => { if (b.year) yearSet.add(b.year) })
    // Sort years numerically (not alphabetically) since year is a string
    return Array.from(yearSet).sort((a, b) => (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0))
  }, [books])

  // ==================== Sort & Filter Content (shared between Drawer/Popover) ====================
  const sortFilterContent = (
    <div className="space-y-4 p-4" dir="rtl">
      {/* Sort Section */}
      <div>
        <h4 className="text-xs font-bold text-emerald-400 mb-2">ترتيب</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {RT_SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.97] ${
                sortBy === opt.value
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#0a0a0a] text-[#999] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#ccc]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Year Filter as Chips */}
      <div>
        <h4 className="text-xs font-bold text-emerald-400 mb-2">السنة</h4>
        <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
          <button
            onClick={() => setFilterYear('')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              !filterYear
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-[#0a0a0a] text-[#888] border border-[#2a2a2a] hover:text-[#ccc]'
            }`}
          >
            الكل
          </button>
          {allYears.map(y => (
            <button
              key={y}
              onClick={() => setFilterYear(y)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterYear === y
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#0a0a0a] text-[#888] border border-[#2a2a2a] hover:text-[#ccc]'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filter */}
      <div>
        <h4 className="text-xs font-bold text-emerald-400 mb-2">التصنيف</h4>
        <Select value={filterGenre || '__all__'} onValueChange={v => setFilterGenre(v === '__all__' ? '' : v)}>
          <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-sm h-10">
            <SelectValue placeholder="كل التصنيفات" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <SelectItem value="__all__">كل التصنيفات</SelectItem>
            {allGenres.map(g => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Mode */}
      <div>
        <h4 className="text-xs font-bold text-emerald-400 mb-2">طريقة العرض</h4>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-[#0a0a0a] text-[#999] border border-[#2a2a2a] hover:text-[#ccc]'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            شبكة
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-[#0a0a0a] text-[#999] border border-[#2a2a2a] hover:text-[#ccc]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            قائمة
          </button>
        </div>
      </div>

      {/* Clear All */}
      {(filterGenre || filterYear) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setFilterGenre(''); setFilterYear('') }}
          className="w-full text-[#888] text-xs hover:text-red-400 hover:bg-red-500/10"
        >
          <X className="w-3.5 h-3.5 ml-1" />
          مسح الكل
        </Button>
      )}
    </div>
  )

  // ==================== Stats ====================
  const stats = useMemo(() => {
    const total = books.length
    const rated = books.filter(b => b.userRating != null)
    const avgRating = rated.length > 0 ? (rated.reduce((sum, b) => sum + (b.userRating ?? 0), 0) / rated.length) : 0
    const totalPages = books.reduce((sum, b) => sum + (b.pages ?? 0), 0)
    const topGenre = allGenres.length > 0 ? allGenres[0] : '-'
    const topRated = rated.length > 0 ? rated.reduce((best, b) => (b.userRating ?? 0) > (best.userRating ?? 0) ? b : best, rated[0]) : null
    return { total, avgRating, totalPages, topGenre, topRated }
  }, [books, allGenres])

  // ==================== Export/Import ====================
  const exportData = async () => {
    try {
      await exportDataToFile('book', 'hussamvision-books')
      toast.success('تم تصدير البيانات')
    } catch {
      toast.error('خطأ في التصدير')
    }
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { imported, duplicates } = await importDataFromFile(file, 'book')
      toast.success(`تم استيراد ${imported} كتاب (${duplicates} مكرر)`)
      fetchBooks(1, true)
    } catch {
      toast.error('خطأ في استيراد الملف')
    }
    if (importInputRef.current) importInputRef.current.value = ''
  }

  // ==================== Quick Rate ====================
  const handleQuickRate = async (rating: number) => {
    if (!selectedItem) return
    try {
      const res = await fetch(`/api/watchlist/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRating: rating, watched: true, watchedAt: new Date().toISOString().split('T')[0] }),
      })
      if (!res.ok) throw new Error('خطأ')
      const updated = await res.json()
      setBooks(prev => prev.map(i => i.id === selectedItem.id ? { ...i, userRating: rating, watched: true } : i))
      setSelectedItem(updated)
      toast.success(`تم التقييم: ${rating}/10`)
      setShowQuickRate(false)
    } catch {
      toast.error('خطأ في التقييم')
    }
  }

  // ==================== Form Component ====================
  const renderForm = (isEdit: boolean) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1" dir="rtl">
      {/* Metadata Search */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-emerald-400">البحث عن كتاب</label>
        <div className="flex gap-2">
          <Input
            value={metaQuery}
            onChange={e => setMetaQuery(e.target.value)}
            placeholder="ابحث عن كتاب..."
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
            onKeyDown={e => e.key === 'Enter' && searchMetadata()}
          />
          <Button
            onClick={searchMetadata}
            disabled={metaLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          >
            {metaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        {metaResults.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {metaResults.map((result, i) => (
              <button
                key={i}
                onClick={() => selectMetadata(result)}
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-[#111] border border-[#333] hover:border-emerald-500/50 transition-colors active:scale-[0.97] text-right"
              >
                {result.poster ? (
                  <img src={result.poster} alt="" className="w-10 h-14 rounded object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-14 rounded bg-[#2a2a2a] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-[#555]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{result.title}</div>
                  <div className="text-xs text-[#888]">
                    {result.author} {result.year && `• ${result.year}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
        {/* Title - read-only, auto-filled from search */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">العنوان</label>
          {formData.title ? (
            <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-[#111] border border-[#333] text-white text-sm font-medium">
              <span className="flex-1 truncate">{formData.title}</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, title: '', year: '', poster: '', originalTitle: '', overview: '', rating: '', author: '', pages: '' }))}
                className="text-[#666] hover:text-red-400 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center px-3 h-10 rounded-lg bg-[#111]/50 border border-dashed border-[#444] text-[#555] text-sm">
              <Search className="w-3.5 h-3.5 ml-2" />
              ابحث أعلاه لتحديد الكتاب تلقائياً
            </div>
          )}
        </div>

        {/* Original Title */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">العنوان الأصلي</label>
          <Input
            value={formData.originalTitle}
            onChange={e => setFormData(prev => ({ ...prev, originalTitle: e.target.value }))}
            placeholder="Original Title"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
            dir="ltr"
          />
        </div>

        {/* Year & Pages */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[#999]">السنة</label>
            {formData.year ? (
              <div className="flex items-center px-3 h-10 rounded-lg bg-[#111] border border-[#333] text-white text-sm font-medium">
                {formData.year}
              </div>
            ) : (
              <div className="flex items-center px-3 h-10 rounded-lg bg-[#111]/50 border border-dashed border-[#444] text-[#555] text-sm">
                تلقائي
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#999]">عدد الصفحات</label>
            <Input
              value={formData.pages}
              onChange={e => setFormData(prev => ({ ...prev, pages: e.target.value }))}
              placeholder="320"
              className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
            />
          </div>
        </div>

        {/* Author */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">المؤلف</label>
          <Input
            value={formData.author}
            onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
            placeholder="اسم المؤلف"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
          />
        </div>

        {/* Poster - preview + upload only, no URL field */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">صورة الغلاف</label>
          <div className="flex items-center gap-3">
            {formData.poster ? (
              <div className="relative group shrink-0">
                <div className="w-16 h-24 rounded-xl overflow-hidden bg-[#2a2a2a] border border-[#333] shadow-lg">
                  <img src={formData.poster} alt="preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, poster: '' }))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-400 transition-colors shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2a2a2a] text-[#aaa] text-sm hover:bg-[#333] hover:text-white transition-colors min-h-[44px] border border-dashed border-[#444]">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                  <span>رفع صورة مختلفة</span>
                </div>
              </label>
            )}
            {formData.poster && (
              <label className="cursor-pointer block">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#2a2a2a] text-[#aaa] text-xs hover:bg-[#333] hover:text-white transition-colors border border-dashed border-[#444]">
                  {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadIcon className="w-3 h-3" />}
                  <span>تغيير</span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">التقييم العام</label>
          <Input
            value={formData.rating}
            onChange={e => setFormData(prev => ({ ...prev, rating: e.target.value }))}
            placeholder="4.5"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
          />
        </div>

        {/* Genres */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">التصنيفات (مفصولة بفواصل)</label>
          <Input
            value={formData.genres}
            onChange={e => setFormData(prev => ({ ...prev, genres: e.target.value }))}
            placeholder="خيال علمي، مغامرة"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
          />
        </div>

        {/* Overview */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">الوصف</label>
          <Textarea
            value={formData.overview}
            onChange={e => setFormData(prev => ({ ...prev, overview: e.target.value }))}
            placeholder="وصف مختصر للكتاب..."
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555] min-h-[80px]"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">الوسوم (مفصولة بفواصل)</label>
          <Input
            value={formData.tags}
            onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="توصية، هدية"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">ملاحظات</label>
          <Textarea
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="ملاحظاتك الشخصية..."
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555] min-h-[60px]"
          />
        </div>

        {/* User Rating */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">تقييمي (من 10)</label>
          <Input
            value={formData.userRating}
            onChange={e => setFormData(prev => ({ ...prev, userRating: e.target.value }))}
            placeholder="8"
            type="number"
            min="1"
            max="10"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
          />
        </div>
      </div>
    </div>
  )

  // ==================== Details Component ====================
  const renderDetails = () => {
    if (!selectedItem) return null
    return (
      <div className="space-y-4" dir="rtl">
        {/* Header */}
        <div className="flex gap-4">
          <div className="w-24 h-36 rounded-lg overflow-hidden bg-[#2a2a2a] shrink-0">
            {selectedItem.poster ? (
              <img src={selectedItem.poster} alt={selectedItem.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[#555]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white">{selectedItem.title}</h2>
            {selectedItem.originalTitle && selectedItem.originalTitle !== selectedItem.title && (
              <p className="text-sm text-[#888] mt-0.5" dir="ltr">{selectedItem.originalTitle}</p>
            )}
            {selectedItem.author && (
              <p className="text-sm text-emerald-400 mt-1">{selectedItem.author}</p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {selectedItem.year && <span className="text-xs text-[#999]">{selectedItem.year}</span>}
              {selectedItem.pages != null && <span className="text-xs text-[#999]">{selectedItem.pages} صفحة</span>}
              {selectedItem.rating && <span className="text-xs text-[#999]">⭐ {selectedItem.rating}</span>}
            </div>
            {/* My Rating */}
            {selectedItem.userRating != null && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-bold border ${getRatingBg(selectedItem.userRating, 10, 'emerald')}`}>
                  تقييمي: {selectedItem.userRating}/10
                </span>
              </div>
            )}
            {/* Genres */}
            {(Array.isArray(selectedItem.genres) ? selectedItem.genres : typeof selectedItem.genres === 'string' ? selectedItem.genres.split(',').map(g => g.trim()).filter(Boolean) : []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(Array.isArray(selectedItem.genres) ? selectedItem.genres : typeof selectedItem.genres === 'string' ? selectedItem.genres.split(',').map(g => g.trim()).filter(Boolean) : []).map((g: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    {g}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview */}
        {selectedItem.overview && (
          <div>
            <h3 className="text-sm font-bold text-[#ccc] mb-1">الوصف</h3>
            <p className="text-sm text-[#999] leading-relaxed">{selectedItem.overview}</p>
          </div>
        )}

        {/* Tags */}
        {selectedItem.tags && (Array.isArray(selectedItem.tags) ? selectedItem.tags : typeof selectedItem.tags === 'string' ? selectedItem.tags.split(',').map(t => t.trim()).filter(Boolean) : []).length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#ccc] mb-1">الوسوم</h3>
            <div className="flex flex-wrap gap-1">
              {(Array.isArray(selectedItem.tags) ? selectedItem.tags : typeof selectedItem.tags === 'string' ? selectedItem.tags.split(',').map(t => t.trim()).filter(Boolean) : []).map((t: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] border-[#444] text-[#aaa]">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {selectedItem.notes && (
          <div>
            <h3 className="text-sm font-bold text-[#ccc] mb-1">ملاحظات</h3>
            <p className="text-sm text-[#999] leading-relaxed whitespace-pre-wrap">{selectedItem.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#2a2a2a]">
          <Button
            onClick={() => { openQuickRate(selectedItem) }}
            variant="outline"
            className="border-[#333] text-[#999] hover:text-white min-h-[44px]"
          >
            <Star className="w-4 h-4" />
            <span className="mr-1">تقييم</span>
          </Button>
          <Button
            onClick={() => { setShowDetails(false); openEditForm(selectedItem) }}
            variant="outline"
            className="border-[#333] text-[#999] hover:text-white min-h-[44px]"
          >
            <Edit3 className="w-4 h-4" />
            <span className="mr-1">تعديل</span>
          </Button>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            className="border-[#333] text-red-400 hover:text-red-300 hover:border-red-400/30 min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" />
            <span className="mr-1">حذف</span>
          </Button>
        </div>
      </div>
    )
  }

  // ==================== Stats Panel ====================
  const renderStats = () => (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.total}</div>
          <div className="text-xs text-[#888] mt-1">إجمالي الكتب</div>
        </div>
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.avgRating.toFixed(1)}</div>
          <div className="text-xs text-[#888] mt-1">متوسط التقييم</div>
        </div>
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.totalPages.toLocaleString()}</div>
          <div className="text-xs text-[#888] mt-1">إجمالي الصفحات</div>
        </div>
      </div>
      {stats.topRated && (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
          <div className="text-xs text-[#888] mb-2">الأعلى تقييماً</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-14 rounded-lg overflow-hidden bg-[#2a2a2a] shrink-0">
              {stats.topRated.poster ? (
                <img src={stats.topRated.poster} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#555]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{stats.topRated.title}</div>
              <div className="text-xs text-emerald-400">{stats.topRated.userRating}/10</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ==================== Auth Loading ====================
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center" dir="rtl">
        <div className="flex items-center gap-3 text-[#666]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">جاري التحقق...</span>
        </div>
      </div>
    )
  }

  // ==================== Main Render ====================
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-[#999] hover:text-white hover:bg-[#1a1a1a] shrink-0 min-w-[44px] min-h-[44px]"
              onClick={() => window.location.href = '/'}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                أريد قرائته
              </h1>
              <p className="text-xs text-[#666]">{totalBooks} كتاب</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#999] hover:text-white hover:bg-[#1a1a1a] min-w-[44px] min-h-[44px]"
                onClick={() => setShowStats(true)}
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-[#999] hover:text-white hover:bg-[#1a1a1a] min-w-[44px] min-h-[44px]">
                    <Settings className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-[#1a1a1a] border-[#2a2a2a] w-48" dir="rtl">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#ccc] hover:text-white hover:bg-[#222]"
                      onClick={exportData}
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تصدير البيانات
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#ccc] hover:text-white hover:bg-[#222]"
                      onClick={() => importInputRef.current?.click()}
                    >
                      <UploadIcon className="w-4 h-4 ml-2" />
                      استيراد البيانات
                    </Button>
                    <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={importData} />
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                onClick={openAddForm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[44px] min-h-[44px]"
                size="icon"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search & Controls */}
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن كتاب..."
                className="bg-[#111] border-[#333] text-white placeholder:text-[#555] pr-9"
              />
            </div>
            {/* Unified Sort & Filter Button */}
            {isMobile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortFilter(true)}
                className={`border-[#333] h-11 min-h-[44px] px-3 text-xs gap-1.5 shrink-0 ${
                  (filterGenre || filterYear)
                    ? 'border-emerald-500/50 text-emerald-400'
                    : 'text-[#999]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{RT_SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'ترتيب'}</span>
                {(filterGenre || filterYear) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                )}
              </Button>
            ) : (
              <Popover open={showSortFilter} onOpenChange={setShowSortFilter}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-[#333] h-11 min-h-[44px] px-3 text-xs gap-1.5 shrink-0 ${
                      (filterGenre || filterYear)
                        ? 'border-emerald-500/50 text-emerald-400'
                        : 'text-[#999]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{RT_SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'ترتيب'}</span>
                    {(filterGenre || filterYear) && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-[#1a1a1a] border-[#2a2a2a] p-0" align="start" dir="rtl">
                  {sortFilterContent}
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Active filter badges */}
          {(filterYear || filterGenre) && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              {filterYear && (
                <Badge
                  className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs cursor-pointer hover:bg-emerald-500/25 gap-1"
                  onClick={() => setFilterYear('')}
                >
                  {filterYear}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {filterGenre && (
                <Badge
                  className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs cursor-pointer hover:bg-emerald-500/25 gap-1"
                  onClick={() => setFilterGenre('')}
                >
                  {filterGenre}
                  <X className="w-3 h-3" />
                </Badge>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sort & Filter Drawer */}
      {isMobile && (
        <Drawer open={showSortFilter} onOpenChange={setShowSortFilter}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[92dvh] flex flex-col">
            <DrawerHeader className="text-right pb-2 shrink-0">
              <DrawerTitle className="text-white text-right text-sm">ترتيب وتصفية</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
              {sortFilterContent}
            </div>
            <DrawerFooter className="border-t border-[#2a2a2a] pt-2 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              <Button
                onClick={() => setShowSortFilter(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-h-[44px]"
              >
                تطبيق
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <SkeletonGrid count={12} variant="pulse" />
        ) : processedItems.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-[#333] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#555] mb-2">
              {debouncedSearch || filterGenre || filterYear ? 'لا توجد نتائج' : 'لا توجد كتب'}
            </h3>
            <p className="text-sm text-[#444] mb-6">
              {debouncedSearch || filterGenre || filterYear
                ? 'جرّب تعديل معايير البحث أو الفلترة'
                : 'ابدأ بإضافة الكتب التي تريد قراءتها'}
            </p>
            {!debouncedSearch && !filterGenre && !filterYear && (
              <Button
                onClick={openAddForm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة كتاب
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
            {processedItems.map(item => (
              <BookCard
                key={item.id}
                item={item}
                onClick={() => openDetails(item)}
                onDelete={() => { setSelectedItem(item); setShowDeleteConfirm(true) }}
                onQuickRate={() => openQuickRate(item)}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {processedItems.map(item => (
              <BookCard
                key={item.id}
                item={item}
                onClick={() => openDetails(item)}
                onDelete={() => { setSelectedItem(item); setShowDeleteConfirm(true) }}
                onQuickRate={() => openQuickRate(item)}
                viewMode="list"
              />
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          </div>
        )}

        {/* Results count */}
        {!loading && !loadingMore && processedItems.length > 0 && (
          <div className="text-center text-xs text-[#555] mt-4">
            {totalBooks} كتاب
          </div>
        )}
      </main>

      {/* ==================== Modals ==================== */}

      {/* Details - Drawer (mobile) / Dialog (desktop) */}
      {isMobile ? (
        <Drawer open={showDetails} onOpenChange={setShowDetails}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[92dvh] flex flex-col">
            <DrawerHeader className="border-b border-[#2a2a2a] shrink-0">
              <DrawerTitle className="text-white text-right">تفاصيل الكتاب</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {renderDetails()}
            </div>
            <div className="shrink-0 h-[env(safe-area-inset-bottom,0px)]" />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-right">تفاصيل الكتاب</DialogTitle>
            </DialogHeader>
            {renderDetails()}
          </DialogContent>
        </Dialog>
      )}

      {/* Add Form - Drawer (mobile) / Dialog (desktop) */}
      {isMobile ? (
        <Drawer open={showAddForm} onOpenChange={setShowAddForm}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[92dvh] flex flex-col">
            <DrawerHeader className="border-b border-[#2a2a2a] shrink-0">
              <DrawerTitle className="text-white text-right">إضافة كتاب جديد</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {renderForm(false)}
            </div>
            <DrawerFooter className="border-t border-[#2a2a2a] shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              <Button
                onClick={createItem}
                disabled={formSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full min-h-[44px]"
              >
                {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                إضافة الكتاب
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowAddForm(false); resetForm() }}
                className="border-[#333] text-[#999] hover:text-white w-full min-h-[44px]"
              >
                إلغاء
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-white text-right">إضافة كتاب جديد</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {renderForm(false)}
            </div>
            <div className="shrink-0 flex gap-2 mt-4 pt-4 border-t border-[#2a2a2a]">
              <Button
                onClick={createItem}
                disabled={formSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 min-h-[44px]"
              >
                {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                إضافة الكتاب
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowAddForm(false); resetForm() }}
                className="border-[#333] text-[#999] hover:text-white min-h-[44px]"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Form - Drawer (mobile) / Dialog (desktop) */}
      {isMobile ? (
        <Drawer open={showEditForm} onOpenChange={setShowEditForm}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[92dvh] flex flex-col">
            <DrawerHeader className="border-b border-[#2a2a2a] shrink-0">
              <DrawerTitle className="text-white text-right">تعديل الكتاب</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {renderForm(true)}
            </div>
            <DrawerFooter className="border-t border-[#2a2a2a] shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              <Button
                onClick={updateItem}
                disabled={formSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full min-h-[44px]"
              >
                {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Check className="w-4 h-4 ml-2" />}
                حفظ التعديلات
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowEditForm(false); setSelectedItem(null) }}
                className="border-[#333] text-[#999] hover:text-white w-full min-h-[44px]"
              >
                إلغاء
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-white text-right">تعديل الكتاب</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {renderForm(true)}
            </div>
            <div className="shrink-0 flex gap-2 mt-4 pt-4 border-t border-[#2a2a2a]">
              <Button
                onClick={updateItem}
                disabled={formSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 min-h-[44px]"
              >
                {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Check className="w-4 h-4 ml-2" />}
                حفظ التعديلات
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowEditForm(false); setSelectedItem(null) }}
                className="border-[#333] text-[#999] hover:text-white min-h-[44px]"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Rate - Drawer (mobile) / Dialog (desktop) */}
      {isMobile ? (
        <Drawer open={showQuickRate} onOpenChange={setShowQuickRate}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <DrawerHeader className="border-b border-[#2a2a2a]">
              <DrawerTitle className="text-white text-right">
                تقييم: {selectedItem?.title}
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-6 flex flex-col items-center gap-4">
              <RatingStars
                rating={selectedItem?.userRating ?? null}
                onChange={(r) => handleQuickRate(r)}
                size="lg"
                colorTheme="emerald"
              />
              <p className="text-sm text-[#888]">اضغط على النجوم للتقييم من 10</p>
            </div>
            <DrawerFooter className="pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              <Button
                variant="outline"
                onClick={() => setShowQuickRate(false)}
                className="border-[#333] text-[#999] hover:text-white w-full min-h-[44px]"
              >
                إلغاء
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showQuickRate} onOpenChange={setShowQuickRate}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white text-right">
                تقييم: {selectedItem?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <RatingStars
                rating={selectedItem?.userRating ?? null}
                onChange={(r) => handleQuickRate(r)}
                size="lg"
                colorTheme="emerald"
              />
              <p className="text-sm text-[#888]">اضغط على النجوم للتقييم من 10</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stats - Drawer (mobile) / Dialog (desktop) */}
      {isMobile ? (
        <Drawer open={showStats} onOpenChange={setShowStats}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <DrawerHeader className="border-b border-[#2a2a2a]">
              <DrawerTitle className="text-white text-right flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                إحصائيات الكتب
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto p-4">
              {renderStats()}
            </div>
            <DrawerFooter className="pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              <Button
                variant="outline"
                onClick={() => setShowStats(false)}
                className="border-[#333] text-[#999] hover:text-white w-full min-h-[44px]"
              >
                إغلاق
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showStats} onOpenChange={setShowStats}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-right flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                إحصائيات الكتب
              </DialogTitle>
            </DialogHeader>
            {renderStats()}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm - Drawer (mobile) / Dialog (desktop) */}
      {isMobile ? (
        <Drawer open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <DrawerHeader className="border-b border-[#2a2a2a]">
              <DrawerTitle className="text-white text-right text-red-400">تأكيد الحذف</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 text-center">
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-[#ccc] mb-1">هل أنت متأكد من حذف هذا الكتاب؟</p>
              <p className="text-sm text-[#888]">"{selectedItem?.title}"</p>
            </div>
            <DrawerFooter className="pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              <Button
                onClick={deleteItem}
                className="bg-red-600 hover:bg-red-700 text-white w-full min-h-[44px]"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-[#333] text-[#999] hover:text-white w-full min-h-[44px]"
              >
                إلغاء
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white text-right text-red-400">تأكيد الحذف</DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-[#ccc] mb-1">هل أنت متأكد من حذف هذا الكتاب؟</p>
              <p className="text-sm text-[#888]">"{selectedItem?.title}"</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={deleteItem}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-[#333] text-[#999] hover:text-white"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
