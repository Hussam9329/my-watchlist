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

// GET - جلب جميع العناصر
export async function GET() {
  try {
    const items = await prisma.mediaItem.findMany({
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
        watchedAt: body.watchedAt ? new Date(body.watchedAt) : null,
        userRating: body.userRating ? parseFloat(body.userRating) : null,
      }
    })
    
    return NextResponse.json(formatItem(item))
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'خطأ في إضافة العنصر' }, { status: 500 })
  }
}