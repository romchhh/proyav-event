import QRCode from 'qrcode'
import sharp from 'sharp'
import { buildTicketHeaderSvg, getTicketLogoBase64 } from '@/lib/ticket-branding'
import { getSiteContent } from '@/lib/site-content'
import { getSiteUrl } from '@/lib/site-url'
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
  const siteUrl = getSiteUrl()
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
  const logoBase64 = await getTicketLogoBase64(content.assets.logo)
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
<svg width="1080" height="1880" viewBox="0 0 1080 1880" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#dcc4a8"/>
    </linearGradient>
  </defs>

  <rect width="1080" height="1880" fill="#faf6f1"/>
  <rect x="48" y="48" width="984" height="1784" rx="48" fill="#ffffff"/>
  ${buildTicketHeaderSvg(logoBase64)}

  <rect x="80" y="430" width="120" height="8" rx="4" fill="url(#accent)"/>

  <text x="80" y="500" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="24">Учасник</text>
  <text x="80" y="560" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700">${nameText}</text>

  <text x="80" y="660" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="24">Тариф</text>
  <text x="80" y="720" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700">${tierText}</text>

  <text x="80" y="830" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="24">Дата та час</text>
  <text x="80" y="880" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">${escapeXml(event.dateShort)}</text>
  <text x="80" y="928" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600">${escapeXml(event.time)}</text>

  <text x="80" y="1000" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="24">Локація</text>
  <text x="80" y="1050" fill="#1a1210" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="600">${escapeXml(event.venueFull)}</text>

  <text x="80" y="1110" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="22">Код квитка</text>
  <text x="80" y="1150" fill="#9a7858" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="2">${escapeXml(order.ticketCode ?? order.orderReference)}</text>

  <rect x="220" y="1190" width="640" height="640" rx="36" fill="#faf6f1" stroke="#e8ddd2" stroke-width="2"/>
  <image x="300" y="1230" width="480" height="480" href="data:image/png;base64,${qrBase64}"/>
  <text x="540" y="1750" text-anchor="middle" fill="#5c4a40" font-family="Arial, Helvetica, sans-serif" font-size="22">Покажи QR-код на реєстрації</text>
  <text x="540" y="1788" text-anchor="middle" fill="#8a7d72" font-family="Arial, Helvetica, sans-serif" font-size="20">Номер замовлення</text>
  <text x="540" y="1825" text-anchor="middle" fill="#9a7858" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="1">${escapeXml(order.orderReference)}</text>
</svg>`

  return sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer()
}
