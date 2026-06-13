import Link from 'next/link'
import type { SiteContent } from '@/lib/site-content/types'
import MarkdownContent from '@/components/MarkdownContent'
import styles from './Footer.module.css'

export default function Footer({ content }: { content: SiteContent }) {
  const { footer, links } = content

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.tagline}>
          <MarkdownContent>{footer.tagline}</MarkdownContent>
        </div>

        <div className={styles.bottom}>
          <span className={styles.brand}>{footer.brand}</span>
          <div className={styles.contacts}>
            <a href={`mailto:${links.email}`}>{links.email}</a>
            <a href={links.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
          <Link href={links.privacy} className={styles.privacy}>Політика конфіденційності</Link>
          <p className={styles.credit}>
            {footer.credit.split('Telebots')[0]}
            <a href={links.telebots} target="_blank" rel="noopener noreferrer">Telebots</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
