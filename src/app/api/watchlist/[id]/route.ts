import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function formatItem(item: any) {
  return {
    ...item,
    genres: item.genres ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
    tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.mediaItem.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 })
    return NextResponse.json(formatItem(item))
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const item = await prisma.mediaItem.update({
      where: { id },
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
        notes: body.notes,
        favorite: body.favorite,
        watched: body.watched,
        watchedAt: body.watchedAt ? String(body.watchedAt) : null,
        userRating: body.userRating != null ? parseFloat(String(body.userRating)) : null,
        rewatch: body.rewatch || false,
        runtime: body.runtime ? parseInt(body.runtime) : null,
        ratingStatus: body.ratingStatus || 'watched',
      }
    })

    return NextResponse.json(formatItem(item))
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.mediaItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الحذف' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: any = { ...body }
    if (body.watchedAt) updateData.watchedAt = String(body.watchedAt)
    if (body.genres !== undefined) {
      updateData.genres = Array.isArray(body.genres) ? body.genres.join(', ') : (body.genres || '')
    }
    if (body.userRating !== undefined) {
      updateData.userRating = body.userRating != null ? parseFloat(String(body.userRating)) : null
    }

    const item = await prisma.mediaItem.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(formatItem(item))
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 })
  }
}
