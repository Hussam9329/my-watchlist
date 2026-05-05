export const TMDB_API_KEY = process.env.TMDB_API_KEY || '2dca580c2a14b55200e784d157207b4d'
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

/**
 * Fetch English poster for a TMDB movie/tv ID when not available from search results.
 * Used by the metadata search route.
 */
export async function fetchEnglishPosterById(
  tmdbId: number,
  tmdbType: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/${tmdbType}/${tmdbId}?language=en-US&api_key=${TMDB_API_KEY}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    return data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : null
  } catch {
    return null
  }
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
