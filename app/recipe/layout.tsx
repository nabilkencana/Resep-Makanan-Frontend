export default function RecipeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={{ paddingTop: '72px' }}>
      {children}
    </main>
  );
}
