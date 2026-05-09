import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const hasRating = searchParams.get('hasRating')

    const where: any = {}
    if (type) where.type = type
    if (hasRating === 'true') {
      where.userRating = { not: null }
    } else if (hasRating === 'false') {
      where.userRating = null
    }

    const items = await prisma.mediaItem.findMany({
      where,
      select: { genres: true },
    })

    const genreSet = new Set<string>()
    items.forEach(item => {
      if (item.genres) {
        item.genres.split(',').map((g: string) => g.trim()).filter(Boolean).forEach(g => {
          genreSet.add(g)
        })
      }
    })

    const genres = Array.from(genreSet).sort()
    return NextResponse.json({ genres })
  } catch (error) {
    console.error('Genres fetch error:', error)
    return NextResponse.json({ genres: [] }, { status: 500 })
  }
}
