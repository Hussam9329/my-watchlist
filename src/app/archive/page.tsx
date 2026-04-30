'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import { Plus, Film, Tv, Sparkles, Star, Check, X, Eye, EyeOff, Image as ImageIcon, Search, Loader2, Edit3, Grid3X3, List, Filter, ArrowUpDown, Download, Upload as UploadIcon, BarChart3, CalendarDays, Bookmark, Heart, Settings, Trash2, Cloud, CloudOff, ArrowRight, Dice5 } from 'lucide-react'

interface MediaItem { id: string; title: string; originalTitle?: string; year: string; type: string; poster: string; rating: string; overview: string; genres: string[]; episodes?: number; seasons?: number; duration?: string; status?: string; author?: string; pages?: number; tags: string[]; notes: string; favorite: boolean; addedAt: string; watchedAt?: string; watched: boolean; userRating?: number }
interface SearchResult { title: string; originalTitle: string; year: string; rating: string; overview: string; poster?: string; genres: string[]; episodes?: number; seasons?: number; duration?: string; status?: string; author?: string; pages?: number }
type TabType = 'all' | 'anime' | 'series' | 'movie'
type MainTab = 'watchlist' | 'ratings'
type ViewMode = 'grid' | 'list'
type SortBy = 'addedAt' | 'title' | 'year' | 'rating' | 'userRating'
type SortOrder = 'asc' | 'desc'

const TYPE_CONFIG: Record<TabType | 'book', { icon: typeof Film; label: string; plural: string; color: string; bgColor: string }> = {
  book: { icon: Bookmark, label: 'كتاب', plural: 'كتب', color: 'from-[#8B4513] to-[#654321]', bgColor: 'bg-[#8B4513]/10' },
  all: { icon: Bookmark, label: 'الكل', plural: 'جميع الأعمال', color: 'from-[#d4af37] to-[#b8960f]', bgColor: 'bg-[#d4af37]/10' },
  anime: { icon: Sparkles, label: 'أنمي', plural: 'أنميات', color: 'from-[#c9a227] to-[#a07d00]', bgColor: 'bg-[#c9a227]/10' },
  series: { icon: Tv, label: 'مسلسل', plural: 'مسلسلات', color: 'from-[#e6c65a] to-[#c9a227]', bgColor: 'bg-[#e6c65a]/10' },
  movie: { icon: Film, label: 'فيلم', plural: 'أفلام', color: 'from-[#d4af37] to-[#b8960f]', bgColor: 'bg-[#d4af37]/10' }
}

const YEARS_RANGE = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())
const PAGE_SIZE = 20

const getDisplayTitle = (item: MediaItem): string => item.originalTitle || item.title || ''

const compressImage = (file: File, maxWidth = 400, maxHeight = 600, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) { const ratio = Math.min(maxWidth / width, maxHeight / height); width *= ratio; height *= ratio }
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

function formatRating(num: number | null | undefined) {
  if (num == null) return '-'
  const n = Math.round(Number(num) * 100) / 100
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function getRatingClass(rating: number) {
  if (rating >= 70) return 'text-green-400'
  if (rating >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

export default function HussamArchivePage() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mainTab, setMainTab] = useState<MainTab>('watchlist')
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [watchList, setWatchList] = useState<MediaItem[]>([])
  const [ratedList, setRatedList] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [addType, setAddType] = useState<'movie' | 'series' | 'anime'>('movie')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('addedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterRating, setFilterRating] = useState<[number, number]>([0, 10])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterGenre, setFilterGenre] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [metaSearchQuery, setMetaSearchQuery] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [formData, setFormData] = useState({ title: '', originalTitle: '', year: new Date().getFullYear().toString(), rating: '', overview: '', genres: '', episodes: '', seasons: '', duration: '', status: '', author: '', pages: '', tags: '', notes: '', poster: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Pagination state for watchlist
  const [wlPage, setWlPage] = useState(1)
  const [wlTotal, setWlTotal] = useState(0)
  const [wlHasMore, setWlHasMore] = useState(false)

  // Pagination state for ratings
  const [rtPage, setRtPage] = useState(1)
  const [rtTotal, setRtTotal] = useState(0)
  const [rtHasMore, setRtHasMore] = useState(false)

  // Ratings stats
  const [ratingsStats, setRatingsStats] = useState<any>(null)

  // Infinite scroll observer
  const loaderRef = useRef<HTMLDivElement>(null)

  // Auth check
  useEffect(() => {
    const auth = localStorage.getItem('hussamvision_auth')
    if (auth !== 'true') {
      window.location.href = '/'
      return
    }
    setIsAuthenticated(true)
  }, [])

  // Fetch watchlist (unrated items) with pagination
  const fetchWatchList = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setSyncStatus('syncing')
      else setIsLoadingMore(true)
      const response = await fetch(`/api/watchlist?hasRating=false&page=${page}&limit=${PAGE_SIZE}`)
      const data = await response.json()
      const items = (data.items || []).filter((i: any) => i.type !== 'book' && i.type !== 'game' && (i.userRating === null || i.userRating === undefined))
      if (append) {
        setWatchList(prev => [...prev, ...items])
      } else {
        setWatchList(items)
      }
      setWlTotal(data.total || 0)
      setWlHasMore(data.hasMore || false)
      setWlPage(page)
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Fetch rated items with pagination
  const fetchRatedList = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setSyncStatus('syncing')
      else setIsLoadingMore(true)
      const response = await fetch(`/api/watchlist?hasRating=true&page=${page}&limit=${PAGE_SIZE}`)
      const data = await response.json()
      const items = (data.items || []).filter((i: any) => i.type !== 'book' && i.type !== 'game')
      if (append) {
        setRatedList(prev => [...prev, ...items])
      } else {
        setRatedList(items)
      }
      setRtTotal(data.total || 0)
      setRtHasMore(data.hasMore || false)
      setRtPage(page)
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Fetch ratings stats
  const fetchRatingsStats = useCallback(async () => {
    try {
      const res = await fetch('/api/ratings-stats')
      const data = await res.json()
      setRatingsStats(data)
    } catch {}
  }, [])

  // Initial load
  useEffect(() => {
    if (!isAuthenticated) return
    if (mainTab === 'watchlist') {
      fetchWatchList(1)
    } else {
      fetchRatedList(1)
      fetchRatingsStats()
    }
  }, [isAuthenticated, mainTab])

  useEffect(() => { if (activeTab !== 'all') setAddType(activeTab as typeof addType) }, [activeTab])

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          if (mainTab === 'watchlist' && wlHasMore) {
            fetchWatchList(wlPage + 1, true)
          } else if (mainTab === 'ratings' && rtHasMore) {
            fetchRatedList(rtPage + 1, true)
          }
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [mainTab, wlHasMore, rtHasMore, wlPage, rtPage, isLoadingMore, fetchWatchList, fetchRatedList])

  // Filtered items based on current tab
  const currentList = mainTab === 'watchlist' ? watchList : ratedList

  const allGenres = useMemo(() => {
    const g = new Set<string>()
    currentList.filter(i => i.type !== 'book' && i.type !== 'game').forEach(i => i.genres?.forEach((x: string) => g.add(x)))
    return Array.from(g).sort()
  }, [currentList])

  const filteredItems = useMemo(() => {
    let items = activeTab === 'all' ? currentList.filter(i => i.type !== 'book' && i.type !== 'game') : currentList.filter(i => i.type === activeTab)
    if (activeTab === 'all' && filterType !== 'all') items = items.filter(i => i.type === filterType)
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); items = items.filter(i => i.title.toLowerCase().includes(q) || i.originalTitle?.toLowerCase().includes(q)) }
    if (filterYear !== 'all') items = items.filter(i => i.year === filterYear)
    items = items.filter(i => { const r = parseFloat(i.rating) || 0; return r >= filterRating[0] && r <= filterRating[1] })
    if (filterStatus === 'watched') items = items.filter(i => i.watched)
    else if (filterStatus === 'unwatched') items = items.filter(i => !i.watched)
    else if (filterStatus === 'favorite') items = items.filter(i => i.favorite)
    if (filterGenre !== 'all') items = items.filter(i => i.genres?.includes(filterGenre))
    items.sort((a, b) => {
      let c = 0
      if (sortBy === 'title') c = (a.originalTitle || a.title).localeCompare(b.originalTitle || b.title)
      else if (sortBy === 'year') c = parseInt(a.year) - parseInt(b.year)
      else if (sortBy === 'rating') c = (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0)
      else if (sortBy === 'userRating') c = (a.userRating || 0) - (b.userRating || 0)
      else c = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
      return sortOrder === 'asc' ? c : -c
    })
    return items
  }, [currentList, activeTab, searchQuery, filterYear, filterRating, filterStatus, filterGenre, filterType, sortBy, sortOrder])

  const stats = useMemo(() => {
    const items = activeTab === 'all' ? currentList.filter(i => i.type !== 'book' && i.type !== 'game') : currentList.filter(i => i.type === activeTab)
    return { total: items.length, watched: items.filter(i => i.watched).length, favorite: items.filter(i => i.favorite).length, avgRating: items.reduce((a, i) => a + (parseFloat(i.rating) || 0), 0) / (items.length || 1) }
  }, [currentList, activeTab])

  const tabStats = useMemo(() => ({
    all: { total: currentList.filter(i => i.type !== 'book' && i.type !== 'game').length, watched: currentList.filter(i => i.type !== 'book' && i.type !== 'game' && i.watched).length },
    anime: { total: currentList.filter(i => i.type === 'anime').length, watched: currentList.filter(i => i.type === 'anime' && i.watched).length },
    series: { total: currentList.filter(i => i.type === 'series').length, watched: currentList.filter(i => i.type === 'series' && i.watched).length },
    movie: { total: currentList.filter(i => i.type === 'movie').length, watched: currentList.filter(i => i.type === 'movie' && i.watched).length }
  }), [currentList])

  const handlePosterUpload = useCallback(async (file: File) => { if (file?.type.startsWith('image/')) { try { const c = await compressImage(file); setFormData(p => ({ ...p, poster: c })) } catch {} } }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); handlePosterUpload(e.dataTransfer.files[0]) }, [handlePosterUpload])

  const fetchMetadata = async () => {
    if (!metaSearchQuery.trim()) return
    setIsFetching(true); setSearchResults([]); setSearchError('')
    try {
      const res = await fetch('/api/metadata', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: metaSearchQuery, type: addType }) })
      const data = await res.json()
      if (data.results?.length > 0) { setSearchResults(data.results); setShowResults(true) }
      else setSearchError(data.error || 'لم يتم العثور على نتائج')
    } catch { setSearchError('حدث خطأ') }
    finally { setIsFetching(false) }
  }

  const selectResult = (r: SearchResult) => {
    setFormData(p => ({ ...p, title: r.originalTitle || r.title, originalTitle: r.originalTitle || r.title, year: r.year || p.year, rating: r.rating || '', overview: r.overview || '', poster: r.poster || '', genres: r.genres?.join(', ') || '', episodes: r.episodes?.toString() || '', seasons: r.seasons?.toString() || '', duration: r.duration || '', status: r.status || '', author: r.author || '', pages: r.pages?.toString() || '' }))
    setSearchResults([]); setShowResults(false); setSearchError('')
  }

  const selectAndAdd = async (r: SearchResult) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: r.originalTitle || r.title, originalTitle: r.originalTitle || r.title, year: r.year, type: addType, poster: r.poster || '', rating: r.rating || '', overview: r.overview || '', genres: r.genres?.join(', ') || '', episodes: r.episodes || null, seasons: r.seasons || null, duration: r.duration || '', status: r.status || '', author: r.author || '', pages: r.pages || null, tags: '', notes: '' })
      })
      const newItem = await response.json()
      if (response.status === 409) { toast({ title: 'موجود مسبقاً!', description: newItem.error, variant: 'destructive' }); return }
      if (newItem && newItem.id) {
        setWatchList(prev => [newItem, ...prev])
        setShowAddDialog(false); resetForm()
        toast({ title: 'تمت الإضافة', description: `تم إضافة "${r.originalTitle || r.title}"` })
      }
    } catch { toast({ title: 'خطأ', description: 'حدث خطأ أثناء الإضافة', variant: 'destructive' }) }
  }

  const handleAddItem = async () => {
    if (!formData.originalTitle.trim() && !formData.title.trim()) return
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, originalTitle: formData.originalTitle, year: formData.year, type: addType, poster: formData.poster, rating: formData.rating, overview: formData.overview, genres: formData.genres, episodes: formData.episodes, seasons: formData.seasons, duration: formData.duration, status: formData.status, author: formData.author, pages: formData.pages, tags: formData.tags, notes: formData.notes })
      })
      const newItem = await response.json()
      if (response.status === 409) { toast({ title: 'موجود مسبقاً!', description: newItem.error, variant: 'destructive' }); return }
      if (newItem && newItem.id) {
        setWatchList(prev => [newItem, ...prev])
        setShowAddDialog(false); resetForm()
        toast({ title: 'تمت الإضافة', description: `تم إضافة "${formData.originalTitle || formData.title}"` })
      }
    } catch { toast({ title: 'خطأ', description: 'حدث خطأ أثناء الإضافة', variant: 'destructive' }) }
  }

  const resetForm = () => { setMetaSearchQuery(''); setSearchResults([]); setShowResults(false); setSearchError(''); setFormData({ title: '', originalTitle: '', year: new Date().getFullYear().toString(), rating: '', overview: '', genres: '', episodes: '', seasons: '', duration: '', status: '', author: '', pages: '', tags: '', notes: '', poster: '' }) }

  // Edit dialog only allows editing notes, favorite, poster — NOT rating, year, title etc.
  const openEditDialog = (item: MediaItem) => {
    setEditingItem(item)
    setFormData({ title: item.title, originalTitle: item.originalTitle || '', year: item.year, rating: item.rating, overview: item.overview, genres: item.genres?.join(', ') || '', episodes: item.episodes?.toString() || '', seasons: item.seasons?.toString() || '', duration: item.duration || '', status: item.status || '', author: item.author || '', pages: item.pages?.toString() || '', tags: item.tags?.join(', ') || '', notes: item.notes, poster: item.poster })
    setShowDetails(false); setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    try {
      setSyncStatus('syncing')
      const res = await fetch(`/api/watchlist/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: formData.notes || '', poster: formData.poster || null, favorite: editingItem.favorite, watched: editingItem.watched }) })
      const data = await res.json()
      if (data) {
        if (mainTab === 'watchlist') setWatchList(p => p.map(i => i.id === editingItem.id ? data : i))
        else setRatedList(p => p.map(i => i.id === editingItem.id ? data : i))
        setSyncStatus('synced')
        toast({ title: 'تم التعديل', description: 'تم حفظ التعديلات بنجاح' })
      }
      setShowEditDialog(false); setEditingItem(null); resetForm()
    } catch { setSyncStatus('error'); toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحفظ', variant: 'destructive' }) }
  }

  const removeFromList = async (id: string) => {
    try {
      setSyncStatus('syncing')
      const list = mainTab === 'watchlist' ? watchList : ratedList
      const item = list.find(i => i.id === id)
      await fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
      if (mainTab === 'watchlist') setWatchList(p => p.filter(i => i.id !== id))
      else setRatedList(p => p.filter(i => i.id !== id))
      setSyncStatus('synced')
      if (selectedItem?.id === id) { setShowDetails(false); setSelectedItem(null) }
      toast({ title: 'تم الحذف', description: `تم حذف "${item?.originalTitle || item?.title}"` })
    } catch { setSyncStatus('error'); toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحذف', variant: 'destructive' }) }
  }

  const toggleWatched = async (id: string) => {
    const list = mainTab === 'watchlist' ? watchList : ratedList
    const item = list.find(i => i.id === id)
    if (!item) return
    try {
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ watched: !item.watched }) })
      if (mainTab === 'watchlist') setWatchList(p => p.map(i => i.id === id ? { ...i, watched: !i.watched } : i))
      else setRatedList(p => p.map(i => i.id === id ? { ...i, watched: !i.watched } : i))
      toast({ title: item.watched ? 'لم يُشاهد' : 'تمت المشاهدة', description: item.watched ? 'تم إلغاء حالة المشاهدة' : 'تم تحديده كمشاهد' })
    } catch {}
  }

  const toggleFavorite = async (id: string) => {
    const list = mainTab === 'watchlist' ? watchList : ratedList
    const item = list.find(i => i.id === id)
    if (!item) return
    try {
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ favorite: !item.favorite }) })
      if (mainTab === 'watchlist') setWatchList(p => p.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i))
      else setRatedList(p => p.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i))
      toast({ title: item.favorite ? 'أُزيل من المفضلة' : 'أُضيف للمفضلة', description: item.favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة' })
    } catch {}
  }

  // Rate item from 0-100 — moves it from watchlist to ratings
  const rateItem = async (id: string, rating: number) => {
    try {
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userRating: rating, watched: true }) })
      // Remove from watchlist, add to ratedList
      const item = watchList.find(i => i.id === id)
      if (item) {
        setWatchList(p => p.filter(i => i.id !== id))
        setRatedList(p => [{ ...item, userRating: rating, watched: true }, ...p])
      }
      if (selectedItem?.id === id) { setShowDetails(false); setSelectedItem(null) }
      toast({ title: 'تم التقييم!', description: `تم تقييم "${item?.originalTitle || item?.title}" بـ ${rating}/100 ونقله للتقييمات` })
      fetchRatingsStats()
    } catch {}
  }

  // Update rating for already-rated items
  const updateRating = async (id: string, rating: number) => {
    try {
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userRating: rating }) })
      setRatedList(p => p.map(i => i.id === id ? { ...i, userRating: rating } : i))
      if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, userRating: rating } : prev)
      toast({ title: 'تم تحديث التقييم', description: `التقييم الجديد: ${rating}/100` })
      fetchRatingsStats()
    } catch {}
  }

  const exportData = () => {
    const d = JSON.stringify(mainTab === 'watchlist' ? watchList : ratedList, null, 2)
    const b = new Blob([d], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${mainTab === 'watchlist' ? 'watchlist' : 'ratings'}_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(u)
    toast({ title: 'تم التصدير', description: 'تم تصدير البيانات بنجاح' })
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = async (ev) => { try { const imp = JSON.parse(ev.target?.result as string); if (Array.isArray(imp)) { for (const item of imp) { await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }) } if (mainTab === 'watchlist') fetchWatchList(1); else fetchRatedList(1); toast({ title: 'تم الاستيراد', description: `تم استيراد ${imp.length} عنصر` }) } } catch {} }; r.readAsText(f) }
  }

  const clearFilters = () => { setSearchQuery(''); setFilterYear('all'); setFilterRating([0, 10]); setFilterStatus('all'); setFilterGenre('all'); setFilterType('all') }

  const TypeIcon = TYPE_CONFIG[activeTab].icon

  // Movie Night Picker
  const movieNightPick = () => {
    const rated = ratedList.filter(i => i.type === 'movie' || i.type === 'series' || i.type === 'anime')
    if (!rated.length) { toast({ title: 'ماكو أعمال مقيّمة', description: 'أضف تقييمات أولاً' }); return }
    const picked = rated[Math.floor(Math.random() * rated.length)]
    toast({ title: 'اختيار الليلة', description: `${picked.originalTitle || picked.title} (${picked.year}) - تقييمك: ${formatRating(picked.userRating)}` })
  }

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#d4af37]" /></div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#d4af37]/3 rounded-full" /><div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#b8960f]/3 rounded-full" /></div>
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8" dir="rtl">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <Button onClick={() => { window.location.href = '/' }} variant="ghost" size="icon" className="text-neutral-500 hover:text-white hover:bg-[#1a1a1a]"><ArrowRight className="w-5 h-5" /></Button>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8960f] flex items-center justify-center shadow-lg"><Bookmark className="w-5 h-5 sm:w-7 sm:h-7 text-[#0a0a0a]" /></div>
            <div><h1 className="text-lg sm:text-2xl font-bold">أرشيف حسام</h1><div className="flex items-center gap-2"><p className="text-neutral-500 text-sm">{mainTab === 'watchlist' ? 'قائمة المشاهدة' : 'التقييمات'}</p><span className={`text-xs flex items-center gap-1 ${syncStatus === 'synced' ? 'text-green-500' : syncStatus === 'syncing' ? 'text-yellow-500' : 'text-red-500'}`}>{syncStatus === 'synced' && <Cloud className="w-3 h-3" />}{syncStatus === 'syncing' && <Loader2 className="w-3 h-3 animate-spin" />}{syncStatus === 'error' && <CloudOff className="w-3 h-3" />}{syncStatus === 'synced' ? 'متزامن' : syncStatus === 'syncing' ? 'مزامنة...' : 'خطأ'}</span></div></div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {mainTab === 'ratings' && <Button onClick={movieNightPick} variant="ghost" size="icon" className="text-neutral-400 hover:text-white" title="اختيار الليلة"><Dice5 className="w-5 h-5" /></Button>}
            <Button onClick={() => setShowStats(!showStats)} variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><BarChart3 className="w-5 h-5" /></Button>
            <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><Settings className="w-5 h-5" /></Button></PopoverTrigger><PopoverContent className="w-48 bg-[#1a1a1a] border-[#2a2a2a]"><div className="space-y-2"><Button onClick={exportData} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a]"><Download className="w-4 h-4" />تصدير</Button><Button onClick={() => importInputRef.current?.click()} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a]"><UploadIcon className="w-4 h-4" />استيراد</Button><input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={importData} /></div></PopoverContent></Popover>
            {mainTab === 'watchlist' && <Button onClick={() => { resetForm(); setShowAddDialog(true) }} className="bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold gap-2"><Plus className="w-4 h-4" /><span className="hidden sm:inline">إضافة</span></Button>}
          </div>
        </header>

        {/* Main Tab Switch: أريد مشاهدته | تقييماتي */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => { setMainTab('watchlist'); setSearchQuery(''); clearFilters() }} className={`flex-1 rounded-xl p-3 transition-all text-center ${mainTab === 'watchlist' ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] shadow-lg font-bold' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'}`}>
            <div className="flex items-center justify-center gap-2"><Eye className="w-5 h-5" /><span>أريد مشاهدته</span><span className={`text-xs px-1.5 py-0.5 rounded-full ${mainTab === 'watchlist' ? 'bg-black/20' : 'bg-[#2a2a2a]'}`}>{wlTotal}</span></div>
          </button>
          <button onClick={() => { setMainTab('ratings'); setSearchQuery(''); clearFilters() }} className={`flex-1 rounded-xl p-3 transition-all text-center ${mainTab === 'ratings' ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] shadow-lg font-bold' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'}`}>
            <div className="flex items-center justify-center gap-2"><Star className="w-5 h-5" /><span>تقييماتي</span><span className={`text-xs px-1.5 py-0.5 rounded-full ${mainTab === 'ratings' ? 'bg-black/20' : 'bg-[#2a2a2a]'}`}>{rtTotal}</span></div>
          </button>
        </div>

        {/* Ratings Stats Dashboard */}
        {mainTab === 'ratings' && showStats && ratingsStats && (
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 sm:p-6 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#d4af37]" />إحصائيات التقييمات</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#d4af37]">{ratingsStats.totalRated || 0}</p><p className="text-xs text-neutral-400">إجمالي الأعمال</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#f0d77a]">{ratingsStats.movieCount || 0}</p><p className="text-xs text-neutral-400">أفلام</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#e6c65a]">{ratingsStats.seriesCount || 0}</p><p className="text-xs text-neutral-400">مسلسلات</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#c9a227]">{ratingsStats.animeCount || 0}</p><p className="text-xs text-neutral-400">أنمي</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#d4af37]">{formatRating(ratingsStats.avgRating)}</p><p className="text-xs text-neutral-400">متوسط التقييم</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-sm font-bold text-green-400">{ratingsStats.maxRatingTitle || '-'}</p><p className="text-xs text-neutral-400">أعلى تقييم ({formatRating(ratingsStats.maxRating)})</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#e6c65a]">{ratingsStats.topGenre || '-'}</p><p className="text-xs text-neutral-400">أكثر تصنيف</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#c9a227]">{ratingsStats.topYear || '-'}</p><p className="text-xs text-neutral-400">أكثر سنة</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#d4af37]">{ratingsStats.topDecade || '-'}</p><p className="text-xs text-neutral-400">أكثر عقد</p></div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]"><p className="text-xl font-bold text-[#f0d77a]">{ratingsStats.genreCount || 0}</p><p className="text-xs text-neutral-400">عدد التصنيفات</p></div>
            </div>
          </div>
        )}

        {/* Watchlist Stats */}
        {mainTab === 'watchlist' && showStats && (
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 mb-6"><h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#d4af37]" />إحصائيات {TYPE_CONFIG[activeTab].plural}</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]"><p className="text-2xl font-bold text-[#d4af37]">{stats.total}</p><p className="text-sm text-neutral-400">إجمالي</p></div><div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]"><p className="text-2xl font-bold text-[#f0d77a]">{stats.watched}</p><p className="text-sm text-neutral-400">تمت المشاهدة</p></div><div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]"><p className="text-2xl font-bold text-[#e6c65a]">{stats.favorite}</p><p className="text-sm text-neutral-400">مفضلة</p></div><div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]"><p className="text-2xl font-bold text-[#c9a227]">{stats.avgRating.toFixed(1)}</p><p className="text-sm text-neutral-400">متوسط التقييم</p></div></div></div>
        )}

        {/* Sub-tabs: الكل | أفلام | مسلسلات | أنمي */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto mobile-tabs-scroll pb-1 sm:pb-0">
          {(['all', 'movie', 'series', 'anime'] as TabType[]).map((type) => {
            const c = TYPE_CONFIG[type]; const I = c.icon; const active = activeTab === type
            return <button key={type} onClick={() => setActiveTab(type)} className={`flex-shrink-0 min-w-[90px] sm:min-w-0 rounded-xl p-2.5 transition-all ${active ? 'bg-gradient-to-br ' + c.color + ' text-[#0a0a0a] shadow-lg' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'}`}><div className="flex items-center gap-2"><I className="w-4 h-4" /><div className="text-right"><p className="font-bold text-xs sm:text-sm">{c.plural}</p><p className={`text-[10px] ${active ? 'opacity-80' : 'text-neutral-500'}`}>{tabStats[type].watched}/{tabStats[type].total}</p></div></div></button>
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-3 sm:p-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto mobile-toolbar pb-1 sm:pb-0">
            <div className="flex-1 min-w-0 relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث..." className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] pr-9 h-10" /></div>
            <div className="hidden sm:flex"><Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}><SelectTrigger className="w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-10"><ArrowUpDown className="w-4 h-4 ml-2" /><SelectValue /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]"><SelectItem value="addedAt">تاريخ الإضافة</SelectItem><SelectItem value="title">العنوان</SelectItem><SelectItem value="year">السنة</SelectItem><SelectItem value="rating">التقييم</SelectItem>{mainTab === 'ratings' && <SelectItem value="userRating">تقييمي</SelectItem>}</SelectContent></Select></div>
            <Button variant="ghost" size="icon" onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')} className="h-10 w-10 text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</Button>
            <div className="flex bg-[#1a1a1a] rounded-lg p-1"><Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a]' : 'text-neutral-400'}`}><Grid3X3 className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={`h-8 w-8 ${viewMode === 'list' ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a]' : 'text-neutral-400'}`}><List className="w-4 h-4" /></Button></div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`gap-2 h-10 ${showFilters ? 'border-[#d4af37] text-[#d4af37]' : 'border-[#2a2a2a] text-neutral-400'}`}><Filter className="w-4 h-4" /><span className="hidden sm:inline">فلاتر</span></Button>
          </div>
          {showFilters && <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#2a2a2a]">{activeTab === 'all' && <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-[90px] sm:w-[100px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="النوع" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]"><SelectItem value="all">الكل</SelectItem><SelectItem value="movie">أفلام</SelectItem><SelectItem value="series">مسلسلات</SelectItem><SelectItem value="anime">أنمي</SelectItem></SelectContent></Select>}<Select value={filterYear} onValueChange={setFilterYear}><SelectTrigger className="w-[100px] sm:w-[120px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><CalendarDays className="w-4 h-4 ml-2" /><SelectValue placeholder="السنة" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]"><SelectItem value="all">كل السنوات</SelectItem>{YEARS_RANGE.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[110px] sm:w-[130px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="الحالة" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]"><SelectItem value="all">الكل</SelectItem><SelectItem value="watched">تمت المشاهدة</SelectItem><SelectItem value="unwatched">لم تُشاهد</SelectItem><SelectItem value="favorite">المفضلة</SelectItem></SelectContent></Select><Select value={filterGenre} onValueChange={setFilterGenre}><SelectTrigger className="w-[120px] sm:w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="التصنيف" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]"><SelectItem value="all">كل التصنيفات</SelectItem>{allGenres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><Button variant="ghost" size="sm" onClick={clearFilters} className="text-neutral-400"><X className="w-4 h-4 ml-1" />مسح</Button></div>}
        </div>

        <div className="flex items-center justify-between mb-4"><p className="text-sm text-neutral-400">{filteredItems.length} نتيجة {mainTab === 'ratings' && `من ${rtTotal} مقيّم`}</p></div>

        {/* Items Grid/List */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20"><div className={`w-24 h-24 rounded-full ${TYPE_CONFIG[activeTab].bgColor} flex items-center justify-center mb-6`}><TypeIcon className="w-12 h-12 text-neutral-500" /></div><h3 className="text-xl font-bold mb-2">{currentList.length === 0 ? (mainTab === 'watchlist' ? 'القائمة فارغة' : 'لا توجد تقييمات') : 'لا توجد نتائج'}</h3><p className="text-neutral-500 mb-8">{currentList.length === 0 ? (mainTab === 'watchlist' ? 'أضف أول عمل إلى قائمتك' : 'قيّم عملاً لينتقل هنا') : 'جرب تغيير الفلاتر'}</p></div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className={`group relative rounded-xl overflow-hidden transition-all hover:scale-[1.02] ${item.watched && mainTab === 'watchlist' ? 'opacity-60' : ''}`} onClick={() => { setSelectedItem(item); setShowDetails(true) }}>
                <div className="aspect-[2/3] bg-[#1a1a1a]">
                  {item.poster ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" /> : <div className={`w-full h-full flex items-center justify-center ${TYPE_CONFIG[item.type]?.bgColor || 'bg-[#1a1a1a]'}`}>{(() => { const I = TYPE_CONFIG[item.type]?.icon || Film; return <I className="w-16 h-16 text-neutral-500" /> })()}</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {activeTab === 'all' && <Badge className={`bg-gradient-to-r ${TYPE_CONFIG[item.type]?.color || 'from-[#d4af37] to-[#b8960f]'} text-white text-[10px]`}>{TYPE_CONFIG[item.type]?.label || item.type}</Badge>}
                    {item.favorite && <Badge className="bg-red-500 text-white p-1"><Heart className="w-3 h-3 fill-white" /></Badge>}
                    {item.watched && mainTab === 'watchlist' && <Badge className="bg-green-500 text-black"><Check className="w-3 h-3" /></Badge>}
                  </div>
                  {mainTab === 'ratings' && item.userRating != null && <div className="absolute top-2 left-2"><Badge className={`bg-black/60 ${getRatingClass(item.userRating)}`}>{formatRating(item.userRating)}</Badge></div>}
                  {item.rating && mainTab === 'watchlist' && <div className="absolute top-2 left-2"><Badge className="bg-black/60 text-[#e6c65a]"><Star className="w-3 h-3 ml-1 fill-[#e6c65a]" />{item.rating}</Badge></div>}
                  <div className="absolute bottom-0 right-0 left-0 p-3"><h3 className="font-bold text-sm line-clamp-1 english-title">{getDisplayTitle(item)}</h3><div className="flex items-center gap-2 text-xs text-neutral-400"><span>{item.year}</span>{item.seasons && <span>• {item.seasons} موسم</span>}</div></div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2">
                    {mainTab === 'watchlist' && <Button size="icon" onClick={(e) => { e.stopPropagation(); removeFromList(item.id) }} className="w-9 h-9 rounded-full bg-red-500 text-white"><Trash2 className="w-4 h-4" /></Button>}
                    <Button size="icon" onClick={(e) => { e.stopPropagation(); openEditDialog(item) }} className="w-9 h-9 rounded-full bg-[#d4af37]/80 text-[#0a0a0a]"><Edit3 className="w-4 h-4" /></Button>
                    {mainTab === 'watchlist' && <Button size="icon" onClick={(e) => { e.stopPropagation(); toggleWatched(item.id) }} className={`w-9 h-9 rounded-full ${item.watched ? 'bg-green-500 text-black' : 'bg-white/20 text-white'}`}>{item.watched ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className={`flex gap-4 p-3 rounded-xl bg-[#1a1a1a]/50 hover:bg-[#2a2a2a]/50 cursor-pointer border border-[#2a2a2a]/50 ${item.watched && mainTab === 'watchlist' ? 'opacity-60' : ''}`} onClick={() => { setSelectedItem(item); setShowDetails(true) }}>
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">{item.poster ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" /> : <div className={`w-full h-full flex items-center justify-center ${TYPE_CONFIG[item.type]?.bgColor || 'bg-[#1a1a1a]'}`}>{(() => { const I = TYPE_CONFIG[item.type]?.icon || Film; return <I className="w-8 h-8 text-neutral-500" /> })()}</div>}</div>
                <div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2">{activeTab === 'all' && <Badge className={`bg-gradient-to-r ${TYPE_CONFIG[item.type]?.color || 'from-[#d4af37] to-[#b8960f]'} text-white text-[10px]`}>{TYPE_CONFIG[item.type]?.label || item.type}</Badge>}<div><h3 className="font-bold line-clamp-1 english-title">{getDisplayTitle(item)}</h3></div></div><div className="flex items-center gap-1">{item.favorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}{item.watched && mainTab === 'watchlist' && <Check className="w-4 h-4 text-green-500" />}{mainTab === 'ratings' && item.userRating != null && <Badge className={`bg-[#d4af37]/20 ${getRatingClass(item.userRating)}`}>{formatRating(item.userRating)}</Badge>}{mainTab === 'watchlist' && item.rating && <Badge className="bg-[#d4af37]/20 text-[#e6c65a]"><Star className="w-3 h-3 ml-1 fill-[#e6c65a]" />{item.rating}</Badge>}</div></div><div className="flex items-center gap-3 mt-1 text-xs text-neutral-400"><span>{item.year}</span>{item.seasons && <span>• {item.seasons} موسم</span>}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll loader */}
        {((mainTab === 'watchlist' && wlHasMore) || (mainTab === 'ratings' && rtHasMore)) && (
          <div ref={loaderRef} className="flex justify-center py-8">
            {isLoadingMore && <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}><DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-2xl bg-[#0f0f0f] border-[#2a2a2a] sm:max-h-[90vh] overflow-y-auto">{selectedItem && <><DialogHeader><DialogTitle className="text-xl english-title">{getDisplayTitle(selectedItem)}</DialogTitle></DialogHeader><div className="mt-4 space-y-4"><div className="flex gap-4"><div className="w-32 h-48 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">{selectedItem.poster ? <img src={selectedItem.poster} alt="" className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${TYPE_CONFIG[selectedItem.type]?.bgColor || 'bg-[#1a1a1a]'}`}>{(() => { const I = TYPE_CONFIG[selectedItem.type]?.icon || Film; return <I className="w-12 h-12 text-neutral-500" /> })()}</div>}</div><div className="flex-1"><div className="flex items-center gap-2 mb-2"><Badge className={`bg-gradient-to-r ${TYPE_CONFIG[selectedItem.type]?.color || 'from-[#d4af37] to-[#b8960f]'} text-white`}>{TYPE_CONFIG[selectedItem.type]?.label || selectedItem.type}</Badge><span className="text-[#d4af37]">{selectedItem.year}</span>{selectedItem.rating && <Badge className="bg-[#d4af37]/20 text-[#e6c65a]"><Star className="w-3 h-3 ml-1 fill-[#e6c65a]" />{selectedItem.rating}</Badge>}{mainTab === 'ratings' && selectedItem.userRating != null && <Badge className={`bg-[#d4af37]/20 ${getRatingClass(selectedItem.userRating)}`}>تقييمي: {formatRating(selectedItem.userRating)}/100</Badge>}</div>{selectedItem.seasons && <p className="text-sm text-neutral-400">{selectedItem.seasons} مواسم</p>}</div></div>{selectedItem.overview && <div><h4 className="font-medium mb-1 text-[#e6c65a]">الملخص</h4><p className="text-sm text-neutral-300">{selectedItem.overview}</p></div>}{selectedItem.notes && <div><h4 className="font-medium mb-1 text-[#e6c65a]">ملاحظاتي</h4><p className="text-sm text-neutral-300">{selectedItem.notes}</p></div>}

          {/* Rating Section */}
          <div>
            <h4 className="font-medium mb-2 text-[#e6c65a]">تقييمي (من 100)</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {mainTab === 'watchlist' ? (
                // In watchlist: show rating buttons 0-100 in steps of 5 + quick rates
                <>
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(r => (
                    <button key={r} onClick={() => rateItem(selectedItem.id, r)} className={`w-12 h-10 rounded-lg text-sm font-bold transition-all ${selectedItem.userRating === r ? 'bg-[#d4af37] text-[#0a0a0a]' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a]'}`}>{r}</button>
                  ))}
                  <div className="flex items-center gap-1 mt-2 w-full">
                    <Input type="number" min="0" max="100" placeholder="تقييم مخصص" className="bg-[#1a1a1a] border-[#2a2a2a] h-9 w-28" onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseInt((e.target as HTMLInputElement).value); if (v >= 0 && v <= 100) rateItem(selectedItem.id, v) } }} />
                    <span className="text-neutral-500 text-sm">/ 100</span>
                  </div>
                </>
              ) : (
                // In ratings: can update rating
                <>
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(r => (
                    <button key={r} onClick={() => updateRating(selectedItem.id, r)} className={`w-12 h-10 rounded-lg text-sm font-bold transition-all ${(selectedItem.userRating || 0) >= r - 5 && (selectedItem.userRating || 0) < r + 5 ? 'bg-[#d4af37] text-[#0a0a0a]' : (selectedItem.userRating || 0) >= r ? 'bg-[#d4af37]/60 text-[#0a0a0a]' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a]'}`}>{r}</button>
                  ))}
                  <div className="flex items-center gap-1 mt-2 w-full">
                    <Input type="number" min="0" max="100" defaultValue={selectedItem.userRating ?? ''} placeholder="تعديل التقييم" className="bg-[#1a1a1a] border-[#2a2a2a] h-9 w-28" onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseInt((e.target as HTMLInputElement).value); if (v >= 0 && v <= 100) updateRating(selectedItem.id, v) } }} />
                    <span className="text-neutral-500 text-sm">/ 100</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {mainTab === 'watchlist' && <Button onClick={() => toggleWatched(selectedItem.id)} className={`flex-1 ${selectedItem.watched ? 'bg-green-500 text-black' : 'bg-[#1a1a1a]'}`}>{selectedItem.watched ? <EyeOff className="w-4 h-4 ml-2" /> : <Eye className="w-4 h-4 ml-2" />}{selectedItem.watched ? 'إلغاء المشاهدة' : 'تمت المشاهدة'}</Button>}
            <Button onClick={() => removeFromList(selectedItem.id)} variant="destructive" className="flex-1"><Trash2 className="w-4 h-4 ml-2" />حذف</Button>
          </div>
          <div className="flex gap-2"><Button onClick={() => openEditDialog(selectedItem)} className="flex-1 bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a]"><Edit3 className="w-4 h-4 ml-2" />تعديل الملاحظات</Button></div>
        </div></>}</DialogContent></Dialog>

        {/* Edit Dialog - Only notes and poster editable */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}><DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-lg bg-[#0f0f0f] border-[#2a2a2a] sm:max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Edit3 className="w-5 h-5 text-[#d4af37]" />تعديل الملاحظات فقط</DialogTitle></DialogHeader><div className="space-y-4 mt-4">
          {/* Show item info (read-only) */}
          {editingItem && <div className="p-3 rounded-xl bg-[#1a1a1a]/50 border border-[#2a2a2a]"><div className="flex items-center gap-3"><div className="w-12 h-18 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">{editingItem.poster ? <img src={editingItem.poster} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-6 h-6 text-neutral-500" /></div>}</div><div><p className="font-bold">{getDisplayTitle(editingItem)}</p><p className="text-xs text-neutral-400">{editingItem.year} • {TYPE_CONFIG[editingItem.type]?.label}</p></div></div></div>}

          {/* Only notes editable */}
          <div><label className="text-sm text-neutral-400 mb-1 block">ملاحظاتي</label><Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="أضف ملاحظاتك..." className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[80px]" /></div>

          {/* Poster upload */}
          <div><label className="text-sm text-neutral-400 mb-1 block">صورة الملصق</label><div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isDragOver ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-[#2a2a2a]'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePosterUpload(e.target.files[0])} />{formData.poster ? <div className="relative inline-block"><img src={formData.poster} alt="poster" className="h-24 rounded-lg mx-auto" /><Button variant="ghost" size="icon" onClick={() => setFormData(p => ({ ...p, poster: '' }))} className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></Button></div> : <div className="py-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-8 h-8 text-neutral-500 mx-auto mb-2" /><p className="text-sm text-neutral-400">اسحب صورة أو اضغط للاختيار</p></div>}</div></div>

          <div className="flex gap-2"><Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold">حفظ التعديلات</Button><Button onClick={() => { setShowEditDialog(false); setEditingItem(null); resetForm() }} variant="ghost" className="flex-1 text-neutral-400">إلغاء</Button></div>
        </div></DialogContent></Dialog>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}><DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-lg bg-[#0f0f0f] border-[#2a2a2a] sm:max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Plus className="w-5 h-5 text-[#d4af37]" />إضافة {TYPE_CONFIG[addType].label} جديد</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><div className="p-3 rounded-xl bg-[#1a1a1a]/50 border border-[#2a2a2a]"><label className="text-sm text-neutral-400 mb-2 block">نوع العمل</label><div className="grid grid-cols-3 gap-2">{(['movie', 'series', 'anime'] as const).map((type) => { const c = TYPE_CONFIG[type]; const I = c.icon; return <button key={type} onClick={() => { setAddType(type); setShowResults(false) }} className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${addType === type ? 'bg-gradient-to-br ' + c.color + ' text-[#0a0a0a]' : 'bg-[#2a2a2a]/50 text-neutral-400'}`}><I className="w-5 h-5" /><span className="text-xs">{c.label}</span></button> })}</div></div><div className="p-3 rounded-xl bg-[#1a1a1a]/50 border border-[#2a2a2a]"><label className="text-sm text-neutral-400 mb-2 block">ابحث لجلب المعلومات تلقائياً</label><div className="flex gap-2"><Input value={metaSearchQuery} onChange={(e) => setMetaSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchMetadata()} placeholder="ابحث بالإنجليزي أو العربي..." className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-10" /><Button onClick={fetchMetadata} disabled={isFetching || !metaSearchQuery.trim()} className="bg-[#d4af37] text-[#0a0a0a] font-bold px-4">{isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}</Button></div>{searchError && <p className="text-red-400 text-sm mt-2">{searchError}</p>}</div>{showResults && searchResults.length > 0 && <div className="max-h-60 overflow-y-auto space-y-2 bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">{searchResults.map((r, idx) => <button key={idx} onClick={() => selectAndAdd(r)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#2a2a2a] text-right transition-colors">{r.poster && <img src={r.poster} alt="" className="w-10 h-14 rounded object-cover flex-shrink-0" />}<div className="flex-1 min-w-0"><p className="font-bold text-sm line-clamp-1">{r.originalTitle || r.title}</p><p className="text-xs text-neutral-400">{r.year} {r.rating && `• ⭐ ${r.rating}`}</p></div><Plus className="w-4 h-4 text-[#d4af37] flex-shrink-0" /></button>)}</div>}<div className="p-3 rounded-xl bg-[#1a1a1a]/50 border border-[#2a2a2a]"><label className="text-sm text-neutral-400 mb-2 block">أو أدخل البيانات يدوياً</label><div className="space-y-3"><Input value={formData.originalTitle} onChange={(e) => setFormData(p => ({ ...p, originalTitle: e.target.value, title: e.target.value }))} placeholder="اسم العمل (إنجليزي)" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /><div className="grid grid-cols-2 gap-3"><Input value={formData.year} onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))} placeholder="السنة" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /><Input value={formData.genres} onChange={(e) => setFormData(p => ({ ...p, genres: e.target.value }))} placeholder="التصنيف (افصل بفاصلة)" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div>{(addType === 'series' || addType === 'anime') && <div className="grid grid-cols-2 gap-3"><Input value={formData.seasons} onChange={(e) => setFormData(p => ({ ...p, seasons: e.target.value }))} placeholder="عدد المواسم" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /><Input value={formData.episodes} onChange={(e) => setFormData(p => ({ ...p, episodes: e.target.value }))} placeholder="عدد الحلقات" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div>}<Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات (اختياري)" className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[60px]" /></div></div><div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isDragOver ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-[#2a2a2a]'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePosterUpload(e.target.files[0])} />{formData.poster ? <div className="relative inline-block"><img src={formData.poster} alt="poster" className="h-24 rounded-lg mx-auto" /><Button variant="ghost" size="icon" onClick={() => setFormData(p => ({ ...p, poster: '' }))} className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></Button></div> : <div className="py-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-6 h-6 text-neutral-500 mx-auto mb-1" /><p className="text-xs text-neutral-400">اسحب صورة أو اضغط للاختيار</p></div>}</div><div className="flex gap-2"><Button onClick={handleAddItem} className="flex-1 bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold">إضافة</Button><Button onClick={() => { setShowAddDialog(false); resetForm() }} variant="ghost" className="flex-1 text-neutral-400">إلغاء</Button></div></div></DialogContent></Dialog>

      </div>
    </div>
  )
}
