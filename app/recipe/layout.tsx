import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function RecipeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main style={{ paddingTop: '72px' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
