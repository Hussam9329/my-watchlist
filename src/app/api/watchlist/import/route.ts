import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeType, normalizeListField, parseOptionalInt } from '@/lib/format'

const ALLOWED_TYPES = new Set(['movie', 'series', 'anime', 'book', 'game', 'tv'])
const MAX_IMPORT_ITEMS = 10_000
const INSERT_CHUNK_SIZE = 500

type ImportItem = Record<string, unknown>

function normalizeText(value: unknown): string {
  return String(value || '').trim().toLowerCase()
}

function candidateTitles(item: ImportItem): string[] {
  const titles = [item.title, item.originalTitle]
    .map(normalizeText)
    .filter(Boolean)
  return Array.from(new Set(titles))
}

function key(type: string, title: string, year?: string) {
  return `${type}|${year || '*'}|${title}`
}

function toCreateData(item: ImportItem, forcedType?: string) {
  const rawType = forcedType || String(item.type || 'movie')
  const type = normalizeType(rawType)

  return {
    title: String(item.title || '').trim(),
    originalTitle: item.originalTitle ? String(item.originalTitle) : null,
    year: item.year ? String(item.year) : '',
    type,
    poster: item.poster ? String(item.poster) : null,
    rating: item.rating ? String(item.rating) : null,
    overview: item.overview ? String(item.overview) : null,
    genres: normalizeListField(item.genres),
    episodes: parseOptionalInt(item.episodes),
    seasons: parseOptionalInt(item.seasons),
    duration: item.duration ? String(item.duration) : null,
    status: item.status ? String(item.status) : null,
    author: item.author ? String(item.author) : null,
    pages: parseOptionalInt(item.pages),
    tags: normalizeListField(item.tags),
    notes: item.notes ? String(item.notes) : '',
    watched: Boolean(item.watched),
    watchedAt: item.watchedAt ? String(item.watchedAt) : null,
    userRating: item.userRating != null && !isNaN(Number(item.userRating)) ? Number(item.userRating) : null,
    rewatch: Boolean(item.rewatch),
    runtime: parseOptionalInt(item.runtime),
    ratingStatus: item.ratingStatus ? String(item.ratingStatus) : 'watched',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items: ImportItem[] = Array.isArray(body?.items) ? body.items : []
    const forcedType = typeof body?.type === 'string' && body.type ? normalizeType(body.type) : undefined

    if (items.length === 0) {
      return NextResponse.json({ imported: 0, duplicates: 0, skipped: 0 })
    }

    if (items.length > MAX_IMPORT_ITEMS) {
      return NextResponse.json(
        { error: `الحد الأقصى للاستيراد مرة واحدة هو ${MAX_IMPORT_ITEMS} عنصر` },
        { status: 400 },
      )
    }

    if (forcedType && !ALLOWED_TYPES.has(forcedType)) {
      return NextResponse.json({ error: 'نوع البيانات غير مدعوم' }, { status: 400 })
    }

    const prepared = items
      .map((item) => toCreateData(item, forcedType))
      .filter((item) => item.title && ALLOWED_TYPES.has(item.type))

    const skipped = items.length - prepared.length
    if (prepared.length === 0) {
      return NextResponse.json({ imported: 0, duplicates: 0, skipped })
    }

    const types = Array.from(new Set(prepared.map((item) => item.type)))
    const existingItems = await prisma.mediaItem.findMany({
      where: { type: { in: types } },
      select: { title: true, originalTitle: true, year: true, type: true },
    })

    const existingByExactYear = new Set<string>()
    const existingByAnyYear = new Set<string>()

    for (const item of existingItems) {
      for (const title of candidateTitles(item)) {
        existingByExactYear.add(key(item.type, title, item.year || ''))
        existingByAnyYear.add(key(item.type, title))
      }
    }

    const pendingByExactYear = new Set<string>()
    const pendingByAnyYear = new Set<string>()
    const createData: typeof prepared = []
    let duplicates = 0

    for (const item of prepared) {
      const titles = candidateTitles(item)
      const hasYear = Boolean(item.year)
      const isDuplicate = titles.some((title) => {
        const exact = key(item.type, title, item.year || '')
        const anyYear = key(item.type, title)
        return hasYear
          ? existingByExactYear.has(exact) || pendingByExactYear.has(exact)
          : existingByAnyYear.has(anyYear) || pendingByAnyYear.has(anyYear)
      })

      if (isDuplicate) {
        duplicates += 1
        continue
      }

      createData.push(item)
      for (const title of titles) {
        pendingByExactYear.add(key(item.type, title, item.year || ''))
        pendingByAnyYear.add(key(item.type, title))
      }
    }

    for (let i = 0; i < createData.length; i += INSERT_CHUNK_SIZE) {
      const chunk = createData.slice(i, i + INSERT_CHUNK_SIZE)
      await prisma.mediaItem.createMany({ data: chunk })
    }

    return NextResponse.json({
      imported: createData.length,
      duplicates,
      skipped,
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ error: 'خطأ في استيراد البيانات' }, { status: 500 })
  }
}
