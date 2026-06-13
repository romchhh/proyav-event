'use client'

import { useEffect, useState } from 'react'
import type { AdminAnalytics } from '@/lib/admin-analytics'

function formatMoney(amount: number) {
  return new Intl.NumberFormat('uk-UA').format(amount)
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <article className={`adminKpiCard ${accent ? 'adminKpiCardAccent' : ''}`}>
      <p className="adminKpiLabel">{label}</p>
      <p className="adminKpiValue">{value}</p>
      {hint ? <p className="adminKpiHint">{hint}</p> : null}
    </article>
  )
}

export default function AnalyticsTab() {
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((response) => response.json())
      .then((json: AdminAnalytics) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="adminHint">Завантаження аналітики…</p>
  }

  if (!data) {
    return <p className="adminHint">Не вдалося завантажити аналітику</p>
  }

  const maxDailyRevenue = Math.max(...data.dailySales.map((item) => item.revenue), 1)

  return (
    <div className="adminAnalytics">
      <section className="adminKpiGrid">
        <KpiCard
          label="Загальний прибуток"
          value={`${formatMoney(data.summary.revenue)} ₴`}
          hint={`${data.summary.paidCount} оплачених квитків`}
          accent
        />
        <KpiCard
          label="Середній чек"
          value={`${formatMoney(data.summary.averageTicket)} ₴`}
          hint="На один оплачений квиток"
        />
        <KpiCard
          label="Заповненість"
          value={`${data.summary.fillRate}%`}
          hint={`${data.summary.ticketsSold} / ${data.summary.ticketsCapacity} місць`}
        />
        <KpiCard
          label="Конверсія"
          value={`${data.summary.conversionRate}%`}
          hint={`${data.summary.pendingCount} в обробці · ${data.summary.failedCount} відхилено`}
        />
      </section>

      <div className="adminAnalyticsGrid">
        <section className="adminPanel">
          <div className="adminPanelHead">
            <h2>Продажі по тарифах</h2>
            <p>Дохід і заповненість кожного пакету</p>
          </div>
          <div className="adminTierStats">
            {data.byTier.map((tier) => (
              <div key={tier.id} className="adminTierRow">
                <div className="adminTierRowHead">
                  <span>{tier.label}</span>
                  <strong>{formatMoney(tier.revenue)} ₴</strong>
                </div>
                <div className="adminProgressTrack">
                  <div
                    className={`adminProgressFill adminProgressFill-${tier.id}`}
                    style={{ width: `${Math.max(8, (tier.sold / Math.max(tier.capacity, 1)) * 100)}%` }}
                  />
                </div>
                <p className="adminTierMeta">
                  {tier.sold} / {tier.capacity} продано · {tier.fillRate}%
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="adminPanel">
          <div className="adminPanelHead">
            <h2>Хвилі продажів</h2>
            <p>Розподіл квитків за етапами ціноутворення</p>
          </div>
          <div className="adminWaveStats">
            {data.byWave.map((wave) => (
              <div key={wave.id} className="adminWaveCard">
                <p className="adminWaveLabel">{wave.label}</p>
                <p className="adminWaveValue">{wave.sold} <span>/ {wave.capacity}</span></p>
                <p className="adminWaveRevenue">{formatMoney(wave.revenue)} ₴</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="adminPanel">
        <div className="adminPanelHead">
          <h2>Динаміка за 14 днів</h2>
          <p>Оплачені квитки та виручка по днях</p>
        </div>
        {data.dailySales.length === 0 ? (
          <p className="adminHint">Ще немає оплачених продажів для графіка</p>
        ) : (
          <div className="adminChart">
            {data.dailySales.map((day) => (
              <div key={day.date} className="adminChartColumn">
                <div className="adminChartBarWrap">
                  <div
                    className="adminChartBar"
                    style={{ height: `${Math.max(12, (day.revenue / maxDailyRevenue) * 100)}%` }}
                    title={`${day.label}: ${formatMoney(day.revenue)} ₴`}
                  />
                </div>
                <p className="adminChartCount">{day.count}</p>
                <p className="adminChartLabel">{day.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="adminAnalyticsGrid">
        <section className="adminPanel">
          <div className="adminPanelHead">
            <h2>Останні оплати</h2>
            <p>Найсвіжіші підтверджені квитки</p>
          </div>
          {data.recentPaid.length === 0 ? (
            <p className="adminHint">Оплат ще немає</p>
          ) : (
            <div className="adminRecentList">
              {data.recentPaid.map((order) => (
                <article key={`${order.ticketCode}-${order.paidAt}`} className="adminRecentItem">
                  <div>
                    <p className="adminRecentCode">{order.ticketCode ?? 'Без коду'}</p>
                    <p className="adminRecentName">{order.name}</p>
                    <p className="adminRecentTier">{order.tierName}</p>
                  </div>
                  <div className="adminRecentAside">
                    <strong>{formatMoney(order.amount)} ₴</strong>
                    <span>{formatDate(order.paidAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="adminPanel">
          <div className="adminPanelHead">
            <h2>Промокоди</h2>
            <p>{data.summary.promoUsedCount} оплат із промокодом</p>
          </div>
          {data.promoCodes.length === 0 ? (
            <p className="adminHint">Промокоди ще не використовувались</p>
          ) : (
            <div className="adminPromoList">
              {data.promoCodes.map((promo) => (
                <div key={promo.code} className="adminPromoItem">
                  <span className="adminPromoCode">{promo.code}</span>
                  <span>{promo.count} разів</span>
                  <strong>{formatMoney(promo.revenue)} ₴</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="adminPanel adminPanelCompact">
        <div className="adminPanelHead">
          <h2>Швидкий огляд</h2>
        </div>
        <div className="adminQuickStats">
          <div>
            <span>Всього замовлень</span>
            <strong>{data.summary.totalOrders}</strong>
          </div>
          <div>
            <span>Оплачено</span>
            <strong>{data.summary.paidCount}</strong>
          </div>
          <div>
            <span>В обробці</span>
            <strong>{data.summary.pendingCount}</strong>
          </div>
          <div>
            <span>Найпопулярніший тариф</span>
            <strong>
              {data.byTier.reduce((best, tier) => (tier.sold > best.sold ? tier : best), data.byTier[0]).label}
            </strong>
          </div>
        </div>
      </section>
    </div>
  )
}
