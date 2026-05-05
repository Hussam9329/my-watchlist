// ==================== Shared Formatting Utilities ====================

/** Format a MediaItem from DB (genres/tags as comma-separated string) to API response (genres/tags as array) */
export function formatItem(item: any) {
  return {
    ...item,
    genres: item.genres ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
    tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
  }
}

/** Normalize genres which may be string[] or comma-separated string into string[] */
export function normalizeGenres(genres: string[] | string): string[] {
  if (Array.isArray(genres)) return genres
  if (typeof genres === 'string' && genres.trim()) return genres.split(',').map((g) => g.trim()).filter(Boolean)
  return []
}

/** Normalize tags which may be string[] or comma-separated string into string[] */
export function normalizeTags(tags: string[] | string): string[] {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string' && tags.trim()) return tags.split(',').map((t) => t.trim()).filter(Boolean)
  return []
}
