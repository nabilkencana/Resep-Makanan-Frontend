'use client';
import { useState, useEffect, useTransition } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import styles from '../(public)/recipe/[id]/page.module.css';

export default function FavoriteButton({ recipeId }: { recipeId: string }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
      api.getFavorites().then(res => {
        const saved = res.favorites?.some((f: any) => String(f.recipeId) === String(recipeId));
        setIsSaved(!!saved);
      }).catch(() => {}).finally(() => setInitLoading(false));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitLoading(false);
    }
  }, [user, recipeId]);

  const handleToggle = () => {
    if (!user) {
      alert('Silakan masuk terlebih dahulu untuk menyimpan resep.');
      return;
    }

    // Optimistic update — update UI instantly before API call
    const newState = !isSaved;
    setIsSaved(newState);

    startTransition(async () => {
      try {
        if (newState) {
          await api.addFavorite(recipeId);
        } else {
          await api.removeFavorite(recipeId);
        }
      } catch (err: any) {
        // If already saved error, keep isSaved = true; otherwise revert
        const msg = err?.message || '';
        if (msg.toLowerCase().includes('already')) {
          setIsSaved(true);
        } else {
          setIsSaved(!newState); // revert on other errors
          console.error('Failed to toggle favorite', err);
        }
      }
    });
  };

  const disabled = initLoading || isPending;

  return (
    <button
      className={styles.saveBtn}
      onClick={handleToggle}
      disabled={disabled}
      aria-label={isSaved ? 'Hapus dari favorit' : 'Simpan ke favorit'}
      style={{
        backgroundColor: isSaved ? '#fef08a' : undefined,
        color: isSaved ? '#854d0e' : undefined,
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {isSaved ? 'Tersimpan' : 'Simpan'}
    </button>
  );
}
