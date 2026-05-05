import { NextRequest, NextResponse } from 'next/server'
import { TMDB_API_KEY, TMDB_BASE_URL, fetchEnglishPosterById } from '@/lib/tmdb'

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
    const tmdbType = type === 'movie' ? 'movie' : 'tv'

    // Search in both English and Arabic in parallel
    const [enResponse, arResponse] = await Promise.all([
      fetch(
        `${TMDB_BASE_URL}/search/${tmdbType}?query=${encodeURIComponent(title)}&language=en-US&api_key=${TMDB_API_KEY}`,
        { cache: 'no-store' }
      ),
      fetch(
        `${TMDB_BASE_URL}/search/${tmdbType}?query=${encodeURIComponent(title)}&language=ar&api_key=${TMDB_API_KEY}`,
        { cache: 'no-store' }
      )
    ])

    const enData = await enResponse.json()
    const arData = await arResponse.json()

    // Create maps by TMDB ID for cross-referencing
    const arResultsMap = new Map<number, any>(
      (arData.results || []).map((r: any) => [r.id, r])
    )
    const enResultsMap = new Map<number, any>(
      (enData.results || []).map((r: any) => [r.id, r])
    )

    // Merge results: use English results as primary, add Arabic-only results as fallback
    const seenIds = new Set<number>()
    const mergedResults: any[] = []

    // Add English results first (these are preferred for non-Arabic films)
    for (const r of (enData.results || [])) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id)
        mergedResults.push(r)
      }
    }

    // Add Arabic-only results (found in Arabic search but not in English)
    for (const r of (arData.results || [])) {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id)
        mergedResults.push(r)
      }
    }

    if (mergedResults.length > 0) {
      // Process results — for non-Arabic films, fetch English poster if not available
      const resultsPromises = mergedResults.slice(0, 5).map(async (result: any) => {
        const arResult = arResultsMap.get(result.id)
        const enResult = enResultsMap.get(result.id)
        const isArabic = result.original_language === 'ar'

        let displayTitle: string
        let displayOriginalTitle: string
        let displayPoster: string | null
        let displayOverview: string

        if (isArabic) {
          // Arabic original film: Arabic title, Arabic poster
          displayTitle = result.original_title || result.original_name || result.title || result.name
          displayOriginalTitle = enResult?.title || enResult?.name || result.title || result.name
          displayPoster = arResult?.poster_path
            ? `https://image.tmdb.org/t/p/w500${arResult.poster_path}`
            : (result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null)
          displayOverview = arResult?.overview || result.overview || enResult?.overview || 'لا يوجد وصف'
        } else {
          // Non-Arabic film: English title, English poster (ALWAYS)
          displayTitle = enResult?.title || enResult?.name || result.title || result.name
          displayOriginalTitle = result.original_title || result.original_name || enResult?.original_title || ''

          // Priority: English poster from enResult > English poster from direct TMDB fetch > fallback
          if (enResult?.poster_path) {
            // We have the English poster from search results
            displayPoster = `https://image.tmdb.org/t/p/w500${enResult.poster_path}`
          } else if (result.poster_path && enResult) {
            // result is from English search, use its poster
            displayPoster = `https://image.tmdb.org/t/p/w500${result.poster_path}`
          } else if (result.id && !enResult) {
            // Result found only in Arabic search — fetch English poster directly from TMDB
            const fetchedPoster = await fetchEnglishPosterById(result.id, tmdbType)
            displayPoster = fetchedPoster || (result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null)
          } else {
            displayPoster = result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null
          }

          displayOverview = arResult?.overview || enResult?.overview || result.overview || 'لا يوجد وصف'
        }

        return {
          title: displayTitle,
          originalTitle: displayOriginalTitle,
          year: (result.release_date || result.first_air_date || enResult?.release_date || enResult?.first_air_date || '').split('-')[0],
          poster: displayPoster,
          overview: displayOverview,
          rating: result.vote_average ? result.vote_average.toFixed(1) : null,
          type: type,
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
