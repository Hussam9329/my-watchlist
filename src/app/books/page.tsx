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
import { Plus, Film, Tv, Sparkles, Star, Check, X, Eye, EyeOff, Image as ImageIcon, Search, Loader2, BookOpen, Edit3, Grid3X3, List, Filter, ArrowUpDown, Download, Upload as UploadIcon, BarChart3, CalendarDays, Bookmark, Heart, Settings, Trash2, Cloud, CloudOff, ArrowRight } from 'lucide-react'
interface MediaItem { id: string; title: string; originalTitle?: string; year: string; type: 'anime' | 'series' | 'movie' | 'book'; poster: string; rating: string; overview: string; genres: string[]; episodes?: number; seasons?: number; duration?: string; status?: string; author?: string; pages?: number; tags: string[]; notes: string; favorite: boolean; addedAt: string; watchedAt?: string; watched: boolean; userRating?: number }
interface SearchResult { title: string; originalTitle: string; year: string; rating: string; overview: string; poster?: string; genres: string[]; episodes?: number; seasons?: number; duration?: string; status?: string; author?: string; pages?: number }
type TabType = 'all' | 'book'
type ViewMode = 'grid' | 'list'
type SortBy = 'addedAt' | 'title' | 'year' | 'rating' | 'userRating'
type SortOrder = 'asc' | 'desc'

const TYPE_CONFIG: Record<TabType, { icon: typeof Film; label: string; plural: string; color: string; bgColor: string }> = {
  all: { icon: Bookmark, label: 'الكل', plural: 'جميع الكتب', color: 'from-[#d4af37] to-[#b8960f]', bgColor: 'bg-[#d4af37]/10' },
  book: { icon: BookOpen, label: 'كتاب', plural: 'كتب', color: 'from-[#f0d77a] to-[#d4af37]', bgColor: 'bg-[#f0d77a]/10' }
}

const YEARS_RANGE = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

// دالة للحصول على العنوان الإنجليزي للعرض الخارجي
const getDisplayTitle = (item: MediaItem): string => {
  return item.originalTitle || item.title || ''
}

// دالة للحصول على العنوان في التفاصيل (كتب بالعربي)
const getDetailTitle = (item: MediaItem): string => {
  if (item.type === 'book') {
    return item.title || item.originalTitle || ''
  }
  return item.originalTitle || item.title || ''
}

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

// كلمة المرور - يمكنك تغييرها
const APP_PASSWORD = '20262028'

export default function WatchListPage() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showLogin, setShowLogin] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [watchList, setWatchList] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [addType, setAddType] = useState<'book'>('book')
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

  const fetchWatchList = useCallback(async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/watchlist')
      const data = await response.json()
      if (data.items && Array.isArray(data.items)) { 
        setWatchList(data.items.filter(i => i.type === 'book'))
        setSyncStatus('synced')
      } else if (Array.isArray(data)) {
        setWatchList(data.filter(i => i.type === 'book'))
        setSyncStatus('synced')
      } else {
        setWatchList([])
        setSyncStatus('error')
      }
    } catch (error) {
      setSyncStatus('error')
      setWatchList([])
    } finally { setIsLoading(false) }
  }, [])

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const auth = localStorage.getItem('watchlist_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      setShowLogin(false)
    }
  }, [])

  useEffect(() => { fetchWatchList() }, [fetchWatchList])
  useEffect(() => { if (activeTab !== 'all') setAddType(activeTab as typeof addType) }, [activeTab])

  const allGenres = useMemo(() => { const g = new Set<string>(); watchList.filter(i => i.type === 'book').forEach(i => i.genres?.forEach((x: string) => g.add(x))); return Array.from(g).sort() }, [watchList])

  const filteredItems = useMemo(() => {
    let items = activeTab === 'all' ? watchList.filter(i => i.type === 'book') : watchList.filter(i => i.type === activeTab)
    if (activeTab === 'all' && filterType !== 'all') items = items.filter(i => i.type === filterType)
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); items = items.filter(i => i.title.toLowerCase().includes(q) || i.originalTitle?.toLowerCase().includes(q)) }
    if (filterYear !== 'all') items = items.filter(i => i.year === filterYear)
    items = items.filter(i => { const r = parseFloat(i.rating) || 0; return r >= filterRating[0] && r <= filterRating[1] })
    if (filterStatus === 'watched') items = items.filter(i => i.watched)
    else if (filterStatus === 'unwatched') items = items.filter(i => !i.watched)
    else if (filterStatus === 'favorite') items = items.filter(i => i.favorite)
    if (filterGenre !== 'all') items = items.filter(i => i.genres?.includes(filterGenre))
    items.sort((a, b) => { let c = 0; if (sortBy === 'title') c = (a.originalTitle || a.title).localeCompare(b.originalTitle || b.title); else if (sortBy === 'year') c = parseInt(a.year) - parseInt(b.year); else if (sortBy === 'rating') c = (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0); else c = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(); return sortOrder === 'asc' ? c : -c })
    return items
  }, [watchList, activeTab, searchQuery, filterYear, filterRating, filterStatus, filterGenre, filterType, sortBy, sortOrder])

  const stats = useMemo(() => { const items = activeTab === 'all' ? watchList.filter(i => i.type === 'book') : watchList.filter(i => i.type === activeTab); return { total: items.length, watched: items.filter(i => i.watched).length, favorite: items.filter(i => i.favorite).length, avgRating: items.reduce((a, i) => a + (parseFloat(i.rating) || 0), 0) / (items.length || 1) } }, [watchList, activeTab])
  const tabStats = useMemo(() => ({ all: { total: watchList.filter(i => i.type === 'book').length, watched: watchList.filter(i => i.type === 'book' && i.watched).length }, book: { total: watchList.filter(i => i.type === 'book').length, watched: watchList.filter(i => i.type === 'book' && i.watched).length } }), [watchList])

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
    setFormData(p => ({ 
      ...p, 
      title: r.originalTitle || r.title, 
      originalTitle: r.originalTitle || r.title, 
      year: r.year || p.year, 
      rating: r.rating || '', 
      overview: r.overview || '', 
      poster: r.poster || '',
      genres: r.genres?.join(', ') || '', 
      episodes: r.episodes?.toString() || '', 
      seasons: r.seasons?.toString() || '', 
      duration: r.duration || '', 
      status: r.status || '', 
      author: r.author || '', 
      pages: r.pages?.toString() || '' 
    }))
    setSearchResults([])
    setShowResults(false)
    setSearchError('')
  }

  // إضافة سريعة من نتائج البحث مع فحص التكرار
  const selectAndAdd = async (r: SearchResult) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: r.originalTitle || r.title,
          originalTitle: r.originalTitle || r.title,
          year: r.year,
          type: addType,
          poster: r.poster || '',
          rating: r.rating || '',
          overview: r.overview || '',
          genres: r.genres?.join(', ') || '',
          episodes: r.episodes || null,
          seasons: r.seasons || null,
          duration: r.duration || '',
          status: r.status || '',
          author: r.author || '',
          pages: r.pages || null,
          tags: '',
          notes: '',
        })
      })
      const newItem = await response.json()
      // فحص التكرار
      if (response.status === 409) {
        toast({ title: '⚠️ موجود مسبقاً!', description: newItem.error, variant: 'destructive' })
        return
      }
      if (newItem && newItem.id) {
        setWatchList(prev => [newItem, ...prev])
        setShowAddDialog(false)
        resetForm()
        toast({ title: '✅ تمت الإضافة', description: `تم إضافة "${r.originalTitle || r.title}" بنجاح` })
      }
    } catch (error) {
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الإضافة', variant: 'destructive' })
    }
  }

  // إضافة يدوية من النموذج مع فحص التكرار
  const handleAddItem = async () => {
    if (!formData.originalTitle.trim() && !formData.title.trim()) return
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          originalTitle: formData.originalTitle,
          year: formData.year,
          type: addType,
          poster: formData.poster,
          rating: formData.rating,
          overview: formData.overview,
          genres: formData.genres,
          episodes: formData.episodes,
          seasons: formData.seasons,
          duration: formData.duration,
          status: formData.status,
          author: formData.author,
          pages: formData.pages,
          tags: formData.tags,
          notes: formData.notes,
        })
      })
      const newItem = await response.json()
      // فحص التكرار
      if (response.status === 409) {
        toast({ title: '⚠️ موجود مسبقاً!', description: newItem.error, variant: 'destructive' })
        return
      }
      if (newItem && newItem.id) {
        setWatchList(prev => [newItem, ...prev])
        setShowAddDialog(false)
        resetForm()
        toast({ title: '✅ تمت الإضافة', description: `تم إضافة "${formData.originalTitle || formData.title}" بنجاح` })
      }
    } catch (error) {
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الإضافة', variant: 'destructive' })
    }
  }

  const resetForm = () => { setMetaSearchQuery(''); setSearchResults([]); setShowResults(false); setSearchError(''); setFormData({ title: '', originalTitle: '', year: new Date().getFullYear().toString(), rating: '', overview: '', genres: '', episodes: '', seasons: '', duration: '', status: '', author: '', pages: '', tags: '', notes: '', poster: '' }) }

  const openEditDialog = (item: MediaItem) => { setEditingItem(item); setFormData({ title: item.title, originalTitle: item.originalTitle || '', year: item.year, rating: item.rating, overview: item.overview, genres: item.genres?.join(', ') || '', episodes: item.episodes?.toString() || '', seasons: item.seasons?.toString() || '', duration: item.duration || '', status: item.status || '', author: item.author || '', pages: item.pages?.toString() || '', tags: item.tags?.join(', ') || '', notes: item.notes, poster: item.poster }); setShowDetails(false); setShowEditDialog(true) }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    try {
      setSyncStatus('syncing')
      const res = await fetch(`/api/watchlist/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: formData.title, originalTitle: formData.originalTitle, year: formData.year, poster: formData.poster || null, rating: formData.rating || null, overview: formData.overview || null, genres: formData.genres.split(',').map(g => g.trim()).filter(Boolean), episodes: formData.episodes ? parseInt(formData.episodes) : null, seasons: formData.seasons ? parseInt(formData.seasons) : null, duration: formData.duration || null, status: formData.status || null, author: formData.author || null, pages: formData.pages ? parseInt(formData.pages) : null, tags: [], notes: formData.notes || '' }) })
      const data = await res.json()
      if (data) { 
        setWatchList(p => p.map(i => i.id === editingItem.id ? data : i))
        setSyncStatus('synced')
        toast({ title: '✅ تم التعديل', description: 'تم حفظ التعديلات بنجاح' })
      }
      setShowEditDialog(false); setEditingItem(null); resetForm()
    } catch { 
      setSyncStatus('error')
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الحفظ', variant: 'destructive' })
    }
  }

  const removeFromList = async (id: string) => { 
    try { 
      setSyncStatus('syncing')
      const item = watchList.find(i => i.id === id)
      await fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
      setWatchList(p => p.filter(i => i.id !== id))
      setSyncStatus('synced')
      if (selectedItem?.id === id) { setShowDetails(false); setSelectedItem(null) }
      toast({ title: '🗑️ تم الحذف', description: `تم حذف "${item?.originalTitle || item?.title}"` })
    } catch { 
      setSyncStatus('error')
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الحذف', variant: 'destructive' })
    } 
  }

  const toggleWatched = async (id: string) => { 
    const item = watchList.find(i => i.id === id)
    if (!item) return
    try { 
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ watched: !item.watched }) })
      setWatchList(p => p.map(i => i.id === id ? { ...i, watched: !i.watched } : i))
      toast({ title: item.watched ? '📖 لم تُقرأ' : '✅ تمت القراءة', description: item.watched ? 'تم إلغاء حالة القراءة' : 'تم تحديده كمقروء' })
    } catch {} 
  }

  const toggleFavorite = async (id: string) => { 
    const item = watchList.find(i => i.id === id)
    if (!item) return
    try { 
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ favorite: !item.favorite }) })
      setWatchList(p => p.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i))
      toast({ title: item.favorite ? '💔 أُزيل من المفضلة' : '❤️ أُضيف للمفضلة', description: item.favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة' })
    } catch {} 
  }

  const setUserRating = async (id: string, rating: number) => { try { await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userRating: rating }) }); setWatchList(p => p.map(i => i.id === id ? { ...i, userRating: rating } : i)) } catch {} }

  const exportData = () => { const d = JSON.stringify(watchList, null, 2); const b = new Blob([d], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `watchlist_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(u); toast({ title: '📤 تم التصدير', description: 'تم تصدير البيانات بنجاح' }) }
  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = async (ev) => { try { const imp = JSON.parse(ev.target?.result as string); if (Array.isArray(imp)) { for (const item of imp) { await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }) } fetchWatchList(); toast({ title: '📥 تم الاستيراد', description: `تم استيراد ${imp.length} عنصر` }) } } catch {} }; r.readAsText(f) } }

  const handleLogin = () => {
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true)
      setShowLogin(false)
      localStorage.setItem('watchlist_auth', 'true')
      toast({ title: '✅ مرحباً بك!', description: 'تم تسجيل الدخول بنجاح' })
    } else {
      toast({ title: '❌ خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowLogin(true)
    localStorage.removeItem('watchlist_auth')
    setPasswordInput('')
  }

  const clearFilters = () => { setSearchQuery(''); setFilterYear('all'); setFilterRating([0, 10]); setFilterStatus('all'); setFilterGenre('all'); setFilterType('all') }

  const TypeIcon = TYPE_CONFIG[activeTab].icon
  const currentType = editingItem?.type || addType

  // شاشة تسجيل الدخول
  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-full max-w-sm px-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8960f] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#d4af37]/20">
              <Bookmark className="w-10 h-10 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">أريد قرائته</h1>
            <p className="text-neutral-500">أدخل كلمة المرور للدخول</p>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="كلمة المرور"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-12 text-center text-lg"
            />
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold h-12"
            >
              دخول
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#d4af37]" /></div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#d4af37]/5 to-transparent rounded-full blur-3xl" /><div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#b8960f]/5 to-transparent rounded-full blur-3xl" /></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8" dir="rtl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <Button onClick={() => { window.location.href = '/' }} variant="ghost" size="icon" className="text-neutral-500 hover:text-white hover:bg-[#1a1a1a]">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8960f] flex items-center justify-center shadow-lg"><Bookmark className="w-7 h-7 text-[#0a0a0a]" /></div><div><h1 className="text-2xl font-bold">أريد قرائته</h1><div className="flex items-center gap-2"><p className="text-neutral-500 text-sm">قائمة القراءة</p><span className={`text-xs flex items-center gap-1 ${syncStatus === 'synced' ? 'text-green-500' : syncStatus === 'syncing' ? 'text-yellow-500' : 'text-red-500'}`}>{syncStatus === 'synced' && <Cloud className="w-3 h-3" />}{syncStatus === 'syncing' && <Loader2 className="w-3 h-3 animate-spin" />}{syncStatus === 'error' && <CloudOff className="w-3 h-3" />}{syncStatus === 'synced' ? 'متزامن' : syncStatus === 'syncing' ? 'مزامنة...' : 'خطأ'}</span></div></div></div>
          <div className="flex items-center gap-2"><Button onClick={() => setShowStats(!showStats)} variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><BarChart3 className="w-5 h-5" /></Button><Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><Settings className="w-5 h-5" /></Button></PopoverTrigger><PopoverContent className="w-48 bg-[#1a1a1a] border-[#2a2a2a]"><div className="space-y-2"><Button onClick={exportData} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a]"><Download className="w-4 h-4" />تصدير</Button><Button onClick={() => importInputRef.current?.click()} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a]"><UploadIcon className="w-4 h-4" />استيراد</Button><input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={importData} /></div></PopoverContent></Popover><Button onClick={() => { resetForm(); setShowAddDialog(true) }} className="bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold gap-2"><Plus className="w-4 h-4" />إضافة</Button></div>
        </header>

        {showStats && <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 mb-6"><h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#d4af37]" />إحصائيات {TYPE_CONFIG[activeTab].plural}</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]"><p className="text-2xl font-bold text-[#d4af37]">{stats.total}</p><p className="text-sm text-neutral-400">إجمالي</p></div><div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]"><p className="text-2xl font-bold text-[#f0d77a]">{stats.watched}</p><p className="text-sm text-neutral-400">تمت القراءة</p></div><div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]"><p className="text-2xl font-bold text-[#e6c65a]">{stats.favorite}</p><p className="text-sm text-neutral-400">مفضلة</p></div><div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]"><p className="text-2xl font-bold text-[#c9a227]">{stats.avgRating.toFixed(1)}</p><p className="text-sm text-neutral-400">متوسط التقييم</p></div></div></div>}

        <div className="grid grid-cols-5 gap-2 mb-6">{(['all', 'book'] as TabType[]).map((type) => { const c = TYPE_CONFIG[type]; const I = c.icon; const active = activeTab === type; return <button key={type} onClick={() => setActiveTab(type)} className={`rounded-xl p-3 transition-all ${active ? 'bg-gradient-to-br ' + c.color + ' text-[#0a0a0a] shadow-lg' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'}`}><div className="flex items-center gap-2"><I className="w-5 h-5" /><div className="text-right"><p className="font-bold text-sm">{c.plural}</p><p className={`text-xs ${active ? 'opacity-80' : 'text-neutral-500'}`}>{tabStats[type].watched}/{tabStats[type].total}</p></div></div></button> })}</div>

        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث..." className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] pr-9 h-10" /></div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}><SelectTrigger className="w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-10"><ArrowUpDown className="w-4 h-4 ml-2" /><SelectValue /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]"><SelectItem value="addedAt">تاريخ الإضافة</SelectItem><SelectItem value="title">العنوان</SelectItem><SelectItem value="year">السنة</SelectItem><SelectItem value="rating">التقييم</SelectItem></SelectContent></Select>
            <Button variant="ghost" size="icon" onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')} className="h-10 w-10 text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</Button>
            <div className="flex bg-[#1a1a1a] rounded-lg p-1"><Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a]' : 'text-neutral-400'}`}><Grid3X3 className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={`h-8 w-8 ${viewMode === 'list' ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a]' : 'text-neutral-400'}`}><List className="w-4 h-4" /></Button></div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`gap-2 h-10 ${showFilters ? 'border-[#d4af37] text-[#d4af37]' : 'border-[#2a2a2a] text-neutral-400'}`}><Filter className="w-4 h-4" />فلاتر</Button>
          </div>
          {showFilters && <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#2a2a2a]">{activeTab === 'all' && <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-[100px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="النوع" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]"><SelectItem value="all">الكل</SelectItem><SelectItem value="book">كتب</SelectItem></SelectContent></Select>}<Select value={filterYear} onValueChange={setFilterYear}><SelectTrigger className="w-[120px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><CalendarDays className="w-4 h-4 ml-2" /><SelectValue placeholder="السنة" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]"><SelectItem value="all">كل السنوات</SelectItem>{YEARS_RANGE.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[130px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="الحالة" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]"><SelectItem value="all">الكل</SelectItem><SelectItem value="watched">تمت القراءة</SelectItem><SelectItem value="unwatched">لم تُقرأ</SelectItem><SelectItem value="favorite">المفضلة</SelectItem></SelectContent></Select><Select value={filterGenre} onValueChange={setFilterGenre}><SelectTrigger className="w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="التصنيف" /></SelectTrigger><SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]"><SelectItem value="all">كل التصنيفات</SelectItem>{allGenres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><Button variant="ghost" size="sm" onClick={clearFilters} className="text-neutral-400"><X className="w-4 h-4 ml-1" />مسح</Button></div>}
        </div>

        <div className="flex items-center justify-between mb-4"><p className="text-sm text-neutral-400">{filteredItems.length} نتيجة</p></div>

        {filteredItems.length === 0 ? <div className="flex flex-col items-center justify-center py-20"><div className={`w-24 h-24 rounded-full ${TYPE_CONFIG[activeTab].bgColor} flex items-center justify-center mb-6`}><TypeIcon className="w-12 h-12 text-neutral-500" /></div><h3 className="text-xl font-bold mb-2">{watchList.length === 0 ? 'القائمة فارغة' : 'لا توجد نتائج'}</h3><p className="text-neutral-500 mb-8">{watchList.length === 0 ? 'أضف أول عمل إلى قائمتك' : 'جرب تغيير الفلاتر'}</p>{watchList.length === 0 && <Button onClick={() => { resetForm(); setShowAddDialog(true) }} className="bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold"><Plus className="w-5 h-5 ml-2" />إضافة أول عمل</Button>}</div> : viewMode === 'grid' ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">{filteredItems.map((item) => <div key={item.id} className={`group relative rounded-xl overflow-hidden transition-all hover:scale-[1.02] ${item.watched ? 'opacity-60' : ''}`} onClick={() => { setSelectedItem(item); setShowDetails(true) }}><div className="aspect-[2/3] bg-[#1a1a1a]">{item.poster ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${TYPE_CONFIG[item.type].bgColor}`}>{(() => { const I = TYPE_CONFIG[item.type].icon; return <I className="w-16 h-16 text-neutral-500" /> })()}</div>}<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><div className="absolute top-2 right-2 flex flex-col gap-1">{activeTab === 'all' && <Badge className={`bg-gradient-to-r ${TYPE_CONFIG[item.type].color} text-white text-[10px]`}>{TYPE_CONFIG[item.type].label}</Badge>}{item.favorite && <Badge className="bg-red-500 text-white p-1"><Heart className="w-3 h-3 fill-white" /></Badge>}{item.watched && <Badge className="bg-green-500 text-black"><Check className="w-3 h-3" /></Badge>}</div>{item.rating && <div className="absolute top-2 left-2"><Badge className="bg-black/60 text-[#e6c65a]"><Star className="w-3 h-3 ml-1 fill-[#e6c65a]" />{item.rating}</Badge></div>}<div className="absolute bottom-0 right-0 left-0 p-3"><h3 className="font-bold text-sm line-clamp-1 english-title">{getDisplayTitle(item)}</h3><div className="flex items-center gap-2 text-xs text-neutral-400"><span>{item.year}</span>{item.seasons && <span>• {item.seasons} موسم</span>}</div></div><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><Button size="icon" onClick={(e) => { e.stopPropagation(); removeFromList(item.id) }} className="w-9 h-9 rounded-full bg-red-500 text-white"><Trash2 className="w-4 h-4" /></Button><Button size="icon" onClick={(e) => { e.stopPropagation(); openEditDialog(item) }} className="w-9 h-9 rounded-full bg-[#d4af37]/80 text-[#0a0a0a]"><Edit3 className="w-4 h-4" /></Button><Button size="icon" onClick={(e) => { e.stopPropagation(); toggleWatched(item.id) }} className={`w-9 h-9 rounded-full ${item.watched ? 'bg-green-500 text-black' : 'bg-white/20 text-white'}`}>{item.watched ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button></div></div></div>)}</div> : <div className="space-y-2">{filteredItems.map((item) => <div key={item.id} className={`flex gap-4 p-3 rounded-xl bg-[#1a1a1a]/50 hover:bg-[#2a2a2a]/50 cursor-pointer border border-[#2a2a2a]/50 ${item.watched ? 'opacity-60' : ''}`} onClick={() => { setSelectedItem(item); setShowDetails(true) }}><div className="w-16 h-24 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">{item.poster ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${TYPE_CONFIG[item.type].bgColor}`}>{(() => { const I = TYPE_CONFIG[item.type].icon; return <I className="w-8 h-8 text-neutral-500" /> })()}</div>}</div><div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2">{activeTab === 'all' && <Badge className={`bg-gradient-to-r ${TYPE_CONFIG[item.type].color} text-white text-[10px]`}>{TYPE_CONFIG[item.type].label}</Badge>}<div><h3 className="font-bold line-clamp-1 english-title">{getDisplayTitle(item)}</h3></div></div><div className="flex items-center gap-1">{item.favorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}{item.watched && <Check className="w-4 h-4 text-green-500" />}{item.rating && <Badge className="bg-[#d4af37]/20 text-[#e6c65a]"><Star className="w-3 h-3 ml-1 fill-[#e6c65a]" />{item.rating}</Badge>}</div></div><div className="flex items-center gap-3 mt-1 text-xs text-neutral-400"><span>{item.year}</span>{item.seasons && <span>• {item.seasons} موسم</span>}{item.author && <span>• {item.author}</span>}</div></div></div>)}</div>}

        <Dialog open={showDetails} onOpenChange={setShowDetails}><DialogContent className="max-w-2xl bg-[#0f0f0f] border-[#2a2a2a] max-h-[90vh] overflow-y-auto">{selectedItem && <><DialogHeader><DialogTitle className="text-xl english-title">{getDetailTitle(selectedItem)}</DialogTitle></DialogHeader><div className="mt-4 space-y-4"><div className="flex gap-4"><div className="w-32 h-48 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">{selectedItem.poster ? <img src={selectedItem.poster} alt="" className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${TYPE_CONFIG[selectedItem.type].bgColor}`}>{(() => { const I = TYPE_CONFIG[selectedItem.type].icon; return <I className="w-12 h-12 text-neutral-500" /> })()}</div>}</div><div className="flex-1"><div className="flex items-center gap-2 mb-2"><Badge className={`bg-gradient-to-r ${TYPE_CONFIG[selectedItem.type].color} text-white`}>{TYPE_CONFIG[selectedItem.type].label}</Badge><span className="text-[#d4af37]">{selectedItem.year}</span>{selectedItem.rating && <Badge className="bg-[#d4af37]/20 text-[#e6c65a]"><Star className="w-3 h-3 ml-1 fill-[#e6c65a]" />{selectedItem.rating}</Badge>}</div>{selectedItem.seasons && <p className="text-sm text-neutral-400">{selectedItem.seasons} مواسم</p>}{selectedItem.author && <p className="text-sm text-neutral-400">بقلم: {selectedItem.author}</p>}</div></div>{selectedItem.overview && <div><h4 className="font-medium mb-1 text-[#e6c65a]">الملخص</h4><p className="text-sm text-neutral-300">{selectedItem.overview}</p></div>}{selectedItem.notes && <div><h4 className="font-medium mb-1 text-[#e6c65a]">ملاحظاتي</h4><p className="text-sm text-neutral-300">{selectedItem.notes}</p></div>}<div><h4 className="font-medium mb-2 text-[#e6c65a]">تقييمي</h4><div className="flex gap-1">{[1,2,3,4,5,6,7,8,9,10].map(r => <button key={r} onClick={() => setUserRating(selectedItem.id, r)} className={`w-8 h-8 rounded ${(selectedItem.userRating || 0) >= r ? 'bg-[#d4af37] text-[#0a0a0a]' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a]'}`}>{r}</button>)}</div></div><div className="flex gap-2 pt-4"><Button onClick={() => toggleWatched(selectedItem.id)} className={`flex-1 ${selectedItem.watched ? 'bg-green-500 text-black' : 'bg-[#1a1a1a]'}`}>{selectedItem.watched ? <EyeOff className="w-4 h-4 ml-2" /> : <Eye className="w-4 h-4 ml-2" />}{selectedItem.watched ? 'إلغاء القراءة' : 'تمت القراءة'}</Button><Button onClick={() => removeFromList(selectedItem.id)} variant="destructive" className="flex-1"><Trash2 className="w-4 h-4 ml-2" />حذف</Button></div><div className="flex gap-2"><Button onClick={() => openEditDialog(selectedItem)} className="flex-1 bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a]"><Edit3 className="w-4 h-4 ml-2" />تعديل</Button></div></div></>}</DialogContent></Dialog>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}><DialogContent className="max-w-lg bg-[#0f0f0f] border-[#2a2a2a] max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Plus className="w-5 h-5 text-[#d4af37]" />إضافة {TYPE_CONFIG[addType].label} جديد</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><div className="p-3 rounded-xl bg-[#1a1a1a]/50 border border-[#2a2a2a]"><label className="text-sm text-neutral-400 mb-2 block">نوع العمل</label><div className="grid grid-cols-1 gap-2">{(['book'] as const).map((type) => { const c = TYPE_CONFIG[type]; const I = c.icon; return <button key={type} onClick={() => { setAddType(type); setShowResults(false) }} className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${addType === type ? 'bg-gradient-to-br ' + c.color + ' text-[#0a0a0a]' : 'bg-[#2a2a2a]/50 text-neutral-400'}`}><I className="w-5 h-5" /><span className="text-xs">{c.label}</span></button> })}</div></div><div className="p-3 rounded-xl bg-[#1a1a1a]/50 border border-[#2a2a2a]"><label className="text-sm text-neutral-400 mb-2 block">ابحث لجلب المعلومات تلقائياً</label><div className="flex gap-2"><Input value={metaSearchQuery} onChange={(e) => setMetaSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchMetadata()} placeholder="ابحث بالإنجليزي أو العربي..." className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-10" /><Button onClick={fetchMetadata} disabled={isFetching || !metaSearchQuery.trim()} className="bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] px-4">{isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}</Button></div>{searchError && <p className="text-sm text-red-400 mt-2">{searchError}</p>}</div>{showResults && searchResults.length > 0 && <div className="rounded-xl border border-[#d4af37]/30 overflow-hidden"><div className="bg-[#d4af37]/10 px-3 py-2 border-b border-[#d4af37]/20"><p className="text-sm text-[#e6c65a]">اختر الإصدار المناسب:</p></div><div className="divide-y divide-[#2a2a2a] max-h-[200px] overflow-y-auto">{searchResults.map((r, i) => <div key={i} className="w-full p-3 flex items-center justify-between hover:bg-[#d4af37]/10"><div className="flex-1"><div className="flex items-center gap-2"><span className="text-[#d4af37] text-sm bg-[#d4af37]/20 px-2 py-0.5 rounded">{r.year}</span><span className="font-medium english-title">{r.originalTitle || r.title}</span>{r.rating && <Badge className="bg-[#d4af37]/20 text-[#e6c65a]"><Star className="w-3 h-3 ml-1" />{r.rating}</Badge>}</div>{r.overview && <p className="text-xs text-neutral-400 line-clamp-1 mt-1">{r.overview}</p>}</div><div className="flex gap-2"><Button size="sm" onClick={() => selectResult(r)} variant="outline" className="border-[#2a2a2a]">تعديل</Button><Button size="sm" onClick={() => selectAndAdd(r)} className="bg-[#d4af37] text-black">إضافة</Button></div></div>)}</div></div>}<div className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer ${!formData.poster ? 'bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a]' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>{formData.poster ? <><img src={formData.poster} alt="" className="w-full h-full object-cover" /><button onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, poster: '' })) }} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center"><X className="w-4 h-4" /></button></> : <div className="absolute inset-0 flex flex-col items-center justify-center"><ImageIcon className="w-10 h-10 text-neutral-500 mb-2" /><p className="text-sm text-neutral-400">اسحب صورة أو انقر للرفع</p></div>}<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePosterUpload(f) }} /></div><div className="grid grid-cols-2 gap-3"><div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">العنوان الأصلي *</label><Input value={formData.originalTitle} onChange={(e) => setFormData(p => ({ ...p, originalTitle: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10 english-title" /></div><div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">العنوان المترجم</label><Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div><label className="text-xs text-neutral-400 mb-1 block">السنة</label><Input value={formData.year} onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div><label className="text-xs text-neutral-400 mb-1 block">التقييم</label><Input value={formData.rating} onChange={(e) => setFormData(p => ({ ...p, rating: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div>{(addType === 'series' || addType === 'anime') && <><div><label className="text-xs text-neutral-400 mb-1 block">المواسم</label><Input value={formData.seasons} onChange={(e) => setFormData(p => ({ ...p, seasons: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div><label className="text-xs text-neutral-400 mb-1 block">الحالة</label><Input value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div></>}{addType === 'movie' && <div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">المدة</label><Input value={formData.duration} onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div>}{addType === 'book' && <><div><label className="text-xs text-neutral-400 mb-1 block">المؤلف</label><Input value={formData.author} onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div><label className="text-xs text-neutral-400 mb-1 block">الصفحات</label><Input value={formData.pages} onChange={(e) => setFormData(p => ({ ...p, pages: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div></>}<div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">التصنيفات</label><Input value={formData.genres} onChange={(e) => setFormData(p => ({ ...p, genres: e.target.value }))} placeholder="Action, Drama" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">ملاحظات</label><Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[60px] resize-none" /></div><div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">ملخص</label><Textarea value={formData.overview} onChange={(e) => setFormData(p => ({ ...p, overview: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[60px] resize-none" /></div></div><div className="flex gap-3 pt-2"><Button onClick={() => setShowAddDialog(false)} variant="outline" className="flex-1 border-[#2a2a2a]">إلغاء</Button><Button onClick={handleAddItem} disabled={!formData.originalTitle.trim() && !formData.title.trim()} className="flex-1 bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold"><Plus className="w-4 h-4 ml-2" />إضافة</Button></div></div></DialogContent></Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}><DialogContent className="max-w-lg bg-[#0f0f0f] border-[#2a2a2a] max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Edit3 className="w-5 h-5 text-[#d4af37]" />تعديل {TYPE_CONFIG[currentType].label}</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><div className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer ${!formData.poster ? 'bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a]' : ''}`} onClick={() => fileInputRef.current?.click()}>{formData.poster ? <img src={formData.poster} alt="" className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center"><ImageIcon className="w-10 h-10 text-neutral-500 mb-2" /><p className="text-sm text-neutral-400">انقر لرفع صورة</p></div>}<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePosterUpload(f) }} /></div><div className="grid grid-cols-2 gap-3"><div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">العنوان الأصلي *</label><Input value={formData.originalTitle} onChange={(e) => setFormData(p => ({ ...p, originalTitle: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10 english-title" /></div><div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">العنوان المترجم</label><Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div><label className="text-xs text-neutral-400 mb-1 block">السنة</label><Input value={formData.year} onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div><label className="text-xs text-neutral-400 mb-1 block">التقييم</label><Input value={formData.rating} onChange={(e) => setFormData(p => ({ ...p, rating: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">التصنيفات</label><Input value={formData.genres} onChange={(e) => setFormData(p => ({ ...p, genres: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" /></div><div className="col-span-2"><label className="text-xs text-neutral-400 mb-1 block">ملاحظات</label><Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[60px] resize-none" /></div></div><div className="flex gap-3 pt-2"><Button onClick={() => setShowEditDialog(false)} variant="outline" className="flex-1 border-[#2a2a2a]">إلغاء</Button><Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold">حفظ</Button></div></div></DialogContent></Dialog>
      </div>
    </div>
  )
}
