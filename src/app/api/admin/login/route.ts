import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  setAdminSessionCookie,
  verifyAdminCredentials,
  verifyAdminSession,
} from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string
      password?: string
      remember?: boolean
    }

    const username = body.username?.trim() ?? ''
    const password = body.password ?? ''

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json({ error: 'Невірний логін або пароль' }, { status: 401 })
    }

    const session = createAdminSession(Boolean(body.remember))
    const response = NextResponse.json({ ok: true })
    setAdminSessionCookie(response, session.token, session.maxAgeMs)
    return response
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  return NextResponse.json({ authenticated: verifyAdminSession(token) })
}
