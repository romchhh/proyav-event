import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { getSiteContent } from './site-content'

const DEFAULT_LOGO_PATH = '/images/logo/proyav-logo.png'

async function removeDarkBackground(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer).ensureAlpha()
  const { width, height } = await image.metadata()
  if (!width || !height) return buffer

  const { data } = await image.raw().toBuffer({ resolveWithObject: true })
  const pixels = new Uint8Array(data)

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    if (r < 40 && g < 40 && b < 40) {
      pixels[i + 3] = 0
    }
  }

  return sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer()
}

export async function loadTicketLogo(logoPath?: string): Promise<Buffer> {
  const content = await getSiteContent()
  const rel = logoPath ?? content.assets.logo ?? DEFAULT_LOGO_PATH
  const fullPath = path.join(process.cwd(), 'public', rel.replace(/^\//, ''))

  try {
    const raw = await fs.readFile(fullPath)
    const resized = await sharp(raw).resize(800, null, { fit: 'inside' }).png().toBuffer()
    return removeDarkBackground(resized)
  } catch {
    const fallbackPath = path.join(process.cwd(), 'public', DEFAULT_LOGO_PATH.replace(/^\//, ''))
    const raw = await fs.readFile(fallbackPath)
    const resized = await sharp(raw).resize(800, null, { fit: 'inside' }).png().toBuffer()
    return removeDarkBackground(resized)
  }
}

export async function getTicketLogoBase64(logoPath?: string): Promise<string> {
  const buffer = await loadTicketLogo(logoPath)
  return buffer.toString('base64')
}

export function buildTicketHeaderDecorSvg(): string {
  return `
  <g opacity="0.14" stroke="#9a7858" stroke-width="1.5" fill="none">
    <path d="M88 88 L148 118 L118 178 L58 148 Z"/>
    <path d="M952 96 L892 136 L922 196 L982 156 Z"/>
    <path d="M120 220 L170 250 L150 300"/>
    <path d="M960 228 L910 258 L930 308"/>
  </g>
  <g opacity="0.08" fill="#c59367">
    <circle cx="180" cy="160" r="3"/>
    <circle cx="900" cy="180" r="2.5"/>
    <circle cx="220" cy="300" r="2"/>
    <circle cx="860" cy="290" r="2.5"/>
  </g>`
}

export function buildTicketHeaderSvg(logoBase64: string): string {
  return `
  <rect x="48" y="48" width="984" height="360" rx="48" fill="#f9f6f1"/>
  ${buildTicketHeaderDecorSvg()}
  <image x="360" y="72" width="360" height="166" href="data:image/png;base64,${logoBase64}" preserveAspectRatio="xMidYMid meet"/>
  <line x1="340" y1="268" x2="740" y2="268" stroke="#c59367" stroke-width="1.5" opacity="0.5"/>
  <text x="540" y="318" text-anchor="middle" fill="#3d2e26" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="700">Твій квиток на PROяв івент</text>
  <rect x="480" y="348" width="120" height="6" rx="3" fill="url(#accent)"/>`
}
