'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Play, Lock, Hourglass, CheckCircle, ShoppingCart, Info, Video, Upload, X, Copy, Check } from 'lucide-react';
import { publicFetch, api } from '@/lib/api';
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
  const [fetchFailed, setFetchFailed] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'QRIS'>('BANK');
  const [showQrModal, setShowQrModal] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('8905273391');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsLoggedIn(!!token);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Fetch all tutorials, find the one for this recipe
    publicFetch('/tutorials', { signal: controller.signal })
      .then((res) => {
        const matched = (res.tutorials || []).find((t: Tutorial) => {
          return String((t as any).recipeId) === String(recipeId);
        });
        if (matched && matched.isPublished) setTutorial(matched);
      })
      .catch((err) => {
        console.warn('Error fetching tutorials:', err);
        setFetchFailed(true);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [recipeId]);

  // Fetch user's transactions to know if they have a pending/success for this tutorial
  useEffect(() => {
    if (!isLoggedIn) return;
    api.getMyTransactions()
      .then((res) => setMyTransactions(res.transactions || []))
      .catch(() => {});
  }, [isLoggedIn]);

  if (loading) return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <PlayCircle size={24} color="#ffffff" />
          </div>
          <div>
            <h2 className={styles.title}>Video Tutorial</h2>
            <p className={styles.subtitle}>Memuat data tutorial...</p>
          </div>
        </div>
      </div>
    </section>
  );

  if (fetchFailed) return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <PlayCircle size={24} color="#ffffff" />
          </div>
          <div>
            <h2 className={styles.title}>Video Tutorial</h2>
            <p className={styles.subtitle}>Tutorial belum tersedia.</p>
          </div>
        </div>
      </div>
    </section>
  );

  if (!tutorial) return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <PlayCircle size={24} color="#ffffff" />
          </div>
          <div>
            <h2 className={styles.title}>Video Tutorial</h2>
            <p className={styles.subtitle}>Pelajari langkah demi langkah bersama chef</p>
          </div>
        </div>
      </div>

      <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', background: '#f9f9fb', border: '1px dashed #bccabb', boxShadow: 'none' }}>
        <Video size={48} color="#bccabb" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', color: '#1a1c1d', marginBottom: '0.5rem' }}>Video Belum Tersedia</h3>
        <p style={{ color: '#6d7b6d', fontSize: '0.95rem', maxWidth: '400px' }}>
          Saat ini belum ada video tutorial untuk resep ini. Silakan ikuti panduan langkah demi langkah di tab Informasi Resep.
        </p>
      </div>
    </section>
  );

  const isFree = tutorial.price === 0;
  const hasAccess = isLoggedIn && (isFree || myTransactions.some((tx) => tx.tutorialId === tutorial.id && tx.status === 'SUCCESS'));
  const isPendingTx = !hasAccess && myTransactions.some((tx) => tx.tutorialId === tutorial.id && tx.status === 'PENDING');
  const hasAnyTx = myTransactions.some((tx) => tx.tutorialId === tutorial.id);


  const handleBuy = async () => {
    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }
    
    if (!isFree && !paymentProofFile) {
      setBuyError('Harap unggah bukti pembayaran terlebih dahulu.');
      return;
    }
    
    setBuying(true);
    setBuyError('');
    try {
      const formData = new FormData();
      if (paymentProofFile) {
        formData.append('paymentProof', paymentProofFile);
      }
      
      await api.createTransaction(tutorial.id, formData);
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
            <PlayCircle size={24} color="#ffffff" />
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
            <Image
              src={tutorial.thumbnailUrl || tutorial.recipe?.imageUrl || ''}
              alt={tutorial.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className={styles.thumbImg}
            />
          ) : (
            <div className={styles.thumbPlaceholder}>
              <Video size={56} color="rgba(255,255,255,0.4)" />
            </div>
          )}

          {/* Overlay with lock/play indicator */}
          <div className={styles.thumbOverlay}>
            {hasAccess ? (
              <button className={styles.overlayPlayBtn} onClick={handleWatch} title="Tonton">
                <Play fill="currentColor" size={30} style={{ marginLeft: 3 }} />
              </button>
            ) : (
              <div className={styles.overlayLockBadge}>
                <Lock size={32} color="#fbbf24" />
                {!isFree && <span>{formatPrice(tutorial.price)}</span>}
              </div>
            )}
          </div>

          {/* Duration badge */}
          {tutorial.duration > 0 && (
            <span className={styles.durationBadge}>{formatDuration(tutorial.duration)}</span>
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
                <PlayCircle size={20} />
                Tonton Sekarang
              </button>
            )}

            {/* ── Pending transaction → Waiting for admin ── */}
            {!hasAccess && isPendingTx && !buySuccess && (
              <div className={styles.pendingBox}>
                <div className={styles.pendingIcon}>
                  <Hourglass size={20} color="#d97706" />
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
                <CheckCircle size={24} color="#16a34a" />
                <div>
                  <p className={styles.successTitle}>Transaksi Berhasil Dibuat!</p>
                  <p className={styles.successDesc}>Admin akan memverifikasi pembayaran kamu. Pantau status di halaman profil.</p>
                </div>
              </div>
            )}

            {/* ── Not logged in ── */}
            {!isLoggedIn && (
              <div className={styles.loginPrompt}>
                <Lock size={22} color="var(--clr-primary)" />
                <div>
                  <p className={styles.loginTitle}>
                    {isFree ? 'Masuk untuk menonton tutorial ini' : 'Masuk untuk membeli tutorial ini'}
                  </p>
                  <Link href="/auth" className={styles.loginLink} prefetch={false}>
                    Masuk / Daftar Sekarang →
                  </Link>
                </div>
              </div>
            )}



            {/* ── Logged in, no transaction yet → Buy button ── */}
            {isLoggedIn && !isFree && !hasAnyTx && !buySuccess && (
              <>
                <div className={styles.methodTabs}>
                  <button 
                    type="button" 
                    className={`${styles.methodTab} ${paymentMethod === 'BANK' ? styles.methodTabActive : ''}`}
                    onClick={() => setPaymentMethod('BANK')}
                  >
                    Transfer BCA
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.methodTab} ${paymentMethod === 'QRIS' ? styles.methodTabActive : ''}`}
                    onClick={() => setPaymentMethod('QRIS')}
                  >
                    QRIS Code
                  </button>
                </div>

                {paymentMethod === 'BANK' ? (
                  <div className={styles.bankAccountCard}>
                    <div className={styles.bankHeader}>
                      <span className={styles.bankBadge}>BCA</span>
                      <span className={styles.bankName}>Bank Central Asia</span>
                    </div>
                    <div className={styles.bankDetails}>
                      <div className={styles.bankRow}>
                        <span className={styles.bankRowLabel}>Nomor Rekening:</span>
                        <span className={styles.bankRowVal}>
                          8905 2733 91
                          <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={handleCopyAccount}
                            title="Salin Nomor Rekening"
                          >
                            {copied ? (
                              <>
                                <Check size={12} color="#16a34a" />
                                <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: 600 }}>Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span style={{ fontSize: '11px', fontWeight: 600 }}>Salin</span>
                              </>
                            )}
                          </button>
                        </span>
                      </div>
                      <div className={styles.bankRow}>
                        <span className={styles.bankRowLabel}>Nama Penerima:</span>
                        <span className={styles.bankRowVal}>Dapur Nusantara</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.qrisCard}>
                    <div className={styles.qrisHeader}>
                      <span className={styles.qrisBadge}>QRIS</span>
                      <span className={styles.qrisName}>Pindai atau Klik untuk Memperbesar</span>
                    </div>
                    <div className={styles.qrisQrWrapper} onClick={() => setShowQrModal(true)}>
                      <img src="/csan-qr-a.jpg" alt="QRIS Code" className={styles.qrisImage} />
                    </div>
                    <p className={styles.qrisNote}>Mendukung GoPay, OVO, Dana, LinkAja, & Mobile Banking</p>
                  </div>
                )}

                <div className={styles.uploadSection}>
                  <p className={styles.uploadLabel}>Bukti Pembayaran</p>
                  {paymentProofPreview ? (
                    <div className={styles.previewBox}>
                      <img src={paymentProofPreview} alt="Bukti Pembayaran" className={styles.previewImg} />
                      <button 
                        className={styles.removeImgBtn}
                        onClick={() => {
                          setPaymentProofFile(null);
                          setPaymentProofPreview('');
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadBox}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPaymentProofFile(file);
                            setPaymentProofPreview(URL.createObjectURL(file));
                            setBuyError('');
                          }
                        }} 
                        style={{ display: 'none' }} 
                      />
                      <Upload size={24} color="#6d7b6d" />
                      <span>Unggah Bukti Transfer</span>
                    </label>
                  )}
                </div>

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
                      <ShoppingCart size={20} />
                      Beli Tutorial – {formatPrice(tutorial.price)}
                    </>
                  )}
                </button>
                <p className={styles.buyNote}>
                  <Info size={14} />
                  Setelah transaksi dibuat, admin akan memverifikasi pembayaran Anda
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {showQrModal && (
        <div className={styles.modalOverlay} onClick={() => setShowQrModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Scan QRIS Pembayaran</h3>
              <button className={styles.closeBtn} onClick={() => setShowQrModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <img src="/csan-qr-a.jpg" alt="QRIS Code Full" className={styles.modalQrImage} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
