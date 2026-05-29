// ==================== Shared CRUD Helpers ====================

import { MediaItem, MetadataResult } from './types'
import { normalizeType, parseOptionalInt, normalizeListField } from './format'

/** Build request body for create/update operations from form data */
export function buildItemBody(
  formData: Record<string, string>,
  itemType: string,
): Record<string, unknown> {
  const normalizedType = normalizeType(itemType)
  return {
    title: formData.title,
    originalTitle: formData.originalTitle || null,
    year: formData.year || '',
    type: normalizedType,
    poster: formData.poster || null,
    rating: formData.rating || null,
    overview: formData.overview || null,
    genres: formData.genres,
    episodes: parseOptionalInt(formData.episodes),
    seasons: parseOptionalInt(formData.seasons),
    duration: formData.duration || null,
    status: formData.status || null,
    author: formData.author || null,
    pages: parseOptionalInt(formData.pages),
    tags: formData.tags,
    notes: formData.notes || '',
    userRating: formData.userRating && !isNaN(Number(formData.userRating)) ? parseFloat(formData.userRating) : null,
    rewatch: formData.rewatch === 'true',
    runtime: parseOptionalInt(formData.runtime),
    ratingStatus: formData.ratingStatus || 'watched',
  }
}

/** Build request body for import operations from raw item data */
export function buildImportBody(
  item: Partial<MediaItem> & Record<string, unknown>,
  itemType: string,
): Record<string, unknown> {
  const normalizedType = normalizeType(itemType)
  return {
    title: item.title,
    originalTitle: item.originalTitle || null,
    year: item.year || '',
    type: normalizedType,
    poster: item.poster || null,
    rating: item.rating || null,
    overview: item.overview || null,
    genres: normalizeListField(item.genres),
    episodes: parseOptionalInt(item.episodes),
    seasons: parseOptionalInt(item.seasons),
    duration: item.duration || null,
    status: item.status || null,
    author: item.author || null,
    pages: parseOptionalInt(item.pages),
    tags: normalizeListField(item.tags),
    notes: item.notes || '',
    userRating: item.userRating != null && !isNaN(Number(item.userRating)) ? parseFloat(String(item.userRating)) : null,
    rewatch: item.rewatch || false,
    runtime: parseOptionalInt(item.runtime),
    ratingStatus: item.ratingStatus || 'watched',
  }
}

/** Export all matching data to JSON file, not just the first API page. */
export async function exportDataToFile(type?: string, fileNamePrefix = 'hussamvision-backup') {
  const allItems: MediaItem[] = []
  let page = 1
  const limit = 500
  let hasMore = true

  while (hasMore) {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    params.set('limit', String(limit))
    params.set('page', String(page))

    const res = await fetch(`/api/watchlist?${params}`)
    if (!res.ok) throw new Error('تعذر تصدير البيانات')

    const data = await res.json()
    const items: MediaItem[] = data.items || []
    allItems.push(...items)

    hasMore = Boolean(data.hasMore) && items.length > 0
    page += 1
  }

  const blob = new Blob([JSON.stringify(allItems, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileNamePrefix}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Import data from JSON file using the bulk endpoint for instant, low-network import. */
export async function importDataFromFile(
  file: File,
  itemType?: string,
): Promise<{ imported: number; duplicates: number; skipped: number }> {
  const text = await file.text()
  const items = JSON.parse(text)
  if (!Array.isArray(items)) throw new Error('ملف JSON غير صالح')

  const res = await fetch('/api/watchlist/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, type: itemType }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || 'تعذر استيراد البيانات')
  }

  const data = await res.json()
  return {
    imported: Number(data.imported || 0),
    duplicates: Number(data.duplicates || 0),
    skipped: Number(data.skipped || 0),
  }
}



/** Build a stable key for selecting multiple metadata search results. */
export function metadataResultKey(result: MetadataResult): string {
  return [result.type || result.mediaType || '', result.title || '', result.originalTitle || '', result.year || '']
    .map((part) => String(part).trim().toLowerCase())
    .join('|')
}

/** Convert a metadata search result into an import-compatible item payload. */
export function metadataResultToImportItem(
  result: MetadataResult,
  fallbackType = 'movie',
): Record<string, unknown> {
  const resolvedType = normalizeType(result.type || result.mediaType || fallbackType)
  return {
    title: result.title || '',
    originalTitle: result.originalTitle || null,
    year: result.year || '',
    type: resolvedType,
    poster: result.poster || null,
    rating: result.rating || null,
    overview: result.overview || null,
    genres: Array.isArray(result.genres) ? result.genres.join(', ') : '',
    episodes: parseOptionalInt(result.episodes),
    seasons: parseOptionalInt(result.seasons),
    duration: result.duration || null,
    status: result.status || null,
    author: result.author || result.platform || null,
    pages: parseOptionalInt(result.pages),
    tags: '',
    notes: '',
    userRating: null,
    rewatch: false,
    runtime: parseOptionalInt(result.runtime),
    ratingStatus: 'watched',
  }
}

/** Add many metadata results at once using the bulk import endpoint. */
export async function addMetadataResultsToWatchlist(
  results: MetadataResult[],
  fallbackType = 'movie',
  forcedType?: string,
): Promise<{ imported: number; duplicates: number; skipped: number }> {
  const items = results
    .map((result) => metadataResultToImportItem(result, fallbackType))
    .filter((item) => String(item.title || '').trim())

  if (items.length === 0) {
    return { imported: 0, duplicates: 0, skipped: results.length }
  }

  const res = await fetch('/api/watchlist/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, type: forcedType }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || 'تعذر إضافة العناصر المحددة')
  }

  const data = await res.json()
  return {
    imported: Number(data.imported || 0),
    duplicates: Number(data.duplicates || 0),
    skipped: Number(data.skipped || 0),
  }
}

/** Convert MediaItem to form data for editing */
export function itemToFormData(item: Partial<MediaItem>): Record<string, string> {
  return {
    title: item.title || '',
    originalTitle: item.originalTitle || '',
    year: item.year || '',
    type: item.type || 'movie',
    poster: item.poster || '',
    rating: item.rating || '',
    overview: item.overview || '',
    genres: Array.isArray(item.genres) ? item.genres.join(', ') : (item.genres || ''),
    episodes: item.episodes != null ? String(item.episodes) : '',
    seasons: item.seasons != null ? String(item.seasons) : '',
    duration: item.duration || '',
    status: item.status || '',
    author: item.author || '',
    pages: item.pages != null ? String(item.pages) : '',
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    notes: item.notes || '',
    userRating: item.userRating != null ? String(item.userRating) : '',
    rewatch: item.rewatch ? 'true' : 'false',
    runtime: item.runtime != null ? String(item.runtime) : '',
    ratingStatus: item.ratingStatus || 'watched',
  }
}
