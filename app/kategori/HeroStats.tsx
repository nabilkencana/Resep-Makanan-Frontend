'use client';
import CountUp from '../components/CountUp';
import styles from './page.module.css';

export default function HeroStats({ totalCategories }: { totalCategories: number }) {
  return (
    <div className={styles.heroStats}>
      <div className={styles.heroStat}>
        <span className={styles.heroStatNum}>
          <CountUp from={0} to={totalCategories} duration={1.5} className={styles.heroStatCountUp} onStart={undefined} onEnd={undefined} />
        </span>
        <span className={styles.heroStatLabel}>Kategori</span>
      </div>
      <div className={styles.heroStat}>
        <span className={styles.heroStatNum}>
          <CountUp from={0} to={228} duration={2} className={styles.heroStatCountUp} onStart={undefined} onEnd={undefined} />
          <span>+</span>
        </span>
        <span className={styles.heroStatLabel}>Resep</span>
      </div>
      <div className={styles.heroStat}>
        <span className={styles.heroStatNum}>
          <CountUp from={0} to={4.9} duration={2} className={styles.heroStatCountUp} onStart={undefined} onEnd={undefined} />
          <span>★</span>
        </span>
        <span className={styles.heroStatLabel}>Rating Rata-Rata</span>
      </div>
    </div>
  );
}
