import { NextResponse } from 'next/server'
import { getSiteContent } from '@/lib/site-content'
import { getAllTierPricing, getPricingConfigFromContent } from '@/lib/ticket-pricing'
import { getSalesCounts } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const content = await getSiteContent()
  const sales = await getSalesCounts()
  const pricingConfig = getPricingConfigFromContent(content.tickets)
  const pricing = getAllTierPricing(sales, pricingConfig)

  const tiers = content.tickets.tiers.map((tier) => {
    const priceInfo = pricing.tiers.find((item) => item.tierId === tier.id)
    return {
      id: tier.id,
      price: priceInfo?.price ?? 0,
      wave: priceInfo?.wave ?? 'early',
      remaining: priceInfo?.remaining ?? 0,
      sold: priceInfo?.sold ?? 0,
      available: (priceInfo?.remaining ?? 0) > 0,
    }
  })

  return NextResponse.json({
    dateWave: pricing.dateWave,
    waveLabels: content.tickets.waveLabels,
    tiers,
  })
}
