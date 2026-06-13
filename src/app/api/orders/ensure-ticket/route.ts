import { NextResponse } from 'next/server'
import { ensureTicketEmail } from '@/lib/wayforpay-fulfillment'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = (await request.json()) as { orderReference?: string }
  const orderReference = body.orderReference?.trim()

  if (!orderReference) {
    return NextResponse.json({ error: 'orderReference is required' }, { status: 400 })
  }

  const result = await ensureTicketEmail(orderReference)
  return NextResponse.json(result)
}
