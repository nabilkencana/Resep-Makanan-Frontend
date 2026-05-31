'use client';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { ReactNode, CSSProperties } from 'react';
import styles from './HeroSection.module.css';
import CountUp from './CountUp';

import { useEffect, useState } from 'react';

// ── Type for Card so dynamic() doesn't erase its props ──
interface CardProps {
  children?: ReactNode;
  customClass?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

// ── Type for BlurText – all props are optional (JS defaults handle them) ──
interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: string;
  direction?: string;
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, unknown>;
  animationTo?: Record<string, unknown>[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  startWhen?: boolean;
}

// ── Type for CardSwap – mirroring what the JS component actually accepts ──
interface CardSwapProps {
  children?: ReactNode;
  width?: number;              // JS uses number only, not string
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: string;
  startWhen?: boolean;
}

// Dynamically import CardSwap (GSAP needs browser)
const CardSwap = dynamic<CardSwapProps>(
  // Cast to any: stops TS comparing our interface against the JS-inferred type,
  // which diverges on optional vs required props.
  () => import('./CardSwap') as any,
  { ssr: false }
);
const Card = dynamic<CardProps>(
  // forwardRef makes TS infer RefAttributes<any> which conflicts with CardProps,
  // so we cast to any and let our CardProps interface take over.
  () => import('./CardSwap').then((m) => m.Card as any),
  { ssr: false }
);

// Dynamically import BlurText (uses IntersectionObserver / motion)
const BlurText = dynamic<BlurTextProps>(
  () => import('./BlurText') as any,
  { ssr: false }
);

type RecipeCard = { id?: number | string; src: string; title: string; tag: string; rating: string; time: string };
const DUMMY_RECIPE_CARDS: RecipeCard[] = [
  { src: '/recipe-salad.png', title: 'Garden Harvest Salad',  tag: 'Vegan',       rating: '4.8', time: '15 mnt' },
  { src: '/recipe-bowl.png',  title: 'Berry & Granola Bowl',  tag: 'Sarapan',     rating: '4.9', time: '10 mnt' },
  { src: '/recipe-pizza.png', title: 'Heirloom Tomato Pizza', tag: 'Makan Malam', rating: '4.7', time: '25 mnt' },
  { src: '/recipe-bread.png', title: 'Traditional Sourdough', tag: 'Roti',        rating: '5.0', time: '3 jam'  },
];

export default function HeroSection({ stats, recipes }: { stats?: any; recipes?: any[] }) {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Wait for the loader's 3.5s delay to finish before triggering animations
    const timer = setTimeout(() => setAppReady(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const displayCards = recipes && recipes.length > 0
    ? recipes.slice(0, 4).map(r => ({
      id: r.id,
      src: r.imageUrl || '/recipe-salad.png', // Fallback to placeholder if no image
      title: r.title,
      tag: r.category || 'Resep',
      rating: r.rating ? Number(r.rating).toFixed(1) : '4.5', // Mock rating if none
      time: r.cookTime || '15 mnt'
    }))
    : DUMMY_RECIPE_CARDS;

  const totalRecipes = stats?.totalRecipes || 2400;
  // If we don't have satisfaction score, we'll use a high default like 98%
  const satisfaction = 98;
  const totalUsers = stats?.totalUsers || 12400;

  const penggunaVal = totalUsers >= 1000 ? parseFloat((totalUsers / 1000).toFixed(1)) : totalUsers;
  const penggunaUnit = totalUsers >= 1000 ? 'k' : '';

  return (
    <section className={styles.hero} aria-label="Hero section">

      {/* ── Background image ──────────────────── */}
      <div className={styles.bgWrap} aria-hidden="true">
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.bgImg}
        />
        <div className={styles.overlay} />
      </div>

      {/* ── Split layout ──────────────────────── */}
      <div className={styles.grid}>

        {/* LEFT – text + search ─────────────── */}
        <div className={styles.content}>
          <h1 className={styles.headline} id="hero-headline">
            <BlurText
              text="Kuliner Nusantara, Mudah & Lezat"
              delay={120}
              animateBy="words"
              direction="top"
              stepDuration={0.4}
              className={styles.headlineBlur}
              startWhen={appReady}
            />
          </h1>
          <div id="hero-subline">
            <BlurText
              text="Temukan resep autentik yang merayakan bahan-bahan segar dan persiapan penuh kasih sayang."
              delay={80}
              animateBy="words"
              direction="bottom"
              stepDuration={0.3}
              className={styles.sublineBlur}
              startWhen={appReady}
            />
          </div>

          {/* Search */}
          <div className={styles.searchBar} role="search" id="hero-search">
            <div className={styles.searchInputWrap}>
              <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Mau masak apa hari ini?"
                aria-label="Cari resep"
                id="hero-search-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.currentTarget.value;
                    if (query.trim()) window.location.href = `/kategori?search=${encodeURIComponent(query)}`;
                  }
                }}
              />
            </div>
            <button
              className={styles.searchBtn}
              id="hero-search-btn"
              onClick={() => {
                const input = document.getElementById('hero-search-input') as HTMLInputElement;
                const query = input?.value;
                if (query?.trim()) window.location.href = `/kategori?search=${encodeURIComponent(query)}`;
              }}
            >
              Cari Resep
            </button>
          </div>

          {/* Quick stats */}
          <div className={styles.stats} aria-label="Statistik resep">
            <div className={styles.statItem}>
              <span className={styles.statNum}>
                <CountUp from={0} to={totalRecipes} separator="." duration={2} className={styles.statCountUp} startWhen={appReady} onStart={undefined} onEnd={undefined} />
                <span>+</span>
              </span>
              <span className={styles.statLabel}>Resep</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>
                <CountUp from={0} to={satisfaction} duration={1.5} className={styles.statCountUp} startWhen={appReady} onStart={undefined} onEnd={undefined} />
                <span>%</span>
              </span>
              <span className={styles.statLabel}>Kepuasan</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>
                <CountUp from={0} to={penggunaVal} duration={2} className={styles.statCountUp} startWhen={appReady} onStart={undefined} onEnd={undefined} />
                <span>{penggunaUnit}</span>
              </span>
              <span className={styles.statLabel}>Pengguna</span>
            </div>
          </div>
        </div>

        {/* RIGHT – CardSwap ─────────────────── */}
        <div className={styles.cardSwapArea} aria-hidden="true">
          <CardSwap
            width={400}
            height={490}
            cardDistance={55}
            verticalDistance={65}
            delay={4000}
            pauseOnHover
            skewAmount={5}
            easing="elastic"
            startWhen={appReady}
            onCardClick={(idx) => {
              const clickedCard = displayCards[idx];
              if (clickedCard && clickedCard.id) {
                window.location.href = `/recipe/${clickedCard.id}`;
              }
            }}
          >
            {displayCards.map((r) => (
              <Card key={r.src + r.title} customClass={styles.recipeCard}>
                <div className={styles.cardImgWrap}>
                  <Image src={r.src} alt={r.title} fill sizes="400px" className={styles.cardImg} />
                  <div className={styles.cardGradient} />
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.cardTag}>{r.tag}</span>
                  <h3 className={styles.cardTitle}>{r.title}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardRating}>
                      {/* star icon */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#4ade80" aria-hidden="true">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                      {r.rating}
                    </span>
                    <span className={styles.cardTime}>
                      {/* clock icon */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
                      </svg>
                      {r.time}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>

      </div>
    </section>
  );
}
