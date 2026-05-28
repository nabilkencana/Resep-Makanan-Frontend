import styles from './page.module.css';
import JournalClient from './JournalClient';

async function getTrendingRecipes() {
  try {
    const res = await fetch('http://localhost:3000/recipes', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.recipes || [];
  } catch {
    return [];
  }
}

export default async function JournalPage() {
  const allRecipes = await getTrendingRecipes();
  return (
    <main className={styles.main}>
      <JournalClient initialRecipes={allRecipes} />
    </main>
  );
}
