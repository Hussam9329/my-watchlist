import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const TMDB_API_KEY = '2dca580c2a14b55200e784d157207b4d'

/** Detect if text contains Arabic characters */
function hasArabicChars(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)
}

/** Fetch English poster for a TMDB movie/tv by title */
async function fetchEnglishPosterFromTMDB(title: string, type: string): Promise<string | null> {
  const tmdbType = type === 'tv' || type === 'anime' || type === 'series' ? 'tv' : 'movie'
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/${tmdbType}?query=${encodeURIComponent(title)}&language=en-US&api_key=${TMDB_API_KEY}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    if (data.results && data.results.length > 0) {
      const match = data.results[0]
      return match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : null
    }
    return null
  } catch {
    return null
  }
}

/**
 * POST /api/refresh-posters
 * Refreshes posters for non-Arabic movies/TV/anime in the database to use English posters.
 * Body: { dryRun?: boolean } — if true, returns what would change without making changes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const dryRun = body?.dryRun === true

    // Fetch all movies, TV shows, and anime from database
    const items = await prisma.mediaItem.findMany({
      where: {
        type: { in: ['movie', 'tv', 'anime', 'series'] }
      },
      select: {
        id: true,
        title: true,
        originalTitle: true,
        type: true,
        poster: true,
      }
    })

    const changes: { id: string; title: string; oldPoster: string | null; newPoster: string | null }[] = []
    let skipped = 0
    let errors = 0

    // Process items one by one (with delay to respect TMDB rate limits)
    for (const item of items) {
      // Skip Arabic films — they should keep Arabic posters
      const titleHasArabic = hasArabicChars(item.title)
      const originalTitleHasArabic = item.originalTitle ? hasArabicChars(item.originalTitle) : false

      // If the title is in Arabic, it's likely an Arabic film → skip
      if (titleHasArabic && !originalTitleHasArabic) {
        skipped++
        continue
      }

      // If the original title is also Arabic, it's definitely an Arabic film → skip
      if (titleHasArabic && originalTitleHasArabic) {
        skipped++
        continue
      }

      // Non-Arabic film — try to get English poster
      // Use originalTitle for better TMDB matching (it's usually in English/original language)
      const searchTitle = item.originalTitle || item.title
      const newPoster = await fetchEnglishPosterFromTMDB(searchTitle, item.type)

      if (newPoster && newPoster !== item.poster) {
        changes.push({
          id: item.id,
          title: item.title,
          oldPoster: item.poster,
          newPoster: newPoster,
        })

        // Update in database if not dry run
        if (!dryRun) {
          try {
            await prisma.mediaItem.update({
              where: { id: item.id },
              data: { poster: newPoster }
            })
          } catch {
            errors++
          }
        }
      } else {
        // Poster is already English or no English poster found
        skipped++
      }

      // Small delay to respect TMDB rate limits (~40 requests/10s)
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    return NextResponse.json({
      total: items.length,
      updated: changes.length,
      skipped,
      errors,
      changes: dryRun ? changes : changes.map(c => ({ id: c.id, title: c.title })),
    })
  } catch (error) {
    console.error('[refresh-posters] Error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث البوسترات' }, { status: 500 })
  }
}
