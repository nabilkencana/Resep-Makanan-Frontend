'use client';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import styles from '../recipe/[id]/page.module.css';

export default function FavoriteButton({ recipeId }: { recipeId: string }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getFavorites().then(res => {
        const saved = res.favorites?.some((f: any) => f.recipeId === Number(recipeId));
        setIsSaved(saved);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, recipeId]);

  const handleToggle = async () => {
    if (!user) {
      alert('Silakan masuk terlebih dahulu untuk menyimpan resep.');
      return;
    }
    try {
      if (isSaved) {
        await api.removeFavorite(recipeId);
        setIsSaved(false);
      } else {
        await api.addFavorite(recipeId);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  return (
    <button 
      className={styles.saveBtn} 
      onClick={handleToggle}
      disabled={loading}
      style={{
        backgroundColor: isSaved ? '#fef08a' : undefined,
        color: isSaved ? '#854d0e' : undefined,
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
