'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import styles from './page.module.css';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await api.subscribeNewsletter({ email });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ color: '#006d36', fontWeight: 500, padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', marginTop: '1rem' }}>
        Terima kasih telah berlangganan!
      </div>
    );
  }

  return (
    <form
      className={styles.newsletterForm}
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        id="newsletter-email"
        className={styles.newsletterInput}
        placeholder="email@kamu.com"
        aria-label="Alamat email untuk newsletter"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'loading'}
        required
      />
      <button
        type="submit"
        className={styles.newsletterBtn}
        id="newsletter-submit"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Mendaftar...' : 'Daftar Sekarang'}
      </button>
    </form>
  );
}
