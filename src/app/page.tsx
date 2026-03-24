'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Plus,
  Film,
  Tv,
  Sparkles,
  Star,
  Check,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Search,
  Loader2,
  BookOpen,
  Edit3,
  Grid3X3,
  List,
  Filter,
  ArrowUpDown,
  Download,
  Upload as UploadIcon,
  BarChart3,
  CalendarDays,
  Bookmark,
  Heart,
  Settings,
  Trash2,
  Cloud,
  CloudOff
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ==================== أنواع البيانات ====================

interface MediaItem {
  id: string
  title: string
  originalTitle?: string
  year: string
  type: 'anime' | 'series' | 'movie' | 'book'
  poster: string
  rating: string
  overview: string
  genres: string[]
  episodes?: number
  seasons?: number
  duration?: string
  status?: string
  author?: string
  pages?: number
  tags: string[]
  notes: string
  favorite: boolean
  addedAt: string
  watchedAt?: string
  watched: boolean
  userRating?: number
}

interface SearchResult {
  title: string
  originalTitle: string
  year: string
  rating: string
  overview: string
  genres: string[]
  episodes?: number
  seasons?: number
  duration?: string
  status?: string
  author?: string
  pages?: number
}

type TabType = 'all' | 'anime' | 'series' | 'movie' | 'book'
type ViewMode = 'grid' | 'list'
type SortBy = 'addedAt' | 'title' | 'year' | 'rating' | 'userRating'
type SortOrder = 'asc' | 'desc'

// ==================== إعدادات الأنواع ====================

const TYPE_CONFIG = {
  all: {
    icon: Bookmark,
    label: 'الكل',
    plural: 'جميع الأعمال',
    color: 'from-[#d4af37] to-[#b8960f]',
    bgColor: 'bg-[#d4af37]/10',
  },
  anime: {
    icon: Sparkles,
    label: 'أنمي',
    plural: 'أنميات',
    color: 'from-[#c9a227] to-[#a07d00]',
    bgColor: 'bg-[#c9a227]/10',
  },
  series: {
    icon: Tv,
    label: 'مسلسل',
    plural: 'مسلسلات',
    color: 'from-[#e6c65a] to-[#c9a227]',
    bgColor: 'bg-[#e6c65a]/10',
  },
  movie: {
    icon: Film,
    label: 'فيلم',
    plural: 'أفلام',
    color: 'from-[#d4af37] to-[#b8960f]',
    bgColor: 'bg-[#d4af37]/10',
  },
  book: {
    icon: BookOpen,
    label: 'كتاب',
    plural: 'كتب',
    color: 'from-[#f0d77a] to-[#d4af37]',
    bgColor: 'bg-[#f0d77a]/10',
  }
}

const YEARS_RANGE = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

// ==================== دوال مساعدة ====================

// دالة للحصول على العنوان للعرض الخارجي - دائماً إنكليزي لغير الكتب
const getDisplayTitle = (item: MediaItem): string => {
  if (item.type === 'book') {
    return item.title || item.originalTitle || ''
  }
  // للأفلام والمسلسلات والأنمي - دائماً نعرض العنوان الإنكليزي
  return item.originalTitle || item.title || ''
}

// ضغط الصورة قبل التخزين
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
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedData = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedData)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// ==================== المكون الرئيسي ====================

export default function WatchListPage() {
  const { toast } = useToast()
  
  // الحالات الأساسية
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [watchList, setWatchList] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced')

  // حالات النوافذ
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [addType, setAddType] = useState<'movie' | 'series' | 'anime' | 'book'>('movie')

  // حالات العرض والفلاتر
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

  // حالات النموذج
  const [metaSearchQuery, setMetaSearchQuery] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    originalTitle: '',
    year: new Date().getFullYear().toString(),
    rating: '',
    overview: '',
    genres: '',
    episodes: '',
    seasons: '',
    duration: '',
    status: '',
    author: '',
    pages: '',
    tags: '',
    notes: '',
    poster: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // ==================== التحميل والحفظ ====================

  const fetchWatchList = useCallback(async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/watchlist')
      const data = await response.json()

      if (data.items) {
        setWatchList(data.items)
        setLastSaved(new Date())
        setSyncStatus('synced')
        setIsOnline(true)
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error)
      setSyncStatus('error')
      setIsOnline(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWatchList()
  }, [fetchWatchList])

  useEffect(() => {
    if (activeTab !== 'all') {
      setAddType(activeTab)
    }
  }, [activeTab])

  // ==================== الحسابات ====================

  const allGenres = useMemo(() => {
    const genres = new Set<string>()
    watchList.forEach(item => item.genres.forEach(g => genres.add(g)))
    return Array.from(genres).sort()
  }, [watchList])

  const filteredItems = useMemo(() => {
    let items = activeTab === 'all' ? watchList : watchList.filter(item => item.type === activeTab)

    if (activeTab === 'all' && filterType !== 'all') {
      items = items.filter(item => item.type === filterType)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.originalTitle?.toLowerCase().includes(query) ||
        item.genres.some(g => g.toLowerCase().includes(query)) ||
        item.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    if (filterYear !== 'all') {
      items = items.filter(item => item.year === filterYear)
    }

    items = items.filter(item => {
      const rating = parseFloat(item.rating) || 0
      return rating >= filterRating[0] && rating <= filterRating[1]
    })

    if (filterStatus === 'watched') {
      items = items.filter(item => item.watched)
    } else if (filterStatus === 'unwatched') {
      items = items.filter(item => !item.watched)
    } else if (filterStatus === 'favorite') {
      items = items.filter(item => item.favorite)
    }

    if (filterGenre !== 'all') {
      items = items.filter(item => item.genres.includes(filterGenre))
    }

    items.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = getDisplayTitle(a).localeCompare(getDisplayTitle(b))
          break
        case 'year':
          comparison = parseInt(a.year) - parseInt(b.year)
          break
        case 'rating':
          comparison = (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0)
          break
        case 'userRating':
          comparison = (a.userRating || 0) - (b.userRating || 0)
          break
        case 'addedAt':
        default:
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return items
  }, [watchList, activeTab, searchQuery, filterYear, filterRating, filterStatus, filterGenre, filterType, sortBy, sortOrder])

  const stats = useMemo(() => {
    const items = activeTab === 'all' ? watchList : watchList.filter(item => item.type === activeTab)
    return {
      total: items.length,
      watched: items.filter(i => i.watched).length,
      favorite: items.filter(i => i.favorite).length,
      avgRating: items.reduce((acc, i) => acc + (parseFloat(i.rating) || 0), 0) / (items.length || 1),
      byGenre: items.reduce((acc, i) => {
        i.genres.forEach(g => acc[g] = (acc[g] || 0) + 1)
        return acc
      }, {} as Record<string, number>),
    }
  }, [watchList, activeTab])

  const tabStats = {
    all: { total: watchList.length, watched: watchList.filter(i => i.watched).length },
    anime: { total: watchList.filter(i => i.type === 'anime').length, watched: watchList.filter(i => i.type === 'anime' && i.watched).length },
    series: { total: watchList.filter(i => i.type === 'series').length, watched: watchList.filter(i => i.type === 'series' && i.watched).length },
    movie: { total: watchList.filter(i => i.type === 'movie').length, watched: watchList.filter(i => i.type === 'movie' && i.watched).length },
    book: { total: watchList.filter(i => i.type === 'book').length, watched: watchList.filter(i => i.type === 'book' && i.watched).length }
  }

  // ==================== الدوال ====================

  const handlePosterUpload = useCallback(async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedImage = await compressImage(file, 400, 600, 0.7)
        setFormData(prev => ({ ...prev, poster: compressedImage }))
      } catch (error) {
        console.error('Failed to compress image:', error)
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData(prev => ({ ...prev, poster: e.target?.result as string }))
        }
        reader.readAsDataURL(file)
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    handlePosterUpload(file)
  }, [handlePosterUpload])

  const fetchMetadata = async () => {
    if (!metaSearchQuery.trim()) return

    setIsFetching(true)
    setSearchResults([])
    setSearchError('')

    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: metaSearchQuery,
          type: addType
        })
      })

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results)
        setShowResults(true)
      } else {
        setSearchError(data.error || 'لم يتم العثور على نتائج')
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
      setSearchError('حدث خطأ أثناء البحث')
    } finally {
      setIsFetching(false)
    }
  }

  const selectResult = (result: SearchResult) => {
    setFormData(prev => ({
      ...prev,
      title: result.originalTitle || result.title || '',
      originalTitle: result.originalTitle || result.title || '',
      year: result.year || prev.year,
      rating: result.rating || '',
      overview: result.overview || '',
      genres: Array.isArray(result.genres) ? result.genres.join(', ') : '',
      episodes: result.episodes?.toString() || '',
      seasons: result.seasons?.toString() || '',
      duration: result.duration || '',
      status: result.status || '',
      author: result.author || '',
      pages: result.pages?.toString() || '',
    }))
    setShowResults(false)
    setSearchResults([])
    setSearchError('')
  }

  const handleAddItem = async () => {
    const mainTitle = formData.originalTitle || formData.title
    if (!mainTitle.trim()) return

    try {
      setSyncStatus('syncing')

      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || '',
          originalTitle: formData.originalTitle || formData.title || undefined,
          year: formData.year || new Date().getFullYear().toString(),
          type: addType,
          poster: formData.poster || undefined,
          rating: formData.rating || undefined,
          overview: formData.overview || undefined,
          genres: formData.genres.split(',').map(g => g.trim()).filter(Boolean),
          episodes: formData.episodes ? parseInt(formData.episodes) : undefined,
          seasons: formData.seasons ? parseInt(formData.seasons) : undefined,
          duration: formData.duration || undefined,
          status: formData.status || undefined,
          author: formData.author || undefined,
          pages: formData.pages ? parseInt(formData.pages) : undefined,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          notes: formData.notes || undefined,
        })
      })

      const data = await response.json()

      if (data.item) {
        setWatchList(prev => [data.item, ...prev])
        setLastSaved(new Date())
        setSyncStatus('synced')
        
        // إظهار إشعار النجاح
        toast({
          title: "تمت الإضافة بنجاح ✓",
          description: `تم إضافة "${getDisplayTitle(data.item)}" إلى قائمتك`,
          className: "bg-[#1a1a1a] border-[#d4af37] text-white",
        })
      }

      resetForm()
      setShowAddDialog(false)
    } catch (error) {
      console.error('Failed to add item:', error)
      setSyncStatus('error')
      toast({
        title: "حدث خطأ",
        description: "لم يتم إضافة العنصر، حاول مرة أخرى",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setMetaSearchQuery('')
    setSearchResults([])
    setShowResults(false)
    setSearchError('')
    setFormData({
      title: '',
      originalTitle: '',
      year: new Date().getFullYear().toString(),
      rating: '',
      overview: '',
      genres: '',
      episodes: '',
      seasons: '',
      duration: '',
      status: '',
      author: '',
      pages: '',
      tags: '',
      notes: '',
      poster: ''
    })
  }

  const openEditDialog = (item: MediaItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      originalTitle: item.originalTitle || '',
      year: item.year,
      rating: item.rating,
      overview: item.overview,
      genres: item.genres.join(', '),
      episodes: item.episodes?.toString() || '',
      seasons: item.seasons?.toString() || '',
      duration: item.duration || '',
      status: item.status || '',
      author: item.author || '',
      pages: item.pages?.toString() || '',
      tags: item.tags.join(', '),
      notes: item.notes,
      poster: item.poster
    })
    setShowDetails(false)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    const mainTitle = formData.originalTitle || formData.title
    if (!mainTitle.trim() || !editingItem) return

    try {
      setSyncStatus('syncing')

      const response = await fetch(`/api/watchlist/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || '',
          originalTitle: formData.originalTitle || formData.title || undefined,
          year: formData.year,
          poster: formData.poster || undefined,
          rating: formData.rating || undefined,
          overview: formData.overview || undefined,
          genres: formData.genres.split(',').map(g => g.trim()).filter(Boolean),
          episodes: formData.episodes ? parseInt(formData.episodes) : undefined,
          seasons: formData.seasons ? parseInt(formData.seasons) : undefined,
          duration: formData.duration || undefined,
          status: formData.status || undefined,
          author: formData.author || undefined,
          pages: formData.pages ? parseInt(formData.pages) : undefined,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          notes: formData.notes || undefined,
        })
      })

      const data = await response.json()

      if (data.item) {
        setWatchList(prev => prev.map(item =>
          item.id === editingItem.id ? data.item : item
        ))
        setLastSaved(new Date())
        setSyncStatus('synced')
        
        toast({
          title: "تم التحديث بنجاح ✓",
          description: `تم تحديث "${getDisplayTitle(data.item)}"`,
          className: "bg-[#1a1a1a] border-[#d4af37] text-white",
        })
      }

      setShowEditDialog(false)
      setEditingItem(null)
      resetForm()
    } catch (error) {
      console.error('Failed to save edit:', error)
      setSyncStatus('error')
      toast({
        title: "حدث خطأ",
        description: "لم يتم حفظ التعديلات",
        variant: "destructive",
      })
    }
  }

  const removeFromList = async (id: string) => {
    try {
      setSyncStatus('syncing')

      await fetch(`/api/watchlist/${id}`, {
        method: 'DELETE'
      })

      setWatchList(prev => prev.filter(item => item.id !== id))
      setLastSaved(new Date())
      setSyncStatus('synced')
      
      toast({
        title: "تم الحذف ✓",
        description: "تم إزالة العنصر من قائمتك",
        className: "bg-[#1a1a1a] border-[#d4af37] text-white",
      })

      if (selectedItem?.id === id) {
        setShowDetails(false)
        setSelectedItem(null)
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      setSyncStatus('error')
    }
  }

  const toggleWatched = async (id: string) => {
    const item = watchList.find(i => i.id === id)
    if (!item) return

    try {
      await fetch(`/api/watchlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watched: !item.watched,
          watchedAt: !item.watched ? new Date().toISOString() : null
        })
      })

      setWatchList(prev => prev.map(i =>
        i.id === id ? {
          ...i,
          watched: !i.watched,
          watchedAt: !i.watched ? new Date().toISOString() : undefined
        } : i
      ))
      
      toast({
        title: item.watched ? "تم إلغاء المشاهدة" : "تمت المشاهدة ✓",
        description: item.watched ? "تم وضع علامة غير مشاهد" : "تم وضع علامة تمت المشاهدة",
        className: "bg-[#1a1a1a] border-[#d4af37] text-white",
      })
    } catch (error) {
      console.error('Failed to toggle watched:', error)
    }
  }

  const toggleFavorite = async (id: string) => {
    const item = watchList.find(i => i.id === id)
    if (!item) return

    try {
      await fetch(`/api/watchlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favorite: !item.favorite
        })
      })

      setWatchList(prev => prev.map(i =>
        i.id === id ? { ...i, favorite: !i.favorite } : i
      ))
      
      toast({
        title: item.favorite ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة ❤️",
        className: "bg-[#1a1a1a] border-[#d4af37] text-white",
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const setUserRating = async (id: string, rating: number) => {
    try {
      await fetch(`/api/watchlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRating: rating
        })
      })

      setWatchList(prev => prev.map(i =>
        i.id === id ? { ...i, userRating: rating } : i
      ))
    } catch (error) {
      console.error('Failed to set user rating:', error)
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(watchList, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `watchlist_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "تم التصدير ✓",
      description: "تم تصدير البيانات بنجاح",
      className: "bg-[#1a1a1a] border-[#d4af37] text-white",
    })
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string)
          if (Array.isArray(imported)) {
            for (const item of imported) {
              await fetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              })
            }
            fetchWatchList()
            toast({
              title: "تم الاستيراد ✓",
              description: `تم استيراد ${imported.length} عنصر`,
              className: "bg-[#1a1a1a] border-[#d4af37] text-white",
            })
          }
        } catch {
          toast({
            title: "خطأ في الاستيراد",
            description: "لم نتمكن من قراءة الملف",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterYear('all')
    setFilterRating([0, 10])
    setFilterStatus('all')
    setFilterGenre('all')
    setFilterType('all')
  }

  const TypeIcon = TYPE_CONFIG[activeTab].icon
  const currentType = editingItem?.type || addType

  // ==================== العرض ====================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4af37]" />
          <p className="text-neutral-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* خلفية متدرجة */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#d4af37]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#b8960f]/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8" dir="rtl">

        {/* ==================== الهيدر ==================== */}
        <header className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-2 sm:gap-4">
          {/* الجهة اليمنى - الشعار والعنوان */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8960f] flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
              <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">أرشيفي</h1>
              <div className="flex items-center gap-2">
                <p className="text-neutral-500 text-xs sm:text-sm hidden sm:block">قائمة المشاهدات والقراءة</p>
                <span className={`flex text-xs items-center gap-1 ${
                  syncStatus === 'synced' ? 'text-green-500' :
                  syncStatus === 'syncing' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {syncStatus === 'synced' && <Cloud className="w-3 h-3" />}
                  {syncStatus === 'syncing' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {syncStatus === 'error' && <CloudOff className="w-3 h-3" />}
                  <span className="hidden sm:inline">{syncStatus === 'synced' ? 'متزامن' : syncStatus === 'syncing' ? 'جاري المزامنة...' : 'خطأ'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* الجهة اليسرى - الأزرار */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <Button
              onClick={() => setShowStats(!showStats)}
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-neutral-400 hover:text-white hover:bg-[#1a1a1a] h-9 w-9"
            >
              <BarChart3 className="w-5 h-5" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-[#1a1a1a] h-9 w-9 sm:h-10 sm:w-10">
                  <Settings className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 sm:w-48 bg-[#1a1a1a] border-[#2a2a2a]" align="start">
                <div className="space-y-1">
                  <Button onClick={exportData} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a] h-9 text-sm">
                    <Download className="w-4 h-4" />
                    تصدير البيانات
                  </Button>
                  <Button onClick={() => importInputRef.current?.click()} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a] h-9 text-sm">
                    <UploadIcon className="w-4 h-4" />
                    استيراد البيانات
                  </Button>
                  <Button onClick={() => setShowStats(!showStats)} variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-[#2a2a2a] h-9 text-sm lg:hidden">
                    <BarChart3 className="w-4 h-4" />
                    الإحصائيات
                  </Button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={importData}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => {
                resetForm()
                setShowAddDialog(true)
              }}
              className="bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 md:px-5 shadow-lg shadow-[#d4af37]/20 flex-shrink-0 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة</span>
            </Button>
          </div>
        </header>

        {/* ==================== لوحة الإحصائيات ==================== */}
        {showStats && (
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="w-5 h-5 text-[#d4af37]" />
              إحصائيات {TYPE_CONFIG[activeTab].plural}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 border border-[#2a2a2a]">
                <p className="text-xl sm:text-2xl font-bold text-[#d4af37]">{stats.total}</p>
                <p className="text-xs sm:text-sm text-neutral-400">إجمالي</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 border border-[#2a2a2a]">
                <p className="text-xl sm:text-2xl font-bold text-[#f0d77a]">{stats.watched}</p>
                <p className="text-xs sm:text-sm text-neutral-400">تمت المشاهدة</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 border border-[#2a2a2a]">
                <p className="text-xl sm:text-2xl font-bold text-[#e6c65a]">{stats.favorite}</p>
                <p className="text-xs sm:text-sm text-neutral-400">مفضلة</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 border border-[#2a2a2a]">
                <p className="text-xl sm:text-2xl font-bold text-[#c9a227]">{stats.avgRating.toFixed(1)}</p>
                <p className="text-xs sm:text-sm text-neutral-400">متوسط التقييم</p>
              </div>
            </div>
            {Object.keys(stats.byGenre).length > 0 && (
              <div>
                <p className="text-xs sm:text-sm text-neutral-400 mb-2">أكثر التصنيفات:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.byGenre)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([genre, count]) => (
                      <Badge key={genre} className="bg-[#1a1a1a] text-neutral-300 border border-[#2a2a2a] text-xs sm:text-sm">
                        {genre} ({count})
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== تبويبات التصنيف ==================== */}
        <div className="flex overflow-x-auto gap-1.5 sm:gap-2 mb-4 sm:mb-6 pb-2 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8 scrollbar-hide">
          {(['all', 'movie', 'series', 'anime', 'book'] as TabType[]).map((type) => {
            const config = TYPE_CONFIG[type]
            const Icon = config.icon
            const isActive = activeTab === type

            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`relative overflow-hidden rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 transition-all duration-300 flex-shrink-0 min-w-[75px] sm:min-w-[90px] md:min-w-[100px] ${
                  isActive
                    ? 'bg-gradient-to-br ' + config.color + ' text-[#0a0a0a] shadow-lg shadow-[#d4af37]/20'
                    : 'bg-[#1a1a1a] text-neutral-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <div className="text-right">
                    <p className="font-bold text-xs sm:text-sm">{config.plural}</p>
                    <p className={`text-[10px] sm:text-xs ${isActive ? 'opacity-80' : 'text-neutral-500'}`}>
                      {tabStats[type].watched}/{tabStats[type].total}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* ==================== شريط البحث والفلاتر ==================== */}
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          {/* الصف الأول: البحث والأزرار الأساسية */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث..."
                className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] pr-9 h-9 sm:h-10 text-white text-sm"
              />
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="hidden md:flex w-[140px] bg-[#1a1a1a] border-[#2a2a2a] h-10 text-white text-sm">
                <ArrowUpDown className="w-4 h-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="addedAt">تاريخ الإضافة</SelectItem>
                <SelectItem value="title">العنوان</SelectItem>
                <SelectItem value="year">السنة</SelectItem>
                <SelectItem value="rating">التقييم</SelectItem>
                <SelectItem value="userRating">تقييمي</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="h-9 w-9 sm:h-10 sm:w-10 text-neutral-400 hover:text-white hover:bg-[#1a1a1a] flex-shrink-0"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>

            <div className="flex bg-[#1a1a1a] rounded-lg p-0.5 sm:p-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`h-7 w-7 sm:h-8 sm:w-8 ${viewMode === 'grid' ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a]' : 'text-neutral-400'}`}
              >
                <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={`h-7 w-7 sm:h-8 sm:w-8 ${viewMode === 'list' ? 'bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a]' : 'text-neutral-400'}`}
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 md:px-4 flex-shrink-0 text-sm ${showFilters ? 'border-[#d4af37] text-[#d4af37]' : 'border-[#2a2a2a] text-neutral-400'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">فلاتر</span>
            </Button>
          </div>

          {/* الفلاتر الموسعة */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#2a2a2a]">
              {activeTab === 'all' && (
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[85px] sm:w-[100px] bg-[#1a1a1a] border-[#2a2a2a] h-9 text-white text-sm">
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    <SelectItem value="movie">أفلام</SelectItem>
                    <SelectItem value="series">مسلسلات</SelectItem>
                    <SelectItem value="anime">أنمي</SelectItem>
                    <SelectItem value="book">كتب</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[95px] sm:w-[120px] bg-[#1a1a1a] border-[#2a2a2a] h-9 text-white text-sm">
                  <CalendarDays className="w-3.5 h-3.5 ml-1.5" />
                  <SelectValue placeholder="السنة" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]">
                  <SelectItem value="all">كل السنوات</SelectItem>
                  {YEARS_RANGE.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[100px] sm:w-[130px] bg-[#1a1a1a] border-[#2a2a2a] h-9 text-white text-sm">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="watched">تمت المشاهدة</SelectItem>
                  <SelectItem value="unwatched">لم تُشاهد</SelectItem>
                  <SelectItem value="favorite">المفضلة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterGenre} onValueChange={setFilterGenre}>
                <SelectTrigger className="w-[100px] sm:w-[130px] bg-[#1a1a1a] border-[#2a2a2a] h-9 text-white text-sm">
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[200px]">
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {allGenres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-neutral-400">التقييم:</span>
                <div className="w-24">
                  <Slider
                    value={filterRating}
                    onValueChange={(v) => setFilterRating(v as [number, number])}
                    min={0}
                    max={10}
                    step={0.5}
                    className="py-2"
                  />
                </div>
                <span className="text-xs text-neutral-400">{filterRating[0]}-{filterRating[1]}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-neutral-400 hover:text-white mr-auto"
              >
                مسح الفلاتر
              </Button>
            </div>
          )}
        </div>

        {/* ==================== قائمة العناصر ==================== */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
              <TypeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">لا توجد عناصر</h3>
            <p className="text-neutral-500 text-sm sm:text-base mb-4 px-4">
              {searchQuery || filterYear !== 'all' || filterStatus !== 'all' || filterGenre !== 'all'
                ? 'جرب تغيير الفلاتر أو البحث بكلمات أخرى'
                : `ابدأ بإضافة ${TYPE_CONFIG[activeTab].plural} إلى قائمتك`}
            </p>
            <Button
              onClick={() => {
                resetForm()
                setShowAddDialog(true)
              }}
              className="bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة {TYPE_CONFIG[activeTab].label}
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {filteredItems.map((item) => {
              const ItemIcon = TYPE_CONFIG[item.type].icon
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item)
                    setShowDetails(true)
                  }}
                  className="group relative bg-[#0f0f0f] rounded-lg sm:rounded-xl overflow-hidden cursor-pointer border border-[#2a2a2a]/50 hover:border-[#d4af37]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/10 active:scale-[0.98]"
                >
                  {/* البوستر */}
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={getDisplayTitle(item)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                        <ItemIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#d4af37]/30" />
                      </div>
                    )}

                    {/* شارات الحالة */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {item.watched && (
                        <div className="bg-green-500/90 backdrop-blur-sm rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {item.favorite && (
                        <div className="bg-red-500/90 backdrop-blur-sm rounded-full p-1">
                          <Heart className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* نوع العمل */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`${TYPE_CONFIG[item.type].bgColor} text-[10px] sm:text-xs border-0 px-1.5 sm:px-2 py-0.5`}>
                        {TYPE_CONFIG[item.type].label}
                      </Badge>
                    </div>

                    {/* التقييم */}
                    {item.rating && (
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37]" />
                        <span className="text-[10px] sm:text-xs text-white font-medium">{item.rating}</span>
                      </div>
                    )}

                    {/* السنة */}
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1">
                      <span className="text-[10px] sm:text-xs text-white">{item.year}</span>
                    </div>

                    {/* تقييم المستخدم */}
                    {item.userRating && (
                      <div className="absolute bottom-8 left-2 bg-[#d4af37]/90 backdrop-blur-sm rounded-md px-1.5 sm:px-2 py-0.5 flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#0a0a0a] fill-[#0a0a0a]" />
                        <span className="text-[10px] sm:text-xs text-[#0a0a0a] font-bold">{item.userRating}/10</span>
                      </div>
                    )}
                  </div>

                  {/* معلومات العنوان */}
                  <div className="p-2 sm:p-3">
                    <h3 className="font-semibold text-xs sm:text-sm text-white line-clamp-1 mb-0.5 sm:mb-1" title={getDisplayTitle(item)}>
                      {getDisplayTitle(item)}
                    </h3>
                    {item.type === 'book' && item.originalTitle && item.originalTitle !== item.title && (
                      <p className="text-[10px] sm:text-xs text-neutral-500 line-clamp-1" dir="ltr">{item.originalTitle}</p>
                    )}
                    {item.type !== 'book' && item.title && item.title !== item.originalTitle && (
                      <p className="text-[10px] sm:text-xs text-neutral-500 line-clamp-1">{item.title}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredItems.map((item) => {
              const ItemIcon = TYPE_CONFIG[item.type].icon
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item)
                    setShowDetails(true)
                  }}
                  className="group flex gap-3 sm:gap-4 bg-[#0f0f0f] rounded-lg sm:rounded-xl p-2 sm:p-3 cursor-pointer border border-[#2a2a2a]/50 hover:border-[#d4af37]/30 transition-all duration-300 active:scale-[0.99]"
                >
                  {/* البوستر */}
                  <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 flex-shrink-0 rounded-md sm:rounded-lg overflow-hidden">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={getDisplayTitle(item)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                        <ItemIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af37]/30" />
                      </div>
                    )}
                  </div>

                  {/* المعلومات */}
                  <div className="flex-1 min-w-0 py-0.5 sm:py-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-white line-clamp-1">
                          {getDisplayTitle(item)}
                        </h3>
                        {item.type === 'book' && item.originalTitle && item.originalTitle !== item.title && (
                          <p className="text-xs sm:text-sm text-neutral-500 line-clamp-1" dir="ltr">{item.originalTitle}</p>
                        )}
                        {item.type !== 'book' && item.title && item.title !== item.originalTitle && (
                          <p className="text-xs sm:text-sm text-neutral-500 line-clamp-1">{item.title}</p>
                        )}
                      </div>
                      <Badge className={`${TYPE_CONFIG[item.type].bgColor} text-[10px] sm:text-xs flex-shrink-0`}>
                        {TYPE_CONFIG[item.type].label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-xs sm:text-sm text-neutral-400">
                      <span>{item.year}</span>
                      {item.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37] fill-[#d4af37]" />
                          {item.rating}
                        </span>
                      )}
                      {item.episodes && <span>{item.episodes} حلقة</span>}
                      {item.seasons && <span>{item.seasons} موسم</span>}
                      {item.duration && <span>{item.duration}</span>}
                      {item.pages && <span>{item.pages} صفحة</span>}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
                      {item.genres.slice(0, 3).map(genre => (
                        <Badge key={genre} variant="outline" className="text-[10px] sm:text-xs py-0 h-4 sm:h-5 border-[#2a2a2a] text-neutral-400">
                          {genre}
                        </Badge>
                      ))}
                      {item.genres.length > 3 && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs py-0 h-4 sm:h-5 border-[#2a2a2a] text-neutral-400">
                          +{item.genres.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* أزرار الإجراءات السريعة */}
                    <div className="flex items-center gap-2 mt-2 sm:mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWatched(item.id)
                        }}
                        className={`h-7 sm:h-8 px-2 sm:px-3 text-xs ${item.watched ? 'text-green-500 hover:text-green-400' : 'text-neutral-400 hover:text-white'}`}
                      >
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
                        <span className="hidden sm:inline">{item.watched ? 'تمت المشاهدة' : 'شاهدتُه'}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(item.id)
                        }}
                        className={`h-7 sm:h-8 px-2 sm:px-3 text-xs ${item.favorite ? 'text-red-500 hover:text-red-400' : 'text-neutral-400 hover:text-white'}`}
                      >
                        <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 ${item.favorite ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">مفضل</span>
                      </Button>
                      {item.userRating && (
                        <div className="flex items-center gap-1 text-xs text-[#d4af37] mr-auto">
                          <Star className="w-3 h-3 fill-current" />
                          {item.userRating}/10
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ==================== نافذة التفاصيل ==================== */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f0f0f] border-[#2a2a2a] text-white p-0 gap-0 rounded-lg sm:rounded-xl">
            {selectedItem && (
              <>
                {/* البوستر */}
                <div className="relative h-48 sm:h-64 md:h-72">
                  {selectedItem.poster ? (
                    <img
                      src={selectedItem.poster}
                      alt={getDisplayTitle(selectedItem)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                      {(() => {
                        const ItemIcon = TYPE_CONFIG[selectedItem.type].icon
                        return <ItemIcon className="w-16 h-16 sm:w-20 sm:h-20 text-[#d4af37]/30" />
                      })()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                  
                  {/* إغلاق */}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="absolute top-2 sm:top-4 left-2 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* شارات */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-2">
                    {selectedItem.watched && (
                      <div className="bg-green-500/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        <span className="text-xs sm:text-sm text-white font-medium">تمت المشاهدة</span>
                      </div>
                    )}
                    {selectedItem.favorite && (
                      <div className="bg-red-500/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
                        <span className="text-xs sm:text-sm text-white font-medium">مفضل</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* المحتوى */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Badge className={`${TYPE_CONFIG[selectedItem.type].bgColor} text-xs sm:text-sm`}>
                      {TYPE_CONFIG[selectedItem.type].label}
                    </Badge>
                    <span className="text-neutral-400 text-sm sm:text-base">{selectedItem.year}</span>
                    {selectedItem.rating && (
                      <span className="flex items-center gap-1 text-sm sm:text-base">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37] fill-[#d4af37]" />
                        <span className="text-[#d4af37] font-medium">{selectedItem.rating}</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{getDisplayTitle(selectedItem)}</h2>
                  {selectedItem.type === 'book' && selectedItem.originalTitle && selectedItem.originalTitle !== selectedItem.title && (
                    <p className="text-sm sm:text-base text-neutral-400 mb-2 sm:mb-3" dir="ltr">{selectedItem.originalTitle}</p>
                  )}
                  {selectedItem.type !== 'book' && selectedItem.title && selectedItem.title !== selectedItem.originalTitle && (
                    <p className="text-sm sm:text-base text-neutral-400 mb-2 sm:mb-3">{selectedItem.title}</p>
                  )}

                  {/* معلومات إضافية */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm">
                    {selectedItem.episodes && (
                      <div className="bg-[#1a1a1a] rounded-lg p-2 sm:p-3">
                        <p className="text-neutral-400">الحلقات</p>
                        <p className="text-white font-medium">{selectedItem.episodes}</p>
                      </div>
                    )}
                    {selectedItem.seasons && (
                      <div className="bg-[#1a1a1a] rounded-lg p-2 sm:p-3">
                        <p className="text-neutral-400">المواسم</p>
                        <p className="text-white font-medium">{selectedItem.seasons}</p>
                      </div>
                    )}
                    {selectedItem.duration && (
                      <div className="bg-[#1a1a1a] rounded-lg p-2 sm:p-3">
                        <p className="text-neutral-400">المدة</p>
                        <p className="text-white font-medium">{selectedItem.duration}</p>
                      </div>
                    )}
                    {selectedItem.author && (
                      <div className="bg-[#1a1a1a] rounded-lg p-2 sm:p-3">
                        <p className="text-neutral-400">المؤلف</p>
                        <p className="text-white font-medium line-clamp-1">{selectedItem.author}</p>
                      </div>
                    )}
                    {selectedItem.pages && (
                      <div className="bg-[#1a1a1a] rounded-lg p-2 sm:p-3">
                        <p className="text-neutral-400">الصفحات</p>
                        <p className="text-white font-medium">{selectedItem.pages}</p>
                      </div>
                    )}
                    {selectedItem.status && (
                      <div className="bg-[#1a1a1a] rounded-lg p-2 sm:p-3">
                        <p className="text-neutral-400">الحالة</p>
                        <p className="text-white font-medium">{selectedItem.status}</p>
                      </div>
                    )}
                  </div>

                  {/* التصنيفات */}
                  {selectedItem.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {selectedItem.genres.map(genre => (
                        <Badge key={genre} variant="outline" className="text-xs sm:text-sm border-[#d4af37]/30 text-[#d4af37]">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* الوصف */}
                  {selectedItem.overview && (
                    <div className="mb-3 sm:mb-4">
                      <h4 className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">الوصف</h4>
                      <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">{selectedItem.overview}</p>
                    </div>
                  )}

                  {/* تقييم المستخدم */}
                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">تقييمي</h4>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {[...Array(10)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setUserRating(selectedItem.id, i + 1)}
                          className="p-0.5 sm:p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              i < (selectedItem.userRating || 0)
                                ? 'text-[#d4af37] fill-[#d4af37]'
                                : 'text-neutral-600'
                            }`}
                          />
                        </button>
                      ))}
                      {selectedItem.userRating && (
                        <button
                          onClick={() => setUserRating(selectedItem.id, 0)}
                          className="mr-2 text-xs text-neutral-500 hover:text-white"
                        >
                          مسح
                        </button>
                      )}
                    </div>
                  </div>

                  {/* الملاحظات */}
                  {selectedItem.notes && (
                    <div className="mb-3 sm:mb-4">
                      <h4 className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">ملاحظاتي</h4>
                      <p className="text-neutral-400 text-xs sm:text-sm whitespace-pre-wrap">{selectedItem.notes}</p>
                    </div>
                  )}

                  {/* الوسوم */}
                  {selectedItem.tags.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                      <h4 className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">الوسوم</h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {selectedItem.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs sm:text-sm border-[#2a2a2a] text-neutral-400">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* أزرار الإجراءات */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#2a2a2a]">
                    <Button
                      onClick={() => toggleWatched(selectedItem.id)}
                      className={`flex-1 min-w-[120px] ${selectedItem.watched ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'}`}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      {selectedItem.watched ? 'إلغاء المشاهدة' : 'تمت المشاهدة'}
                    </Button>
                    <Button
                      onClick={() => toggleFavorite(selectedItem.id)}
                      className={`flex-1 min-w-[120px] ${selectedItem.favorite ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'}`}
                    >
                      <Heart className={`w-4 h-4 ml-2 ${selectedItem.favorite ? 'fill-current' : ''}`} />
                      {selectedItem.favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    </Button>
                    <Button
                      onClick={() => openEditDialog(selectedItem)}
                      className="bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] min-w-[80px] sm:min-w-[100px]"
                    >
                      <Edit3 className="w-4 h-4 ml-2" />
                      <span className="hidden sm:inline">تعديل</span>
                    </Button>
                    <Button
                      onClick={() => {
                        removeFromList(selectedItem.id)
                        setShowDetails(false)
                      }}
                      variant="destructive"
                      className="min-w-[80px] sm:min-w-[100px]"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      <span className="hidden sm:inline">حذف</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ==================== نافذة الإضافة ==================== */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f0f0f] border-[#2a2a2a] text-white rounded-lg sm:rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">إضافة {TYPE_CONFIG[addType].label} جديد</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* اختيار النوع */}
              <div className="flex gap-2">
                {(['movie', 'series', 'anime', 'book'] as const).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setAddType(type)}
                    className={`flex-1 text-xs sm:text-sm ${addType === type ? 'bg-gradient-to-br ' + TYPE_CONFIG[type].color + ' text-[#0a0a0a]' : 'bg-[#1a1a1a] text-white'}`}
                  >
                    {TYPE_CONFIG[type].label}
                  </Button>
                ))}
              </div>

              {/* البحث عن البيانات */}
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">البحث عن البيانات</label>
                <div className="flex gap-2">
                  <Input
                    value={metaSearchQuery}
                    onChange={(e) => setMetaSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchMetadata()}
                    placeholder="ابحث عن العنوان..."
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                  />
                  <Button
                    onClick={fetchMetadata}
                    disabled={isFetching}
                    className="bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] px-3 sm:px-4"
                  >
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                {searchError && <p className="text-red-500 text-xs sm:text-sm">{searchError}</p>}
              </div>

              {/* نتائج البحث */}
              {showResults && searchResults.length > 0 && (
                <div className="bg-[#1a1a1a] rounded-lg max-h-40 sm:max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => selectResult(result)}
                      className="w-full p-2 sm:p-3 text-right hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a] last:border-0"
                    >
                      <p className="font-medium text-xs sm:text-sm">{result.originalTitle || result.title}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-500">{result.year} • {result.rating}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* رفع البوستر */}
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${isDragOver ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-[#2a2a2a] hover:border-[#d4af37]/50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.poster ? (
                  <img src={formData.poster} alt="Poster" className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded mx-auto" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-500 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-neutral-400">اضغط أو اسحب البوستر هنا</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePosterUpload(e.target.files[0])}
                />
              </div>

              {/* الحقول */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs sm:text-sm text-neutral-400 block mb-1">العنوان الأصلي (إنكليزي) *</label>
                  <Input
                    value={formData.originalTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalTitle: e.target.value }))}
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                    dir="ltr"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs sm:text-sm text-neutral-400 block mb-1">العنوان المترجم</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-neutral-400 block mb-1">السنة</label>
                  <Input
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-neutral-400 block mb-1">التقييم</label>
                  <Input
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                    placeholder="7.5"
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                  />
                </div>
                {addType !== 'book' && (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm text-neutral-400 block mb-1">الحلقات</label>
                      <Input
                        value={formData.episodes}
                        onChange={(e) => setFormData(prev => ({ ...prev, episodes: e.target.value }))}
                        className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-neutral-400 block mb-1">المواسم</label>
                      <Input
                        value={formData.seasons}
                        onChange={(e) => setFormData(prev => ({ ...prev, seasons: e.target.value }))}
                        className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                      />
                    </div>
                  </>
                )}
                {addType === 'movie' && (
                  <div className="col-span-2">
                    <label className="text-xs sm:text-sm text-neutral-400 block mb-1">المدة</label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="2h 15m"
                      className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                    />
                  </div>
                )}
                {addType === 'book' && (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm text-neutral-400 block mb-1">المؤلف</label>
                      <Input
                        value={formData.author}
                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-neutral-400 block mb-1">الصفحات</label>
                      <Input
                        value={formData.pages}
                        onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                        className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-xs sm:text-sm text-neutral-400 block mb-1">الوصف</label>
                <Textarea
                  value={formData.overview}
                  onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm min-h-[60px] sm:min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-neutral-400 block mb-1">التصنيفات (مفصولة بفاصلة)</label>
                <Input
                  value={formData.genres}
                  onChange={(e) => setFormData(prev => ({ ...prev, genres: e.target.value }))}
                  placeholder="أكشن, دراما, خيال"
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-neutral-400 block mb-1">وسوم (مفصولة بفاصلة)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="مفضل, أنصح به"
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-neutral-400 block mb-1">ملاحظات</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm min-h-[50px] sm:min-h-[60px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddItem}
                  disabled={!formData.originalTitle.trim() && !formData.title.trim()}
                  className="flex-1 bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold"
                >
                  إضافة
                </Button>
                <Button
                  onClick={() => {
                    resetForm()
                    setShowAddDialog(false)
                  }}
                  variant="outline"
                  className="flex-1 border-[#2a2a2a] text-white"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ==================== نافذة التعديل ==================== */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f0f0f] border-[#2a2a2a] text-white rounded-lg sm:rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">تعديل {TYPE_CONFIG[currentType].label}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* رفع البوستر */}
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${isDragOver ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-[#2a2a2a] hover:border-[#d4af37]/50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.poster ? (
                  <img src={formData.poster} alt="Poster" className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded mx-auto" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-500 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-neutral-400">اضغط أو اسحب البوستر هنا</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePosterUpload(e.target.files[0])}
                />
              </div>

              {/* الحقول */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs sm:text-sm text-neutral-400 block mb-1">العنوان الأصلي (إنكليزي) *</label>
                  <Input
                    value={formData.originalTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalTitle: e.target.value }))}
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                    dir="ltr"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs sm:text-sm text-neutral-400 block mb-1">العنوان المترجم</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-neutral-400 block mb-1">السنة</label>
                  <Input
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-neutral-400 block mb-1">التقييم</label>
                  <Input
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                    className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                  />
                </div>
                {currentType !== 'book' && (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm text-neutral-400 block mb-1">الحلقات</label>
                      <Input
                        value={formData.episodes}
                        onChange={(e) => setFormData(prev => ({ ...prev, episodes: e.target.value }))}
                        className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-neutral-400 block mb-1">المواسم</label>
                      <Input
                        value={formData.seasons}
                        onChange={(e) => setFormData(prev => ({ ...prev, seasons: e.target.value }))}
                        className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                      />
                    </div>
                  </>
                )}
                {currentType === 'movie' && (
                  <div className="col-span-2">
                    <label className="text-xs sm:text-sm text-neutral-400 block mb-1">المدة</label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                    />
                  </div>
                )}
                {currentType === 'book' && (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm text-neutral-400 block mb-1">المؤلف</label>
                      <Input
                        value={formData.author}
                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-neutral-400 block mb-1">الصفحات</label>
                      <Input
                        value={formData.pages}
                        onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                        className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-xs sm:text-sm text-neutral-400 block mb-1">الوصف</label>
                <Textarea
                  value={formData.overview}
                  onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm min-h-[60px] sm:min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-neutral-400 block mb-1">التصنيفات (مفصولة بفاصلة)</label>
                <Input
                  value={formData.genres}
                  onChange={(e) => setFormData(prev => ({ ...prev, genres: e.target.value }))}
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-neutral-400 block mb-1">وسوم (مفصولة بفاصلة)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-neutral-400 block mb-1">ملاحظات</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-white text-sm min-h-[50px] sm:min-h-[60px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={!formData.originalTitle.trim() && !formData.title.trim()}
                  className="flex-1 bg-gradient-to-br from-[#d4af37] to-[#b8960f] text-[#0a0a0a] font-bold"
                >
                  حفظ التعديلات
                </Button>
                <Button
                  onClick={() => {
                    setShowEditDialog(false)
                    setEditingItem(null)
                    resetForm()
                  }}
                  variant="outline"
                  className="flex-1 border-[#2a2a2a] text-white"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
