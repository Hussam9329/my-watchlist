'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Search, Star, Edit, Trash2, Check, X, ArrowRight,
  Lightbulb, Brain, BarChart3, Bell, Target, Menu,
  Download, Upload as UploadIcon, ChevronDown, ChevronLeft,
  Sparkles, Calendar, Link, Bookmark, BookOpen, Code,
  Palette, UtensilsCrossed, Lightbulb as LightbulbIcon,
  CircleDot, Filter, TrendingUp, MessageSquare, Loader2
} from 'lucide-react'

// ===================== Types =====================

type IdeaCategory = 'design' | 'code' | 'art' | 'text' | 'cooking' | 'other'
type IdeaPriority = 'high' | 'medium' | 'low'
type NavView = 'ideas' | 'tasks' | 'reports' | 'ai'

interface Idea {
  id: string
  title: string
  content: string
  category: IdeaCategory
  priority: IdeaPriority
  progress: number
  reminderDate: string
  reminderTime: string
  externalLink: string
  relatedIdeas: string[]
  favorite: boolean
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  title: string
  priority: IdeaPriority
  completed: boolean
  createdAt: string
}

// ===================== Constants =====================

const CATEGORY_CONFIG: Record<IdeaCategory, { label: string; color: string; icon: typeof Palette }> = {
  design: { label: 'تصميم', color: '#ec4899', icon: Palette },
  code: { label: 'برمجة', color: '#3b82f6', icon: Code },
  art: { label: 'فن', color: '#8b5cf6', icon: LightbulbIcon },
  text: { label: 'نص', color: '#10b981', icon: BookOpen },
  cooking: { label: 'طبخ', color: '#f59e0b', icon: UtensilsCrossed },
  other: { label: 'أخرى', color: '#6b7280', icon: CircleDot },
}

const PRIORITY_CONFIG: Record<IdeaPriority, { label: string; color: string }> = {
  high: { label: 'عالية', color: '#ef4444' },
  medium: { label: 'متوسطة', color: '#f59e0b' },
  low: { label: 'منخفضة', color: '#10b981' },
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9)

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

// ===================== Component =====================

const APP_PASSWORD = '3333'

export default function IdeasPage() {
  const { toast } = useToast()

  // Login
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showLogin, setShowLogin] = useState(true)

  // Navigation
  const [activeView, setActiveView] = useState<NavView>('ideas')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<IdeaCategory | 'all'>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [taskTab, setTaskTab] = useState<'pending' | 'completed'>('pending')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<IdeaPriority>('medium')
  const [aiSuggestion, setAiSuggestion] = useState('')

  // AI Chat State
  const [showAiDialog, setShowAiDialog] = useState(false)
  const [aiAction, setAiAction] = useState<'suggest' | 'expand' | 'improve' | 'chat'>('suggest')
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', content: string}[]>([])
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [aiContext, setAiContext] = useState('')
  const [selectedIdeaForAi, setSelectedIdeaForAi] = useState<Idea | null>(null)

  // Form
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'other' as IdeaCategory,
    priority: 'medium' as IdeaPriority,
    progress: 0,
    reminderDate: '',
    reminderTime: '',
    externalLink: '',
    relatedIdeas: [] as string[],
  })

  const importInputRef = useRef<HTMLInputElement>(null)

  // ===================== localStorage =====================

  useEffect(() => {
    try {
      const storedIdeas = localStorage.getItem('hussamvision_ideas')
      if (storedIdeas) setIdeas(JSON.parse(storedIdeas))
      const storedTasks = localStorage.getItem('hussamvision_tasks')
      if (storedTasks) setTasks(JSON.parse(storedTasks))
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('hussamvision_ideas', JSON.stringify(ideas))
    } catch {
      // ignore storage errors
    }
  }, [ideas])

  useEffect(() => {
    try {
      localStorage.setItem('hussamvision_tasks', JSON.stringify(tasks))
    } catch {
      // ignore storage errors
    }
  }, [tasks])

  // ===================== AI Functions =====================

  const fetchAi = async (action: string, payload: Record<string, string>) => {
    setIsLoadingAi(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      })
      const data = await res.json()
      if (data.success) {
        return data.response
      }
      console.error('fetchAi error:', data.error)
      return 'عذراً، حدث خطأ. حاول مجدداً.'
    } catch (err) {
      console.error('fetchAi catch:', err)
      return 'عذراً، حدث خطأ في الاتصال. حاول مجدداً.'
    } finally {
      setIsLoadingAi(false)
    }
  }

  const refreshSuggestion = useCallback(async () => {
    const response = await fetchAi('daily_inspiration', {})
    setAiSuggestion(response)
  }, [])

  useEffect(() => {
    refreshSuggestion()
  }, [refreshSuggestion])

  const addSuggestionAsIdea = useCallback(() => {
    if (!aiSuggestion) return
    const newIdea: Idea = {
      id: genId(),
      title: '✨ إلهام ذكي',
      content: aiSuggestion,
      category: 'other',
      priority: 'medium',
      progress: 0,
      reminderDate: '',
      reminderTime: '',
      externalLink: '',
      relatedIdeas: [],
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setIdeas(prev => [newIdea, ...prev])
    toast({ title: '✅ تمت الإضافة', description: 'تم إضافة إلهام الذكاء الاصطناعي' })
    refreshSuggestion()
  }, [aiSuggestion, toast, refreshSuggestion])

  const openAiForIdea = (idea: Idea) => {
    setSelectedIdeaForAi(idea)
    setAiMessages([])
    setAiAction('expand')
    setAiInput('')
    setAiContext('')
    setActiveView('ai')
  }

  const openAiChat = () => {
    setAiMessages([])
    setAiAction('chat')
    setAiInput('')
    setSelectedIdeaForAi(null)
    setActiveView('ai')
  }

  const sendAiMessage = async () => {
    if (!aiInput.trim() && aiAction !== 'suggest') return

    const newMessages = [...aiMessages, { role: 'user' as const, content: aiInput || 'اقترح فكرة جديدة' }]
    setAiMessages(newMessages)
    setAiInput('')
    setIsLoadingAi(true)

    let payload: Record<string, string | Array<{role: string; content: string}>> = {}

    if (aiAction === 'suggest') {
      payload = {
        action: 'suggest',
        context: aiInput || 'أفكار عامة',
        ideaCategory: formData.category || 'other',
      }
    } else if (aiAction === 'expand') {
      payload = {
        action: 'expand',
        ideaTitle: selectedIdeaForAi?.title || aiInput,
        ideaContent: selectedIdeaForAi?.content || '',
        ideaCategory: selectedIdeaForAi?.category || 'other',
      }
    } else if (aiAction === 'improve') {
      payload = {
        action: 'improve',
        ideaTitle: selectedIdeaForAi?.title || aiInput,
        ideaContent: selectedIdeaForAi?.content || '',
        ideaCategory: selectedIdeaForAi?.category || 'other',
      }
    } else if (aiAction === 'chat') {
      // Multi-turn: send full conversation history
      payload = {
        action: 'chat',
        conversation: newMessages[newMessages.length - 1].content,
        messages: newMessages,
      }
    }

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      let responseText = 'عذراً، حدث خطأ. حاول مجدداً.'
      if (data.success && data.response) {
        responseText = data.response
      } else {
        console.error('sendAiMessage error response:', data)
      }
      setAiMessages(prev => [...prev, { role: 'ai' as const, content: responseText }])
    } catch (err) {
      console.error('sendAiMessage catch:', err)
      setAiMessages(prev => [...prev, { role: 'ai' as const, content: 'عذراً، حدث خطأ في الاتصال. حاول مجدداً.' }])
    } finally {
      setIsLoadingAi(false)
    }
  }

  const quickAiAction = async (action: 'suggest' | 'expand' | 'improve', idea?: Idea) => {
    setSelectedIdeaForAi(idea || null)
    setAiMessages([])
    setAiAction(action)
    setAiInput('')
    setIsLoadingAi(true)
    setActiveView('ai')

    let payload: Record<string, string> = {}
    if (action === 'suggest') {
      payload = { context: aiContext || 'فكرة إبداعية جديدة', ideaCategory: 'other' }
    } else {
      if (!idea) return
      payload = {
        ideaTitle: idea.title,
        ideaContent: idea.content,
        ideaCategory: idea.category,
      }
    }

    const response = await fetchAi(action, payload)
    setAiMessages([
      { role: 'ai', content: response },
    ])
    setIsLoadingAi(false)
  }

  // ===================== Computed =====================

  const stats = useMemo(() => ({
    total: ideas.length,
    inProgress: ideas.filter(i => i.progress > 0 && i.progress < 100).length,
    completed: ideas.filter(i => i.progress === 100).length,
    favorites: ideas.filter(i => i.favorite).length,
  }), [ideas])

  const usedCategories = useMemo(() => {
    const cats = new Set<IdeaCategory>()
    ideas.forEach(i => cats.add(i.category))
    return Array.from(cats)
  }, [ideas])

  const goalIdeas = useMemo(() => {
    return ideas.filter(i => i.progress > 0 && i.progress < 100)
  }, [ideas])

  const filteredIdeas = useMemo(() => {
    let items = [...ideas]
    if (filterCategory !== 'all') {
      items = items.filter(i => i.category === filterCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)
      )
    }
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return items
  }, [ideas, filterCategory, searchQuery])

  const filteredTasks = useMemo(() => {
    const t = taskTab === 'pending'
      ? tasks.filter(t => !t.completed)
      : tasks.filter(t => t.completed)
    return t.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [tasks, taskTab])

  // ===================== Idea CRUD =====================

  const openAddDialog = useCallback(() => {
    setEditingIdea(null)
    setFormData({
      title: '',
      content: '',
      category: 'other',
      priority: 'medium',
      progress: 0,
      reminderDate: '',
      reminderTime: '',
      externalLink: '',
      relatedIdeas: [],
    })
    setShowAddDialog(true)
  }, [])

  const openEditDialog = useCallback((idea: Idea) => {
    setEditingIdea(idea)
    setFormData({
      title: idea.title,
      content: idea.content,
      category: idea.category,
      priority: idea.priority,
      progress: idea.progress,
      reminderDate: idea.reminderDate,
      reminderTime: idea.reminderTime,
      externalLink: idea.externalLink,
      relatedIdeas: idea.relatedIdeas || [],
    })
    setShowAddDialog(true)
  }, [])

  const saveIdea = useCallback(() => {
    if (!formData.title.trim()) {
      toast({ title: '⚠️ تنبيه', description: 'يرجى إدخال عنوان الفكرة', variant: 'destructive' })
      return
    }
    if (editingIdea) {
      setIdeas(prev =>
        prev.map(i =>
          i.id === editingIdea.id
            ? { ...i, ...formData, updatedAt: new Date().toISOString() }
            : i
        )
      )
      toast({ title: '✅ تم التعديل', description: 'تم تحديث الفكرة بنجاح' })
    } else {
      const newIdea: Idea = {
        id: genId(),
        ...formData,
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setIdeas(prev => [newIdea, ...prev])
      toast({ title: '✅ تمت الإضافة', description: 'تم إضافة الفكرة بنجاح' })
    }
    setShowAddDialog(false)
    setEditingIdea(null)
  }, [formData, editingIdea, toast])

  const deleteIdea = useCallback((id: string) => {
    const idea = ideas.find(i => i.id === id)
    setIdeas(prev => prev.filter(i => i.id !== id))
    toast({ title: '🗑️ تم الحذف', description: `تم حذف "${idea?.title}"` })
  }, [ideas, toast])

  const toggleFavorite = useCallback((id: string) => {
    setIdeas(prev =>
      prev.map(i =>
        i.id === id ? { ...i, favorite: !i.favorite, updatedAt: new Date().toISOString() } : i
      )
    )
  }, [])

  const toggleRelatedIdea = useCallback((ideaId: string) => {
    setFormData(prev => ({
      ...prev,
      relatedIdeas: prev.relatedIdeas.includes(ideaId)
        ? prev.relatedIdeas.filter(id => id !== ideaId)
        : [...prev.relatedIdeas, ideaId],
    }))
  }, [])

  // ===================== Task CRUD =====================

  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return
    const newTask: Task = {
      id: genId(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
    setNewTaskTitle('')
    toast({ title: '✅ تمت الإضافة', description: 'تم إضافة المهمة' })
  }, [newTaskTitle, newTaskPriority, toast])

  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    toast({ title: '🗑️ تم الحذف', description: 'تم حذف المهمة' })
  }, [toast])

  // ===================== Export / Import =====================

  const exportData = useCallback(() => {
    const data = JSON.stringify({ ideas, tasks }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hussamvision_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: '📤 تم التصدير', description: 'تم تصدير البيانات بنجاح' })
  }, [ideas, tasks, toast])

  const importData = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.ideas && Array.isArray(data.ideas)) {
          setIdeas(data.ideas)
        }
        if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks)
        }
        toast({ title: '📥 تم الاستيراد', description: 'تم استيراد البيانات بنجاح' })
      } catch {
        toast({ title: '❌ خطأ', description: 'ملف غير صالح', variant: 'destructive' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [toast])

  // ===================== Render: Sidebar =====================

  const renderSidebar = () => (
    <aside
      className={`fixed top-0 right-0 z-40 h-full w-64 sm:w-72 transition-transform duration-300 bg-[#0f1629] border-l border-white/10 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
      style={{ direction: 'rtl' }}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
            >
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">أفكاري</h2>
              <p className="text-xs text-gray-500">Powered by HussamVision</p>
            </div>
          </div>
          {/* Back button */}
          <button
            onClick={() => window.location.href = '/'}
            className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للرئيسية</span>
          </button>
        </div>

        {/* AI Assistant */}
        <div className="p-4">
          <div className="rounded-xl p-4 border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-purple-300">مساعد الذكاء الاصطناعي</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3 min-h-[40px]">
              {aiSuggestion || '...'}
            </p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => refreshSuggestion()}
                disabled={isLoadingAi}
                className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoadingAi ? 'جاري...' : 'إلهام'}
              </button>
              <button
                onClick={addSuggestionAsIdea}
                className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-colors"
              >
                <Plus className="w-3 h-3" />
                حفظ فكرة
              </button>
            </div>
            <button
              onClick={() => { setAiMessages([]); setAiAction('suggest'); setAiInput(''); setSelectedIdeaForAi(null); setActiveView('ai'); setSidebarOpen(false) }}
              className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              فتح المساعد الذكي
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 mb-2">
          <p className="text-xs text-gray-500 mb-2 font-medium">القائمة الرئيسية</p>
          <nav className="space-y-1">
            {([
              { key: 'ideas' as NavView, label: 'أفكاري', icon: Lightbulb },
              { key: 'ai' as NavView, label: 'مساعد الذكاء', icon: Brain, highlight: true },
              { key: 'tasks' as NavView, label: 'المهام', icon: Target },
              { key: 'reports' as NavView, label: 'التقارير', icon: BarChart3 },
            ]).map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveView(item.key)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeView === item.key
                    ? (item.highlight ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20')
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.key === 'ideas' && (
                  <Badge
                    className="mr-auto text-[10px] px-1.5"
                    style={{ backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}
                  >
                    {ideas.length}
                  </Badge>
                )}
                {item.key === 'tasks' && (
                  <Badge
                    className="mr-auto text-[10px] px-1.5"
                    style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}
                  >
                    {tasks.filter(t => !t.completed).length}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Categories */}
        {usedCategories.length > 0 && (
          <div className="px-4 mb-2">
            <p className="text-xs text-gray-500 mb-2 font-medium">التصنيفات</p>
            <nav className="space-y-1">
              {usedCategories.map(cat => {
                const config = CATEGORY_CONFIG[cat]
                const count = ideas.filter(i => i.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCategory(cat)
                      setActiveView('ideas')
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      filterCategory === cat
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{config.label}</span>
                    <span className="mr-auto text-xs text-gray-600">{count}</span>
                  </button>
                )
              })}
              {filterCategory !== 'all' && (
                <button
                  onClick={() => setFilterCategory('all')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-3 h-3" />
                  <span>إزالة الفلتر</span>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Goals Preview */}
        {goalIdeas.length > 0 && (
          <div className="px-4 mb-2">
            <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              الأهداف الجارية
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {goalIdeas.slice(0, 5).map(idea => (
                <div key={idea.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-300 truncate max-w-[150px]">{idea.title}</span>
                    <span className="text-[10px] text-gray-500">{idea.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${idea.progress}%`,
                        backgroundColor: CATEGORY_CONFIG[idea.category]?.color || '#8b5cf6',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Brain className="w-3 h-3" />
            <span>HussamVision Ideas</span>
          </div>
        </div>
      </div>
    </aside>
  )

  // ===================== Render: Header =====================

  const renderHeader = () => (
    <header className="sticky top-0 z-30 bg-[#030712]/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأفكار..."
            className="bg-[#1e293b] border-white/10 focus:border-indigo-500/50 pr-9 h-10 text-sm text-white placeholder-gray-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="hidden sm:block p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative">
            <Bell className="w-5 h-5" />
            {ideas.filter(i => i.progress > 0 && i.progress < 100).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>
          <button
            onClick={exportData}
            className="hidden sm:block p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="تصدير البيانات"
          >
            <Download className="w-5 h-5" />
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={importData}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            className="hidden sm:block p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="استيراد البيانات"
          >
            <UploadIcon className="w-5 h-5" />
          </button>
          <Button
            onClick={openAddDialog}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium h-10 px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">فكرة جديدة</span>
          </Button>
        </div>
      </div>
    </header>
  )

  // ===================== Render: Stats =====================

  const renderStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
      {[
        { label: 'إجمالي الأفكار', value: stats.total, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: Lightbulb },
        { label: 'قيد التنفيذ', value: stats.inProgress, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: TrendingUp },
        { label: 'مكتملة', value: stats.completed, color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Check },
        { label: 'المفضلة', value: stats.favorites, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', icon: Star },
      ].map(stat => (
        <div
          key={stat.label}
          className="rounded-xl p-4 border border-white/5 transition-all hover:border-white/10 hover:scale-[1.02]"
          style={{ backgroundColor: stat.bg }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">{stat.label}</span>
            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: stat.color }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )

  // ===================== Render: Idea Card =====================

  const renderIdeaCard = (idea: Idea) => {
    const catConfig = CATEGORY_CONFIG[idea.category]
    const relatedIdeasList = ideas.filter(i => idea.relatedIdeas?.includes(i.id))

    return (
      <div
        key={idea.id}
        className="group rounded-xl overflow-hidden bg-[#0f1629] border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
        style={{ direction: 'rtl' }}
      >
        {/* Category color strip */}
        <div className="h-1.5 w-full" style={{ backgroundColor: catConfig.color }} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge
                className="text-[10px] font-medium"
                style={{
                  backgroundColor: `${catConfig.color}20`,
                  color: catConfig.color,
                  border: `1px solid ${catConfig.color}30`,
                }}
              >
                {catConfig.label}
              </Badge>
              <Badge
                className="text-[10px]"
                style={{
                  backgroundColor: `${PRIORITY_CONFIG[idea.priority].color}20`,
                  color: PRIORITY_CONFIG[idea.priority].color,
                }}
              >
                {PRIORITY_CONFIG[idea.priority].label}
              </Badge>
            </div>
            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openAiForIdea(idea)}
                className="p-1.5 rounded-lg hover:bg-purple-500/20 transition-colors"
                title="مساعدة الذكاء الاصطناعي"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </button>
              <button
                onClick={() => toggleFavorite(idea.id)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    idea.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
                  }`}
                />
              </button>
              <button
                onClick={() => openEditDialog(idea)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => deleteIdea(idea.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{idea.title}</h3>

          {/* Content */}
          {idea.content && (
            <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
              {idea.content}
            </p>
          )}

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">التقدم</span>
              <span className="text-[10px] font-medium" style={{ color: catConfig.color }}>
                {idea.progress}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${idea.progress}%`,
                  backgroundColor: idea.progress === 100 ? '#10b981' : catConfig.color,
                }}
              />
            </div>
          </div>

          {/* Related ideas */}
          {relatedIdeasList.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-gray-500 mb-1">أفكار مرتبطة</p>
              <div className="flex flex-wrap gap-1">
                {relatedIdeasList.slice(0, 3).map(ri => (
                  <Badge
                    key={ri.id}
                    className="text-[10px] bg-white/5 text-gray-400 border border-white/5"
                  >
                    {ri.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-1 text-[10px] text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(idea.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              {idea.progress === 100 && (
                <Badge className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">
                  مكتمل
                </Badge>
              )}
              {idea.progress > 0 && idea.progress < 100 && (
                <Badge className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  جاري التنفيذ
                </Badge>
              )}
              {idea.progress === 0 && (
                <Badge className="text-[10px] bg-white/5 text-gray-500 border border-white/5">
                  جديد
                </Badge>
              )}
              {idea.favorite && (
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===================== Render: Ideas Grid =====================

  const renderIdeasView = () => {
    if (activeView !== 'ideas') return null

    return (
      <div>
        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <button
            onClick={() => setFilterCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all ${
              filterCategory === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            الكل
          </button>
          {(Object.keys(CATEGORY_CONFIG) as IdeaCategory[]).map(cat => {
            const config = CATEGORY_CONFIG[cat]
            const count = ideas.filter(i => i.category === cat).length
            if (count === 0) return null
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                  filterCategory === cat
                    ? 'border'
                    : 'text-gray-400 hover:bg-white/5 border border-transparent'
                }`}
                style={
                  filterCategory === cat
                    ? { backgroundColor: `${config.color}15`, color: config.color, borderColor: `${config.color}30` }
                    : {}
                }
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                {config.label}
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Grid or empty state */}
        {filteredIdeas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}
            >
              <Lightbulb className="w-10 h-10 text-indigo-500/50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {ideas.length === 0 ? 'لا توجد أفكار بعد' : 'لا توجد نتائج'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center">
              {ideas.length === 0
                ? 'ابدأ بتسجيل أفكارك الإبداعية الأولى'
                : 'جرب تغيير معايير البحث أو الفلتر'}
            </p>
            {ideas.length === 0 && (
              <Button
                onClick={openAddDialog}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
              >
                <Plus className="w-4 h-4" />
                أضف فكرتك الأولى
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredIdeas.map(renderIdeaCard)}
          </div>
        )}
      </div>
    )
  }

  // ===================== Render: Tasks =====================

  const renderTasksView = () => {
    if (activeView !== 'tasks') return null

    const pendingCount = tasks.filter(t => !t.completed).length
    const completedCount = tasks.filter(t => t.completed).length

    return (
      <div className="p-4">
        {/* Add task */}
        <div className="flex gap-2 mb-6">
          <Input
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="أضف مهمة جديدة..."
            className="flex-1 bg-[#1e293b] border-white/10 focus:border-indigo-500/50 h-10 text-sm text-white placeholder-gray-500"
          />
          <div className="hidden sm:flex">
            <Select value={newTaskPriority} onValueChange={v => setNewTaskPriority(v as IdeaPriority)}>
              <SelectTrigger className="w-28 bg-[#1e293b] border-white/10 h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-white/10">
                {(['high', 'medium', 'low'] as IdeaPriority[]).map(p => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={addTask}
            className="gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-10 px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl bg-[#1e293b]/50 border border-white/5">
          <button
            onClick={() => setTaskTab('pending')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
              taskTab === 'pending'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CircleDot className="w-4 h-4" />
            قيد التنفيذ
            <Badge className="text-[10px] bg-indigo-500/20 text-indigo-300">{pendingCount}</Badge>
          </button>
          <button
            onClick={() => setTaskTab('completed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
              taskTab === 'completed'
                ? 'bg-green-500/20 text-green-300 border border-green-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            مكتملة
            <Badge className="text-[10px] bg-green-500/20 text-green-300">{completedCount}</Badge>
          </button>
        </div>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}
            >
              <Target className="w-8 h-8 text-blue-500/50" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {taskTab === 'pending' ? 'لا توجد مهام قيد التنفيذ' : 'لا توجد مهام مكتملة'}
            </h3>
            <p className="text-sm text-gray-500">
              {taskTab === 'pending' ? 'أضف مهمة جديدة للبدء' : 'أكمل بعض المهام لتظهر هنا'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-white/[0.02] border-white/5 opacity-60'
                    : 'bg-[#0f1629] border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500 hover:border-indigo-400'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                  </p>
                </div>
                <Badge
                  className="text-[10px] flex-shrink-0"
                  style={{
                    backgroundColor: `${PRIORITY_CONFIG[task.priority].color}15`,
                    color: PRIORITY_CONFIG[task.priority].color,
                  }}
                >
                  {PRIORITY_CONFIG[task.priority].label}
                </Badge>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ===================== Render: Reports =====================

  const renderReportsView = () => {
    if (activeView !== 'reports') return null

    const categoryStats = (Object.keys(CATEGORY_CONFIG) as IdeaCategory[]).map(cat => ({
      ...CATEGORY_CONFIG[cat],
      count: ideas.filter(i => i.category === cat).length,
      completed: ideas.filter(i => i.category === cat && i.progress === 100).length,
      avgProgress: ideas.filter(i => i.category === cat).length > 0
        ? Math.round(ideas.filter(i => i.category === cat).reduce((a, i) => a + i.progress, 0) / ideas.filter(i => i.category === cat).length)
        : 0,
    })).filter(c => c.count > 0)

    const priorityStats = (Object.keys(PRIORITY_CONFIG) as IdeaPriority[]).map(p => ({
      ...PRIORITY_CONFIG[p],
      key: p,
      count: ideas.filter(i => i.priority === p).length,
    }))

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return (
      <div className="p-4 space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl p-5 border border-white/5 bg-[#0f1629]">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-white">ملخص الأفكار</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">إجمالي الأفكار</span>
                <span className="text-white font-medium">{ideas.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">متوسط التقدم</span>
                <span className="text-white font-medium">
                  {ideas.length > 0
                    ? Math.round(ideas.reduce((a, i) => a + i.progress, 0) / ideas.length)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">نسبة الإكمال</span>
                <span className="text-green-400 font-medium">
                  {ideas.length > 0
                    ? Math.round((ideas.filter(i => i.progress === 100).length / ideas.length) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 border border-white/5 bg-[#0f1629]">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-medium text-white">ملخص المهام</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">إجمالي المهام</span>
                <span className="text-white font-medium">{totalTasks}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">مكتملة</span>
                <span className="text-green-400 font-medium">{completedTasks}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">نسبة الإنجاز</span>
                <span className="text-indigo-400 font-medium">{taskCompletionRate}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 border border-white/5 bg-[#0f1629]">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-white">الأولويات</h3>
            </div>
            <div className="space-y-2">
              {priorityStats.map(p => (
                <div key={p.key} className="flex justify-between text-xs">
                  <span className="text-gray-400">{p.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ideas.length > 0 ? (p.count / ideas.length) * 100 : 0}%`,
                          backgroundColor: p.color,
                        }}
                      />
                    </div>
                    <span className="text-white font-medium w-5 text-left">{p.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl p-5 border border-white/5 bg-[#0f1629]">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-medium text-white">تفصيل التصنيفات</h3>
          </div>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">لا توجد بيانات كافية للعرض</p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map(cat => (
                <div key={cat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-white">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-400">{cat.count} فكرة</span>
                      <span className="text-green-400">{cat.completed} مكتمل</span>
                      <span style={{ color: cat.color }}>{cat.avgProgress}% متوسط التقدم</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.avgProgress}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ===================== Render: Add/Edit Dialog =====================

  const renderDialog = () => (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent
        className="w-[calc(100%-2rem)] sm:max-w-2xl bg-[#0f1629] border-white/10 max-h-[90vh] overflow-y-auto"
        style={{ direction: 'rtl' }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-white flex items-center gap-2">
            {editingIdea ? (
              <>
                <Edit className="w-5 h-5 text-indigo-400" />
                تعديل الفكرة
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-indigo-400" />
                فكرة جديدة
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            {editingIdea ? 'قم بتعديل تفاصيل الفكرة' : 'أضف فكرة جديدة لمجموعتك'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Title */}
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">العنوان *</label>
            <Input
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="أدخل عنوان الفكرة..."
              className="bg-[#1e293b] border-white/10 focus:border-indigo-500/50 text-sm text-white placeholder-gray-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">الوصف</label>
            <Textarea
              value={formData.content}
              onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
              placeholder="صف فكرتك بالتفصيل..."
              className="bg-[#1e293b] border-white/10 focus:border-indigo-500/50 text-sm text-white placeholder-gray-500 min-h-[100px] resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">التصنيف</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as IdeaCategory[]).map(cat => {
                const config = CATEGORY_CONFIG[cat]
                const selected = formData.category === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setFormData(p => ({ ...p, category: cat }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                      selected
                        ? 'text-white'
                        : 'text-gray-400 border-white/5 hover:border-white/10 hover:text-white bg-white/[0.02]'
                    }`}
                    style={
                      selected
                        ? { backgroundColor: `${config.color}15`, borderColor: `${config.color}40` }
                        : {}
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <config.icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <span>{config.label}</span>
                    {selected && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">الأولوية</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as IdeaPriority[]).map(p => {
                const config = PRIORITY_CONFIG[p]
                const selected = formData.priority === p
                return (
                  <button
                    key={p}
                    onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-all ${
                      selected ? 'text-white' : 'text-gray-400 border-white/5 hover:border-white/10'
                    }`}
                    style={
                      selected
                        ? { backgroundColor: `${config.color}15`, borderColor: `${config.color}40`, color: config.color }
                        : { backgroundColor: 'rgba(255,255,255,0.02)' }
                    }
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="text-sm text-gray-300 mb-2 flex items-center justify-between">
              <span>التقدم</span>
              <span className="text-indigo-400 font-medium">{formData.progress}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={e => setFormData(p => ({ ...p, progress: parseInt(e.target.value) }))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to left, #6366f1 0%, #6366f1 ${formData.progress}%, rgba(255,255,255,0.1) ${formData.progress}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 flex items-center gap-1.5 block">
                <Calendar className="w-3.5 h-3.5" />
                تاريخ التذكير
              </label>
              <Input
                type="date"
                value={formData.reminderDate}
                onChange={e => setFormData(p => ({ ...p, reminderDate: e.target.value }))}
                className="bg-[#1e293b] border-white/10 focus:border-indigo-500/50 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 flex items-center gap-1.5 block">
                <Calendar className="w-3.5 h-3.5" />
                وقت التذكير
              </label>
              <Input
                type="time"
                value={formData.reminderTime}
                onChange={e => setFormData(p => ({ ...p, reminderTime: e.target.value }))}
                className="bg-[#1e293b] border-white/10 focus:border-indigo-500/50 text-sm text-white"
              />
            </div>
          </div>

          {/* External Link */}
          <div>
            <label className="text-sm text-gray-300 mb-1.5 flex items-center gap-1.5 block">
              <Link className="w-3.5 h-3.5" />
              رابط خارجي
            </label>
            <Input
              value={formData.externalLink}
              onChange={e => setFormData(p => ({ ...p, externalLink: e.target.value }))}
              placeholder="https://..."
              className="bg-[#1e293b] border-white/10 focus:border-indigo-500/50 text-sm text-white placeholder-gray-500"
              dir="ltr"
            />
          </div>

          {/* Related Ideas */}
          {ideas.length > 0 && (
            <div>
              <label className="text-sm text-gray-300 mb-2 flex items-center gap-1.5 block">
                <Bookmark className="w-3.5 h-3.5" />
                أفكار مرتبطة
              </label>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-white/5 bg-[#1e293b]/50">
                {ideas
                  .filter(i => !editingIdea || i.id !== editingIdea.id)
                  .map(idea => {
                    const selected = formData.relatedIdeas.includes(idea.id)
                    return (
                      <button
                        key={idea.id}
                        onClick={() => toggleRelatedIdea(idea.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all border-b border-white/5 last:border-b-0 ${
                          selected ? 'bg-indigo-500/10 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            selected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'
                          }`}
                        >
                          {selected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_CONFIG[idea.category].color }} />
                        <span className="truncate text-right">{idea.title}</span>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={saveIdea}
              className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-11"
            >
              <Check className="w-4 h-4" />
              {editingIdea ? 'حفظ التعديلات' : 'إضافة الفكرة'}
            </Button>
            <Button
              onClick={() => setShowAddDialog(false)}
              variant="outline"
              className="flex-1 gap-2 border-white/10 text-gray-300 hover:bg-white/5 h-11"
            >
              <X className="w-4 h-4" />
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // ===================== Render: AI Chat Panel (full view) =====================

  const aiMessagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, isLoadingAi])

  const renderAiView = () => {
    if (activeView !== 'ai') return null

    return (
      <div className="flex flex-col h-[calc(100vh-65px)]">
        {/* AI Header with action buttons */}
        <div className="flex-shrink-0 border-b border-white/10 bg-[#030712]/50">
          {/* Inspiration card */}
          <div className="p-4">
            <div className="rounded-xl p-4 border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-purple-300">إلهام اليوم</span>
                <button
                  onClick={() => refreshSuggestion()}
                  disabled={isLoadingAi}
                  className="mr-auto p-1 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                >
                  <svg className={`w-3.5 h-3.5 text-purple-300 ${isLoadingAi ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed mb-2">
                {aiSuggestion || '...'}
              </p>
              <button
                onClick={addSuggestionAsIdea}
                className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-colors"
              >
                <Plus className="w-3 h-3" />
                حفظ كفكرة
              </button>
            </div>
          </div>

          {/* Action tabs */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            <button
              onClick={() => { setAiAction('suggest'); setAiMessages([]); setSelectedIdeaForAi(null) }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${aiAction === 'suggest' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/5' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              اقتراح فكرة
            </button>
            <button
              onClick={() => { setAiAction('expand'); setAiMessages([]); setSelectedIdeaForAi(null) }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${aiAction === 'expand' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/5' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              توسيع فكرة
            </button>
            <button
              onClick={() => { setAiAction('improve'); setAiMessages([]); setSelectedIdeaForAi(null) }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${aiAction === 'improve' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              تحسين فكرة
            </button>
            <button
              onClick={() => { setAiAction('chat'); setAiMessages([]); setSelectedIdeaForAi(null) }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${aiAction === 'chat' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/5' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              محادثة حرة
            </button>
            {selectedIdeaForAi && (
              <button
                onClick={() => { setSelectedIdeaForAi(null); setAiMessages([]) }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-white hover:bg-white/5 border border-transparent transition-all"
              >
                <X className="w-3.5 h-3.5" />
                إلغاء التحديد
              </button>
            )}
          </div>

          {/* Selected idea info */}
          {selectedIdeaForAi && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0f1629] border border-white/10">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG[selectedIdeaForAi.category]?.color }} />
                <span className="text-xs text-gray-400">الفكرة المحددة:</span>
                <span className="text-xs text-white font-medium truncate">{selectedIdeaForAi.title}</span>
              </div>
            </div>
          )}
        </div>

        {/* Messages area - full height */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {aiMessages.length === 0 && !isLoadingAi && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center mb-4 border border-purple-500/10">
                <Brain className="w-10 h-10 text-purple-400/60" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {aiAction === 'suggest' ? 'اقتراح فكرة جديدة' : aiAction === 'chat' ? 'محادثة حرة' : aiAction === 'expand' ? 'توسيع فكرة' : 'تحسين فكرة'}
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">
                {aiAction === 'suggest' ? 'اكتب موضوعاً أو وصفاً للحصول على فكرة إبداعية جديدة. يمكنك أيضاً تحديد فكرة موجودة من بطاقات الأفكار والضغط على أيقونة ✨'
                  : aiAction === 'chat' ? 'تحدث بحرية مع المساعد الذكي حول أي موضوع. اسأله عن أفكارك أو اطلب نصائح إبداعية'
                  : aiAction === 'expand' ? 'اختر فكرة من بطاقات الأفكار (اضغط ✨) أو اكتب عنوان الفكرة ووصفها هنا'
                  : 'اختر فكرة من بطاقات الأفكار (اضغط ✨) أو اكتب الفكرة للحصول على اقتراحات تحسين'}
              </p>
              {/* Quick suggestions for chat mode */}
              {aiAction === 'chat' && (
                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                  {['ما هي أفكار مشاريع برمجية للمبتدئين؟', 'كيف أطور مهاراتي الإبداعية؟', 'أحتاج فكرة لتطبيق موبايل', 'نصائح لتحسين الإنتاجية'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setAiInput(q); setTimeout(() => { setAiInput(q) }, 0) }}
                      className="px-3 py-2 rounded-xl text-xs text-gray-400 bg-white/5 border border-white/5 hover:border-purple-500/30 hover:text-purple-300 hover:bg-purple-500/5 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {aiMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-purple-500/20">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-purple-600/20 text-purple-100 border border-purple-500/20'
                  : 'bg-[#1a1f3a] text-gray-200 border border-white/5'
              }`}>
                {msg.content}
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        const title = msg.content.split('\n')[0].replace(/^[-*#\d.\s]+/, '').slice(0, 50)
                        const newIdea: Idea = {
                          id: genId(),
                          title: title || '✨ فكرة من الذكاء الاصطناعي',
                          content: msg.content,
                          category: 'other',
                          priority: 'medium',
                          progress: 0,
                          reminderDate: '',
                          reminderTime: '',
                          externalLink: '',
                          relatedIdeas: [],
                          favorite: false,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        }
                        setIdeas(prev => [newIdea, ...prev])
                        toast({ title: '✅ تمت الإضافة', description: 'تم حفظ الرد كفكرة جديدة' })
                      }}
                      className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-purple-300 transition-colors"
                    >
                      <Bookmark className="w-3 h-3" />
                      حفظ كفكرة
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content)
                        toast({ title: '📋 تم النسخ', description: 'تم نسخ الرد إلى الحافظة' })
                      }}
                      className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-purple-300 transition-colors"
                    >
                      نسخ
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold">ح</span>
                </div>
              )}
            </div>
          ))}
          {isLoadingAi && (
            <div className="flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#1a1f3a] border border-white/5 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  يفكر...
                </div>
              </div>
            </div>
          )}
          <div ref={aiMessagesEndRef} />
        </div>

        {/* Input area - sticky bottom */}
        {aiAction === 'suggest' && !selectedIdeaForAi && (
          <div className="flex-shrink-0 px-4 pb-2">
            <Input
              value={aiContext}
              onChange={e => setAiContext(e.target.value)}
              placeholder="موضوع محدد (مثال: تطبيق لتتبع العادات)..."
              className="bg-[#1a1f3a] border-white/10 focus:border-purple-500/50 h-9 text-sm text-white placeholder-gray-500"
            />
          </div>
        )}
        <div className="flex-shrink-0 flex gap-2 px-4 py-3 border-t border-white/10 bg-[#030712]/80 backdrop-blur-xl">
          <Input
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendAiMessage()}
            placeholder={
              aiAction === 'suggest' ? 'اكتب وصفاً لفكرتك...'
              : aiAction === 'chat' ? 'اكتب رسالتك...'
              : 'اكتب الفكرة أو اطرح سؤالك...'
            }
            className="flex-1 bg-[#1a1f3a] border-white/10 focus:border-purple-500/50 h-11 text-sm text-white placeholder-gray-500"
          />
          <Button
            onClick={sendAiMessage}
            disabled={isLoadingAi || (!aiInput.trim() && aiAction !== 'suggest')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white h-11 px-5 disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {isLoadingAi ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ===================== Main Render =====================

  // Auth check
  useEffect(() => {
    const auth = localStorage.getItem('ideas_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      setShowLogin(false)
    }
  }, [])

  const handleLogin = () => {
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true)
      setShowLogin(false)
      localStorage.setItem('ideas_auth', 'true')
      toast({ title: '✅ مرحباً بك!', description: 'تم تسجيل الدخول بنجاح' })
    } else {
      toast({ title: '❌ خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowLogin(true)
    localStorage.removeItem('ideas_auth')
    setPasswordInput('')
  }

  // Login screen
  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-full max-w-sm px-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">أفكاري</h1>
            <p className="text-neutral-500">أدخل كلمة المرور للدخول</p>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="كلمة المرور"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-purple-500 h-12 text-center text-lg"
            />
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold h-12"
            >
              دخول
            </Button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundColor: '#030712',
        direction: 'rtl',
      }}
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[400px] -right-[400px] w-[800px] h-[800px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)' }}
        />
        <div className="absolute -bottom-[400px] -left-[400px] w-[800px] h-[800px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)' }}
        />
      </div>

      {/* Sidebar */}
      {renderSidebar()}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:mr-72 relative z-10">
        {renderHeader()}
        {activeView === 'ideas' && renderStats()}
        {activeView === 'ideas' && renderIdeasView()}
        {renderTasksView()}
        {renderReportsView()}
        {renderAiView()}
        {renderDialog()}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 3px solid #0f1629;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 3px solid #0f1629;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
