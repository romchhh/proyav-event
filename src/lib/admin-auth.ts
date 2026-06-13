import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'proyav_admin_session'
const DAY_MS = 24 * 60 * 60 * 1000

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.WAYFORPAY_SECRET_KEY?.trim() ||
    'dev-admin-secret-change-me'
  )
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value, 'utf8').digest('hex')
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME?.trim() ?? ''
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim() ?? ''

  if (!expectedUser || !expectedPassword) return false

  return safeEqual(username.trim(), expectedUser) && safeEqual(password, expectedPassword)
}

export function createAdminSession(remember: boolean) {
  const maxAgeMs = remember ? 30 * DAY_MS : DAY_MS
  const expiresAt = Date.now() + maxAgeMs
  const signature = sign(String(expiresAt))
  return {
    token: `${expiresAt}.${signature}`,
    maxAgeMs,
  }
}

export function verifyAdminSession(token: string | undefined | null) {
  if (!token) return false

  const [expiresRaw, signature] = token.split('.')
  if (!expiresRaw || !signature) return false

  const expiresAt = Number(expiresRaw)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false

  return safeEqual(sign(expiresRaw), signature)
}

export function setAdminSessionCookie(response: NextResponse, token: string, maxAgeMs: number) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function getAdminSessionFromRequest(request: NextRequest | Request) {
  if ('cookies' in request && typeof request.cookies.get === 'function') {
    return request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  }
  return null
}

export function isAdminApiAuthorized(request: Request) {
  return verifyAdminSession(getAdminSessionFromRequest(request))
}
