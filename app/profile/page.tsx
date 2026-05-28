'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import styles from './page.module.css';
import Image from 'next/image';
import { 
  IconBookmark, IconComment, IconLeaf, IconTrophy, 
  IconCollection, IconStarFull, IconShare, 
  IconCheckCircle, IconPan, IconGoogle, IconFacebook, 
  IconHistory, IconRestaurant
} from './Icons';

// ACTIVITIES fallback will be dynamically generated from Journal data

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

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

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'RECIPES' | 'ACTIVITY' | 'SETTINGS'>('ACTIVITY');
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      import('../../lib/api').then(({ api }) => {
        Promise.all([
          api.getFavorites().catch(() => ({ favorites: [] })),
          api.getMyJournals().catch(() => ({ journals: [] }))
        ]).then(([favRes, journalRes]) => {
          setSavedRecipes(favRes.favorites || []);
          setJournals(journalRes.journals || []);
          
          // Map journals to activities
          const mappedActivities = (journalRes.journals || []).map((j: any) => ({
            id: j.id,
            type: 'JOURNAL_CREATED',
            icon: <IconCollection />,
            iconBg: '#e8e8ea',
            iconColor: '#5f5e60',
            label: 'JURNAL MINGGUAN',
            title: `Jurnal Mulai: ${new Date(j.weekStart).toLocaleDateString('id-ID')}`,
            subtitle: `${j.entries?.length || 0} entri resep tersimpan di jurnal ini.`,
            time: new Date(j.createdAt).toLocaleDateString('id-ID')
          }));
          setActivities(mappedActivities);
        });
      });
    }
  }, [user]);

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Memuat profil...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <main className={styles.main}>
      {/* Profile Header Section */}
      <section className={styles.profileSection}>
          <div className={styles.container}>
            <div className={styles.profileHeader}>
              <div className={styles.profileImageWrap} style={{ background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#666' }}>
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              
              <div className={styles.profileInfo}>
                <div className={styles.profileTitleRow}>
                  <h1 className={styles.profileName}>{user.username || 'User'}</h1>
                  <button className={styles.editBtn} onClick={handleLogout} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none' }}>
                    Keluar
                  </button>
                </div>
                
                <p className={styles.profileBio}>
                  Koki rumahan & penggemar kuliner minimalis. Menjelajahi perpaduan bahan musiman dengan keanggunan cita rasa nusantara.
                </p>
                
                <div className={styles.profileStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{savedRecipes.length}</span>
                    <span className={styles.statLabel}>RESEP DISIMPAN</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{journals.length}</span>
                    <span className={styles.statLabel}>JURNAL MINGGUAN</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{new Date(user.createdAt || Date.now()).getFullYear()}</span>
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
                onClick={() => setActiveTab('RECIPES')}
              >
                Kotak Resep
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'ACTIVITY' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('ACTIVITY')}
              >
                Aktivitas
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'SETTINGS' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('SETTINGS')}
              >
                Pengaturan
              </button>
            </nav>
          </div>
        </div>

        {/* Content Section */}
        <section className={styles.contentSection}>
          <div className={styles.container}>
            
            {activeTab === 'RECIPES' && (
              <>
                <div className={styles.contentHeader}>
                  <h2>Resep Tersimpan</h2>
                  <button className={styles.sortBtn}>
                    <IconSort />
                    Urutkan: Terbaru
                  </button>
                </div>

                <div className={styles.recipeGrid}>
                  {savedRecipes.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: '2rem' }}>
                      Belum ada resep yang disimpan.
                    </p>
                  ) : (
                    savedRecipes.map(fav => (
                      <div key={fav.id} className={styles.recipeCard} onClick={() => router.push(`/recipe/${fav.recipe.id}`)} style={{ cursor: 'pointer' }}>
                        <Image src={fav.recipe.imageUrl || '/recipe-chicken.jpg'} alt={fav.recipe.title} fill className={styles.recipeImage} />
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
                    ))
                  )}
                </div>

                <div className={styles.loadMoreWrap}>
                  <button className={styles.loadMoreBtn}>
                    Jelajahi Lebih Banyak Resep
                  </button>
                </div>
              </>
            )}

            {activeTab === 'ACTIVITY' && (
              <>
                <div className={styles.contentHeader}>
                  <h2>Aktivitas Dapur Terperinci</h2>
                </div>
                
                <div className={styles.activityFeed}>
                  {activities.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>Belum ada jurnal mingguan.</p>
                  ) : (
                    activities.map(activity => (
                      <div key={activity.id} className={styles.activityItem}>
                        
                        <div 
                          className={styles.activityIconWrap} 
                          style={{ backgroundColor: activity.iconBg, color: activity.iconColor }}
                        >
                          {activity.icon}
                        </div>

                        <div className={styles.activityCard}>
                          <div className={styles.activityCardHeader}>
                            {activity.label}
                          </div>
                          
                          <div className={styles.activityCardContent}>
                            {activity.badgeIcon && (
                              <div className={styles.activityCardBadgeWrap}>
                                {activity.badgeIcon}
                              </div>
                            )}

                            <div className={styles.activityCardMain}>
                              <h3 className={styles.activityCardTitle}>{activity.title}</h3>
                              {activity.subtitle && <p className={styles.activityCardSubtitle}>{activity.subtitle}</p>}
                              {activity.quote && <blockquote className={styles.activityCardQuote}>"{activity.quote}"</blockquote>}
                              
                              {activity.stars && (
                                <div className={styles.activityCardStars}>
                                  {[...Array(5)].map((_, i) => (
                                    <IconStarFull key={i} />
                                  ))}
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

                            {activity.rightIcon && (
                              <div className={styles.activityCardRightIcon}>
                                {activity.rightIcon}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === 'SETTINGS' && (
              <div className={styles.settingsGrid}>
                {/* Left Column: Personal Info & Dietary */}
                <div className={styles.settingsColLeft}>
                  {/* Personal Information */}
                  <section className={styles.settingsCard}>
                    <h2 className={styles.settingsCardHeader}>Informasi Pribadi</h2>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nama Lengkap</label>
                        <input type="text" className={styles.formInput} defaultValue="Rina Maharani" />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nama Tampilan</label>
                        <input type="text" className={styles.formInput} defaultValue={user.username || ''} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Alamat Email</label>
                        <input type="email" className={styles.formInput} defaultValue={user.email || ''} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nomor Telepon</label>
                        <input type="tel" className={styles.formInput} placeholder="+62 812 000 000" />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Tanggal Lahir</label>
                        <input type="date" className={styles.formInput} defaultValue="1995-05-15" />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Lokasi</label>
                        <input type="text" className={styles.formInput} defaultValue="Jakarta, ID" />
                      </div>
                      <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.formLabel}>Bio Profil</label>
                        <textarea className={`${styles.formInput} ${styles.formTextarea}`} defaultValue="Koki rumahan & penggemar kuliner minimalis. Menjelajahi perpaduan bahan musiman dengan keanggunan cita rasa nusantara." />
                      </div>
                    </div>
                  </section>

                  {/* Dietary Preferences */}
                  <section className={styles.settingsCard}>
                    <h2 className={styles.settingsCardHeader}>
                      Preferensi Diet
                      <span className={styles.settingsCardHeaderIcon}><IconRestaurant /></span>
                    </h2>
                    <p className={styles.chipSubtitle}>Pilih untuk menyesuaikan rekomendasi resep Anda.</p>
                    
                    <div className={styles.chipGrid}>
                      {['Vegan', 'Bebas Gluten', 'Halal', 'Kosher', 'Bebas Kacang', 'Keto', 'Paleo', 'Vegetarian'].map((diet) => (
                        <label key={diet} className={styles.chipWrap}>
                          <input type="checkbox" className={styles.chipInput} defaultChecked={diet === 'Bebas Gluten' || diet === 'Vegetarian'} />
                          <span className={styles.chipLabel}>{diet}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column: Account Security & Notifications */}
                <div className={styles.settingsColRight}>
                  {/* Account & Security */}
                  <section className={styles.settingsCard}>
                    <h2 className={styles.settingsCardHeader}>Akun & Keamanan</h2>
                    
                    <h3 className={styles.sectionTitle}>Akun Terhubung</h3>
                    <button className={styles.socialBtn}>
                      <IconGoogle />
                      Google Terhubung
                    </button>
                    <button className={styles.socialBtn}>
                      <IconFacebook />
                      Hubungkan Facebook
                    </button>

                    <h3 className={`${styles.sectionTitle} mt-4`}>Ubah Alamat Email</h3>
                    <div className={styles.emailChangeGroup}>
                      <input type="email" className={styles.formInput} placeholder="Email Baru" style={{ flexGrow: 1 }} />
                      <button className={styles.verifyBtn}>Verifikasi</button>
                    </div>

                    <h3 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconHistory /> Aktivitas Terkini
                    </h3>
                    <div className={styles.activityList}>
                      <div className={styles.activityListItem}>
                        <div>
                          <p className={styles.activityDevice}>MacBook Pro (Chrome)</p>
                          <p className={styles.activityLocation}>Jakarta, ID</p>
                        </div>
                        <span className={`${styles.activityStatus} ${styles.activityStatusActive}`}>Aktif Sekarang</span>
                      </div>
                      <div className={styles.activityListItem}>
                        <div>
                          <p className={styles.activityDevice}>iPhone 13 (Safari)</p>
                          <p className={styles.activityLocation}>Jakarta, ID</p>
                        </div>
                        <span className={styles.activityStatus}>2 hari yang lalu</span>
                      </div>
                    </div>
                  </section>

                  {/* Notifications */}
                  <section className={styles.settingsCard}>
                    <h2 className={styles.settingsCardHeader}>Notifikasi</h2>
                    
                    {[
                      { id: 'notif1', title: 'Ringkasan Mingguan', desc: 'Resep teratas minggu ini.', checked: true },
                      { id: 'notif2', title: 'Peringatan Pengikut Baru', desc: 'Saat seseorang mengikuti profil Anda.', checked: false },
                      { id: 'notif3', title: 'Komentar Resep', desc: 'Pembaruan pada resep yang Anda bagikan.', checked: true },
                      { id: 'notif4', title: 'Ringkasan Aktivitas', desc: 'Ringkasan aktivitas aplikasi Anda.', checked: false },
                    ].map((notif) => (
                      <div key={notif.id} className={styles.toggleRow}>
                        <div className={styles.toggleInfo}>
                          <h3>{notif.title}</h3>
                          <p>{notif.desc}</p>
                        </div>
                        <div className={styles.toggleWrap}>
                          <input type="checkbox" id={notif.id} className={styles.toggleInput} defaultChecked={notif.checked} />
                          <label htmlFor={notif.id} className={styles.toggleLabel}></label>
                        </div>
                      </div>
                    ))}
                  </section>
                </div>

                {/* Save Changes Button */}
                <div className={`${styles.saveBtnWrap} ${styles.formGroupFull}`}>
                  <button className={styles.saveBtn}>Simpan Perubahan</button>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>
  );
}
