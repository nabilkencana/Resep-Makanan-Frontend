'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/auth') return null;

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
            <span className={styles.groupLabel}>Ikuti Kami</span>
            <Link href="#" className={styles.link} id="footer-instagram">Instagram</Link>
            <Link href="#" className={styles.link} id="footer-pinterest">Pinterest</Link>
            <Link href="#" className={styles.link} id="footer-youtube">YouTube</Link>
          </div>
          <div className={styles.linkGroup}>
            <span className={styles.groupLabel}>Terhubung</span>
            <Link href="#" className={styles.link} id="footer-newsletter">Daftar Newsletter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
