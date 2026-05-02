import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const ratedItems = await prisma.mediaItem.findMany({
      where: {
        type: { in: ['movie', 'series', 'anime'] },
        userRating: { not: null }
      },
      select: {
        title: true,
        type: true,
        genres: true,
        year: true,
        userRating: true,
        ratingStatus: true,
        runtime: true,
        addedAt: true,
      }
    })

    const totalRated = ratedItems.length

    const genreMap: Record<string, number> = {}
    ratedItems.forEach(item => {
      if (item.genres) {
        item.genres.split(',').map(g => g.trim()).filter(Boolean).forEach(g => {
          genreMap[g] = (genreMap[g] || 0) + 1
        })
      }
    })
    const topGenre = Object.keys(genreMap).sort((a, b) => genreMap[b] - genreMap[a])[0] || '-'

    const ratings = ratedItems.map(x => x.userRating!).filter(x => x !== null && x !== undefined)
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    const yearMap: Record<string, number> = {}
    ratedItems.forEach(item => {
      if (item.year) yearMap[item.year] = (yearMap[item.year] || 0) + 1
    })
    const topYear = Object.keys(yearMap).sort((a, b) => yearMap[b] - yearMap[a])[0] || '-'

    const now = new Date()
    const thisMonth = ratedItems.filter(item => {
      const d = new Date(item.addedAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length

    const movies = ratedItems.filter(i => i.type === 'movie')
    const series = ratedItems.filter(i => i.type === 'series')
    const anime = ratedItems.filter(i => i.type === 'anime')

    const decadeMap: Record<string, number> = {}
    ratedItems.forEach(item => {
      const y = Number(item.year)
      if (Number.isInteger(y) && y >= 1930) {
        const decade = Math.floor(y / 10) * 10 + 's'
        decadeMap[decade] = (decadeMap[decade] || 0) + 1
      }
    })
    const topDecade = Object.keys(decadeMap).sort((a, b) => decadeMap[b] - decadeMap[a])[0] || '-'

    const maxRating = ratings.length ? Math.max(...ratings) : 0
    const topRatedItem = ratedItems.find(x => x.userRating === maxRating)
    const maxRatingTitle = topRatedItem?.title || '-'

    return NextResponse.json({
      totalRated,
      topGenre,
      avgRating: Math.round(avgRating * 100) / 100,
      topYear,
      topDecade,
      thisMonth,
      movieCount: movies.length,
      seriesCount: series.length,
      animeCount: anime.length,
      avgMovieRating: Math.round((movies.length ? movies.reduce((a, m) => a + (m.userRating || 0), 0) / movies.length : 0) * 100) / 100,
      avgSeriesRating: Math.round((series.length ? series.reduce((a, s) => a + (s.userRating || 0), 0) / series.length : 0) * 100) / 100,
      avgAnimeRating: Math.round((anime.length ? anime.reduce((a, s) => a + (s.userRating || 0), 0) / anime.length : 0) * 100) / 100,
      genreCount: Object.keys(genreMap).length,
      maxRating: Math.round(maxRating * 100) / 100,
      maxRatingTitle,
    })
  } catch (error) {
    console.error('Ratings stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
