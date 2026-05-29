import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import RecipesSection from '../components/RecipesSection';
import QuoteSection from '../components/QuoteSection';
import Footer from '../components/Footer';

async function getDashboardStats() {
  try {
    const res = await fetch('http://localhost:3000/dashboard/stats', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stats;
  } catch (err) {
    return null;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const stats = await getDashboardStats();

  return (
    <main style={{ flexGrow: 1, paddingTop: '72px' }}>
      <HeroSection stats={stats} />
      <RecipesSection search={search} />
      <QuoteSection />
    </main>
  );
}
