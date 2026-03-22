import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - جلب جميع العناصر
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let items
    if (type && type !== 'all') {
      items = await db.mediaItem.findMany({
        where: { type },
        orderBy: { addedAt: 'desc' }
      })
    } else {
      items = await db.mediaItem.findMany({
        orderBy: { addedAt: 'desc' }
      })
    }

    const formattedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      originalTitle: item.originalTitle || undefined,
      year: item.year,
      type: item.type as 'anime' | 'series' | 'movie' | 'book',
      poster: item.poster || '',
      rating: item.rating || '',
      overview: item.overview || '',
      genres: JSON.parse(item.genres || '[]'),
      episodes: item.episodes || undefined,
      seasons: item.seasons || undefined,
      duration: item.duration || undefined,
      status: item.status || undefined,
      author: item.author || undefined,
      pages: item.pages || undefined,
      tags: JSON.parse(item.tags || '[]'),
      notes: item.notes || '',
      favorite: item.favorite,
      watched: item.watched,
      watchedAt: item.watchedAt || undefined,
      userRating: item.userRating || undefined,
      addedAt: item.addedAt.toISOString()
    }))

    return NextResponse.json({ items: formattedItems })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 })
  }
}

// POST - إضافة عنصر جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newItem = await db.mediaItem.create({
      data: {
        title: body.title || '',
        originalTitle: body.originalTitle || null,
        year: body.year || new Date().getFullYear().toString(),
        type: body.type || 'movie',
        poster: body.poster || null,
        rating: body.rating || null,
        overview: body.overview || null,
        genres: JSON.stringify(body.genres || []),
        episodes: body.episodes || null,
        seasons: body.seasons || null,
        duration: body.duration || null,
        status: body.status || null,
        author: body.author || null,
        pages: body.pages || null,
        tags: JSON.stringify(body.tags || []),
        notes: body.notes || '',
        favorite: body.favorite || false,
        watched: body.watched || false,
        userRating: body.userRating || null,
      }
    })

    return NextResponse.json({
      item: {
        id: newItem.id,
        title: newItem.title,
        originalTitle: newItem.originalTitle || undefined,
        year: newItem.year,
        type: newItem.type,
        poster: newItem.poster || '',
        rating: newItem.rating || '',
        overview: newItem.overview || '',
        genres: JSON.parse(newItem.genres || '[]'),
        episodes: newItem.episodes || undefined,
        seasons: newItem.seasons || undefined,
        duration: newItem.duration || undefined,
        status: newItem.status || undefined,
        author: newItem.author || undefined,
        pages: newItem.pages || undefined,
        tags: JSON.parse(newItem.tags || '[]'),
        notes: newItem.notes || '',
        favorite: newItem.favorite,
        watched: newItem.watched,
        userRating: newItem.userRating || undefined,
        addedAt: newItem.addedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'فشل في إضافة العنصر' }, { status: 500 })
  }
}