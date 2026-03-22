import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - جلب عنصر واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await prisma.mediaItem.findUnique({ where: { id } })
    
    if (!item) {
      return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 })
    }
    
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
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
        genres: body.genres || [],
        episodes: body.episodes ? parseInt(body.episodes) : null,
        seasons: body.seasons ? parseInt(body.seasons) : null,
        duration: body.duration,
        status: body.status,
        author: body.author,
        pages: body.pages ? parseInt(body.pages) : null,
        tags: body.tags || [],
        notes: body.notes,
        favorite: body.favorite,
        watched: body.watched,
        watchedAt: body.watchedAt ? new Date(body.watchedAt) : null,
        userRating: body.userRating ? parseFloat(body.userRating) : null,
      }
    })
    
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 })
  }
}

// DELETE - حذف عنصر
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

// PATCH - تحديث جزئي
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const item = await prisma.mediaItem.update({
      where: { id },
      data: body
    })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 })
  }
}