'use client';

import { useState, useMemo, useEffect } from 'react';
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
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  recipes: Recipe[];
  categories: Category[];
}

export default function RecipesWithFilter({ recipes, categories }: Props) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'Semua';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('category');
    if (q !== null) setSearch(q);
    if (cat !== null) setActiveCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = recipes;
    if (activeCategory !== 'Semua') {
      result = result.filter(r => r.category === activeCategory);
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
  }, [recipes, activeCategory, search]);

  return (
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

      {/* ── Result count ── */}
      <div className={styles.resultMeta}>
        <span className={styles.resultCount}>
          {filtered.length} resep ditemukan
          {activeCategory !== 'Semua' && <> dalam <strong>{activeCategory}</strong></>}
        </span>
      </div>

      {/* ── Recipe Grid ── */}
      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🥣</div>
            <h3>Resep tidak ditemukan</h3>
            <p>Coba kategori lain atau ubah kata pencarian kamu.</p>
            <button className={styles.resetFilterBtn} onClick={() => { setActiveCategory('Semua'); setSearch(''); }}>
              Reset Filter
            </button>
          </div>
        ) : (
          filtered.map(recipe => (
            <Link key={recipe.id} href={`/recipe/${recipe.id}`} className={styles.card}>
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
  );
}
