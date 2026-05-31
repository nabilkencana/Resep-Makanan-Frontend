import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={`${styles.skeleton}`} style={{ height: '32px', width: '250px', marginBottom: '8px' }}></div>
          <div className={`${styles.skeleton}`} style={{ height: '20px', width: '400px' }}></div>
        </div>
        <div className={`${styles.skeleton}`} style={{ height: '40px', width: '180px', borderRadius: '12px' }}></div>
      </div>

      <div className={styles.content}>
        <div className={`${styles.planner} ${styles.skeleton}`}></div>
        <div className={`${styles.sidebar} ${styles.skeleton}`}></div>
      </div>
    </div>
  );
}
