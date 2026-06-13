import type { Metadata } from 'next'
import CheckoutShell from './components/checkout/CheckoutShell'
import './globals.css'
import './proyav.css'
import { ASSETS, EVENT } from './constants'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'PROяв івент — Масштабна подія у Тернополі',
  description: 'Масштабна подія нового формату у Тернополі на тему проявленості. 26 вересня 2026, Podolyany Hall.',
  icons: {
    icon: ASSETS.logo,
    apple: ASSETS.logo,
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: siteUrl,
    siteName: EVENT.name,
    title: 'PROяв івент — Масштабна подія у Тернополі',
    description: 'Масштабна подія нового формату у Тернополі на тему проявленості. 26 вересня 2026, Podolyany Hall.',
    images: [
      {
        url: ASSETS.logo,
        alt: 'PROяв івент',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROяв івент — Масштабна подія у Тернополі',
    description: 'Масштабна подія нового формату у Тернополі на тему проявленості. 26 вересня 2026, Podolyany Hall.',
    images: [ASSETS.logo],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="proyav-page">
          <CheckoutShell>{children}</CheckoutShell>
        </div>
      </body>
    </html>
  )
}
