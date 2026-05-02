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
  Plus, Star, Check, X, Eye, EyeOff, Search, Loader2, Edit3, Grid3X3, List,
  Filter, ArrowUpDown, Download, Upload as UploadIcon, BarChart3, CalendarDays, Bookmark,
  Heart, Settings, Trash2, Cloud, CloudOff, ArrowRight, Gamepad2, Monitor, Smartphone
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
  genres: string[] | string
  episodes?: number | null
  seasons?: number | null
  duration?: string | null
  status?: string | null
  author?: string | null
  pages?: number | null
  tags: string[] | string
  notes: string
  favorite: boolean
  watched: boolean
  watchedAt?: string | null
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
  platform?: string
}

// ==================== Tab Config ====================
const TAB_CONFIG: Record<string, { icon: typeof Gamepad2; label: string; plural: string; color: string; bgColor: string; platform: string }> = {
  all: { icon: Gamepad2, label: 'الكل', plural: 'جميع الألعاب', color: 'from-teal-500 to-cyan-500', bgColor: 'bg-teal-500/10', platform: '' },
  pc: { icon: Monitor, label: 'PC', plural: 'ألعاب PC', color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-500/10', platform: 'PC' },
  console: { icon: Gamepad2, label: 'كونسول', plural: 'ألعاب كونسول', color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-500/10', platform: 'Console' },
  mobile: { icon: Smartphone, label: 'موبايل', plural: 'ألعاب موبايل', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/10', platform: 'Mobile' },
}

// ==================== Constants ====================
const SORT_OPTIONS = [
  { value: 'addedAt_desc', label: 'أضيف مؤخراً' },
  { value: 'addedAt_asc', label: 'أضيف أولاً' },
  { value: 'title_asc', label: 'العنوان أ-ي' },
  { value: 'title_desc', label: 'العنوان ي-أ' },
  { value: 'year_desc', label: 'السنة (جديد)' },
  { value: 'year_asc', label: 'السنة (قديم)' },
  { value: 'userRating_desc', label: 'تقييمي (أعلى)' },
  { value: 'userRating_asc', label: 'تقييمي (أدنى)' },
  { value: 'rating_desc', label: 'التقييم العام (أعلى)' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'unplayed', label: 'لم ألعبها' },
  { value: 'played', label: 'لعبتها' },
  { value: 'favorite', label: 'المفضلة' },
]

const PLATFORM_OPTIONS = [
  { value: 'PC', label: 'PC' },
  { value: 'Console', label: 'كونسول' },
  { value: 'Mobile', label: 'موبايل' },
  { value: 'Mac', label: 'Mac' },
  { value: 'Linux', label: 'Linux' },
]

// ==================== Helpers ====================
function normalizeGenres(genres: string[] | string): string[] {
  if (Array.isArray(genres)) return genres
  if (typeof genres === 'string' && genres.trim()) return genres.split(',').map(g => g.trim()).filter(Boolean)
  return []
}

function normalizeTags(tags: string[] | string): string[] {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string' && tags.trim()) return tags.split(',').map(t => t.trim()).filter(Boolean)
  return []
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
          width *= ratio
          height *= ratio
        }
        canvas.width = width
        canvas.height = height
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

function getRatingColor(rating: number) {
  if (rating >= 7) return 'text-teal-400'
  if (rating >= 4) return 'text-yellow-400'
  return 'text-red-400'
}

function getRatingBg(rating: number) {
  if (rating >= 7) return 'bg-teal-500/20 border-teal-500/30 text-teal-400'
  if (rating >= 4) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
  return 'bg-red-500/20 border-red-500/30 text-red-400'
}

function getPlatformBadge(item: MediaItem): { label: string; color: string } | null {
  const platform = (item.author || '').toLowerCase()
  if (platform.includes('pc') || platform.includes('windows')) return { label: 'PC', color: 'from-blue-500 to-indigo-500' }
  if (platform.includes('console') || platform.includes('playstation') || platform.includes('xbox') || platform.includes('nintendo')) return { label: 'كونسول', color: 'from-purple-500 to-violet-500' }
  if (platform.includes('mobile') || platform.includes('android') || platform.includes('ios')) return { label: 'موبايل', color: 'from-orange-500 to-red-500' }
  if (platform.includes('mac')) return { label: 'Mac', color: 'from-gray-500 to-gray-600' }
  if (platform.includes('linux')) return { label: 'Linux', color: 'from-yellow-500 to-orange-500' }
  if (platform) return { label: item.author || '', color: 'from-teal-500 to-cyan-500' }
  return null
}

function itemMatchesTab(item: MediaItem, tabKey: string): boolean {
  const platform = TAB_CONFIG[tabKey]?.platform
  if (!platform) return true
  const author = (item.author || '').toLowerCase()
  if (platform === 'PC') return author.includes('pc') || author.includes('windows') || author.includes('mac') || author.includes('linux')
  if (platform === 'Console') return author.includes('console') || author.includes('playstation') || author.includes('xbox') || author.includes('nintendo') || author.includes('ps') || author.includes('switch')
  if (platform === 'Mobile') return author.includes('mobile') || author.includes('android') || author.includes('ios')
  return true
}

// ==================== Skeleton Grid ====================
function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse" />
      ))}
    </div>
  )
}

// ==================== Rating Stars ====================
function RatingStars({ rating, onChange, size = 'sm' }: { rating: number | null; onChange?: (r: number) => void; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  const maxRating = 10
  const displayRating = rating ?? 0

  if (!onChange) {
    return (
      <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${i < displayRating ? 'text-teal-400 fill-teal-400' : 'text-[#333]'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 flex-wrap" dir="ltr">
      {Array.from({ length: maxRating }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1 === rating ? 0 : i + 1)}
          className="active:scale-[0.9] transition-transform"
        >
          <Star
            className={`${sizeClass} ${i < (rating ?? 0) ? 'text-teal-400 fill-teal-400' : 'text-[#333] hover:text-teal-400/50'} transition-colors`}
          />
        </button>
      ))}
      {rating != null && (
        <span className="text-sm font-bold text-teal-400 mr-1">{rating}/10</span>
      )}
    </div>
  )
}

// ==================== Memoized Card ====================
interface GameCardProps {
  item: MediaItem
  onClick: () => void
  onToggleFavorite: () => void
  onTogglePlayed: () => void
  onQuickRate: () => void
  viewMode: 'grid' | 'list'
}

const GameCard = React.memo(function GameCard({ item, onClick, onToggleFavorite, onTogglePlayed, onQuickRate, viewMode }: GameCardProps) {
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
              <span className={`text-xs font-bold ${getRatingColor(item.userRating)}`}>
                {item.userRating}/10
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          {item.favorite && <Heart className="w-4 h-4 text-red-400 fill-red-400" />}
          {item.watched && <Check className="w-4 h-4 text-teal-400" />}
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
        {/* Badges overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {item.favorite && (
            <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            </div>
          )}
          {item.watched && (
            <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-teal-400" />
            </div>
          )}
        </div>
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
            <div className={`text-lg font-bold ${getRatingColor(item.userRating)}`}>
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
            onClick={onToggleFavorite}
            className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:scale-110 transition-transform"
            title={item.favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Heart className={`w-5 h-5 ${item.favorite ? 'text-red-400 fill-red-400' : ''}`} />
          </button>
          <button
            onClick={onTogglePlayed}
            className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:scale-110 transition-transform"
            title={item.watched ? 'إلغاء اللعب' : 'لعبتها'}
          >
            {item.watched ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // Data
  const [games, setGames] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  // UI
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('addedAt_desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filterGenre, setFilterGenre] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

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
    favorite: 'false', watched: 'false', watchedAt: '', userRating: '',
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
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

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

  // ==================== Fetch Games ====================
  const fetchGames = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('type', 'game')
      params.set('limit', '100')
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      setGames(data.items || [])
    } catch {
      toast.error('خطأ في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (!isAuthChecked) return
    fetchGames()
  }, [isAuthChecked, fetchGames])

  // ==================== CRUD ====================
  const createItem = async () => {
    if (!formData.title.trim()) {
      toast.error('العنوان مطلوب')
      return
    }
    setFormSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        title: formData.title,
        originalTitle: formData.originalTitle || null,
        year: formData.year || '',
        type: 'game',
        poster: formData.poster || null,
        rating: formData.rating || null,
        overview: formData.overview || null,
        genres: formData.genres,
        author: formData.author || null,
        tags: formData.tags,
        notes: formData.notes,
        favorite: formData.favorite === 'true',
        watched: formData.watched === 'true',
        watchedAt: formData.watchedAt || null,
        userRating: formData.userRating ? parseFloat(formData.userRating) : null,
        rewatch: formData.rewatch === 'true',
        ratingStatus: formData.ratingStatus || 'watched',
      }
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
      const body: Record<string, unknown> = {
        title: formData.title,
        originalTitle: formData.originalTitle || null,
        year: formData.year || '',
        type: 'game',
        poster: formData.poster || null,
        rating: formData.rating || null,
        overview: formData.overview || null,
        genres: formData.genres,
        author: formData.author || null,
        tags: formData.tags,
        notes: formData.notes,
        favorite: formData.favorite === 'true',
        watched: formData.watched === 'true',
        watchedAt: formData.watchedAt || null,
        userRating: formData.userRating ? parseFloat(formData.userRating) : null,
        rewatch: formData.rewatch === 'true',
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
      fetchGames()
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
      fetchGames()
    } catch {
      toast.error('خطأ في الحذف')
    }
  }

  const toggleFavorite = async (item: MediaItem) => {
    try {
      const res = await fetch(`/api/watchlist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !item.favorite }),
      })
      if (!res.ok) throw new Error('خطأ')
      const updated = await res.json()
      setGames(prev => prev.map(i => i.id === item.id ? { ...i, favorite: !i.favorite } : i))
      if (selectedItem?.id === item.id) setSelectedItem(updated)
      toast.success(!item.favorite ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة')
    } catch {
      toast.error('خطأ في التحديث')
    }
  }

  const togglePlayed = async (item: MediaItem) => {
    try {
      const res = await fetch(`/api/watchlist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watched: !item.watched, watchedAt: !item.watched ? new Date().toISOString().split('T')[0] : null }),
      })
      if (!res.ok) throw new Error('خطأ')
      const updated = await res.json()
      setGames(prev => prev.map(i => i.id === item.id ? { ...i, watched: !i.watched, watchedAt: !i.watched ? new Date().toISOString().split('T')[0] : null } : i))
      if (selectedItem?.id === item.id) setSelectedItem(updated)
      toast.success(!item.watched ? 'تم تحديد كملعوبة' : 'تم إلغاء تحديد اللعب')
    } catch {
      toast.error('خطأ في التحديث')
    }
  }

  const setUserRating = async (item: MediaItem, rating: number) => {
    try {
      const res = await fetch(`/api/watchlist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRating: rating, watched: true, watchedAt: new Date().toISOString().split('T')[0] }),
      })
      if (!res.ok) throw new Error('خطأ')
      const updated = await res.json()
      setGames(prev => prev.map(i => i.id === item.id ? { ...i, userRating: rating, watched: true } : i))
      if (selectedItem?.id === item.id) setSelectedItem(updated)
      toast.success(`تم التقييم: ${rating}/10`)
    } catch {
      toast.error('خطأ في التقييم')
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
      favorite: 'false', watched: 'false', watchedAt: '', userRating: '',
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
    const itemGenres = normalizeGenres(item.genres)
    const itemTags = normalizeTags(item.tags)
    setFormData({
      title: item.title || '',
      originalTitle: item.originalTitle || '',
      year: item.year || '',
      type: 'game',
      poster: item.poster || '',
      rating: item.rating || '',
      overview: item.overview || '',
      genres: itemGenres.join(', '),
      author: item.author || '',
      tags: itemTags.join(', '),
      notes: item.notes || '',
      favorite: item.favorite ? 'true' : 'false',
      watched: item.watched ? 'true' : 'false',
      watchedAt: item.watchedAt || '',
      userRating: item.userRating != null ? String(item.userRating) : '',
      rewatch: item.rewatch ? 'true' : 'false',
      ratingStatus: item.ratingStatus || 'watched',
    })
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
      let aVal: string | number | null = ''
      let bVal: string | number | null = ''
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
      // Tab filter
      if (!itemMatchesTab(item, activeTab)) return false
      // Genre filter
      if (filterGenre && !normalizeGenres(item.genres).some(g => g.toLowerCase().includes(filterGenre.toLowerCase()))) return false
      // Year filter
      if (filterYear && item.year !== filterYear) return false
      // Status filter
      if (filterStatus === 'played' && !item.watched) return false
      if (filterStatus === 'unplayed' && item.watched) return false
      if (filterStatus === 'favorite' && !item.favorite) return false
      return true
    })
  }, [activeTab, filterGenre, filterYear, filterStatus])

  const processedItems = useMemo(() => {
    return filterItems(sortItems(games))
  }, [games, sortItems, filterItems])

  // ==================== Unique genres/years for filters ====================
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>()
    games.forEach(g => normalizeGenres(g.genres).forEach(genre => { if (genre.trim()) genreSet.add(genre.trim()) }))
    return Array.from(genreSet).sort()
  }, [games])

  const allYears = useMemo(() => {
    const yearSet = new Set<string>()
    games.forEach(g => { if (g.year) yearSet.add(g.year) })
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a))
  }, [games])

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
    const played = games.filter(g => g.watched).length
    const unplayed = total - played
    const favorites = games.filter(g => g.favorite).length
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
    return { total, played, unplayed, favorites, avgRating, topGenre, topRated, platformCounts }
  }, [games, allGenres])

  // ==================== Export/Import ====================
  const exportData = async () => {
    try {
      const params = new URLSearchParams()
      params.set('type', 'game')
      params.set('limit', '1000')
      const res = await fetch(`/api/watchlist?${params}`)
      const data = await res.json()
      const items = data.items || []
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hussamvision-games-${new Date().toISOString().split('T')[0]}.json`
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
            type: 'game',
            poster: item.poster || null,
            rating: item.rating || null,
            overview: item.overview || null,
            genres: Array.isArray(item.genres) ? item.genres.join(', ') : (item.genres || ''),
            author: item.author || null,
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
            notes: item.notes || '',
            favorite: item.favorite || false,
            watched: item.watched || false,
            watchedAt: item.watchedAt || null,
            userRating: item.userRating != null ? item.userRating : null,
            rewatch: item.rewatch || false,
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
      toast.success(`تم استيراد ${imported} لعبة (${duplicates} مكرر)`)
      fetchGames()
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
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">العنوان *</label>
          <Input
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="عنوان اللعبة"
            className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
          />
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
            <Input
              value={formData.year}
              onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
              placeholder="2024"
              className="bg-[#111] border-[#333] text-white placeholder:text-[#555]"
            />
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

        {/* Poster */}
        <div className="space-y-1">
          <label className="text-xs text-[#999]">صورة الغلاف</label>
          <div className="flex gap-2 items-center">
            <Input
              value={formData.poster}
              onChange={e => setFormData(prev => ({ ...prev, poster: e.target.value }))}
              placeholder="رابط الصورة"
              className="bg-[#111] border-[#333] text-white placeholder:text-[#555] flex-1"
              dir="ltr"
            />
            <Button
              type="button"
              variant="outline"
              className="border-[#333] text-[#999] hover:text-white shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          {formData.poster && (
            <div className="mt-2">
              <img src={formData.poster} alt="preview" className="w-16 h-20 rounded-lg object-cover border border-[#333]" />
            </div>
          )}
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

        {/* Checkboxes */}
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform">
            <input
              type="checkbox"
              checked={formData.favorite === 'true'}
              onChange={e => setFormData(prev => ({ ...prev, favorite: e.target.checked ? 'true' : 'false' }))}
              className="accent-teal-500 w-4 h-4"
            />
            <span className="text-sm text-[#ccc]">المفضلة</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform">
            <input
              type="checkbox"
              checked={formData.watched === 'true'}
              onChange={e => setFormData(prev => ({ ...prev, watched: e.target.checked ? 'true' : 'false' }))}
              className="accent-teal-500 w-4 h-4"
            />
            <span className="text-sm text-[#ccc]">لعبتها</span>
          </label>
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
              {selectedItem.watched && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">✓ لعبتها</Badge>}
              {selectedItem.favorite && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">♥ مفضلة</Badge>}
            </div>
            {selectedItem.rating && (
              <div className="mt-2 text-sm text-[#aaa]">التقييم العام: <span className="text-teal-400 font-bold">{selectedItem.rating}</span></div>
            )}
            {selectedItem.userRating != null && (
              <div className="mt-1">
                <span className="text-sm text-[#aaa]">تقييمي: </span>
                <span className={`text-sm font-bold ${getRatingColor(selectedItem.userRating)}`}>{selectedItem.userRating}/10</span>
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
          {selectedItem.watchedAt && <p>تاريخ اللعب: {new Date(selectedItem.watchedAt).toLocaleDateString('ar-SA')}</p>}
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
            onClick={() => toggleFavorite(selectedItem)}
            className={`border-[#333] text-sm ${selectedItem.favorite ? 'text-red-400 border-red-400/30' : 'text-[#999]'}`}
          >
            <Heart className={`w-4 h-4 ml-1 ${selectedItem.favorite ? 'fill-red-400' : ''}`} />
            {selectedItem.favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          </Button>
          <Button
            variant="outline"
            onClick={() => togglePlayed(selectedItem)}
            className={`border-[#333] text-sm ${selectedItem.watched ? 'text-teal-400 border-teal-400/30' : 'text-[#999]'}`}
          >
            {selectedItem.watched ? <EyeOff className="w-4 h-4 ml-1" /> : <Eye className="w-4 h-4 ml-1" />}
            {selectedItem.watched ? 'إلغاء اللعب' : 'لعبتها'}
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
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-teal-400">{stats.total}</div>
            <div className="text-xs text-[#888]">إجمالي الألعاب</div>
          </div>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.played}</div>
            <div className="text-xs text-[#888]">لعبتها</div>
          </div>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.unplayed}</div>
            <div className="text-xs text-[#888]">لم ألعبها</div>
          </div>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.favorites}</div>
            <div className="text-xs text-[#888]">المفضلة</div>
          </div>
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
                <div className={`text-sm font-bold ${getRatingColor(stats.topRated.userRating ?? 0)}`}>{stats.topRated.userRating}/10</div>
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
        <div className="max-w-7xl mx-auto px-4 py-3">
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
                <p className="text-xs text-[#666]">{TAB_CONFIG[activeTab]?.plural} • {processedItems.length} لعبة</p>
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
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                className="text-[#999] hover:text-teal-400 active:scale-[0.97] transition-transform"
                title={viewMode === 'grid' ? 'عرض قائمة' : 'عرض شبكة'}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
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
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="border-[#2a2a2a] text-[#999] hover:text-white active:scale-[0.97] transition-transform shrink-0">
                  <Filter className="w-4 h-4 ml-1" />
                  {(filterGenre || filterYear || filterStatus !== 'all') && <span className="w-2 h-2 rounded-full bg-teal-400" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-[#1a1a1a] border-[#2a2a2a] w-64" align="end" dir="rtl">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#999]">الحالة</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="bg-[#111] border-[#333] text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333]">
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-white focus:bg-[#2a2a2a] focus:text-white">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#999]">السنة</label>
                    <Select value={filterYear} onValueChange={setFilterYear}>
                      <SelectTrigger className="bg-[#111] border-[#333] text-white text-sm">
                        <SelectValue placeholder="كل السنوات" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333]">
                        <SelectItem value="all" className="text-white focus:bg-[#2a2a2a] focus:text-white">كل السنوات</SelectItem>
                        {allYears.map(y => (
                          <SelectItem key={y} value={y} className="text-white focus:bg-[#2a2a2a] focus:text-white">{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#999]">التصنيف</label>
                    <Select value={filterGenre} onValueChange={setFilterGenre}>
                      <SelectTrigger className="bg-[#111] border-[#333] text-white text-sm">
                        <SelectValue placeholder="كل التصنيفات" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#333]">
                        <SelectItem value="all" className="text-white focus:bg-[#2a2a2a] focus:text-white">كل التصنيفات</SelectItem>
                        {allGenres.map(g => (
                          <SelectItem key={g} value={g} className="text-white focus:bg-[#2a2a2a] focus:text-white">{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#333] text-[#999] hover:text-white text-xs"
                    onClick={() => { setFilterGenre(''); setFilterYear(''); setFilterStatus('all'); setShowFilters(false) }}
                  >
                    مسح الفلاتر
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[#111] border-[#2a2a2a] text-[#999] hover:text-white w-auto min-w-[40px] shrink-0">
                <ArrowUpDown className="w-4 h-4" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]" dir="rtl">
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white focus:bg-[#2a2a2a] focus:text-white">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <SkeletonGrid count={8} />
        ) : processedItems.length === 0 ? (
          <div className="text-center py-20">
            <Gamepad2 className="w-16 h-16 text-[#333] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#666]">لا توجد ألعاب</h3>
            <p className="text-sm text-[#555] mt-1">
              {debouncedSearch ? 'لم يتم العثور على نتائج' : 'أضف ألعابك المفضلة للعبها لاحقاً'}
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
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4'
            : 'space-y-2'
          }>
            {processedItems.map(item => (
              <GameCard
                key={item.id}
                item={item}
                onClick={() => openDetails(item)}
                onToggleFavorite={() => toggleFavorite(item)}
                onTogglePlayed={() => togglePlayed(item)}
                onQuickRate={() => openQuickRate(item)}
                viewMode={viewMode}
              />
            ))}
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
                  <RatingStars rating={selectedItem.userRating} onChange={handleQuickRate} size="lg" />
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
                  <RatingStars rating={selectedItem.userRating} onChange={handleQuickRate} size="lg" />
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
