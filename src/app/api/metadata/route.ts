import { NextRequest, NextResponse } from 'next/server'
import { TMDB_API_KEY, TMDB_BASE_URL, fetchEnglishDetailsById } from '@/lib/tmdb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const title = body.title || body.query
    const type = body.type || 'movie'

    if (!title) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    }

    if (type === 'book') {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY || 'AIzaSyB7JLp8QJzHch9I1qeCc4PQ2rzZ7qfQyl8'
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=10&orderBy=relevance&printType=books&key=${apiKey}`

      const response = await fetch(url, { cache: 'no-store' })
      const data = await response.json()

      if (data.items && data.items.length > 0) {
        const results = data.items.map((item: any) => {
          const info = item.volumeInfo || {}
          return {
            title: info.title,
            originalTitle: info.title,
            year: info.publishedDate ? info.publishedDate.split('-')[0] : '',
            poster: info.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
            overview: info.description || 'لا يوجد وصف',
            rating: info.averageRating ? info.averageRating.toFixed(1) : null,
            type: 'book',
            author: info.authors?.join(', ') || 'غير معروف',
            pages: info.pageCount || null,
            genres: info.categories || []
          }
        })
        return NextResponse.json({ results })
      }
      return NextResponse.json({ results: [] })
    }

    if (type === 'game') {
      const steamResponse = await fetch(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&cc=us&l=english&count=10`,
        { cache: 'no-store', headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
      )
      const steamData = await steamResponse.json()

      if (steamData.items && steamData.items.length > 0) {
        const results = steamData.items.map((item: any) => {
          const appId = item.id
          const platformList: string[] = []
          if (item.platforms) {
            if (item.platforms.windows) platformList.push('PC')
            if (item.platforms.mac) platformList.push('Mac')
            if (item.platforms.linux) platformList.push('Linux')
          }
          const posterUrl = appId
            ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`
            : null

          return {
            title: item.name,
            originalTitle: item.name,
            year: '',
            poster: posterUrl,
            overview: '',
            rating: item.metascore ? (parseInt(item.metascore) / 10).toFixed(1) : null,
            genres: [],
            platform: platformList.length > 0 ? platformList.join(', ') : ''
          }
        })
        return NextResponse.json({ results })
      }
      return NextResponse.json({ results: [] })
    }

    // ==================== Movies / TV / Anime ====================
    // Search BOTH movie and TV endpoints in parallel so the user sees
    // results from both categories and can pick the correct one.
    // This prevents the series/movie mixing bug where users accidentally
    // save a TV show as a movie (or vice versa).

    const [movieEnRes, movieArRes, tvEnRes, tvArRes] = await Promise.all([
      fetch(
        `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(title)}&language=en-US&api_key=${TMDB_API_KEY}`,
        { cache: 'no-store' }
      ),
      fetch(
        `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(title)}&language=ar&api_key=${TMDB_API_KEY}`,
        { cache: 'no-store' }
      ),
      fetch(
        `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(title)}&language=en-US&api_key=${TMDB_API_KEY}`,
        { cache: 'no-store' }
      ),
      fetch(
        `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(title)}&language=ar&api_key=${TMDB_API_KEY}`,
        { cache: 'no-store' }
      ),
    ])

    const [movieEnData, movieArData, tvEnData, tvArData] = await Promise.all([
      movieEnRes.json(),
      movieArRes.json(),
      tvEnRes.json(),
      tvArRes.json(),
    ])

    // Build maps by TMDB ID for cross-referencing
    const movieEnMap = new Map<number, any>(
      (movieEnData.results || []).map((r: any) => [r.id, r])
    )
    const movieArMap = new Map<number, any>(
      (movieArData.results || []).map((r: any) => [r.id, r])
    )
    const tvEnMap = new Map<number, any>(
      (tvEnData.results || []).map((r: any) => [r.id, r])
    )
    const tvArMap = new Map<number, any>(
      (tvArData.results || []).map((r: any) => [r.id, r])
    )

    // Merge all results — deduplicated by (tmdbType, tmdbId) combo
    const seenKeys = new Set<string>()
    const allRawResults: { result: any; tmdbType: 'movie' | 'tv' }[] = []

    // Prioritize the user's selected type first, then show the other type
    const selectedTmdbType = type === 'movie' ? 'movie' : 'tv'
    const otherTmdbType = selectedTmdbType === 'movie' ? 'tv' : 'movie'

    // Add results in priority order: selected type first
    for (const tmdbType of [selectedTmdbType, otherTmdbType] as const) {
      const enData = tmdbType === 'movie' ? movieEnData : tvEnData
      const arData = tmdbType === 'movie' ? movieArData : tvArData

      // English results first
      for (const r of (enData.results || [])) {
        const key = `${tmdbType}:${r.id}`
        if (!seenKeys.has(key)) {
          seenKeys.add(key)
          allRawResults.push({ result: r, tmdbType })
        }
      }
      // Arabic-only results
      for (const r of (arData.results || [])) {
        const key = `${tmdbType}:${r.id}`
        if (!seenKeys.has(key)) {
          seenKeys.add(key)
          allRawResults.push({ result: r, tmdbType })
        }
      }
    }

    if (allRawResults.length > 0) {
      // Process top results — limit to 8 (4 per type max)
      const resultsPromises = allRawResults.slice(0, 8).map(async ({ result, tmdbType }) => {
        const enMap = tmdbType === 'movie' ? movieEnMap : tvEnMap
        const arMap = tmdbType === 'movie' ? movieArMap : tvArMap
        const enResult = enMap.get(result.id) || null
        const arResult = arMap.get(result.id) || null
        const isArabic = result.original_language === 'ar'

        let displayTitle: string
        let displayOriginalTitle: string
        let displayPoster: string | null
        let displayOverview: string
        let displayYear: string
        let displayEpisodes: number | null = null
        let displaySeasons: number | null = null
        let displayRuntime: number | null = null
        let displayStatus: string | null = null

        // Auto-detect the app-level type from TMDB result
        // For TV results: check if it's anime (origin_country includes JP + genre 16)
        // Otherwise it's 'series'
        let detectedType: string
        if (tmdbType === 'movie') {
          detectedType = 'movie'
        } else {
          // Check if anime: Japanese origin + animation genre, or user selected anime
          const genreIds: number[] = result.genre_ids || []
          const originCountry: string[] = result.origin_country || []
          const isAnime = (originCountry.includes('JP') && genreIds.includes(16)) || type === 'anime'
          detectedType = isAnime ? 'anime' : 'series'
        }

        if (isArabic) {
          // Arabic original film: Arabic title, Arabic poster
          displayTitle = result.original_title || result.original_name || result.title || result.name
          displayOriginalTitle = enResult?.title || enResult?.name || result.title || result.name
          displayPoster = arResult?.poster_path
            ? `https://image.tmdb.org/t/p/w500${arResult.poster_path}`
            : (result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null)
          displayOverview = arResult?.overview || result.overview || enResult?.overview || 'لا يوجد وصف'
          displayYear = (result.release_date || result.first_air_date || '').split('-')[0]
        } else {
          // Non-Arabic work: ALWAYS show English title & poster
          let englishData = enResult

          if (!englishData && result.id) {
            englishData = await fetchEnglishDetailsById(result.id, tmdbType)
          }

          displayTitle = englishData?.title || englishData?.name || result.title || result.name || ''
          displayOriginalTitle = englishData?.original_title || englishData?.original_name || result.original_title || result.original_name || ''
          if (displayTitle === displayOriginalTitle) {
            displayOriginalTitle = ''
          }

          if (englishData?.poster_path) {
            displayPoster = `https://image.tmdb.org/t/p/w500${englishData.poster_path}`
          } else if (result.poster_path) {
            displayPoster = `https://image.tmdb.org/t/p/w500${result.poster_path}`
          } else {
            displayPoster = null
          }

          displayOverview = arResult?.overview || englishData?.overview || result.overview || 'لا يوجد وصف'
          displayYear = (englishData?.release_date || englishData?.first_air_date || result.release_date || result.first_air_date || '').split('-')[0]

          // TV-specific fields from English details
          if (tmdbType === 'tv' && englishData) {
            displayEpisodes = englishData.number_of_episodes ?? null
            displaySeasons = englishData.number_of_seasons ?? null
            displayStatus = englishData.status ?? null
          }
          // Movie-specific fields
          if (tmdbType === 'movie' && englishData) {
            displayRuntime = englishData.runtime ?? null
            displayStatus = englishData.status ?? null
          }
        }

        return {
          title: displayTitle,
          originalTitle: displayOriginalTitle,
          year: displayYear,
          poster: displayPoster,
          overview: displayOverview,
          rating: result.vote_average ? result.vote_average.toFixed(1) : null,
          type: detectedType,
          episodes: displayEpisodes,
          seasons: displaySeasons,
          runtime: displayRuntime,
          status: displayStatus,
          genres: []
        }
      })

      const results = await Promise.all(resultsPromises)
      return NextResponse.json({ results })
    }

    return NextResponse.json({ results: [] })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء البحث' }, { status: 500 })
  }
}
