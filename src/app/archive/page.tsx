'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/hooks/useAuth'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { toast } from 'sonner'
import {
  Plus, Film, Tv, Sparkles, Star, Check, X, Search, Loader2,
  Edit3, Grid3X3, List, Download, Upload as UploadIcon,
  BarChart3, CalendarDays, Bookmark, Trash2,
  Dice5, Trophy, SlidersHorizontal
} from 'lucide-react'
import { MediaItem, MetadataResult, StatsData } from '@/lib/types'
import { compressImage } from '@/lib/image'
import { formatRating, getRatingColor, getRatingBg } from '@/lib/rating'
import { WL_SORT_OPTIONS, RT_SORT_OPTIONS, RATING_STATUSES } from '@/lib/constants'
import { buildItemBody, itemToFormData, exportDataToFile, importDataFromFile } from '@/lib/crud'
import { SkeletonGrid } from '@/components/shared/SkeletonGrid'
import { ResponsiveModal } from '@/components/shared/ResponsiveModal'

// ==================== Constants ====================
const TYPE_CONFIG: Record<string, { icon: typeof Bookmark; label: string; plural: string; color: string; bgColor: string; dotColor: string }> = {
  all: { icon: Bookmark, label: 'الكل', plural: 'جميع الأعمال', color: 'from-[#d4af37] to-[#b8960f]', bgColor: 'bg-[#d4af37]/10', dotColor: 'bg-[#d4af37]' },
  anime: { icon: Sparkles, label: 'أنمي', plural: 'أنميات', color: 'from-[#a855f7] to-[#7c3aed]', bgColor: 'bg-[#a855f7]/10', dotColor: 'bg-[#a855f7]' },
  series: { icon: Tv, label: 'مسلسل', plural: 'مسلسلات', color: 'from-[#3b82f6] to-[#1d4ed8]', bgColor: 'bg-[#3b82f6]/10', dotColor: 'bg-[#3b82f6]' },
  movie: { icon: Film, label: 'فيلم', plural: 'أفلام', color: 'from-[#d4af37] to-[#b8960f]', bgColor: 'bg-[#d4af37]/10', dotColor: 'bg-[#d4af37]' },
  book: { icon: Bookmark, label: 'كتاب', plural: 'كتب', color: 'from-[#8B4513] to-[#654321]', bgColor: 'bg-[#8B4513]/10', dotColor: 'bg-[#8B4513]' },
  game: { icon: Dice5, label: 'لعبة', plural: 'ألعاب', color: 'from-[#2e8b57] to-[#1a6b3a]', bgColor: 'bg-[#2e8b57]/10', dotColor: 'bg-[#2e8b57]' },
}

// ==================== Memoized Card ====================
interface MediaCardProps {
  item: MediaItem
  onClick: () => void
  onQuickRate: () => void
  onDelete: () => void
  viewMode: 'grid' | 'list'
}

const MediaCard = React.memo(function MediaCard({ item, onClick, onQuickRate, onDelete, viewMode }: MediaCardProps) {
  const typeConf = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie
  const TypeIcon = typeConf.icon

  if (viewMode === 'list') {
    return (
      <div
        className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 active:scale-[0.97] transition-transform cursor-pointer"
        onClick={onClick}
      >
        <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#2a2a2a] shrink-0">
          {item.poster ? (
            <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-[#555]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-l ${typeConf.color} text-black`}>
              <TypeIcon className="w-2.5 h-2.5" />
              {typeConf.label}
            </span>
            <span className="text-xs text-[#888]">{item.year}</span>
            {item.userRating != null && (
              <span className={`text-xs font-bold ${getRatingColor(item.userRating, 100, 'green')}`}>
                {formatRating(item.userRating)}
              </span>
            )}
            {item.rating && (
              <span className="text-xs text-[#666]">⭐ {item.rating}</span>
            )}
          </div>
        </div>

      </div>
    )
  }

  // Standard grid view (with poster)
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
            <TypeIcon className="w-10 h-10 text-[#444]" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-l ${typeConf.color} text-black`}>
            {typeConf.label}
          </div>
        </div>
        {/* Rating overlay */}
        {item.userRating != null && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
            <div className={`text-lg font-bold ${getRatingColor(item.userRating, 100, 'green')}`}>
              {formatRating(item.userRating)}
            </div>
          </div>
        )}
        {item.userRating == null && item.rating && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
            <div className="text-sm font-bold text-[#d4af37]">⭐ {item.rating}</div>
          </div>
        )}
        {/* Quick actions on hover (desktop) */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={onQuickRate}
            className="w-10 h-10 rounded-full bg-[#d4af37] text-black flex items-center justify-center hover:scale-110 transition-transform"
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
        <h3 className="font-bold text-sm text-white truncate leading-tight">{item.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#888]">{item.year}</span>
          {item.genres && item.genres.length > 0 && (
            <span className="text-[10px] text-[#666] truncate max-w-[80px]">{item.genres[0]}</span>
          )}
        </div>
      </div>
    </div>
  )
})

// ==================== Main Component ====================
export default function ArchivePage() {
  const isMobile = useIsMobile()

  // Auth
  const isAuthChecked = useAuth()

  // Main tabs
  const [mainTab, setMainTab] = useState<'watchlist' | 'ratings' | 'stats'>('watchlist')

  // Watchlist state — separate data per type to prevent mixing
  const [wlItems, setWlItems] = useState<MediaItem[]>([])
  const [wlLoading, setWlLoading] = useState(true)
  const [wlPage, setWlPage] = useState(1)
  const [wlHasMore, setWlHasMore] = useState(false)
  const [wlTotal, setWlTotal] = useState(0)
  // Separate counts per type (fetched in one pass, split client-side)
  const [wlMovies, setWlMovies] = useState<MediaItem[]>([])
  const [wlSeries, setWlSeries] = useState<MediaItem[]>([])
  const [wlAnime, setWlAnime] = useState<MediaItem[]>([])
  // Watchlist type filter: 'all' | 'movie' | 'series' | 'anime'
  const [wlType, setWlType] = useState<string>('all')
  // Computed filtered items based on selected type
  const wlFilteredItems = wlType === 'all'
    ? wlItems
    : wlType === 'movie'
    ? wlMovies
    : wlType === 'series'
    ? wlSeries
    : wlAnime

  // Ratings state
  const [rtType, setRtType] = useState('movie')
  const [rtItems, setRtItems] = useState<MediaItem[]>([])
  const [rtLoading, setRtLoading] = useState(true)
  const [rtPage, setRtPage] = useState(1)
  const [rtHasMore, setRtHasMore] = useState(false)
  const [rtTotal, setRtTotal] = useState(0)

  // Stats
  const [stats, setStats] = useState<StatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // All years/genres from database
  const [dbYears, setDbYears] = useState<string[]>([])
  const [dbGenres, setDbGenres] = useState<string[]>([])

  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebouncedValue(searchQuery)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // Separate sort & filter state per tab
  const [wlSortBy, setWlSortBy] = useState('addedAt_desc')
  const [rtSortBy, setRtSortBy] = useState('addedAt_desc')
  const [wlShowSortFilter, setWlShowSortFilter] = useState(false)
  const [rtShowSortFilter, setRtShowSortFilter] = useState(false)
  const [wlFilterGenre, setWlFilterGenre] = useState('')
  const [rtFilterGenre, setRtFilterGenre] = useState('')
  const [wlFilterYear, setWlFilterYear] = useState('')
  const [rtFilterYear, setRtFilterYear] = useState('')
  const [wlFilterRatingMin, setWlFilterRatingMin] = useState('')
  const [rtFilterRatingMin, setRtFilterRatingMin] = useState('')
  const [wlFilterRatingMax, setWlFilterRatingMax] = useState('')
  const [rtFilterRatingMax, setRtFilterRatingMax] = useState('')

  // Modals
  const [showDetails, setShowDetails] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showQuickRate, setShowQuickRate] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Record<string, string>>({
    title: '', originalTitle: '', year: '', type: 'movie', poster: '', rating: '',
    overview: '', genres: '', episodes: '', seasons: '', duration: '', status: '',
    author: '', pages: '', tags: '', notes: '',
    userRating: '', rewatch: 'false', runtime: '', ratingStatus: 'watched',
  })
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Metadata search
  const [metaQuery, setMetaQuery] = useState('')
  const [metaResults, setMetaResults] = useState<MetadataResult[]>([])
  const [metaLoading, setMetaLoading] = useState(false)

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false)

  // Movie night
  const [movieNightResult, setMovieNightResult] = useState<MediaItem | null>(null)
  const [showMovieNight, setShowMovieNight] = useState(false)

  // Refs
  const metaSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ==================== Fetch Watchlist ====================
  const fetchWatchlist = useCallback(async (page: number, reset = false) => {
    setWlLoading(true)
    try {
      const params = new URLSearchParams()
      // Fetch ALL types together (no type filter) so we can split them client-side
      params.set('hasRating', 'false')
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('sortBy', wlSortBy)
      if (wlFilterGenre) params.set('genre', wlFilterGenre)
      if (wlFilterYear) params.set('year', wlFilterYear)
      if (wlFilterRatingMin) params.set('ratingMin', wlFilterRatingMin)
      if (wlFilterRatingMax) params.set('ratingMax', wlFilterRatingMax)
      params.set('page', String(page))
      params.set('limit', '200')
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      let allItems: MediaItem[] = []
      if (reset || page === 1) {
        allItems = data.items || []
        setWlItems(allItems)
      } else {
        setWlItems(prev => {
          const existingIds = new Set(prev.map(i => i.id))
          const newItems = (data.items || []).filter((i: MediaItem) => !existingIds.has(i.id))
          allItems = [...prev, ...newItems]
          return allItems
        })
      }
      setWlTotal(data.total || 0)
      setWlHasMore(data.hasMore || false)
      setWlPage(page)
      // Split items by type — this ensures movies/series/anime are always correctly separated
      const splitItems = (items: MediaItem[]) => {
        const movies = items.filter(i => i.type === 'movie')
        const series = items.filter(i => i.type === 'series' || i.type === 'tv')
        const anime = items.filter(i => i.type === 'anime')
        return { movies, series, anime }
      }
      if (reset || page === 1) {
        const { movies, series, anime } = splitItems(data.items || [])
        setWlMovies(movies)
        setWlSeries(series)
        setWlAnime(anime)
      } else {
        setWlMovies(prev => [...prev, ...(data.items || []).filter((i: MediaItem) => i.type === 'movie' && !prev.some(p => p.id === i.id))])
        setWlSeries(prev => [...prev, ...(data.items || []).filter((i: MediaItem) => (i.type === 'series' || i.type === 'tv') && !prev.some(p => p.id === i.id))])
        setWlAnime(prev => [...prev, ...(data.items || []).filter((i: MediaItem) => i.type === 'anime' && !prev.some(p => p.id === i.id))])
      }
      // Auto-load next page if there are more items
      if (data.hasMore) {
        setTimeout(() => fetchWatchlist(page + 1), 100)
      }
    } catch {
      toast.error('خطأ في جلب البيانات')
    } finally {
      setWlLoading(false)
    }
  }, [debouncedSearch, wlSortBy, wlFilterGenre, wlFilterYear, wlFilterRatingMin, wlFilterRatingMax])

  // ==================== Fetch Ratings ====================
  const fetchRatings = useCallback(async (page: number, reset = false) => {
    setRtLoading(true)
    try {
      const params = new URLSearchParams()
      if (rtType !== 'all') params.set('type', rtType)
      params.set('hasRating', 'true')
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('sortBy', rtSortBy)
      if (rtFilterGenre) params.set('genre', rtFilterGenre)
      if (rtFilterYear) params.set('year', rtFilterYear)
      if (rtFilterRatingMin) params.set('ratingMin', rtFilterRatingMin)
      if (rtFilterRatingMax) params.set('ratingMax', rtFilterRatingMax)
      params.set('page', String(page))
      params.set('limit', '50')
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      if (reset || page === 1) {
        setRtItems(data.items || [])
      } else {
        setRtItems(prev => {
          const existingIds = new Set(prev.map(i => i.id))
          const newItems = (data.items || []).filter((i: MediaItem) => !existingIds.has(i.id))
          return [...prev, ...newItems]
        })
      }
      setRtTotal(data.total || 0)
      setRtHasMore(data.hasMore || false)
      setRtPage(page)
      // Auto-load next page if there are more items
      if (data.hasMore) {
        setTimeout(() => fetchRatings(page + 1), 100)
      }
    } catch {
      toast.error('خطأ في جلب البيانات')
    } finally {
      setRtLoading(false)
    }
  }, [rtType, debouncedSearch, rtSortBy, rtFilterGenre, rtFilterYear, rtFilterRatingMin, rtFilterRatingMax])

  // ==================== Fetch Stats ====================
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/ratings-stats')
      const data = await res.json()
      setStats(data)
    } catch {
      toast.error('خطأ في جلب الإحصائيات')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // ==================== Effects ====================
  useEffect(() => {
    if (!isAuthChecked) return
    setWlPage(1)
    fetchWatchlist(1, true)
  }, [isAuthChecked, debouncedSearch, wlSortBy, wlFilterGenre, wlFilterYear, wlFilterRatingMin, wlFilterRatingMax, fetchWatchlist])

  // Fetch all available years & genres from database
  useEffect(() => {
    if (!isAuthChecked) return
    const typeParam = mainTab === 'ratings' ? rtType : ''
    const hasRatingParam = mainTab === 'ratings' ? 'true' : 'false'
    fetch(`/api/years?type=${typeParam}&hasRating=${hasRatingParam}`)
      .then(r => r.json())
      .then(data => { if (data.years) setDbYears(data.years) })
      .catch(() => {})
    fetch(`/api/genres?type=${typeParam}&hasRating=${hasRatingParam}`)
      .then(r => r.json())
      .then(data => { if (data.genres) setDbGenres(data.genres) })
      .catch(() => {})
  }, [isAuthChecked, mainTab, rtType])

  useEffect(() => {
    if (!isAuthChecked || mainTab !== 'ratings') return
    setRtPage(1)
    fetchRatings(1, true)
  }, [isAuthChecked, mainTab, rtType, debouncedSearch, rtSortBy, rtFilterGenre, rtFilterYear, rtFilterRatingMin, rtFilterRatingMax, fetchRatings])

  useEffect(() => {
    if (!isAuthChecked || mainTab !== 'stats') return
    fetchStats()
  }, [isAuthChecked, mainTab, fetchStats])

  // ==================== CRUD Operations ====================
  const createItem = async () => {
    if (!formData.title.trim()) {
      toast.error('ابحث عن العمل أولاً باستخدام البحث التلقائي')
      return
    }
    if (!formData.year.trim()) {
      toast.error('السنة مطلوبة - اختر عملاً يحتوي على سنة من نتائج البحث')
      return
    }
    setFormSubmitting(true)
    try {
      const body = buildItemBody(formData, formData.type || 'movie')
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const resData = await res.json()
      if (!res.ok) {
        if (resData.duplicate && resData.existingItem) {
          // Show the existing item to the user with options to navigate or move it
          const existing = resData.existingItem as MediaItem
          const isInRatings = existing.userRating != null
          const tabLabel = isInRatings ? 'تقييماتي' : 'أريد مشاهدته'

          setShowAddForm(false)
          resetForm()
          setSelectedItem(existing)

          if (isInRatings) {
            // Item is in ratings — offer to move it back to watchlist
            toast.error(`هذا العمل موجود في "${tabLabel}" (تقييم: ${existing.userRating}/100). يمكنك نقله لأريد مشاهدته.`, {
              duration: 8000,
              action: {
                label: 'نقل للأرشيف',
                onClick: async () => {
                  try {
                    const patchRes = await fetch(`/api/watchlist/${existing.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userRating: null, watched: false, watchedAt: null }),
                    })
                    if (!patchRes.ok) throw new Error('فشل النقل')
                    toast.success('تم نقل العمل إلى "أريد مشاهدته"')
                    setMainTab('watchlist')
                    fetchWatchlist(1, true)
                    fetchRatings(1, true)
                  } catch {
                    toast.error('خطأ في نقل العمل')
                  }
                }
              }
            })
          } else {
            // Item is already in watchlist — just navigate to it
            toast.error(`هذا العمل موجود مسبقاً في "${tabLabel}"!`, {
              duration: 6000,
              action: {
                label: 'عرض',
                onClick: () => {
                  setMainTab('watchlist')
                  setShowDetails(true)
                }
              }
            })
          }
          return
        }
        throw new Error(resData.error)
      }
      toast.success('تمت الإضافة بنجاح')
      setShowAddForm(false)
      resetForm()
      // Switch to the correct tab to show the new item, then refresh both lists
      if (resData.userRating != null) {
        setMainTab('ratings')
      } else {
        setMainTab('watchlist')
      }
      fetchRatings(1, true)
      fetchWatchlist(1, true)
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
      const body = buildItemBody(formData, formData.type)
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
      fetchWatchlist(1, true)
      fetchRatings(1, true)
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
      toast.success('تم الحذف بنجاح')
      setShowDeleteConfirm(false)
      setShowDetails(false)
      setSelectedItem(null)
      fetchWatchlist(1, true)
      fetchRatings(1, true)
    } catch {
      toast.error('خطأ في الحذف')
    }
  }

  const quickRate = async (rating: number) => {
    if (!selectedItem) return
    try {
      const res = await fetch(`/api/watchlist/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRating: rating, watched: true, watchedAt: new Date().toISOString().split('T')[0] }),
      })
      if (!res.ok) throw new Error('خطأ في التقييم')
      toast.success(`تم التقييم: ${rating}/100`)
      setShowQuickRate(false)
      setShowDetails(false)
      setSelectedItem(prev => prev ? { ...prev, userRating: rating, watched: true } : null)
      fetchWatchlist(1, true)
      fetchRatings(1, true)
    } catch {
      toast.error('خطأ في التقييم')
    }
  }

  // ==================== Metadata Search ====================
  const searchMetadata = useCallback(async (query?: string) => {
    const q = query ?? metaQuery
    if (!q.trim()) {
      setMetaResults([])
      return
    }
    setMetaLoading(true)
    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, type: formData.type || 'movie' }),
      })
      const data = await res.json()
      setMetaResults(data.results || [])
    } catch {
      toast.error('خطأ في البحث')
    } finally {
      setMetaLoading(false)
    }
  }, [metaQuery, formData.type])

  // Debounced auto-search: triggers 600ms after user stops typing
  useEffect(() => {
    if (metaSearchTimerRef.current) clearTimeout(metaSearchTimerRef.current)
    if (!metaQuery.trim()) {
      setMetaResults([])
      return
    }
    metaSearchTimerRef.current = setTimeout(() => {
      searchMetadata()
    }, 600)
    return () => { if (metaSearchTimerRef.current) clearTimeout(metaSearchTimerRef.current) }
  }, [metaQuery, searchMetadata])

  const selectMetadata = (result: MetadataResult) => {
    // IMPORTANT: Auto-set the type based on the actual search result type
    // This prevents movies from being saved as series and vice versa
    // Normalize 'tv' → 'series' to prevent database inconsistencies
    const resolvedType = result.type === 'tv' ? 'series' : result.type
    const isMediaItem = resolvedType && resolvedType !== 'book' && resolvedType !== 'game'

    // Show warning if the result type doesn't match the selected form type
    if (result.typeMismatch && isMediaItem) {
      const selectedLabel = TYPE_CONFIG[formData.type]?.label || formData.type
      const resultLabel = TYPE_CONFIG[resolvedType]?.label || resolvedType
      toast.warning(`⚠️ هذا العمل ${resultLabel} وليس ${selectedLabel}! سيتم تغيير النوع تلقائياً.`, { duration: 4000 })
    }

    setFormData(prev => ({
      ...prev,
      // Auto-set type from TMDB result (movie/series/anime) — this is the correct type
      // detected from the actual TMDB endpoint, preventing series/movie mixing
      // Use TMDB type for media items, but keep current type for books/games
      type: isMediaItem ? resolvedType : (prev.type === 'tv' ? 'series' : prev.type),
      title: result.title || prev.title,
      originalTitle: result.originalTitle || prev.originalTitle,
      year: result.year || prev.year,
      poster: result.poster || prev.poster,
      overview: result.overview || prev.overview,
      rating: result.rating || prev.rating,
      genres: result.genres ? (Array.isArray(result.genres) ? result.genres.join(', ') : result.genres) : prev.genres,
      author: result.author || prev.author,
      pages: result.pages != null ? String(result.pages) : prev.pages,
      episodes: result.episodes != null ? String(result.episodes) : prev.episodes,
      seasons: result.seasons != null ? String(result.seasons) : prev.seasons,
      duration: result.duration || prev.duration,
      status: result.status || prev.status,
      runtime: result.runtime != null ? String(result.runtime) : prev.runtime,
    }))
    setMetaResults([])
    setMetaQuery('')
    if (!result.typeMismatch) {
      toast.success('تم استيراد البيانات')
    }
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
      title: '', originalTitle: '', year: '', type: 'movie', poster: '', rating: '',
      overview: '', genres: '', episodes: '', seasons: '', duration: '', status: '',
      author: '', pages: '', tags: '', notes: '',
      userRating: '', rewatch: 'false', runtime: '', ratingStatus: 'watched',
    })
    setMetaResults([])
    setMetaQuery('')
  }

  // Normalize 'tv' to 'series' in formData.type whenever it changes
  useEffect(() => {
    if (formData.type === 'tv') {
      setFormData(prev => ({ ...prev, type: 'series' }))
    }
  }, [formData.type])

  const openAddForm = (type?: string) => {
    resetForm()
    // Normalize 'tv' → 'series' to prevent type inconsistencies
    const normalizedType = type === 'tv' ? 'series' : type
    if (normalizedType) setFormData(prev => ({ ...prev, type: normalizedType }))
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


  // ==================== Export/Import ====================
  const exportData = async () => {
    try {
      await exportDataToFile(undefined, 'hussamvision-backup')
      toast.success('تم تصدير البيانات')
    } catch {
      toast.error('خطأ في التصدير')
    }
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { imported, duplicates } = await importDataFromFile(file)
      toast.success(`تم استيراد ${imported} عنصر (${duplicates} مكرر)`)
      fetchWatchlist(1, true)
      fetchRatings(1, true)
    } catch {
      toast.error('خطأ في استيراد الملف')
    }
  }

  // ==================== Movie Night ====================
  const pickRandomMovie = () => {
    const pool = mainTab === 'watchlist' ? wlItems : rtItems
    if (pool.length === 0) {
      toast.error('لا توجد عناصر للاختيار منها')
      return
    }
    const random = pool[Math.floor(Math.random() * pool.length)]
    setMovieNightResult(random)
    setShowMovieNight(true)
  }

  // ==================== Unique genres/years from database ====================

  // ==================== Watchlist Sort & Filter Content (shared between Drawer/Popover) ====================
  const wlSortFilterContent = (
    <div className="space-y-4 p-4" dir="rtl">
      {/* Sort Section */}
      <div>
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">ترتيب</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {WL_SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setWlSortBy(opt.value)}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.97] ${
                wlSortBy === opt.value
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
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
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">السنة</h4>
        <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
          <button
            onClick={() => setWlFilterYear('')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              !wlFilterYear
                ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                : 'bg-[#0a0a0a] text-[#888] border border-[#2a2a2a] hover:text-[#ccc]'
            }`}
          >
            الكل
          </button>
          {dbYears.map(y => (
            <button
              key={y}
              onClick={() => setWlFilterYear(y)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                wlFilterYear === y
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
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
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">التصنيف</h4>
        <Select value={wlFilterGenre || '__all__'} onValueChange={v => setWlFilterGenre(v === '__all__' ? '' : v)}>
          <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-sm h-10">
            <SelectValue placeholder="كل التصنيفات" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <SelectItem value="__all__">كل التصنيفات</SelectItem>
            {dbGenres.map(g => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Range */}
      <div>
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">نطاق التقييم</h4>
        <div className="flex items-center gap-2">
          <Input
            value={wlFilterRatingMin}
            onChange={(e) => setWlFilterRatingMin(e.target.value)}
            placeholder="من"
            className="flex-1 bg-[#0a0a0a] border-[#2a2a2a] text-sm h-10"
            type="number"
          />
          <span className="text-[#555] text-xs">—</span>
          <Input
            value={wlFilterRatingMax}
            onChange={(e) => setWlFilterRatingMax(e.target.value)}
            placeholder="إلى"
            className="flex-1 bg-[#0a0a0a] border-[#2a2a2a] text-sm h-10"
            type="number"
          />
        </div>
      </div>

      {/* View Mode */}
      <div>
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">طريقة العرض</h4>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
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
                ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                : 'bg-[#0a0a0a] text-[#999] border border-[#2a2a2a] hover:text-[#ccc]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            قائمة
          </button>
        </div>
      </div>

      {/* Clear All */}
      {(wlFilterGenre || wlFilterYear || wlFilterRatingMin || wlFilterRatingMax) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setWlFilterGenre(''); setWlFilterYear(''); setWlFilterRatingMin(''); setWlFilterRatingMax('') }}
          className="w-full text-[#888] text-xs hover:text-red-400 hover:bg-red-500/10"
        >
          <X className="w-3.5 h-3.5 ml-1" />
          مسح الكل
        </Button>
      )}
    </div>
  )

  // ==================== Ratings Sort & Filter Content (shared between Drawer/Popover) ====================
  const rtSortFilterContent = (
    <div className="space-y-4 p-4" dir="rtl">
      {/* Sort Section */}
      <div>
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">ترتيب</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {RT_SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRtSortBy(opt.value)}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.97] ${
                rtSortBy === opt.value
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
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
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">السنة</h4>
        <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
          <button
            onClick={() => setRtFilterYear('')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              !rtFilterYear
                ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                : 'bg-[#0a0a0a] text-[#888] border border-[#2a2a2a] hover:text-[#ccc]'
            }`}
          >
            الكل
          </button>
          {dbYears.map(y => (
            <button
              key={y}
              onClick={() => setRtFilterYear(y)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                rtFilterYear === y
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
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
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">التصنيف</h4>
        <Select value={rtFilterGenre || '__all__'} onValueChange={v => setRtFilterGenre(v === '__all__' ? '' : v)}>
          <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-sm h-10">
            <SelectValue placeholder="كل التصنيفات" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <SelectItem value="__all__">كل التصنيفات</SelectItem>
            {dbGenres.map(g => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Range */}
      <div>
        <h4 className="text-xs font-bold text-[#d4af37] mb-2">نطاق التقييم</h4>
        <div className="flex items-center gap-2">
          <Input
            value={rtFilterRatingMin}
            onChange={(e) => setRtFilterRatingMin(e.target.value)}
            placeholder="من"
            className="flex-1 bg-[#0a0a0a] border-[#2a2a2a] text-sm h-10"
            type="number"
          />
          <span className="text-[#555] text-xs">—</span>
          <Input
            value={rtFilterRatingMax}
            onChange={(e) => setRtFilterRatingMax(e.target.value)}
            placeholder="إلى"
            className="flex-1 bg-[#0a0a0a] border-[#2a2a2a] text-sm h-10"
            type="number"
          />
        </div>
      </div>

      {/* Clear All */}
      {(rtFilterGenre || rtFilterYear || rtFilterRatingMin || rtFilterRatingMax) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setRtFilterGenre(''); setRtFilterYear(''); setRtFilterRatingMin(''); setRtFilterRatingMax('') }}
          className="w-full text-[#888] text-xs hover:text-red-400 hover:bg-red-500/10"
        >
          <X className="w-3.5 h-3.5 ml-1" />
          مسح الكل
        </Button>
      )}
    </div>
  )

  // ==================== Auth Loading ====================
  if (!isAuthChecked) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
      </div>
    )
  }

  // ==================== Detail Content (shared between Dialog and Drawer) ====================
  const detailContent = selectedItem && (
    <div className="space-y-4">
      {/* Poster & Info */}
      <div className="flex gap-4">
        <div className="w-28 shrink-0">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#2a2a2a]">
            {selectedItem.poster ? (
              <img src={selectedItem.poster} alt={selectedItem.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {(() => { const Ic = (TYPE_CONFIG[selectedItem.type] || TYPE_CONFIG.movie).icon; return <Ic className="w-8 h-8 text-[#555]" /> })()}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white">{selectedItem.title}</h2>
          {selectedItem.originalTitle && selectedItem.originalTitle !== selectedItem.title && (
            <p className="text-sm text-[#888] mt-1 truncate">{selectedItem.originalTitle}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="border-[#2a2a2a] text-[#ccc]">{selectedItem.year}</Badge>
            <Badge className={`bg-gradient-to-l ${(TYPE_CONFIG[selectedItem.type] || TYPE_CONFIG.movie).color} text-black text-xs`}>
              {(TYPE_CONFIG[selectedItem.type] || TYPE_CONFIG.movie).label}
            </Badge>

          </div>
          {selectedItem.rating && (
            <div className="mt-2 text-sm text-[#d4af37]">⭐ التقييم العام: {selectedItem.rating}</div>
          )}
          {selectedItem.userRating != null && (
            <div className="mt-2">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border ${getRatingBg(selectedItem.userRating, 100, 'green')}`}>
                <Trophy className="w-4 h-4" />
                <span className="font-bold text-lg">{formatRating(selectedItem.userRating)}</span>
                <span className="text-xs">/100</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overview */}
      {selectedItem.overview && (
        <div>
          <h4 className="text-sm font-bold text-[#d4af37] mb-1">القصة</h4>
          <p className="text-sm text-[#aaa] leading-relaxed">{selectedItem.overview}</p>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {selectedItem.genres && selectedItem.genres.length > 0 && (
          <div className="col-span-2">
            <span className="text-[#888]">التصنيفات: </span>
            <span className="text-[#ccc]">{Array.isArray(selectedItem.genres) ? selectedItem.genres.join(' • ') : selectedItem.genres}</span>
          </div>
        )}
        {selectedItem.episodes && (
          <div><span className="text-[#888]">الحلقات: </span><span className="text-[#ccc]">{selectedItem.episodes}</span></div>
        )}
        {selectedItem.seasons && (
          <div><span className="text-[#888]">المواسم: </span><span className="text-[#ccc]">{selectedItem.seasons}</span></div>
        )}
        {selectedItem.duration && (
          <div><span className="text-[#888]">المدة: </span><span className="text-[#ccc]">{selectedItem.duration}</span></div>
        )}
        {selectedItem.runtime && (
          <div><span className="text-[#888]">مدة الفيلم: </span><span className="text-[#ccc]">{selectedItem.runtime} دقيقة</span></div>
        )}
        {selectedItem.status && (
          <div><span className="text-[#888]">الحالة: </span><span className="text-[#ccc]">{selectedItem.status}</span></div>
        )}
        {selectedItem.author && (
          <div><span className="text-[#888]">المؤلف: </span><span className="text-[#ccc]">{selectedItem.author}</span></div>
        )}
        {selectedItem.pages && (
          <div><span className="text-[#888]">الصفحات: </span><span className="text-[#ccc]">{selectedItem.pages}</span></div>
        )}
        {selectedItem.ratingStatus && (
          <div><span className="text-[#888]">حالة التقييم: </span><span className="text-[#ccc]">{RATING_STATUSES.find(s => s.value === selectedItem.ratingStatus)?.label || selectedItem.ratingStatus}</span></div>
        )}

        {selectedItem.tags && selectedItem.tags.length > 0 && (
          <div className="col-span-2">
            <span className="text-[#888]">الوسوم: </span>
            <span className="text-[#ccc]">{Array.isArray(selectedItem.tags) ? selectedItem.tags.join(' • ') : selectedItem.tags}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {selectedItem.notes && (
        <div>
          <h4 className="text-sm font-bold text-[#d4af37] mb-1">ملاحظات</h4>
          <p className="text-sm text-[#aaa] leading-relaxed whitespace-pre-wrap">{selectedItem.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2a2a2a]">
        <Button
          size="sm"
          onClick={() => openQuickRate(selectedItem)}
          className="bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black"
        >
          <Star className="w-4 h-4 ml-1" />
          {selectedItem.userRating != null ? 'تعديل التقييم' : 'تقييم'}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => { openEditForm(selectedItem); setShowDetails(false) }}
          className="border-[#2a2a2a] text-[#888]"
        >
          <Edit3 className="w-4 h-4 ml-1" />
          تعديل
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 ml-1" />
          حذف
        </Button>
      </div>
    </div>
  )

  // ==================== Form Content (shared between Dialog and Drawer) ====================
  const formContent = (isEdit: boolean) => (
    <div className="space-y-5 overflow-y-auto p-1 max-h-[70vh]">
      {/* Metadata Search */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          بحث تلقائي
          {metaLoading && <Loader2 className="w-3 h-3 animate-spin text-[#d4af37]" />}
        </label>
        <div className="relative">
          <Input
            value={metaQuery}
            onChange={(e) => setMetaQuery(e.target.value)}
            placeholder="اكتب اسم الفيلم أو المسلسل... (بحث تلقائي)"
            className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-sm h-11 pl-10"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {metaQuery && (
            <button
              type="button"
              onClick={() => { setMetaQuery(''); setMetaResults([]) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {metaResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
            {metaResults.map((result, idx) => {
              const normalizedResultType = result.type === 'tv' ? 'series' : (result.type || 'movie')
              const rTypeConf = TYPE_CONFIG[normalizedResultType] || TYPE_CONFIG.movie
              const RTypeIcon = rTypeConf.icon
              const isMismatch = result.typeMismatch
              return (
              <button
                key={idx}
                onClick={() => selectMetadata(result)}
                className={`flex items-center gap-3 p-2.5 rounded-xl bg-[#1a1a1a] border hover:bg-[#1a1a1a]/80 transition-all text-right active:scale-[0.98] ${
                  isMismatch ? 'border-orange-500/40 hover:border-orange-400/60' : 'border-[#2a2a2a] hover:border-[#d4af37]/50'
                }`}
              >
                {result.poster ? (
                  <img src={result.poster} alt="" className="w-11 h-16 rounded-lg object-cover shrink-0 shadow-md" />
                ) : (
                  <div className="w-11 h-16 rounded-lg bg-[#2a2a2a] flex items-center justify-center shrink-0">
                    <RTypeIcon className="w-4 h-4 text-[#555]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{result.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0 rounded bg-gradient-to-l ${rTypeConf.color} text-black`}>
                      <RTypeIcon className="w-2 h-2" />
                      {rTypeConf.label}
                    </span>
                    <span className="text-xs text-[#888]">{result.year}</span>
                    {/* Type mismatch warning badge */}
                    {isMismatch && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                        ⚠️ نوع مختلف
                      </span>
                    )}
                    {result.rating && <span className="text-xs text-[#d4af37]">⭐ {result.rating}</span>}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#d4af37]" />
                </div>
              </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Title - read-only, auto-filled from TMDB */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#d4af37]">العنوان</label>
        {formData.title ? (
          <div className="flex items-center gap-2 px-3 h-11 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm font-medium">
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
          <div className="flex items-center px-3 h-11 rounded-xl bg-[#1a1a1a]/50 border border-dashed border-[#3a3a3a] text-[#555] text-sm">
            <Search className="w-3.5 h-3.5 ml-2" />
            ابحث أعلاه لتحديد العنوان تلقائياً
          </div>
        )}
      </div>

      {/* Type + Year row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#d4af37]">النوع</label>
          <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
            <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'all').map(([key, conf]) => (
                <SelectItem key={key} value={key}>{conf.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#d4af37]">السنة</label>
          {formData.year ? (
            <div className="flex items-center px-3 h-11 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm font-medium">
              {formData.year}
            </div>
          ) : (
            <div className="flex items-center px-3 h-11 rounded-xl bg-[#1a1a1a]/50 border border-dashed border-[#3a3a3a] text-[#555] text-sm">
              تلقائي
            </div>
          )}
        </div>
      </div>

      {/* Original Title - only in edit */}
      {isEdit && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#d4af37]">العنوان الأصلي</label>
          <Input
            value={formData.originalTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, originalTitle: e.target.value }))}
            placeholder="Original Title"
            className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
            dir="ltr"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
      )}

      {/* Poster - preview + upload only, no URL field */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#d4af37]">الصورة</label>
        <div className="flex items-center gap-3">
          {formData.poster ? (
            <div className="relative group shrink-0">
              <div className="w-16 h-24 sm:w-20 sm:h-30 rounded-xl overflow-hidden bg-[#2a2a2a] border border-[#3a3a3a] shadow-lg">
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
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2a2a2a] text-[#aaa] text-sm hover:bg-[#333] hover:text-white transition-colors min-h-[44px] border border-dashed border-[#3a3a3a]">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                <span>رفع صورة مختلفة</span>
              </div>
            </label>
          )}
          {formData.poster && (
            <label className="cursor-pointer block">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#2a2a2a] text-[#aaa] text-xs hover:bg-[#333] hover:text-white transition-colors border border-dashed border-[#3a3a3a]">
                {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadIcon className="w-3 h-3" />}
                <span>تغيير</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* === Fields only shown in EDIT mode === */}
      {isEdit && (
        <>
          {/* Overview */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#d4af37]">القصة</label>
            <Textarea
              value={formData.overview}
              onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
              placeholder="وصف العمل..."
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] min-h-[80px]"
            />
          </div>

          {/* Genres */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#d4af37]">التصنيفات (مفصولة بفاصلة)</label>
            <Input
              value={formData.genres}
              onChange={(e) => setFormData(prev => ({ ...prev, genres: e.target.value }))}
              placeholder="أكشن، دراما، خيال علمي"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
            />
          </div>

          {/* Type-specific fields */}
          {(formData.type === 'series' || formData.type === 'anime') && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#d4af37]">المواسم</label>
                <Input
                  value={formData.seasons}
                  onChange={(e) => setFormData(prev => ({ ...prev, seasons: e.target.value }))}
                  placeholder="3"
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#d4af37]">الحلقات</label>
                <Input
                  value={formData.episodes}
                  onChange={(e) => setFormData(prev => ({ ...prev, episodes: e.target.value }))}
                  placeholder="24"
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
                />
              </div>
            </div>
          )}

          {formData.type === 'movie' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#d4af37]">مدة الفيلم (دقيقة)</label>
              <Input
                value={formData.runtime}
                onChange={(e) => setFormData(prev => ({ ...prev, runtime: e.target.value }))}
                placeholder="120"
                className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
              />
            </div>
          )}

          {formData.type === 'book' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#d4af37]">المؤلف</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="اسم المؤلف"
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#d4af37]">عدد الصفحات</label>
                <Input
                  value={formData.pages}
                  onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                  placeholder="350"
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
                />
              </div>
            </div>
          )}

          {/* Status + Rating row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#d4af37]">حالة المشاهدة</label>
              <Select value={formData.ratingStatus} onValueChange={(v) => setFormData(prev => ({ ...prev, ratingStatus: v }))}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  {RATING_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#d4af37]">التقييم العام</label>
              <Input
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                placeholder="7.5"
                className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
              />
            </div>
          </div>

          {/* User Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#d4af37]">تقييمي (من 100)</label>
            <Input
              value={formData.userRating}
              onChange={(e) => setFormData(prev => ({ ...prev, userRating: e.target.value }))}
              placeholder="85"
              type="number"
              min="0"
              max="100"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#d4af37]">الوسوم (مفصولة بفاصلة)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="وسم1، وسم2"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#d4af37]">ملاحظات</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="ملاحظاتك الشخصية..."
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] min-h-[60px]"
            />
          </div>


        </>
      )}
      {/* === End of edit-only fields === */}

      {/* Submit */}
      <Button
        onClick={isEdit ? updateItem : createItem}
        disabled={formSubmitting}
        className="w-full bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black font-bold h-12 text-base rounded-xl"
      >
        {formSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isEdit ? 'حفظ التعديلات' : 'إضافة'}
      </Button>
    </div>
  )

  // ==================== Quick Rate Content ====================
  const quickRateContent = selectedItem && (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-bold text-lg text-white">{selectedItem.title}</h3>
        <p className="text-sm text-[#888]">{selectedItem.year} • {(TYPE_CONFIG[selectedItem.type] || TYPE_CONFIG.movie).label}</p>
        {selectedItem.userRating != null && (
          <p className="text-sm mt-1">التقييم الحالي: <span className={`font-bold ${getRatingColor(selectedItem.userRating, 100, 'green')}`}>{formatRating(selectedItem.userRating)}</span></p>
        )}
      </div>

      {/* Rating Scale */}
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }).map((_, decade) => {
            const base = decade * 10
            return (
              <div key={decade} className="text-center">
                <div className="text-[10px] text-[#666] mb-1">{base}s</div>
                <div className="space-y-1">
                  {Array.from({ length: 10 }).map((__, unit) => {
                    const val = base + unit
                    return (
                      <button
                        key={val}
                        onClick={() => quickRate(val)}
                        className={`w-full py-1 rounded text-xs font-bold transition-all active:scale-95 ${
                          selectedItem.userRating === val
                            ? 'bg-[#d4af37] text-black'
                            : val >= 70
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : val >= 40
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[100, 90, 85, 80, 75, 70, 60, 50, 40, 30, 20, 10, 0].map(val => (
          <button
            key={val}
            onClick={() => quickRate(val)}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
              selectedItem.userRating === val
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#ccc] hover:border-[#d4af37]/50'
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      {/* Manual decimal input */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#d4af37] text-center block">تقييم يدوي (رقم عشري)</label>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="88.33"
            className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] flex-1"
            dir="ltr"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseFloat((e.target as HTMLInputElement).value)
                if (!isNaN(val) && val >= 0 && val <= 100) {
                  quickRate(val)
                } else {
                  toast.error('أدخل قيمة بين 0 و 100')
                }
              }
            }}
            id="manual-rating-input"
          />
          <Button
            onClick={() => {
              const input = document.getElementById('manual-rating-input') as HTMLInputElement
              const val = parseFloat(input?.value || '')
              if (!isNaN(val) && val >= 0 && val <= 100) {
                quickRate(val)
              } else {
                toast.error('أدخل قيمة بين 0 و 100')
              }
            }}
            className="bg-[#d4af37] text-black hover:bg-[#c9a227] shrink-0"
          >
            <Star className="w-4 h-4 ml-1" />
            تقييم
          </Button>
        </div>
      </div>

      {selectedItem.userRating != null && (
        <Button
          variant="outline"
          onClick={async () => {
            await quickRate(-1) // will set to null
            // Actually, let's handle removing rating differently
            try {
              const res = await fetch(`/api/watchlist/${selectedItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userRating: null }),
              })
              if (res.ok) {
                toast.success('تم إزالة التقييم')
                setShowQuickRate(false)
                setSelectedItem(prev => prev ? { ...prev, userRating: null } : null)
                fetchWatchlist(1, true)
                fetchRatings(1, true)
              }
            } catch {
              toast.error('خطأ')
            }
          }}
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <X className="w-4 h-4 ml-1" />
          إزالة التقييم
        </Button>
      )}
    </div>
  )

  // ==================== Delete Confirm ====================
  const deleteConfirmContent = selectedItem && (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
        <Trash2 className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-white">تأكيد الحذف</h3>
      <p className="text-[#888]">هل أنت متأكد من حذف &quot;{selectedItem.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.</p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setShowDeleteConfirm(false)}
          className="flex-1 border-[#2a2a2a] text-[#ccc]"
        >
          إلغاء
        </Button>
        <Button
          onClick={deleteItem}
          className="flex-1 bg-red-500 text-white hover:bg-red-600"
        >
          حذف
        </Button>
      </div>
    </div>
  )

  // ==================== Movie Night Content ====================
  const movieNightContent = movieNightResult && (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8960f] flex items-center justify-center mx-auto">
        <Dice5 className="w-8 h-8 text-black" />
      </div>
      <h3 className="text-lg font-bold text-[#d4af37]">🎬 ليلة الأفلام</h3>
      <p className="text-[#888]">العمل المختار عشوائياً:</p>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
        {movieNightResult.poster && (
          <img src={movieNightResult.poster} alt="" className="w-16 h-24 rounded-lg object-cover shrink-0" />
        )}
        <div className="text-right">
          <h4 className="font-bold text-white">{movieNightResult.title}</h4>
          <p className="text-sm text-[#888]">{movieNightResult.year} • {(TYPE_CONFIG[movieNightResult.type] || TYPE_CONFIG.movie).label}</p>
          {movieNightResult.rating && <p className="text-sm text-[#d4af37]">⭐ {movieNightResult.rating}</p>}
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={pickRandomMovie}
          className="flex-1 border-[#2a2a2a] text-[#ccc]"
        >
          <Dice5 className="w-4 h-4 ml-1" />
          اختر غيره
        </Button>
        <Button
          onClick={() => { setShowMovieNight(false); openDetails(movieNightResult) }}
          className="flex-1 bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black"
        >
          عرض التفاصيل
        </Button>
      </div>
    </div>
  )

  // ==================== Stats Content ====================
  const statsContent = stats && (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <Trophy className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.totalRated}</div>
          <div className="text-xs text-[#888]">عمل مقيّم</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <Star className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{formatRating(stats.avgRating)}</div>
          <div className="text-xs text-[#888]">متوسط التقييم</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <CalendarDays className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.thisMonth}</div>
          <div className="text-xs text-[#888]">هذا الشهر</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
          <BarChart3 className="w-6 h-6 text-[#d4af37] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.genreCount}</div>
          <div className="text-xs text-[#888]">تصنيف مختلف</div>
        </div>
      </div>

      {/* By Type */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-[#d4af37]">حسب النوع</h3>
        <div className="space-y-2">
          {[
            { label: 'أفلام', count: stats.movieCount, avg: stats.avgMovieRating, color: 'bg-[#d4af37]' },
            { label: 'مسلسلات', count: stats.seriesCount, avg: stats.avgSeriesRating, color: 'bg-[#e6c65a]' },
            { label: 'أنمي', count: stats.animeCount, avg: stats.avgAnimeRating, color: 'bg-[#c9a227]' },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-3">
              <span className="text-sm text-[#ccc] w-16 shrink-0">{t.label}</span>
              <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className={`h-full ${t.color} rounded-full transition-all`}
                  style={{ width: `${stats.totalRated > 0 ? (t.count / stats.totalRated) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-[#888] w-8 text-left">{t.count}</span>
              <span className="text-xs text-[#d4af37] w-12 text-left">{formatRating(t.avg)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <h4 className="text-xs text-[#888] mb-1">أعلى تقييم</h4>
          <div className="text-lg font-bold text-green-400">{formatRating(stats.maxRating)}</div>
          <div className="text-xs text-[#ccc] truncate">{stats.maxRatingTitle}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <h4 className="text-xs text-[#888] mb-1">أفضل تصنيف</h4>
          <div className="text-lg font-bold text-[#d4af37]">{stats.topGenre}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <h4 className="text-xs text-[#888] mb-1">أفضل سنة</h4>
          <div className="text-lg font-bold text-[#d4af37]">{stats.topYear}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <h4 className="text-xs text-[#888] mb-1">أفضل عقد</h4>
          <div className="text-lg font-bold text-[#d4af37]">{stats.topDecade}</div>
        </div>
      </div>
    </div>
  )

  // ==================== Main Render ====================
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white" dir="rtl">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a] safe-top">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Top row: Logo + Actions */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#b8960f] flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-lg font-bold">
                <span className="bg-gradient-to-l from-[#d4af37] to-[#e6c65a] bg-clip-text text-transparent">Hussam</span>
                <span className="bg-gradient-to-l from-[#c9a227] to-[#b8960f] bg-clip-text text-transparent">Vision</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={pickRandomMovie}
                className="text-[#888] hover:text-[#d4af37] h-9 w-9 p-0"
                title="ليلة الأفلام"
              >
                <Dice5 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportData}
                className="text-[#888] hover:text-[#d4af37] h-9 w-9 p-0"
                title="تصدير"
              >
                <Download className="w-4 h-4" />
              </Button>
              <label className="cursor-pointer">
                <input type="file" accept=".json" onChange={importData} className="hidden" />
                <div className="flex items-center justify-center h-9 w-9 rounded-md text-[#888] hover:text-[#d4af37] hover:bg-[#1a1a1a] transition-colors" title="استيراد">
                  <UploadIcon className="w-4 h-4" />
                </div>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('hussamvision_auth')
                  window.location.href = '/'
                }}
                className="text-[#888] hover:text-red-400 h-9 px-2 text-xs"
              >
                خروج
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عمل..."
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] pr-10 h-10 text-sm rounded-xl"
            />
          </div>

          {/* Main Tabs */}
          <div className="flex items-center gap-1 mobile-tabs-scroll">
            {[
              { key: 'watchlist', label: 'أريد مشاهدته', icon: Bookmark },
              { key: 'ratings', label: 'تقييماتي', icon: Trophy },
              { key: 'stats', label: 'إحصائيات', icon: BarChart3 },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setMainTab(tab.key as 'watchlist' | 'ratings' | 'stats')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                    mainTab === tab.key
                      ? 'bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black'
                      : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-6">
        {/* Watchlist Tab — Filter by type */}
        {mainTab === 'watchlist' && (
          <div className="space-y-4">
            {/* Type Filter Tabs */}
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto mobile-tabs-scroll">
              {[
                { key: 'all', label: 'الكل', icon: Bookmark, color: 'from-[#d4af37] to-[#b8960f]', count: wlTotal },
                { key: 'movie', label: 'أفلام', icon: Film, color: 'from-[#d4af37] to-[#b8960f]', count: wlMovies.length },
                { key: 'series', label: 'مسلسلات', icon: Tv, color: 'from-[#3b82f6] to-[#1d4ed8]', count: wlSeries.length },
                { key: 'anime', label: 'أنمي', icon: Sparkles, color: 'from-[#a855f7] to-[#7c3aed]', count: wlAnime.length },
              ].map(tab => {
                const Icon = tab.icon
                const isActive = wlType === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setWlType(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? `bg-gradient-to-l ${tab.color} text-black shadow-lg`
                        : 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:border-[#d4af37]/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-black/20 text-black/80' : 'bg-[#2a2a2a] text-[#666]'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                )
              })}
              <div className="flex-1 min-w-2" />
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm text-[#888]">
                {wlFilteredItems.length} عمل
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => openAddForm(wlType !== 'all' ? wlType : 'movie')}
                  className="bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black h-9 px-3 text-xs font-bold gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">إضافة</span>
                </Button>
                {/* Unified Sort & Filter Button */}
                {isMobile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWlShowSortFilter(true)}
                    className={`border-[#2a2a2a] h-9 px-3 text-xs gap-1.5 ${
                      (wlFilterGenre || wlFilterYear || wlFilterRatingMin || wlFilterRatingMax)
                        ? 'border-[#d4af37]/50 text-[#d4af37]'
                        : 'text-[#999]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{WL_SORT_OPTIONS.find(o => o.value === wlSortBy)?.label || 'ترتيب'}</span>
                    {(wlFilterGenre || wlFilterYear || wlFilterRatingMin || wlFilterRatingMax) && (
                      <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0" />
                    )}
                  </Button>
                ) : (
                  <Popover open={wlShowSortFilter} onOpenChange={setWlShowSortFilter}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-[#2a2a2a] h-9 px-3 text-xs gap-1.5 ${
                          (wlFilterGenre || wlFilterYear || wlFilterRatingMin || wlFilterRatingMax)
                            ? 'border-[#d4af37]/50 text-[#d4af37]'
                            : 'text-[#999]'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{WL_SORT_OPTIONS.find(o => o.value === wlSortBy)?.label || 'ترتيب'}</span>
                        {(wlFilterGenre || wlFilterYear || wlFilterRatingMin || wlFilterRatingMax) && (
                          <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-[#1a1a1a] border-[#2a2a2a] p-0" align="start" dir="rtl">
                      {wlSortFilterContent}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            {/* Active filter badges */}
            {(wlFilterYear || wlFilterGenre) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {wlFilterYear && (
                  <Badge
                    className="bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30 text-xs cursor-pointer hover:bg-[#d4af37]/25 gap-1"
                    onClick={() => setWlFilterYear('')}
                  >
                    {wlFilterYear}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {wlFilterGenre && (
                  <Badge
                    className="bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30 text-xs cursor-pointer hover:bg-[#d4af37]/25 gap-1"
                    onClick={() => setWlFilterGenre('')}
                  >
                    {wlFilterGenre}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            )}

            {/* Mobile Sort & Filter Drawer */}
            {isMobile && (
              <Drawer open={wlShowSortFilter} onOpenChange={setWlShowSortFilter}>
                <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[85vh]">
                  <DrawerHeader className="text-right pb-2">
                    <DrawerTitle className="text-white text-right text-sm">ترتيب وتصفية</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4 overflow-y-auto">
                    {wlSortFilterContent}
                  </div>
                  <DrawerFooter className="border-t border-[#2a2a2a] pt-2">
                    <Button
                      onClick={() => setWlShowSortFilter(false)}
                      className="bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black font-bold"
                    >
                      تطبيق
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}

            {/* Loading state */}
            {wlLoading && wlItems.length === 0 ? (
              <SkeletonGrid count={6} />
            ) : wlFilteredItems.length === 0 ? (
              <div className="text-center py-16">
                {wlType === 'movie' ? (
                  <Film className="w-12 h-12 text-[#333] mx-auto mb-4" />
                ) : wlType === 'series' ? (
                  <Tv className="w-12 h-12 text-[#333] mx-auto mb-4" />
                ) : wlType === 'anime' ? (
                  <Sparkles className="w-12 h-12 text-[#333] mx-auto mb-4" />
                ) : (
                  <Bookmark className="w-12 h-12 text-[#333] mx-auto mb-4" />
                )}
                <p className="text-[#888] text-lg mb-2">
                  {wlType === 'all' ? 'لا توجد أعمال' : `لا توجد ${wlType === 'movie' ? 'أفلام' : wlType === 'series' ? 'مسلسلات' : 'أنميات'}`}
                </p>
                <p className="text-[#666] text-sm">أضف أعمالاً جديدة لمتابعتها</p>
              </div>
            ) : (
              <>
                {/* Items Grid/List — filtered by selected type */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {wlFilteredItems.map(item => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        onClick={() => openDetails(item)}
                        onQuickRate={() => openQuickRate(item)}
                        onDelete={() => { setSelectedItem(item); setShowDeleteConfirm(true) }}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wlFilteredItems.map(item => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        onClick={() => openDetails(item)}
                        onQuickRate={() => openQuickRate(item)}
                        onDelete={() => { setSelectedItem(item); setShowDeleteConfirm(true) }}
                        viewMode="list"
                      />
                    ))}
                  </div>
                )}

                {/* Loading more indicator */}
                {wlLoading && wlItems.length > 0 && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Ratings Tab */}
        {mainTab === 'ratings' && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto mobile-tabs-scroll">
              {['movie', 'series', 'anime'].map(type => {
                const conf = TYPE_CONFIG[type]
                const Icon = conf.icon
                return (
                  <button
                    key={type}
                    onClick={() => setRtType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                      rtType === type
                        ? `bg-gradient-to-l ${conf.color} text-black`
                        : 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:border-[#d4af37]/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {conf.plural}
                  </button>
                )
              })}
              <div className="flex-1 min-w-2" />
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm text-[#888]">
                {rtTotal} عمل مقيّم
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => openAddForm(rtType !== 'all' ? rtType : 'movie')}
                  className="bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black h-9 px-3 text-xs font-bold gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">إضافة</span>
                </Button>
                {/* Unified Sort & Filter Button */}
                {isMobile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRtShowSortFilter(true)}
                    className={`border-[#2a2a2a] h-9 px-3 text-xs gap-1.5 ${
                      (rtFilterGenre || rtFilterYear || rtFilterRatingMin || rtFilterRatingMax)
                        ? 'border-[#d4af37]/50 text-[#d4af37]'
                        : 'text-[#999]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{RT_SORT_OPTIONS.find(o => o.value === rtSortBy)?.label || 'ترتيب'}</span>
                    {(rtFilterGenre || rtFilterYear || rtFilterRatingMin || rtFilterRatingMax) && (
                      <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0" />
                    )}
                  </Button>
                ) : (
                  <Popover open={rtShowSortFilter} onOpenChange={setRtShowSortFilter}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-[#2a2a2a] h-9 px-3 text-xs gap-1.5 ${
                          (rtFilterGenre || rtFilterYear || rtFilterRatingMin || rtFilterRatingMax)
                            ? 'border-[#d4af37]/50 text-[#d4af37]'
                            : 'text-[#999]'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{RT_SORT_OPTIONS.find(o => o.value === rtSortBy)?.label || 'ترتيب'}</span>
                        {(rtFilterGenre || rtFilterYear || rtFilterRatingMin || rtFilterRatingMax) && (
                          <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-[#1a1a1a] border-[#2a2a2a] p-0" align="start" dir="rtl">
                      {rtSortFilterContent}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            {/* Active filter badges */}
            {(rtFilterYear || rtFilterGenre) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {rtFilterYear && (
                  <Badge
                    className="bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30 text-xs cursor-pointer hover:bg-[#d4af37]/25 gap-1"
                    onClick={() => setRtFilterYear('')}
                  >
                    {rtFilterYear}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {rtFilterGenre && (
                  <Badge
                    className="bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30 text-xs cursor-pointer hover:bg-[#d4af37]/25 gap-1"
                    onClick={() => setRtFilterGenre('')}
                  >
                    {rtFilterGenre}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            )}

            {/* Mobile Sort & Filter Drawer */}
            {isMobile && (
              <Drawer open={rtShowSortFilter} onOpenChange={setRtShowSortFilter}>
                <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[85vh]">
                  <DrawerHeader className="text-right pb-2">
                    <DrawerTitle className="text-white text-right text-sm">ترتيب وتصفية</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4 overflow-y-auto">
                    {rtSortFilterContent}
                  </div>
                  <DrawerFooter className="border-t border-[#2a2a2a] pt-2">
                    <Button
                      onClick={() => setRtShowSortFilter(false)}
                      className="bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black font-bold"
                    >
                      تطبيق
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}

            {/* Items - Always list view for ratings, no posters */}
            {rtLoading && rtItems.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl skeleton-shimmer" />
                ))}
              </div>
            ) : rtItems.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <p className="text-[#888] text-lg mb-2">لا توجد تقييمات</p>
                <p className="text-[#666] text-sm">قيّم أعمالاً لتظهر هنا</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  {rtItems.map((item, idx) => {
                    const typeConf = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie
                    const TypeIcon = typeConf.icon
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 hover:border-[#3a3a3a] transition-colors"
                      >
                        {/* Rank number */}
                        <span className="text-xs text-[#555] font-mono w-6 text-center shrink-0">{idx + 1}</span>

                        {/* Type icon */}
                        <div className={`w-9 h-9 rounded-lg ${typeConf.bgColor} flex items-center justify-center shrink-0`}>
                          <TypeIcon className="w-4 h-4 text-[#d4af37]" />
                        </div>

                        {/* Title & info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-white truncate leading-tight">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#888]">{item.year}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-l ${typeConf.color} text-black`}>{typeConf.label}</span>
                            {item.genres && item.genres.length > 0 && (
                              <span className="text-[10px] text-[#555] truncate max-w-[100px]">{item.genres[0]}</span>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        {item.userRating != null ? (
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border shrink-0 ${getRatingBg(item.userRating, 100, 'green')}`}>
                            <span className={`font-black text-base ${getRatingColor(item.userRating, 100, 'green')}`}>{formatRating(item.userRating)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#555] shrink-0">-</span>
                        )}

                        {/* Delete button - external */}
                        <button
                          onClick={() => { setSelectedItem(item); setShowDeleteConfirm(true) }}
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
                <div className="h-4" />
                {rtLoading && rtItems.length > 0 && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {mainTab === 'stats' && (
          <div className="space-y-4">
            {statsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : stats ? (
              statsContent
            ) : (
              <div className="text-center py-16">
                <BarChart3 className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <p className="text-[#888]">لا توجد إحصائيات</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}

      {/* Details Modal */}
      <ResponsiveModal
        open={showDetails}
        onOpenChange={setShowDetails}
        title="تفاصيل العمل"
        isMobile={isMobile}
      >
        {detailContent}
      </ResponsiveModal>

      {/* Add Form Modal */}
      <ResponsiveModal
        open={showAddForm}
        onOpenChange={setShowAddForm}
        title="إضافة عمل جديد"
        wide
        isMobile={isMobile}
      >
        {formContent(false)}
      </ResponsiveModal>

      {/* Edit Form Modal */}
      <ResponsiveModal
        open={showEditForm}
        onOpenChange={setShowEditForm}
        title="تعديل العمل"
        wide
        isMobile={isMobile}
      >
        {formContent(true)}
      </ResponsiveModal>

      {/* Quick Rate Modal */}
      <ResponsiveModal
        open={showQuickRate}
        onOpenChange={setShowQuickRate}
        title="تقييم العمل"
        isMobile={isMobile}
      >
        {quickRateContent}
      </ResponsiveModal>

      {/* Delete Confirm Modal */}
      <ResponsiveModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="تأكيد الحذف"
        isMobile={isMobile}
      >
        {deleteConfirmContent}
      </ResponsiveModal>

      {/* Movie Night Modal */}
      <ResponsiveModal
        open={showMovieNight}
        onOpenChange={setShowMovieNight}
        title="ليلة الأفلام"
        isMobile={isMobile}
      >
        {movieNightContent}
      </ResponsiveModal>

    </div>
  )
}
