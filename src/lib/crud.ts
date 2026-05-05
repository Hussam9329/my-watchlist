// ==================== Shared CRUD Helpers ====================

import { MediaItem } from './types'

/** Build request body for create/update operations from form data */
export function buildItemBody(
  formData: Record<string, string>,
  itemType: string,
): Record<string, unknown> {
  return {
    title: formData.title,
    originalTitle: formData.originalTitle || null,
    year: formData.year || '',
    type: itemType,
    poster: formData.poster || null,
    rating: formData.rating || null,
    overview: formData.overview || null,
    genres: formData.genres,
    episodes: formData.episodes ? parseInt(formData.episodes) : null,
    seasons: formData.seasons ? parseInt(formData.seasons) : null,
    duration: formData.duration || null,
    status: formData.status || null,
    author: formData.author || null,
    pages: formData.pages ? parseInt(formData.pages) : null,
    tags: formData.tags,
    notes: formData.notes,
    userRating: formData.userRating ? parseFloat(formData.userRating) : null,
    rewatch: formData.rewatch === 'true',
    runtime: formData.runtime ? parseInt(formData.runtime) : null,
    ratingStatus: formData.ratingStatus || 'watched',
  }
}

/** Build request body for import operations from raw item data */
export function buildImportBody(
  item: any,
  itemType: string,
): Record<string, unknown> {
  return {
    title: item.title,
    originalTitle: item.originalTitle || null,
    year: item.year || '',
    type: itemType,
    poster: item.poster || null,
    rating: item.rating || null,
    overview: item.overview || null,
    genres: Array.isArray(item.genres) ? item.genres.join(', ') : (item.genres || ''),
    episodes: item.episodes || null,
    seasons: item.seasons || null,
    duration: item.duration || null,
    status: item.status || null,
    author: item.author || null,
    pages: item.pages || null,
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    notes: item.notes || '',
    userRating: item.userRating != null ? item.userRating : null,
    rewatch: item.rewatch || false,
    runtime: item.runtime || null,
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
  itemType: string,
): Promise<{ imported: number; duplicates: number }> {
  const text = await file.text()
  const items = JSON.parse(text)
  if (!Array.isArray(items)) throw new Error('Invalid format')

  let imported = 0
  let duplicates = 0

  for (const item of items) {
    try {
      const body = buildImportBody(item, itemType)
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
