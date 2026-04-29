/**
 * Migration script: Copy all ratings data from Supabase to MongoDB (Prisma)
 * Run: node scripts/migrate-ratings.js
 */

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://lbwjdleewjtlqhnjwzsn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2pkbGVld2p0bHFobmp3enNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODEyNzAsImV4cCI6MjA5MjE1NzI3MH0.U8D4EMaPwKNnDchYpUyHd1SoAVqhl4jmNmI53MIHWNY'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const prisma = new PrismaClient()

async function fetchAllRows(tableName, orderColumn = 'created_at') {
  const pageSize = 1000
  let from = 0
  let to = pageSize - 1
  let done = false
  let rows = []

  while (!done) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderColumn, { ascending: false })
      .range(from, to)

    if (error) throw error
    rows = rows.concat(data || [])
    if (!data || data.length < pageSize) {
      done = true
    } else {
      from += pageSize
      to += pageSize
    }
  }
  return rows
}

async function migrate() {
  console.log('Starting migration from Supabase to MongoDB...\n')

  const movies = await fetchAllRows('movies')
  console.log(`Found ${movies.length} movies in Supabase`)

  const series = await fetchAllRows('series')
  console.log(`Found ${series.length} series in Supabase\n`)

  let moviesMigrated = 0, moviesSkipped = 0
  for (const m of movies) {
    const existing = await prisma.mediaItem.findFirst({
      where: { type: 'movie', title: m.title, year: String(m.year || '') }
    })

    if (existing) {
      if (existing.userRating === null && m.rating !== null) {
        await prisma.mediaItem.update({
          where: { id: existing.id },
          data: {
            userRating: parseFloat(m.rating) || null,
            rewatch: m.rewatch === true || m.rewatch === 'true',
            runtime: m.runtime ? parseInt(m.runtime) : null,
            ratingStatus: m.status || 'watched',
            genres: m.genre || existing.genres,
          }
        })
      }
      moviesSkipped++
      continue
    }

    await prisma.mediaItem.create({
      data: {
        title: m.title,
        year: String(m.year || ''),
        type: 'movie',
        genres: m.genre || '',
        userRating: parseFloat(m.rating) || null,
        ratingStatus: m.status || 'watched',
        rewatch: m.rewatch === true || m.rewatch === 'true',
        runtime: m.runtime ? parseInt(m.runtime) : null,
        watched: m.status === 'watched',
        favorite: false,
        notes: '',
        tags: '',
      }
    })
    moviesMigrated++
  }

  let seriesMigrated = 0, seriesSkipped = 0
  for (const s of series) {
    const existing = await prisma.mediaItem.findFirst({
      where: { type: 'series', title: s.title, year: String(s.year || '') }
    })

    if (existing) {
      if (existing.userRating === null && s.rating !== null) {
        await prisma.mediaItem.update({
          where: { id: existing.id },
          data: {
            userRating: parseFloat(s.rating) || null,
            rewatch: s.rewatch === true || s.rewatch === 'true',
            seasons: s.seasons ? parseInt(s.seasons) : null,
            ratingStatus: 'watched',
          }
        })
      }
      seriesSkipped++
      continue
    }

    await prisma.mediaItem.create({
      data: {
        title: s.title,
        year: String(s.year || ''),
        type: 'series',
        seasons: s.seasons ? parseInt(s.seasons) : null,
        userRating: parseFloat(s.rating) || null,
        ratingStatus: 'watched',
        rewatch: s.rewatch === true || s.rewatch === 'true',
        watched: true,
        favorite: false,
        notes: '',
        tags: '',
        genres: '',
      }
    })
    seriesMigrated++
  }

  console.log(`\nMovies: ${moviesMigrated} migrated, ${moviesSkipped} skipped/updated`)
  console.log(`Series: ${seriesMigrated} migrated, ${seriesSkipped} skipped/updated`)
  console.log('\nMigration complete!')

  await prisma.$disconnect()
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
