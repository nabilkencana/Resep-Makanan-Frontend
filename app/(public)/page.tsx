import HeroSection from '../components/HeroSection';
import RecipesSection from '../components/RecipesSection';
import QuoteSection from '../components/QuoteSection';

// NavBar & Footer sudah dipasang di (public)/layout.tsx — tidak perlu di-import di sini

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

/**
 * getDashboardStats
 * Dicache 60 detik — data statistik tidak perlu real-time untuk homepage.
 * "no-store" lama menyebabkan setiap request menunggu backend sebelum HTML dikirim.
 */
async function getDashboardStats() {
  try {
    const res = await fetch(`${API_URL}/dashboard/stats`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stats;
  } catch {
    return null; // Graceful fallback — homepage tetap tampil tanpa stats
  }
}

/**
 * getHeroRecipes
 * Hanya ambil 4 resep untuk card swap di HeroSection.
 * - Dulu: fetch semua resep (bisa ratusan) → buang 99% datanya
 * - Sekarang: limit=4 + revalidate 60 detik → jauh lebih cepat
 * Backend sudah support query ?limit (lihat recipes.controller.ts @Query limit)
 */
async function getHeroRecipes() {
  try {
    const res = await fetch(`${API_URL}/recipes?limit=4`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.recipes || [];
  } catch {
    return []; // Graceful fallback — CardSwap akan tampilkan dummy data
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  const { search } = (await searchParams) || {};

  // Promise.all: kedua fetch berjalan PARALEL, bukan berurutan.
  // Dulu: stats (sequential) + recipes (sequential) = waktu keduanya dijumlahkan
  // Sekarang: keduanya dimulai bersamaan = waktu = max(stats, recipes)
  const [stats, heroRecipes] = await Promise.all([
    getDashboardStats(),
    getHeroRecipes(),
  ]);

  return (
    <main style={{ flexGrow: 1, paddingTop: '72px' }}>
      <HeroSection stats={stats} recipes={heroRecipes} />
      <RecipesSection search={search} />
      <QuoteSection />
    </main>
  );
}
