export let recipesPromise: Promise<any> | null = null;
export let statsPromise: Promise<any> | null = null;

export function getHomeRecipes(apiUrl: string) {
  if (!recipesPromise) {
    const fetchPromise = fetch(`${apiUrl}/recipes?limit=10`, {
      next: { revalidate: 60 },
    }).then((r) => {
      if (!r.ok) throw new Error('Failed to fetch recipes');
      return r.json();
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Recipes fetch timeout')), 8000)
    );

    recipesPromise = Promise.race([fetchPromise, timeoutPromise])
      .catch((err) => {
        recipesPromise = null; // Reset on error so next call can retry
        console.error('getHomeRecipes error:', err);
        return { recipes: [] };
      });
  }
  return recipesPromise;
}

export function getDashboardStats(apiUrl: string) {
  if (!statsPromise) {
    const fetchPromise = fetch(`${apiUrl}/dashboard/stats`, {
      next: { revalidate: 60 },
    }).then((r) => {
      if (!r.ok) throw new Error('Failed to fetch stats');
      return r.json();
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Stats fetch timeout')), 5000)
    );

    statsPromise = Promise.race([fetchPromise, timeoutPromise])
      .catch((err) => {
        statsPromise = null; // Reset on error
        console.error('getDashboardStats error:', err);
        return { stats: null };
      });
  }
  return statsPromise;
}

// Optional helper to clear cache if needed during client-side navigation
export function clearHomeCache() {
  recipesPromise = null;
  statsPromise = null;
}
