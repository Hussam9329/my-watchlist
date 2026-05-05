// ==================== Shared Types ====================

export interface MediaItem {
  id: string
  title: string
  originalTitle?: string | null
  year: string
  type: string
  poster?: string | null
  rating?: string | null
  overview?: string | null
  genres: string[] | string
  episodes?: number | null
  seasons?: number | null
  duration?: string | null
  status?: string | null
  author?: string | null
  pages?: number | null
  tags: string[] | string
  notes: string
  watched?: boolean
  watchedAt?: string | null
  userRating?: number | null
  rewatch: boolean
  runtime?: number | null
  ratingStatus: string
  addedAt: string
  updatedAt: string
}

export interface MetadataResult {
  title: string
  originalTitle?: string
  year?: string
  poster?: string | null
  overview?: string
  rating?: string | null
  type?: string
  mediaType?: string // 'movie' or 'tv' — the actual TMDB type
  typeMismatch?: boolean // true if this result is from a different type endpoint (fallback)
  genres?: string[]
  author?: string
  pages?: number | null
  episodes?: number | null
  seasons?: number | null
  duration?: string
  status?: string
  runtime?: number | null
  platform?: string
}

export interface StatsData {
  totalRated: number
  topGenre: string
  avgRating: number
  topYear: string
  topDecade: string
  thisMonth: number
  movieCount: number
  seriesCount: number
  animeCount: number
  avgMovieRating: number
  avgSeriesRating: number
  avgAnimeRating: number
  genreCount: number
  maxRating: number
  maxRatingTitle: string
}
