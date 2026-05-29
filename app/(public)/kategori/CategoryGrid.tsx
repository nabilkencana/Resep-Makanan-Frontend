'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { CategoryData } from '../../data/categories';
import styles from './page.module.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Curated Unsplash food photos per category ── */
const CATEGORY_PHOTOS: Record<string, string> = {
  'sarapan': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=900&q=80',
  'makan-siang': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
  'makan-malam': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  'cemilan': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80',
  'vegan': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
  'minuman': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
  'roti-kue': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  'italia': 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80',
};

/* ── Bento grid: which positions are "large" (span 2 cols) ── */
const LARGE_POSITIONS = new Set([4, 7]); // 5th and 8th cards

interface Props {
  categories: CategoryData[];
}

export default function CategoryGrid({ categories }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gsap.utils.toArray<HTMLElement>('.cat-card', gridRef.current);

    // ── Initial hidden state ─────────────────────────────────────────────
    gsap.set(cards, {
      opacity: 0,
      y: 100,
      rotation: () => gsap.utils.random(-10, 10),
      transformOrigin: 'center center',
    });

    const floatingTweens = new Map<HTMLElement, gsap.core.Tween>();

    function startFloating(card: HTMLElement) {
      if (floatingTweens.has(card)) return;
      const tween = gsap.to(card, {
        y: gsap.utils.random(5, 12),
        rotation: gsap.utils.random(0.5, 2),
        duration: gsap.utils.random(2.5, 4.5),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: gsap.utils.random(0, 2),
      });
      floatingTweens.set(card, tween);
    }

    // ── ScrollTrigger entrance ───────────────────────────────────────────
    ScrollTrigger.batch('.cat-card', {
      start: 'top 88%',
      interval: 0.1,
      batchMax: 3,
      onEnter: (batch) => {
        gsap.to(batch as HTMLElement[], {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 1.4,
          ease: 'power2.out',
          stagger: 0.1,
          onComplete() {
            (batch as HTMLElement[]).forEach(c => startFloating(c));
          },
        });
      },
      onLeaveBack: (batch) => {
        (batch as HTMLElement[]).forEach(card => {
          const ft = floatingTweens.get(card);
          if (ft) { ft.kill(); floatingTweens.delete(card); }
          gsap.set(card, { opacity: 0, y: 100, rotation: gsap.utils.random(-10, 10) });
        });
      },
    });

    return () => {
      floatingTweens.forEach(t => t.kill());
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div
      className={styles.grid}
      ref={gridRef}
      role="list"
      aria-label="Daftar kategori resep"
    >
      {categories.map((cat, idx) => {
        const isLarge = LARGE_POSITIONS.has(idx);
        const photo = CATEGORY_PHOTOS[cat.id];

        return (
          <Link
            key={cat.id}
            href={`/kategori/${cat.id}`}
            className={`${styles.card} ${isLarge ? styles.cardLarge : ''} cat-card`}
            id={`cat-card-${cat.id}`}
            aria-label={`${cat.name} – ${cat.recipeCount} resep`}
            role="listitem"
          >
            {/* ── Food photo background ── */}
            {photo ? (
              <Image
                src={photo}
                alt={cat.name}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                className={styles.cardPhoto}
              />
            ) : (
              /* Fallback: gradient */
              <div
                className={styles.cardBg}
                style={{ background: `linear-gradient(160deg, ${cat.color} 0%, ${cat.colorEnd} 100%)` }}
              />
            )}

            {/* Dark vignette overlay */}
            <div className={styles.cardOverlay} />

            {/* ── Recipe count badge (top-left, green) ── */}
            <div className={styles.cardRecipeBadge}>
              {cat.recipeCount} Resep
            </div>

            {/* ── Bottom content ── */}
            <div className={styles.cardContent}>
              <h3 className={styles.cardName}>{cat.name}</h3>
            </div>
          </Link>
        );
      })}

      {/* ── "More Categories" placeholder (matches reference) ── */}
      <div className={`${styles.card} ${styles.cardMore}`} role="listitem">
        <div className={styles.cardMoreInner}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
          <span className={styles.cardMoreTitle}>Segera Hadir</span>
          <span className={styles.cardMoreSub}>Kategori baru dan koleksi musiman.</span>
        </div>
      </div>
    </div>
  );
}
