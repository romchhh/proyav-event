import Image from 'next/image'
import type { SiteContent } from '@/lib/site-content/types'
import MarkdownContent from '@/components/MarkdownContent'
import styles from './OrganizersSection.module.css'

export default function OrganizersSection({ content }: { content: SiteContent }) {
  const { organizers, assets } = content

  return (
    <section id="organizatorky" className={styles.section}>
      <div className={`sectionInner ${styles.inner}`}>
        <h2 className={`sectionHeading ${styles.heading}`}>{organizers.heading}</h2>

        <div className={styles.intro}>
          {organizers.intro.map((paragraph) => (
            <MarkdownContent key={paragraph}>{paragraph}</MarkdownContent>
          ))}
        </div>

        <article className={styles.card}>
          <div className={styles.photo}>
            <Image
              src={assets.organizers}
              alt={organizers.photoAlt}
              fill
              sizes="(max-width: 700px) 100vw, 800px"
              className={styles.photoImage}
            />
          </div>

          <div className={styles.content}>
            <h3 className={styles.names}>{organizers.namesHeading}</h3>

            <div className={styles.profiles}>
              {organizers.profiles.map((person) => (
                <div key={person.name} className={styles.person}>
                  <p className={styles.personName}>{person.name}</p>
                  <div className={styles.role}>
                    <MarkdownContent inline>{person.role}</MarkdownContent>
                  </div>
                  <div className={styles.bio}>
                    <MarkdownContent>{person.bio}</MarkdownContent>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <blockquote className={styles.quote}>
          {organizers.quote.map((line) => (
            <MarkdownContent key={line}>{line}</MarkdownContent>
          ))}
        </blockquote>
      </div>
    </section>
  )
}
