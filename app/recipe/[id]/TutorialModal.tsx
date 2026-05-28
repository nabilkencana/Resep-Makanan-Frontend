'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import styles from './TutorialModal.module.css';
import { fetchApi } from '@/lib/api';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialId: number;
  videoUrl: string | null;
  price: number;
  isLoggedIn: boolean;
  status: 'unauthorized' | 'premium_locked' | 'video_ready' | 'pending_transaction';
}

export default function TutorialModal({
  isOpen,
  onClose,
  tutorialId,
  videoUrl,
  price,
  isLoggedIn,
  status: initialStatus,
}: TutorialModalProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleBuy = async () => {
    setLoading(true);
    setError('');
    try {
      await fetchApi(`/transactions/${tutorialId}`, {
        method: 'POST',
      });
      setStatus('pending_transaction');
    } catch (err: any) {
      setError(err.message || 'Gagal membuat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {status === 'video_ready' ? 'Video Tutorial' : 'Akses Tutorial Video'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Tutup">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {status === 'unauthorized' && (
            <>
              <div className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <p className={styles.message}>
                Anda harus masuk (login) terlebih dahulu untuk mengakses video tutorial ini.
              </p>
              <Link href="/auth" className={styles.loginBtn}>
                Masuk Sekarang
              </Link>
            </>
          )}

          {status === 'premium_locked' && (
            <>
              <div className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <p className={styles.message}>
                Video tutorial ini adalah konten premium. Beli akses sekarang untuk memutar video panduan memasak selangkah demi selangkah.
              </p>
              <div className={styles.priceBox}>
                <div className={styles.priceLabel}>Harga Akses</div>
                <div className={styles.priceAmount}>
                  Rp {price.toLocaleString('id-ID')}
                </div>
              </div>
              {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
              <button 
                className={styles.actionBtn} 
                onClick={handleBuy}
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Beli Akses Video'}
              </button>
            </>
          )}

          {status === 'pending_transaction' && (
            <>
              <div className={styles.icon} style={{ color: '#059669', background: '#d1fae5' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p className={styles.message}>
                Transaksi berhasil dibuat! Silakan selesaikan pembayaran Anda di halaman Profil untuk mulai menonton.
              </p>
              <Link href="/profile" className={styles.actionBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>
                Lihat Tagihan Saya
              </Link>
            </>
          )}

          {status === 'video_ready' && videoUrl && (
            <div className={styles.videoContainer}>
              <iframe 
                src={videoUrl}
                className={styles.videoPlayer}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
