// ==================== Shared Sort & Filter Utilities ====================

import { MediaItem } from './types'
import { normalizeGenres, normalizeType } from './format'

export interface SmartFilterOptions {
  filterGenre?: string
  filterGenres?: string[]
  filterYear?: string
  filterYears?: string[]
  filterTypes?: string[]
  filterRatingStatuses?: string[]
  filterRatingMin?: string
  filterRatingMax?: string
}

export function toSelectionList(value?: string | string[]): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return value.split(',').map((v) => v.trim()).filter(Boolean)
}

export function toggleSelection(current: string[], value: string): string[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
}

function parseNumeric(value: string | number | null | undefined, fallback = 0): number {
  if (value == null || value === '') return fallback
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

/** Sort media items by a sort string like 'addedAt_desc' or 'userRating_asc' */
export function sortMediaItems(items: MediaItem[], sortBy: string): MediaItem[] {
  const sorted = [...items]
  const lastUnderscore = sortBy.lastIndexOf('_')
  const field = sortBy.substring(0, lastUnderscore)
  const direction = sortBy.substring(lastUnderscore + 1)

  sorted.sort((a, b) => {
    let aVal: string | number | null = ''
    let bVal: string | number | null = ''

    switch (field) {
      case 'addedAt':
        aVal = a.addedAt
        bVal = b.addedAt
        break
      case 'updatedAt':
        aVal = a.updatedAt
        bVal = b.updatedAt
        break
      case 'title':
        aVal = a.title
        bVal = b.title
        break
      case 'originalTitle':
        aVal = a.originalTitle || ''
        bVal = b.originalTitle || ''
        break
      case 'author':
        aVal = a.author || ''
        bVal = b.author || ''
        break
      case 'status':
        aVal = a.status || ''
        bVal = b.status || ''
        break
      case 'ratingStatus':
        aVal = a.ratingStatus || ''
        bVal = b.ratingStatus || ''
        break
      case 'year':
        aVal = parseNumeric(a.year, 0)
        bVal = parseNumeric(b.year, 0)
        break
      case 'userRating':
        aVal = a.userRating ?? -1
        bVal = b.userRating ?? -1
        break
      case 'rating':
        aVal = parseNumeric(a.rating, -1)
        bVal = parseNumeric(b.rating, -1)
        break
      case 'runtime':
      case 'pages':
      case 'episodes':
      case 'seasons':
        aVal = parseNumeric(a[field as keyof MediaItem] as string | number | null | undefined, -1)
        bVal = parseNumeric(b[field as keyof MediaItem] as string | number | null | undefined, -1)
        break
      default:
        aVal = a.addedAt
        bVal = b.addedAt
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return direction === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  return sorted
}

/** Filter media items by type, genres, years, status, and rating range. */
export function filterMediaItems(
  items: MediaItem[],
  options: SmartFilterOptions,
): MediaItem[] {
  const genres = [
    ...toSelectionList(options.filterGenre),
    ...toSelectionList(options.filterGenres),
  ]
  const years = [
    ...toSelectionList(options.filterYear),
    ...toSelectionList(options.filterYears),
  ]
  const types = toSelectionList(options.filterTypes).map(normalizeType)
  const ratingStatuses = toSelectionList(options.filterRatingStatuses)
  const ratingMin = options.filterRatingMin ? Number(options.filterRatingMin) : null
  const ratingMax = options.filterRatingMax ? Number(options.filterRatingMax) : null

  return items.filter((item) => {
    if (types.length > 0 && !types.includes(normalizeType(item.type))) return false
    if (genres.length > 0) {
      const itemGenres = normalizeGenres(item.genres).map((g) => g.toLowerCase())
      const hasGenre = genres.some((filterGenre) => itemGenres.some((g) => g.includes(filterGenre.toLowerCase())))
      if (!hasGenre) return false
    }
    if (years.length > 0 && !years.includes(item.year)) return false
    if (ratingStatuses.length > 0 && !ratingStatuses.includes(item.ratingStatus)) return false
    if (ratingMin != null && Number.isFinite(ratingMin) && (item.userRating == null || item.userRating < ratingMin)) return false
    if (ratingMax != null && Number.isFinite(ratingMax) && (item.userRating == null || item.userRating > ratingMax)) return false
    return true
  })
}

/** Check if a game item matches a platform tab */
export function itemMatchesTab(item: MediaItem, tabKey: string, tabConfig: Record<string, { platform: string }>): boolean {
  const platform = tabConfig[tabKey]?.platform
  if (!platform) return true
  const author = (item.author || '').toLowerCase()
  if (platform === 'PC') return author.includes('pc') || author.includes('windows') || author.includes('mac') || author.includes('linux')
  if (platform === 'Console') return author.includes('console') || author.includes('playstation') || author.includes('xbox') || author.includes('nintendo') || author.includes('ps') || author.includes('switch')
  if (platform === 'Mobile') return author.includes('mobile') || author.includes('android') || author.includes('ios')
  return true
}

/** Get platform badge info for a game */
export function getPlatformBadge(item: MediaItem): { label: string; color: string } | null {
  const platform = (item.author || '').toLowerCase()
  if (platform.includes('pc') || platform.includes('windows')) return { label: 'PC', color: 'from-blue-500 to-indigo-500' }
  if (platform.includes('console') || platform.includes('playstation') || platform.includes('xbox') || platform.includes('nintendo')) return { label: 'كونسول', color: 'from-purple-500 to-violet-500' }
  if (platform.includes('mobile') || platform.includes('android') || platform.includes('ios')) return { label: 'موبايل', color: 'from-orange-500 to-red-500' }
  if (platform.includes('mac')) return { label: 'Mac', color: 'from-gray-500 to-gray-600' }
  if (platform.includes('linux')) return { label: 'Linux', color: 'from-yellow-500 to-orange-500' }
  if (platform) return { label: item.author || '', color: 'from-teal-500 to-cyan-500' }
  return null
}
