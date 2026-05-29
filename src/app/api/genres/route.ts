import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeType, normalizeGenres } from '@/lib/format'

function parseCsv(value: string | null): string[] {
  return (value || '').split(',').map((v) => v.trim()).filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const types = Array.from(new Set([...(type ? [type] : []), ...parseCsv(searchParams.get('types'))].map(normalizeType)))
    const excludedTypes = Array.from(new Set(parseCsv(searchParams.get('excludeTypes')).map(normalizeType)))
    const hasRating = searchParams.get('hasRating')

    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (types.length === 1) {
      conditions.push(`"type" = $${paramIndex++}`)
      params.push(types[0])
    } else if (types.length > 1) {
      const placeholders = types.map(() => `$${paramIndex++}`).join(', ')
      conditions.push(`"type" IN (${placeholders})`)
      params.push(...types)
    } else if (excludedTypes.length > 0) {
      const placeholders = excludedTypes.map(() => `$${paramIndex++}`).join(', ')
      conditions.push(`"type" NOT IN (${placeholders})`)
      params.push(...excludedTypes)
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
