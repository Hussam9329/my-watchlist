import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const title = body.title || body.query
    const type = body.type || 'movie'

    if (!title) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    }

    // الكتب - استخدام Google Books API
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

    // الأفلام والمسلسلات والأنمي - استخدام TMDB API
    const tmdbType = type === 'movie' ? 'movie' : 'tv'
    
    const response = await fetch(
      `https://api.themoviedb.org/3/search/${tmdbType}?query=${encodeURIComponent(title)}&language=ar&api_key=2dca580c2a14b55200e784d157207b4d`,
      { cache: 'no-store' }
    )
    
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const results = data.results.slice(0, 5).map((result: any) => ({
        title: result.title || result.name,
        originalTitle: result.original_title || result.original_name,
        year: (result.release_date || result.first_air_date || '').split('-')[0],
        poster: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null,
        overview: result.overview || 'لا يوجد وصف',
        rating: result.vote_average ? result.vote_average.toFixed(1) : null,
        type: type,
        genres: []
      }))
      
      return NextResponse.json({ results })
    }

    return NextResponse.json({ results: [] })

  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء البحث' }, { status: 500 })
  }
}