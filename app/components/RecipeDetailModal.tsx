'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import styles from './RecipeDetailModal.module.css';

interface Ingredient { amount: string; name: string; }
interface Step { step: number; text: string; }

export interface RecipeDetail {
  id: string;
  title: string;
  tag: string;
  rating: string;
  reviews: number;
  time: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  calories: number;
  src: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  author: string;
  authorAvatar?: string;
}

interface Props {
  recipe: RecipeDetail | null;
  onClose: () => void;
}

export default function RecipeDetailModal({ recipe, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!recipe) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [recipe, onClose]);

  if (!recipe) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true"
      aria-label={recipe.title} onClick={onClose} id="recipe-modal">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>

        {/* ── Hero image ── */}
        <div className={styles.hero}>
          <Image src={recipe.src} alt={recipe.title} fill
            sizes="(max-width: 768px) 100vw, 800px" className={styles.heroImg} priority />
          <div className={styles.heroOverlay} />

          {/* Close button */}
          <button className={styles.closeBtn} onClick={onClose} id="modal-close" aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Category badge */}
          <span className={styles.heroBadge}>{recipe.tag}</span>
        </div>

        {/* ── Scrollable body ── */}
        <div className={styles.body}>

          {/* Title + rating */}
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{recipe.title}</h1>
            <div className={styles.ratingRow}>
              <div className={styles.stars} aria-label={`Rating ${recipe.rating} dari 5`}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                    fill={parseFloat(recipe.rating) >= i ? '#f59e0b' : 'none'}
                    stroke="#f59e0b" strokeWidth="1.5" aria-hidden="true">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                ))}
              </div>
              <span className={styles.ratingNum}>{recipe.rating}</span>
              <span className={styles.reviewCount}>({recipe.reviews} ulasan)</span>
            </div>
            <p className={styles.description}>{recipe.description}</p>
          </div>

          {/* Quick stats */}
          <div className={styles.statsRow}>
            {[
              { icon: '🕐', label: 'Persiapan', value: recipe.prepTime },
              { icon: '🔥', label: 'Masak',     value: recipe.cookTime },
              { icon: '👥', label: 'Porsi',     value: `${recipe.servings} org` },
              { icon: '⚡', label: 'Kalori',    value: `${recipe.calories} kkal` },
            ].map(s => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statIcon}>{s.icon}</span>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Two-column layout */}
          <div className={styles.twoCol}>

            {/* Ingredients */}
            <div className={styles.col}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionDot} />
                Bahan-Bahan
              </h2>
              <ul className={styles.ingredientList}>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className={styles.ingredientItem}>
                    <label className={styles.checkWrap}>
                      <input type="checkbox" className={styles.check} id={`ing-${recipe.id}-${i}`} />
                      <span className={styles.checkBox} aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <polyline points="2,6 5,9 10,3"/>
                        </svg>
                      </span>
                      <span className={styles.ingredientText}>
                        <span className={styles.ingredientAmount}>{ing.amount}</span>
                        {ing.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div className={styles.col}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionDot} />
                Cara Membuat
              </h2>
              <ol className={styles.stepList}>
                {recipe.steps.map((s) => (
                  <li key={s.step} className={styles.stepItem}>
                    <div className={styles.stepNum}>{s.step}</div>
                    <p className={styles.stepText}>{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* CTA */}
          <div className={styles.ctaRow}>
            <button className={styles.ctaSave} id={`modal-save-${recipe.id}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Simpan Resep
            </button>
            <button className={styles.ctaShare} id={`modal-share-${recipe.id}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Bagikan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
