import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
    const formattedItem = {
      ...item,
      genres: item.genres ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
      tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    }
    return NextResponse.json(formattedItem)
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
        userRating: body.userRating ? parseFloat(body.userRating) : null,
      }
    })
    
    const formattedItem = {
      ...item,
      genres: item.genres ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
      tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    }
    
    return NextResponse.json(formattedItem)
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
    
    // تحويل watchedAt إلى string إذا كان موجوداً
    const updateData = { ...body }
    if (body.watchedAt) {
      updateData.watchedAt = String(body.watchedAt)
    }
    
    const item = await prisma.mediaItem.update({
      where: { id },
      data: updateData
    })
    
    const formattedItem = {
      ...item,
      genres: item.genres ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
      tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    }
    
    return NextResponse.json(formattedItem)
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 })
  }
}