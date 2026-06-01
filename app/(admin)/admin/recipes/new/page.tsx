'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';
import styles from '../recipes.module.css';

export default function NewRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    } else {
      let imageUrl = '';
      const html = e.dataTransfer.getData('text/html');
      if (html) {
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match) imageUrl = match[1];
      }
      if (!imageUrl) {
        imageUrl = e.dataTransfer.getData('URL') || e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      }

      if (imageUrl) {
        // Remove encoded ampersands if any
        imageUrl = imageUrl.replace(/&amp;/g, '&');
        setImagePreview(imageUrl);
        setImageFile(null); // No file to upload, we'll just send the URL
      }
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
      // Filter out empty ingredients/steps
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
        imageUrl: imageUrl || undefined,
        ingredients: validIngredients,
        steps: validSteps,
        tags: tags,
      };

      // 3. Create Recipe
      await api.createRecipe(payload);
      
      // 4. Redirect on success
      router.push('/admin/recipes');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan resep.');
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className={styles.container} style={{ maxWidth: '800px', width: '100%' }}>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb}>
            <span onClick={() => router.push('/admin/recipes')} style={{ cursor: 'pointer', color: 'var(--clr-on-surface-variant)' }}>Resep</span>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>chevron_right</span>
            <span className={styles.breadcrumbActive}>Tambah Baru</span>
          </nav>
          <h2 className={styles.pageTitle}>Buat Resep Baru</h2>
          <p className={styles.pageSubtitle}>Tambahkan resep baru ke perpustakaan dapur Anda.</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner} style={{ marginBottom: '1rem' }}>
          <span className="material-symbols-outlined">error_outline</span>
          <span>{error}</span>
        </div>
      )}

      {/* FORM */}
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          
          {/* IMAGE UPLOAD */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Gambar Resep</label>
            <div 
              className={`${styles.uploadArea} ${isDragging ? styles.uploadAreaDragging : ''}`} 
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
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
                  <p style={{ marginTop: '1rem', color: 'var(--clr-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Ganti Gambar</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--clr-outline)' }}>add_photo_alternate</span>
                  <p style={{ marginTop: '1rem', color: 'var(--clr-on-surface-variant)', fontWeight: 500 }}>Klik untuk mencari atau seret dan lepas</p>
                  <p style={{ fontSize: '12px', color: 'var(--clr-outline)' }}>PNG, JPG hingga 5MB</p>
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
              placeholder="mis. Nasi Goreng Spesial"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Deskripsi <span style={{ color: 'var(--clr-error)' }}>*</span></label>
            <textarea 
              className={styles.formTextarea} 
              placeholder="Tulis deskripsi singkat yang menarik tentang resep ini..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Kategori</label>
            <select className={styles.formSelect} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Indonesian">Indonesia</option>
              <option value="Western">Barat</option>
              <option value="Japanese">Jepang</option>
              <option value="Chinese">Tiongkok</option>
              <option value="Dessert">Penutup</option>
              <option value="Beverage">Minuman</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Waktu Persiapan</label>
            <input type="text" className={styles.formInput} placeholder="mis. 15 mnt" value={prepTime} onChange={e => setPrepTime(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Waktu Masak</label>
            <input type="text" className={styles.formInput} placeholder="mis. 30 mnt" value={cookTime} onChange={e => setCookTime(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Porsi</label>
            <input type="number" className={styles.formInput} min="1" value={servings} onChange={e => setServings(Number(e.target.value))} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Kalori (per porsi)</label>
            <input type="number" className={styles.formInput} min="0" value={calories} onChange={e => setCalories(Number(e.target.value))} required />
          </div>

          {/* TAGS */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Tags (Tekan Enter/Koma)</label>
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
                placeholder={tags.length === 0 ? "Contoh: pedas, sarapan..." : "Tambah tag..."}
                style={{
                  border: 'none', outline: 'none', flex: 1, minWidth: '150px',
                  background: 'transparent', fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* INGREDIENTS */}
          <div className={styles.formGroupFull} style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-outline-variant)' }}>
            <label className={styles.formLabel}>Bahan-bahan</label>
            <div className={styles.dynamicList}>
              {ingredients.map((ing, idx) => (
                <div key={idx} className={styles.dynamicListItem}>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Nama bahan (mis. Bawang Merah)" 
                    value={ing.name}
                    onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                    style={{ flex: 2 }}
                    required
                  />
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Jumlah (mis. 3 siung)" 
                    value={ing.amount}
                    onChange={e => handleIngredientChange(idx, 'amount', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className={styles.removeBtn} onClick={() => removeIngredient(idx)} tabIndex={-1}>
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
            <label className={styles.formLabel}>Langkah Memasak</label>
            <div className={styles.dynamicList}>
              {steps.map((step, idx) => (
                <div key={idx} className={styles.dynamicListItem}>
                  <div style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--clr-primary)' }}>{step.stepNumber}.</div>
                  <textarea 
                    className={styles.formTextarea} 
                    placeholder="Jelaskan langkah ini..." 
                    value={step.description}
                    onChange={e => handleStepChange(idx, e.target.value)}
                    style={{ flex: 1, minHeight: '60px' }}
                    required
                  />
                  <button type="button" className={styles.removeBtn} onClick={() => removeStep(idx)} tabIndex={-1}>
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
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelBtn} 
            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            onClick={() => router.push('/admin/recipes')}
            disabled={loading}
          >
            Batal
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? (
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
            ) : (
              <span className="material-symbols-outlined">save</span>
            )}
            {loading ? 'Menyimpan...' : 'Simpan Resep'}
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
