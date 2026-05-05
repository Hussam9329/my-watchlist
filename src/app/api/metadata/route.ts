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
            mediaType: 'book',
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
            type: 'game',
            mediaType: 'game',
            platform: platformList.length > 0 ? platformList.join(', ') : ''
          }
        })
        return NextResponse.json({ results })
      }
      return NextResponse.json({ results: [] })
    }

    // ==================== Movies / TV / Anime ====================
    // IMPORTANT FIX: Search BOTH movie and TV endpoints simultaneously
    // This prevents the mix-up where movies appear as series and vice versa
    // Each result will carry its actual mediaType ('movie' or 'tv')

    // Determine which TMDB endpoints to search based on selected type
    const searchEndpoints: ('movie' | 'tv')[] = []
    if (type === 'movie') {
      searchEndpoints.push('movie')
      // Also search TV in case the user selected "movie" but the work is actually a series
      searchEndpoints.push('tv')
    } else if (type === 'series' || type === 'anime' || type === 'tv') {
      searchEndpoints.push('tv')
      // Also search movies in case the user selected "series" but the work is actually a movie
      searchEndpoints.push('movie')
    } else {
      // Default: search both
      searchEndpoints.push('movie', 'tv')
    }

    // Search all endpoints in parallel (English + Arabic for each)
    const searchPromises = searchEndpoints.map(async (endpoint) => {
      const [enResponse, arResponse] = await Promise.all([
        fetch(
          `${TMDB_BASE_URL}/search/${endpoint}?query=${encodeURIComponent(title)}&language=en-US&api_key=${TMDB_API_KEY}`,
          { cache: 'no-store' }
        ),
        fetch(
          `${TMDB_BASE_URL}/search/${endpoint}?query=${encodeURIComponent(title)}&language=ar&api_key=${TMDB_API_KEY}`,
          { cache: 'no-store' }
        )
      ])

      const enData = await enResponse.json()
      const arData = await arResponse.json()

      return {
        endpoint,
        enResults: enData.results || [],
        arResults: arData.results || []
      }
    })

    const searchResults = await Promise.all(searchPromises)

    // Merge all results, deduplicating by TMDB ID and tagging with actual mediaType
    const seenIds = new Set<number>()
    const mergedResults: any[] = []

    for (const { endpoint, enResults, arResults } of searchResults) {
      // English results first
      for (const r of enResults) {
        if (!seenIds.has(r.id)) {
          seenIds.add(r.id)
          mergedResults.push({ ...r, _tmdbType: endpoint })
        }
      }
      // Arabic-only results
      for (const r of arResults) {
        if (!seenIds.has(r.id)) {
          seenIds.add(r.id)
          mergedResults.push({ ...r, _tmdbType: endpoint })
        }
      }
    }

    if (mergedResults.length > 0) {
      // Process results — for non-Arabic works, always ensure English display
      const resultsPromises = mergedResults.slice(0, 8).map(async (result: any) => {
        const tmdbType = result._tmdbType as 'movie' | 'tv'
        const isArabic = result.original_language === 'ar'

        // Determine the actual resolved type for the form
        // If user selected 'anime', keep it; otherwise use 'series' for TV results
        let resolvedType: string
        if (tmdbType === 'movie') {
          resolvedType = 'movie'
        } else {
          // Check if anime: Japanese origin + animation genre, or user selected anime
          const genreIds: number[] = result.genre_ids || []
          const originCountry: string[] = result.origin_country || []
          const isAnime = (originCountry.includes('JP') && genreIds.includes(16)) || type === 'anime'
          resolvedType = isAnime ? 'anime' : 'series'
        }

        // Find matching Arabic/English results across all searches
        let arResult: any = null
        let enResult: any = null
        for (const { endpoint, enResults, arResults } of searchResults) {
          if (endpoint === tmdbType) {
            enResult = enResults.find((r: any) => r.id === result.id) || null
            arResult = arResults.find((r: any) => r.id === result.id) || null
          }
        }

        let displayTitle: string
        let displayOriginalTitle: string
        let displayPoster: string | null
        let displayOverview: string
        let displayYear: string
        let displaySeasons: number | null = null
        let displayEpisodes: number | null = null
        let displayRuntime: number | null = null
        let displayGenres: string[] = []

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
          // Non-Arabic work (English, Asian, etc.): ALWAYS show English title & poster
          let englishData = enResult

          if (!englishData && result.id) {
            englishData = await fetchEnglishDetailsById(result.id, tmdbType)
          }

          // Title: English title, fallback to original title
          displayTitle = englishData?.title || englishData?.name || result.title || result.name || ''
          // Original title: the work's native title (Japanese, Korean, etc.)
          displayOriginalTitle = englishData?.original_title || englishData?.original_name || result.original_title || result.original_name || ''
          if (displayTitle === displayOriginalTitle) {
            displayOriginalTitle = ''
          }

          // Poster: English poster
          if (englishData?.poster_path) {
            displayPoster = `https://image.tmdb.org/t/p/w500${englishData.poster_path}`
          } else if (result.poster_path) {
            displayPoster = `https://image.tmdb.org/t/p/w500${result.poster_path}`
          } else {
            displayPoster = null
          }

          // Overview: prefer Arabic overview for user, fallback to English
          displayOverview = arResult?.overview || englishData?.overview || result.overview || 'لا يوجد وصف'
          displayYear = (englishData?.release_date || englishData?.first_air_date || result.release_date || result.first_air_date || '').split('-')[0]

          // Fetch detailed info for TV shows (seasons/episodes) and movies (runtime/genres)
          try {
            const detailRes = await fetch(
              `${TMDB_BASE_URL}/${tmdbType}/${result.id}?language=en-US&api_key=${TMDB_API_KEY}`,
              { cache: 'no-store' }
            )
            const detailData = await detailRes.json()

            if (tmdbType === 'tv') {
              displaySeasons = detailData.number_of_seasons || null
              displayEpisodes = detailData.number_of_episodes || null
              displayGenres = (detailData.genres || []).map((g: any) => g.name)
            } else {
              displayRuntime = detailData.runtime || null
              displayGenres = (detailData.genres || []).map((g: any) => g.name)
            }
          } catch {
            // If detail fetch fails, continue without it
          }
        }

        return {
          title: displayTitle,
          originalTitle: displayOriginalTitle,
          year: displayYear,
          poster: displayPoster,
          overview: displayOverview,
          rating: result.vote_average ? result.vote_average.toFixed(1) : null,
          type: resolvedType,
          mediaType: tmdbType, // 'movie' or 'tv' — the actual TMDB type
          genres: displayGenres,
          episodes: displayEpisodes,
          seasons: displaySeasons,
          runtime: displayRuntime,
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
