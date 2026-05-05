import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const sortBy = searchParams.get('sortBy') || 'userRating_desc'
    const genre = searchParams.get('genre') || ''
    const year = searchParams.get('year') || ''
    const ratingMin = searchParams.get('ratingMin')
    const ratingMax = searchParams.get('ratingMax')

    const where: Record<string, unknown> = { userRating: { not: null } }
    if (type !== 'all') where.type = type
    if (year) where.year = year
    if (genre) where.genres = { contains: genre }
    if (ratingMin || ratingMax) {
      const f: Record<string, unknown> = { not: null }
      if (ratingMin) f.gte = parseFloat(ratingMin)
      if (ratingMax) f.lte = parseFloat(ratingMax)
      where.userRating = f
    }

    const [field, direction] = sortBy.split('_')
    let orderBy: Record<string, string> = { userRating: 'desc' }
    if (field === 'title') orderBy = { title: direction === 'asc' ? 'asc' : 'desc' }
    else if (field === 'year') orderBy = { year: direction === 'asc' ? 'asc' : 'desc' }
    else if (field === 'addedAt') orderBy = { addedAt: direction === 'asc' ? 'asc' : 'desc' }
    else if (field === 'userRating') orderBy = { userRating: direction === 'asc' ? 'asc' : 'desc' }

    const items = await prisma.mediaItem.findMany({ where, orderBy })

    const movies = items.filter(i => i.type === 'movie').length
    const series = items.filter(i => i.type === 'series').length
    const anime = items.filter(i => i.type === 'anime').length
    const rated = items.filter(i => i.userRating != null)
    const avg = rated.length > 0 ? (rated.reduce((s, i) => s + (i.userRating ?? 0), 0) / rated.length).toFixed(1) : '0'

    const typeMap: Record<string, string> = { movie: 'فيلم', series: 'مسلسل', anime: 'أنمي', book: 'كتاب', game: 'لعبة' }
    const rc = (r: number) => r >= 70 ? '#22c55e' : r >= 40 ? '#eab308' : '#ef4444'
    const rb = (r: number) => r >= 70 ? '#f0fdf4' : r >= 40 ? '#fefce8' : '#fef2f2'
    const fr = (n: number | null | undefined) => { if (n == null) return '-'; const x = Math.round(Number(n)*100)/100; return Number.isInteger(x) ? String(x) : x.toFixed(2) }

    const rows = items.map((item, i) => {
      const g = item.genres ? item.genres.split(',').map((x:string) => x.trim()).filter(Boolean) : []
      const c = item.userRating != null ? rc(item.userRating) : '#999'
      const b = item.userRating != null ? rb(item.userRating) : 'transparent'
      return `<tr style="background:${i%2===0?'#fafafa':'#fff'};border-bottom:1px solid #e5e7eb"><td style="padding:8px 10px;text-align:center;color:#9ca3af;font-size:11px;font-family:monospace;width:30px">${i+1}</td><td style="padding:8px 10px;font-weight:700;font-size:13px;color:#111">${item.title}</td><td style="padding:8px 10px;text-align:center"><span style="background:linear-gradient(to left,#d4af37,#b8960f);color:#000;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px">${typeMap[item.type]||item.type}</span></td><td style="padding:8px 10px;text-align:center;color:#6b7280;font-size:12px;width:50px">${item.year}</td><td style="padding:8px 10px;color:#9ca3af;font-size:11px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.slice(0,2).join(' · ')}</td><td style="padding:8px 10px;text-align:center;width:100px">${item.userRating!=null?`<div style="display:flex;align-items:center;gap:6px;justify-content:center"><div style="width:48px;height:5px;background:#e5e7eb;border-radius:3px;overflow:hidden"><div style="width:${item.userRating}%;height:100%;background:${c};border-radius:3px"></div></div><span style="font-weight:800;font-size:13px;color:${c};background:${b};padding:2px 8px;border-radius:6px">${fr(item.userRating)}</span></div>`:'<span style="color:#d1d5db">-</span>'}</td></tr>`
    }).join('')

    const d = new Date().toLocaleDateString('ar-SA')
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>HussamVision - تقييماتي</title><style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Tajawal',Tahoma,Arial,sans-serif;direction:rtl;color:#111;background:#fff;padding:0}@media print{body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.no-print{display:none!important}.page{padding:20px 15px!important}}.page{max-width:800px;margin:0 auto;padding:40px 30px}.header{text-align:center;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #d4af37}.header h1{font-size:26px;font-weight:800;margin-bottom:4px}.header h1 .g{color:#d4af37}.header h1 .dg{color:#b8960f}.header .sub{color:#6b7280;font-size:13px;margin-bottom:10px}.header .div{width:60px;height:2px;background:linear-gradient(to left,#d4af37,#b8960f);margin:0 auto}.stats{display:flex;gap:10px;justify-content:center;margin-bottom:22px;flex-wrap:wrap}.sp{padding:4px 14px;border-radius:8px;font-size:12px;font-weight:700}.sm{background:#fef3c7;color:#92400e}.ss{background:#fef9c3;color:#854d0e}.sa{background:#fef3c7;color:#a16207}.sv{background:#f0fdf4;color:#166534}.st{background:#eff6ff;color:#1e40af}table{width:100%;border-collapse:collapse;margin-top:4px}thead tr{border-bottom:2px solid #d4af37}thead th{padding:10px 8px;font-weight:700;font-size:11px;color:#92400e;text-align:right}thead th:first-child{text-align:center}thead th:nth-child(4),thead th:nth-child(6){text-align:center}tbody tr{page-break-inside:avoid}.footer{text-align:center;margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb}.footer p{color:#9ca3af;font-size:11px}.no-print{position:fixed;top:16px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:9999;background:rgba(255,255,255,.95);padding:8px 16px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.12)}.no-print button{padding:10px 24px;border:none;border-radius:10px;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:700;cursor:pointer}.bp{background:linear-gradient(to left,#d4af37,#b8960f);color:#000}.bc{background:#f3f4f6;color:#374151}@media screen{body{background:#f3f4f6}.page{background:#fff;margin-top:20px;margin-bottom:40px;border-radius:8px;box-shadow:0 1px 8px rgba(0,0,0,.08)}}</style></head><body><div class="no-print"><button class="bp" onclick="window.print()">طباعة</button><button class="bc" onclick="window.close()">إغلاق</button></div><div class="page"><div class="header"><h1><span class="g">Hussam</span><span class="dg">Vision</span></h1><p class="sub">تقييماتي - ${d}</p><div class="div"></div></div><div class="stats"><span class="sp st">${items.length} عمل مقيّم</span><span class="sp sm">${movies} فيلم</span><span class="sp ss">${series} مسلسل</span><span class="sp sa">${anime} أنمي</span><span class="sp sv">متوسط ${avg}</span></div><table><thead><tr><th>#</th><th>العنوان</th><th>النوع</th><th>السنة</th><th>التصنيفات</th><th>التقييم</th></tr></thead><tbody>${rows}</tbody></table><div class="footer"><p>HussamVision - ${d}</p></div></div></body></html>`

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (error) {
    console.error('Print error:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء صفحة الطباعة' }, { status: 500 })
  }
}
