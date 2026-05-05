// ==================== Shared Rating Utilities ====================

type ColorTheme = 'green' | 'emerald' | 'teal'

/** Format a rating number for display */
export function formatRating(num: number | null | undefined) {
  if (num == null) return '-'
  const n = Math.round(Number(num) * 100) / 100
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/** Get text color class for a rating value */
export function getRatingColor(rating: number, scale: 10 | 100 = 10, theme: ColorTheme = 'emerald') {
  const normalized = scale === 100 ? rating / 10 : rating
  if (normalized >= 7) {
    return theme === 'green'
      ? 'text-green-400'
      : theme === 'emerald'
        ? 'text-emerald-400'
        : 'text-teal-400'
  }
  if (normalized >= 4) return 'text-yellow-400'
  return 'text-red-400'
}

/** Get background/border/text color class for a rating badge */
export function getRatingBg(rating: number, scale: 10 | 100 = 10, theme: ColorTheme = 'emerald') {
  const normalized = scale === 100 ? rating / 10 : rating

  const highColors: Record<ColorTheme, string> = {
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
  }

  if (normalized >= 7) return highColors[theme]
  if (normalized >= 4) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
  return 'bg-red-500/20 border-red-500/30 text-red-400'
}
