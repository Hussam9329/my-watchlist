import { NextRequest, NextResponse } from 'next/server'

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

    const tmdbType = type === 'movie' ? 'movie' : 'tv'
    const TMDB_API_KEY = '2dca580c2a14b55200e784d157207b4d'

    // Search in both English and Arabic in parallel
    const [enResponse, arResponse] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/search/${tmdbType}?query=${encodeURIComponent(title)}&language=en-US&api_key=${TMDB_API_KEY}`,
        { cache: 'no-store' }
      ),
      fetch(
        `https://api.themoviedb.org/3/search/${tmdbType}?query=${encodeURIComponent(title)}&language=ar&api_key=${TMDB_API_KEY}`,
        { cache: 'no-store' }
      )
    ])

    const enData = await enResponse.json()
    const arData = await arResponse.json()

    // Create a map of Arabic results by TMDB ID for poster/title lookup
    const arResultsMap = new Map<number, any>(
      (arData.results || []).map((r: any) => [r.id, r])
    )

    if (enData.results && enData.results.length > 0) {
      const results = enData.results.slice(0, 5).map((result: any) => {
        const arResult = arResultsMap.get(result.id)
        const isArabic = result.original_language === 'ar'

        // For Arabic original films: use Arabic title + Arabic poster
        // For non-Arabic films: use English title + English poster
        // Overview: always Arabic for UI consistency (from Arabic search results)
        const displayTitle = isArabic
          ? (result.original_title || result.original_name)
          : (result.title || result.name)

        const displayOriginalTitle = isArabic
          ? (result.title || result.name) // English transliteration for Arabic films
          : (result.original_title || result.original_name) // Original language title

        const displayPoster = (isArabic && arResult?.poster_path)
          ? `https://image.tmdb.org/t/p/w500${arResult.poster_path}`
          : (result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null)

        const displayOverview = arResult?.overview || result.overview || 'لا يوجد وصف'

        return {
          title: displayTitle,
          originalTitle: displayOriginalTitle,
          year: (result.release_date || result.first_air_date || '').split('-')[0],
          poster: displayPoster,
          overview: displayOverview,
          rating: result.vote_average ? result.vote_average.toFixed(1) : null,
          type: type,
          genres: []
        }
      })
      return NextResponse.json({ results })
    }

    return NextResponse.json({ results: [] })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء البحث' }, { status: 500 })
  }
}
