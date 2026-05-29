'use client';
import CountUp from '../../components/CountUp';
import styles from './page.module.css';

export default function HeroStats({ totalCategories, totalRecipes, avgRating }: { totalCategories: number, totalRecipes: number, avgRating: number }) {
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
          <CountUp from={0} to={totalRecipes} duration={2} className={styles.heroStatCountUp} onStart={undefined} onEnd={undefined} />
          <span>+</span>
        </span>
        <span className={styles.heroStatLabel}>Resep</span>
      </div>
      <div className={styles.heroStat}>
        <span className={styles.heroStatNum}>
          {/* @ts-ignore */}
          <CountUp from={0} to={avgRating} decimals={1} duration={2} className={styles.heroStatCountUp} onStart={undefined} onEnd={undefined} />
          <span>★</span>
        </span>
        <span className={styles.heroStatLabel}>Rating Rata-Rata</span>
      </div>
    </div>
  );
}
