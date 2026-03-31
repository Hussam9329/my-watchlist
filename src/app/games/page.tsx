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
import { Plus, Star, Check, X, Eye, EyeOff, Image as ImageIcon, Search, Loader2, Edit3, Grid3X3, List, Filter, ArrowUpDown, Download, Upload as UploadIcon, BarChart3, CalendarDays, Bookmark, Heart, Settings, Trash2, Cloud, CloudOff, ArrowRight, Gamepad2, Monitor, Smartphone } from 'lucide-react'

interface GameItem { id: string; title: string; originalTitle?: string; year: string; type: 'game' | 'anime' | 'series' | 'movie' | 'book'; poster: string | null; rating: string; overview: string; genres: string | string[]; episodes?: number; seasons?: number; duration?: string; status?: string; author?: string | null; pages?: number; tags: string; notes: string; favorite: boolean; addedAt: string; watchedAt?: string; watched: boolean; userRating?: number }
interface GameSearchResult { title: string; originalTitle: string; year: string; rating: string; overview: string; poster: string | null; genres: string[]; platform: string }

type TabType = 'all' | 'pc' | 'console' | 'mobile'
type ViewMode = 'grid' | 'list'
type SortBy = 'addedAt' | 'title' | 'year' | 'rating' | 'userRating'
type SortOrder = 'asc' | 'desc'

const TAB_CONFIG: Record<TabType, { icon: typeof Gamepad2; label: string; plural: string; color: string; bgColor: string; platform: string }> = {
  all: { icon: Gamepad2, label: 'الكل', plural: 'جميع الألعاب', color: 'from-teal-500 to-cyan-500', bgColor: 'bg-teal-500/10', platform: '' },
  pc: { icon: Monitor, label: 'PC', plural: 'ألعاب PC', color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-500/10', platform: 'PC' },
  console: { icon: Gamepad2, label: 'كونسول', plural: 'ألعاب كونسول', color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-500/10', platform: 'Console' },
  mobile: { icon: Smartphone, label: 'موبايل', plural: 'ألعاب موبايل', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/10', platform: 'Mobile' }
}

const YEARS_RANGE = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

const getDisplayTitle = (item: GameItem): string => {
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

const APP_PASSWORD = '7777'

export default function GamesPage() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showLogin, setShowLogin] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [gameList, setGameList] = useState<GameItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<GameItem | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('addedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterRating, setFilterRating] = useState<[number, number]>([0, 10])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterGenre, setFilterGenre] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [formData, setFormData] = useState({ title: '', originalTitle: '', year: new Date().getFullYear().toString(), rating: '', overview: '', genres: '', platform: '', developer: '', tags: '', notes: '', poster: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [metaSearchQuery, setMetaSearchQuery] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchError, setSearchError] = useState('')

  const fetchGameList = useCallback(async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/watchlist')
      const data = await response.json()
      if (data.items && Array.isArray(data.items)) {
        setGameList(data.items.filter((i: any) => i.type === 'game'))
        setSyncStatus('synced')
      } else if (Array.isArray(data)) {
        setGameList(data.filter((i: any) => i.type === 'game'))
        setSyncStatus('synced')
      } else {
        setGameList([])
        setSyncStatus('error')
      }
    } catch {
      setSyncStatus('error')
      setGameList([])
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    const auth = localStorage.getItem('games_auth')
    if (auth === 'true') { setIsAuthenticated(true); setShowLogin(false) }
  }, [])

  useEffect(() => { fetchGameList() }, [fetchGameList])

  const allGenres = useMemo(() => {
    const g = new Set<string>()
    gameList.forEach(i => {
      const genres = (i as any).genres
      if (typeof genres === 'string' && genres) {
        genres.split(',').map(x => x.trim()).filter(Boolean).forEach((x: string) => g.add(x))
      }
    })
    return Array.from(g).sort()
  }, [gameList])

  const filteredItems = useMemo(() => {
    let items = [...gameList]
    const tabConfig = TAB_CONFIG[activeTab]
    if (tabConfig.platform) {
      items = items.filter((i: any) => {
        const platform = (i as any).author || ''
        return platform.toLowerCase().includes(tabConfig.platform.toLowerCase())
      })
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.originalTitle?.toLowerCase().includes(q))
    }
    if (filterYear !== 'all') items = items.filter(i => i.year === filterYear)
    items = items.filter(i => { const r = parseFloat(i.rating) || 0; return r >= filterRating[0] && r <= filterRating[1] })
    if (filterStatus === 'watched') items = items.filter(i => i.watched)
    else if (filterStatus === 'unwatched') items = items.filter(i => !i.watched)
    else if (filterStatus === 'favorite') items = items.filter(i => i.favorite)
    if (filterGenre !== 'all') {
      items = items.filter(i => {
        const genres = (i as any).genres || ''
        return genres.toLowerCase().includes(filterGenre.toLowerCase())
      })
    }
    items.sort((a, b) => {
      let c = 0
      if (sortBy === 'title') c = (a.originalTitle || a.title).localeCompare(b.originalTitle || b.title)
      else if (sortBy === 'year') c = parseInt(a.year) - parseInt(b.year)
      else if (sortBy === 'rating') c = (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0)
      else c = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
      return sortOrder === 'asc' ? c : -c
    })
    return items
  }, [gameList, activeTab, searchQuery, filterYear, filterRating, filterStatus, filterGenre, sortBy, sortOrder])

  const stats = useMemo(() => ({
    total: gameList.length,
    played: gameList.filter(i => i.watched).length,
    favorite: gameList.filter(i => i.favorite).length,
    avgRating: gameList.reduce((a, i) => a + (parseFloat(i.rating) || 0), 0) / (gameList.length || 1)
  }), [gameList])

  const tabStats = useMemo(() => ({
    all: { total: gameList.length, played: gameList.filter(i => i.watched).length },
    pc: { total: gameList.filter((i: any) => ((i as any).author || '').toLowerCase().includes('pc')).length, played: gameList.filter((i: any) => ((i as any).author || '').toLowerCase().includes('pc') && i.watched).length },
    console: { total: gameList.filter((i: any) => ((i as any).author || '').toLowerCase().includes('console')).length, played: gameList.filter((i: any) => ((i as any).author || '').toLowerCase().includes('console') && i.watched).length },
    mobile: { total: gameList.filter((i: any) => ((i as any).author || '').toLowerCase().includes('mobile')).length, played: gameList.filter((i: any) => ((i as any).author || '').toLowerCase().includes('mobile') && i.watched).length }
  }), [gameList])

  const handlePosterUpload = useCallback(async (file: File) => {
    if (file?.type.startsWith('image/')) { try { const c = await compressImage(file); setFormData(p => ({ ...p, poster: c })) } catch {} }
  }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); handlePosterUpload(e.dataTransfer.files[0]) }, [handlePosterUpload])

  const fetchGameMetadata = async () => {
    if (!metaSearchQuery.trim()) return
    setIsFetching(true); setSearchResults([]); setSearchError('')
    try {
      const res = await fetch('/api/metadata', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: metaSearchQuery, type: 'game' }) })
      const data = await res.json()
      if (data.results?.length > 0) { setSearchResults(data.results); setShowResults(true) }
      else setSearchError('لم يتم العثور على نتائج')
    } catch { setSearchError('حدث خطأ') }
    finally { setIsFetching(false) }
  }

  const selectGameResult = (r: GameSearchResult) => {
    setFormData(p => ({ ...p, originalTitle: r.originalTitle || r.title, title: r.title, year: r.year || p.year, rating: r.rating || '', overview: r.overview || '', poster: r.poster || '', genres: Array.isArray(r.genres) ? r.genres.join(', ') : (r.genres || ''), platform: r.platform || '' }))
    setSearchResults([]); setShowResults(false); setSearchError('')
  }

  const selectAndAddGame = async (r: GameSearchResult) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: r.title, originalTitle: r.originalTitle || r.title, year: r.year, type: 'game', poster: r.poster || '', rating: r.rating || '', overview: r.overview || '', genres: Array.isArray(r.genres) ? r.genres.join(', ') : (r.genres || ''), author: r.platform || '', tags: '', notes: '' })
      })
      const newItem = await response.json()
      if (response.status === 409) { toast({ title: '⚠️ موجود مسبقاً!', description: newItem.error, variant: 'destructive' }); return }
      if (newItem && newItem.id) { setGameList(prev => [newItem, ...prev]); setShowAddDialog(false); resetForm(); toast({ title: '✅ تمت الإضافة', description: `تم إضافة "${r.originalTitle || r.title}" بنجاح` }) }
    } catch { toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الإضافة', variant: 'destructive' }) }
  }

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
          type: 'game',
          poster: formData.poster,
          rating: formData.rating,
          overview: formData.overview,
          genres: formData.genres,
          author: formData.platform,
          tags: formData.tags,
          notes: formData.notes,
        })
      })
      const newItem = await response.json()
      if (response.status === 409) {
        toast({ title: '⚠️ موجود مسبقاً!', description: newItem.error, variant: 'destructive' })
        return
      }
      if (newItem && newItem.id) {
        setGameList(prev => [newItem, ...prev])
        setShowAddDialog(false)
        resetForm()
        toast({ title: '✅ تمت الإضافة', description: `تم إضافة "${formData.originalTitle || formData.title}" بنجاح` })
      }
    } catch {
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الإضافة', variant: 'destructive' })
    }
  }

  const resetForm = () => {
    setMetaSearchQuery(''); setSearchResults([]); setShowResults(false); setSearchError('')
    setFormData({ title: '', originalTitle: '', year: new Date().getFullYear().toString(), rating: '', overview: '', genres: '', platform: '', developer: '', tags: '', notes: '', poster: '' })
  }

  const openEditDialog = (item: GameItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      originalTitle: item.originalTitle || '',
      year: item.year,
      rating: item.rating,
      overview: item.overview,
      genres: (item as any).genres || '',
      platform: (item as any).author || '',
      developer: '',
      tags: item.tags || '',
      notes: item.notes,
      poster: item.poster
    })
    setShowDetails(false)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    try {
      setSyncStatus('syncing')
      const res = await fetch(`/api/watchlist/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          originalTitle: formData.originalTitle,
          year: formData.year,
          poster: formData.poster || null,
          rating: formData.rating || null,
          overview: formData.overview || null,
          genres: formData.genres,
          author: formData.platform || null,
          tags: formData.tags,
          notes: formData.notes || ''
        })
      })
      const data = await res.json()
      if (data) {
        setGameList(p => p.map(i => i.id === editingItem.id ? data : i))
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
      const item = gameList.find(i => i.id === id)
      await fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
      setGameList(p => p.filter(i => i.id !== id))
      setSyncStatus('synced')
      if (selectedItem?.id === id) { setShowDetails(false); setSelectedItem(null) }
      toast({ title: '🗑️ تم الحذف', description: `تم حذف "${item?.originalTitle || item?.title}"` })
    } catch {
      setSyncStatus('error')
      toast({ title: '❌ خطأ', description: 'حدث خطأ أثناء الحذف', variant: 'destructive' })
    }
  }

  const togglePlayed = async (id: string) => {
    const item = gameList.find(i => i.id === id)
    if (!item) return
    try {
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ watched: !item.watched }) })
      setGameList(p => p.map(i => i.id === id ? { ...i, watched: !i.watched } : i))
      toast({ title: item.watched ? '🎮 لم تُلعب بعد' : '✅ تم اللعب', description: item.watched ? 'تم إلغاء حالة اللعب' : 'تم تحديده كلُعبت' })
    } catch {}
  }

  const toggleFavorite = async (id: string) => {
    const item = gameList.find(i => i.id === id)
    if (!item) return
    try {
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ favorite: !item.favorite }) })
      setGameList(p => p.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i))
      toast({ title: item.favorite ? '💔 أُزيل من المفضلة' : '❤️ أُضيف للمفضلة', description: item.favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة' })
    } catch {}
  }

  const setUserRating = async (id: string, rating: number) => {
    try {
      await fetch(`/api/watchlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userRating: rating }) })
      setGameList(p => p.map(i => i.id === id ? { ...i, userRating: rating } : i))
    } catch {}
  }

  const exportData = () => {
    const d = JSON.stringify(gameList, null, 2)
    const b = new Blob([d], { type: 'application/json' })
    const u = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = u; a.download = `games_${new Date().toISOString().split('T')[0]}.json`; a.click()
    URL.revokeObjectURL(u)
    toast({ title: '📤 تم التصدير', description: 'تم تصدير البيانات بنجاح' })
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const r = new FileReader()
      r.onload = async (ev) => {
        try {
          const imp = JSON.parse(ev.target?.result as string)
          if (Array.isArray(imp)) {
            for (const item of imp) { await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }) }
            fetchGameList()
            toast({ title: '📥 تم الاستيراد', description: `تم استيراد ${imp.length} عنصر` })
          }
        } catch {}
      }
      r.readAsText(f)
    }
  }

  const handleLogin = () => {
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true); setShowLogin(false)
      localStorage.setItem('games_auth', 'true')
      toast({ title: '✅ مرحباً بك!', description: 'تم تسجيل الدخول بنجاح' })
    } else {
      toast({ title: '❌ خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false); setShowLogin(true)
    localStorage.removeItem('games_auth'); setPasswordInput('')
  }

  const clearFilters = () => { setSearchQuery(''); setFilterYear('all'); setFilterRating([0, 10]); setFilterStatus('all'); setFilterGenre('all') }

  const TabIcon = TAB_CONFIG[activeTab].icon

  // شاشة تسجيل الدخول
  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-full max-w-sm px-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">أريد لعبها</h1>
            <p className="text-neutral-500">أدخل كلمة المرور للدخول</p>
          </div>
          <div className="space-y-4">
            <Input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="كلمة المرور" className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-teal-500 h-12 text-center text-lg" />
            <Button onClick={handleLogin} className="w-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold h-12">دخول</Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-teal-500" /></div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-teal-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8" dir="rtl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <Button onClick={() => { window.location.href = '/' }} variant="ghost" size="icon" className="text-neutral-500 hover:text-white hover:bg-[#1a1a1a]">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">أريد لعبها</h1>
              <div className="flex items-center gap-2">
                <p className="text-neutral-500 text-sm">قائمة الألعاب</p>
                <span className={`text-xs flex items-center gap-1 ${syncStatus === 'synced' ? 'text-green-500' : syncStatus === 'syncing' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {syncStatus === 'synced' && <Cloud className="w-3 h-3" />}
                  {syncStatus === 'syncing' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {syncStatus === 'error' && <CloudOff className="w-3 h-3" />}
                  {syncStatus === 'synced' ? 'متزامن' : syncStatus === 'syncing' ? 'مزامنة...' : 'خطأ'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowStats(!showStats)} variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><BarChart3 className="w-5 h-5" /></Button>
            <Popover>
              <PopoverTrigger asChild><Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><Settings className="w-5 h-5" /></Button></PopoverTrigger>
              <PopoverContent className="w-48 bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="space-y-2">
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a]"><X className="w-4 h-4" />تسجيل خروج</Button>
                  <Button onClick={exportData} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a]"><Download className="w-4 h-4" />تصدير</Button>
                  <Button onClick={() => importInputRef.current?.click()} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a]"><UploadIcon className="w-4 h-4" />استيراد</Button>
                  <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={importData} />
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={() => { resetForm(); setShowAddDialog(true) }} className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold gap-2">
              <Plus className="w-4 h-4" />إضافة لعبة
            </Button>
          </div>
        </header>

        {showStats && (
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-teal-500" />إحصائيات الألعاب</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-teal-500">{stats.total}</p>
                <p className="text-sm text-neutral-400">إجمالي</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-cyan-400">{stats.played}</p>
                <p className="text-sm text-neutral-400">تم لعبها</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-emerald-400">{stats.favorite}</p>
                <p className="text-sm text-neutral-400">مفضلة</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                <p className="text-2xl font-bold text-teal-300">{stats.avgRating.toFixed(1)}</p>
                <p className="text-sm text-neutral-400">متوسط التقييم</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mb-6">
          {(['all', 'pc', 'console', 'mobile'] as TabType[]).map((type) => {
            const c = TAB_CONFIG[type]; const I = c.icon; const active = activeTab === type
            return (
              <button key={type} onClick={() => setActiveTab(type)} className={`rounded-xl p-3 transition-all ${active ? 'bg-gradient-to-br ' + c.color + ' text-white shadow-lg' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'}`}>
                <div className="flex items-center gap-2">
                  <I className="w-5 h-5" />
                  <div className="text-right">
                    <p className="font-bold text-sm">{c.plural}</p>
                    <p className={`text-xs ${active ? 'opacity-80' : 'text-neutral-500'}`}>{tabStats[type].played}/{tabStats[type].total}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث عن لعبة..." className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-teal-500 pr-9 h-10" />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-10">
                <ArrowUpDown className="w-4 h-4 ml-2" /><SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="addedAt">تاريخ الإضافة</SelectItem>
                <SelectItem value="title">العنوان</SelectItem>
                <SelectItem value="year">السنة</SelectItem>
                <SelectItem value="rating">التقييم</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')} className="h-10 w-10 text-neutral-400">{sortOrder === 'asc' ? '↑' : '↓'}</Button>
            <div className="flex bg-[#1a1a1a] rounded-lg p-1">
              <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' : 'text-neutral-400'}`}><Grid3X3 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={`h-8 w-8 ${viewMode === 'list' ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' : 'text-neutral-400'}`}><List className="w-4 h-4" /></Button>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`gap-2 h-10 ${showFilters ? 'border-teal-500 text-teal-500' : 'border-[#2a2a2a] text-neutral-400'}`}>
              <Filter className="w-4 h-4" />فلاتر
            </Button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#2a2a2a]">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[120px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><CalendarDays className="w-4 h-4 ml-2" /><SelectValue placeholder="السنة" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]">
                  <SelectItem value="all">كل السنوات</SelectItem>
                  {YEARS_RANGE.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="الحالة" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="watched">تم لعبها</SelectItem>
                  <SelectItem value="unwatched">لم تُلعب</SelectItem>
                  <SelectItem value="favorite">المفضلة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterGenre} onValueChange={setFilterGenre}>
                <SelectTrigger className="w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-9"><SelectValue placeholder="التصنيف" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]">
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {allGenres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-neutral-400"><X className="w-4 h-4 ml-1" />مسح</Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-400">{filteredItems.length} نتيجة</p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-teal-500/10 flex items-center justify-center mb-6">
              <Gamepad2 className="w-12 h-12 text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">{gameList.length === 0 ? 'القائمة فارغة' : 'لا توجد نتائج'}</h3>
            <p className="text-neutral-500 mb-8">{gameList.length === 0 ? 'أضف أول لعبة إلى قائمتك' : 'جرب تغيير الفلاتر'}</p>
            {gameList.length === 0 && (
              <Button onClick={() => { resetForm(); setShowAddDialog(true) }} className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
                <Plus className="w-5 h-5 ml-2" />إضافة أول لعبة
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className={`group relative rounded-xl overflow-hidden transition-all hover:scale-[1.02] ${item.watched ? 'opacity-60' : ''}`} onClick={() => { setSelectedItem(item); setShowDetails(true) }}>
                <div className="aspect-[2/3] bg-[#1a1a1a]">
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-500/10">
                      <Gamepad2 className="w-16 h-16 text-neutral-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {item.favorite && <Badge className="bg-red-500 text-white p-1"><Heart className="w-3 h-3 fill-white" /></Badge>}
                    {item.watched && <Badge className="bg-green-500 text-black"><Check className="w-3 h-3" /></Badge>}
                  </div>
                  {item.rating && <div className="absolute top-2 left-2"><Badge className="bg-black/60 text-teal-300"><Star className="w-3 h-3 ml-1 fill-teal-300" />{item.rating}</Badge></div>}
                  <div className="absolute bottom-0 right-0 left-0 p-3">
                    <h3 className="font-bold text-sm line-clamp-1">{getDisplayTitle(item)}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>{item.year}</span>
                      {(item as any).author && <span>• {(item as any).author}</span>}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" onClick={(e) => { e.stopPropagation(); removeFromList(item.id) }} className="w-9 h-9 rounded-full bg-red-500 text-white"><Trash2 className="w-4 h-4" /></Button>
                    <Button size="icon" onClick={(e) => { e.stopPropagation(); openEditDialog(item) }} className="w-9 h-9 rounded-full bg-teal-500/80 text-white"><Edit3 className="w-4 h-4" /></Button>
                    <Button size="icon" onClick={(e) => { e.stopPropagation(); togglePlayed(item.id) }} className={`w-9 h-9 rounded-full ${item.watched ? 'bg-green-500 text-black' : 'bg-white/20 text-white'}`}>{item.watched ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className={`flex gap-4 p-3 rounded-xl bg-[#1a1a1a]/50 hover:bg-[#2a2a2a]/50 cursor-pointer border border-[#2a2a2a]/50 ${item.watched ? 'opacity-60' : ''}`} onClick={() => { setSelectedItem(item); setShowDetails(true) }}>
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-500/10">
                      <Gamepad2 className="w-8 h-8 text-neutral-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold line-clamp-1">{getDisplayTitle(item)}</h3>
                    <div className="flex items-center gap-1">
                      {item.favorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                      {item.watched && <Check className="w-4 h-4 text-green-500" />}
                      {item.rating && <Badge className="bg-teal-500/20 text-teal-300"><Star className="w-3 h-3 ml-1 fill-teal-300" />{item.rating}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                    <span>{item.year}</span>
                    {(item as any).author && <span>• {(item as any).author}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* تفاصيل اللعبة */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl bg-[#0f0f0f] border-[#2a2a2a] max-h-[90vh] overflow-y-auto">
            {selectedItem && (
              <>
                <DialogHeader><DialogTitle className="text-xl">{getDisplayTitle(selectedItem)}</DialogTitle></DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-32 h-48 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                      {selectedItem.poster ? (
                        <img src={selectedItem.poster} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-teal-500/10">
                          <Gamepad2 className="w-12 h-12 text-neutral-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-teal-400">{selectedItem.year}</span>
                        {selectedItem.rating && <Badge className="bg-teal-500/20 text-teal-300"><Star className="w-3 h-3 ml-1 fill-teal-300" />{selectedItem.rating}</Badge>}
                      </div>
                      {(selectedItem as any).author && <p className="text-sm text-neutral-400">المنصة: {(selectedItem as any).author}</p>}
                    </div>
                  </div>
                  {selectedItem.overview && <div><h4 className="font-medium mb-1 text-teal-400">الوصف</h4><p className="text-sm text-neutral-300">{selectedItem.overview}</p></div>}
                  {selectedItem.notes && <div><h4 className="font-medium mb-1 text-teal-400">ملاحظاتي</h4><p className="text-sm text-neutral-300">{selectedItem.notes}</p></div>}
                  <div>
                    <h4 className="font-medium mb-2 text-teal-400">تقييمي</h4>
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9,10].map(r => (
                        <button key={r} onClick={() => setUserRating(selectedItem.id, r)} className={`w-8 h-8 rounded ${(selectedItem.userRating || 0) >= r ? 'bg-teal-500 text-white' : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a]'}`}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => togglePlayed(selectedItem.id)} className={`flex-1 ${selectedItem.watched ? 'bg-green-500 text-black' : 'bg-[#1a1a1a]'}`}>
                      {selectedItem.watched ? <EyeOff className="w-4 h-4 ml-2" /> : <Eye className="w-4 h-4 ml-2" />}
                      {selectedItem.watched ? 'لم ألعبها بعد' : 'تم لعبها'}
                    </Button>
                    <Button onClick={() => removeFromList(selectedItem.id)} variant="destructive" className="flex-1"><Trash2 className="w-4 h-4 ml-2" />حذف</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openEditDialog(selectedItem)} className="flex-1 bg-gradient-to-br from-teal-500 to-cyan-500 text-white"><Edit3 className="w-4 h-4 ml-2" />تعديل</Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* إضافة لعبة */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg bg-[#0f0f0f] border-[#2a2a2a] max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Plus className="w-5 h-5 text-teal-500" />إضافة لعبة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer ${!formData.poster ? 'bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a]' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                {formData.poster ? (
                  <>
                    <img src={formData.poster} alt="" className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, poster: '' })) }} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-neutral-500 mb-2" />
                    <p className="text-sm text-neutral-400">اسحب صورة أو انقر للرفع</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePosterUpload(f) }} />
              </div>
              {/* بحث تلقائي عن الألعاب */}
              <div className="p-3 rounded-xl bg-[#1a1a1a]/50 border border-[#2a2a2a]">
                <label className="text-sm text-neutral-400 mb-2 block">ابحث لجلب معلومات اللعبة تلقائياً</label>
                <div className="flex gap-2">
                  <Input value={metaSearchQuery} onChange={(e) => setMetaSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchGameMetadata()} placeholder="ابحث عن لعبة..." className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-teal-500 h-10 flex-1" />
                  <Button onClick={fetchGameMetadata} disabled={isFetching || !metaSearchQuery.trim()} className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white px-4">{isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}</Button>
                </div>
                {searchError && <p className="text-sm text-red-400 mt-2">{searchError}</p>}
              </div>
              {showResults && searchResults.length > 0 && (
                <div className="rounded-xl border border-teal-500/30 overflow-hidden">
                  <div className="bg-teal-500/10 px-3 py-2 border-b border-teal-500/20"><p className="text-sm text-teal-400">اختر اللعبة المناسبة:</p></div>
                  <div className="divide-y divide-[#2a2a2a] max-h-[200px] overflow-y-auto">
                    {searchResults.map((r, i) => (
                      <div key={i} className="w-full p-3 flex items-center justify-between hover:bg-teal-500/10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {r.poster && <img src={r.poster} alt="" className="w-8 h-10 rounded object-cover" />}
                            <span className="text-sm text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded">{r.year}</span>
                            <span className="font-medium text-sm">{r.originalTitle || r.title}</span>
                            {r.rating && <Badge className="bg-teal-500/20 text-teal-300 text-xs"><Star className="w-2.5 h-2.5 ml-0.5" />{r.rating}</Badge>}
                          </div>
                          {r.platform && <p className="text-xs text-neutral-500 mt-0.5">{r.platform}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => selectGameResult(r)} variant="outline" className="border-[#2a2a2a] text-xs h-7">تعديل</Button>
                          <Button size="sm" onClick={() => selectAndAddGame(r)} className="bg-teal-500 text-white text-xs h-7">إضافة</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">اسم اللعبة *</label>
                  <Input value={formData.originalTitle} onChange={(e) => setFormData(p => ({ ...p, originalTitle: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">الاسم المترجم</label>
                  <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">سنة الإصدار</label>
                  <Input value={formData.year} onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">التقييم</label>
                  <Input value={formData.rating} onChange={(e) => setFormData(p => ({ ...p, rating: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">المنصة (PC, Console, Mobile)</label>
                  <Input value={formData.platform} onChange={(e) => setFormData(p => ({ ...p, platform: e.target.value }))} placeholder="مثال: PC, PS5, Xbox, Switch, Mobile" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">التصنيفات</label>
                  <Input value={formData.genres} onChange={(e) => setFormData(p => ({ ...p, genres: e.target.value }))} placeholder="Action, RPG, Adventure" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">ملاحظات</label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[60px] resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">وصف</label>
                  <Textarea value={formData.overview} onChange={(e) => setFormData(p => ({ ...p, overview: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[60px] resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowAddDialog(false)} variant="outline" className="flex-1 border-[#2a2a2a]">إلغاء</Button>
                <Button onClick={handleAddItem} disabled={!formData.originalTitle.trim() && !formData.title.trim()} className="flex-1 bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
                  <Plus className="w-4 h-4 ml-2" />إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* تعديل لعبة */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg bg-[#0f0f0f] border-[#2a2a2a] max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-xl flex items-center gap-2"><Edit3 className="w-5 h-5 text-teal-500" />تعديل اللعبة</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer ${!formData.poster ? 'bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a]' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                {formData.poster ? (
                  <>
                    <img src={formData.poster} alt="" className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, poster: '' })) }} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-neutral-500 mb-2" />
                    <p className="text-sm text-neutral-400">اسحب صورة أو انقر للرفع</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePosterUpload(f) }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">اسم اللعبة *</label>
                  <Input value={formData.originalTitle} onChange={(e) => setFormData(p => ({ ...p, originalTitle: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">الاسم المترجم</label>
                  <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">سنة الإصدار</label>
                  <Input value={formData.year} onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">التقييم</label>
                  <Input value={formData.rating} onChange={(e) => setFormData(p => ({ ...p, rating: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">المنصة (PC, Console, Mobile)</label>
                  <Input value={formData.platform} onChange={(e) => setFormData(p => ({ ...p, platform: e.target.value }))} placeholder="مثال: PC, PS5, Xbox, Switch, Mobile" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">التصنيفات</label>
                  <Input value={formData.genres} onChange={(e) => setFormData(p => ({ ...p, genres: e.target.value }))} placeholder="Action, RPG, Adventure" className="bg-[#1a1a1a] border-[#2a2a2a] h-10" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">ملاحظات</label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[60px] resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-400 mb-1 block">وصف</label>
                  <Textarea value={formData.overview} onChange={(e) => setFormData(p => ({ ...p, overview: e.target.value }))} className="bg-[#1a1a1a] border-[#2a2a2a] min-h-[60px] resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowEditDialog(false)} variant="outline" className="flex-1 border-[#2a2a2a]">إلغاء</Button>
                <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
                  <Check className="w-4 h-4 ml-2" />حفظ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
