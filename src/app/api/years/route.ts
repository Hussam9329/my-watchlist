import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const result = await prisma.mediaItem.findMany({
      where: {
        type: { in: ['movie', 'series', 'anime'] },
        year: { not: null }
      },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' }
    })

    const years = result.map(r => r.year).filter(Boolean)
    return NextResponse.json({ years })
  } catch (error) {
    console.error('Years fetch error:', error)
    return NextResponse.json({ years: [] }, { status: 500 })
  }
}
