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
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { toast } from 'sonner'
import {
  Plus, Film, Tv, Sparkles, Star, Check, X, Search, Loader2,
  Edit3, Grid3X3, List, Filter, ArrowUpDown, Download, Upload as UploadIcon,
  BarChart3, CalendarDays, Bookmark, Settings, Trash2, Cloud, CloudOff,
  Dice5, Printer, Trophy, SlidersHorizontal, Share2, FileText
} from 'lucide-react'

// ==================== Types ====================
interface MediaItem {
  id: string
  title: string
  originalTitle?: string | null
  year: string
  type: string
  poster?: string | null
  rating?: string | null
  overview?: string | null
  genres: string[]
  episodes?: number | null
  seasons?: number | null
  duration?: string | null
  status?: string | null
  author?: string | null
  pages?: number | null
  tags: string[]
  notes: string

  userRating?: number | null
  rewatch: boolean
  runtime?: number | null
  ratingStatus: string
  addedAt: string
  updatedAt: string
}

interface MetadataResult {
  title: string
  originalTitle?: string
  year?: string
  poster?: string | null
  overview?: string
  rating?: string | null
  type?: string
  genres?: string[]
  author?: string
  pages?: number | null
  episodes?: number | null
  seasons?: number | null
  duration?: string
  status?: string
  runtime?: number | null
}

interface StatsData {
  totalRated: number
  topGenre: string
  avgRating: number
  topYear: string
  topDecade: string
  thisMonth: number
  movieCount: number
  seriesCount: number
  animeCount: number
  avgMovieRating: number
  avgSeriesRating: number
  avgAnimeRating: number
  genreCount: number
  maxRating: number
  maxRatingTitle: string
}

// ==================== Constants ====================
const TYPE_CONFIG: Record<string, { icon: typeof Bookmark; label: string; plural: string; color: string; bgColor: string }> = {
  all: { icon: Bookmark, label: 'الكل', plural: 'جميع الأعمال', color: 'from-[#d4af37] to-[#b8960f]', bgColor: 'bg-[#d4af37]/10' },
  anime: { icon: Sparkles, label: 'أنمي', plural: 'أنميات', color: 'from-[#c9a227] to-[#a07d00]', bgColor: 'bg-[#c9a227]/10' },
  series: { icon: Tv, label: 'مسلسل', plural: 'مسلسلات', color: 'from-[#e6c65a] to-[#c9a227]', bgColor: 'bg-[#e6c65a]/10' },
  movie: { icon: Film, label: 'فيلم', plural: 'أفلام', color: 'from-[#d4af37] to-[#b8960f]', bgColor: 'bg-[#d4af37]/10' },
  book: { icon: Bookmark, label: 'كتاب', plural: 'كتب', color: 'from-[#8B4513] to-[#654321]', bgColor: 'bg-[#8B4513]/10' },
  game: { icon: Dice5, label: 'لعبة', plural: 'ألعاب', color: 'from-[#2e8b57] to-[#1a6b3a]', bgColor: 'bg-[#2e8b57]/10' },
}

const SORT_OPTIONS = [
  { value: 'addedAt_desc', label: 'أضيف مؤخراً' },
  { value: 'addedAt_asc', label: 'أضيف أولاً' },
  { value: 'title_asc', label: 'الاسم أ-ي' },
  { value: 'title_desc', label: 'الاسم ي-أ' },
  { value: 'year_desc', label: 'السنة (جديد)' },
  { value: 'year_asc', label: 'السنة (قديم)' },
  { value: 'userRating_desc', label: 'تقييمي (أعلى)' },
  { value: 'userRating_asc', label: 'تقييمي (أدنى)' },
  { value: 'rating_desc', label: 'التقييم العام (أعلى)' },
]

const RATING_STATUSES = [
  { value: 'watched', label: 'تمت المشاهدة' },
  { value: 'rewatching', label: 'إعادة مشاهدة' },
  { value: 'dropped', label: 'متروك' },
  { value: 'on_hold', label: 'معلق' },
]

// ==================== Helpers ====================
function formatRating(num: number | null | undefined) {
  if (num == null) return '-'
  const n = Math.round(Number(num) * 100) / 100
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function getRatingColor(rating: number) {
  if (rating >= 70) return 'text-green-400'
  if (rating >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function getRatingBg(rating: number) {
  if (rating >= 70) return 'bg-green-500/20 border-green-500/30 text-green-400'
  if (rating >= 40) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
  return 'bg-red-500/20 border-red-500/30 text-red-400'
}

function getRatingBarColor(rating: number) {
  if (rating >= 70) return 'bg-green-500'
  if (rating >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const compressImage = (file: File, maxWidth = 400, maxHeight = 600, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio; height *= ratio
        }
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No context')); return }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('Load failed'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Read failed'))
    reader.readAsDataURL(file)
  })
}

function itemToFormData(item: Partial<MediaItem>): Record<string, string> {
  return {
    title: item.title || '',
    originalTitle: item.originalTitle || '',
    year: item.year || '',
    type: item.type || 'movie',
    poster: item.poster || '',
    rating: item.rating || '',
    overview: item.overview || '',
    genres: Array.isArray(item.genres) ? item.genres.join(', ') : (item.genres || ''),
    episodes: item.episodes != null ? String(item.episodes) : '',
    seasons: item.seasons != null ? String(item.seasons) : '',
    duration: item.duration || '',
    status: item.status || '',
    author: item.author || '',
    pages: item.pages != null ? String(item.pages) : '',
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    notes: item.notes || '',
    userRating: item.userRating != null ? String(item.userRating) : '',
    rewatch: item.rewatch ? 'true' : 'false',
    runtime: item.runtime != null ? String(item.runtime) : '',
    ratingStatus: item.ratingStatus || 'watched',
  }
}

// ==================== Responsive Modal Wrapper (OUTSIDE component for stable reference) ====================
function ResponsiveModal({
  open,
  onOpenChange,
  title,
  children,
  footerContent,
  wide = false,
  isMobile,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footerContent?: React.ReactNode
  wide?: boolean
  isMobile: boolean
}) {
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-[#0f0f0f] border-[#2a2a2a] max-h-[92vh]">
          <DrawerHeader className="border-b border-[#2a2a2a] px-4 py-3">
            <DrawerTitle className="text-[#d4af37] font-bold text-base">{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-3" data-vaul-no-drag>
            {children}
          </div>
          {footerContent && (
            <DrawerFooter className="border-t border-[#2a2a2a]">
              {footerContent}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`bg-[#0f0f0f] border-[#2a2a2a] max-h-[85vh] overflow-hidden ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[#d4af37] font-bold text-base">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// ==================== Skeleton Grid ====================
function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-[2/3] rounded-xl skeleton-shimmer" />
      ))}
    </div>
  )
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
            <span className="text-xs text-[#888]">{item.year}</span>
            {item.userRating != null && (
              <span className={`text-xs font-bold ${getRatingColor(item.userRating)}`}>
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
            <div className={`text-lg font-bold ${getRatingColor(item.userRating)}`}>
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
        <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
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
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // Main tabs
  const [mainTab, setMainTab] = useState<'watchlist' | 'ratings' | 'stats'>('watchlist')

  // Watchlist state
  const [wlType, setWlType] = useState('all')
  const [wlItems, setWlItems] = useState<MediaItem[]>([])
  const [wlLoading, setWlLoading] = useState(true)
  const [wlPage, setWlPage] = useState(1)
  const [wlHasMore, setWlHasMore] = useState(false)
  const [wlTotal, setWlTotal] = useState(0)

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

  // All years from database
  const [dbYears, setDbYears] = useState<string[]>([])

  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('addedAt_desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filterGenre, setFilterGenre] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterRatingMin, setFilterRatingMin] = useState('')
  const [filterRatingMax, setFilterRatingMax] = useState('')

  // Modals
  const [showDetails, setShowDetails] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showQuickRate, setShowQuickRate] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Print preview
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [printType, setPrintType] = useState('all')
  const [printSortBy, setPrintSortBy] = useState('userRating_desc')
  const [printGenreFilter, setPrintGenreFilter] = useState('')
  const [printYearFilter, setPrintYearFilter] = useState('')
  const [printRatingMin, setPrintRatingMin] = useState('')
  const [printRatingMax, setPrintRatingMax] = useState('')
  const [allRatedItems, setAllRatedItems] = useState<MediaItem[]>([])

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
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const metaSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // ==================== Auth ====================
  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth !== 'true') {
      window.location.href = '/'
      return
    }
    setIsAuthChecked(true)
  }, [])

  // ==================== Debounced Search ====================
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [searchQuery])

  // ==================== Fetch Watchlist ====================
  const fetchWatchlist = useCallback(async (page: number, reset = false) => {
    setWlLoading(true)
    try {
      const params = new URLSearchParams()
      if (wlType !== 'all') params.set('type', wlType)
      params.set('hasRating', 'false')
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('page', String(page))
      params.set('limit', '20')
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      if (reset) {
        setWlItems(data.items || [])
      } else {
        setWlItems(prev => {
          const existingIds = new Set(prev.map(i => i.id))
          const newItems = (data.items || []).filter((i: MediaItem) => !existingIds.has(i.id))
          return [...prev, ...newItems]
        })
      }
      setWlTotal(data.total || 0)
      setWlHasMore(data.hasMore || false)
    } catch {
      toast.error('خطأ في جلب البيانات')
    } finally {
      setWlLoading(false)
    }
  }, [wlType, debouncedSearch])

  // ==================== Fetch Ratings ====================
  const fetchRatings = useCallback(async (page: number, reset = false) => {
    setRtLoading(true)
    try {
      const params = new URLSearchParams()
      if (rtType !== 'all') params.set('type', rtType)
      params.set('hasRating', 'true')
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('page', String(page))
      params.set('limit', '20')
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      if (reset) {
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
    } catch {
      toast.error('خطأ في جلب البيانات')
    } finally {
      setRtLoading(false)
    }
  }, [rtType, debouncedSearch])

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
  }, [isAuthChecked, wlType, debouncedSearch, fetchWatchlist])

  // Fetch all available years from database
  useEffect(() => {
    if (!isAuthChecked) return
    fetch('/api/years')
      .then(r => r.json())
      .then(data => { if (data.years) setDbYears(data.years) })
      .catch(() => {})
  }, [isAuthChecked])

  useEffect(() => {
    if (!isAuthChecked || mainTab !== 'ratings') return
    setRtPage(1)
    fetchRatings(1, true)
  }, [isAuthChecked, mainTab, rtType, debouncedSearch, fetchRatings])

  useEffect(() => {
    if (!isAuthChecked || mainTab !== 'stats') return
    fetchStats()
  }, [isAuthChecked, mainTab, fetchStats])

  // ==================== Infinite Scroll ====================
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (mainTab === 'watchlist' && wlHasMore && !wlLoading) {
            const nextPage = wlPage + 1
            setWlPage(nextPage)
            fetchWatchlist(nextPage)
          } else if (mainTab === 'ratings' && rtHasMore && !rtLoading) {
            const nextPage = rtPage + 1
            setRtPage(nextPage)
            fetchRatings(nextPage)
          }
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current)
    return () => { if (observerRef.current) observerRef.current.disconnect() }
  }, [mainTab, wlHasMore, rtHasMore, wlLoading, rtLoading, wlPage, rtPage, fetchWatchlist, fetchRatings])

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
      const body: Record<string, unknown> = {
        title: formData.title,
        originalTitle: formData.originalTitle || null,
        year: formData.year,
        type: formData.type || 'movie',
        poster: formData.poster || null,
        rating: formData.rating || null,
        overview: formData.overview || null,
        genres: formData.genres,
        episodes: formData.episodes ? parseInt(formData.episodes) : null,
        seasons: formData.seasons ? parseInt(formData.seasons) : null,
        duration: formData.duration || null,
        status: formData.status || null,
        author: formData.author || null,
        pages: formData.pages ? parseInt(formData.pages) : null,
        tags: formData.tags,
        notes: formData.notes,
        userRating: formData.userRating ? parseFloat(formData.userRating) : null,
        rewatch: formData.rewatch === 'true',
        runtime: formData.runtime ? parseInt(formData.runtime) : null,
        ratingStatus: formData.ratingStatus || 'watched',
      }
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const resData = await res.json()
      if (!res.ok) {
        if (resData.duplicate && resData.existingItem) {
          // Show the existing item to the user and let them navigate to it
          const existing = resData.existingItem as MediaItem
          const tabLabel = existing.userRating != null ? 'تقييماتي' : 'أريد مشاهدته'
          toast.error(`هذا العمل موجود مسبقاً في "${tabLabel}"!`, {
            duration: 5000,
            action: {
              label: 'عرض',
              onClick: () => {
                setShowAddForm(false)
                resetForm()
                // Navigate to the correct tab and open the item
                if (existing.userRating != null) {
                  setMainTab('ratings')
                } else {
                  setMainTab('watchlist')
                }
                setSelectedItem(existing)
                setShowDetails(true)
              }
            }
          })
          return
        }
        throw new Error(resData.error)
      }
      toast.success('تمت الإضافة بنجاح')
      setShowAddForm(false)
      resetForm()
      // Refresh both lists and switch to the correct tab to show the new item
      if (resData.userRating != null) {
        setMainTab('ratings')
        fetchRatings(1, true)
      } else {
        setMainTab('watchlist')
        fetchWatchlist(1, true)
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
      const body: Record<string, unknown> = {
        title: formData.title,
        originalTitle: formData.originalTitle || null,
        year: formData.year,
        type: formData.type,
        poster: formData.poster || null,
        rating: formData.rating || null,
        overview: formData.overview || null,
        genres: formData.genres,
        episodes: formData.episodes ? parseInt(formData.episodes) : null,
        seasons: formData.seasons ? parseInt(formData.seasons) : null,
        duration: formData.duration || null,
        status: formData.status || null,
        author: formData.author || null,
        pages: formData.pages ? parseInt(formData.pages) : null,
        tags: formData.tags,
        notes: formData.notes,
        userRating: formData.userRating ? parseFloat(formData.userRating) : null,
        rewatch: formData.rewatch === 'true',
        runtime: formData.runtime ? parseInt(formData.runtime) : null,
        ratingStatus: formData.ratingStatus || 'watched',
      }
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
      episodes: result.episodes != null ? String(result.episodes) : prev.episodes,
      seasons: result.seasons != null ? String(result.seasons) : prev.seasons,
      duration: result.duration || prev.duration,
      status: result.status || prev.status,
      runtime: result.runtime != null ? String(result.runtime) : prev.runtime,
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
      title: '', originalTitle: '', year: '', type: 'movie', poster: '', rating: '',
      overview: '', genres: '', episodes: '', seasons: '', duration: '', status: '',
      author: '', pages: '', tags: '', notes: '',
      userRating: '', rewatch: 'false', runtime: '', ratingStatus: 'watched',
    })
    setMetaResults([])
    setMetaQuery('')
  }

  const openAddForm = (type?: string) => {
    resetForm()
    if (type) setFormData(prev => ({ ...prev, type }))
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
  const sortItems = useCallback((items: MediaItem[]): MediaItem[] => {
    const sorted = [...items]
    const [field, direction] = sortBy.split('_')
    sorted.sort((a, b) => {
      let aVal: string | number | boolean | null = ''
      let bVal: string | number | boolean | null = ''
      switch (field) {
        case 'addedAt': aVal = a.addedAt; bVal = b.addedAt; break
        case 'title': aVal = a.title; bVal = b.title; break
        case 'year': aVal = a.year; bVal = b.year; break
        case 'userRating': aVal = a.userRating ?? -1; bVal = b.userRating ?? -1; break
        case 'rating': aVal = a.rating ? parseFloat(a.rating) : -1; bVal = b.rating ? parseFloat(b.rating) : -1; break
        default: aVal = a.addedAt; bVal = b.addedAt
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return direction === 'asc'
        ? ((aVal as number) - (bVal as number))
        : ((bVal as number) - (aVal as number))
    })
    return sorted
  }, [sortBy])

  const filterItems = useCallback((items: MediaItem[]): MediaItem[] => {
    return items.filter(item => {
      if (filterGenre && !(item.genres || []).some(g => g.toLowerCase().includes(filterGenre.toLowerCase()))) return false
      if (filterYear && item.year !== filterYear) return false
      if (filterRatingMin && (item.userRating == null || item.userRating < parseFloat(filterRatingMin))) return false
      if (filterRatingMax && (item.userRating == null || item.userRating > parseFloat(filterRatingMax))) return false
      return true
    })
  }, [filterGenre, filterYear, filterRatingMin, filterRatingMax])

  const processedWlItems = useMemo(() => {
    return filterItems(sortItems(wlItems))
  }, [wlItems, sortItems, filterItems])

  const processedRtItems = useMemo(() => {
    return filterItems(sortItems(rtItems))
  }, [rtItems, sortItems, filterItems])

  // ==================== Export/Import ====================
  const exportData = async () => {
    try {
      const params = new URLSearchParams()
      params.set('limit', '1000')
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      const items = data.items || []
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hussamvision-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('تم تصدير البيانات')
    } catch {
      toast.error('خطأ في التصدير')
    }
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const items = JSON.parse(text)
      if (!Array.isArray(items)) throw new Error('Invalid format')
      let imported = 0
      let duplicates = 0
      for (const item of items) {
        try {
          const body = {
            title: item.title,
            originalTitle: item.originalTitle || null,
            year: item.year || '',
            type: item.type || 'movie',
            poster: item.poster || null,
            rating: item.rating || null,
            overview: item.overview || null,
            genres: Array.isArray(item.genres) ? item.genres.join(', ') : (item.genres || ''),
            episodes: item.episodes || null,
            seasons: item.seasons || null,
            duration: item.duration || null,
            status: item.status || null,
            author: item.author || null,
            pages: item.pages || null,
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
            notes: item.notes || '',

            userRating: item.userRating != null ? item.userRating : null,
            rewatch: item.rewatch || false,
            runtime: item.runtime || null,
            ratingStatus: item.ratingStatus || 'watched',
          }
          const res = await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          if (res.ok) imported++
          else duplicates++
        } catch {
          duplicates++
        }
      }
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

  // ==================== Print Preview ====================
  const openPrintPreview = async () => {
    try {
      const params = new URLSearchParams()
      params.set('hasRating', 'true')
      params.set('limit', '1000')
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      setAllRatedItems(data.items || [])
      setShowPrintPreview(true)
    } catch {
      toast.error('خطأ في جلب البيانات')
    }
  }

  const filteredPrintItems = useMemo(() => {
    let items = [...allRatedItems]
    if (printType !== 'all') items = items.filter(i => i.type === printType)
    if (printGenreFilter) items = items.filter(i => (i.genres || []).some(g => g.toLowerCase().includes(printGenreFilter.toLowerCase())))
    if (printYearFilter) items = items.filter(i => i.year === printYearFilter)
    if (printRatingMin) items = items.filter(i => i.userRating != null && i.userRating >= parseFloat(printRatingMin))
    if (printRatingMax) items = items.filter(i => i.userRating != null && i.userRating <= parseFloat(printRatingMax))

    const [field, direction] = printSortBy.split('_')
    items.sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''
      switch (field) {
        case 'title': aVal = a.title; bVal = b.title; break
        case 'year': aVal = a.year; bVal = b.year; break
        case 'userRating': aVal = a.userRating ?? -1; bVal = b.userRating ?? -1; break
        default: aVal = a.userRating ?? -1; bVal = b.userRating ?? -1
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return direction === 'asc' ? ((aVal as number) - (bVal as number)) : ((bVal as number) - (aVal as number))
    })
    return items
  }, [allRatedItems, printType, printSortBy, printGenreFilter, printYearFilter, printRatingMin, printRatingMax])

  const handlePrint = () => {
    // Build URL from current print filters
    const params = new URLSearchParams()
    params.set('type', printType)
    params.set('sortBy', printSortBy)
    if (printGenreFilter) params.set('genre', printGenreFilter)
    if (printYearFilter) params.set('year', printYearFilter)
    if (printRatingMin) params.set('ratingMin', printRatingMin)
    if (printRatingMax) params.set('ratingMax', printRatingMax)
    const url = `/api/print?${params.toString()}`
    const printWindow = window.open(url, '_blank', 'width=900,height=700')
    if (!printWindow) {
      toast.error('تم حظر النافذة المنبثقة - اسمح بالنوافذ المنبثقة لهذا الموقع')
    }
  }

  const handleShare = async () => {
    const text = filteredPrintItems.map((item, i) =>
      `${i + 1}. ${item.title} (${item.year}) - ${formatRating(item.userRating)}/100`
    ).join('\n')
    const shareText = `تقييماتي - HussamVision\n\n${text}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'تقييماتي - HussamVision', text: shareText })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      toast.success('تم النسخ إلى الحافظة')
    }
  }

  // ==================== Unique genres/years for filters ====================
  const allGenres = useMemo(() => {
    const items = mainTab === 'watchlist' ? wlItems : rtItems
    const genres = new Set<string>()
    items.forEach(item => (item.genres || []).forEach(g => { if (g.trim()) genres.add(g.trim()) }))
    return Array.from(genres).sort()
  }, [mainTab, wlItems, rtItems])

  const allYears = useMemo(() => {
    if (dbYears.length > 0) return dbYears
    const years = new Set<string>()
    wlItems.forEach(item => { if (item.year) years.add(item.year) })
    rtItems.forEach(item => { if (item.year) years.add(item.year) })
    return Array.from(years).sort().reverse()
  }, [dbYears, wlItems, rtItems])

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
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border ${getRatingBg(selectedItem.userRating)}`}>
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
            <span className="text-[#ccc]">{selectedItem.genres.join(' • ')}</span>
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
            <span className="text-[#ccc]">{selectedItem.tags.join(' • ')}</span>
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
            {metaResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => selectMetadata(result)}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#d4af37]/50 hover:bg-[#1a1a1a]/80 transition-all text-right active:scale-[0.98]"
              >
                {result.poster ? (
                  <img src={result.poster} alt="" className="w-11 h-16 rounded-lg object-cover shrink-0 shadow-md" />
                ) : (
                  <div className="w-11 h-16 rounded-lg bg-[#2a2a2a] flex items-center justify-center shrink-0">
                    <Film className="w-4 h-4 text-[#555]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{result.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#888]">{result.year}</span>
                    {result.rating && <span className="text-xs text-[#d4af37]">⭐ {result.rating}</span>}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#d4af37]" />
                </div>
              </button>
            ))}
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
          <p className="text-sm mt-1">التقييم الحالي: <span className={`font-bold ${getRatingColor(selectedItem.userRating)}`}>{formatRating(selectedItem.userRating)}</span></p>
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

  // ==================== Print Preview Overlay ====================
  const printPreviewOverlay = showPrintPreview && (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/98 backdrop-blur-sm flex flex-col no-print" dir="rtl">
      {/* Compact Header */}
      <div className="shrink-0 bg-[#0a0a0a] border-b border-[#2a2a2a] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8960f] flex items-center justify-center">
              <Printer className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">معاينة الطباعة</h2>
              <p className="text-xs text-[#666]">{filteredPrintItems.length} عمل</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black h-9 px-4 text-sm font-bold">
              <Printer className="w-3.5 h-3.5 ml-1.5" />
              طباعة
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm" className="border-[#2a2a2a] text-[#ccc] h-9 px-3 text-sm">
              <Share2 className="w-3.5 h-3.5 ml-1" />
              مشاركة
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrintPreview(false)}
              className="text-[#888] h-9 w-9 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Select value={printType} onValueChange={setPrintType}>
            <SelectTrigger className="w-24 bg-[#1a1a1a] border-[#2a2a2a] text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="movie">أفلام</SelectItem>
              <SelectItem value="series">مسلسلات</SelectItem>
              <SelectItem value="anime">أنمي</SelectItem>
            </SelectContent>
          </Select>
          <Select value={printSortBy} onValueChange={setPrintSortBy}>
            <SelectTrigger className="w-32 bg-[#1a1a1a] border-[#2a2a2a] text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={printGenreFilter}
            onChange={(e) => setPrintGenreFilter(e.target.value)}
            placeholder="التصنيف"
            className="w-20 bg-[#1a1a1a] border-[#2a2a2a] text-xs h-8"
          />
          <Input
            value={printYearFilter}
            onChange={(e) => setPrintYearFilter(e.target.value)}
            placeholder="السنة"
            className="w-16 bg-[#1a1a1a] border-[#2a2a2a] text-xs h-8"
          />
          <Input
            value={printRatingMin}
            onChange={(e) => setPrintRatingMin(e.target.value)}
            placeholder="من"
            className="w-14 bg-[#1a1a1a] border-[#2a2a2a] text-xs h-8"
            type="number"
          />
          <Input
            value={printRatingMax}
            onChange={(e) => setPrintRatingMax(e.target.value)}
            placeholder="إلى"
            className="w-14 bg-[#1a1a1a] border-[#2a2a2a] text-xs h-8"
            type="number"
          />
          {(printType !== 'all' || printGenreFilter || printYearFilter || printRatingMin || printRatingMax) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setPrintType('all'); setPrintGenreFilter(''); setPrintYearFilter(''); setPrintRatingMin(''); setPrintRatingMax('') }}
              className="text-red-400 text-xs h-8 px-2"
            >
              <X className="w-3 h-3 ml-1" />
              مسح
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div id="print-container" className="p-4 sm:p-6 max-w-4xl mx-auto">
          {/* Print Header - only visible when printing */}
          <div className="print-only text-center mb-8">
            <h1 className="text-3xl font-black mb-1">
              <span className="text-[#d4af37]">Hussam</span><span className="text-[#b8960f]">Vision</span>
            </h1>
            <p className="text-sm text-gray-500 mb-4">تقييماتي - {new Date().toLocaleDateString('ar-SA')}</p>
            <div className="w-24 h-0.5 bg-[#d4af37] mx-auto" />
          </div>

          {/* Screen-only summary bar */}
          <div className="no-print flex items-center gap-3 mb-4">
            {/* Stats pills */}
            {(() => {
              const movies = filteredPrintItems.filter(i => i.type === 'movie').length
              const series = filteredPrintItems.filter(i => i.type === 'series').length
              const anime = filteredPrintItems.filter(i => i.type === 'anime').length
              const avgRating = filteredPrintItems.length > 0
                ? (filteredPrintItems.reduce((sum, i) => sum + (i.userRating ?? 0), 0) / filteredPrintItems.filter(i => i.userRating != null).length).toFixed(1)
                : '0'
              return (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-[#d4af37]/10 text-[#d4af37] text-xs font-bold">{movies} فيلم</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#e6c65a]/10 text-[#e6c65a] text-xs font-bold">{series} مسلسل</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#c9a227]/10 text-[#c9a227] text-xs font-bold">{anime} أنمي</span>
                  <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold">متوسط {avgRating}</span>
                </div>
              )
            })()}
          </div>

          {/* Print Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#d4af37]/30">
                  <th className="text-right py-2.5 px-2 text-[#d4af37] font-bold text-xs w-8">#</th>
                  <th className="text-right py-2.5 px-2 text-[#d4af37] font-bold text-xs">العنوان</th>
                  <th className="text-right py-2.5 px-2 text-[#d4af37] font-bold text-xs w-16">النوع</th>
                  <th className="text-right py-2.5 px-2 text-[#d4af37] font-bold text-xs w-12">السنة</th>
                  <th className="text-right py-2.5 px-2 text-[#d4af37] font-bold text-xs w-20">التصنيفات</th>
                  <th className="text-right py-2.5 px-2 text-[#d4af37] font-bold text-xs w-16">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrintItems.map((item, idx) => {
                  const typeConf = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie
                  return (
                    <tr key={item.id} className={`border-b border-[#1a1a1a] ${idx % 2 === 0 ? 'bg-[#111]' : 'bg-transparent'}`}>
                      <td className="py-2 px-2 text-[#555] text-xs font-mono">{idx + 1}</td>
                      <td className="py-2 px-2 font-bold text-white text-sm">{item.title}</td>
                      <td className="py-2 px-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-l ${typeConf.color} text-black`}>
                          {typeConf.label}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[#888] text-xs">{item.year}</td>
                      <td className="py-2 px-2 text-[#666] text-xs">{(item.genres || []).slice(0, 2).join(' • ')}</td>
                      <td className="py-2 px-2">
                        {item.userRating != null ? (
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getRatingBarColor(item.userRating)}`}
                                style={{ width: `${item.userRating}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${getRatingColor(item.userRating)}`}>{formatRating(item.userRating)}</span>
                          </div>
                        ) : (
                          <span className="text-[#444]">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Print Footer */}
          <div className="print-only text-center mt-8 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-400">HussamVision - {new Date().toLocaleDateString('ar-SA')}</p>
          </div>
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
        {/* Watchlist Tab */}
        {mainTab === 'watchlist' && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex items-center gap-2 mobile-tabs-scroll">
              {['all', 'movie', 'series', 'anime'].map(type => {
                const conf = TYPE_CONFIG[type]
                const Icon = conf.icon
                return (
                  <button
                    key={type}
                    onClick={() => setWlType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      wlType === type
                        ? `bg-gradient-to-l ${conf.color} text-black`
                        : 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a] hover:border-[#d4af37]/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {conf.label}
                  </button>
                )
              })}
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm text-[#888]">
                {wlTotal} عمل
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => openAddForm(wlType !== 'all' ? wlType : 'movie')}
                  className="bg-gradient-to-l from-[#d4af37] to-[#b8960f] text-black h-9 px-3 text-xs font-bold gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">إضافة</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-[#888] hover:text-[#d4af37] h-9 w-9 p-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-[#888] hover:text-[#d4af37] h-9 w-9 p-0">
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-[#1a1a1a] border-[#2a2a2a]" align="start">
                    <div className="space-y-1">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); }}
                          className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                            sortBy === opt.value ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-[#ccc] hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="text-[#888] hover:text-[#d4af37] h-9 w-9 p-0"
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
                <Select value={filterGenre} onValueChange={setFilterGenre}>
                  <SelectTrigger className="w-32 bg-[#0a0a0a] border-[#2a2a2a] text-sm">
                    <SelectValue placeholder="التصنيف" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="all">الكل</SelectItem>
                    {allGenres.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-24 bg-[#0a0a0a] border-[#2a2a2a] text-sm">
                    <SelectValue placeholder="السنة" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="all">الكل</SelectItem>
                    {allYears.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={filterRatingMin}
                  onChange={(e) => setFilterRatingMin(e.target.value)}
                  placeholder="تقييم من"
                  className="w-20 bg-[#0a0a0a] border-[#2a2a2a] text-sm"
                  type="number"
                />
                <Input
                  value={filterRatingMax}
                  onChange={(e) => setFilterRatingMax(e.target.value)}
                  placeholder="تقييم إلى"
                  className="w-20 bg-[#0a0a0a] border-[#2a2a2a] text-sm"
                  type="number"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterGenre(''); setFilterYear(''); setFilterRatingMin(''); setFilterRatingMax('') }}
                  className="text-[#888] text-xs"
                >
                  مسح الفلاتر
                </Button>
              </div>
            )}

            {/* Items */}
            {wlLoading && wlItems.length === 0 ? (
              <SkeletonGrid count={6} />
            ) : processedWlItems.length === 0 ? (
              <div className="text-center py-16">
                <Bookmark className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <p className="text-[#888] text-lg mb-2">لا توجد أعمال</p>
                <p className="text-[#666] text-sm">أضف أعمالاً جديدة لمتابعتها</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
                    {processedWlItems.map(item => (
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
                    {processedWlItems.map(item => (
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
                <div ref={loadMoreRef} className="h-4" />
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
              <Button
                variant="outline"
                size="sm"
                onClick={openPrintPreview}
                className="border-[#2a2a2a] text-[#d4af37] hover:bg-[#d4af37]/10 text-xs shrink-0"
              >
                <Printer className="w-3.5 h-3.5 ml-1" />
                طباعة
              </Button>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-[#888] hover:text-[#d4af37] h-9 w-9 p-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-[#888] hover:text-[#d4af37] h-9 w-9 p-0">
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-[#1a1a1a] border-[#2a2a2a]" align="start">
                    <div className="space-y-1">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value) }}
                          className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                            sortBy === opt.value ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-[#ccc] hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
                <Select value={filterGenre} onValueChange={setFilterGenre}>
                  <SelectTrigger className="w-32 bg-[#0a0a0a] border-[#2a2a2a] text-sm">
                    <SelectValue placeholder="التصنيف" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="all">الكل</SelectItem>
                    {allGenres.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-24 bg-[#0a0a0a] border-[#2a2a2a] text-sm">
                    <SelectValue placeholder="السنة" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="all">الكل</SelectItem>
                    {allYears.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={filterRatingMin}
                  onChange={(e) => setFilterRatingMin(e.target.value)}
                  placeholder="تقييم من"
                  className="w-20 bg-[#0a0a0a] border-[#2a2a2a] text-sm"
                  type="number"
                />
                <Input
                  value={filterRatingMax}
                  onChange={(e) => setFilterRatingMax(e.target.value)}
                  placeholder="تقييم إلى"
                  className="w-20 bg-[#0a0a0a] border-[#2a2a2a] text-sm"
                  type="number"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterGenre(''); setFilterYear(''); setFilterRatingMin(''); setFilterRatingMax('') }}
                  className="text-[#888] text-xs"
                >
                  مسح الفلاتر
                </Button>
              </div>
            )}

            {/* Items - Always list view for ratings, no posters */}
            {rtLoading && rtItems.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl skeleton-shimmer" />
                ))}
              </div>
            ) : processedRtItems.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <p className="text-[#888] text-lg mb-2">لا توجد تقييمات</p>
                <p className="text-[#666] text-sm">قيّم أعمالاً لتظهر هنا</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  {processedRtItems.map((item, idx) => {
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
                          <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#666]">{item.year}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-l ${typeConf.color} text-black`}>{typeConf.label}</span>
                            {item.genres && item.genres.length > 0 && (
                              <span className="text-[10px] text-[#555] truncate max-w-[100px]">{item.genres[0]}</span>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        {item.userRating != null ? (
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border shrink-0 ${getRatingBg(item.userRating)}`}>
                            <span className={`font-black text-base ${getRatingColor(item.userRating)}`}>{formatRating(item.userRating)}</span>
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
                <div ref={loadMoreRef} className="h-4" />
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

      {/* FAB - Print button (ratings tab only, on mobile) */}
      {mainTab === 'ratings' && isMobile && (
        <div className="fixed bottom-6 right-6 z-30 safe-bottom">
          <Button
            onClick={openPrintPreview}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-black shadow-lg shadow-[#d4af37]/20 active:scale-95 transition-transform"
            size="icon"
          >
            <Printer className="w-6 h-6" />
          </Button>
        </div>
      )}

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

      {/* Print Preview Overlay */}
      {printPreviewOverlay}
    </div>
  )
}
