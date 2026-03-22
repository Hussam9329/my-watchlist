import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - جلب عنصر واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const item = await db.mediaItem.findUnique({
      where: { id }
    })

    if (!item) {
      return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      item: {
        id: item.id,
        title: item.title,
        originalTitle: item.originalTitle || undefined,
        year: item.year,
        type: item.type,
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
      }
    })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json({ error: 'فشل في جلب العنصر' }, { status: 500 })
  }
}

// PUT - تحديث عنصر
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updatedItem = await db.mediaItem.update({
      where: { id },
      data: {
        title: body.title,
        originalTitle: body.originalTitle || null,
        year: body.year,
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
        favorite: body.favorite,
        watched: body.watched,
        watchedAt: body.watchedAt || null,
        userRating: body.userRating || null,
      }
    })

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'فشل في تحديث العنصر' }, { status: 500 })
  }
}

// DELETE - حذف عنصر
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.mediaItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'فشل في حذف العنصر' }, { status: 500 })
  }
}

// PATCH - تحديث جزئي
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updatedItem = await db.mediaItem.update({
      where: { id },
      data: body
    })

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error) {
    console.error('Error patching item:', error)
    return NextResponse.json({ error: 'فشل في تحديث العنصر' }, { status: 500 })
  }
}