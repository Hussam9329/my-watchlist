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
  Plus, Star, X, Search, Loader2, Edit3, Grid3X3, List,
  Download, Upload as UploadIcon, BarChart3,
  Trash2, ArrowRight, Gamepad2, Monitor, Smartphone, SlidersHorizontal
} from 'lucide-react'
import { MediaItem, MetadataResult } from '@/lib/types'
import { normalizeGenres, normalizeTags } from '@/lib/format'
import { compressImage } from '@/lib/image'
import { getRatingColor } from '@/lib/rating'
import { RT_SORT_OPTIONS, PLATFORM_OPTIONS } from '@/lib/constants'
import { buildItemBody, itemToFormData, exportDataToFile, importDataFromFile } from '@/lib/crud'
import { sortMediaItems, itemMatchesTab, getPlatformBadge } from '@/lib/sort'
import { SkeletonGrid } from '@/components/shared/SkeletonGrid'
import { RatingStars } from '@/components/shared/RatingStars'

// ==================== Tab Config ====================
const TAB_CONFIG: Record<string, { icon: typeof Gamepad2; label: string; plural: string; color: string; platform: string }> = {
  all: { icon: Gamepad2, label: 'الكل', plural: 'جميع الألعاب', color: 'from-teal-500 to-cyan-500', platform: '' },
  pc: { icon: Monitor, label: 'PC', plural: 'ألعاب PC', color: 'from-blue-500 to-indigo-500', platform: 'PC' },
  console: { icon: Gamepad2, label: 'كونسول', plural: 'ألعاب كونسول', color: 'from-purple-500 to-violet-500', platform: 'Console' },
  mobile: { icon: Smartphone, label: 'موبايل', plural: 'ألعاب موبايل', color: 'from-orange-500 to-red-500', platform: 'Mobile' },
}

// ==================== Memoized Card ====================
interface GameCardProps {
  item: MediaItem
  onClick: () => void
  onDelete: () => void
  onQuickRate: () => void
  viewMode: 'grid' | 'list'
}

const GameCard = React.memo(function GameCard({ item, onClick, onDelete, onQuickRate, viewMode }: GameCardProps) {
  const platformBadge = getPlatformBadge(item)
  const genres = normalizeGenres(item.genres)

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
              <Gamepad2 className="w-5 h-5 text-[#555]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.author && <span className="text-xs text-[#888] truncate max-w-[120px]">{item.author}</span>}
            <span className="text-xs text-[#666]">{item.year}</span>
            {item.userRating != null && (
              <span className={`text-xs font-bold ${getRatingColor(item.userRating, 10, 'teal')}`}>
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
      <div className="aspect-[3/4] relative bg-[#2a2a2a]">
        {item.poster ? (
          <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2 className="w-10 h-10 text-[#444]" />
          </div>
        )}

        {/* Platform badge */}
        {platformBadge && (
          <div className="absolute top-2 left-2">
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-l ${platformBadge.color} text-white`}>
              {platformBadge.label}
            </div>
          </div>
        )}
        {/* Game type badge */}
        <div className="absolute bottom-2 left-2">
          <div className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-l from-teal-500 to-cyan-600 text-white">
            لعبة
          </div>
        </div>
        {/* Rating overlay */}
        {item.userRating != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-8">
            <div className={`text-lg font-bold ${getRatingColor(item.userRating, 10, 'teal')}`}>
              {item.userRating}/10
            </div>
          </div>
        )}
        {item.userRating == null && item.rating && (
          <div className="absolute bottom-0 right-0 p-2">
            <div className="text-sm font-bold text-teal-400 bg-black/60 rounded-md px-1.5 py-0.5 backdrop-blur-sm">⭐ {item.rating}</div>
          </div>
        )}
        {/* Quick actions on hover (desktop) */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={onQuickRate}
            className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
            title="تقييم"
          >
            <Star className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:scale-110 transition-transform"
            title="حذف"
          >
            <Trash2 className="w-5 h-5" />
          </button>

        </div>
      </div>
      {/* Info */}
      <div className="p-2.5">
        <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.author && <span className="text-[10px] text-[#999] truncate max-w-[100px]">{item.author}</span>}
          <span className="text-xs text-[#666]">{item.year}</span>
          {genres.length > 0 && <span className="text-[10px] text-teal-400/70 truncate max-w-[80px]">{genres[0]}</span>}
        </div>
      </div>
    </div>
  )
})

// ==================== Main Component ====================
export default function GamesPage() {
  const isMobile = useIsMobile()

  // Auth
  const isAuthChecked = useAuth()

  // Data
  const [games, setGames] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalGames, setTotalGames] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  // UI
  const [activeTab, setActiveTab] = useState('all')
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
    title: '', originalTitle: '', year: '', type: 'game', poster: '', rating: '',
    overview: '', genres: '', author: '', tags: '', notes: '',
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

  // ==================== Fetch Games (Progressive Auto-Load) ====================
  const fetchGames = useCallback(async (pageNum: number = 1, reset = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    try {
      const params = new URLSearchParams()
      params.set('type', 'game')
      params.set('limit', '50')
      params.set('page', String(pageNum))
      params.set('sortBy', sortBy)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      if (reset || pageNum === 1) {
        setGames(data.items || [])
      } else {
        setGames(prev => {
          const existingIds = new Set(prev.map(i => i.id))
          const newItems = (data.items || []).filter((i: MediaItem) => !existingIds.has(i.id))
          return [...prev, ...newItems]
        })
      }
      setTotalGames(data.total || 0)
      setHasMore(data.hasMore || false)
      setPage(pageNum)
      // Auto-load next page if there are more items
      if (data.hasMore) {
        setTimeout(() => fetchGames(pageNum + 1), 100)
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
    fetchGames(1, true)
  }, [isAuthChecked, fetchGames])

  // ==================== CRUD ====================
  const createItem = async () => {
    if (!formData.title.trim()) {
      toast.error('ابحث عن اللعبة أولاً باستخدام البحث التلقائي')
      return
    }
    setFormSubmitting(true)
    try {
      const body = buildItemBody(formData, 'game')
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json()
        if (errData.duplicate) {
          toast.error('هذه اللعبة موجودة مسبقاً!')
          return
        }
        throw new Error(errData.error)
      }
      toast.success('تمت إضافة اللعبة بنجاح')
      setShowAddForm(false)
      resetForm()
      fetchGames()
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
      const body = buildItemBody(formData, 'game')
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
      fetchGames(1, true)
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
      toast.success('تم حذف اللعبة')
      setShowDeleteConfirm(false)
      setShowDetails(false)
      setSelectedItem(null)
      fetchGames(1, true)
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
        body: JSON.stringify({ query: metaQuery, type: 'game' }),
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
      genres: result.genres && result.genres.length > 0 ? result.genres.join(', ') : prev.genres,
      author: result.platform || prev.author,
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
      title: '', originalTitle: '', year: '', type: 'game', poster: '', rating: '',
      overview: '', genres: '', author: '', tags: '', notes: '',
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
    return sortMediaItems(games, sortBy).filter(item => {
      if (!itemMatchesTab(item, activeTab, TAB_CONFIG)) return false
      if (filterGenre && !normalizeGenres(item.genres).some(g => g.toLowerCase().includes(filterGenre.toLowerCase()))) return false
      if (filterYear && item.year !== filterYear) return false
      return true
    })
  }, [games, sortBy, filterGenre, filterYear, activeTab])

  // ==================== Unique genres/years for filters ====================
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>()
    games.forEach(g => normalizeGenres(g.genres).forEach(genre => { if (genre.trim()) genreSet.add(genre.trim()) }))
    return Array.from(genreSet).sort()
  }, [games])

  const allYears = useMemo(() => {
    const yearSet = new Set<string>()
    games.forEach(g => { if (g.year) yearSet.add(g.year) })
    // Sort years numerically (not alphabetically) since year is a string
    return Array.from(yearSet).sort((a, b) => (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0))
  }, [games])

  // ==================== Sort & Filter Content (shared between Drawer/Popover) ====================
  const sortFilterContent = (
    <div className="space-y-4 p-4" dir="rtl">
      {/* Sort Section */}
      <div>
        <h4 className="text-xs font-bold text-teal-400 mb-2">ترتيب</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {RT_SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.97] ${
                sortBy === opt.value
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
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
        <h4 className="text-xs font-bold text-teal-400 mb-2">السنة</h4>
        <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
          <button
            onClick={() => setFilterYear('')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              !filterYear
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
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
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
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
        <h4 className="text-xs font-bold text-teal-400 mb-2">التصنيف</h4>
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
        <h4 className="text-xs font-bold text-teal-400 mb-2">طريقة العرض</h4>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
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
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
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

  // ==================== Tab Counts ====================
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: games.length, pc: 0, console: 0, mobile: 0 }
    games.forEach(g => {
      const author = (g.author || '').toLowerCase()
      if (author.includes('pc') || author.includes('windows') || author.includes('mac') || author.includes('linux')) counts.pc++
      if (author.includes('console') || author.includes('playstation') || author.includes('xbox') || author.includes('nintendo') || author.includes('ps') || author.includes('switch')) counts.console++
      if (author.includes('mobile') || author.includes('android') || author.includes('ios')) counts.mobile++
    })
    return counts
  }, [games])

  // ==================== Stats ====================
  const stats = useMemo(() => {
    const total = games.length
    const rated = games.filter(g => g.userRating != null)
    const avgRating = rated.length > 0 ? (rated.reduce((sum, g) => sum + (g.userRating ?? 0), 0) / rated.length) : 0
    const topGenre = allGenres.length > 0 ? allGenres[0] : '-'
    const topRated = rated.length > 0 ? rated.reduce((best, g) => (g.userRating ?? 0) > (best.userRating ?? 0) ? g : best, rated[0]) : null
    // Platform breakdown
    const platformCounts: Record<string, number> = {}
    games.forEach(g => {
      const p = g.author || 'غير محدد'
      platformCounts[p] = (platformCounts[p] || 0) + 1
    })
    return { total, avgRating, topGenre, topRated, platformCounts }
  }, [games, allGenres])

  // ==================== Export/Import ====================
  const exportData = async () => {
    try {
      await exportDataToFile('game', 'hussamvision-games')
      toast.success('تم تصدير البيانات')
    } catch {
      toast.error('خطأ في التصدير')
    }
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { imported, duplicates } = await importDataFromFile(file, 'game')
      toast.success(`تم استيراد ${imported} لعبة (${duplicates} مكرر)`)
      fetchGames(1, true)
      setPage(1)
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
      setGames(prev => prev.map(i => i.id === selectedItem.id ? { ...i, userRating: rating, watched: true } : i))
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
        <label className="text-sm font-bold text-teal-400">البحث عن لعبة (Steam)</label>
        <div className="flex gap-2">
          <Input
            value={metaQuery}
            onChange={e => setMetaQuery(e.target.value)}
            placeholder="ابحث عن لعبة..."
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
            onKeyDown={e => e.key === 'Enter' && searchMetadata()}
          />
          <Button
            onClick={searchMetadata}
            disabled={metaLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
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
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-[#111] border border-[#333] hover:border-teal-500/50 transition-colors active:scale-[0.97] text-right"
              >
                {result.poster ? (
                  <img src={result.poster} alt="" className="w-10 h-14 rounded object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-14 rounded bg-[#2a2a2a] flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-4 h-4 text-[#555]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{result.title}</div>
                  <div className="text-xs text-[#888]">
                    {result.platform && <span>{result.platform}</span>}
                    {result.year && <span> • {result.year}</span>}
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
                onClick={() => setFormData(prev => ({ ...prev, title: '', year: '', poster: '', originalTitle: '', overview: '', rating: '' }))}
                className="text-[#666] hover:text-red-400 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center px-3 h-10 rounded-lg bg-[#111]/50 border border-dashed border-[#444] text-[#555] text-sm">
              <Search className="w-3.5 h-3.5 ml-2" />
              ابحث أعلاه لتحديد اللعبة تلقائياً
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

        {/* Year & Platform */}
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
            <label className="text-xs text-[#999]">المنصة</label>
            <Select value={formData.author} onValueChange={val => setFormData(prev => ({ ...prev, author: val }))}>
              <SelectTrigger className="bg-[#111] border-[#333] text-white">
                <SelectValue placeholder="اختر المنصة" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                {PLATFORM_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white focus:bg-[#2a2a2a] focus:text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom platform if not in list */}
        {formData.author && !PLATFORM_OPTIONS.some(o => o.value === formData.author) && (
          <div className="space-y-1">
            <label className="text-xs text-[#999]">المنصة (مخصص)</label>
            <Input
              value={formData.author}
              onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="مثال: PC, PlayStation 5"
              className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
            />
          </div>
        )}

        {/* Poster - preview + upload only, no URL field */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">صورة الغلاف</label>
          <div className="flex items-center gap-3">
            {formData.poster ? (
              <div className="relative group shrink-0">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#2a2a2a] border border-[#333] shadow-lg">
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
            placeholder="8.5"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
          />
        </div>

        {/* Genres */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">التصنيفات (مفصولة بفواصل)</label>
          <Input
            value={formData.genres}
            onChange={e => setFormData(prev => ({ ...prev, genres: e.target.value }))}
            placeholder="أكشن، RPG، مغامرة"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
          />
        </div>

        {/* Overview */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">الوصف</label>
          <Textarea
            value={formData.overview}
            onChange={e => setFormData(prev => ({ ...prev, overview: e.target.value }))}
            placeholder="وصف مختصر للعبة..."
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555] min-h-[80px]"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">الوسوم (مفصولة بفواصل)</label>
          <Input
            value={formData.tags}
            onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="متعددة اللاعبين، قصة"
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

      {/* Submit */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={isEdit ? updateItem : createItem}
          disabled={formSubmitting}
          className="flex-1 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold"
        >
          {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
          {isEdit ? 'تحديث اللعبة' : 'إضافة اللعبة'}
        </Button>
        <Button
          variant="outline"
          onClick={() => { setShowAddForm(false); setShowEditForm(false) }}
          className="border-[#333] text-[#999] hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  // ==================== Details View ====================
  const renderDetails = () => {
    if (!selectedItem) return null
    const genres = normalizeGenres(selectedItem.genres)
    const tags = normalizeTags(selectedItem.tags)
    const platformBadge = getPlatformBadge(selectedItem)

    const content = (
      <div className="space-y-4" dir="rtl">
        {/* Header with poster */}
        <div className="flex gap-4">
          <div className="w-24 h-32 rounded-xl overflow-hidden bg-[#2a2a2a] shrink-0">
            {selectedItem.poster ? (
              <img src={selectedItem.poster} alt={selectedItem.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-[#555]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white">{selectedItem.title}</h2>
            {selectedItem.originalTitle && selectedItem.originalTitle !== selectedItem.title && (
              <p className="text-sm text-[#888] mt-0.5" dir="ltr">{selectedItem.originalTitle}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {selectedItem.year && <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs">{selectedItem.year}</Badge>}
              {platformBadge && <Badge className={`bg-gradient-to-l ${platformBadge.color} text-white text-xs border-0`}>{platformBadge.label}</Badge>}
            </div>
            {selectedItem.rating && (
              <div className="mt-2 text-sm text-[#aaa]">التقييم العام: <span className="text-teal-400 font-bold">{selectedItem.rating}</span></div>
            )}
            {selectedItem.userRating != null && (
              <div className="mt-1">
                <span className="text-sm text-[#aaa]">تقييمي: </span>
                <span className={`text-sm font-bold ${getRatingColor(selectedItem.userRating, 10, 'teal')}`}>{selectedItem.userRating}/10</span>
              </div>
            )}
          </div>
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre, i) => (
              <Badge key={i} variant="outline" className="border-[#333] text-[#aaa] text-xs">{genre}</Badge>
            ))}
          </div>
        )}

        {/* Overview */}
        {selectedItem.overview && (
          <div>
            <h3 className="text-sm font-bold text-[#ccc] mb-1">الوصف</h3>
            <p className="text-sm text-[#999] leading-relaxed">{selectedItem.overview}</p>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-[#ccc] mb-1">الوسوم</h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="border-teal-500/30 text-teal-400/80 text-xs">{tag}</Badge>
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

        {/* Dates */}
        <div className="text-xs text-[#555] space-y-1">
          {selectedItem.addedAt && <p>أضيف: {new Date(selectedItem.addedAt).toLocaleDateString('ar-SA')}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap pt-2">
          <Button
            onClick={() => { setShowDetails(false); openEditForm(selectedItem) }}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm"
          >
            <Edit3 className="w-4 h-4 ml-1" />
            تعديل
          </Button>

          <Button
            variant="outline"
            onClick={() => { openQuickRate(selectedItem); setShowDetails(false) }}
            className="border-[#333] text-[#999] text-sm"
          >
            <Star className="w-4 h-4 ml-1" />
            تقييم
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm"
          >
            <Trash2 className="w-4 h-4 ml-1" />
            حذف
          </Button>
        </div>
      </div>
    )

    if (isMobile) {
      return (
        <Drawer open={showDetails} onOpenChange={setShowDetails}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[85vh]">
            <DrawerHeader className="text-right">
              <DrawerTitle className="text-white text-right">تفاصيل اللعبة</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto">
              {content}
            </div>
            <DrawerFooter className="border-t border-[#2a2a2a]">
              <Button variant="outline" onClick={() => setShowDetails(false)} className="border-[#333] text-[#999]">إغلاق</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )
    }

    return (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-right">تفاصيل اللعبة</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  // ==================== Stats Panel ====================
  const renderStats = () => {
    const content = (
      <div className="space-y-4" dir="rtl">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-teal-400">{stats.total}</div>
          <div className="text-xs text-[#888]">إجمالي الألعاب</div>
        </div>

        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3">
          <div className="text-sm text-[#888] mb-1">متوسط التقييم</div>
          <div className="text-xl font-bold text-teal-400">{stats.avgRating.toFixed(1)}/10</div>
        </div>

        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3">
          <div className="text-sm text-[#888] mb-2">توزيع المنصات</div>
          <div className="space-y-2">
            {Object.entries(stats.platformCounts).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="text-sm text-[#ccc]">{platform}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-teal-500 to-cyan-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#888] w-6 text-left">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {stats.topRated && (
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3">
            <div className="text-sm text-[#888] mb-1">أعلى تقييم</div>
            <div className="flex items-center gap-2">
              {stats.topRated.poster && <img src={stats.topRated.poster} alt="" className="w-8 h-10 rounded object-cover" />}
              <div>
                <div className="text-sm font-bold text-white">{stats.topRated.title}</div>
                <div className={`text-sm font-bold ${getRatingColor(stats.topRated.userRating ?? 0, 10, 'teal')}`}>{stats.topRated.userRating}/10</div>
              </div>
            </div>
          </div>
        )}

        {allGenres.length > 0 && (
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3">
            <div className="text-sm text-[#888] mb-2">التصنيفات</div>
            <div className="flex flex-wrap gap-1.5">
              {allGenres.slice(0, 10).map((genre, i) => (
                <Badge key={i} variant="outline" className="border-teal-500/30 text-teal-400/80 text-xs">{genre}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )

    if (isMobile) {
      return (
        <Drawer open={showStats} onOpenChange={setShowStats}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[85vh]">
            <DrawerHeader className="text-right">
              <DrawerTitle className="text-white text-right flex items-center gap-2 justify-end">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                إحصائيات الألعاب
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto">
              {content}
            </div>
            <DrawerFooter className="border-t border-[#2a2a2a]">
              <Button variant="outline" onClick={() => setShowStats(false)} className="border-[#333] text-[#999]">إغلاق</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )
    }

    return (
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-right flex items-center gap-2 justify-end">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              إحصائيات الألعاب
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  // ==================== Auth Loading ====================
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    )
  }

  // ==================== Main Render ====================
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Back + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="text-[#999] hover:text-white shrink-0 active:scale-[0.97] transition-transform"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">
                  🎮 أريد لعبها
                </h1>
                <p className="text-xs text-[#666]">{TAB_CONFIG[activeTab]?.plural} • {totalGames} لعبة</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(true)}
                className="text-[#999] hover:text-teal-400 active:scale-[0.97] transition-transform"
                title="إحصائيات"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportData}
                className="text-[#999] hover:text-teal-400 active:scale-[0.97] transition-transform"
                title="تصدير"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => importInputRef.current?.click()}
                className="text-[#999] hover:text-teal-400 active:scale-[0.97] transition-transform"
                title="استيراد"
              >
                <UploadIcon className="w-4 h-4" />
              </Button>
              <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={importData} />
              <Button
                onClick={openAddForm}
                size="sm"
                className="bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white active:scale-[0.97] transition-transform"
              >
                <Plus className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline">إضافة</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {Object.entries(TAB_CONFIG).map(([key, config]) => {
              const Icon = config.icon
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all active:scale-[0.97] ${
                    isActive
                      ? `bg-gradient-to-l ${config.color} text-white shadow-lg`
                      : 'bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#222]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{config.label}</span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-[#555]'}`}>{tabCounts[key] || 0}</span>
                </button>
              )
            })}
          </div>

          {/* Search + Sort + Filter */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن لعبة..."
                className="bg-[#111] border-[#2a2a2a] text-white placeholder:text-[#555] pr-9"
              />
            </div>
            {/* Unified Sort & Filter Button */}
            {isMobile ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortFilter(true)}
                className={`border-[#2a2a2a] h-9 px-3 text-xs gap-1.5 shrink-0 ${
                  (filterGenre || filterYear)
                    ? 'border-teal-500/50 text-teal-400'
                    : 'text-[#999]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{RT_SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'ترتيب'}</span>
                {(filterGenre || filterYear) && (
                  <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                )}
              </Button>
            ) : (
              <Popover open={showSortFilter} onOpenChange={setShowSortFilter}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-[#2a2a2a] h-9 px-3 text-xs gap-1.5 shrink-0 ${
                      (filterGenre || filterYear)
                        ? 'border-teal-500/50 text-teal-400'
                        : 'text-[#999]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{RT_SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'ترتيب'}</span>
                    {(filterGenre || filterYear) && (
                      <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-[#1a1a1a] border-[#2a2a2a] p-0" align="end" dir="rtl">
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
                  className="bg-teal-500/15 text-teal-400 border-teal-500/30 text-xs cursor-pointer hover:bg-teal-500/25 gap-1"
                  onClick={() => setFilterYear('')}
                >
                  {filterYear}
                  <X className="w-3 h-3" />
                </Badge>
              )}
              {filterGenre && (
                <Badge
                  className="bg-teal-500/15 text-teal-400 border-teal-500/30 text-xs cursor-pointer hover:bg-teal-500/25 gap-1"
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
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[85vh]">
            <DrawerHeader className="text-right pb-2">
              <DrawerTitle className="text-white text-right text-sm">ترتيب وتصفية</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto">
              {sortFilterContent}
            </div>
            <DrawerFooter className="border-t border-[#2a2a2a] pt-2">
              <Button
                onClick={() => setShowSortFilter(false)}
                className="bg-gradient-to-l from-teal-500 to-cyan-500 text-white font-bold"
              >
                تطبيق
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {loading ? (
          <SkeletonGrid count={8} aspectRatio="3/4" variant="pulse" />
        ) : processedItems.length === 0 ? (
          <div className="text-center py-20">
            <Gamepad2 className="w-16 h-16 text-[#333] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#666]">لا توجد ألعاب</h3>
            <p className="text-sm text-[#555] mt-1">
              {debouncedSearch ? 'لم يتم العثور على نتائج' : 'أضف ألعابك للعبها لاحقاً'}
            </p>
            {!debouncedSearch && (
              <Button
                onClick={openAddForm}
                className="mt-4 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white active:scale-[0.97] transition-transform"
              >
                <Plus className="w-4 h-4 ml-1" />
                إضافة لعبة
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5'
            : 'space-y-2'
          }>
            {processedItems.map(item => (
              <GameCard
                key={item.id}
                item={item}
                onClick={() => openDetails(item)}
                onDelete={() => { setSelectedItem(item); setShowDeleteConfirm(true) }}
                onQuickRate={() => openQuickRate(item)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
          </div>
        )}

        {/* Results count */}
        {!loading && !loadingMore && processedItems.length > 0 && (
          <div className="text-center text-xs text-[#555] mt-4">
            {totalGames} لعبة
          </div>
        )}
      </main>

      {/* Add Form - Drawer/Dialog */}
      {isMobile ? (
        <Drawer open={showAddForm} onOpenChange={setShowAddForm}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[90vh]">
            <DrawerHeader className="text-right">
              <DrawerTitle className="text-white text-right flex items-center gap-2 justify-end">
                <Plus className="w-5 h-5 text-teal-400" />
                إضافة لعبة جديدة
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto">
              {renderForm(false)}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-right flex items-center gap-2 justify-end">
                <Plus className="w-5 h-5 text-teal-400" />
                إضافة لعبة جديدة
              </DialogTitle>
            </DialogHeader>
            {renderForm(false)}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Form - Drawer/Dialog */}
      {isMobile ? (
        <Drawer open={showEditForm} onOpenChange={setShowEditForm}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[90vh]">
            <DrawerHeader className="text-right">
              <DrawerTitle className="text-white text-right flex items-center gap-2 justify-end">
                <Edit3 className="w-5 h-5 text-teal-400" />
                تعديل اللعبة
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto">
              {renderForm(true)}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-right flex items-center gap-2 justify-end">
                <Edit3 className="w-5 h-5 text-teal-400" />
                تعديل اللعبة
              </DialogTitle>
            </DialogHeader>
            {renderForm(true)}
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Rate - Drawer/Dialog */}
      {isMobile ? (
        <Drawer open={showQuickRate} onOpenChange={setShowQuickRate}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <DrawerHeader className="text-right">
              <DrawerTitle className="text-white text-right flex items-center gap-2 justify-end">
                <Star className="w-5 h-5 text-teal-400" />
                تقييم اللعبة
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 py-6 flex flex-col items-center gap-4">
              {selectedItem && (
                <>
                  <h3 className="text-lg font-bold text-white text-center">{selectedItem.title}</h3>
                  <RatingStars rating={selectedItem.userRating ?? null} onChange={handleQuickRate} size="lg" colorTheme="teal" />
                </>
              )}
            </div>
            <DrawerFooter className="border-t border-[#2a2a2a]">
              <Button variant="outline" onClick={() => setShowQuickRate(false)} className="border-[#333] text-[#999]">إلغاء</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showQuickRate} onOpenChange={setShowQuickRate}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white text-right flex items-center gap-2 justify-end">
                <Star className="w-5 h-5 text-teal-400" />
                تقييم اللعبة
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center gap-4">
              {selectedItem && (
                <>
                  <h3 className="text-lg font-bold text-white text-center">{selectedItem.title}</h3>
                  <RatingStars rating={selectedItem.userRating ?? null} onChange={handleQuickRate} size="lg" colorTheme="teal" />
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm - Drawer/Dialog */}
      {isMobile ? (
        <Drawer open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <DrawerHeader className="text-right">
              <DrawerTitle className="text-white text-right">تأكيد الحذف</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 py-4">
              <p className="text-[#ccc] text-center">هل أنت متأكد من حذف &quot;{selectedItem?.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
            <DrawerFooter className="border-t border-[#2a2a2a]">
              <div className="flex gap-2 w-full">
                <Button
                  onClick={deleteItem}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  حذف
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border-[#333] text-[#999]"
                >
                  إلغاء
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white text-right">تأكيد الحذف</DialogTitle>
            </DialogHeader>
            <p className="text-[#ccc] text-center py-4">هل أنت متأكد من حذف &quot;{selectedItem?.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-2">
              <Button
                onClick={deleteItem}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                حذف
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-[#333] text-[#999]"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Details */}
      {renderDetails()}

      {/* Stats */}
      {renderStats()}
    </div>
  )
}
