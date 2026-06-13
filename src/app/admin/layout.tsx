import type { Metadata } from 'next'
import './admin-globals.css'

export const metadata: Metadata = {
  title: 'Адмін — PROяв івент',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adminRoot">{children}</div>
}
