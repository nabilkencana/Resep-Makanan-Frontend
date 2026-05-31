import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { PlusCircle } from 'lucide-react';
import RecipesWithFilter from './RecipesWithFilter';
import { CATEGORIES as FALLBACK_CATEGORIES } from '../../data/categories';
import styles from './page.module.css';
import HeroStats from './HeroStats';
import HeroTitle from './HeroTitle';
import HeroSubtitle from './HeroSubtitle';

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



async function getRecipes() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/recipes?limit=12`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.recipes || [];
  } catch {
    return [];
  }
}

async function getTags() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/recipes/tags`, { next: { revalidate: 300 } });
    if (!res.ok) return POPULAR_TAGS;
    const data = await res.json();
    if (data.success && data.tags) {
      return data.tags.map((t: any) => t.name).slice(0, 15);
    }
    return POPULAR_TAGS;
  } catch (e) {
    return POPULAR_TAGS;
  }
}

export default async function KategoriPage() {
  const [recipes, tags] = await Promise.all([getRecipes(), getTags()]);
  
  // Get unique categories currently active in recipes
  const uniqueCategoryNames = Array.from(new Set(recipes.map((r: any) => r.category))).filter(Boolean);
  const categories = uniqueCategoryNames.map((name: any, i: number) => ({
    id: `cat-${i}`,
    name: name as string
  }));

  const totalCategories = categories.length;
  const totalRecipes = recipes.length;
  const avgRating = totalRecipes > 0 
    ? (recipes.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalRecipes).toFixed(1)
    : '0.0';

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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Beranda
        </Link>

        {/* Hero content */}
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Jelajahi Semua Kategori
          </div>
          <HeroTitle />
          <HeroSubtitle />
          <HeroStats totalCategories={totalCategories} totalRecipes={totalRecipes} avgRating={Number(avgRating)} />
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
            Semua <span>Resep</span>
          </h2>
          <span className={styles.sectionCount}>{recipes.length} resep tersedia</span>
        </div>

        {/* ── Filter & Recipe Grid ── */}
        <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-outline)' }}>Memuat resep...</div>}>
          <RecipesWithFilter recipes={recipes} categories={categories} tags={tags} />
        </Suspense>

        {/* ── Popular Tags (Server Rendered Fallback if JS Disabled) ── */}
        <section className={styles.tagsSection} aria-label="Tag populer" style={{ display: 'none' }}>
          <div className={styles.tagsSectionHeader}>
            <h2 className={styles.sectionTitle}>Tag <span>Populer</span></h2>
          </div>
          <div className={styles.tagsGrid} role="list">
            {tags.map((tag: string) => (
              <a
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className={`${styles.tagChip} ${styles.tagChipDefault}`}
                id={`tag-${tag.replace(/[^a-z]/gi, '').toLowerCase()}`}
                role="listitem"
              >
                #{tag}
              </a>
            ))}
          </div>
        </section>

        {/* ── Submit Recipe CTA ── */}
        <section className={styles.newsletter} aria-label="Kirim Resep Kamu">
          <div className={styles.newsletterBubble1} aria-hidden="true" />
          <div className={styles.newsletterBubble2} aria-hidden="true" />
          <div className={styles.newsletterEmoji} aria-hidden="true">👨‍🍳</div>
          <h2 className={styles.newsletterTitle}>Punya Resep Andalan?</h2>
          <p className={styles.newsletterSubtitle}>
            Bagikan resep kreasimu dengan komunitas Dapur Nusantara! Semua resep yang dikirim akan diverifikasi oleh tim kami sebelum dipublikasikan.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/kategori/tambah" className={styles.submitRecipeBtn}>
              <PlusCircle size={20} style={{ marginRight: '8px' }} />
              Kirim Resep Sekarang
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
