import { NextResponse } from 'next/server'
import { isAdminApiAuthorized } from '@/lib/admin-auth'
import { getAllOrders } from '@/lib/store'
import { getSiteContent, saveSiteContent } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

function normalizePromoCodes(input: Record<string, number>) {
  const normalized: Record<string, number> = {}
  for (const [rawCode, rawPercent] of Object.entries(input)) {
    const code = rawCode.trim().toUpperCase()
    const percent = Math.round(Number(rawPercent))
    if (!code || !Number.isFinite(percent) || percent < 1 || percent > 100) continue
    normalized[code] = percent
  }
  return normalized
}

export async function GET(request: Request) {
  if (!isAdminApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const content = await getSiteContent()
  const orders = await getAllOrders()
  const paidOrders = orders.filter((order) => order.status === 'paid')

  const usage = new Map<string, { count: number; revenue: number }>()
  for (const order of paidOrders) {
    if (!order.promoCode) continue
    const code = order.promoCode.toUpperCase()
    const current = usage.get(code) ?? { count: 0, revenue: 0 }
    current.count += 1
    current.revenue += order.amount
    usage.set(code, current)
  }

  const promoCodes = Object.entries(content.tickets.promoCodes)
    .map(([code, percent]) => ({
      code,
      percent,
      usedCount: usage.get(code)?.count ?? 0,
      revenue: usage.get(code)?.revenue ?? 0,
    }))
    .sort((a, b) => a.code.localeCompare(b.code, 'uk'))

  return NextResponse.json({ promoCodes })
}

export async function PUT(request: Request) {
  if (!isAdminApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { promoCodes?: Record<string, number> }
    if (!body.promoCodes || typeof body.promoCodes !== 'object') {
      return NextResponse.json({ error: 'Некоректні дані' }, { status: 400 })
    }

    const content = await getSiteContent()
    const promoCodes = normalizePromoCodes(body.promoCodes)
    await saveSiteContent({
      tickets: {
        ...content.tickets,
        promoCodes,
      },
    })

    return NextResponse.json({ ok: true, promoCodes })
  } catch {
    return NextResponse.json({ error: 'Не вдалося зберегти' }, { status: 400 })
  }
}
