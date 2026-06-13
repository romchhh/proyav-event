import { NextResponse } from 'next/server'
import { isAdminApiAuthorized } from '@/lib/admin-auth'
import { getCheckInDashboard } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!isAdminApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const list = searchParams.get('list')

  const dashboard = await getCheckInDashboard()

  if (list === 'waiting') {
    return NextResponse.json({ orders: dashboard.waiting, stats: dashboard.stats })
  }
  if (list === 'admitted') {
    return NextResponse.json({ orders: dashboard.admitted, stats: dashboard.stats })
  }
  if (list === 'rejected') {
    return NextResponse.json({ orders: dashboard.rejected, stats: dashboard.stats })
  }
  if (list === 'scans') {
    return NextResponse.json({ scans: dashboard.recentScans, stats: dashboard.stats })
  }

  return NextResponse.json(dashboard)
}
