import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import RecipesSection from './components/RecipesSection';
import QuoteSection from './components/QuoteSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main style={{ flexGrow: 1, paddingTop: '72px' }}>
      <HeroSection />
      <RecipesSection />
      <QuoteSection />
    </main>
  );
}
