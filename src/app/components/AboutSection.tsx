import type { SiteContent } from '@/lib/site-content/types'
import MarkdownContent from '@/components/MarkdownContent'
import styles from './AboutSection.module.css'

export default function AboutSection({ content }: { content: SiteContent }) {
  const { about } = content

  return (
    <section id="pro-podiyu" className={styles.section}>
      <div className={`sectionInner ${styles.inner}`}>
        <div className={styles.top}>
          <h2 className={`sectionHeading ${styles.heading}`}>{about.heading}</h2>
          <div className={styles.lead}>
            <MarkdownContent>{about.lead}</MarkdownContent>
          </div>
        </div>

        <div className={styles.locations}>
          <h3 className={styles.locationsTitle}>{about.locationsTitle}</h3>
          <p className={styles.locationsLead}>{about.locationsLead}</p>
          <ul className={styles.locationsList}>
            {about.locationsList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={styles.locationsClosing}>{about.locationsClosing}</p>
        </div>

        <div className={styles.plates}>
          {about.features.map((feature) => (
            <div key={feature.title} className={styles.plate}>
              <span className={styles.plateTitle}>{feature.title}</span>
              <span className={styles.plateDesc}>
                <MarkdownContent inline>{feature.desc}</MarkdownContent>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
