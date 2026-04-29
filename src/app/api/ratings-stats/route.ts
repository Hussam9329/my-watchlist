import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get all rated items (movie or series with userRating)
    const ratedItems = await prisma.mediaItem.findMany({
      where: {
        type: { in: ['movie', 'series'] },
        userRating: { not: null }
      },
      select: {
        type: true,
        genres: true,
        year: true,
        userRating: true,
        ratingStatus: true,
        runtime: true,
        addedAt: true,
      }
    })

    // Total rated items
    const totalRated = ratedItems.length

    // Top genre - parse comma-separated genres
    const genreMap: Record<string, number> = {}
    ratedItems.forEach(item => {
      if (item.genres) {
        item.genres.split(',').map(g => g.trim()).filter(Boolean).forEach(g => {
          genreMap[g] = (genreMap[g] || 0) + 1
        })
      }
    })
    const topGenre = Object.keys(genreMap).sort((a, b) => genreMap[b] - genreMap[a])[0] || '-'

    // Average rating
    const ratings = ratedItems.map(x => x.userRating!).filter(x => x !== null && x !== undefined)
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    // Top production year
    const yearMap: Record<string, number> = {}
    ratedItems.forEach(item => {
      if (item.year) {
        yearMap[item.year] = (yearMap[item.year] || 0) + 1
      }
    })
    const topYear = Object.keys(yearMap).sort((a, b) => yearMap[b] - yearMap[a])[0] || '-'

    // Items added this month
    const now = new Date()
    const thisMonth = ratedItems.filter(item => {
      const d = new Date(item.addedAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length

    // Movie/series specific stats
    const movies = ratedItems.filter(i => i.type === 'movie')
    const series = ratedItems.filter(i => i.type === 'series')

    const movieCount = movies.length
    const seriesCount = series.length
    const avgMovieRating = movies.length ? movies.reduce((a, m) => a + (m.userRating || 0), 0) / movies.length : 0
    const avgSeriesRating = series.length ? series.reduce((a, s) => a + (s.userRating || 0), 0) / series.length : 0

    // Plan-to-watch movies for movie night picker
    const planMovies = movies.filter(m => m.ratingStatus === 'plan')

    return NextResponse.json({
      totalRated,
      topGenre,
      avgRating: Math.round(avgRating * 100) / 100,
      topYear,
      thisMonth,
      movieCount,
      seriesCount,
      avgMovieRating: Math.round(avgMovieRating * 100) / 100,
      avgSeriesRating: Math.round(avgSeriesRating * 100) / 100,
      planMovieCount: planMovies.length,
    })
  } catch (error) {
    console.error('Ratings stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
