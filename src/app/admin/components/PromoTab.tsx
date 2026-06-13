'use client'

import { useEffect, useMemo, useState } from 'react'

type PromoItem = {
  code: string
  percent: number
  usedCount: number
  revenue: number
}

type DraftPromo = {
  code: string
  percent: string
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('uk-UA').format(amount)
}

function generatePromoCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 6; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `PRO${suffix}`
}

export default function PromoTab() {
  const [items, setItems] = useState<PromoItem[]>([])
  const [draft, setDraft] = useState<DraftPromo>({ code: '', percent: '10' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [dirty, setDirty] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/promo')
      const data = (await response.json()) as { promoCodes: PromoItem[] }
      setItems(data.promoCodes)
      setDirty(false)
    } catch {
      setMessage('Не вдалося завантажити промокоди')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const promoMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of items) {
      map[item.code] = item.percent
    }
    return map
  }, [items])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/promo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCodes: promoMap }),
      })
      if (!response.ok) throw new Error('save failed')
      setDirty(false)
      setMessage('Промокоди збережено')
      await load()
    } catch {
      setMessage('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const addPromo = () => {
    const code = draft.code.trim().toUpperCase()
    const percent = Number(draft.percent)

    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
      setMessage('Код: 3–32 символи, латиниця, цифри, _ або -')
      return
    }
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) {
      setMessage('Знижка має бути від 1% до 100%')
      return
    }
    if (items.some((item) => item.code === code)) {
      setMessage('Такий промокод уже є')
      return
    }

    setItems((current) => [...current, { code, percent, usedCount: 0, revenue: 0 }].sort((a, b) => a.code.localeCompare(b.code, 'uk')))
    setDraft({ code: '', percent: draft.percent })
    setDirty(true)
    setMessage('')
  }

  const updatePercent = (code: string, percentRaw: string) => {
    const percent = Number(percentRaw)
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) return
    setItems((current) => current.map((item) => (item.code === code ? { ...item, percent } : item)))
    setDirty(true)
  }

  const removePromo = (code: string) => {
    setItems((current) => current.filter((item) => item.code !== code))
    setDirty(true)
  }

  return (
    <div className="adminPromoPage">
      <div className="adminPromoIntro">
        <h2 className="adminBlockTitle">Промокоди</h2>
        <p className="adminHint">
          Коди застосовуються в checkout. Знижка рахується від поточної ціни квитка.
        </p>
      </div>

      <div className="adminPromoCreate">
        <label className="adminField">
          <span>Новий код</span>
          <input
            type="text"
            value={draft.code}
            onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
            placeholder="Напр. SPEAKER10"
          />
        </label>
        <label className="adminField">
          <span>Знижка, %</span>
          <input
            type="number"
            min={1}
            max={100}
            value={draft.percent}
            onChange={(event) => setDraft((current) => ({ ...current, percent: event.target.value }))}
          />
        </label>
        <div className="adminPromoCreateActions">
          <button type="button" className="adminGhostBtn" onClick={() => setDraft((current) => ({ ...current, code: generatePromoCode() }))}>
            Згенерувати код
          </button>
          <button type="button" className="adminCheckInAdmit" onClick={addPromo}>
            Додати
          </button>
        </div>
      </div>

      <div className="adminPromoToolbar">
        {dirty && <span className="adminDirtyInline">Є незбережені зміни</span>}
        <button type="button" className="adminSaveInline" onClick={() => void handleSave()} disabled={!dirty || saving}>
          {saving ? 'Зберігаємо…' : 'Зберегти промокоди'}
        </button>
      </div>

      {message && <p className="adminCheckInMessage">{message}</p>}

      {loading ? (
        <p className="adminHint">Завантаження…</p>
      ) : items.length === 0 ? (
        <p className="adminHint">Промокодів ще немає. Створи перший вище.</p>
      ) : (
        <div className="adminPromoList">
          {items.map((item) => (
            <article key={item.code} className="adminPromoCard">
              <div className="adminPromoCardHead">
                <p className="adminPromoCode">{item.code}</p>
                <button type="button" className="adminDangerBtn" onClick={() => removePromo(item.code)}>
                  Видалити
                </button>
              </div>
              <div className="adminPromoCardBody">
                <label className="adminField">
                  <span>Знижка, %</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={item.percent}
                    onChange={(event) => updatePercent(item.code, event.target.value)}
                  />
                </label>
                <div className="adminPromoStats">
                  <p><span>Використано</span><strong>{item.usedCount}</strong></p>
                  <p><span>Дохід з кодом</span><strong>{formatMoney(item.revenue)} ₴</strong></p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
