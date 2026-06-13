import { NextResponse } from 'next/server'
import { getOrder, updateOrder } from '@/lib/store'
import {
  buildWayForPayAcceptResponse,
  parseWayForPayCallbackBody,
  verifyWayForPayCallback,
} from '@/lib/wayforpay'
import { fulfillApprovedPayment } from '@/lib/wayforpay-fulfillment'

const FAILED_STATUSES = new Set(['Declined', 'Expired', 'Voided'])

function getMerchantAccount() {
  return process.env.WAYFORPAY_MERCHANT_ACCOUNT?.trim() ?? ''
}

function getSecretKey() {
  return process.env.WAYFORPAY_SECRET_KEY?.trim() ?? ''
}

function acceptResponse(orderReference: string, secretKey: string) {
  return NextResponse.json(buildWayForPayAcceptResponse(orderReference, secretKey))
}

export async function POST(request: Request) {
  const secretKey = getSecretKey()
  const merchantAccount = getMerchantAccount()

  if (!secretKey || !merchantAccount) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const contentType = request.headers.get('content-type') ?? ''
  const body = parseWayForPayCallbackBody(rawBody, contentType)

  if (!body) {
    console.error('[wayforpay] Invalid payload, content-type:', contentType, 'body-length:', rawBody.length)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const orderReference = body.orderReference ?? ''

  if (!verifyWayForPayCallback(body, secretKey)) {
    console.error(
      '[wayforpay] Invalid signature for order:',
      orderReference || '(missing)',
      'content-type:',
      contentType,
      'body-length:',
      rawBody.length,
    )
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (body.merchantAccount && body.merchantAccount !== merchantAccount) {
    console.error('[wayforpay] Unexpected merchant account:', body.merchantAccount)
    return NextResponse.json({ error: 'Invalid merchant account' }, { status: 400 })
  }

  if (orderReference && body.transactionStatus === 'Approved') {
    const result = await fulfillApprovedPayment(body)
    if (!result.ok) {
      console.error('[wayforpay] Callback fulfillment failed:', result.reason, orderReference)
    }
  } else if (
    orderReference &&
    body.transactionStatus &&
    FAILED_STATUSES.has(body.transactionStatus)
  ) {
    const order = await getOrder(orderReference)
    if (order && order.status === 'pending') {
      await updateOrder(orderReference, { status: 'failed' })
    }
  }

  return acceptResponse(orderReference, secretKey)
}
