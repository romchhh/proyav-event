import { getSiteContent } from '@/lib/site-content'
import { getPricingConfigFromContent } from '@/lib/ticket-pricing'
import { getAllOrders, getSalesCounts, type StoredOrder } from '@/lib/store'
import type { TicketTierId, TicketWave } from '@/lib/tickets'

const TIER_IDS: TicketTierId[] = ['standard', 'golden', 'vip']
const WAVES: TicketWave[] = ['early', 'main', 'last']

const TIER_LABELS: Record<TicketTierId, string> = {
  standard: 'Стандарт',
  golden: 'Золотий',
  vip: 'ВІП',
}

const WAVE_LABELS: Record<TicketWave, string> = {
  early: 'Рання хвиля',
  main: 'Основна хвиля',
  last: 'Остання хвиля',
}

export type AdminAnalytics = {
  summary: {
    revenue: number
    paidCount: number
    pendingCount: number
    failedCount: number
    totalOrders: number
    averageTicket: number
    conversionRate: number
    promoUsedCount: number
    ticketsSold: number
    ticketsCapacity: number
    fillRate: number
  }
  byTier: Array<{
    id: TicketTierId
    label: string
    sold: number
    capacity: number
    revenue: number
    fillRate: number
  }>
  byWave: Array<{
    id: TicketWave
    label: string
    sold: number
    capacity: number
    revenue: number
  }>
  dailySales: Array<{
    date: string
    label: string
    count: number
    revenue: number
  }>
  recentPaid: Array<{
    ticketCode?: string
    name: string
    tierName: string
    amount: number
    paidAt: string
  }>
  promoCodes: Array<{
    code: string
    count: number
    revenue: number
  }>
}

function sumCapacity(capacityMatrix: Record<TicketTierId, Record<TicketWave, number>>) {
  return TIER_IDS.reduce((total, tierId) => {
    return total + WAVES.reduce((tierTotal, wave) => tierTotal + capacityMatrix[tierId][wave], 0)
  }, 0)
}

function sumSold(sales: Record<TicketTierId, Record<TicketWave, number>>) {
  return TIER_IDS.reduce((total, tierId) => {
    return total + WAVES.reduce((tierTotal, wave) => tierTotal + (sales[tierId][wave] ?? 0), 0)
  }, 0)
}

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`)
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

function buildDailySales(paidOrders: StoredOrder[]) {
  const buckets = new Map<string, { count: number; revenue: number }>()

  for (const order of paidOrders) {
    const source = order.paidAt ?? order.createdAt
    const dateKey = source.slice(0, 10)
    const current = buckets.get(dateKey) ?? { count: 0, revenue: 0 }
    current.count += 1
    current.revenue += order.amount
    buckets.set(dateKey, current)
  }

  const sortedDates = Array.from(buckets.keys()).sort()
  const last14 = sortedDates.slice(-14)

  return last14.map((date) => ({
    date,
    label: formatDayLabel(date),
    count: buckets.get(date)?.count ?? 0,
    revenue: buckets.get(date)?.revenue ?? 0,
  }))
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [orders, sales, content] = await Promise.all([
    getAllOrders(),
    getSalesCounts(),
    getSiteContent(),
  ])

  const pricing = getPricingConfigFromContent(content.tickets)
  const paidOrders = orders.filter((order) => order.status === 'paid')
  const pendingOrders = orders.filter((order) => order.status === 'pending')
  const failedOrders = orders.filter((order) => order.status === 'failed')

  const revenue = paidOrders.reduce((sum, order) => sum + order.amount, 0)
  const paidCount = paidOrders.length
  const totalOrders = orders.length
  const averageTicket = paidCount > 0 ? Math.round(revenue / paidCount) : 0
  const conversionRate = totalOrders > 0 ? Math.round((paidCount / totalOrders) * 100) : 0
  const promoUsedCount = paidOrders.filter((order) => order.promoCode).length

  const ticketsCapacity = sumCapacity(pricing.capacityMatrix)
  const ticketsSold = sumSold(sales)
  const fillRate = ticketsCapacity > 0 ? Math.round((ticketsSold / ticketsCapacity) * 100) : 0

  const byTier = TIER_IDS.map((tierId) => {
    const sold = WAVES.reduce((sum, wave) => sum + (sales[tierId][wave] ?? 0), 0)
    const capacity = WAVES.reduce((sum, wave) => sum + pricing.capacityMatrix[tierId][wave], 0)
    const tierRevenue = paidOrders
      .filter((order) => order.tierId === tierId)
      .reduce((sum, order) => sum + order.amount, 0)

    return {
      id: tierId,
      label: TIER_LABELS[tierId],
      sold,
      capacity,
      revenue: tierRevenue,
      fillRate: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
    }
  })

  const byWave = WAVES.map((wave) => {
    const sold = TIER_IDS.reduce((sum, tierId) => sum + (sales[tierId][wave] ?? 0), 0)
    const capacity = TIER_IDS.reduce((sum, tierId) => sum + pricing.capacityMatrix[tierId][wave], 0)
    const waveRevenue = paidOrders
      .filter((order) => order.wave === wave)
      .reduce((sum, order) => sum + order.amount, 0)

    return {
      id: wave,
      label: WAVE_LABELS[wave],
      sold,
      capacity,
      revenue: waveRevenue,
    }
  })

  const promoMap = new Map<string, { count: number; revenue: number }>()
  for (const order of paidOrders) {
    if (!order.promoCode) continue
    const code = order.promoCode.toUpperCase()
    const current = promoMap.get(code) ?? { count: 0, revenue: 0 }
    current.count += 1
    current.revenue += order.amount
    promoMap.set(code, current)
  }

  const promoCodes = Array.from(promoMap.entries())
    .map(([code, stats]) => ({ code, ...stats }))
    .sort((a, b) => b.count - a.count)

  const recentPaid = [...paidOrders]
    .sort((a, b) => new Date(b.paidAt ?? b.createdAt).getTime() - new Date(a.paidAt ?? a.createdAt).getTime())
    .slice(0, 6)
    .map((order) => ({
      ticketCode: order.ticketCode,
      name: order.name,
      tierName: order.tierName,
      amount: order.amount,
      paidAt: order.paidAt ?? order.createdAt,
    }))

  return {
    summary: {
      revenue,
      paidCount,
      pendingCount: pendingOrders.length,
      failedCount: failedOrders.length,
      totalOrders,
      averageTicket,
      conversionRate,
      promoUsedCount,
      ticketsSold,
      ticketsCapacity,
      fillRate,
    },
    byTier,
    byWave,
    dailySales: buildDailySales(paidOrders),
    recentPaid,
    promoCodes,
  }
}
