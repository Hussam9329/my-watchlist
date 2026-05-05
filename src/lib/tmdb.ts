export const TMDB_API_KEY = process.env.TMDB_API_KEY || '2dca580c2a14b55200e784d157207b4d'
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export interface TMDBEnglishDetails {
  title: string | null
  name: string | null
  original_title: string | null
  original_name: string | null
  overview: string | null
  poster_path: string | null
  release_date: string | null
  first_air_date: string | null
  number_of_episodes: number | null
  number_of_seasons: number | null
  runtime: number | null
  status: string | null
  genres: { id: number; name: string }[] | null
}

/**
 * Fetch full English details for a TMDB movie/tv ID.
 * Used when a non-Arabic work was found only in the Arabic search
 * and we need the English title/overview/poster.
 */
export async function fetchEnglishDetailsById(
  tmdbId: number,
  tmdbType: string
): Promise<TMDBEnglishDetails | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/${tmdbType}/${tmdbId}?language=en-US&api_key=${TMDB_API_KEY}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    return {
      title: data.title || null,
      name: data.name || null,
      original_title: data.original_title || null,
      original_name: data.original_name || null,
      overview: data.overview || null,
      poster_path: data.poster_path || null,
      release_date: data.release_date || null,
      first_air_date: data.first_air_date || null,
      number_of_episodes: data.number_of_episodes ?? null,
      number_of_seasons: data.number_of_seasons ?? null,
      runtime: data.runtime ?? null,
      status: data.status ?? null,
      genres: data.genres ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Fetch English poster URL for a TMDB movie/tv ID.
 * Convenience wrapper around fetchEnglishDetailsById.
 */
export async function fetchEnglishPosterById(
  tmdbId: number,
  tmdbType: string
): Promise<string | null> {
  const details = await fetchEnglishDetailsById(tmdbId, tmdbType)
  return details?.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : null
}

/**
 * Fetch English poster for a movie/tv/anime by searching its title on TMDB.
 * Used by the refresh-posters route.
 */
export async function fetchEnglishPosterByTitle(
  title: string,
  type: string
): Promise<string | null> {
  const tmdbType =
    type === 'tv' || type === 'anime' || type === 'series' ? 'tv' : 'movie'
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/${tmdbType}?query=${encodeURIComponent(title)}&language=en-US&api_key=${TMDB_API_KEY}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    if (data.results && data.results.length > 0) {
      const match = data.results[0]
      return match.poster_path
        ? `https://image.tmdb.org/t/p/w500${match.poster_path}`
        : null
    }
    return null
  } catch {
    return null
  }
}
