const DEFAULT_SITE_URL = 'https://proyav.ua'

function normalizeSiteUrl(raw: string): string {
  const value = raw.trim().replace(/\/+$/, '')
  if (!value) return DEFAULT_SITE_URL
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!raw) return DEFAULT_SITE_URL
  return normalizeSiteUrl(raw)
}

export function getSiteOrigin(request?: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return getSiteUrl()
  }
  if (request) {
    return new URL(request.url).origin
  }
  return DEFAULT_SITE_URL
}
