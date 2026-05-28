import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES as FALLBACK_CATEGORIES } from '../data/categories';
import styles from './page.module.css';
import NewsletterForm from './NewsletterForm';
import HeroStats from './HeroStats';
import HeroTitle from './HeroTitle';
import HeroSubtitle from './HeroSubtitle';
import CategoryGrid from './CategoryGrid';

export const metadata = {
  title: 'Kategori Resep — Dapur Nusantara',
  description:
    'Temukan ribuan resep dari berbagai kategori: sarapan, makan siang, makan malam, cemilan, vegan, minuman, dan banyak lagi.',
};

/* ── Popular tags derived from recipe data ── */
const POPULAR_TAGS = [
  '🌶️ Pedas', '🥦 Sehat', '⚡ Cepat', '🎂 Ultah', '🏖️ BBQ', '🍜 Berkuah',
  '🥩 Daging', '🐟 Seafood', '🍰 Dessert', '🧁 Kue', '🥗 Salad', '🍛 Nusantara',
];

async function getCategories() {
  try {
    const res = await fetch('http://localhost:3000/api/categories', { cache: 'no-store' });
    if (!res.ok) return FALLBACK_CATEGORIES;
    const data = await res.json();
    
    // Map backend categories to frontend format if needed
    const backendCategories = data.categories?.map((cat: any, i: number) => ({
      id: cat.id.toString(),
      name: cat.name,
      description: cat.description,
      icon: cat.icon || '🍽️',
      color: cat.color || '#F0FDF4', // default green
      slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: cat._count?.recipes || Math.floor(Math.random() * 50) + 10, // fallback count if not populated
      href: `/?category=${encodeURIComponent(cat.name)}`
    }));

    return (backendCategories && backendCategories.length > 0) ? backendCategories : FALLBACK_CATEGORIES;
  } catch (e) {
    return FALLBACK_CATEGORIES;
  }
}

export default async function KategoriPage() {
  const categories = await getCategories();
  const totalCategories = categories.length;

  return (
    <div className={styles.page}>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <Image
            src="/category-hero.png"
            alt="Dapur Nusantara – Semua Kategori Makanan"
            fill
            priority
            sizes="100vw"
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />

          {/* Back button */}
          <Link href="/" className={styles.heroBackBtn} aria-label="Kembali ke beranda">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Beranda
          </Link>

          {/* Hero content */}
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Jelajahi Semua Kategori
            </div>
            <HeroTitle />
            <HeroSubtitle />
            <HeroStats totalCategories={totalCategories} />
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              type="text"
              id="kategori-search"
              className={styles.searchInput}
              placeholder="Cari kategori atau resep favorit kamu..."
              aria-label="Cari kategori"
            />
            <span className={styles.searchKbd} aria-hidden="true">⌘ K</span>
          </div>
        </div>

        {/* ── Body ── */}
        <main className={styles.body}>

          {/* Section Header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Semua <span>Kategori</span>
            </h2>
            <span className={styles.sectionCount}>{totalCategories} kategori tersedia</span>
          </div>

          {/* Category Grid — Anti-Gravity Animation */}
          <CategoryGrid categories={categories} />

          {/* ── Popular Tags ── */}
          <section className={styles.tagsSection} aria-label="Tag populer">
            <div className={styles.tagsSectionHeader}>
              <h2 className={styles.sectionTitle}>Tag <span>Populer</span></h2>
            </div>
            <div className={styles.tagsGrid} role="list">
              {POPULAR_TAGS.map((tag) => (
                <a
                  key={tag}
                  href="#"
                  className={`${styles.tagChip} ${styles.tagChipDefault}`}
                  id={`tag-${tag.replace(/[^a-z]/gi, '').toLowerCase()}`}
                  role="listitem"
                >
                  {tag}
                </a>
              ))}
            </div>
          </section>

          {/* ── Newsletter ── */}
          <section className={styles.newsletter} aria-label="Newsletter Dapur Nusantara">
            <div className={styles.newsletterBubble1} aria-hidden="true" />
            <div className={styles.newsletterBubble2} aria-hidden="true" />
            <div className={styles.newsletterEmoji} aria-hidden="true">📬</div>
            <h2 className={styles.newsletterTitle}>Resep Baru Setiap Minggu</h2>
            <p className={styles.newsletterSubtitle}>
              Daftarkan email-mu dan dapatkan inspirasi masak segar langsung di kotak masuk, gratis!
            </p>
            <NewsletterForm />
          </section>

        </main>
      </div>
  );
}
