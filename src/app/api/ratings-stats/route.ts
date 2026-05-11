import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ==================== Ratings Stats ====================
async function getRatingsStats() {
  const mainStats = await prisma.$queryRaw<Array<{
    total_rated: bigint
    avg_rating: number | null
    movie_count: bigint
    series_count: bigint
    anime_count: bigint
    avg_movie_rating: number | null
    avg_series_rating: number | null
    avg_anime_rating: number | null
    max_rating: number | null
    this_month: bigint
  }>>`
    SELECT
      COUNT(*) as total_rated,
      AVG("userRating") as avg_rating,
      COUNT(*) FILTER (WHERE "type" = 'movie') as movie_count,
      COUNT(*) FILTER (WHERE "type" = 'series') as series_count,
      COUNT(*) FILTER (WHERE "type" = 'anime') as anime_count,
      AVG("userRating") FILTER (WHERE "type" = 'movie') as avg_movie_rating,
      AVG("userRating") FILTER (WHERE "type" = 'series') as avg_series_rating,
      AVG("userRating") FILTER (WHERE "type" = 'anime') as avg_anime_rating,
      MAX("userRating") as max_rating,
      COUNT(*) FILTER (WHERE
        EXTRACT(YEAR FROM "addedAt") = EXTRACT(YEAR FROM NOW()) AND
        EXTRACT(MONTH FROM "addedAt") = EXTRACT(MONTH FROM NOW())
      ) as this_month
    FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NOT NULL
  `
  const stats = mainStats[0]

  const topGenreResult = await prisma.$queryRaw<Array<{ genre: string; count: bigint }>>`
    SELECT trim(unnest(string_to_array("genres", ','))) as genre, COUNT(*) as count
    FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NOT NULL AND "genres" != ''
    GROUP BY genre ORDER BY count DESC LIMIT 1
  `
  const topGenre = topGenreResult[0]?.genre || '-'

  const genreCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT genre) as count FROM (
      SELECT trim(unnest(string_to_array("genres", ','))) as genre
      FROM "MediaItem"
      WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NOT NULL AND "genres" != ''
    ) sub WHERE genre != ''
  `
  const genreCount = Number(genreCountResult[0]?.count || 0)

  const topYearResult = await prisma.$queryRaw<Array<{ year: string; count: bigint }>>`
    SELECT "year", COUNT(*) as count FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NOT NULL
      AND "year" IS NOT NULL AND "year" != ''
    GROUP BY "year" ORDER BY count DESC LIMIT 1
  `
  const topYear = topYearResult[0]?.year || '-'

  const topDecadeResult = await prisma.$queryRaw<Array<{ decade: string; count: bigint }>>`
    SELECT (FLOOR(CAST("year" AS NUMERIC) / 10) * 10)::TEXT || 's' as decade, COUNT(*) as count
    FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NOT NULL
      AND "year" ~ '^[0-9]+$' AND CAST("year" AS INTEGER) >= 1930
    GROUP BY decade ORDER BY count DESC LIMIT 1
  `
  const topDecade = topDecadeResult[0]?.decade || '-'

  const maxRating = stats?.max_rating ? Math.round(Number(stats.max_rating) * 100) / 100 : 0
  const maxRatingTitleResult = await prisma.$queryRaw<Array<{ title: string }>>`
    SELECT "title" FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NOT NULL
    ORDER BY "userRating" DESC, "addedAt" ASC LIMIT 1
  `
  const maxRatingTitle = maxRatingTitleResult[0]?.title || '-'

  return {
    totalRated: Number(stats?.total_rated || 0),
    avgRating: stats?.avg_rating ? Math.round(Number(stats.avg_rating) * 100) / 100 : 0,
    thisMonth: Number(stats?.this_month || 0),
    movieCount: Number(stats?.movie_count || 0),
    seriesCount: Number(stats?.series_count || 0),
    animeCount: Number(stats?.anime_count || 0),
    avgMovieRating: stats?.avg_movie_rating ? Math.round(Number(stats.avg_movie_rating) * 100) / 100 : 0,
    avgSeriesRating: stats?.avg_series_rating ? Math.round(Number(stats.avg_series_rating) * 100) / 100 : 0,
    avgAnimeRating: stats?.avg_anime_rating ? Math.round(Number(stats.avg_anime_rating) * 100) / 100 : 0,
    topGenre,
    topYear,
    topDecade,
    genreCount,
    maxRating,
    maxRatingTitle,
  }
}

// ==================== Watchlist Stats ====================
async function getWatchlistStats() {
  const mainStats = await prisma.$queryRaw<Array<{
    total: bigint
    movie_count: bigint
    series_count: bigint
    anime_count: bigint
    this_month: bigint
    oldest_date: Date | null
  }>>`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE "type" = 'movie') as movie_count,
      COUNT(*) FILTER (WHERE "type" = 'series') as series_count,
      COUNT(*) FILTER (WHERE "type" = 'anime') as anime_count,
      COUNT(*) FILTER (WHERE
        EXTRACT(YEAR FROM "addedAt") = EXTRACT(YEAR FROM NOW()) AND
        EXTRACT(MONTH FROM "addedAt") = EXTRACT(MONTH FROM NOW())
      ) as this_month,
      MIN("addedAt") as oldest_date
    FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NULL
  `
  const stats = mainStats[0]

  const topGenreResult = await prisma.$queryRaw<Array<{ genre: string; count: bigint }>>`
    SELECT trim(unnest(string_to_array("genres", ','))) as genre, COUNT(*) as count
    FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NULL AND "genres" != ''
    GROUP BY genre ORDER BY count DESC LIMIT 1
  `
  const topGenre = topGenreResult[0]?.genre || '-'

  const topYearResult = await prisma.$queryRaw<Array<{ year: string; count: bigint }>>`
    SELECT "year", COUNT(*) as count FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NULL
      AND "year" IS NOT NULL AND "year" != ''
    GROUP BY "year" ORDER BY count DESC LIMIT 1
  `
  const topYear = topYearResult[0]?.year || '-'

  // Oldest item in watchlist
  const oldestResult = await prisma.$queryRaw<Array<{ title: string; addedAt: Date }>>`
    SELECT "title", "addedAt" FROM "MediaItem"
    WHERE "type" IN ('movie', 'series', 'anime') AND "userRating" IS NULL
    ORDER BY "addedAt" ASC LIMIT 1
  `
  const oldestTitle = oldestResult[0]?.title || '-'
  const oldestDate = oldestResult[0]?.addedAt
    ? new Date(oldestResult[0].addedAt).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short' })
    : '-'

  return {
    total: Number(stats?.total || 0),
    movieCount: Number(stats?.movie_count || 0),
    seriesCount: Number(stats?.series_count || 0),
    animeCount: Number(stats?.anime_count || 0),
    thisMonth: Number(stats?.this_month || 0),
    topGenre,
    topYear,
    oldestTitle,
    oldestDate,
  }
}

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'ratings'

    if (tab === 'watchlist') {
      const data = await getWatchlistStats()
      return NextResponse.json(data)
    }

    const data = await getRatingsStats()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
