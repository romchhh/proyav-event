import Image from 'next/image'
import type { SiteContent } from '@/lib/site-content/types'
import MarkdownContent from '@/components/MarkdownContent'
import styles from './Hero.module.css'

export default function Hero({ content }: { content: SiteContent }) {
  const { hero, event, assets } = content

  return (
    <section className={styles.hero}>
      <div className={styles.bg}>
        <Image
          src={assets.heroDesktop}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`${styles.bgImage} ${styles.bgDesktop}`}
        />
        <Image
          src={assets.heroMobile}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`${styles.bgImage} ${styles.bgMobile}`}
        />
      </div>
      <div className={styles.overlay} />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.shell}>
        <div className={`sectionInner ${styles.inner}`}>
          <div className={styles.content}>
            <div className={styles.headlineWrap}>
              <h1 className={styles.headline}>
                {hero.headlineLine1}
                <br />
                {hero.headlineLine2} <span>{hero.headlineAccent}</span>
              </h1>
            </div>

            <p className={styles.desc}>
              <span className={styles.descBrand}>{hero.descriptionBrand}</span>
              <MarkdownContent inline>{hero.descriptionBefore}</MarkdownContent>
              <span className={styles.descHighlight}>{hero.descriptionHighlight}</span>
              <MarkdownContent inline>{hero.descriptionAfter}</MarkdownContent>
            </p>

            <p className={styles.badge}>
              <span className={styles.dateHighlight}>{event.dateShort}</span>
              <span className={styles.badgeDot} aria-hidden="true" />
              {hero.badgeVenue}
              <span className={styles.badgeDot} aria-hidden="true" />
              {hero.badgeTime}
            </p>
          </div>

          <a href="#kvitky" className={styles.ctaCard}>
            <span className={styles.ctaText}>{hero.cta}</span>
            <span className={styles.ctaArrow} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 14 L14 2 M6 2 H14 V10" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
