import { NextResponse } from 'next/server'
import { getAdminAnalytics } from '@/lib/admin-analytics'
import { isAdminApiAuthorized } from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!isAdminApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const analytics = await getAdminAnalytics()
  return NextResponse.json(analytics)
}
