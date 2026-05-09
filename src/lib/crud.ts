// ==================== Shared CRUD Helpers ====================

import { MediaItem } from './types'
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
  item: any,
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

/** Export data to JSON file */
export async function exportDataToFile(type?: string, fileNamePrefix = 'hussamvision-backup') {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  params.set('limit', '1000')
  const res = await fetch(`/api/watchlist?${params}`)
  const data = await res.json()
  const items = data.items || []
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileNamePrefix}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Import data from JSON file */
export async function importDataFromFile(
  file: File,
  itemType?: string,
): Promise<{ imported: number; duplicates: number }> {
  const text = await file.text()
  const items = JSON.parse(text)
  if (!Array.isArray(items)) throw new Error('Invalid format')

  let imported = 0
  let duplicates = 0

  for (const item of items) {
    try {
      const resolvedType = itemType || item.type || 'movie'
      const body = buildImportBody(item, resolvedType)
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) imported++
      else duplicates++
    } catch {
      duplicates++
    }
  }

  return { imported, duplicates }
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
