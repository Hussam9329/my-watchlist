// ==================== Shared Sort & Filter Utilities ====================

import { MediaItem } from './types'
import { normalizeGenres } from './format'

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
      case 'title':
        aVal = a.title
        bVal = b.title
        break
      case 'year':
        aVal = a.year
        bVal = b.year
        break
      case 'userRating':
        aVal = a.userRating ?? -1
        bVal = b.userRating ?? -1
        break
      case 'rating':
        aVal = a.rating ? parseFloat(a.rating) : -1
        bVal = b.rating ? parseFloat(b.rating) : -1
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

/** Filter media items by genre and year */
export function filterMediaItems(
  items: MediaItem[],
  options: { filterGenre?: string; filterYear?: string },
): MediaItem[] {
  const { filterGenre, filterYear } = options
  return items.filter((item) => {
    if (filterGenre && !normalizeGenres(item.genres).some((g) => g.toLowerCase().includes(filterGenre.toLowerCase()))) return false
    if (filterYear && item.year !== filterYear) return false
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
