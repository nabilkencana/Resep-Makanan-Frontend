import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import RecipesSection from '../components/RecipesSection';
import QuoteSection from '../components/QuoteSection';
import Footer from '../components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getDashboardStats() {
  try {
    const res = await fetch(`${API_URL}/dashboard/stats`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stats;
  } catch (err) {
    return null;
  }
}

async function getRecipes() {
  try {
    const res = await fetch(`${API_URL}/recipes`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.recipes || [];
  } catch (err) {
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const stats = await getDashboardStats();
  const allRecipes = await getRecipes();
  
  // Pick top 4 recipes (e.g. latest or first 4)
  const heroRecipes = allRecipes.slice(0, 4);

  return (
    <main style={{ flexGrow: 1, paddingTop: '72px' }}>
      <HeroSection stats={stats} recipes={heroRecipes} />
      <RecipesSection search={search} />
      <QuoteSection />
    </main>
  );
}
