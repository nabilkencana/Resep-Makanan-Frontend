'use client';

import styles from '../admin.module.css';

export default function AdminLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <div style={{ height: '32px', width: '200px', background: '#e2e8f0', borderRadius: '8px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%)' }}></div>
          <div style={{ height: '16px', width: '300px', background: '#e2e8f0', borderRadius: '4px', marginTop: '8px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%)' }}></div>
        </div>
        <div className={styles.headerActions}>
          <div style={{ height: '36px', width: '140px', background: '#e2e8f0', borderRadius: '12px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%)' }}></div>
          <div style={{ height: '36px', width: '140px', background: '#e2e8f0', borderRadius: '12px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%)' }}></div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.metricCard} style={{ minHeight: '130px' }}>
             <div style={{ height: '100%', width: '100%', background: '#f8fafc', borderRadius: '12px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
          </div>
        ))}
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.chartArea} style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
           <div style={{ height: '280px', width: '100%', background: '#f8fafc', borderRadius: '16px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
        </div>

        <div className={styles.featuredArea}>
          <div className={styles.featuredCard} style={{ minHeight: '400px' }}>
             <div style={{ height: '160px', width: '100%', background: '#e2e8f0', borderRadius: '12px', marginBottom: '16px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
             <div style={{ height: '20px', width: '60%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '12px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
             <div style={{ height: '16px', width: '100%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
             <div style={{ height: '16px', width: '80%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
             <div style={{ height: '40px', width: '100%', background: '#e2e8f0', borderRadius: '8px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
          </div>
        </div>

        <div className={styles.tableArea}>
           <div style={{ height: '400px', width: '100%', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
             <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
               <div style={{ height: '24px', width: '200px', background: '#f1f5f9', borderRadius: '4px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
             </div>
             <div style={{ padding: '16px 24px' }}>
               {[...Array(5)].map((_, i) => (
                 <div key={i} style={{ height: '48px', width: '100%', background: '#f8fafc', borderRadius: '8px', marginBottom: '12px', animation: 'shimmer 1.5s infinite', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)' }}></div>
               ))}
             </div>
           </div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </div>
  );
}
