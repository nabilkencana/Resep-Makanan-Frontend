import styles from './page.module.css';

export default function ProfileLoading() {
  return (
    <main className={styles.main}>
      {/* Profile Header Skeleton */}
      <section className={styles.profileSection}>
        <div className={styles.container}>
          <div className={styles.profileHeader}>
            {/* Avatar skeleton */}
            <div className={`${styles.profileImageWrap} ${styles.skeletonAvatar}`} />

            <div className={styles.profileInfo}>
              <div className={styles.profileTitleRow}>
                <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonBtn}`} />
              </div>
              <div className={`${styles.skeletonLine} ${styles.skeletonBio}`} style={{ marginBottom: '0.5rem' }} />
              <div className={`${styles.skeletonLine} ${styles.skeletonBio}`} style={{ width: '60%', marginBottom: '2rem' }} />

              <div className={styles.profileStats}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.statItem}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonStatNum}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonStatLabel}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Skeleton */}
      <div className={styles.tabsWrapper}>
        <div className={styles.container}>
          <nav className={styles.tabsNav}>
            {[1, 2, 3].map(i => (
              <div key={i} className={`${styles.skeletonLine} ${styles.skeletonTab}`} />
            ))}
          </nav>
        </div>
      </div>

      {/* Content Skeleton */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={`${styles.skeletonLine} ${styles.skeletonContentTitle}`} style={{ marginBottom: '2rem' }} />
          <div className={styles.activityFeed}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.activityItem}>
                <div className={`${styles.skeletonAvatar} ${styles.skeletonIconCircle}`} />
                <div className={styles.activityCard} style={{ gap: '1rem' }}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonCardLabel}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonCardTitle}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonCardSub}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
