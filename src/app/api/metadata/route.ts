import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface SearchResult {
  title: string
  originalTitle: string
  year: string
  rating: string
  overview: string
  genres: string[]
  episodes?: number
  seasons?: number
  duration?: string
  status?: string
  author?: string
  pages?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type } = body as { query: string; type: 'movie' | 'series' | 'anime' | 'book' }

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'يرجى إدخال نص البحث' }, { status: 400 })
    }

    console.log(`[Metadata API] Searching for: "${query}" (${type})`)

    const zai = await ZAI.create()

    // Build search query based on type
    let searchQuery = query
    if (type === 'movie') {
      searchQuery = `${query} movie film IMDB rating`
    } else if (type === 'series') {
      searchQuery = `${query} TV series seasons episodes IMDB rating`
    } else if (type === 'anime') {
      searchQuery = `${query} anime MyAnimeList MAL rating episodes`
    } else if (type === 'book') {
      searchQuery = `${query} book novel author Goodreads pages`
    }

    // Search the web
    let searchResult: Array<{ name: string; snippet: string; url: string }> = []
    try {
      const rawResult = await zai.functions.invoke("web_search", {
        query: searchQuery,
        num: 10
      })
      searchResult = rawResult as Array<{ name: string; snippet: string; url: string }>
    } catch (searchError) {
      console.error('[Metadata API] Web search failed:', searchError)
      return NextResponse.json({ error: 'فشل البحث. جرب بالاسم الإنجليزي.' }, { status: 500 })
    }

    if (!searchResult || searchResult.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على نتائج' }, { status: 404 })
    }

    const searchContext = searchResult.slice(0, 5).map((r) => ({
      title: r.name,
      snippet: r.snippet,
      url: r.url
    }))

    let results: SearchResult[] = []

    try {
      const prompt = `Based on these search results for "${query}" (${type}), extract information and return a JSON array.

Search Results:
 ${JSON.stringify(searchContext, null, 2)}

Return a JSON array with this structure (no markdown, just JSON):
[
  {
    "title": "Arabic title if available",
    "originalTitle": "Original title",
    "year": "Release year",
    "rating": "Rating out of 10",
    "overview": "Brief summary in Arabic",
    "genres": ["Genre1", "Genre2"],
    "episodes": number or null,
    "seasons": number or null,
    "duration": "Duration or null",
    "status": "For series: ongoing or ended",
    "author": "For books: author name",
    "pages": number or null
  }
]`

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You extract media information and return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })

      const responseText = completion.choices[0]?.message?.content || ''
      let cleanedResponse = responseText.trim()

      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7)
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3)
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3)
      }
      cleanedResponse = cleanedResponse.trim()

      results = JSON.parse(cleanedResponse)
    } catch (aiError) {
      console.error('[Metadata API] AI failed, using fallback:', aiError)
      
      results = searchResult.slice(0, 5).map((r) => {
        const yearMatch = r.snippet?.match(/\b(19|20)\d{2}\b/)
        const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()
        const ratingMatch = r.snippet?.match(/(\d+\.?\d*)\s*\/\s*10/)
        const rating = ratingMatch ? ratingMatch[1] : ''

        return {
          title: r.name,
          originalTitle: r.name,
          year: year,
          rating: rating,
          overview: r.snippet || '',
          genres: [],
        }
      })
    }

    const validResults = results.filter(r => r.originalTitle || r.title)

    if (validResults.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على نتائج صالحة' }, { status: 404 })
    }

    return NextResponse.json({ results: validResults })
  } catch (error) {
    console.error('[Metadata API] Error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء البحث' }, { status: 500 })
  }
}