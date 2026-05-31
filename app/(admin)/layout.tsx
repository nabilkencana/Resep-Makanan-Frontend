'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useEffect } from 'react';
import styles from './admin.module.css';

interface MenuItem {
  name: string;
  path: string;
  icon: string;
  badge?: string | null;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
  { name: 'Resep', path: '/admin/recipes', icon: 'menu_book', badge: null },
  { name: 'Tutorial', path: '/admin/tutorials', icon: 'smart_display' },
  { name: 'Transaksi', path: '/admin/transactions', icon: 'receipt_long' },
  { name: 'Newsletter', path: '/admin/newsletter', icon: 'mail' },
  { name: 'Pengguna', path: '/admin/users', icon: 'group' },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--clr-surface)',
        gap: '0.75rem',
        flexDirection: 'column',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--clr-outline-variant)',
          borderTop: '3px solid var(--clr-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--clr-on-surface-variant)', fontSize: '0.875rem', fontWeight: 500 }}>
          Memuat Panel Admin...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0" rel="stylesheet" />

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>

        {/* Logo / Brand */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            <img
              src="/admin-logo.png"
              alt="DapurAdmin"
              className={styles.logoImg}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                el.parentElement!.innerHTML = `
                  <div style="
                    width:42px;height:42px;border-radius:10px;
                    background:linear-gradient(135deg,#006d36,#00a049);
                    display:flex;align-items:center;justify-content:center;
                    color:white;font-size:1.25rem;font-weight:800;
                    box-shadow:0 4px 12px rgba(0,109,54,0.28)
                  ">🍳</div>
                  <div class="${styles.logoDot}"></div>
                `;
              }}
            />
            <div className={styles.logoDot} />
          </div>
          <div>
            <h1 className={styles.sidebarTitle}>DapurAdmin</h1>
            <p className={styles.sidebarSubtitle}>Manajemen Dapur</p>
          </div>
        </div>

        {/* Main Nav */}
        <div className={styles.navSection}>
          <span className={styles.navSectionLabel}>Menu Utama</span>
        </div>

        <nav className={styles.navMenu}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <span
                  className={`material-symbols-outlined ${styles.navIcon}`}
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <button className={styles.addBtn} onClick={() => router.push('/admin/recipes/new')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Tambah Resep Baru
          </button>
          <div className={styles.footerLinks}>
            <Link href="/" className={styles.navLink}>
              <span className={`material-symbols-outlined ${styles.navIcon}`}>public</span>
              <span>Situs Publik</span>
            </Link>
            <button
              onClick={() => { logout(); router.push('/auth'); }}
              className={styles.navLink}
              style={{ width: '100%', border: 'none', background: 'none' }}
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── TOP NAV ── */}
      <header className={styles.topNav}>
        <div className={styles.navRight}>

          <div className={styles.profileSection}>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user.username || 'Admin Console'}</p>
              <p className={styles.profileRole}>Administrator Sistem</p>
            </div>
            <div className={styles.profileImg}>
              {(user.username || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
}
