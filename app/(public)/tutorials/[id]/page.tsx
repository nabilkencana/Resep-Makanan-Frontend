'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, fetchApi } from '@/lib/api';
import styles from './WatchTutorial.module.css';
import Link from 'next/link';

interface TutorialDetail {
  id: number;
  title: string;
  description: string;
  duration: number;
  recipe?: {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    category: string;
    prepTime: string;
    cookTime: string;
    servings: number;
    calories: number;
    ingredients: string;
    steps: string;
  };
}

export default function WatchTutorialPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tutorial, setTutorial] = useState<TutorialDetail | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        
        // 1. Get tutorial details
        const tutRes = await api.getTutorialById(id);
        setTutorial(tutRes.tutorial);

        // 2. Get video URL (verifies access)
        const watchRes = await api.watchTutorial(id);
        
        // Transform standard youtube URL to embed URL if necessary
        let finalUrl = watchRes.videoUrl;
        if (finalUrl.includes('youtube.com/watch?v=')) {
          finalUrl = finalUrl.replace('youtube.com/watch?v=', 'youtube.com/embed/');
        } else if (finalUrl.includes('youtu.be/')) {
          finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');
        }
        
        setVideoUrl(finalUrl);
      } catch (err: any) {
        if (err.message?.includes('403') || err.message?.includes('Premium') || err.message?.toLowerCase().includes('forbidden')) {
          setError('Akses Ditolak: Anda belum membeli tutorial ini atau transaksi belum diverifikasi admin.');
        } else if (err.message?.includes('401')) {
          setError('Silakan masuk (login) untuk menonton tutorial ini.');
        } else {
          setError(err.message || 'Gagal memuat video tutorial.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Menyiapkan video tutorial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <span className="material-symbols-outlined">lock</span>
        </div>
        <h1 className={styles.errorTitle}>Akses Tidak Diizinkan</h1>
        <p className={styles.errorDesc}>{error}</p>
        <button className={styles.backBtn} onClick={() => router.back()}>
          Kembali ke Halaman Sebelumnya
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.contentMax}>
        
        {/* ── Top Actions ── */}
        <div className={styles.topActions}>
          <button className={styles.backTopBtn} onClick={() => router.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali
          </button>
        </div>

        {/* ── Breadcrumb ── */}
        <div className={styles.breadcrumb}>
          <Link href="/">Beranda</Link>
          <span className="material-symbols-outlined">chevron_right</span>
          {tutorial?.recipe?.id ? (
            <Link href={`/recipe/${tutorial.recipe.id}`}>Resep: {tutorial.recipe.title}</Link>
          ) : (
            <span>Tutorials</span>
          )}
          <span className="material-symbols-outlined">chevron_right</span>
          <span className={styles.currentCrumb}>Tonton Video</span>
        </div>

        {/* ── Video Player ── */}
        <div className={styles.videoCard}>
          <div className={styles.videoWrapper}>
            {videoUrl.includes('youtube.com') || videoUrl.includes('vimeo.com') ? (
              <iframe
                src={videoUrl}
                title={tutorial?.title || 'Video Tutorial'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.iframe}
              />
            ) : (
              <video 
                controls 
                className={styles.nativeVideo}
                src={videoUrl}
              >
                Browser Anda tidak mendukung tag video.
              </video>
            )}
          </div>
          
          <div className={styles.videoInfo}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{tutorial?.title}</h1>
              {tutorial?.duration && (
                <span className={styles.durationBadge}>
                  <span className="material-symbols-outlined">schedule</span>
                  {Math.floor(tutorial.duration / 60) > 0 ? `${Math.floor(tutorial.duration / 60)}j ` : ''}
                  {tutorial.duration % 60}m
                </span>
              )}
            </div>
            
            <p className={styles.description}>
              {tutorial?.description}
            </p>
          </div>
        </div>

        {/* ── Recipe Details Section ── */}
        {tutorial?.recipe && (
          <div className={styles.recipeSection}>
            <div className={styles.recipeHeader}>
              {tutorial.recipe.imageUrl && (
                <img src={tutorial.recipe.imageUrl} alt={tutorial.recipe.title} className={styles.recipeImage} />
              )}
              <div className={styles.recipeInfo}>
                <h2>Resep: {tutorial.recipe.title}</h2>
                <p className={styles.recipeDesc}>{tutorial.recipe.description}</p>
              </div>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className="material-symbols-outlined">schedule</span>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--clr-outline)', display: 'block' }}>WAKTU PERSIAPAN</span>
                  {tutorial.recipe.prepTime}
                </div>
              </div>
              <div className={styles.metaItem}>
                <span className="material-symbols-outlined">skillet</span>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--clr-outline)', display: 'block' }}>WAKTU MEMASAK</span>
                  {tutorial.recipe.cookTime}
                </div>
              </div>
              <div className={styles.metaItem}>
                <span className="material-symbols-outlined">group</span>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--clr-outline)', display: 'block' }}>PORSI</span>
                  {tutorial.recipe.servings} Orang
                </div>
              </div>
              <div className={styles.metaItem}>
                <span className="material-symbols-outlined">local_fire_department</span>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--clr-outline)', display: 'block' }}>KALORI</span>
                  {tutorial.recipe.calories} kcal
                </div>
              </div>
            </div>

            <h3 className={styles.sectionTitle}>
              <span className="material-symbols-outlined">kitchen</span>
              Bahan-bahan
            </h3>
            <div className={styles.ingredientsList}>
              <ul>
                {(() => {
                  try {
                    const parsed = JSON.parse(tutorial.recipe.ingredients);
                    if (Array.isArray(parsed)) {
                      return parsed.map((item: any, i: number) => (
                        <li key={i}>
                          <strong>{item.name}</strong> {item.amount ? `- ${item.amount}` : ''}
                        </li>
                      ));
                    }
                  } catch (e) {}
                  return <li>{tutorial.recipe.ingredients}</li>;
                })()}
              </ul>
            </div>

            <h3 className={styles.sectionTitle}>
              <span className="material-symbols-outlined">format_list_numbered</span>
              Langkah-langkah
            </h3>
            <div className={styles.stepsList}>
              <ol>
                {(() => {
                  try {
                    const parsed = JSON.parse(tutorial.recipe.steps);
                    if (Array.isArray(parsed)) {
                      // Sort by stepNumber just in case
                      const sorted = [...parsed].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));
                      return sorted.map((step: any, i: number) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>
                          {step.description}
                        </li>
                      ));
                    }
                  } catch (e) {}
                  return <li>{tutorial.recipe.steps}</li>;
                })()}
              </ol>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
