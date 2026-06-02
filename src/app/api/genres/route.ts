import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeType, normalizeGenres } from '@/lib/format'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const excludeTypes = searchParams.get('excludeTypes')
    const hasRating = searchParams.get('hasRating')

    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (type) {
      conditions.push(`"type" = $${paramIndex++}`)
      params.push(normalizeType(type)) // Fix: normalize 'tv' → 'series'
    } else if (excludeTypes) {
      const excluded = excludeTypes.split(',').map(t => t.trim()).filter(Boolean)
      if (excluded.length > 0) {
        const placeholders = excluded.map(() => `$${paramIndex++}`).join(', ')
        conditions.push(`"type" NOT IN (${placeholders})`)
        params.push(...excluded)
      }
    }
    if (hasRating === 'true') {
      conditions.push(`"userRating" IS NOT NULL`)
    } else if (hasRating === 'false') {
      conditions.push(`"userRating" IS NULL`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await prisma.$queryRawUnsafe(
      `SELECT DISTINCT "genres" FROM "MediaItem" ${whereClause}`,
      ...params
    )

    const genreSet = new Set<string>()
    for (const row of result as any[]) {
      const genres = normalizeGenres(row.genres)
      for (const g of genres) {
        if (g.trim()) genreSet.add(g.trim())
      }
    }

    const genres = Array.from(genreSet).sort()
    return NextResponse.json({ genres })
  } catch (error) {
    console.error('Genres fetch error:', error)
    return NextResponse.json({ genres: [] }, { status: 500 })
  }
}
