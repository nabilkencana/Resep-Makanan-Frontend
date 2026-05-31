import HeroSection from '../components/HeroSection';
import RecipesSection from '../components/RecipesSection';
import QuoteSection from '../components/QuoteSection';

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  const { search } = (await searchParams) || {};

  return (
    <main style={{ flexGrow: 1, paddingTop: '72px' }}>
      <HeroSection />
      <RecipesSection search={search} />
      <QuoteSection />
    </main>
  );
}
