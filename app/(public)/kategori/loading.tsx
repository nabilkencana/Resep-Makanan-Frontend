import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      {/* ── Hero Skeleton ── */}
      <div className={`${styles.hero} ${styles.skeleton}`}></div>

      {/* ── Body Layout Skeleton ── */}
      <section className={styles.body}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '2rem' }}>
          <div className={`${styles.skeleton}`} style={{ height: '40px', width: '100px', borderRadius: '20px', flexShrink: 0 }}></div>
          <div className={`${styles.skeleton}`} style={{ height: '40px', width: '120px', borderRadius: '20px', flexShrink: 0 }}></div>
          <div className={`${styles.skeleton}`} style={{ height: '40px', width: '140px', borderRadius: '20px', flexShrink: 0 }}></div>
          <div className={`${styles.skeleton}`} style={{ height: '40px', width: '90px', borderRadius: '20px', flexShrink: 0 }}></div>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.skeleton}`}></div>
          <div className={`${styles.card} ${styles.skeleton}`}></div>
          <div className={`${styles.card} ${styles.skeleton}`}></div>
          <div className={`${styles.card} ${styles.skeleton}`}></div>
          <div className={`${styles.card} ${styles.skeleton}`}></div>
          <div className={`${styles.card} ${styles.skeleton}`}></div>
          <div className={`${styles.card} ${styles.skeleton}`}></div>
          <div className={`${styles.card} ${styles.skeleton}`}></div>
        </div>
      </section>
    </div>
  );
}
