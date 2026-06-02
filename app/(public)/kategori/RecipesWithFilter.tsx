'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

interface Recipe {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  rating: number;
  prepTime: string;
  cookTime: string;
  description?: string;
  tags?: { id?: number; name: string }[];
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  recipes: Recipe[];
  categories: Category[];
  tags: string[];
}

export default function RecipesWithFilter({ recipes, categories, tags }: Props) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'Semua';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [shortcutLabel, setShortcutLabel] = useState('⌘ K');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Detect OS for shortcut label
    if (typeof window !== 'undefined') {
      const isMac = navigator.userAgent.toLowerCase().includes('mac');
      setShortcutLabel(isMac ? '⌘ K' : 'Ctrl K');
    }

    // Keyboard shortcut handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('category');
    const tag = searchParams.get('tag');
    if (q !== null) setSearch(q);
    if (cat !== null) setActiveCategory(cat);
    if (tag !== null) setActiveTag(tag);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = recipes;
    if (activeCategory !== 'Semua') {
      result = result.filter(r => r.category === activeCategory);
    }
    if (activeTag) {
      result = result.filter(r => r.tags && r.tags.some(t => t.name === activeTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [recipes, activeCategory, activeTag, search]);

  return (
    <>
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
            ref={searchInputRef}
            type="text"
            id="kategori-search"
            className={styles.searchInput}
            placeholder="Cari kategori atau resep favorit kamu..."
            aria-label="Cari kategori"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className={styles.searchKbd} aria-hidden="true">{shortcutLabel}</span>
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

      <div className={styles.recipePage}>
        {/* ── Filter Chips ── */}
      <div className={styles.filterBar} role="tablist" aria-label="Filter kategori">
        <button
          role="tab"
          aria-selected={activeCategory === 'Semua'}
          className={`${styles.filterBtn} ${activeCategory === 'Semua' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveCategory('Semua')}
        >
          🍽️ Semua
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.name}
            className={`${styles.filterBtn} ${activeCategory === cat.name ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Popular Tags ── */}
      {tags && tags.length > 0 && (
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div className={styles.tagsGrid} role="list" style={{ marginTop: 0 }}>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`${styles.tagChip} ${activeTag === tag ? styles.tagChipActive : styles.tagChipDefault}`}
                role="listitem"
                style={activeTag === tag ? { background: 'var(--clr-primary)', color: '#fff' } : {}}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Result count ── */}
      <div className={styles.resultMeta}>
        <span className={styles.resultCount}>
          {filtered.length} resep ditemukan
          {activeCategory !== 'Semua' && <> dalam <strong>{activeCategory}</strong></>}
          {activeTag && <> dengan tag <strong>#{activeTag}</strong></>}
        </span>
      </div>

      {/* ── Recipe Grid ── */}
      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🥣</div>
            <h3>Resep tidak ditemukan</h3>
            <p>Coba kategori atau tag lain, atau ubah kata pencarian kamu.</p>
            <button className={styles.resetFilterBtn} onClick={() => { setActiveCategory('Semua'); setActiveTag(null); setSearch(''); }}>
              Reset Filter
            </button>
          </div>
        ) : (
          filtered.map(recipe => (
            <Link key={recipe.id} href={`/recipe/${recipe.id}`} className={styles.card} prefetch={false}>
              <Image
                src={(recipe.imageUrl?.includes('example.com') ? null : recipe.imageUrl) || '/recipe-chicken.jpg'}
                alt={recipe.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={styles.cardPhoto}
              />
              <div className={styles.cardOverlay} />
              
              {recipe.category && (
                <div className={styles.cardRecipeBadge}>
                  {recipe.category}
                </div>
              )}

              <div className={styles.cardContent}>
                <h3 className={styles.cardName}>{recipe.title}</h3>
              </div>
            </Link>
          ))
        )}
        </div>
        </div>
      </main>
    </>
  );
}
