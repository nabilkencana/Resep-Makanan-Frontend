'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getHomeRecipes } from '../../lib/homeData';
import styles from './RecipesSection.module.css';

const ASPECTS: Record<string, string> = {
  chicken: '4/5', salad: '4/5', bowl: '1/1', bread: '1/1', pizza: '4/5',
};

export default function RecipesSection({ search }: { search?: string }) {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL;
        if (!API_BASE) {
          console.error("NEXT_PUBLIC_API_URL is not configured");
          setIsLoading(false);
          return;
        }

        if (!search) {
          // Deduplicate fetch for the homepage
          const recipesData = await getHomeRecipes(API_BASE);
          if (recipesData?.recipes) {
            setRecipes(recipesData.recipes);
          }
        } else {
          // Search query - fetch fresh with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const url = new URL(`${API_BASE}/recipes`);
          url.searchParams.set('search', search);

          const res = await fetch(url.toString(), { 
            cache: 'no-store',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          const contentType = res.headers.get('content-type') || '';
          
          if (!res.ok || !contentType.includes('application/json')) {
            console.error('Backend returned non-JSON response, status:', res.status);
          } else {
            const data = await res.json();
            if (data.recipes) setRecipes(data.recipes);
            else if (Array.isArray(data)) setRecipes(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch recipes', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [search]);

  return (
    <section className={styles.section} id="recipe" aria-labelledby="recipes-title">
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title} id="recipes-title">{search ? `Hasil Pencarian: ${search}` : 'Resep Populer'}</h2>
            <p className={styles.sub}>Hidangan pilihan yang dicintai komunitas kami.</p>
          </div>
          <Link href="/kategori" className={styles.viewAll} id="btn-view-all">
            <span>Lihat Semua</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>

        {/* Masonry grid */}
        <div className={styles.masonry} role="list">
          {isLoading ? (
            // Skeleton loader for 6 items
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.card} style={{ opacity: 0.5 }}>
                <div className={styles.imgWrap} style={{ aspectRatio: i % 2 === 0 ? '4/5' : '1/1', backgroundColor: 'var(--clr-outline)' }}>
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                    <div style={{ height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', width: '40%' }}></div>
                    <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', width: '80%' }}></div>
                  </div>
                </div>
              </div>
            ))
          ) : recipes.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-outline)', gridColumn: '1 / -1' }}>
              Tidak ada resep yang ditemukan.
            </div>
          ) : (
            recipes.map((r) => (
              <article key={r.id} className={styles.card} id={`recipe-card-${r.id}`} role="listitem">
                <Link href={`/recipe/${r.id}`} className={styles.cardLink} aria-label={`Lihat resep ${r.title}`}>
                  <div className={styles.imgWrap} style={{ 
                    aspectRatio: (r.title.toLowerCase().includes('bowl') || r.title.toLowerCase().includes('bread')) ? '1/1' : '4/5' 
                  }}>
                    <Image
                      src={(r.imageUrl?.includes('example.com') ? null : r.imageUrl) || '/recipe-chicken.jpg'}
                      alt={r.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={styles.cardImg}
                    />
                    <div className={styles.gradient} aria-hidden="true" />
                    <div className={styles.tags}>
                      {r.category && <span className={styles.tag}>{r.category}</span>}
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.meta}>
                        <span className={styles.rating}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                          </svg>
                          {r.rating}
                        </span>
                        <span className={styles.time}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                          </svg>
                          {r.prepTime}
                        </span>
                      </div>
                      <h3 className={styles.cardTitle}>{r.title}</h3>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>

        {/* Mobile "view all" */}
        <div className={styles.mobileViewAll}>
          <button className={styles.mobileViewAllBtn} id="btn-view-all-mobile">
            <span>Lihat Semua Resep</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}

