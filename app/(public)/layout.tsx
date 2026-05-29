import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageLoader from "../components/PageLoader";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PageLoader />
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
