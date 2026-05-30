'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import styles from '../../../(admin)/admin/recipes/recipes.module.css';

export default function TambahResepPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Indonesian');
  const [prepTime, setPrepTime] = useState('15 mins');
  const [cookTime, setCookTime] = useState('30 mins');
  const [servings, setServings] = useState<number>(4);
  const [calories, setCalories] = useState<number>(450);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState([{ stepNumber: 1, description: '' }]);
  
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Handlers for Ingredients
  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };
  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '' }]);
  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length ? newIngredients : [{ name: '', amount: '' }]);
  };

  // Handlers for Steps
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };
  const addStep = () => setSteps([...steps, { stepNumber: steps.length + 1, description: '' }]);
  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // re-number steps
    newSteps.forEach((step, i) => step.stepNumber = i + 1);
    setSteps(newSteps.length ? newSteps : [{ stepNumber: 1, description: '' }]);
  };

  // Handlers for Tags
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };
  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      
      // 1. Upload image if exists
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.uploadRecipeImage(formData);
        if (uploadRes.success && uploadRes.imageUrl) {
          imageUrl = uploadRes.imageUrl;
        } else {
          throw new Error('Gagal mengupload gambar.');
        }
      }

      // 2. Format payload
      const validIngredients = ingredients.filter(i => i.name.trim() !== '');
      const validSteps = steps.filter(s => s.description.trim() !== '');

      if (validIngredients.length === 0) throw new Error('Minimal harus ada 1 bahan.');
      if (validSteps.length === 0) throw new Error('Minimal harus ada 1 langkah.');

      const payload = {
        title,
        description,
        category,
        prepTime,
        cookTime,
        servings: Number(servings),
        calories: Number(calories),
        isPremium: false,
        imageUrl: imageUrl || undefined,
        ingredients: validIngredients,
        steps: validSteps,
        tags: tags,
      };

      // 3. Create Recipe (Normal user sets it to PENDING in backend)
      await api.createRecipe(payload);
      
      setSuccess(true);
      setLoading(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan resep. Apakah kamu sudah login?');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '6rem 2rem 4rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--clr-primary)', marginBottom: '1rem' }}>check_circle</span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--clr-on-surface)' }}>Resep Berhasil Dikirim!</h2>
          <p style={{ color: 'var(--clr-on-surface-variant)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Terima kasih telah berbagi resep kreasi Anda. Resep Anda saat ini berstatus <strong>Menunggu Verifikasi</strong> oleh Admin. Setelah disetujui, resep akan langsung tayang di Dapur Nusantara!
          </p>
          <button 
            onClick={() => router.push('/kategori')}
            style={{ padding: '0.75rem 1.5rem', background: 'var(--clr-primary)', color: '#fff', border: 'none', borderRadius: '2rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Kembali ke Kategori
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '6rem', paddingBottom: '4rem', display: 'flex', justifyContent: 'center', background: 'var(--clr-surface)' }}>
      <div className={styles.container} style={{ maxWidth: '800px', width: '100%', background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--clr-outline-variant)', paddingBottom: '1.5rem' }}>
        <button 
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--clr-on-surface-variant)', cursor: 'pointer', marginBottom: '1rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Kembali
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--clr-on-surface)' }}>Kirim Resep Kamu</h1>
        <p style={{ color: 'var(--clr-on-surface-variant)', marginTop: '0.5rem' }}>Bagikan resep andalanmu agar bisa dicoba oleh ribuan member Dapur Nusantara lainnya.</p>
      </div>

      {error && (
        <div className={styles.errorBanner} style={{ marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined">error_outline</span>
          <span>{error}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          
          {/* IMAGE UPLOAD */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Foto Makanan</label>
            <div 
              className={styles.uploadArea} 
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" />
                  <p style={{ marginTop: '1rem', color: 'var(--clr-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Ganti Foto</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--clr-outline)' }}>add_photo_alternate</span>
                  <p style={{ marginTop: '1rem', color: 'var(--clr-on-surface-variant)', fontWeight: 500 }}>Klik untuk memilih foto (opsional)</p>
                  <p style={{ fontSize: '12px', color: 'var(--clr-outline)' }}>PNG, JPG maks 5MB</p>
                </>
              )}
            </div>
          </div>

          {/* BASIC INFO */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Judul Resep <span style={{ color: 'var(--clr-error)' }}>*</span></label>
            <input 
              type="text" 
              className={styles.formInput} 
              placeholder="Contoh: Nasi Goreng Spesial Ala Anak Kos"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Deskripsi Singkat <span style={{ color: 'var(--clr-error)' }}>*</span></label>
            <textarea 
              className={styles.formTextarea} 
              placeholder="Ceritakan sedikit tentang resep ini..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Kategori</label>
            <select className={styles.formSelect} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Indonesian">Nusantara (Indonesian)</option>
              <option value="Western">Western</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="Dessert">Dessert (Makanan Penutup)</option>
              <option value="Beverage">Beverage (Minuman)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Porsi</label>
            <input type="number" className={styles.formInput} min="1" value={servings} onChange={e => setServings(Number(e.target.value))} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Waktu Persiapan</label>
            <input type="text" className={styles.formInput} placeholder="Misal: 15 mins" value={prepTime} onChange={e => setPrepTime(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Waktu Memasak</label>
            <input type="text" className={styles.formInput} placeholder="Misal: 30 mins" value={cookTime} onChange={e => setCookTime(e.target.value)} required />
          </div>

          {/* TAGS */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Tags Populer (Tekan Enter/Koma)</label>
            <div 
              style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center',
                border: '1px solid var(--clr-outline)', padding: '0.5rem', borderRadius: '0.5rem',
                minHeight: '48px'
              }}
            >
              {tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    background: 'rgba(0, 109, 54, 0.1)', color: 'var(--clr-primary)',
                    padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600
                  }}
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                  </button>
                </span>
              ))}
              <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Contoh: pedas, sarapan..." : "Tambah tag lain..."}
                style={{
                  border: 'none', outline: 'none', flex: 1, minWidth: '150px',
                  background: 'transparent', fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* INGREDIENTS */}
          <div className={styles.formGroupFull} style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-outline-variant)' }}>
            <label className={styles.formLabel}>Bahan-bahan <span style={{ color: 'var(--clr-error)' }}>*</span></label>
            <div className={styles.dynamicList}>
              {ingredients.map((ing, idx) => (
                <div key={idx} className={styles.dynamicListItem}>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Nama bahan (Misal: Bawang Merah)" 
                    value={ing.name}
                    onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                    style={{ flex: 2 }}
                    required
                  />
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Takaran (Misal: 3 siung)" 
                    value={ing.amount}
                    onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className={styles.removeBtn} onClick={() => removeIngredient(idx)} tabIndex={-1} aria-label="Hapus">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
              <button type="button" className={styles.dynamicListBtn} onClick={addIngredient}>
                <span className="material-symbols-outlined">add</span> Tambah Bahan
              </button>
            </div>
          </div>

          {/* STEPS */}
          <div className={styles.formGroupFull} style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-outline-variant)' }}>
            <label className={styles.formLabel}>Langkah Memasak <span style={{ color: 'var(--clr-error)' }}>*</span></label>
            <div className={styles.dynamicList}>
              {steps.map((step, idx) => (
                <div key={idx} className={styles.dynamicListItem}>
                  <div style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--clr-primary)' }}>{step.stepNumber}.</div>
                  <textarea 
                    className={styles.formTextarea} 
                    placeholder="Tuliskan langkah-langkahnya..." 
                    value={step.description}
                    onChange={e => handleStepChange(idx, e.target.value)}
                    style={{ flex: 1, minHeight: '60px' }}
                    required
                  />
                  <button type="button" className={styles.removeBtn} onClick={() => removeStep(idx)} tabIndex={-1} aria-label="Hapus">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
              <button type="button" className={styles.dynamicListBtn} onClick={addStep}>
                <span className="material-symbols-outlined">add</span> Tambah Langkah
              </button>
            </div>
          </div>

        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-outline-variant)' }}>
          <button 
            type="button" 
            className={styles.cancelBtn} 
            style={{ width: 'auto', padding: '0.75rem 1.5rem', border: '1px solid var(--clr-outline)' }}
            onClick={() => router.back()}
            disabled={loading}
          >
            Batal
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading} style={{ padding: '0.75rem 2rem' }}>
            {loading ? (
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
            ) : (
              <span className="material-symbols-outlined">send</span>
            )}
            {loading ? 'Mengirim...' : 'Kirim Resep'}
          </button>
        </div>
      </form>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      </div>
    </div>
  );
}
