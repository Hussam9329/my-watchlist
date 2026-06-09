import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { formatItem, normalizeType, normalizeListField, parseOptionalInt } from '@/lib/format'

// Only allow explicit _asc/_desc sort directions — bare field names removed to prevent silent fallback
const ALLOWED_SORT_FIELDS = new Set([
  'title_asc', 'title_desc',
  'year_asc', 'year_desc',
  'addedAt_asc', 'addedAt_desc',
  'userRating_asc', 'userRating_desc',
  'originalTitle_asc', 'originalTitle_desc',
  'rating_asc', 'rating_desc'
])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const excludeTypes = searchParams.get('excludeTypes')
    const search = searchParams.get('search')
    const hasRating = searchParams.get('hasRating')
    let sortBy = searchParams.get('sortBy') || 'addedAt_desc'
    const filterGenre = searchParams.get('genre')
    const filterYear = searchParams.get('year')
    const filterRatingMin = searchParams.get('ratingMin')
    const filterRatingMax = searchParams.get('ratingMax')
    const firstLetter = searchParams.get('firstLetter')?.trim()
    const ratingSource = searchParams.get('ratingSource') || (hasRating === 'true' ? 'userRating' : 'rating')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {}

    if (type) {
      where.type = normalizeType(type)
    }

    if (excludeTypes) {
      const excluded = excludeTypes.split(',').map(t => t.trim()).filter(Boolean)
      if (excluded.length > 0 && !where.type) {
        where.type = { notIn: excluded }
      }
    }

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

    if (firstLetter) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { startsWith: firstLetter, mode: 'insensitive' } },
            { originalTitle: { startsWith: firstLetter, mode: 'insensitive' } },
          ],
        },
      ]
    }

    if (filterYear) {
      where.year = filterYear
    }

    if (filterGenre) {
      where.genres = { contains: filterGenre }
    }

    const hasRatingRange = Boolean(filterRatingMin || filterRatingMax)
    const usePublicRatingRange = hasRatingRange && ratingSource === 'rating'

    if (hasRatingRange && ratingSource === 'userRating' && hasRating !== 'false') {
      const ratingFilter: any = {}
      if (filterRatingMin) ratingFilter.gte = parseFloat(filterRatingMin)
      if (filterRatingMax) ratingFilter.lte = parseFloat(filterRatingMax)
      if (where.userRating && typeof where.userRating === 'object') {
        where.userRating = { ...where.userRating, ...ratingFilter }
      } else {
        where.userRating = { not: null, ...ratingFilter }
      }
    }

    if (!ALLOWED_SORT_FIELDS.has(sortBy)) {
      sortBy = 'addedAt_desc'
    }

    const lastUnderscore = sortBy.lastIndexOf('_')
    const sortField = sortBy.substring(0, lastUnderscore)
    const sortDir = sortBy.substring(lastUnderscore + 1)
    const direction = sortDir === 'asc' ? 'asc' : 'desc'

    const needsRawSort = sortField === 'year' || sortField === 'rating'
    const needsRawQuery = needsRawSort || usePublicRatingRange

    let items: any[]
    let total: number

    if (needsRawQuery) {
      const conditions: string[] = []
      const params: any[] = []
      let paramIndex = 1

      if (type) {
        conditions.push(`"type" = $${paramIndex++}`)
        params.push(normalizeType(type))
      } else if (excludeTypes) {
        const excluded = excludeTypes.split(',').map(t => t.trim()).filter(Boolean)
        if (excluded.length > 0) {
          const placeholders = excluded.map(() => `$${paramIndex++}`).join(', ')
          conditions.push(`"type" NOT IN (${placeholders})`)
          params.push(...excluded)
        }
      }

      if (hasRating === 'true') {
        conditions.push(`"userRating" IS NOT NULL`)
      } else if (hasRating === 'false') {
        conditions.push(`"userRating" IS NULL`)
      }

      if (search) {
        conditions.push(`("title" ILIKE $${paramIndex++} OR "originalTitle" ILIKE $${paramIndex++})`)
        params.push(`%${search}%`, `%${search}%`)
      }

      if (firstLetter) {
        conditions.push(`("title" ILIKE $${paramIndex} OR COALESCE("originalTitle", '') ILIKE $${paramIndex})`)
        params.push(`${firstLetter}%`)
        paramIndex++
      }

      if (filterYear) {
        conditions.push(`"year" = $${paramIndex++}`)
        params.push(filterYear)
      }

      if (filterGenre) {
        conditions.push(`"genres" LIKE $${paramIndex++}`)
        params.push(`%${filterGenre}%`)
      }

      if (hasRatingRange) {
        if (ratingSource === 'rating') {
          conditions.push(`"rating" ~ '^[0-9]+\\.?[0-9]*$'`)
          if (filterRatingMin) {
            conditions.push(`CAST("rating" AS FLOAT) >= $${paramIndex++}`)
            params.push(parseFloat(filterRatingMin))
          }
          if (filterRatingMax) {
            conditions.push(`CAST("rating" AS FLOAT) <= $${paramIndex++}`)
            params.push(parseFloat(filterRatingMax))
          }
        } else if (hasRating !== 'false') {
          if (filterRatingMin) {
            conditions.push(`"userRating" >= $${paramIndex++}`)
            params.push(parseFloat(filterRatingMin))
          }
          if (filterRatingMax) {
            conditions.push(`"userRating" <= $${paramIndex++}`)
            params.push(parseFloat(filterRatingMax))
          }
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      let orderClause: string
      if (sortField === 'year') {
        orderClause = `ORDER BY CASE WHEN "year" ~ '^[0-9]+$' THEN CAST("year" AS INTEGER) ELSE 0 END ${direction.toUpperCase()}, "addedAt" DESC`
      } else if (sortField === 'rating') {
        orderClause = `ORDER BY CASE WHEN "rating" ~ '^[0-9]+\\.?[0-9]*$' THEN CAST("rating" AS FLOAT) ELSE -1 END ${direction.toUpperCase()}, "addedAt" DESC`
      } else {
        orderClause = `ORDER BY "addedAt" DESC`
      }

      // ✅ دمج count + data في Promise.all — طلب واحد بدل اثنين متسلسلين
      const limitIndex = paramIndex++
      const skipIndex = paramIndex++
      const dataParams = [...params, limit, skip]

      const [countResult, rawItems] = await Promise.all([
        prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "MediaItem" ${whereClause}`,
          ...params
        ) as Promise<any[]>,
        prisma.$queryRawUnsafe(
          `SELECT * FROM "MediaItem" ${whereClause} ${orderClause} LIMIT $${limitIndex} OFFSET $${skipIndex}`,
          ...dataParams
        ) as Promise<any[]>,
      ])

      total = Number(countResult[0]?.count || 0)
      items = rawItems

    } else {
      let orderBy: any
      switch (sortField) {
        case 'title':
          orderBy = [{ title: direction }, { addedAt: 'desc' as const }]
          break
        case 'originalTitle':
          orderBy = [{ originalTitle: { sort: direction, nulls: 'last' } }, { addedAt: 'desc' as const }]
          break
        case 'userRating':
          orderBy = [{ userRating: { sort: direction, nulls: 'last' } }, { addedAt: 'desc' as const }]
          break
        case 'addedAt':
        default:
          orderBy = { addedAt: direction }
          break
      }

      // ✅ هذا كان موجود وصح — يشتغلان بالتوازي
      ;[items, total] = await Promise.all([
        prisma.mediaItem.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.mediaItem.count({ where })
      ])
    }

    return NextResponse.json({
      items: items.map(formatItem),
      total,
      page,
      limit,
      hasMore: skip + items.length < total
    })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

const ALLOWED_TYPES = new Set(['movie', 'series', 'anime', 'book', 'game', 'tv'])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({ error: 'title must be a non-empty string' }, { status: 400 })
    }
    if (!body.type || typeof body.type !== 'string' || !ALLOWED_TYPES.has(body.type)) {
      return NextResponse.json({ error: 'type must be one of: movie, series, anime, book, game, tv' }, { status: 400 })
    }
    if (body.year !== undefined && typeof body.year !== 'string') {
      return NextResponse.json({ error: 'year must be a string' }, { status: 400 })
    }
    if (body.poster !== undefined && body.poster !== null && typeof body.poster !== 'string') {
      return NextResponse.json({ error: 'poster must be a string or null' }, { status: 400 })
    }
    if (body.overview !== undefined && typeof body.overview !== 'string') {
      return NextResponse.json({ error: 'overview must be a string' }, { status: 400 })
    }
    if (body.userRating !== undefined && body.userRating !== null && typeof body.userRating !== 'number') {
      return NextResponse.json({ error: 'userRating must be a number or null' }, { status: 400 })
    }

    const normalizedType = normalizeType(body.type)

    const orConditions: any[] = [
      { title: { equals: body.title, mode: 'insensitive' } }
    ]
    if (body.originalTitle) {
      orConditions.push({ originalTitle: { equals: body.originalTitle, mode: 'insensitive' } })
      orConditions.push({ title: { equals: body.originalTitle, mode: 'insensitive' } })
    }

    const duplicateWhere: any = {
      type: normalizedType,
      OR: orConditions
    }

    if (body.year && body.year.trim() !== '') {
      duplicateWhere.year = body.year
    }

    const existing = await prisma.mediaItem.findFirst({
      where: duplicateWhere
    })

    if (existing) {
      const existingFormatted = formatItem(existing)
      return NextResponse.json(
        { error: 'العنصر موجود مسبقاً', duplicate: existingFormatted },
        { status: 409 }
      )
    }

    const item = await prisma.mediaItem.create({
      data: {
        title: body.title,
        originalTitle: body.originalTitle || null,
        type: normalizedType,
        year: body.year || null,
        poster: body.poster || null,
        genres: normalizeListField(body.genres),
        overview: body.overview || '',
        rating: body.rating ? String(body.rating) : null,
        userRating: body.userRating || null,
        notes: body.notes || '',
        status: body.status || 'planned',
        addedAt: body.addedAt ? new Date(body.addedAt) : new Date(),
        episodes: parseOptionalInt(body.episodes),
        seasons: parseOptionalInt(body.seasons),
        duration: body.duration || null,
        author: body.author || null,
        pages: parseOptionalInt(body.pages),
        tags: normalizeListField(body.tags),
        watched: body.watched || false,
        watchedAt: body.watchedAt ? String(body.watchedAt) : null,
        rewatch: body.rewatch || false,
        runtime: parseOptionalInt(body.runtime),
        ratingStatus: body.ratingStatus || 'watched'
      }
    })
    return NextResponse.json(formatItem(item), { status: 201 })
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'خطأ في الإضافة' }, { status: 500 })
  }
}
