'use client';

import type { ComponentType } from 'react';
import SplitTextRaw from '../components/SplitText';
import styles from './page.module.css';

interface SplitTextProps {
  text: string;
  tag?: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: string;
  from?: object;
  to?: object;
  threshold?: number;
  rootMargin?: string;
  textAlign?: string;
  onLetterAnimationComplete?: () => void;
}

const SplitText = SplitTextRaw as ComponentType<SplitTextProps>;

export default function HeroSubtitle() {
  return (
    <SplitText
      text="Dari sarapan bergizi hingga makan malam spesial — temukan inspirasi memasak dari ribuan resep pilihan chef terbaik kami."
      tag="p"
      className={styles.heroSubtitle}
      delay={18}
      duration={0.8}
      ease="power3.out"
      splitType="words"
      from={{ opacity: 0, y: 24 }}
      to={{ opacity: 1, y: 0 }}
      threshold={0.1}
      rootMargin="0px"
      textAlign="left"
    />
  );
}
