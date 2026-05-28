'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { fetchApi } from '@/lib/api';
import TutorialModal from './TutorialModal';

export default function TutorialButton({ recipeId }: { recipeId: number }) {
  const [tutorial, setTutorial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'unauthorized' | 'premium_locked' | 'video_ready' | 'pending_transaction'>('unauthorized');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tutorials and find the one for this recipe
    const fetchTutorial = async () => {
      try {
        const res = await fetchApi('/tutorials');
        if (res && res.tutorials) {
          const matched = res.tutorials.find((t: any) => t.recipeId === recipeId);
          if (matched) setTutorial(matched);
        }
      } catch (err) {
        console.error('Error fetching tutorials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, [recipeId]);

  const handleWatchClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setModalStatus('unauthorized');
      setIsModalOpen(true);
      return;
    }

    if (!tutorial) return;

    try {
      // Trying to fetch watch endpoint
      const res = await fetchApi(`/tutorials/${tutorial.id}/watch`);
      
      // If we got videoUrl, we have access!
      if (res && res.videoUrl) {
        setVideoUrl(res.videoUrl);
        setModalStatus('video_ready');
        setIsModalOpen(true);
      }
    } catch (err: any) {
      // If 403 Forbidden, we need to buy it
      if (err.message?.includes('403') || err.message?.toLowerCase().includes('premium')) {
        setModalStatus('premium_locked');
        setIsModalOpen(true);
      } else {
        alert('Gagal memuat video: ' + (err.message || 'Error tidak diketahui'));
      }
    }
  };

  // If loading, don't show button
  if (loading) return null;

  // If no tutorial exists for this recipe, don't show button
  if (!tutorial) return null;

  return (
    <>
      <button className={styles.groceryBtn} onClick={handleWatchClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10 8 16 12 10 16 10 8"/>
        </svg>
        Tonton Video Tutorial
      </button>

      <TutorialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tutorialId={tutorial.id}
        price={tutorial.price}
        videoUrl={videoUrl}
        isLoggedIn={!!localStorage.getItem('token')}
        status={modalStatus}
      />
    </>
  );
}
