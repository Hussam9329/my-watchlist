import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeType } from '@/lib/format'

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

    const conditions: string[] = ['"year" IS NOT NULL', '"year" != \'\'']
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

    const whereClause = `WHERE ${conditions.join(' AND ')}`

    // Sort years numerically (not alphabetically) since year is a String field
    const result = await prisma.$queryRawUnsafe(
      `SELECT DISTINCT "year" FROM "MediaItem" ${whereClause} ORDER BY CASE WHEN "year" ~ '^[0-9]+$' THEN CAST("year" AS INTEGER) ELSE 0 END DESC`,
      ...params
    )

    const years = (result as any[]).map(r => r.year).filter(Boolean)
    return NextResponse.json({ years })
  } catch (error) {
    console.error('Years fetch error:', error)
    return NextResponse.json({ years: [] }, { status: 500 })
  }
}
