import { NextResponse } from 'next/server'
import { getOrder } from '@/lib/store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderReference = searchParams.get('orderReference')?.trim()

  if (!orderReference) {
    return NextResponse.json({ error: 'orderReference is required' }, { status: 400 })
  }

  const order = await getOrder(orderReference)
  if (!order) {
    return NextResponse.json({ found: false, status: 'unknown' })
  }

  return NextResponse.json({
    found: true,
    status: order.status,
    emailSent: order.emailSent,
    tierName: order.tierName,
    name: order.name,
    amount: order.amount,
    ticketCode: order.ticketCode,
  })
}
