import type { SiteContent } from '@/lib/site-content/types'
import MarkdownContent from '@/components/MarkdownContent'
import styles from './VenueSection.module.css'

export default function VenueSection({ content }: { content: SiteContent }) {
  const { venue, event, links } = content

  return (
    <section id="mistsce" className={styles.section}>
      <div className={`sectionInner ${styles.inner}`}>
        <div className={styles.content}>
          <h2 className="sectionHeading">{venue.heading}</h2>
          <p className={`sectionSubheading ${styles.venueName}`}>{event.venueEn}</p>
          <p className={styles.location}>{event.venueFull}</p>
          <div className={styles.desc}>
            <MarkdownContent>{venue.description}</MarkdownContent>
          </div>
          <a href={links.maps} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Відкрити в Google Maps
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 14 L14 2 M6 2 H14 V10"/>
            </svg>
          </a>
        </div>

        <div className={styles.mapWrap}>
          <iframe
            title="Podolyany Hall на карті"
            src={venue.mapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
