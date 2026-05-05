// ==================== Shared Constants ====================

export const WL_SORT_OPTIONS = [
  { value: 'addedAt_desc', label: 'أضيف مؤخراً' },
  { value: 'addedAt_asc', label: 'أضيف أولاً' },
  { value: 'title_asc', label: 'الاسم أ-ي' },
  { value: 'title_desc', label: 'الاسم ي-أ' },
  { value: 'year_desc', label: 'السنة (جديد)' },
  { value: 'year_asc', label: 'السنة (قديم)' },
  { value: 'rating_desc', label: 'التقييم العام (أعلى)' },
]

export const RT_SORT_OPTIONS = [
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

export const SORT_OPTIONS = RT_SORT_OPTIONS

export const RATING_STATUSES = [
  { value: 'watched', label: 'تمت المشاهدة' },
  { value: 'rewatching', label: 'إعادة مشاهدة' },
  { value: 'dropped', label: 'متروك' },
  { value: 'on_hold', label: 'معلق' },
]

export const PLATFORM_OPTIONS = [
  { value: 'PC', label: 'PC' },
  { value: 'Console', label: 'كونسول' },
  { value: 'Mobile', label: 'موبايل' },
  { value: 'Mac', label: 'Mac' },
  { value: 'Linux', label: 'Linux' },
]
