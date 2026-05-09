// ==================== Shared Rating Stars Component ====================

'use client'

import { Star } from 'lucide-react'

type ColorTheme = 'emerald' | 'teal'

interface RatingStarsProps {
  rating: number | null
  onChange?: (r: number) => void
  size?: 'sm' | 'md' | 'lg'
  colorTheme?: ColorTheme
}

export function RatingStars({ rating, onChange, size = 'sm', colorTheme = 'emerald' }: RatingStarsProps) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  const maxRating = 10
  const displayRating = rating ?? 0

  const activeColor =
    colorTheme === 'emerald'
      ? 'text-emerald-400 fill-emerald-400'
      : 'text-teal-400 fill-teal-400'

  const hoverColor =
    colorTheme === 'emerald'
      ? 'hover:text-emerald-400/50'
      : 'hover:text-teal-400/50'

  const labelColor =
    colorTheme === 'emerald'
      ? 'text-emerald-400'
      : 'text-teal-400'

  if (!onChange) {
    return (
      <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${i < displayRating ? activeColor : 'text-[#333]'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 flex-wrap" dir="ltr">
      {Array.from({ length: maxRating }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1 === rating ? 0 : i + 1)}
          className="active:scale-[0.9] transition-transform"
        >
          <Star
            className={`${sizeClass} ${i < (rating ?? 0) ? activeColor : `text-[#333] ${hoverColor}`} transition-colors`}
          />
        </button>
      ))}
      {rating != null && (
        <span className={`text-sm font-bold ${labelColor} mr-1`}>{rating}/10</span>
      )}
    </div>
  )
}
