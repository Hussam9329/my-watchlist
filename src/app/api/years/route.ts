import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeType } from '@/lib/format'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const excludeTypes = searchParams.get('excludeTypes')
    const hasRating = searchParams.get('hasRating')

    const conditions: string[] = ['"year" IS NOT NULL', '"year" != \'\'']
    const params: any[] = []
    let paramIndex = 1

    if (type) {
      conditions.push(`"type" = $${paramIndex++}`)
      params.push(normalizeType(type))
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
