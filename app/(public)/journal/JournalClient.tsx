'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import TiltedCard from '../../components/TiltedCard';
import { fetchApi } from '@/lib/api';

const IconList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const IconFire = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--clr-tertiary)' }}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const IconDrag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ cursor: 'grab' }}>
    <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
  </svg>
);

const DAYS = [
  { label: 'Senin', value: 1 },
  { label: 'Selasa', value: 2 },
  { label: 'Rabu', value: 3 },
  { label: 'Kamis', value: 4 },
  { label: 'Jumat', value: 5 },
  { label: 'Sabtu', value: 6 },
  { label: 'Minggu', value: 7 },
];

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'];

export default function JournalClient({ initialRecipes }: { initialRecipes: any[] }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [journal, setJournal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [draggedRecipe, setDraggedRecipe] = useState<any>(null);
  const [recipes, setRecipes] = useState(initialRecipes);
  
  // Shopping List Modal
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shoppingList_checked');
      if (saved) {
        try { setCheckedItems(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, []);

  const toggleCheck = (name: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [name]: !prev[name] };
      localStorage.setItem('shoppingList_checked', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchJournal();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchJournal = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetchApi('/journals/me');
      
      let currentJournal = null;
      if (res && res.journals && res.journals.length > 0) {
        // Assume the first one or we can sort by date
        currentJournal = res.journals[0];
      }
      
      if (!currentJournal) {
        // Create new journal for this week (Monday)
        const d = new Date();
        const day = d.getDay() || 7; // Get current day number, converting Sun. to 7
        d.setHours(-24 * (day - 1)); // Set to Monday
        
        const createRes = await fetchApi('/journals', {
          method: 'POST',
          body: JSON.stringify({ weekStart: d.toISOString() })
        });
        currentJournal = createRes.journal;
      }
      
      setJournal(currentJournal);
      
      // If we need more recipes (not just trending), we could fetch them here
      if (!silent) {
        const recipesRes = await fetchApi('/recipes');
        if (recipesRes && recipesRes.recipes) {
          setRecipes(recipesRes.recipes);
        }
      }
    } catch (err) {
      console.error('Error fetching journal:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, recipe: any, entryId?: number | string) => {
    e.dataTransfer.setData('recipeId', recipe.id.toString());
    if (entryId) {
      e.dataTransfer.setData('entryId', entryId.toString());
    }
    setDraggedRecipe(recipe);
  };

  const handleDrop = async (e: React.DragEvent, dayOfWeek: number, mealType: string) => {
    e.preventDefault();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.borderColor = 'transparent';
      e.currentTarget.style.background = 'transparent';
    }
    if (!journal) return;
    
    const recipeIdStr = e.dataTransfer.getData('recipeId');
    const entryIdStr = e.dataTransfer.getData('entryId');
    
    if (!recipeIdStr) return;
    const recipeId = parseInt(recipeIdStr, 10);
    const recipeObj = recipes.find(r => r.id === recipeId) || (entryIdStr ? journal.entries.find((ent:any)=>ent.id===parseInt(entryIdStr,10))?.recipe : null);
    
    // Check if dropping in the exact same spot
    if (entryIdStr) {
       const existingEntry = journal.entries.find((ent:any)=>ent.id===parseInt(entryIdStr,10));
       if (existingEntry && existingEntry.dayOfWeek === dayOfWeek && existingEntry.mealType === mealType) {
         setDraggedRecipe(null);
         return;
       }
    }
    
    // Optimistic Update UI
    if (recipeObj) {
      setJournal((prev: any) => {
        let newEntries = prev.entries ? prev.entries.filter((ent: any) => !(ent.dayOfWeek === dayOfWeek && ent.mealType === mealType)) : [];
        if (entryIdStr) {
          newEntries = newEntries.filter((ent: any) => ent.id !== parseInt(entryIdStr, 10));
        }
        return {
          ...prev,
          entries: [...newEntries, { id: 'temp-' + Date.now(), dayOfWeek, mealType, recipe: recipeObj }]
        };
      });
    }
    
    try {
      if (entryIdStr && !entryIdStr.startsWith('temp-')) {
         await fetchApi(`/journals/entries/${entryIdStr}`, { method: 'DELETE' });
      }
      await fetchApi(`/journals/${journal.id}/entries`, {
        method: 'POST',
        body: JSON.stringify({ recipeId, dayOfWeek, mealType })
      });
      // Refresh journal silently to sync IDs
      fetchJournal(true);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan ke jadwal');
      fetchJournal(true); // Revert optimistic update on failure
    }
    setDraggedRecipe(null);
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Hapus dari jadwal?')) return;
    
    // Optimistic Delete
    setJournal((prev: any) => ({
      ...prev,
      entries: prev.entries.filter((ent: any) => ent.id !== entryId)
    }));
    
    try {
      if (typeof entryId === 'number') {
        await fetchApi(`/journals/entries/${entryId}`, { method: 'DELETE' });
      }
      fetchJournal(true);
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
      fetchJournal(true);
    }
  };

  const handleShoppingList = async () => {
    try {
      const res = await fetchApi('/journals/shopping-list');
      
      // The backend returns a flat array: [{ name, amount }, ...]
      // We should group them by name in the frontend
      const rawList = res.shoppingList || [];
      const grouped = rawList.reduce((acc: any, item: any) => {
        const key = item.name.toLowerCase().trim();
        if (!acc[key]) acc[key] = { name: item.name, count: 0, amounts: [] };
        acc[key].count += 1;
        if (item.amount) acc[key].amounts.push(item.amount);
        return acc;
      }, {});
      
      setShoppingList(Object.values(grouped));
      setShowShoppingList(true);
    } catch (err: any) {
      alert('Gagal mengambil daftar belanja: ' + err.message);
    }
  };

  // Helper to find entry for a specific cell
  const getEntryForCell = (day: number, type: string) => {
    if (!journal || !journal.entries) return null;
    return journal.entries.find((e: any) => e.dayOfWeek === day && e.mealType === type);
  };

  if (!isLoggedIn && !loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '20px', border: '1px solid #e8e8ea' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1c1d' }}>Masuk untuk Mengatur Jurnal</h2>
          <p style={{ color: '#6d7b6d', marginBottom: '2rem' }}>Anda perlu akun untuk menyimpan jadwal masakan mingguan Anda.</p>
          <Link href="/auth" style={{ background: '#006d36', color: '#fff', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Perencana Makan Mingguan</h1>
          <p className={styles.subtitle}>Tarik (drag) resep dari kanan ke dalam jadwal Anda.</p>
        </div>
        <button className={styles.generateBtn} onClick={handleShoppingList} disabled={loading || !journal?.entries?.length}>
          <IconList />
          Buat Daftar Belanja
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Memuat jurnal Anda...</div>
      ) : (
        <div className={styles.content}>
          <div className={styles.planner}>
            <div className={styles.plannerHeader}>
              <div className={styles.headerCell}>HARI</div>
              <div className={styles.headerCell}>SARAPAN</div>
              <div className={styles.headerCell}>MAKAN SIANG</div>
              <div className={styles.headerCell}>MAKAN MALAM</div>
            </div>
            
            <div className={styles.plannerBody}>
              {DAYS.map((day) => (
                <div key={day.value} className={styles.plannerRow}>
                  <div className={styles.dayCell}>{day.label}</div>
                  
                  {MEAL_TYPES.map((type) => {
                    const entry = getEntryForCell(day.value, type);
                    const isDragOver = draggedRecipe != null; // Simplified
                    return (
                      <div 
                        key={type} 
                        className={styles.mealCell}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => handleDrop(e, day.value, type)}
                        style={{ position: 'relative' }}
                      >
                        {entry && entry.recipe ? (
                          <div 
                            className={styles.mealCard}
                            draggable={!String(entry.id).startsWith('temp-')}
                            onDragStart={(e) => {
                              if (String(entry.id).startsWith('temp-')) {
                                e.preventDefault();
                                return;
                              }
                              handleDragStart(e, entry.recipe, entry.id);
                            }}
                            style={{ cursor: String(entry.id).startsWith('temp-') ? 'wait' : 'grab', position: 'relative' }}
                          >
                            <button 
                              onClick={() => handleDeleteEntry(entry.id)}
                              style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', borderRadius: '50%', width: 22, height: 22, border: 'none', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                            >
                              ✕
                            </button>
                            <div className={styles.mealImageWrapper}>
                              <TiltedCard
                                imageSrc={entry.recipe.imageUrl || '/recipe-chicken.jpg'}
                                altText={entry.recipe.title}
                                captionText="Lihat Resep"
                                containerHeight="60px"
                                containerWidth="100%"
                                imageHeight="60px"
                                imageWidth="100%"
                                rotateAmplitude={15}
                                scaleOnHover={1.1}
                                showMobileWarning={false}
                                showTooltip={true}
                                displayOverlayContent={false}
                              />
                            </div>
                            <p className={styles.mealTitle} style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', lineHeight: '1.2' }}>{entry.recipe.title}</p>
                          </div>
                        ) : (
                          <div style={{ width: '100%', height: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed transparent', borderRadius: '12px', transition: 'all 0.2s' }} 
                               onDragEnter={(e) => {
                                 e.currentTarget.style.borderColor = '#006d36';
                                 e.currentTarget.style.background = 'rgba(0,109,54,0.05)';
                               }}
                               onDragLeave={(e) => {
                                 e.currentTarget.style.borderColor = 'transparent';
                                 e.currentTarget.style.background = 'transparent';
                               }}
                               onDrop={(e) => {
                                 e.currentTarget.style.borderColor = 'transparent';
                                 e.currentTarget.style.background = 'transparent';
                               }}
                          >
                            <span style={{ color: '#bccabb', fontSize: '0.8rem', pointerEvents: 'none' }}>+ Drop di sini</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <IconFire />
              <h2>Semua Resep</h2>
            </div>
            <p className={styles.sidebarHint}>Tarik resep ini ke perencana untuk menyusun jadwal mingguan Anda.</p>
            
            <div className={styles.recipeList} style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {recipes.length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Belum ada resep saat ini.</p>
              ) : (
                recipes.map((recipe: any) => (
                  <div 
                    key={recipe.id} 
                    className={styles.recipeItem}
                    draggable
                    onDragStart={(e) => handleDragStart(e, recipe)}
                    style={{ cursor: 'grab' }}
                  >
                    <div className={styles.recipeItemImage}>
                      <Image 
                        src={recipe.imageUrl || '/recipe-chicken.jpg'} 
                        alt={recipe.title} 
                        width={60} height={60} 
                        style={{ objectFit: 'cover' }} 
                      />
                    </div>
                    <div className={styles.recipeItemInfo}>
                      <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem' }}>{recipe.title}</h3>
                      <span className={styles.recipeTime}>{recipe.cookTime}</span>
                    </div>
                    <div className={styles.dragHandle}>
                      <IconDrag />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Modal */}
      {showShoppingList && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setShowShoppingList(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconList /> Daftar Belanja Anda
            </h2>
            
            {shoppingList.length === 0 ? (
              <p>Daftar belanja kosong. Silakan tambahkan resep ke jurnal Anda terlebih dahulu.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {shoppingList.map((item, idx) => {
                  const isChecked = !!checkedItems[item.name];
                  return (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: isChecked ? '#f0fdf4' : '#f9f9fb', borderRadius: '12px', border: '1px solid #e8e8ea', transition: 'background 0.2s' }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => toggleCheck(item.name)}
                        style={{ width: '18px', height: '18px', accentColor: '#006d36', cursor: 'pointer' }} 
                      />
                      <div style={{ opacity: isChecked ? 0.6 : 1, textDecoration: isChecked ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                        <span style={{ fontWeight: 'bold', color: '#1a1c1d', display: 'block' }}>{item.name}</span>
                        <span style={{ fontSize: '0.8rem', color: '#6d7b6d' }}>
                          Dibutuhkan di {item.count} resep {item.amounts.length > 0 ? `(total: ${item.amounts.join(' + ')})` : ''}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            
            <button 
              onClick={() => setShowShoppingList(false)}
              style={{ width: '100%', padding: '1rem', background: '#006d36', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '2rem', cursor: 'pointer' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
