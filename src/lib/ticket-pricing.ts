import type { TicketTierId, TicketWave } from './tickets'
import type { CapacityMatrix, PricingMatrix } from './site-content/types'

export type PricingConfig = {
  priceMatrix: PricingMatrix
  capacityMatrix: CapacityMatrix
  waveWindows: Record<TicketWave, { start: string; end: string }>
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  priceMatrix: {
    standard: { early: 1690, main: 1990, last: 2290 },
    golden: { early: 3490, main: 3990, last: 4490 },
    vip: { early: 4990, main: 5990, last: 6990 },
  },
  capacityMatrix: {
    standard: { early: 50, main: 140, last: 30 },
    golden: { early: 10, main: 40, last: 10 },
    vip: { early: 3, main: 15, last: 2 },
  },
  waveWindows: {
    early: { start: '2026-06-01', end: '2026-07-14' },
    main: { start: '2026-07-15', end: '2026-09-11' },
    last: { start: '2026-09-12', end: '2026-09-26' },
  },
}

export const WAVE_LABELS: Record<TicketWave, string> = {
  early: '🐦 Рання хвиля',
  main: '🌿 Основна хвиля',
  last: '🔥 Остання хвиля',
}

const WAVE_ORDER: TicketWave[] = ['early', 'main', 'last']

export type SalesCounts = Record<TicketTierId, Record<TicketWave, number>>

export const EMPTY_SALES: SalesCounts = {
  standard: { early: 0, main: 0, last: 0 },
  golden: { early: 0, main: 0, last: 0 },
  vip: { early: 0, main: 0, last: 0 },
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00+03:00`)
}

export function getWaveByDate(date = new Date(), config = DEFAULT_PRICING_CONFIG): TicketWave {
  const time = date.getTime()

  if (time >= parseDate(config.waveWindows.last.start).getTime()) return 'last'
  if (time >= parseDate(config.waveWindows.main.start).getTime()) return 'main'
  return 'early'
}

export function getNextWave(wave: TicketWave): TicketWave | null {
  const index = WAVE_ORDER.indexOf(wave)
  return index < WAVE_ORDER.length - 1 ? WAVE_ORDER[index + 1] : null
}

export function getEffectiveWave(
  tierId: TicketTierId,
  sales: SalesCounts,
  config = DEFAULT_PRICING_CONFIG,
  date = new Date(),
): TicketWave {
  let wave: TicketWave | null = getWaveByDate(date, config)

  while (wave) {
    const sold = sales[tierId][wave] ?? 0
    const capacity = config.capacityMatrix[tierId][wave]
    if (sold < capacity) return wave
    wave = getNextWave(wave)
  }

  return 'last'
}

export function getTierPrice(
  tierId: TicketTierId,
  sales: SalesCounts,
  config = DEFAULT_PRICING_CONFIG,
  date = new Date(),
) {
  const wave = getEffectiveWave(tierId, sales, config, date)
  return {
    wave,
    price: config.priceMatrix[tierId][wave],
    capacity: config.capacityMatrix[tierId][wave],
    sold: sales[tierId][wave] ?? 0,
    remaining: Math.max(0, config.capacityMatrix[tierId][wave] - (sales[tierId][wave] ?? 0)),
  }
}

export function getAllTierPricing(
  sales: SalesCounts,
  config = DEFAULT_PRICING_CONFIG,
  date = new Date(),
) {
  return {
    dateWave: getWaveByDate(date, config),
    tiers: (Object.keys(config.priceMatrix) as TicketTierId[]).map((tierId) => ({
      tierId,
      ...getTierPrice(tierId, sales, config, date),
    })),
  }
}

export function isTierAvailable(
  tierId: TicketTierId,
  sales: SalesCounts,
  config = DEFAULT_PRICING_CONFIG,
  date = new Date(),
) {
  const { remaining } = getTierPrice(tierId, sales, config, date)
  const totalSold = Object.values(sales[tierId]).reduce((sum, count) => sum + count, 0)
  const totalCapacity = Object.values(config.capacityMatrix[tierId]).reduce((sum, count) => sum + count, 0)
  return remaining > 0 && totalSold < totalCapacity
}

export function getPricingConfigFromContent(tickets: {
  priceMatrix: PricingMatrix
  capacityMatrix: CapacityMatrix
  waveWindows: Record<TicketWave, { start: string; end: string }>
}): PricingConfig {
  return {
    priceMatrix: tickets.priceMatrix,
    capacityMatrix: tickets.capacityMatrix,
    waveWindows: tickets.waveWindows,
  }
}
