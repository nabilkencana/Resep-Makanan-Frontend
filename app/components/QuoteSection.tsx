'use client';
import dynamic from 'next/dynamic';
import styles from './QuoteSection.module.css';

const ScrollReveal = dynamic(() => import('./ScrollReveal'), { ssr: false });

export default function QuoteSection() {
  return (
    <section className={styles.section} id="quote" aria-label="Filosofi dapur">
      <div className={styles.inner}>
        {/* Decorative label */}
        <span className={styles.label}>Filosofi Kami</span>

        <ScrollReveal
          baseOpacity={0}
          enableBlur={true}
          baseRotation={0}
          blurStrength={8}
          containerClassName={styles.revealContainer}
          textClassName={styles.revealText}
          wordAnimationEnd="top 20%"
        >
          Masakan yang baik lahir dari bahan segar, tangan penuh kasih, dan cerita yang ingin kamu bagikan kepada orang-orang yang kamu cintai.
        </ScrollReveal>

        {/* Attribution */}
        <p className={styles.attribution}>— Dapur Nusantara</p>
      </div>
    </section>
  );
}
