import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      {/* ── Hero Skeleton ── */}
      <div className={`${styles.hero} ${styles.skeleton}`}></div>

      {/* ── Floating Header Card Skeleton ── */}
      <section className={styles.headerCard}>
        <div className={styles.headerCardInner}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={`${styles.tagSkeleton} ${styles.skeleton}`}></div>
            <div className={`${styles.tagSkeleton} ${styles.skeleton}`}></div>
          </div>
          
          <div className={`${styles.titleSkeleton} ${styles.skeleton}`}></div>
          
          <div>
            <div className={`${styles.descSkeleton} ${styles.skeleton}`}></div>
            <div className={`${styles.descSkeletonShort} ${styles.skeleton}`}></div>
          </div>

          <div className={styles.metaRow}>
            <div className={`${styles.metaItem} ${styles.skeleton}`}></div>
            <div className={`${styles.metaItem} ${styles.skeleton}`}></div>
            <div className={`${styles.metaItem} ${styles.skeleton}`}></div>
            <div className={`${styles.metaItem} ${styles.skeleton}`}></div>
          </div>
        </div>
      </section>

      {/* ── Tabs Placeholder ── */}
      <div className={styles.body} style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e8e8ea', paddingBottom: '0.5rem', width: '100%' }}>
          <div className={`${styles.skeleton}`} style={{ height: '32px', width: '120px', borderRadius: '4px' }}></div>
          <div className={`${styles.skeleton}`} style={{ height: '32px', width: '100px', borderRadius: '4px' }}></div>
          <div className={`${styles.skeleton}`} style={{ height: '32px', width: '80px', borderRadius: '4px' }}></div>
        </div>
      </div>

      {/* ── Body Layout Skeleton ── */}
      <section className={styles.body} style={{ marginTop: '2rem' }}>
        {/* LEFT: Ingredients */}
        <aside className={styles.ingredientsCol}>
          <div className={`${styles.ingredientsCard} ${styles.skeleton}`}></div>
        </aside>

        {/* RIGHT: Steps */}
        <div className={styles.stepsCol}>
          <div className={`${styles.stepCard} ${styles.skeleton}`}></div>
          <div className={`${styles.stepCard} ${styles.skeleton}`}></div>
          <div className={`${styles.stepCard} ${styles.skeleton}`}></div>
        </div>
      </section>
    </div>
  );
}
