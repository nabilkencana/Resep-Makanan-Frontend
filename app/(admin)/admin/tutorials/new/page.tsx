'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';
import styles from '../../../admin.module.css';
import tutStyles from '../tutorials.module.css';

export default function NewTutorialPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    recipeId: '',
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
    price: 0,
    isPublished: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, tutRes] = await Promise.all([
          api.getRecipes(),
          api.getTutorials()
        ]);
        
        const allRecipes = recRes.recipes || [];
        const allTutorials = tutRes.tutorials || [];
        
        // Find recipeIds that already have tutorials
        const usedRecipeIds = new Set(allTutorials.map((tut: any) => tut.recipe?.id || tut.recipeId));
        
        // Filter out used recipes
        const availableRecipes = allRecipes.filter((r: any) => !usedRecipeIds.has(r.id));
        
        setRecipes(availableRecipes);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createTutorial({
        ...formData,
        recipeId: Number(formData.recipeId),
        duration: Number(formData.duration),
        price: Number(formData.price),
      });
      router.push('/admin/tutorials');
    } catch (err: any) {
      alert('Gagal membuat tutorial: ' + (err.message || 'Unknown error'));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={tutStyles.loadingState}>
          <div className={tutStyles.spinner} />
          <span>Memuat data resep...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      {/* ── Header ── */}
      <div className={tutStyles.headerRow} style={{ marginBottom: '1.5rem' }}>
        <div>
          <button 
            type="button" 
            className={tutStyles.actionBtn} 
            onClick={() => router.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--clr-primary)' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali ke Daftar Tutorial
          </button>
          <h1 className={styles.pageTitle}>Tambah Tutorial Baru</h1>
          <p className={styles.pageSubtitle}>Buat konten video pembelajaran baru untuk resep yang sudah ada</p>
        </div>
      </div>

      <div className={tutStyles.tableCard} style={{ padding: '2.5rem', maxWidth: '800px', background: '#fff' }}>
        <form onSubmit={handleCreate} className={tutStyles.modalForm}>
          <div className={tutStyles.formGrid}>
            
            {/* Recipe Select */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>Pilih Resep Terkait</label>
              <select
                className={tutStyles.select}
                required
                value={formData.recipeId}
                onChange={(e) => setFormData({ ...formData, recipeId: e.target.value })}
              >
                <option value="" disabled>-- Pilih Resep --</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>Judul Tutorial</label>
              <input
                className={tutStyles.input}
                required
                placeholder="Contoh: Cara Membuat Nasi Goreng Spesial"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>Deskripsi (Opsional)</label>
              <textarea
                className={tutStyles.textarea}
                placeholder="Deskripsi singkat tentang apa yang akan dipelajari dalam video ini..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Video URL */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>URL Video</label>
              <input
                className={tutStyles.input}
                required
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              />
            </div>

            {/* Thumbnail URL */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>URL Thumbnail (Opsional)</label>
              <input
                className={tutStyles.input}
                placeholder="Kosongkan untuk menggunakan gambar resep"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              />
            </div>

            {/* Duration */}
            <div className={tutStyles.formGroup}>
              <label className={tutStyles.label}>Durasi (Menit)</label>
              <input
                type="number"
                className={tutStyles.input}
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>

            {/* Price */}
            <div className={tutStyles.formGroup}>
              <label className={tutStyles.label}>Harga (Rp)</label>
              <input
                type="number"
                className={tutStyles.input}
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>

            {/* Is Published */}
            <div className={`${tutStyles.fullWidth} ${tutStyles.checkboxGroup}`}>
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished">Publikasikan sekarang</label>
            </div>

          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-outline-variant)' }}>
            <button type="button" className={tutStyles.cancelBtn} onClick={() => router.back()}>
              Batal
            </button>
            <button type="submit" className={tutStyles.saveBtn} disabled={saving}>
              {saving ? (
                <><span className={tutStyles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Menyimpan...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>Simpan Tutorial</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
