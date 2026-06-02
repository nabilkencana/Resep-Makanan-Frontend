'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import styles from './page.module.css';
import Image from 'next/image';
import {
  IconBookmark, IconComment,
  IconCollection, IconStarFull,
  IconGoogle, IconHistory, IconRestaurant
} from './Icons';

// ─── Local Icon Components ────────────────────────────────────
const IconSort = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="15" y2="12"></line>
    <line x1="3" y1="18" x2="9" y2="18"></line>
  </svg>
);

const IconStar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="currentColor" stroke="none" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const IconTime = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

// ─── Inline Profile Skeleton ──────────────────────────────────
// Shown when AuthProvider is still resolving (rare on client-nav, common on hard reload)
function ProfileSkeleton() {
  return (
    <main className={styles.main}>
      <section className={styles.profileSection}>
        <div className={styles.container}>
          <div className={styles.profileHeader}>
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
      <div className={styles.tabsWrapper}>
        <div className={styles.container}>
          <nav className={styles.tabsNav}>
            {[1, 2, 3].map(i => (
              <div key={i} className={`${styles.skeletonLine} ${styles.skeletonTab}`} />
            ))}
          </nav>
        </div>
      </div>
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

// ─── Tab Content Skeletons ────────────────────────────────────
function ActivitySkeleton() {
  return (
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
  );
}

function RecipesSkeleton() {
  return (
    <div className={styles.recipeGrid}>
      {[1, 2, 3].map(i => (
        <div key={i} className={`${styles.recipeCard} ${styles.skeletonAvatar}`}
          style={{ borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );
}

// ─── Timeout-wrapped fetch helper ─────────────────────────────
async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  fallback: T,
  ms = 5000
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ─── Main Component ───────────────────────────────────────────
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'RECIPES' | 'ACTIVITY' | 'SETTINGS'>('ACTIVITY');

  // ── Favorites (tab: Kotak Resep) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favFetched, setFavFetched] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // ── Activity (tab: Aktivitas, default) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activities, setActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFetched, setActivityFetched] = useState(false);

  // ── Journals (used for stat count) ──
  const [journalCount, setJournalCount] = useState(0);

  const { user, loading, login, logout } = useAuth();
  const router = useRouter();

  // ── Settings Form ──
  const [settingsForm, setSettingsForm] = useState({
    username: '',
    email: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSettingsForm({
        username: user.username || '',
        email: user.email || ''
      });
      if ((user as any).profileImage) {
        setProfileImagePreview((user as any).profileImage);
      }
    }
  }, [user]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSuccess(null);
    try {
      const { api } = await import('../../../lib/api');
      const formData = new FormData();
      formData.append('username', settingsForm.username);
      formData.append('email', settingsForm.email);
      if (profileImageFile) {
        formData.append('image', profileImageFile);
      }
      const updatedUser = await api.updateUser(user.id.toString(), formData);
      setSettingsSuccess('Profil berhasil diperbarui!');
      
      const token = localStorage.getItem('token');
      if (token && updatedUser) {
        login(token, updatedUser);
      }
      
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (err: any) {
      setSettingsError(err.message || 'Gagal memperbarui profil');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // ── Fetch Activity data (Journals + Reviews) — lazy, only when tab active ──
  const fetchActivity = useCallback(async () => {
    if (activityFetched || activityLoading) return;
    setActivityLoading(true);

    const { api } = await import('../../../lib/api');

    const [journalRes, reviewRes] = await Promise.all([
      fetchWithTimeout(
        () => api.getMyJournals(),
        { journals: [] }
      ),
      fetchWithTimeout(
        () => api.getMyReviews(),
        { reviews: [] }
      ),
    ]);

    const journals: any[] = journalRes.journals || [];
    const reviews: any[] = reviewRes.reviews || [];

    // Update journal count for stats
    setJournalCount(journals.reduce((sum: number, j: any) => sum + (j.entries?.length || 0), 0));

    const allActivities: any[] = [];

    // Map journals
    journals.forEach((j: any) => {
      allActivities.push({
        uid: `journal-${j.id}`,
        type: 'JOURNAL_CREATED',
        iconName: 'collection',
        iconBg: '#e8e8ea',
        iconColor: '#5f5e60',
        label: 'JURNAL MINGGUAN',
        title: `Jurnal Mulai: ${new Date(j.weekStart).toLocaleDateString('id-ID')}`,
        subtitle: `${j.entries?.length || 0} entri resep tersimpan di jurnal ini.`,
        time: new Date(j.createdAt).toLocaleDateString('id-ID'),
        timestamp: new Date(j.createdAt).getTime(),
      });

      if (j.entries && j.entries.length > 0) {
        const days = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        const mealMap: Record<string, string> = { BREAKFAST: 'Sarapan', LUNCH: 'Makan Siang', DINNER: 'Makan Malam' };
        j.entries.forEach((entry: any) => {
          const dayName = days[entry.dayOfWeek] || 'Suatu hari';
          const mealName = mealMap[entry.mealType] || entry.mealType;
          const approximateTime = new Date(j.createdAt).getTime() + (entry.id * 1000);
          allActivities.push({
            uid: `entry-${entry.id}`,
            type: 'JOURNAL_ENTRY_ADDED',
            iconName: 'collection',
            iconBg: '#dcfce7',
            iconColor: '#166534',
            label: 'RESEP DIJADWALKAN',
            title: `Menjadwalkan "${entry.recipe?.title || 'Resep'}"`,
            subtitle: `Untuk ${mealName} di hari ${dayName}`,
            time: new Date(approximateTime).toLocaleDateString('id-ID'),
            timestamp: approximateTime,
            image: entry.recipe?.imageUrl,
          });
        });
      }
    });

    // Map reviews
    reviews.forEach((r: any) => {
      allActivities.push({
        uid: `review-${r.id}`,
        type: 'REVIEW_ADDED',
        iconName: 'comment',
        iconBg: '#fef3c7',
        iconColor: '#d97706',
        label: 'ULASAN & RATING',
        title: `Memberikan ${r.rating} bintang untuk "${r.recipe?.title || 'Resep'}"`,
        quote: r.comment,
        stars: r.rating,
        time: new Date(r.createdAt).toLocaleDateString('id-ID'),
        timestamp: new Date(r.createdAt).getTime(),
        image: r.recipe?.imageUrl,
      });
    });

    allActivities.sort((a, b) => b.timestamp - a.timestamp);
    setActivities(allActivities);
    setActivityFetched(true);
    setActivityLoading(false);
  }, [activityFetched, activityLoading]);

  // ── Fetch Favorites — lazy, only when tab active ──
  const fetchFavorites = useCallback(async () => {
    if (favFetched || favLoading) return;
    setFavLoading(true);

    const { api } = await import('../../../lib/api');

    const favRes = await fetchWithTimeout(
      () => api.getFavorites(),
      { favorites: [] }
    );

    setSavedRecipes(favRes.favorites || []);
    setFavFetched(true);
    setFavLoading(false);
  }, [favFetched, favLoading]);

  // Trigger fetch when tab changes (and user is ready)
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'ACTIVITY') fetchActivity();
    if (activeTab === 'RECIPES') fetchFavorites();
  }, [activeTab, user, fetchActivity, fetchFavorites]);

  // ── Auth guard ──
  if (loading) return <ProfileSkeleton />;
  if (!user) return null;

  const sortedRecipes = [...savedRecipes].sort((a, b) => {
    const timeA = new Date(a.savedAt || Date.now()).getTime();
    const timeB = new Date(b.savedAt || Date.now()).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleTabChange = (tab: 'RECIPES' | 'ACTIVITY' | 'SETTINGS') => {
    setActiveTab(tab);
  };

  return (
    <main className={styles.main}>
      {/* Profile Header — tampil segera setelah /me selesai */}
      <section className={styles.profileSection}>
        <div className={styles.container}>
          <div className={styles.profileHeader}>
            <div className={styles.profileImageWrap}>
              {(user as any).profileImage ? (
                <img src={(user as any).profileImage} alt={user.username || 'User'} className={styles.headerProfileImage} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <span className={styles.profileImageText}>{user.username?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.profileTitleRow}>
                <h1 className={styles.profileName}>{user.username || 'User'}</h1>
                <button className={styles.editBtn} onClick={handleLogout} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none' }}>
                  Keluar
                </button>
              </div>

              <p className={styles.profileBio}>
                Koki rumahan &amp; penggemar kuliner minimalis. Menjelajahi perpaduan bahan musiman dengan keanggunan cita rasa nusantara.
              </p>

              <div className={styles.profileStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {favFetched ? savedRecipes.length : '—'}
                  </span>
                  <span className={styles.statLabel}>RESEP DISIMPAN</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {activityFetched ? journalCount : '—'}
                  </span>
                  <span className={styles.statLabel}>RESEP DI JURNAL</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {new Date(user.createdAt || Date.now()).getFullYear()}
                  </span>
                  <span className={styles.statLabel}>ANGGOTA SEJAK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className={styles.tabsWrapper}>
        <div className={styles.container}>
          <nav className={styles.tabsNav}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'RECIPES' ? styles.tabBtnActive : ''}`}
              onClick={() => handleTabChange('RECIPES')}
            >
              Kotak Resep
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'ACTIVITY' ? styles.tabBtnActive : ''}`}
              onClick={() => handleTabChange('ACTIVITY')}
            >
              Aktivitas
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'SETTINGS' ? styles.tabBtnActive : ''}`}
              onClick={() => handleTabChange('SETTINGS')}
            >
              Pengaturan
            </button>
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.container}>

          {/* ── Tab: Kotak Resep ── */}
          {activeTab === 'RECIPES' && (
            <>
              <div className={styles.contentHeader}>
                <h2>Resep Tersimpan</h2>
                <button
                  className={styles.sortBtn}
                  onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                >
                  <IconSort />
                  Urutkan: {sortOrder === 'newest' ? 'Terbaru' : 'Terlama'}
                </button>
              </div>

              {favLoading ? (
                <RecipesSkeleton />
              ) : sortedRecipes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                  Belum ada resep yang disimpan.
                </p>
              ) : (
                <div className={styles.recipeGrid}>
                  {sortedRecipes.map(fav => (
                    <div
                      key={fav.recipeId}
                      className={styles.recipeCard}
                      onClick={() => router.push(`/recipe/${fav.recipe.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Image
                        src={(fav.recipe.imageUrl?.includes('example.com') ? null : fav.recipe.imageUrl) || '/recipe-chicken.jpg'}
                        alt={fav.recipe.title}
                        fill
                        className={styles.recipeImage}
                      />
                      <div className={styles.recipeOverlay}></div>
                      <div className={styles.recipeContent}>
                        <span className={styles.recipeBadge}>{fav.recipe.category}</span>
                        <h3 className={styles.recipeTitle}>{fav.recipe.title}</h3>
                        <div className={styles.recipeMeta}>
                          <span className={styles.metaItem}>
                            <IconStar />
                            {fav.recipe.rating}
                          </span>
                          <span className={styles.metaItem}>
                            <IconTime />
                            {fav.recipe.cookTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.loadMoreWrap} style={{ marginTop: '2rem' }}>
                <button className={styles.loadMoreBtn} onClick={() => router.push('/kategori')}>
                  Jelajahi Lebih Banyak Resep
                </button>
              </div>
            </>
          )}

          {/* ── Tab: Aktivitas ── */}
          {activeTab === 'ACTIVITY' && (
            <>
              <div className={styles.contentHeader}>
                <h2>Aktivitas Dapur Terperinci</h2>
              </div>

              {activityLoading ? (
                <ActivitySkeleton />
              ) : activities.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                  Belum ada aktivitas.
                </p>
              ) : (
                <div className={styles.activityFeed}>
                  {activities.map(activity => (
                    <div key={activity.uid} className={styles.activityItem}>
                      <div
                        className={styles.activityIconWrap}
                        style={{ backgroundColor: activity.iconBg, color: activity.iconColor }}
                      >
                        {activity.iconName === 'collection' && <IconCollection />}
                        {activity.iconName === 'bookmark' && <IconBookmark />}
                        {activity.iconName === 'comment' && <IconComment />}
                      </div>

                      <div className={styles.activityCard}>
                        <div className={styles.activityCardHeader}>{activity.label}</div>
                        <div className={styles.activityCardContent}>
                          <div className={styles.activityCardMain}>
                            <h3 className={styles.activityCardTitle}>{activity.title}</h3>
                            {activity.subtitle && <p className={styles.activityCardSubtitle}>{activity.subtitle}</p>}
                            {activity.quote && <blockquote className={styles.activityCardQuote}>"{activity.quote}"</blockquote>}
                            {activity.stars && (
                              <div className={styles.activityCardStars}>
                                {[...Array(5)].map((_, i) => <IconStarFull key={i} />)}
                              </div>
                            )}
                            {activity.time && <span className={styles.activityCardTime}>{activity.time}</span>}
                          </div>
                          {activity.image && (
                            <Image
                              src={activity.image}
                              alt={activity.title}
                              width={140}
                              height={90}
                              className={styles.activityCardImage}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Tab: Pengaturan ── */}
          {activeTab === 'SETTINGS' && (
            <div className={styles.settingsGrid}>
              <div className={styles.settingsColLeft} style={{ width: '100%', maxWidth: '600px', margin: '0 auto', gridColumn: '1 / -1' }}>
                <section className={styles.settingsCard}>
                  <h2 className={styles.settingsCardHeader}>Informasi Pribadi</h2>
                  {settingsError && <div style={{ color: 'var(--clr-error)', marginBottom: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>{settingsError}</div>}
                  {settingsSuccess && <div style={{ color: 'var(--clr-primary)', marginBottom: '1rem', padding: '1rem', background: '#dcfce7', borderRadius: '8px' }}>{settingsSuccess}</div>}
                  
                  <form onSubmit={handleSettingsSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.formLabel}>Foto Profil</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid var(--clr-outline-variant)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: '#eee', flexShrink: 0, border: '2px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                          {profileImagePreview ? (
                            <img src={profileImagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px', fontWeight: 600 }}>Pilih Foto</div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <label 
                            htmlFor="profile-upload" 
                            style={{ 
                              display: 'inline-block', 
                              padding: '0.5rem 1rem', 
                              background: '#fff', 
                              border: '1.5px solid var(--clr-outline-variant)', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              fontWeight: 500,
                              fontSize: '0.875rem',
                              color: 'var(--clr-on-surface-variant)',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--clr-primary)'; e.currentTarget.style.color = 'var(--clr-primary)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--clr-outline-variant)'; e.currentTarget.style.color = 'var(--clr-on-surface-variant)'; }}
                          >
                            Unggah Foto Baru
                          </label>
                          <input 
                            id="profile-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            style={{ display: 'none' }} 
                          />
                          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>Format yang didukung: JPG, PNG. Maksimal 2MB.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.formLabel}>Nama Tampilan / Username</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        value={settingsForm.username} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })} 
                        required 
                      />
                    </div>
                    
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.formLabel}>Alamat Email</label>
                      <input 
                        type="email" 
                        className={styles.formInput} 
                        value={settingsForm.email} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className={`${styles.saveBtnWrap} ${styles.formGroupFull}`} style={{ marginTop: '2rem' }}>
                      <button type="submit" className={styles.saveBtn} disabled={settingsLoading}>
                        {settingsLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
