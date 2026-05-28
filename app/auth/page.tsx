'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
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
        router.push('/');
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
      {/* Left side: Image & Quote (Desktop Only) */}
      <div className={styles.leftPane}>
        <Image 
          src="/recipe-chicken.jpg" 
          alt="Masakan Nusantara" 
          fill 
          priority
          className={styles.leftImage}
        />
        <div className={styles.leftOverlay}>
          <h2 className={styles.quote}>"Temukan inspirasi masakan nusantara di setiap hidangan."</h2>
          <p className={styles.author}>Dapur Nusantara</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className={styles.rightPane}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>
            {isLogin ? 'Selamat Datang' : 'Buat Akun'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin 
              ? 'Masuk untuk menyimpan resep favorit Anda' 
              : 'Bergabunglah dengan komunitas Dapur Nusantara'}
          </p>

          {error && (
            <div className={styles.errorBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Pengguna</label>
                <input 
                  type="text" 
                  required 
                  className={styles.input}
                  placeholder="Misal: Budi Santoso"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Alamat Email</label>
              <input 
                type="email" 
                required 
                className={styles.input}
                placeholder="nama@email.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Kata Sandi</label>
              <input 
                type="password" 
                required 
                className={styles.input}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Memproses...
                </>
              ) : (isLogin ? 'Masuk Sekarang' : 'Daftar Akun')}
            </button>
          </form>

          <div className={styles.toggleText}>
            <span>
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            </span>
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className={styles.toggleBtn}
            >
              {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
