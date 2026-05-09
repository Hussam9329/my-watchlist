import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { formatItem, normalizeType, normalizeGenres, normalizeListField, parseOptionalInt } from '@/lib/format'

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
    const excludeTypes = searchParams.get('excludeTypes') // comma-separated types to exclude e.g. "book,game"
    const search = searchParams.get('search')
    const hasRating = searchParams.get('hasRating')
    let sortBy = searchParams.get('sortBy') || 'addedAt_desc'
    const filterGenre = searchParams.get('genre')
    const filterYear = searchParams.get('year')
    const filterRatingMin = searchParams.get('ratingMin')
    const filterRatingMax = searchParams.get('ratingMax')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {}
    // Normalize type: 'tv' should match 'series' in the database
    if (type) {
      where.type = normalizeType(type)
    }
    // Exclude specified types (e.g. books and games from archive page)
    if (excludeTypes) {
      const excluded = excludeTypes.split(',').map(t => t.trim()).filter(Boolean)
      if (excluded.length > 0) {
        if (!where.type) {
          where.type = { notIn: excluded }
        }
        // If type is already specified, excludeTypes is irrelevant
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
    if (filterYear) {
      where.year = filterYear
    }
    if (filterGenre) {
      where.genres = { contains: filterGenre }
    }
    // Rating range filter — only applies when hasRating is not 'false'
    if ((filterRatingMin || filterRatingMax) && hasRating !== 'false') {
      const ratingFilter: any = {}
      if (filterRatingMin) ratingFilter.gte = parseFloat(filterRatingMin)
      if (filterRatingMax) ratingFilter.lte = parseFloat(filterRatingMax)
      if (where.userRating && typeof where.userRating === 'object') {
        where.userRating = { ...where.userRating, ...ratingFilter }
      } else {
        where.userRating = { not: null, ...ratingFilter }
      }
    }

    // Validate sortBy against allowlist
    if (!ALLOWED_SORT_FIELDS.has(sortBy)) {
      sortBy = 'addedAt_desc'
    }

    // Parse sort - handle multi-underscore field names like userRating
    const lastUnderscore = sortBy.lastIndexOf('_')
    const sortField = sortBy.substring(0, lastUnderscore)
    const sortDir = sortBy.substring(lastUnderscore + 1)
    const direction = sortDir === 'asc' ? 'asc' : 'desc'

    // For year and rating sorting, we need raw SQL because they are String fields
    // that need numeric comparison, not alphabetical
    const needsRawSort = sortField === 'year' || sortField === 'rating'

    let items: any[]
    let total: number

    if (needsRawSort) {
      // Build WHERE clauses for raw SQL
      const conditions: string[] = []
      const params: any[] = []
      let paramIndex = 1

      if (type) {
        const normalizedTypeForQuery = normalizeType(type)
        conditions.push(`"type" = $${paramIndex++}`)
        params.push(normalizedTypeForQuery)
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
        params.push(`%${search}%`)
        params.push(`%${search}%`)
      }
      if (filterYear) {
        conditions.push(`"year" = $${paramIndex++}`)
        params.push(filterYear)
      }
      if (filterGenre) {
        conditions.push(`"genres" LIKE $${paramIndex++}`)
        params.push(`%${filterGenre}%`)
      }
      // Rating range filter — only applies when hasRating is not 'false'
      if ((filterRatingMin || filterRatingMax) && hasRating !== 'false') {
        if (filterRatingMin) {
          conditions.push(`"userRating" >= $${paramIndex++}`)
          params.push(parseFloat(filterRatingMin))
        }
        if (filterRatingMax) {
          conditions.push(`"userRating" <= $${paramIndex++}`)
          params.push(parseFloat(filterRatingMax))
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Build ORDER BY with numeric cast for string fields that need numeric comparison
      let orderClause: string
      if (sortField === 'year') {
        orderClause = `ORDER BY CASE WHEN "year" ~ '^[0-9]+$' THEN CAST("year" AS INTEGER) ELSE 0 END ${direction.toUpperCase()}, "addedAt" DESC`
      } else if (sortField === 'rating') {
        orderClause = `ORDER BY CASE WHEN "rating" ~ '^[0-9]+\.?[0-9]*$' THEN CAST("rating" AS FLOAT) ELSE -1 END ${direction.toUpperCase()}, "addedAt" DESC`
      } else {
        orderClause = `ORDER BY "addedAt" DESC`
      }

      // Count query
      const countResult = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "MediaItem" ${whereClause}`,
        ...params
      )
      total = Number((countResult as any[])[0]?.count || 0)

      // Data query
      const dataParams = [...params, limit, skip]
      items = await prisma.$queryRawUnsafe(
        `SELECT * FROM "MediaItem" ${whereClause} ${orderClause} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        ...dataParams
      )
    } else {
      // Use Prisma ORM for other sort fields
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

    // Basic input validation
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

    // Normalize type: 'tv' → 'series'
    const normalizedType = normalizeType(body.type)

    // Check duplicates: same type + same year + (same title OR same originalTitle)
    // Case-insensitive comparison to prevent duplicates with different casing
    const orConditions: any[] = [
      { title: { equals: body.title, mode: 'insensitive' } }
    ]
    if (body.originalTitle) {
      orConditions.push({ originalTitle: { equals: body.originalTitle, mode: 'insensitive' } })
      orConditions.push({ title: { equals: body.originalTitle, mode: 'insensitive' } })
    }

    // Build the where clause for duplicate detection
    const duplicateWhere: any = {
      type: normalizedType,
      OR: orConditions
    }
    // Only match year if it's non-empty; skip year matching for empty strings
    // to avoid false positives when year is unknown
    if (body.year && body.year.trim() !== '') {
      duplicateWhere.year = body.year
    }

    const existing = await prisma.mediaItem.findFirst({
      where: duplicateWhere
    })

    if (existing) {
      return NextResponse.json(
        {
          error: 'هذا العمل موجود مسبقاً في الأرشيف!',
          duplicate: true,
          existingItem: formatItem(existing)
        },
        { status: 409 }
      )
    }

    const item = await prisma.mediaItem.create({
      data: {
        title: body.title,
        originalTitle: body.originalTitle || null,
        year: body.year || '',
        type: normalizedType,
        poster: body.poster || null,
        rating: body.rating ? String(body.rating) : null,
        overview: body.overview || null,
        genres: normalizeListField(body.genres),
        episodes: parseOptionalInt(body.episodes),
        seasons: parseOptionalInt(body.seasons),
        duration: body.duration || null,
        status: body.status || null,
        author: body.author || null,
        pages: parseOptionalInt(body.pages),
        tags: normalizeListField(body.tags),
        notes: body.notes || '',
        watched: body.watched || false,
        watchedAt: body.watchedAt ? String(body.watchedAt) : null,
        userRating: body.userRating != null && !isNaN(Number(body.userRating)) ? parseFloat(String(body.userRating)) : null,
        rewatch: body.rewatch || false,
        runtime: parseOptionalInt(body.runtime),
        ratingStatus: body.ratingStatus || 'watched',
      }
    })

    return NextResponse.json(formatItem(item))
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'خطأ في إضافة العنصر' }, { status: 500 })
  }
}
