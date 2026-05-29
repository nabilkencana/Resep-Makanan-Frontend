'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ email: formData.email, password: formData.password });
        login(res.access_token, res.user);
        if (res.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        await api.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'CUSTOMER',
        });
        alert('Registrasi berhasil! Silakan masuk.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Background Image & Overlay */}
      <div className={styles.bgWrapper}>
        <Image 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAILWXS1vABOA9yZaYMGl9-eWNFrAHayG-TcFSPDFXvNkM_868znTdDUDHGeKtq9bIZKX-qKHBgMFPKeqhcTdDIkDQi4QuIe6NFWW231ETe-Dd_U8eU-5oZY0Bi-vY12m8KPQIzwK_8by1jfPcAS2LgVBVHC8om3Mq-4VbK2uoWEx3ioumPlhNZPXO-tMgiTA0HG56sHHkkUOP2jr8RYSG3Q8NKNy6ntgL7bE4Q4odTRP6btIgdHJOMONl9wCxT2dp9hqky5neuw3Q" 
          alt="Kitchen Background" 
          fill 
          priority
          className={styles.bgImage}
        />
        <div className={styles.bgOverlay}></div>
      </div>

      {/* Auth Card Container */}
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Dapur Nusantara</h1>
            <p className={styles.subtitle}>
              {isLogin ? 'Selamat datang kembali. Silakan masuk ke akun Anda.' : 'Bergabunglah dan temukan inspirasi masakan.'}
            </p>
          </div>

          {error && (
            <div className={`${styles.errorBox} ${styles.shake}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Lengkap</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input 
                    type="text" 
                    required 
                    className={styles.input}
                    placeholder="Masukkan Namamu"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                  type="email" 
                  required 
                  className={styles.input}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                {isLogin && <a href="#" className={styles.forgotLink}>Lupa Password?</a>}
              </div>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  type="password" 
                  required 
                  className={styles.input}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar Akun')}
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <div className={styles.line}></div>
              <span className={styles.dividerText}>ATAU LANJUTKAN DENGAN</span>
              <div className={styles.line}></div>
            </div>

            {/* Social Logins */}
            <div className={styles.socialGrid}>
              <button type="button" className={styles.socialBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button type="button" className={styles.socialBtn}>
                <svg width="20" height="20" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                Facebook
              </button>
            </div>

            <div className={styles.toggleFooter}>
              <span className={styles.toggleText}>
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
              </span>
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className={styles.toggleLink}
              >
                {isLogin ? 'Buat akun sekarang' : 'Masuk di sini'}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}} />
    </div>
  );
}
