'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import styles from '../../admin.module.css';
import txStyles from './transactions.module.css';

interface Transaction {
  id: number;
  userId: number;
  tutorialId: number;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  tutorial: {
    id: number;
    title: string;
    price: number;
    recipe?: {
      title: string;
      imageUrl?: string;
    };
  };
  paymentProof: string | null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_CONFIG = {
  PENDING: { label: 'Menunggu', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: 'hourglass_empty' },
  SUCCESS: { label: 'Terverifikasi', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: 'check_circle' },
  FAILED:  { label: 'Gagal', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: 'cancel' },
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED'>('ALL');
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await api.getAllTransactions();
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleVerify = async (txId: number) => {
    setVerifying(txId);
    try {
      await api.verifyTransaction(txId);
      // Refresh list
      await fetchTransactions();
    } catch (err: any) {
      alert('Gagal verifikasi: ' + (err.message || 'Error tidak diketahui'));
    } finally {
      setVerifying(null);
    }
  };

  const filtered = transactions.filter((tx) => {
    if (filter !== 'ALL' && tx.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tx.tutorial?.title?.toLowerCase().includes(q) ||
        String(tx.id).includes(q) ||
        String(tx.userId).includes(q)
      );
    }
    return true;
  });

  const counts = {
    ALL: transactions.length,
    PENDING: transactions.filter((t) => t.status === 'PENDING').length,
    SUCCESS: transactions.filter((t) => t.status === 'SUCCESS').length,
    FAILED: transactions.filter((t) => t.status === 'FAILED').length,
  };

  const totalRevenue = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={styles.pageContent}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Transaksi</h1>
          <p className={styles.pageSubtitle}>Kelola dan verifikasi pembayaran tutorial</p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className={txStyles.statsRow}>
        <div className={txStyles.statCard}>
          <div className={txStyles.statIcon} style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>
            <span className="material-symbols-outlined">hourglass_empty</span>
          </div>
          <div>
            <div className={txStyles.statNum}>{counts.PENDING}</div>
            <div className={txStyles.statLabel}>Menunggu Verifikasi</div>
          </div>
        </div>
        <div className={txStyles.statCard}>
          <div className={txStyles.statIcon} style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <div className={txStyles.statNum}>{counts.SUCCESS}</div>
            <div className={txStyles.statLabel}>Terverifikasi</div>
          </div>
        </div>
        <div className={txStyles.statCard}>
          <div className={txStyles.statIcon} style={{ background: 'rgba(0,109,54,0.1)', color: 'var(--clr-primary)' }}>
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <div className={txStyles.statNum} style={{ fontSize: '1rem' }}>{formatPrice(totalRevenue)}</div>
            <div className={txStyles.statLabel}>Total Pendapatan</div>
          </div>
        </div>
        <div className={txStyles.statCard}>
          <div className={txStyles.statIcon} style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <div className={txStyles.statNum}>{counts.ALL}</div>
            <div className={txStyles.statLabel}>Total Transaksi</div>
          </div>
        </div>
      </div>

      {/* ── Filter + Search ── */}
      <div className={txStyles.filterBar}>
        <div className={txStyles.filterTabs}>
          {(['ALL', 'PENDING', 'SUCCESS', 'FAILED'] as const).map((f) => (
            <button
              key={f}
              className={`${txStyles.filterTab} ${filter === f ? txStyles.filterTabActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'Semua' : STATUS_CONFIG[f].label}
              <span className={txStyles.filterCount}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className={txStyles.searchWrap}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--clr-outline)' }}>search</span>
          <input
            className={txStyles.searchInput}
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className={txStyles.tableCard}>
        {loading ? (
          <div className={txStyles.loadingState}>
            <div className={txStyles.spinner} />
            <span>Memuat transaksi...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={txStyles.emptyState}>
            <span className="material-symbols-outlined">receipt_long</span>
            <p>{search || filter !== 'ALL' ? 'Tidak ada transaksi yang cocok.' : 'Belum ada transaksi.'}</p>
          </div>
        ) : (
          <table className={txStyles.table}>
            <thead>
              <tr className={txStyles.tableHead}>
                <th>ID</th>
                <th>Tutorial</th>
                <th>User ID</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const cfg = STATUS_CONFIG[tx.status];
                return (
                  <tr key={tx.id} className={txStyles.tableRow}>
                    {/* ID */}
                    <td className={txStyles.tdId}>#{tx.id}</td>

                    {/* Tutorial */}
                    <td className={txStyles.tdTutorial}>
                      <div className={txStyles.tutorialCell}>
                        {tx.tutorial?.recipe?.imageUrl && (
                          <img
                            src={tx.tutorial.recipe.imageUrl}
                            alt=""
                            className={txStyles.tutorialThumb}
                          />
                        )}
                        <div>
                          <div className={txStyles.tutorialName}>{tx.tutorial?.title || '—'}</div>
                          {tx.tutorial?.recipe?.title && (
                            <div className={txStyles.tutorialRecipe}>{tx.tutorial.recipe.title}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* User */}
                    <td className={txStyles.tdUser}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className={txStyles.userId}>
                          {(tx as any).user?.username || `User #${tx.userId}`}
                        </span>
                        {(tx as any).user?.email && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--clr-outline)' }}>
                            {(tx as any).user.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className={txStyles.tdAmount}>
                      <span className={txStyles.amount}>{formatPrice(tx.amount)}</span>
                    </td>

                    {/* Status */}
                    <td className={txStyles.tdStatus}>
                      <span
                        className={txStyles.statusBadge}
                        style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                          {cfg.icon}
                        </span>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className={txStyles.tdDate}>{formatDate(tx.createdAt)}</td>

                    {/* Action */}
                    <td className={txStyles.tdAction}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                        {tx.paymentProof && (
                          <button
                            className={txStyles.viewProofBtn}
                            onClick={() => setPreviewImage(tx.paymentProof)}
                            title="Lihat Bukti Pembayaran"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>image</span>
                            Bukti
                          </button>
                        )}
                        {tx.status === 'PENDING' ? (
                          <button
                            className={txStyles.verifyBtn}
                            onClick={() => handleVerify(tx.id)}
                            disabled={verifying === tx.id}
                          >
                            {verifying === tx.id ? (
                              <><div className={txStyles.spinner} style={{ width: '14px', height: '14px', borderWidth: '2px' }} />Memverifikasi...</>
                            ) : (
                              <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>Verifikasi</>
                            )}
                          </button>
                        ) : (
                          <span className={txStyles.actionDone}>
                            {tx.status === 'SUCCESS' ? '✓ Selesai' : '✗ Gagal'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Image Preview Modal ── */}
      {previewImage && (
        <div className={txStyles.modalOverlay} onClick={() => setPreviewImage(null)}>
          <div className={txStyles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={txStyles.modalHeader}>
              <h3>Bukti Pembayaran</h3>
              <button className={txStyles.closeBtn} onClick={() => setPreviewImage(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={txStyles.modalBody}>
              <img src={previewImage} alt="Bukti Pembayaran" className={txStyles.previewImgFull} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
