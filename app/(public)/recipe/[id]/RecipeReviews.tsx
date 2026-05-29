'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './RecipeReviews.module.css';
import { fetchApi } from '@/lib/api';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
}

const HINTS = ['Buruk', 'Kurang memuaskan', 'Cukup', 'Bagus!', 'Luar biasa! 🔥'];

const AVATAR_COLORS = [
  '#006d36',
  '#1a1c1d',
  '#b45309',
  '#047857',
  '#4a5a4a',
  '#3d4a3e',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={s <= rating ? '#f59e0b' : '#e5e7eb'}
          />
        </svg>
      ))}
    </div>
  );
}

export default function RecipeReviews({ recipeId }: { recipeId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetchApi(`/recipes/${recipeId}/reviews`);
      if (res?.reviews) setReviews(res.reviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
    fetchReviews();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Pilih rating bintang dulu ya!'); return; }

    setSubmitting(true);
    setError('');
    try {
      await fetchApi(`/recipes/${recipeId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      setRating(0);
      setComment('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      fetchReviews();
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulasan.');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute avg + distribution
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const displayRating = hoverRating || rating;

  return (
    <section className={styles.reviewsSection}>

      {/* ── Header ── */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <h2 className={styles.title}>Ulasan &amp; Penilaian</h2>
            <p className={styles.titleCount}>{reviews.length} ulasan dari pengguna</p>
          </div>
        </div>
      </div>

      {/* ── Rating Summary ── */}
      {!loading && reviews.length > 0 && (
        <div className={styles.ratingSummary}>
          <div className={styles.avgRatingBlock}>
            <span className={styles.avgNumber}>{avgRating.toFixed(1)}</span>
            <StarDisplay rating={Math.round(avgRating)} size={18} />
            <span className={styles.avgLabel}>dari 5 bintang</span>
          </div>
          <div className={styles.ratingBars}>
            {distribution.map(({ star, count }) => (
              <div key={star} className={styles.ratingBarRow}>
                <span className={styles.ratingBarLabel}>
                  {star}
                  <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </span>
                <div className={styles.ratingBarTrack}>
                  <div
                    className={styles.ratingBarFill}
                    style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className={styles.ratingBarCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Two-column layout: list | form ── */}
      <div className={styles.reviewsLayout}>

        {/* LEFT: Reviews List */}
        <div className={styles.reviewsList}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonLine} style={{ width: '40%' }} />
                <div className={styles.skeletonLine} style={{ width: '80%' }} />
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
              </div>
            ))
          ) : reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyEmoji}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>Belum ada ulasan</h3>
              <p className={styles.emptySubtitle}>Jadilah yang pertama berbagi pengalaman memasak!</p>
            </div>
          ) : (
            reviews.map((rev, idx) => {
              const initial = (rev.user?.username || 'U')[0].toUpperCase();
              const avatarBg = getAvatarColor(rev.user?.username || 'U');
              return (
                <div
                  key={rev.id}
                  className={styles.reviewCard}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className={styles.reviewHeader}>
                    <div className={styles.avatar} style={{ background: avatarBg }}>
                      {initial}
                    </div>
                    <div className={styles.reviewMeta}>
                      <span className={styles.reviewerName}>{rev.user?.username || 'Pengguna'}</span>
                      <div className={styles.reviewFooter}>
                        <StarDisplay rating={rev.rating} size={13} />
                        <span className={styles.reviewDate}>
                          {new Date(rev.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={styles.ratingBadge}>
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="#d97706"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      {rev.rating}/5
                    </div>
                  </div>
                  {rev.comment && (
                    <p className={styles.reviewComment}>"{rev.comment}"</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: Write Review Form or Login Prompt */}
        {isLoggedIn ? (
          <div className={styles.formContainer}>
            <h3 className={styles.formTitle}>✍️ Tulis Ulasan Anda</h3>

            {success && (
              <div className={styles.successToast}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Ulasan berhasil dikirim, terima kasih!
              </div>
            )}

            {error && (
              <div className={styles.errorMsg}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.ratingInputGroup}>
                <label className={styles.ratingLabel}>Rating Anda</label>
                <div className={styles.starInputRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.starBtn} ${displayRating >= star ? styles.active : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${star} bintang`}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <span className={styles.ratingHint} style={{ color: displayRating > 0 ? '#f59e0b' : undefined }}>
                  {displayRating > 0 ? HINTS[displayRating - 1] : 'Arahkan kursor ke bintang'}
                </span>
              </div>

              <div className={styles.textareaGroup}>
                <label className={styles.textareaLabel}>Komentar (opsional)</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Bagaimana pengalaman Anda memasak resep ini? Apa yang berhasil, apa yang perlu dicoba berbeda?"
                  value={comment}
                  maxLength={500}
                  onChange={(e) => setComment(e.target.value)}
                />
                <span className={styles.charCount}>{comment.length}/500</span>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={submitting || rating === 0}>
                {submitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Kirim Ulasan
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <div className={styles.loginPromptIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p>Masuk untuk berbagi pengalaman memasak dan memberikan ulasan pada resep ini.</p>
            <Link href="/auth" className={styles.loginBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Masuk / Daftar
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
