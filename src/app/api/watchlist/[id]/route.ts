import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { formatItem } from '@/lib/format'

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
        episodes: body.episodes && !isNaN(Number(body.episodes)) ? parseInt(String(body.episodes)) : null,
        seasons: body.seasons && !isNaN(Number(body.seasons)) ? parseInt(String(body.seasons)) : null,
        duration: body.duration,
        status: body.status,
        author: body.author,
        pages: body.pages && !isNaN(Number(body.pages)) ? parseInt(String(body.pages)) : null,
        tags: Array.isArray(body.tags) ? body.tags.join(', ') : (body.tags || ''),
        notes: body.notes,
        watched: body.watched,
        watchedAt: body.watchedAt ? String(body.watchedAt) : null,
        userRating: body.userRating != null ? parseFloat(String(body.userRating)) : null,
        rewatch: body.rewatch || false,
        runtime: body.runtime && !isNaN(Number(body.runtime)) ? parseInt(String(body.runtime)) : null,
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

    const ALLOWED_FIELDS = new Set([
      'title', 'originalTitle', 'type', 'year', 'poster', 'genres',
      'overview', 'userRating', 'notes', 'status', 'addedAt',
      'rating', 'episodes', 'seasons', 'duration', 'author',
      'pages', 'tags', 'watched', 'watchedAt', 'rewatch',
      'runtime', 'ratingStatus'
    ])
    const updateData: Record<string, any> = {}
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        updateData[key] = value
      }
    }
    if (body.watchedAt) updateData.watchedAt = String(body.watchedAt)
    if (body.genres !== undefined) {
      updateData.genres = Array.isArray(body.genres) ? body.genres.join(', ') : (body.genres || '')
    }
    if (body.userRating !== undefined) {
      updateData.userRating = body.userRating != null && !isNaN(Number(body.userRating)) ? parseFloat(String(body.userRating)) : null
    }
    // Ensure numeric fields are properly validated
    if (body.episodes !== undefined) {
      updateData.episodes = body.episodes != null && !isNaN(Number(body.episodes)) ? parseInt(String(body.episodes)) : null
    }
    if (body.seasons !== undefined) {
      updateData.seasons = body.seasons != null && !isNaN(Number(body.seasons)) ? parseInt(String(body.seasons)) : null
    }
    if (body.pages !== undefined) {
      updateData.pages = body.pages != null && !isNaN(Number(body.pages)) ? parseInt(String(body.pages)) : null
    }
    if (body.runtime !== undefined) {
      updateData.runtime = body.runtime != null && !isNaN(Number(body.runtime)) ? parseInt(String(body.runtime)) : null
    }
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags.join(', ') : (body.tags || '')
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
