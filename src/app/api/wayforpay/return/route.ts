import { NextResponse } from 'next/server'
import { fulfillApprovedPayment } from '@/lib/wayforpay-fulfillment'
import { parseWayForPayCallbackBody } from '@/lib/wayforpay'
import { getSiteOrigin } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

function buildSuccessRedirect(request: Request, orderReference: string) {
  const redirectUrl = new URL('/payment/success', getSiteOrigin(request))
  if (orderReference) {
    redirectUrl.searchParams.set('orderReference', orderReference)
  }
  return NextResponse.redirect(redirectUrl, 303)
}

export async function GET(request: Request) {
  const orderReference = new URL(request.url).searchParams.get('orderReference')?.trim() ?? ''
  return buildSuccessRedirect(request, orderReference)
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const fromQuery = url.searchParams.get('orderReference')?.trim() ?? ''

  const contentType = request.headers.get('content-type') ?? ''
  const rawBody = await request.text()
  const body = parseWayForPayCallbackBody(rawBody, contentType)
  const orderReference = body?.orderReference?.trim() || fromQuery

  if (body?.orderReference) {
    const result = await fulfillApprovedPayment(body)
    if (!result.ok) {
      console.warn('[wayforpay] Return URL fulfillment:', result.reason, orderReference)
    }
  }

  return buildSuccessRedirect(request, orderReference)
}
