'use client';
import { useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import { 
  IconBookmark, IconComment, IconLeaf, IconTrophy, 
  IconCollection, IconStarFull, IconShare, 
  IconCheckCircle, IconPan, IconGoogle, IconFacebook, 
  IconHistory, IconRestaurant
} from './Icons';

const SAVED_RECIPES = [
  {
    id: '1',
    title: 'Pizza Tomat Pusaka',
    badge: 'VEGETARIAN',
    rating: 4.9,
    time: '25 min',
    image: '/images/tomato_pizza.png'
  },
  {
    id: '2',
    title: 'Roti Sourdough',
    badge: 'MEMANGGANG',
    rating: 5.0,
    time: '12 hrs',
    image: '/images/artisan_sourdough.png'
  },
  {
    id: '3',
    title: 'Mangkuk Sayur Hijau',
    badge: 'VEGAN',
    rating: 4.8,
    time: '15 min',
    image: '/images/spring_green_bowl.png'
  }
];

const ACTIVITIES = [
  {
    id: 1,
    type: 'RECIPE_SAVED',
    icon: <IconBookmark />,
    iconBg: '#4ade80',
    iconColor: '#fff',
    label: 'RESEP DISIMPAN',
    title: 'Pizza Tomat Pusaka',
    subtitle: "Disimpan ke folder 'Klasik Italia' Anda untuk inspirasi nanti.",
    time: '2 jam yang lalu',
    image: '/images/tomato_pizza.png'
  },
  {
    id: 2,
    type: 'COMMENT_POSTED',
    icon: <IconComment />,
    iconBg: '#e8e8ea',
    iconColor: '#5f5e60',
    label: 'KOMENTAR DIKIRIM',
    title: "Pada Jurnal: 'Seni Membuat Sourdough'",
    quote: "Tips tentang tingkat hidrasi benar-benar mengubah hasil panggangan akhir pekan saya! Terima kasih atas penjelasannya yang detail.",
    time: '5 jam yang lalu'
  },
  {
    id: 3,
    type: 'CATEGORY_FOLLOWED',
    icon: <IconLeaf />,
    iconBg: '#e8e8ea',
    iconColor: '#006d36',
    label: 'KATEGORI DIIKUTI',
    title: 'Berbasis Tanaman',
    rightIcon: <IconCheckCircle />
  },
  {
    id: 4,
    type: 'ACHIEVEMENT_UNLOCKED',
    icon: <IconTrophy />,
    iconBg: '#ffb74d',
    iconColor: '#fff',
    label: 'PENCAPAIAN TERBUKA',
    title: 'Ahli Rempah',
    subtitle: 'Anda telah menyimpan 10 resep yang menampilkan berbagai campuran rempah!',
    badgeIcon: <IconPan />
  },
  {
    id: 5,
    type: 'ADDED_TO_COLLECTION',
    icon: <IconCollection />,
    iconBg: '#e8e8ea',
    iconColor: '#5f5e60',
    label: 'DITAMBAHKAN KE KOLEKSI',
    title: "Menambahkan 'Mangkuk Sayur Hijau' ke Koleksi 'Makan Malam Cepat'",
    time: 'Kemarin'
  },
  {
    id: 6,
    type: 'RATED_RECIPE',
    icon: <IconStarFull />,
    iconBg: '#e8e8ea',
    iconColor: '#4ade80',
    label: 'MENILAI RESEP',
    title: "Menilai 'Roti Sourdough'",
    stars: 5
  },
  {
    id: 7,
    type: 'SHARED_POST',
    icon: <IconShare />,
    iconBg: '#e8e8ea',
    iconColor: '#5f5e60',
    label: 'MEMBAGIKAN POS JURNAL',
    title: "Membagikan 'Teknik Memasak Sadar' ke Pinterest",
    time: '2 hari yang lalu'
  }
];

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

  return (
    <main className={styles.main}>
      {/* Profile Header Section */}
      <section className={styles.profileSection}>
          <div className={styles.container}>
            <div className={styles.profileHeader}>
              <div className={styles.profileImageWrap}>
                <Image src="/images/profile_picture.png" alt="Eleanor Shellstrop" fill className={styles.profileImage} />
              </div>
              
              <div className={styles.profileInfo}>
                <div className={styles.profileTitleRow}>
                  <h1 className={styles.profileName}>Rina Maharani</h1>
                  <button className={styles.editBtn}>
                    <IconEdit />
                    Edit Profil
                  </button>
                </div>
                
                <p className={styles.profileBio}>
                  Koki rumahan & penggemar kuliner minimalis. Menjelajahi perpaduan bahan musiman dengan keanggunan cita rasa nusantara.
                </p>
                
                <div className={styles.profileStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>12</span>
                    <span className={styles.statLabel}>RESEP DISIMPAN</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>5</span>
                    <span className={styles.statLabel}>KOMENTAR JURNAL</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>2023</span>
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
                  {SAVED_RECIPES.map(recipe => (
                    <div key={recipe.id} className={styles.recipeCard}>
                      <Image src={recipe.image} alt={recipe.title} fill className={styles.recipeImage} />
                      <div className={styles.recipeOverlay}></div>
                      
                      <div className={styles.recipeContent}>
                        <span className={styles.recipeBadge}>{recipe.badge}</span>
                        <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                        
                        <div className={styles.recipeMeta}>
                          <span className={styles.metaItem}>
                            <IconStar />
                            {recipe.rating}
                          </span>
                          <span className={styles.metaItem}>
                            <IconTime />
                            {recipe.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {ACTIVITIES.map(activity => (
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
                  ))}
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
                        <input type="text" className={styles.formInput} defaultValue="RinaM" />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Alamat Email</label>
                        <input type="email" className={styles.formInput} defaultValue="rina.m@example.com" />
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
