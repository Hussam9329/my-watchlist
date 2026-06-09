import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { formatItem, normalizeType, normalizeListField, parseOptionalInt } from '@/lib/format'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.mediaItem.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 })
    return NextResponse.json(formatItem(item))
  } catch {
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// Allowed fields for PUT and PATCH — prevents arbitrary field injection
const ALLOWED_FIELDS = new Set([
  'title', 'originalTitle', 'type', 'year', 'poster', 'genres',
  'overview', 'userRating', 'notes', 'status', 'addedAt',
  'rating', 'episodes', 'seasons', 'duration', 'author',
  'pages', 'tags', 'watched', 'watchedAt', 'rewatch',
  'runtime', 'ratingStatus'
])

function clearWatchStateWhenRatingRemoved(data: Record<string, any>) {
  if (!Object.prototype.hasOwnProperty.call(data, 'userRating') || data.userRating !== null) return

  data.watched = false
  data.watchedAt = null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Filter to allowed fields only — prevents arbitrary field injection
    const data: Record<string, any> = {}
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        data[key] = value
      }
    }

    // Normalize type: 'tv' → 'series'
    if (data.type) {
      data.type = normalizeType(data.type)
    }

    // Normalize list fields
    if (data.genres !== undefined) data.genres = normalizeListField(data.genres)
    if (data.tags !== undefined) data.tags = normalizeListField(data.tags)

    // Validate and parse numeric fields
    if (data.episodes !== undefined) data.episodes = parseOptionalInt(data.episodes)
    if (data.seasons !== undefined) data.seasons = parseOptionalInt(data.seasons)
    if (data.pages !== undefined) data.pages = parseOptionalInt(data.pages)
    if (data.runtime !== undefined) data.runtime = parseOptionalInt(data.runtime)

    // Validate userRating — prevent NaN
    if (data.userRating !== undefined) {
      data.userRating = data.userRating != null && !isNaN(Number(data.userRating)) ? parseFloat(String(data.userRating)) : null
    }

    // Validate rating as string
    if (data.rating !== undefined) {
      data.rating = data.rating ? String(data.rating) : null
    }

    // Default values
    if (data.notes !== undefined) data.notes = data.notes || ''
    if (data.watchedAt !== undefined) data.watchedAt = data.watchedAt ? String(data.watchedAt) : null
    if (data.rewatch !== undefined) data.rewatch = data.rewatch || false
    if (data.ratingStatus !== undefined) data.ratingStatus = data.ratingStatus || 'watched'

    clearWatchStateWhenRatingRemoved(data)

    const item = await prisma.mediaItem.update({
      where: { id },
      data
    })

    return NextResponse.json(formatItem(item))
  } catch {
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
  } catch {
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

    const updateData: Record<string, any> = {}
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        updateData[key] = value
      }
    }

    // Normalize type: 'tv' → 'series'
    if (updateData.type) {
      updateData.type = normalizeType(updateData.type)
    }

    if (updateData.watchedAt) updateData.watchedAt = String(updateData.watchedAt)
    if (updateData.genres !== undefined) {
      updateData.genres = normalizeListField(updateData.genres)
    }
    if (updateData.tags !== undefined) {
      updateData.tags = normalizeListField(updateData.tags)
    }
    if (updateData.userRating !== undefined) {
      updateData.userRating = updateData.userRating != null && !isNaN(Number(updateData.userRating)) ? parseFloat(String(updateData.userRating)) : null
    }
    // Ensure numeric fields are properly validated
    if (updateData.episodes !== undefined) {
      updateData.episodes = parseOptionalInt(updateData.episodes)
    }
    if (updateData.seasons !== undefined) {
      updateData.seasons = parseOptionalInt(updateData.seasons)
    }
    if (updateData.pages !== undefined) {
      updateData.pages = parseOptionalInt(updateData.pages)
    }
    if (updateData.runtime !== undefined) {
      updateData.runtime = parseOptionalInt(updateData.runtime)
    }
    if (updateData.rating !== undefined) {
      updateData.rating = updateData.rating ? String(updateData.rating) : null
    }

    clearWatchStateWhenRatingRemoved(updateData)

    const item = await prisma.mediaItem.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(formatItem(item))
  } catch {
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 })
  }
}
