import { NextResponse } from 'next/server'
import { isAdminApiAuthorized } from '@/lib/admin-auth'
import { processTicketCheckIn, logTicketScan, type CheckInAction } from '@/lib/store'
import { CHECK_IN_LABELS, evaluateTicket } from '@/lib/ticket-checkin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isAdminApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as {
    query?: string
    action?: CheckInAction
    note?: string
  }

  const query = body.query?.trim()
  const action = body.action

  if (!query || !action) {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 })
  }

  if (action !== 'admit' && action !== 'reject') {
    return NextResponse.json({ error: 'Невідома дія' }, { status: 400 })
  }

  const result = await processTicketCheckIn(query, action, body.note)

  if (!result.ok) {
    const evaluation = evaluateTicket(result.order ?? null)
    return NextResponse.json({
      ...evaluation,
      ok: false,
      code: result.code,
      message: result.message,
      order: result.order ?? null,
      checkInLabel: result.order ? CHECK_IN_LABELS[result.order.checkInStatus] : undefined,
    })
  }

  const evaluation = evaluateTicket(result.order)
  await logTicketScan({
    orderReference: result.order.orderReference,
    ticketCode: result.order.ticketCode,
    guestName: result.order.name,
    tierName: result.order.tierName,
    result: action === 'admit' ? 'valid' : 'rejected',
    message: action === 'admit' ? 'Вхід підтверджено' : 'Вхід відхилено',
  })

  return NextResponse.json({
    ...evaluation,
    ok: action === 'admit',
    title: action === 'admit' ? 'OK' : 'Не OK',
    message: action === 'admit' ? 'Вхід підтверджено' : 'Вхід відхилено',
    order: result.order,
    checkInLabel: CHECK_IN_LABELS[result.order.checkInStatus],
    canAdmit: false,
  })
}
