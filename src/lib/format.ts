// ==================== Shared Formatting Utilities ====================

/** Normalize type: 'tv' → 'series' to prevent mix-up between movies and series */
export function normalizeType(type: string): string {
  return type === 'tv' ? 'series' : type
}

/** Parse an optional integer from a value, returning null if invalid */
export function parseOptionalInt(value: unknown): number | null {
  if (value == null || value === '') return null
  const num = Number(value)
  return !isNaN(num) && Number.isInteger(num) ? num : null
}

/** Normalize a comma-separated string or array field into a string (for DB storage) */
export function normalizeListField(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ')
  if (typeof value === 'string') return value
  return ''
}

/** Format a MediaItem from DB (genres/tags as comma-separated string) to API response (genres/tags as array) */
export function formatItem(item: any) {
  return {
    ...item,
    genres: normalizeGenres(item.genres),
    tags: normalizeTags(item.tags),
  }
}

/** Normalize genres which may be string[] or comma-separated string into string[] */
export function normalizeGenres(genres: unknown): string[] {
  if (Array.isArray(genres)) return genres
  if (typeof genres === 'string' && genres.trim()) return genres.split(',').map((g) => g.trim()).filter(Boolean)
  return []
}

/** Normalize tags which may be string[] or comma-separated string into string[] */
export function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string' && tags.trim()) return tags.split(',').map((t) => t.trim()).filter(Boolean)
  return []
}
