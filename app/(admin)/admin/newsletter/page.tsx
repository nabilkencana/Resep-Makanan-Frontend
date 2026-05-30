'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import styles from './newsletter.module.css';

interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await api.getNewsletters();
      setSubscribers(res.subscribers || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data subscriber');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <nav className={styles.breadcrumb}>
          <Link href="/admin" className={styles.breadcrumbLink}>Dashboard</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          <span>Newsletter</span>
        </nav>
        <h2 className={styles.pageTitle}>Subscriber Newsletter</h2>
        <p className={styles.pageSubtitle}>
          {loading ? 'Memuat data...' : `Total ${subscribers.length} pengguna telah berlangganan.`}
        </p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span className="material-symbols-outlined">error_outline</span>
          {error}
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Daftar Email Pelanggan</h3>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Alamat Email</th>
                <th>Tanggal Berlangganan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className={styles.skeletonLine} style={{ width: '30px' }} /></td>
                    <td>
                      <div className={styles.emailCell}>
                        <div className={styles.skeletonLine} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        <div className={styles.skeletonLine} style={{ width: '150px' }} />
                      </div>
                    </td>
                    <td><div className={styles.skeletonLine} style={{ width: '120px' }} /></td>
                  </tr>
                ))
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className={styles.emptyState}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--clr-outline)' }}>mail</span>
                      <h3>Belum ada subscriber</h3>
                      <p>Pengguna yang mendaftar newsletter di halaman depan akan muncul di sini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className={styles.tableRow}>
                    <td style={{ color: 'var(--clr-on-surface-variant)' }}>#{sub.id}</td>
                    <td>
                      <div className={styles.emailCell}>
                        <div className={styles.emailIconWrapper}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>alternate_email</span>
                        </div>
                        <span className={styles.emailText}>{sub.email}</span>
                      </div>
                    </td>
                    <td className={styles.emailDate}>
                      {formatDate(sub.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
