export let recipesPromise: Promise<any> | null = null;
export let statsPromise: Promise<any> | null = null;

export function getHomeRecipes(apiUrl: string) {
  if (!recipesPromise) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    recipesPromise = fetch(`${apiUrl}/recipes?limit=8`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    })
      .then((r) => {
        clearTimeout(timeoutId);
        if (!r.ok) throw new Error('Failed to fetch recipes');
        return r.json();
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        recipesPromise = null; // Reset on error so next call can retry
        console.error('getHomeRecipes error:', err);
        return { recipes: [] };
      });
  }
  return recipesPromise;
}

export function getDashboardStats(apiUrl: string) {
  if (!statsPromise) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    statsPromise = fetch(`${apiUrl}/dashboard/stats`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    })
      .then((r) => {
        clearTimeout(timeoutId);
        if (!r.ok) throw new Error('Failed to fetch stats');
        return r.json();
      })
      .catch((err) => {
        clearTimeout(timeoutId);
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
