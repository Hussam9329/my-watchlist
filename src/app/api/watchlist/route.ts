import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// تحويل البيانات للشكل الصحيح
function formatItem(item: any) {
  return {
    ...item,
    genres: item.genres ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
    tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  }
}

// GET - جلب جميع العناصر (مع دعم الفلترة حسب النوع والبحث والتقييم)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const hasRating = searchParams.get('hasRating') // 'true' = فقط المقيّمة, 'false' = فقط غير المقيّمة

    const where: any = {}
    if (type) where.type = type
    if (hasRating === 'true') {
      where.userRating = { not: null }
    } else if (hasRating === 'false') {
      where.userRating = null
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalTitle: { contains: search, mode: 'insensitive' } }
      ]
    }

    const items = await prisma.mediaItem.findMany({
      where,
      orderBy: { addedAt: 'desc' }
    })
    const formattedItems = items.map(formatItem)
    return NextResponse.json({ items: formattedItems })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// POST - إضافة عنصر جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // التحقق من وجود العنصر مسبقاً
const existing = await prisma.mediaItem.findFirst({
  where: {
    type: body.type,
    year: body.year,
    OR: [
      { title: body.title },
      ...(body.originalTitle ? [{ originalTitle: body.originalTitle }] : [])
    ]
  }
})

if (existing) {
  return NextResponse.json(
    { error: 'هذا العمل موجود مسبقاً في الأرشيف!', duplicate: true, existingItem: existing },
    { status: 409 }  // 409 = Conflict
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
        favorite: body.favorite || false,
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
