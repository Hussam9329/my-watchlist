import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function formatItem(item: any) {
  return {
    ...item,
    genres: item.genres ? item.genres.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
    tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const hasRating = searchParams.get('hasRating')
    const sortBy = searchParams.get('sortBy') || 'addedAt_desc'
    const filterGenre = searchParams.get('genre')
    const filterYear = searchParams.get('year')
    const filterRatingMin = searchParams.get('ratingMin')
    const filterRatingMax = searchParams.get('ratingMax')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {}
    if (type) where.type = type
    if (hasRating === 'true') {
      where.userRating = { not: null }
    } else if (hasRating === 'false') {
      where.userRating = null
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { originalTitle: { contains: search } }
      ]
    }
    if (filterYear) {
      where.year = filterYear
    }
    if (filterGenre) {
      where.genres = { contains: filterGenre }
    }
    if (filterRatingMin || filterRatingMax) {
      const ratingFilter: any = {}
      if (filterRatingMin) ratingFilter.gte = parseFloat(filterRatingMin)
      if (filterRatingMax) ratingFilter.lte = parseFloat(filterRatingMax)
      // If hasRating is already set, merge with it
      if (where.userRating && typeof where.userRating === 'object') {
        where.userRating = { ...where.userRating, ...ratingFilter }
      } else {
        where.userRating = { not: null, ...ratingFilter }
      }
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
        conditions.push(`"type" = $${paramIndex++}`)
        params.push(type)
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
      if (filterRatingMin) {
        conditions.push(`"userRating" >= $${paramIndex++}`)
        params.push(parseFloat(filterRatingMin))
      }
      if (filterRatingMax) {
        conditions.push(`"userRating" <= $${paramIndex++}`)
        params.push(parseFloat(filterRatingMax))
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Build ORDER BY with numeric cast
      let orderClause: string
      if (sortField === 'year') {
        orderClause = `ORDER BY CASE WHEN "year" ~ '^[0-9]+$' THEN CAST("year" AS INTEGER) ELSE 0 END ${direction.toUpperCase()}`
      } else if (sortField === 'rating') {
        orderClause = `ORDER BY CASE WHEN "rating" ~ '^[0-9]+\.?[0-9]*$' THEN CAST("rating" AS FLOAT) ELSE 0 END ${direction.toUpperCase()}`
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
          orderBy = { title: direction }
          break
        case 'userRating':
          orderBy = { userRating: { sort: direction, nulls: 'last' } }
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check duplicates: same type + same year + (same title OR same originalTitle)
    const orConditions: any[] = [{ title: body.title }]
    if (body.originalTitle) {
      orConditions.push({ originalTitle: body.originalTitle })
      // Also check if title matches originalTitle or vice versa
      orConditions.push({ title: body.originalTitle })
    }

    const existing = await prisma.mediaItem.findFirst({
      where: {
        type: body.type,
        year: body.year,
        OR: orConditions
      }
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
        notes: body.notes || '',
        watched: body.watched || false,
        watchedAt: body.watchedAt ? String(body.watchedAt) : null,
        userRating: body.userRating != null ? parseFloat(String(body.userRating)) : null,
        rewatch: body.rewatch || false,
        runtime: body.runtime ? parseInt(body.runtime) : null,
        ratingStatus: body.ratingStatus || 'watched',
      }
    })

    return NextResponse.json(formatItem(item))
  } catch (error) {
    console.error('Create error:', error)
    return NextResponse.json({ error: 'خطأ في إضافة العنصر' }, { status: 500 })
  }
}
