const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Recipes
  getRecipes: (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const qs = params.toString();
    return fetchApi(`/recipes${qs ? `?${qs}` : ''}`);
  },
  getRecipeById: (id: string) => fetchApi(`/recipes/${id}`),

  // Auth
  login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchApi('/auth/me'),

  // Categories
  getCategories: () => fetchApi('/categories'),

  // Favorites
  getFavorites: () => fetchApi('/users/me/favorites'),
  addFavorite: (recipeId: string) => fetchApi(`/users/me/favorites/${recipeId}`, { method: 'POST' }),
  removeFavorite: (recipeId: string) => fetchApi(`/users/me/favorites/${recipeId}`, { method: 'DELETE' }),

  // Reviews
  getReviews: (recipeId: string) => fetchApi(`/recipes/${recipeId}/reviews`),
  addReview: (recipeId: string, data: any) => fetchApi(`/recipes/${recipeId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (recipeId: string) => fetchApi(`/recipes/${recipeId}/reviews`, { method: 'DELETE' }),

  // Journal
  getMyJournals: () => fetchApi('/journals/me'),
  createJournal: (data: any) => fetchApi('/journals', { method: 'POST', body: JSON.stringify(data) }),
  addJournalEntry: (journalId: string, data: any) => fetchApi(`/journals/${journalId}/entries`, { method: 'POST', body: JSON.stringify(data) }),
  deleteJournalEntry: (entryId: string) => fetchApi(`/journals/entries/${entryId}`, { method: 'DELETE' }),
  getShoppingList: () => fetchApi('/journals/shopping-list'),

  // Newsletter
  subscribeNewsletter: (data: { email: string }) => fetchApi('/newsletter', { method: 'POST', body: JSON.stringify(data) }),
};
