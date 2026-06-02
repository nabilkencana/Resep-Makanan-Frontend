'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { api } from '../../lib/api';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (pathname === '/auth') return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await api.subscribeNewsletter({ email });
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand}>
          <h2 className={styles.brandName}>Dapur Nusantara</h2>
          <p className={styles.copy}>
            © 2026 Dapur Nusantara. Merayakan masakan Indonesia dengan semangat dan cinta.
          </p>
        </div>

        {/* Links */}
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <span className={styles.groupLabel}>Perusahaan</span>
            <Link href="/tentang-kami" className={styles.link} id="footer-tentang">Tentang Kami</Link>
          </div>
          <div className={styles.newsletterSection}>
            <span className={styles.groupLabel}>Berlangganan Newsletter</span>
            <p className={styles.newsletterText}>Dapatkan resep dan tips memasak terbaru setiap minggu.</p>
            {status === 'success' ? (
              <div className={styles.successMessage}>Terima kasih telah mendaftar!</div>
            ) : (
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat email kamu" 
                  className={styles.newsletterInput}
                  disabled={status === 'loading'}
                  required 
                />
                <button type="submit" className={styles.newsletterBtn} disabled={status === 'loading'}>
                  {status === 'loading' ? '⏳' : 'Daftar'}
                </button>
              </form>
            )}
            {status === 'error' && <p className={styles.errorMessage}>Gagal mendaftar. Coba lagi nanti.</p>}
          </div>
        </div>
      </div>
    </footer>
  );
}
