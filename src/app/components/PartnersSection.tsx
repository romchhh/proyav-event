import type { SiteContent } from '@/lib/site-content/types'
import MarkdownContent from '@/components/MarkdownContent'
import styles from './PartnersSection.module.css'

export default function PartnersSection({ content }: { content: SiteContent }) {
  const { partners, links } = content

  return (
    <section id="partnery" className={styles.section}>
      <div className={`sectionInner ${styles.inner}`}>
        <div className={styles.card}>
          <h2 className={styles.heading}>{partners.heading}</h2>
          <div className={styles.text}>
            <MarkdownContent>{partners.subheading}</MarkdownContent>
          </div>
          <a href={links.becomePartner} className={styles.cta}>
            <span className={styles.ctaPlus} aria-hidden="true">+</span>
            {partners.cta}
          </a>
          <a href={`mailto:${links.email}`} className={styles.email}>
            {links.email}
          </a>
        </div>
      </div>
    </section>
  )
}
