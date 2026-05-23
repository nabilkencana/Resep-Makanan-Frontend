'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './NavBar.module.css';

const GooeyNav    = dynamic(() => import('./GooeyNav'),    { ssr: false });
const TextPressure = dynamic(() => import('./TextPressure'), { ssr: false });

const NAV_ITEMS = [
  { label: 'Jelajahi', href: '/' },
  { label: 'Kategori', href: '/kategori' },
  { label: 'Jurnal',   href: '/journal' },
];

/* ── Inline SVGs – no external font needed ── */
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconPerson = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function NavBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // focus the input whenever the search panel opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>

        {/* Logo – TextPressure interactive variable font */}
        <Link href="/" className={styles.logo} id="nav-logo" aria-label="Dapur Nusantara – Beranda">
          <div className={styles.logoBox}>
            <TextPressure
              text="Dapur Nusantara"
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#1a1c1d"
              minFontSize={12}
            />
          </div>
        </Link>

        {/* GooeyNav – desktop only */}
        <div className={styles.gooeyWrap} aria-label="Navigasi utama" id="nav-gooey">
          <GooeyNav
            items={NAV_ITEMS}
            initialActiveIndex={0}
            particleCount={12}
            particleDistances={[70, 8]}
            particleR={80}
            animationTime={500}
            timeVariance={250}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>

          {/* Search — icon button that expands to input */}
          <div className={`${styles.searchWrap} ${searchOpen ? styles.searchOpen : ''}`}>
            <button
              className={styles.searchIconBtn}
              id="nav-search-btn"
              aria-label="Buka pencarian"
              onClick={() => setSearchOpen(v => !v)}
              type="button"
            >
              <IconSearch />
            </button>

            <div className={styles.searchInputWrap}>
              <input
                ref={inputRef}
                className={styles.searchInput}
                type="text"
                placeholder="Cari resep..."
                aria-label="Cari resep"
                id="nav-search"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          </div>

          {/* Profile – icon only */}
          <Link href="/profile" className={styles.profileBtn} id="nav-profile" aria-label="Profil">
            <IconPerson />
          </Link>

          {/* Hamburger Menu (Mobile Only) */}
          <button 
            className={`${styles.hamburgerBtn} ${mobileMenuOpen ? styles.menuOpen : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>

        </div>
      </div>

      {/* Mobile Overlay Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.menuOpen : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div onClick={(e) => e.stopPropagation()}>
          <GooeyNav
            items={NAV_ITEMS}
            initialActiveIndex={0}
            particleCount={12}
            particleDistances={[120, 15]}
            particleR={120}
            animationTime={500}
            timeVariance={250}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            vertical={true}
          />
        </div>
      </div>
    </header>
  );
}
