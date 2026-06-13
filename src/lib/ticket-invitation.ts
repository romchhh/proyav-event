import QRCode from 'qrcode'
import sharp from 'sharp'
import { getSiteContent } from '@/lib/site-content'
import type { StoredOrder } from './store'
import type { TicketTierId } from './tickets'

const TIER_ACCENT: Record<TicketTierId, string> = {
  standard: '#6b8f71',
  golden: '#c9a227',
  vip: '#9a7858',
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function wrapText(value: string, maxChars: number) {
  if (value.length <= maxChars) return [value]
  const words = value.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines.slice(0, 2)
}

export function getTicketQrPayload(orderReference: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? 'https://proyav.ua'
  return `${siteUrl}/payment/success?orderReference=${encodeURIComponent(orderReference)}`
}

export function getTicketFilename(orderReference: string) {
  const safe = orderReference.replace(/[^a-zA-Z0-9-]/g, '')
  return `PROyav-kvitok-${safe}.png`
}

export async function generateTicketInvitationPng(order: StoredOrder): Promise<Buffer> {
  const content = await getSiteContent()
  const { event } = content
  const qrPayload = getTicketQrPayload(order.orderReference)
  const qrBuffer = await QRCode.toBuffer(qrPayload, {
    margin: 1,
    width: 520,
    color: { dark: '#1a1210', light: '#ffffff' },
  })
  const qrBase64 = qrBuffer.toString('base64')
  const accent = TIER_ACCENT[order.tierId]
  const tierLines = wrapText(order.tierName, 28)
  const nameLines = wrapText(order.name, 22)

  const tierText = tierLines
    .map((line, index) => `<tspan x="80" dy="${index === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`)
    .join('')

  const nameText = nameLines
    .map((line, index) => `<tspan x="80" dy="${index === 0 ? 0 : 42}">${escapeXml(line)}</tspan>`)
    .join('')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1760" viewBox="0 0 1080 1760" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="header" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1210"/>
      <stop offset="100%" stop-color="#3d2e26"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#dcc4a8"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1760" fill="#faf6f1"/>
  <rect x="48" y="48" width="984" height="1664" rx="48" fill="#ffffff"/>
  <rect x="48" y="48" width="984" height="300" rx="48" fill="url(#header)"/>
  <rect x="48" y="260" width="984" height="88" fill="url(#header)"/>

  <text x="80" y="128" fill="#dcc4a8" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="4">PROяв івент</text>
  <text x="80" y="188" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">Запрошення</text>
  <text x="80" y="236" fill="rgba(255,255,255,0.82)" font-family="Arial, Helvetica, sans-serif" font-size="24">Твій квиток на подію</text>

  <rect x="80" y="360" width="120" height="8" rx="4" fill="url(#accent)"/>

  <text x="80" y="430" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="24">Учасник</text>
  <text x="80" y="490" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700">${nameText}</text>

  <text x="80" y="590" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="24">Тариф</text>
  <text x="80" y="650" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700">${tierText}</text>

  <text x="80" y="760" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="24">Дата та час</text>
  <text x="80" y="810" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">${escapeXml(event.dateShort)}</text>
  <text x="80" y="858" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600">${escapeXml(event.time)}</text>

  <text x="80" y="930" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="24">Локація</text>
  <text x="80" y="980" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="600">${escapeXml(event.venueFull)}</text>

  <text x="80" y="1040" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="22">Код квитка</text>
  <text x="80" y="1080" fill="#9a7858" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="2">${escapeXml(order.ticketCode ?? order.orderReference)}</text>

  <rect x="220" y="1120" width="640" height="640" rx="36" fill="#faf6f1" stroke="#e8ddd2" stroke-width="2"/>
  <image x="280" y="1180" width="520" height="520" href="data:image/png;base64,${qrBase64}"/>
  <text x="540" y="1600" text-anchor="middle" fill="#5c4a40" font-family="Arial, Helvetica, sans-serif" font-size="24">Покажи QR-код на реєстрації</text>

  <text x="80" y="1660" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="22">Номер замовлення</text>
  <text x="80" y="1700" fill="#9a7858" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="1">${escapeXml(order.orderReference)}</text>
</svg>`

  return sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer()
}
