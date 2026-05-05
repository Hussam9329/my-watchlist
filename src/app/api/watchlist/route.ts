import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function formatItem(item: any) {
  return {
    ...item,
    genres: item.genres ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
    tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const hasRating = searchParams.get('hasRating')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {}
    if (type) where.type = type
    if (hasRating === 'true') {
      where.userRating = { not: null }
    } else if (hasRating === 'false') {
      where.userRating = null
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { originalTitle: { contains: search } }
      ]
    }

    const [items, total] = await Promise.all([
      prisma.mediaItem.findMany({
        where,
        orderBy: { addedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.mediaItem.count({ where })
    ])

    return NextResponse.json({
      items: items.map(formatItem),
      total,
      page,
      limit,
      hasMore: skip + items.length < total
    })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check duplicates: same type + same year + (same title OR same originalTitle)
    const orConditions: any[] = [{ title: body.title }]
    if (body.originalTitle) {
      orConditions.push({ originalTitle: body.originalTitle })
      // Also check if title matches originalTitle or vice versa
      orConditions.push({ title: body.originalTitle })
    }

    const existing = await prisma.mediaItem.findFirst({
      where: {
        type: body.type,
        year: body.year,
        OR: orConditions
      }
    })

    if (existing) {
      return NextResponse.json(
        {
          error: 'هذا العمل موجود مسبقاً في الأرشيف!',
          duplicate: true,
          existingItem: formatItem(existing)
        },
        { status: 409 }
      )
    }

    const item = await prisma.mediaItem.create({
      data: {
        title: body.title,
        originalTitle: body.originalTitle,
        year: body.year,
        type: body.type,
        poster: body.poster,
        rating: body.rating ? String(body.rating) : null,
        overview: body.overview,
        genres: Array.isArray(body.genres) ? body.genres.join(', ') : (body.genres || ''),
        episodes: body.episodes ? parseInt(body.episodes) : null,
        seasons: body.seasons ? parseInt(body.seasons) : null,
        duration: body.duration,
        status: body.status,
        author: body.author,
        pages: body.pages ? parseInt(body.pages) : null,
        tags: Array.isArray(body.tags) ? body.tags.join(', ') : (body.tags || ''),
        notes: body.notes || '',
        watched: body.watched || false,
        watchedAt: body.watchedAt ? String(body.watchedAt) : null,
        userRating: body.userRating != null ? parseFloat(String(body.userRating)) : null,
        rewatch: body.rewatch || false,
        runtime: body.runtime ? parseInt(body.runtime) : null,
        ratingStatus: body.ratingStatus || 'watched',
      }
    })

    return NextResponse.json(formatItem(item))
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'خطأ في إضافة العنصر' }, { status: 500 })
  }
}
