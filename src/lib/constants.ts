// ==================== Shared Constants ====================

export const WL_SORT_OPTIONS = [
  { value: 'addedAt_desc', label: 'أضيف مؤخراً' },
  { value: 'addedAt_asc', label: 'أضيف أولاً' },
  { value: 'updatedAt_desc', label: 'آخر تحديث' },
  { value: 'title_asc', label: 'الاسم أ-ي' },
  { value: 'title_desc', label: 'الاسم ي-أ' },
  { value: 'originalTitle_asc', label: 'الاسم الأصلي أ-ي' },
  { value: 'year_desc', label: 'السنة (جديد)' },
  { value: 'year_asc', label: 'السنة (قديم)' },
  { value: 'rating_desc', label: 'التقييم العام (أعلى)' },
  { value: 'rating_asc', label: 'التقييم العام (أدنى)' },
  { value: 'runtime_desc', label: 'المدة (أطول)' },
  { value: 'runtime_asc', label: 'المدة (أقصر)' },
  { value: 'episodes_desc', label: 'الحلقات (أكثر)' },
  { value: 'episodes_asc', label: 'الحلقات (أقل)' },
  { value: 'seasons_desc', label: 'المواسم (أكثر)' },
  { value: 'seasons_asc', label: 'المواسم (أقل)' },
]

export const RT_SORT_OPTIONS = [
  ...WL_SORT_OPTIONS,
  { value: 'userRating_desc', label: 'تقييمي (أعلى)' },
  { value: 'userRating_asc', label: 'تقييمي (أدنى)' },
  { value: 'ratingStatus_asc', label: 'حالة التقييم أ-ي' },
]

export const BOOK_SORT_OPTIONS = [
  { value: 'addedAt_desc', label: 'أضيف مؤخراً' },
  { value: 'addedAt_asc', label: 'أضيف أولاً' },
  { value: 'updatedAt_desc', label: 'آخر تحديث' },
  { value: 'title_asc', label: 'الاسم أ-ي' },
  { value: 'title_desc', label: 'الاسم ي-أ' },
  { value: 'author_asc', label: 'المؤلف أ-ي' },
  { value: 'author_desc', label: 'المؤلف ي-أ' },
  { value: 'year_desc', label: 'السنة (جديد)' },
  { value: 'year_asc', label: 'السنة (قديم)' },
  { value: 'pages_desc', label: 'الصفحات (أكثر)' },
  { value: 'pages_asc', label: 'الصفحات (أقل)' },
  { value: 'rating_desc', label: 'التقييم العام (أعلى)' },
  { value: 'rating_asc', label: 'التقييم العام (أدنى)' },
  { value: 'userRating_desc', label: 'تقييمي (أعلى)' },
  { value: 'userRating_asc', label: 'تقييمي (أدنى)' },
]

export const GAME_SORT_OPTIONS = [
  { value: 'addedAt_desc', label: 'أضيف مؤخراً' },
  { value: 'addedAt_asc', label: 'أضيف أولاً' },
  { value: 'updatedAt_desc', label: 'آخر تحديث' },
  { value: 'title_asc', label: 'الاسم أ-ي' },
  { value: 'title_desc', label: 'الاسم ي-أ' },
  { value: 'author_asc', label: 'المنصة أ-ي' },
  { value: 'author_desc', label: 'المنصة ي-أ' },
  { value: 'year_desc', label: 'السنة (جديد)' },
  { value: 'year_asc', label: 'السنة (قديم)' },
  { value: 'rating_desc', label: 'التقييم العام (أعلى)' },
  { value: 'rating_asc', label: 'التقييم العام (أدنى)' },
  { value: 'userRating_desc', label: 'تقييمي (أعلى)' },
  { value: 'userRating_asc', label: 'تقييمي (أدنى)' },
]

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
