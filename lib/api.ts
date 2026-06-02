const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const hasBody = !!options.body;

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  // Only add Content-Type when there's a body AND it's not FormData
  if (hasBody) {
    if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
      // Let the browser set the correct Content-Type with boundary for FormData
      delete headers['Content-Type'];
    } else if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }
  // GET / DELETE without body → no Content-Type, avoids unnecessary CORS preflight

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
export async function publicFetch(endpoint: string, options: RequestInit = {}) {
  const headers: any = {
    ...options.headers,
  };

  // Only add Content-Type if not a GET request to avoid preflight
  const method = options.method || 'GET';
  if (method !== 'GET' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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
  getRecipes: (search?: string, category?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const qs = params.toString();
    return fetchApi(`/recipes${qs ? `?${qs}` : ''}`);
  },
  getRecipeById: (id: string) => fetchApi(`/recipes/${id}`),
  createRecipe: (data: any) => fetchApi('/recipes', { method: 'POST', body: JSON.stringify(data) }),
  updateRecipe: (id: string, data: any) => fetchApi(`/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRecipe: (id: string) => fetchApi(`/recipes/${id}`, { method: 'DELETE' }),
  verifyRecipe: (id: string, status: string) => fetchApi(`/recipes/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  uploadRecipeImage: (formData: FormData) => fetchApi('/recipes/upload', { method: 'POST', body: formData }),

  // Auth
  login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  googleLogin: (token: string) => fetchApi('/auth/google', { method: 'POST', body: JSON.stringify({ token }) }),
  getProfile: () => fetchApi('/auth/me'),

  // Categories
  getCategories: () => fetchApi('/categories'),

  // Users
  getUsers: () => fetchApi('/users'),
  updateUser: (id: string, formData: FormData) => fetchApi(`/users/${id}`, { method: 'PATCH', body: formData }),

  // Favorites
  getFavorites: () => fetchApi('/users/me/favorites'),
  addFavorite: (recipeId: string) => fetchApi(`/users/me/favorites/${recipeId}`, { method: 'POST' }),
  removeFavorite: (recipeId: string) => fetchApi(`/users/me/favorites/${recipeId}`, { method: 'DELETE' }),

  // Reviews
  getReviews: (recipeId: string) => publicFetch(`/recipes/${recipeId}/reviews`),
  addReview: (recipeId: string, data: any) => fetchApi(`/recipes/${recipeId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (recipeId: string) => fetchApi(`/recipes/${recipeId}/reviews`, { method: 'DELETE' }),

  // Journal
  getMyJournals: () => fetchApi('/journals/me'),
  createJournal: (data: any) => fetchApi('/journals', { method: 'POST', body: JSON.stringify(data) }),
  addJournalEntry: (journalId: string, data: any) => fetchApi(`/journals/${journalId}/entries`, { method: 'POST', body: JSON.stringify(data) }),
  deleteJournalEntry: (entryId: string) => fetchApi(`/journals/entries/${entryId}`, { method: 'DELETE' }),
  getShoppingList: () => fetchApi('/journals/shopping-list'),

  // Users Activity
  getMyReviews: () => fetchApi('/users/me/reviews'),

  // Tutorials
  getTutorials: () => publicFetch('/tutorials'),
  getTutorialById: (id: string) => publicFetch(`/tutorials/${id}`),
  createTutorial: (data: any) => fetchApi('/tutorials', { method: 'POST', body: JSON.stringify(data) }),
  updateTutorial: (id: string, data: any) => fetchApi(`/tutorials/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTutorial: (id: string) => fetchApi(`/tutorials/${id}`, { method: 'DELETE' }),
  watchTutorial: (id: string) => fetchApi(`/tutorials/${id}/watch`),
  uploadTutorialVideo: (formData: FormData) => fetchApi('/tutorials/upload/video', { method: 'POST', body: formData }),
  uploadTutorialThumbnail: (formData: FormData) => fetchApi('/tutorials/upload/thumbnail', { method: 'POST', body: formData }),

  // Transactions
  createTransaction: (tutorialId: number) => fetchApi(`/transactions/${tutorialId}`, { method: 'POST' }),
  getMyTransactions: () => fetchApi('/transactions/me'),
  getAllTransactions: () => fetchApi('/transactions'),
  verifyTransaction: (id: number) => fetchApi(`/transactions/${id}/verify`, { method: 'PATCH' }),

  // Newsletter
  getNewsletters: () => fetchApi('/newsletter'),
  subscribeNewsletter: (data: { email: string }) => fetchApi('/newsletter/subscribe', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard
  getDashboardStats: () => fetchApi('/dashboard/stats'),
};
