import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const hasRating = searchParams.get('hasRating')

    const where: any = { year: { not: null } }
    if (type) where.type = type
    if (hasRating === 'true') {
      where.userRating = { not: null }
    } else if (hasRating === 'false') {
      where.userRating = null
    }

    const result = await prisma.mediaItem.findMany({
      where,
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' }
    })

    const years = result.map(r => r.year).filter(Boolean)
    return NextResponse.json({ years })
  } catch (error) {
    console.error('Years fetch error:', error)
    return NextResponse.json({ years: [] }, { status: 500 })
  }
}
