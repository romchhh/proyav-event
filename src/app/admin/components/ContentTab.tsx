'use client'

import type { SiteContent } from '@/lib/site-content/types'
import type { TicketTierId, TicketWave } from '@/lib/tickets'
import type { ContentBlockId } from './content-blocks'
import { ContentEditorProps, Field, ImageField, createId } from './admin-ui'

const WAVES: TicketWave[] = ['early', 'main', 'last']

type ContentTabProps = ContentEditorProps & {
  activeBlock: ContentBlockId
}

export default function ContentTab({ content, onChange, activeBlock }: ContentTabProps) {
  const patch = (partial: Partial<SiteContent>) => onChange({ ...content, ...partial })

  return (
    <div className="adminContent">
      {activeBlock === 'hero' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">Hero та подія</h2>
          <Field label="Заголовок — рядок 1" value={content.hero.headlineLine1} onChange={(v) => patch({ hero: { ...content.hero, headlineLine1: v } })} />
          <Field label="Заголовок — рядок 2" value={content.hero.headlineLine2} onChange={(v) => patch({ hero: { ...content.hero, headlineLine2: v } })} />
          <Field label="Акцент у заголовку" value={content.hero.headlineAccent} onChange={(v) => patch({ hero: { ...content.hero, headlineAccent: v } })} />
          <Field label="Опис — бренд" value={content.hero.descriptionBrand} onChange={(v) => patch({ hero: { ...content.hero, descriptionBrand: v } })} />
          <Field label="Опис — до акценту" value={content.hero.descriptionBefore} onChange={(v) => patch({ hero: { ...content.hero, descriptionBefore: v } })} markdown multiline />
          <Field label="Опис — акцент" value={content.hero.descriptionHighlight} onChange={(v) => patch({ hero: { ...content.hero, descriptionHighlight: v } })} />
          <Field label="Опис — після акценту" value={content.hero.descriptionAfter} onChange={(v) => patch({ hero: { ...content.hero, descriptionAfter: v } })} markdown multiline />
          <Field label="CTA кнопка" value={content.hero.cta} onChange={(v) => patch({ hero: { ...content.hero, cta: v } })} />
          <Field label="Назва події" value={content.event.name} onChange={(v) => patch({ event: { ...content.event, name: v } })} />
          <Field label="Дата (коротко)" value={content.event.dateShort} onChange={(v) => patch({ event: { ...content.event, dateShort: v } })} />
          <Field label="Час" value={content.event.time} onChange={(v) => patch({ event: { ...content.event, time: v } })} />
          <Field label="Локація" value={content.event.venueFull} onChange={(v) => patch({ event: { ...content.event, venueFull: v } })} />
          <ImageField label="Hero desktop" value={content.assets.heroDesktop} onChange={(v) => patch({ assets: { ...content.assets, heroDesktop: v } })} />
          <ImageField label="Hero mobile" value={content.assets.heroMobile} onChange={(v) => patch({ assets: { ...content.assets, heroMobile: v } })} />
          <ImageField label="Логотип" value={content.assets.logo} onChange={(v) => patch({ assets: { ...content.assets, logo: v } })} />
        </div>
      )}

      {activeBlock === 'about' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">Про подію</h2>
          <Field label="Заголовок" value={content.about.heading} onChange={(v) => patch({ about: { ...content.about, heading: v } })} />
          <Field label="Опис" value={content.about.lead} onChange={(v) => patch({ about: { ...content.about, lead: v } })} multiline markdown />
          {content.about.features.map((feature, index) => (
            <div key={index} className="adminRowCard">
              <Field label={`Перевага ${index + 1} — назва`} value={feature.title} onChange={(v) => {
                const features = [...content.about.features]
                features[index] = { ...feature, title: v }
                patch({ about: { ...content.about, features } })
              }} />
              <Field label="Опис" value={feature.desc} onChange={(v) => {
                const features = [...content.about.features]
                features[index] = { ...feature, desc: v }
                patch({ about: { ...content.about, features } })
              }} multiline markdown />
            </div>
          ))}
        </div>
      )}

      {activeBlock === 'organizers' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">Організаторки</h2>
          <Field label="Заголовок" value={content.organizers.heading} onChange={(v) => patch({ organizers: { ...content.organizers, heading: v } })} />
          <ImageField label="Фото" value={content.assets.organizers} onChange={(v) => patch({ assets: { ...content.assets, organizers: v } })} />
          {content.organizers.profiles.map((profile, index) => (
            <div key={index} className="adminRowCard">
              <Field label="Імʼя" value={profile.name} onChange={(v) => {
                const profiles = [...content.organizers.profiles]
                profiles[index] = { ...profile, name: v }
                patch({ organizers: { ...content.organizers, profiles } })
              }} />
              <Field label="Роль" value={profile.role} onChange={(v) => {
                const profiles = [...content.organizers.profiles]
                profiles[index] = { ...profile, role: v }
                patch({ organizers: { ...content.organizers, profiles } })
              }} multiline markdown />
              <Field label="Біо" value={profile.bio} onChange={(v) => {
                const profiles = [...content.organizers.profiles]
                profiles[index] = { ...profile, bio: v }
                patch({ organizers: { ...content.organizers, profiles } })
              }} multiline markdown />
            </div>
          ))}
        </div>
      )}

      {activeBlock === 'speakers' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">Спікери</h2>
          <Field label="Заголовок" value={content.speakers.heading} onChange={(v) => patch({ speakers: { ...content.speakers, heading: v } })} />
          <Field label="Підзаголовок" value={content.speakers.subheading} onChange={(v) => patch({ speakers: { ...content.speakers, subheading: v } })} multiline markdown />
          {content.speakers.items.map((speaker, index) => (
            <div key={speaker.id} className="adminRowCard">
              <Field label="Імʼя" value={speaker.name} onChange={(v) => {
                const items = [...content.speakers.items]
                items[index] = { ...speaker, name: v }
                patch({ speakers: { ...content.speakers, items } })
              }} />
              <Field label="Роль" value={speaker.role} onChange={(v) => {
                const items = [...content.speakers.items]
                items[index] = { ...speaker, role: v }
                patch({ speakers: { ...content.speakers, items } })
              }} />
              <Field label="Біо" value={speaker.bio} onChange={(v) => {
                const items = [...content.speakers.items]
                items[index] = { ...speaker, bio: v }
                patch({ speakers: { ...content.speakers, items } })
              }} multiline markdown />
              <ImageField label="Фото (опційно)" value={speaker.photo ?? ''} onChange={(v) => {
                const items = [...content.speakers.items]
                items[index] = { ...speaker, photo: v || undefined }
                patch({ speakers: { ...content.speakers, items } })
              }} />
              <button type="button" className="adminDangerBtn" onClick={() => {
                patch({ speakers: { ...content.speakers, items: content.speakers.items.filter((_, i) => i !== index) } })
              }}>Видалити спікера</button>
            </div>
          ))}
          <button type="button" className="adminGhostBtn" onClick={() => {
            patch({
              speakers: {
                ...content.speakers,
                items: [...content.speakers.items, { id: createId('speaker'), name: 'Новий спікер', role: '', bio: '' }],
              },
            })
          }}>+ Додати спікера</button>
        </div>
      )}

      {activeBlock === 'schedule' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">Програма</h2>
          {content.schedule.map((item, index) => (
            <div key={index} className="adminRowCard">
              <Field label="Час" value={item.time} onChange={(v) => {
                const schedule = [...content.schedule]
                schedule[index] = { ...item, time: v }
                patch({ schedule })
              }} />
              <Field label="Назва" value={item.title} onChange={(v) => {
                const schedule = [...content.schedule]
                schedule[index] = { ...item, title: v }
                patch({ schedule })
              }} />
              <Field label="Деталі" value={item.details ?? ''} onChange={(v) => {
                const schedule = [...content.schedule]
                schedule[index] = { ...item, details: v || undefined }
                patch({ schedule })
              }} multiline markdown />
              <button type="button" className="adminDangerBtn" onClick={() => patch({ schedule: content.schedule.filter((_, i) => i !== index) })}>Видалити</button>
            </div>
          ))}
          <button type="button" className="adminGhostBtn" onClick={() => patch({ schedule: [...content.schedule, { time: '00:00', title: 'Новий пункт' }] })}>+ Додати пункт</button>
        </div>
      )}

      {activeBlock === 'gallery' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">Галерея</h2>
          <Field label="Підзаголовок" value={content.gallery.subheading} onChange={(v) => patch({ gallery: { ...content.gallery, subheading: v } })} multiline markdown />
          {content.gallery.images.map((image, index) => (
            <div key={index} className="adminRowCard">
              <ImageField label={`Фото ${index + 1}`} value={image} onChange={(v) => {
                const images = [...content.gallery.images]
                images[index] = v
                patch({ gallery: { ...content.gallery, images } })
              }} />
              <button type="button" className="adminDangerBtn" onClick={() => patch({ gallery: { ...content.gallery, images: content.gallery.images.filter((_, i) => i !== index) } })}>Видалити</button>
            </div>
          ))}
          <button type="button" className="adminGhostBtn" onClick={() => patch({ gallery: { ...content.gallery, images: [...content.gallery.images, '/images/gallery/gallery-01.jpg'] } })}>+ Додати фото</button>
        </div>
      )}

      {activeBlock === 'faq' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">FAQ</h2>
          {content.faq.map((item, index) => (
            <div key={index} className="adminRowCard">
              <Field label="Питання" value={item.question} onChange={(v) => {
                const faq = [...content.faq]
                faq[index] = { ...item, question: v }
                patch({ faq })
              }} />
              <Field label="Відповідь" value={item.answer} onChange={(v) => {
                const faq = [...content.faq]
                faq[index] = { ...item, answer: v }
                patch({ faq })
              }} multiline markdown />
              <button type="button" className="adminDangerBtn" onClick={() => patch({ faq: content.faq.filter((_, i) => i !== index) })}>Видалити</button>
            </div>
          ))}
          <button type="button" className="adminGhostBtn" onClick={() => patch({ faq: [...content.faq, { question: 'Нове питання', answer: 'Відповідь' }] })}>+ Додати FAQ</button>
        </div>
      )}

      {activeBlock === 'tickets' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">Квитки та ціни</h2>
          {content.tickets.tiers.map((tier, tierIndex) => (
            <div key={tier.id} className="adminRowCard">
              <Field label="Назва тарифу" value={tier.name} onChange={(v) => {
                const tiers = [...content.tickets.tiers]
                tiers[tierIndex] = { ...tier, name: v }
                patch({ tickets: { ...content.tickets, tiers } })
              }} />
              <Field label="Emoji" value={tier.emoji} onChange={(v) => {
                const tiers = [...content.tickets.tiers]
                tiers[tierIndex] = { ...tier, emoji: v }
                patch({ tickets: { ...content.tickets, tiers } })
              }} />
              <Field label="Примітка про ліміт" value={tier.limitNote} onChange={(v) => {
                const tiers = [...content.tickets.tiers]
                tiers[tierIndex] = { ...tier, limitNote: v }
                patch({ tickets: { ...content.tickets, tiers } })
              }} multiline markdown />
              {WAVES.map((wave) => (
                <div key={wave} className="adminPriceRow">
                  <span>{content.tickets.waveLabels[wave]}</span>
                  <input
                    type="number"
                    value={content.tickets.priceMatrix[tier.id][wave]}
                    onChange={(event) => {
                      const tiers = [...content.tickets.tiers]
                      const priceMatrix = { ...content.tickets.priceMatrix, [tier.id]: { ...content.tickets.priceMatrix[tier.id], [wave]: Number(event.target.value) } }
                      patch({ tickets: { ...content.tickets, tiers, priceMatrix } })
                    }}
                  />
                  <input
                    type="number"
                    title="Кількість місць"
                    value={content.tickets.capacityMatrix[tier.id][wave]}
                    onChange={(event) => {
                      const capacityMatrix = { ...content.tickets.capacityMatrix, [tier.id]: { ...content.tickets.capacityMatrix[tier.id], [wave]: Number(event.target.value) } }
                      patch({ tickets: { ...content.tickets, capacityMatrix } })
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
          <p className="adminHint">Промокоди керуються в окремій вкладці «Промокоди» в адмін-панелі.</p>
        </div>
      )}

      {activeBlock === 'links' && (
        <div className="adminBlockPanel">
          <h2 className="adminBlockTitle">Посилання та SEO</h2>
          <Field label="Email" value={content.links.email} onChange={(v) => patch({ links: { ...content.links, email: v } })} />
          <Field label="Instagram" value={content.links.instagram} onChange={(v) => patch({ links: { ...content.links, instagram: v } })} />
          <Field label="Telegram" value={content.links.telegram} onChange={(v) => patch({ links: { ...content.links, telegram: v } })} />
          <Field label="Meta title" value={content.metadata.title} onChange={(v) => patch({ metadata: { ...content.metadata, title: v } })} />
          <Field label="Meta description" value={content.metadata.description} onChange={(v) => patch({ metadata: { ...content.metadata, description: v } })} multiline />
        </div>
      )}
    </div>
  )
}
