'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { SiteContent } from '@/lib/site-content/types'
import styles from './Navbar.module.css'

export default function Navbar({
  transparent = false,
  content,
}: {
  transparent?: boolean
  content: SiteContent
}) {
  const navLinks = content.navbar.links
  const { assets, links, hero } = content
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isLight = scrolled || !transparent
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className={`${styles.header} ${isLight ? styles.light : styles.dark}`}>
        <nav className={styles.nav}>
          <a href="/" className={styles.brand}>
            <Image
              src={assets.logo}
              alt="PROяв"
              width={400}
              height={184}
              className={styles.brandImage}
              priority
            />
          </a>

          <div className={styles.links}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </div>

          <div className={styles.actions}>
            <a
              href={links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
            >
              Instagram
            </a>
            <a href="#kvitky" className={styles.cta}>
              <span>{hero.cta}</span>
              <span className={styles.ctaArrow} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 14 L14 2 M6 2 H14 V10" />
                </svg>
              </span>
            </a>
          </div>

          <div className={styles.mobileActions}>
            <a
              href={links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconBtn}
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#kvitky" className={styles.iconBtn} aria-label={hero.cta}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 14 L14 2 M6 2 H14 V10" />
              </svg>
            </a>
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(true)}
            aria-label="Відкрити меню"
          >
            <span /><span /><span />
          </button>
        </nav>
      </header>

      <div className={`${styles.drawer} ${menuOpen ? styles.open : ''}`} role="dialog" aria-modal="true" aria-label="Меню">
        <button className={styles.drawerClose} onClick={closeMenu} aria-label="Закрити">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6 L18 18 M18 6 L6 18" />
          </svg>
        </button>

        <div className={styles.drawerBody}>
          <nav className={styles.drawerLinks} aria-label="Мобільна навігація">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>
            ))}
          </nav>

          <a href="#kvitky" className={styles.drawerCta} onClick={closeMenu}>
            <span>{hero.cta}</span>
            <span className={styles.drawerCtaArrow} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 14 L14 2 M6 2 H14 V10" />
              </svg>
            </span>
          </a>
        </div>

        <a
          href={links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.drawerBottomIcon}
          onClick={closeMenu}
          aria-label="Instagram @proyavevent"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      </div>
    </>
  )
}
