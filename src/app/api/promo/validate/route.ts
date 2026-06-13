import { NextResponse } from 'next/server'
import { validatePromoCode } from '@/lib/promo'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string }
    const result = await validatePromoCode(body.code ?? '')
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ valid: false, message: 'Некоректний запит' }, { status: 400 })
  }
}
