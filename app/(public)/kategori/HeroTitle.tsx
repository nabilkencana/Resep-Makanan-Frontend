'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import styles from './page.module.css';

interface RotatingTextProps {
  texts: string[];
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  staggerFrom?: string | number;
  staggerDuration?: number;
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
  rotationInterval?: number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: string;
  animatePresenceMode?: string;
  animatePresenceInitial?: boolean;
  onNext?: (index: number) => void;
}

const RotatingText = dynamic(
  () => import('../../components/RotatingText') as any,
  { ssr: false }
) as ComponentType<RotatingTextProps>;

const ROTATE_TEXTS = [
  'Hari Ini?',
  'Makan Siang?',
  'Makan Malam?',
  'Sarapan?',
  'Cemilan?',
  'Dimasak?',
];

export default function HeroTitle() {
  return (
    <h1 className={styles.heroTitle}>
      Masak Apa{' '}
      <span className={styles.rotatingPill}>
        <RotatingText
          texts={ROTATE_TEXTS}
          splitLevelClassName={styles.rotatingTextSplit}
          staggerFrom="last"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-120%', opacity: 0 }}
          staggerDuration={0.025}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          rotationInterval={2500}
        />
      </span>
    </h1>
  );
}
