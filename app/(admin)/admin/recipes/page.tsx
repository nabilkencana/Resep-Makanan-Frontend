'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import styles from './recipes.module.css';

interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  calories: number;
  rating: number;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  tags: { id: number; name: string }[];
  status?: string; // New field
  _count: {
    favorites: number;
    reviews: number;
  };
  author?: { id: number; username: string } | null;
}

const DIFFICULTIES: Record<number, { label: string; level: number }> = {};
const getDifficulty = (recipe: Recipe) => {
  // Use real cookTime to estimate difficulty
  const timeStr = recipe.cookTime || recipe.prepTime || '30';
  const minutes = parseInt(timeStr.replace(/\D/g, '')) || 30;
  if (minutes <= 20) return { label: 'Quick', level: 1 };
  if (minutes <= 45) return { label: 'Medium', level: 2 };
  return { label: 'Advanced', level: 3 };
};

const getCategoryBadgeClass = (category: string, stylesObj: any) => {
  const name = (category || '').toLowerCase();
  if (name.includes('indonesian') || name.includes('nusantara') || name.includes('indonesia')) return stylesObj.badgeIndonesian;
  if (name.includes('italian') || name.includes('italia')) return stylesObj.badgeItalian;
  if (name.includes('french') || name.includes('perancis')) return stylesObj.badgeFrench;
  if (name.includes('japanese') || name.includes('jepang')) return stylesObj.badgeJapanese;
  if (name.includes('chinese') || name.includes('cina') || name.includes('tiongkok')) return stylesObj.badgeChinese;
  if (name.includes('mexican') || name.includes('meksiko')) return stylesObj.badgeMexican;
  return stylesObj.badgeDefault;
};

const timeAgo = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
  return `${Math.floor(diffDays / 30)} month(s) ago`;
};

const StarRating = ({ rating }: { rating: number }) => {
  const stars = Math.round(rating);
  return (
    <div className={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="material-symbols-outlined" style={{
          fontSize: '14px',
          color: s <= stars ? '#f59e0b' : 'var(--clr-outline-variant)',
          fontVariationSettings: s <= stars ? "'FILL' 1" : "'FILL' 0",
        }}>star</span>
      ))}
      <span className={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : '-'}</span>
    </div>
  );
};

export default function AdminRecipes() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(''); // PENDING vs APPROVED
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState<number | null>(null);
  const recipesPerPage = 10;

  const fetchRecipes = useCallback(async (search?: string, category?: string) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch ALL recipes for admin dashboard
      const res = await api.getRecipes(search, category) as any;
      // In case we want to support passing status to getRecipes, we should update getRecipes in api.ts
      // But actually, we just let it fetch, wait api.getRecipes doesn't support status query yet
      // Let's manually fetch with status=ALL
      const url = new URL('http://localhost:3000/recipes');
      if (search) url.searchParams.append('search', search);
      if (category) url.searchParams.append('category', category);
      url.searchParams.append('status', 'ALL');
      url.searchParams.append('limit', '100');

      const token = localStorage.getItem('token');
      const apiRes = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const dataJson = await apiRes.json();
      
      const data: Recipe[] = Array.isArray(dataJson)
        ? dataJson
        : (dataJson.recipes || dataJson.data || []);
      setRecipes(data);
    } catch (err: any) {
      console.error('Failed to fetch recipes:', err);
      setError(err.message || 'Gagal memuat data resep dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Filter in frontend for difficulty and status (not supported by API)
  const filteredRecipes = recipes.filter((r) => {
    if (selectedDifficulty) {
      const { label } = getDifficulty(r);
      if (label.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
    }
    if (selectedStatus === 'premium' && !r.isPremium) return false;
    if (selectedStatus === 'free' && r.isPremium) return false;
    if (selectedStatusFilter && r.status !== selectedStatusFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const paginatedRecipes = filteredRecipes.slice((currentPage - 1) * recipesPerPage, currentPage * recipesPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRecipes(searchQuery, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    fetchRecipes(searchQuery, cat);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedStatus('');
    setSelectedStatusFilter('');
    setCurrentPage(1);
    fetchRecipes('', '');
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.deleteRecipe(id.toString());
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Gagal menghapus resep. Coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const handleVerify = async (id: number, status: string) => {
    setVerifying(id);
    try {
      await api.verifyRecipe(id.toString(), status);
      setRecipes((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch (err) {
      alert(`Gagal memverifikasi resep. Coba lagi.`);
    } finally {
      setVerifying(null);
    }
  };

  // Insights: computed from real data
  const mostFavorited = [...recipes].sort((a, b) => (b._count?.favorites || 0) - (a._count?.favorites || 0))[0];
  const mostReviewed = [...recipes].sort((a, b) => (b._count?.reviews || 0) - (a._count?.reviews || 0))[0];
  const topRated = [...recipes].sort((a, b) => b.rating - a.rating)[0];
  const premiumCount = recipes.filter((r) => r.isPremium).length;
  const categories = [...new Set(recipes.map((r) => r.category).filter(Boolean))];

  return (
    <div className={styles.container}>

      {/* === HEADER === */}
      <div className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb}>
            <span>Management</span>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>chevron_right</span>
            <span className={styles.breadcrumbActive}>Recipes</span>
          </nav>
          <h2 className={styles.pageTitle}>Recipe Library</h2>
          <p className={styles.pageSubtitle}>
            {loading ? 'Loading...' : `${filteredRecipes.length} recipes — ${premiumCount} premium`}
          </p>
        </div>
        <button className={styles.addBtn} onClick={() => router.push('/admin/recipes/new')}>
          <span className="material-symbols-outlined">add</span>
          Add New Recipe
        </button>
      </div>

      {/* === QUICK STATS === */}
      {!loading && recipes.length > 0 && (
        <div className={styles.quickStats}>
          <div className={styles.quickStatItem}>
            <span className="material-symbols-outlined" style={{ color: 'var(--clr-primary)', fontSize: '20px' }}>menu_book</span>
            <div>
              <div className={styles.quickStatValue}>{recipes.length}</div>
              <div className={styles.quickStatLabel}>Total Recipes</div>
            </div>
          </div>
          <div className={styles.quickStatItem}>
            <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '20px' }}>star</span>
            <div>
              <div className={styles.quickStatValue}>
                {recipes.length > 0 ? (recipes.reduce((s, r) => s + r.rating, 0) / recipes.length).toFixed(1) : '-'}
              </div>
              <div className={styles.quickStatLabel}>Avg. Rating</div>
            </div>
          </div>
          <div className={styles.quickStatItem}>
            <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: '20px' }}>workspace_premium</span>
            <div>
              <div className={styles.quickStatValue}>{premiumCount}</div>
              <div className={styles.quickStatLabel}>Premium</div>
            </div>
          </div>
          <div className={styles.quickStatItem}>
            <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '20px' }}>favorite</span>
            <div>
              <div className={styles.quickStatValue}>{recipes.reduce((s, r) => s + (r._count?.favorites || 0), 0)}</div>
              <div className={styles.quickStatLabel}>Total Favorites</div>
            </div>
          </div>
          <div className={styles.quickStatItem}>
            <span className="material-symbols-outlined" style={{ color: '#06b6d4', fontSize: '20px' }}>rate_review</span>
            <div>
              <div className={styles.quickStatValue}>{recipes.reduce((s, r) => s + (r._count?.reviews || 0), 0)}</div>
              <div className={styles.quickStatLabel}>Total Reviews</div>
            </div>
          </div>
          <div className={styles.quickStatItem}>
            <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px' }}>category</span>
            <div>
              <div className={styles.quickStatValue}>{categories.length}</div>
              <div className={styles.quickStatLabel}>Categories</div>
            </div>
          </div>
        </div>
      )}

      {/* === FILTER BAR === */}
      <div className={styles.filterCard}>
        <form className={styles.searchBarInline} onSubmit={handleSearch}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--clr-on-surface-variant)' }}>search</span>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.filterSearchInput}
          />
        </form>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category</label>
          <select className={styles.filterSelect} value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Cook Time</label>
          <select className={styles.filterSelect} value={selectedDifficulty} onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}>
            <option value="">Any</option>
            <option value="quick">Quick (≤20 min)</option>
            <option value="medium">Medium (≤45 min)</option>
            <option value="advanced">Long ({'>'} 45 min)</option>
          </select>
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Type</label>
          <select className={styles.filterSelect} value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}>
            <option value="">All</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status</label>
          <select className={styles.filterSelect} value={selectedStatusFilter} onChange={(e) => { setSelectedStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu Verifikasi</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        {(searchQuery || selectedCategory || selectedDifficulty || selectedStatus || selectedStatusFilter) && (
          <button onClick={handleClear} className={styles.clearBtn}>Clear All</button>
        )}
      </div>

      {/* === ERROR === */}
      {error && (
        <div className={styles.errorBanner}>
          <span className="material-symbols-outlined">error_outline</span>
          <span>{error}</span>
          <button onClick={() => fetchRecipes()} className={styles.retryBtn}>Retry</button>
        </div>
      )}

      {/* === TABLE === */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Recipe</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Cook Time</th>
                <th style={{ textAlign: 'right' }}>Engagement</th>
                <th style={{ textAlign: 'center' }}>Rating</th>
                <th style={{ textAlign: 'center' }}>Type</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className={styles.skeletonRow}>
                    <td>
                      <div className={styles.recipeCell}>
                        <div className={styles.skeletonImg} />
                        <div style={{ flex: 1 }}>
                          <div className={styles.skeletonLine} style={{ width: '60%' }} />
                          <div className={styles.skeletonLine} style={{ width: '40%', marginTop: '8px', height: '10px', opacity: 0.5 }} />
                        </div>
                      </div>
                    </td>
                    <td><div className={styles.skeletonLine} style={{ width: '70px', height: '22px', borderRadius: '999px' }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: '50px', margin: '0 auto' }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: '80px', marginLeft: 'auto' }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: '60px', margin: '0 auto' }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: '55px', margin: '0 auto', borderRadius: '999px' }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: '60px', margin: '0 auto', borderRadius: '999px' }} /></td>
                    <td><div className={styles.skeletonLine} style={{ width: '60px', marginLeft: 'auto' }} /></td>
                  </tr>
                ))
              ) : paginatedRecipes.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--clr-outline)' }}>menu_book</span>
                      <h3>No recipes found</h3>
                      <p>
                        {searchQuery || selectedCategory
                          ? 'Try adjusting your search or filters.'
                          : 'Start by adding the first recipe to your library.'}
                      </p>
                      {!searchQuery && !selectedCategory && (
                        <button className={styles.addBtn} style={{ width: 'auto' }} onClick={() => router.push('/admin/recipes/new')}>
                          <span className="material-symbols-outlined">add</span>
                          Add First Recipe
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecipes.map((recipe) => {
                  const diff = getDifficulty(recipe);
                  const favCount = recipe._count?.favorites || 0;
                  const revCount = recipe._count?.reviews || 0;

                  return (
                    <tr key={recipe.id} className={styles.tableRow}>
                      {/* Recipe Info */}
                      <td>
                        <div className={styles.recipeCell}>
                          <div className={styles.recipeImgWrapper}>
                            <img
                              src={recipe.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100`}
                              alt={recipe.title}
                              className={styles.recipeImg}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100';
                              }}
                            />
                            {recipe.isPremium && (
                              <span className={styles.premiumBadgeImg} title="Premium">
                                <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                              </span>
                            )}
                          </div>
                          <div className={styles.recipeInfo}>
                            <div className={styles.recipeName}>{recipe.title}</div>
                            <div className={styles.recipeMeta}>
                              {recipe.author && <span>by {recipe.author.username}</span>}
                              {recipe.author && <span className={styles.metaDot}>·</span>}
                              <span>{timeAgo(recipe.updatedAt)}</span>
                            </div>
                            {recipe.tags?.length > 0 && (
                              <div className={styles.tagRow}>
                                {recipe.tags.slice(0, 3).map((tag) => (
                                  <span key={tag.id} className={styles.tag}>{tag.name}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className={`${styles.badge} ${getCategoryBadgeClass(recipe.category, styles)}`}>
                          {recipe.category || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Cook Time */}
                      <td style={{ textAlign: 'center' }}>
                        <div className={styles.cookTimeWrapper}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--clr-on-surface-variant)' }}>timer</span>
                          <span className={styles.cookTimeText}>{recipe.cookTime}</span>
                        </div>
                        <span className={`${styles.diffPill} ${diff.level === 1 ? styles.diffEasy : diff.level === 2 ? styles.diffMed : styles.diffHard}`}>
                          {diff.label}
                        </span>
                      </td>

                      {/* Engagement — real data */}
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.engagementWrapper}>
                          <div className={styles.engagementStats}>
                            <div className={styles.engagementItem}>
                              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#ef4444', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                              <span>{favCount.toLocaleString()}</span>
                            </div>
                            <div className={styles.engagementItem}>
                              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--clr-on-surface-variant)' }}>rate_review</span>
                              <span>{revCount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className={styles.calorieBadge}>
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>local_fire_department</span>
                            {recipe.calories} cal
                          </div>
                        </div>
                      </td>

                      {/* Rating — real data */}
                      <td style={{ textAlign: 'center' }}>
                        <StarRating rating={recipe.rating} />
                      </td>

                      {/* Type — real data */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={recipe.isPremium ? styles.premiumChip : styles.freeChip}>
                          {recipe.isPremium ? (
                            <><span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>workspace_premium</span> Premium</>
                          ) : 'Free'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        {recipe.status === 'PENDING' && (
                          <span className={styles.badge} style={{ background: '#FEF3C7', color: '#B45309' }}>Pending</span>
                        )}
                        {recipe.status === 'APPROVED' && (
                          <span className={styles.badge} style={{ background: '#D1FAE5', color: '#047857' }}>Approved</span>
                        )}
                        {recipe.status === 'REJECTED' && (
                          <span className={styles.badge} style={{ background: '#FEE2E2', color: '#B91C1C' }}>Rejected</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className={styles.actionCell}>
                          {recipe.status === 'PENDING' && (
                            <>
                              <button 
                                className={styles.iconBtn} 
                                style={{ color: '#10B981', background: '#D1FAE5' }}
                                title="Approve" 
                                onClick={() => handleVerify(recipe.id, 'APPROVED')}
                                disabled={verifying === recipe.id}
                              >
                                <span className="material-symbols-outlined">check</span>
                              </button>
                              <button 
                                className={styles.iconBtnDanger} 
                                title="Reject" 
                                onClick={() => handleVerify(recipe.id, 'REJECTED')}
                                disabled={verifying === recipe.id}
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </>
                          )}
                          <button className={styles.iconBtn} title="View" onClick={() => router.push(`/recipe/${recipe.id}`)}>
                            <span className="material-symbols-outlined">open_in_new</span>
                          </button>
                          <button className={styles.iconBtn} title="Edit" onClick={() => router.push(`/admin/recipes/${recipe.id}/edit`)}>
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            className={styles.iconBtnDanger}
                            title="Delete"
                            onClick={() => setDeleteConfirmId(recipe.id)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredRecipes.length > recipesPerPage && (
          <div className={styles.pagination}>
            <div className={styles.paginationText}>
              Showing <strong style={{ color: 'var(--clr-on-surface)' }}>
                {(currentPage - 1) * recipesPerPage + 1}–{Math.min(currentPage * recipesPerPage, filteredRecipes.length)}
              </strong> of <strong style={{ color: 'var(--clr-on-surface)' }}>{filteredRecipes.length}</strong> recipes
            </div>
            <div className={styles.paginationControls}>
              <button className={styles.pageBtn} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const page = i + 1;
                return (
                  <button key={page} className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`} onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                );
              })}
              {totalPages > 7 && <span style={{ padding: '0 0.5rem', color: 'var(--clr-on-surface-variant)' }}>...</span>}
              {totalPages > 7 && (
                <button className={`${styles.pageBtn} ${currentPage === totalPages ? styles.pageBtnActive : ''}`} onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </button>
              )}
              <button className={styles.pageBtn} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === INSIGHTS (real data) === */}
      <div className={styles.insightsGrid}>
        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <div className={`${styles.insightIconBox} ${styles.iconBox1}`}>
              <span className="material-symbols-outlined">favorite</span>
            </div>
            <span className={styles.insightLabel}>Most Favorited</span>
          </div>
          <h4 className={styles.insightTitle}>{mostFavorited?.title || 'N/A'}</h4>
          <p className={styles.insightDesc}>{mostFavorited ? `${mostFavorited._count?.favorites || 0} saves · ${mostFavorited._count?.reviews || 0} reviews · ${mostFavorited.category}` : 'No data yet.'}</p>
        </div>

        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <div className={`${styles.insightIconBox} ${styles.iconBox2}`}>
              <span className="material-symbols-outlined">star</span>
            </div>
            <span className={styles.insightLabel}>Top Rated</span>
          </div>
          <h4 className={styles.insightTitle}>{topRated?.title || 'N/A'}</h4>
          <p className={styles.insightDesc}>{topRated ? `⭐ ${topRated.rating.toFixed(1)} · ${topRated.category}` : 'No ratings yet.'}</p>
        </div>

        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <div className={`${styles.insightIconBox} ${styles.iconBox3}`}>
              <span className="material-symbols-outlined">rate_review</span>
            </div>
            <span className={styles.insightLabel}>Most Reviewed</span>
          </div>
          <h4 className={styles.insightTitle}>{mostReviewed?.title || 'N/A'}</h4>
          <p className={styles.insightDesc}>{mostReviewed ? `${mostReviewed._count?.reviews || 0} reviews · ${mostReviewed.category}` : 'No reviews yet.'}</p>
        </div>
      </div>

      {/* === DELETE CONFIRM MODAL === */}
      {deleteConfirmId !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--clr-error)', fontVariationSettings: "'FILL' 1" }}>delete_forever</span>
            </div>
            <h3 className={styles.modalTitle}>Delete Recipe?</h3>
            <p className={styles.modalDesc}>
              Recipe <strong>"{recipes.find((r) => r.id === deleteConfirmId)?.title}"</strong> will be permanently removed. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirmId(null)} disabled={deleting}>
                Cancel
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(deleteConfirmId!)} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
