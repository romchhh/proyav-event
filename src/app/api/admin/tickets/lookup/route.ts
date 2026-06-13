import { NextResponse } from 'next/server'
import { isAdminApiAuthorized } from '@/lib/admin-auth'
import { lookupAndEvaluateTicket } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isAdminApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as { query?: string }
  const query = body.query?.trim()

  if (!query) {
    return NextResponse.json({ error: 'Введіть код або відскануйте QR' }, { status: 400 })
  }

  const result = await lookupAndEvaluateTicket(query)
  return NextResponse.json(result)
}
