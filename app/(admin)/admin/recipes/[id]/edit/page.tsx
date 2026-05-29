'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../../../../lib/api';
import styles from '../../recipes.module.css';

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Indonesian');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState<number>(4);
  const [calories, setCalories] = useState<number>(450);
  const [isPremium, setIsPremium] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState([{ stepNumber: 1, description: '' }]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.getRecipeById(recipeId);
        const recipe = res.recipe || res.data || res;
        
        setTitle(recipe.title || '');
        setDescription(recipe.description || '');
        setCategory(recipe.category || 'Indonesian');
        setPrepTime(recipe.prepTime || '');
        setCookTime(recipe.cookTime || '');
        setServings(recipe.servings || 4);
        setCalories(recipe.calories || 450);
        setIsPremium(recipe.isPremium || false);
        setImagePreview(recipe.imageUrl || null);
        
        let parsedIngredients = [];
        if (typeof recipe.ingredients === 'string') {
          try { parsedIngredients = JSON.parse(recipe.ingredients); } catch(e) {}
        } else if (Array.isArray(recipe.ingredients)) {
          parsedIngredients = recipe.ingredients;
        }

        if (parsedIngredients.length > 0) {
          setIngredients(parsedIngredients.map((i: any) => ({ 
            name: i.name || (typeof i === 'string' ? i : ''), 
            amount: i.amount || '' 
          })));
        }
        
        let parsedSteps = [];
        if (typeof recipe.steps === 'string') {
          try { parsedSteps = JSON.parse(recipe.steps); } catch(e) {}
        } else if (Array.isArray(recipe.steps)) {
          parsedSteps = recipe.steps;
        }

        if (parsedSteps.length > 0) {
          setSteps(parsedSteps.map((s: any, idx: number) => ({ 
            stepNumber: s.stepNumber || idx + 1, 
            description: s.description || (typeof s === 'string' ? s : '') 
          })));
        }
        
      } catch (err: any) {
        console.error(err);
        setError('Gagal mengambil data resep.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (recipeId) fetchRecipe();
  }, [recipeId]);

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
      let imageUrl = imagePreview && !imageFile ? imagePreview : '';
      
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
        isPremium,
        imageUrl: imageUrl || undefined,
        ingredients: validIngredients,
        steps: validSteps,
      };

      // 3. Update Recipe
      await api.updateRecipe(recipeId, payload);
      
      // 4. Redirect on success
      router.push('/admin/recipes');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memperbarui resep.');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--clr-on-surface-variant)' }}>Loading recipe data...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className={styles.container} style={{ maxWidth: '800px', width: '100%' }}>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb}>
            <span onClick={() => router.push('/admin/recipes')} style={{ cursor: 'pointer', color: 'var(--clr-on-surface-variant)' }}>Recipes</span>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>chevron_right</span>
            <span className={styles.breadcrumbActive}>Edit Recipe</span>
          </nav>
          <h2 className={styles.pageTitle}>Edit Recipe</h2>
          <p className={styles.pageSubtitle}>Update the details for this recipe.</p>
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
            <label className={styles.formLabel}>Recipe Image</label>
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
                  <p style={{ marginTop: '1rem', color: 'var(--clr-primary)', fontWeight: 600, fontSize: '0.875rem' }}>Change Image</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--clr-outline)' }}>add_photo_alternate</span>
                  <p style={{ marginTop: '1rem', color: 'var(--clr-on-surface-variant)', fontWeight: 500 }}>Click to browse or drag and drop</p>
                  <p style={{ fontSize: '12px', color: 'var(--clr-outline)' }}>PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
          </div>

          {/* BASIC INFO */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Recipe Title <span style={{ color: 'var(--clr-error)' }}>*</span></label>
            <input 
              type="text" 
              className={styles.formInput} 
              placeholder="e.g. Nasi Goreng Spesial"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Description <span style={{ color: 'var(--clr-error)' }}>*</span></label>
            <textarea 
              className={styles.formTextarea} 
              placeholder="Write a short engaging description about this recipe..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category</label>
            <select className={styles.formSelect} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Indonesian">Indonesian</option>
              <option value="Western">Western</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="Dessert">Dessert</option>
              <option value="Beverage">Beverage</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Premium Access</label>
            <select className={styles.formSelect} value={isPremium ? 'true' : 'false'} onChange={e => setIsPremium(e.target.value === 'true')}>
              <option value="false">Free (Available to all)</option>
              <option value="true">Premium (Subscribers only)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Prep Time</label>
            <input type="text" className={styles.formInput} placeholder="e.g. 15 mins" value={prepTime} onChange={e => setPrepTime(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Cook Time</label>
            <input type="text" className={styles.formInput} placeholder="e.g. 30 mins" value={cookTime} onChange={e => setCookTime(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Servings</label>
            <input type="number" className={styles.formInput} min="1" value={servings} onChange={e => setServings(Number(e.target.value))} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Calories (per serving)</label>
            <input type="number" className={styles.formInput} min="0" value={calories} onChange={e => setCalories(Number(e.target.value))} required />
          </div>

          {/* INGREDIENTS */}
          <div className={styles.formGroupFull} style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-outline-variant)' }}>
            <label className={styles.formLabel}>Ingredients</label>
            <div className={styles.dynamicList}>
              {ingredients.map((ing, idx) => (
                <div key={idx} className={styles.dynamicListItem}>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Ingredient name (e.g. Bawang Merah)" 
                    value={ing.name}
                    onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                    style={{ flex: 2 }}
                    required
                  />
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="Amount (e.g. 3 siung)" 
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
                <span className="material-symbols-outlined">add</span> Add Ingredient
              </button>
            </div>
          </div>

          {/* STEPS */}
          <div className={styles.formGroupFull} style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-outline-variant)' }}>
            <label className={styles.formLabel}>Cooking Steps</label>
            <div className={styles.dynamicList}>
              {steps.map((step, idx) => (
                <div key={idx} className={styles.dynamicListItem}>
                  <div style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--clr-primary)' }}>{step.stepNumber}.</div>
                  <textarea 
                    className={styles.formTextarea} 
                    placeholder="Describe this step..." 
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
                <span className="material-symbols-outlined">add</span> Add Step
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
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? (
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
            ) : (
              <span className="material-symbols-outlined">save</span>
            )}
            {loading ? 'Updating...' : 'Update Recipe'}
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
