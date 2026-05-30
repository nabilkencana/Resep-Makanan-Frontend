'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import styles from '../../admin.module.css';
import tutStyles from './tutorials.module.css';

interface Tutorial {
  id: number;
  recipeId: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number;
  price: number;
  isPublished: boolean;
  createdAt: string;
  recipe?: {
    title: string;
    imageUrl?: string;
  };
}

function formatPrice(price: number) {
  if (price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}

export default function AdminTutorialsPage() {
  const router = useRouter();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const tutRes = await api.getTutorials();
      setTutorials(tutRes.tutorials || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles.pageContent}>
      {/* ── Header ── */}
      <div className={tutStyles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Video Tutorial</h1>
          <p className={styles.pageSubtitle}>Kelola konten video tutorial memasak</p>
        </div>
        <button className={tutStyles.addBtn} onClick={() => router.push('/admin/tutorials/new')}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          Tambah Tutorial
        </button>
      </div>

      {/* ── Table ── */}
      <div className={tutStyles.tableCard}>
        {loading ? (
          <div className={tutStyles.loadingState}>
            <div className={tutStyles.spinner} />
            <span>Memuat tutorial...</span>
          </div>
        ) : tutorials.length === 0 ? (
          <div className={tutStyles.loadingState}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.4 }}>movie</span>
            <p>Belum ada tutorial yang ditambahkan.</p>
          </div>
        ) : (
          <table className={tutStyles.table}>
            <thead>
              <tr className={tutStyles.tableHead}>
                <th>ID</th>
                <th>Tutorial</th>
                <th>Durasi</th>
                <th>Harga</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tutorials.map((tut) => (
                <tr key={tut.id} className={tutStyles.tableRow}>
                  <td className={tutStyles.tdId}>#{tut.id}</td>
                  <td>
                    <div className={tutStyles.tutorialInfo}>
                      {tut.thumbnailUrl || tut.recipe?.imageUrl ? (
                        <img src={tut.thumbnailUrl || tut.recipe?.imageUrl || ''} alt="" className={tutStyles.tutorialThumb} />
                      ) : (
                        <div className={tutStyles.tutorialThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--clr-outline)', fontSize: '20px' }}>image</span>
                        </div>
                      )}
                      <div>
                        <div className={tutStyles.tutorialTitle}>{tut.title}</div>
                        <div className={tutStyles.recipeTitle}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>restaurant</span>
                          {tut.recipe?.title || 'Resep Tidak Ditemukan'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={tutStyles.duration}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                      {formatDuration(tut.duration)}
                    </span>
                  </td>
                  <td>
                    <span className={tut.price === 0 ? tutStyles.priceFree : tutStyles.price}>
                      {formatPrice(tut.price)}
                    </span>
                  </td>
                  <td>
                    <span className={`${tutStyles.statusBadge} ${tut.isPublished ? tutStyles.statusPub : tutStyles.statusDraft}`}>
                      {tut.isPublished ? 'Dipublikasikan' : 'Draft'}
                    </span>
                  </td>
                  <td className={tutStyles.tdAction}>
                    <button className={tutStyles.actionBtn} title="Edit">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button className={tutStyles.actionBtn} title="Hapus" style={{ color: 'var(--clr-error)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
