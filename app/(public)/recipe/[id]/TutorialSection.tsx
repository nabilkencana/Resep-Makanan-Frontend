'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi, api } from '@/lib/api';
import styles from './TutorialSection.module.css';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  price: number;
  isPublished: boolean;
  recipe?: {
    isPremium: boolean;
    imageUrl?: string;
  };
}

interface Transaction {
  id: number;
  tutorialId: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

function formatPrice(price: number) {
  if (price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDuration(minutes: number) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}j ${m}m`;
  return `${m} menit`;
}

export default function TutorialSection({ recipeId }: { recipeId: number }) {
  const router = useRouter();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [buying, setBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsLoggedIn(!!token);

    // Fetch all tutorials, find the one for this recipe
    fetchApi('/tutorials')
      .then((res) => {
        const matched = (res.tutorials || []).find((t: Tutorial) => {
          return String((t as any).recipeId) === String(recipeId);
        });
        if (matched && matched.isPublished) setTutorial(matched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [recipeId]);

  // Fetch user's transactions to know if they have a pending/success for this tutorial
  useEffect(() => {
    if (!isLoggedIn) return;
    api.getMyTransactions()
      .then((res) => setMyTransactions(res.transactions || []))
      .catch(() => {});
  }, [isLoggedIn]);

  if (loading || !tutorial) return null;

  const isFree = tutorial.price === 0;
  const hasAccess = isFree || myTransactions.some((tx) => tx.tutorialId === tutorial.id && tx.status === 'SUCCESS');
  const isPendingTx = !hasAccess && myTransactions.some((tx) => tx.tutorialId === tutorial.id && tx.status === 'PENDING');
  const hasAnyTx = myTransactions.some((tx) => tx.tutorialId === tutorial.id);

  const handleBuy = async () => {
    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }
    setBuying(true);
    setBuyError('');
    try {
      await api.createTransaction(tutorial.id);
      setBuySuccess(true);
      // Refresh transactions
      const res = await api.getMyTransactions();
      setMyTransactions(res.transactions || []);
    } catch (err: any) {
      setBuyError(err.message || 'Gagal membuat transaksi.');
    } finally {
      setBuying(false);
    }
  };

  const handleWatch = () => {
    router.push(`/tutorials/${tutorial.id}`);
  };

  return (
    <section className={styles.section}>
      {/* Section header */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <span className="material-symbols-outlined">play_circle</span>
          </div>
          <div>
            <h2 className={styles.title}>Video Tutorial</h2>
            <p className={styles.subtitle}>Pelajari langkah demi langkah bersama chef</p>
          </div>
        </div>
      </div>

      {/* Tutorial card */}
      <div className={styles.card}>
        {/* Thumbnail / Preview */}
        <div className={styles.thumbWrap}>
          {tutorial.thumbnailUrl || tutorial.recipe?.imageUrl ? (
            <img
              src={tutorial.thumbnailUrl || tutorial.recipe?.imageUrl || ''}
              alt={tutorial.title}
              className={styles.thumbImg}
            />
          ) : (
            <div className={styles.thumbPlaceholder}>
              <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'rgba(255,255,255,0.4)' }}>movie</span>
            </div>
          )}

          {/* Overlay with lock/play indicator */}
          <div className={styles.thumbOverlay}>
            {hasAccess ? (
              <button className={styles.overlayPlayBtn} onClick={handleWatch} title="Tonton">
                <span className="material-symbols-outlined">play_arrow</span>
              </button>
            ) : (
              <div className={styles.overlayLockBadge}>
                <span className="material-symbols-outlined">lock</span>
                {!isFree && <span>{formatPrice(tutorial.price)}</span>}
              </div>
            )}
          </div>

          {/* Duration badge */}
          {tutorial.duration > 0 && (
            <span className={styles.durationBadge}>{formatDuration(tutorial.duration)}</span>
          )}

          {/* Premium badge */}
          {!isFree && (
            <span className={styles.premiumBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>star</span>
              Premium
            </span>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <h3 className={styles.tutorialTitle}>{tutorial.title}</h3>
          <p className={styles.tutorialDesc}>{tutorial.description}</p>

          {/* Price row */}
          <div className={styles.priceRow}>
            {isFree ? (
              <span className={styles.priceFree}>🎉 Gratis untuk semua</span>
            ) : (
              <div>
                <span className={styles.priceLabel}>Harga tutorial</span>
                <span className={styles.priceValue}>{formatPrice(tutorial.price)}</span>
              </div>
            )}
          </div>

          {/* Action area */}
          <div className={styles.actions}>
            {/* ── User has access → Watch button ── */}
            {hasAccess && (
              <button className={styles.watchBtn} onClick={handleWatch}>
                <span className="material-symbols-outlined">play_circle</span>
                Tonton Sekarang
              </button>
            )}

            {/* ── Pending transaction → Waiting for admin ── */}
            {!hasAccess && isPendingTx && !buySuccess && (
              <div className={styles.pendingBox}>
                <div className={styles.pendingIcon}>
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
                <div>
                  <p className={styles.pendingTitle}>Menunggu Verifikasi Admin</p>
                  <p className={styles.pendingDesc}>
                    Transaksi kamu sedang diproses. Admin akan segera memverifikasi pembayaran.
                  </p>
                </div>
              </div>
            )}

            {/* ── Buy success (just bought) ── */}
            {buySuccess && !hasAccess && (
              <div className={styles.successBox}>
                <span className="material-symbols-outlined">check_circle</span>
                <div>
                  <p className={styles.successTitle}>Transaksi Berhasil Dibuat!</p>
                  <p className={styles.successDesc}>Admin akan memverifikasi pembayaran kamu. Pantau status di halaman profil.</p>
                </div>
              </div>
            )}

            {/* ── Not logged in ── */}
            {!isLoggedIn && !isFree && (
              <div className={styles.loginPrompt}>
                <span className="material-symbols-outlined">lock</span>
                <div>
                  <p className={styles.loginTitle}>Masuk untuk membeli tutorial ini</p>
                  <Link href="/auth" className={styles.loginLink}>
                    Masuk / Daftar Sekarang →
                  </Link>
                </div>
              </div>
            )}

            {/* ── Free, not logged in → redirect to watch page ── */}
            {!isLoggedIn && isFree && (
              <Link href={`/tutorials/${tutorial.id}`} className={styles.watchBtn}>
                <span className="material-symbols-outlined">play_circle</span>
                Tonton Sekarang
              </Link>
            )}

            {/* ── Logged in, no transaction yet → Buy button ── */}
            {isLoggedIn && !isFree && !hasAnyTx && !buySuccess && (
              <>
                {buyError && (
                  <p className={styles.buyError}>{buyError}</p>
                )}
                <button
                  className={styles.buyBtn}
                  onClick={handleBuy}
                  disabled={buying}
                >
                  {buying ? (
                    <>
                      <span className={styles.spinner} />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">shopping_cart</span>
                      Beli Tutorial – {formatPrice(tutorial.price)}
                    </>
                  )}
                </button>
                <p className={styles.buyNote}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                  Setelah transaksi dibuat, admin akan memverifikasi pembayaran Anda
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
