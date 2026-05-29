import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from '../../../components/FavoriteButton';
import styles from './page.module.css';
import TutorialButton from './TutorialButton';
import RecipeReviews from './RecipeReviews';

interface Props {
  params: Promise<{ id: string }>;
}

async function getRecipeById(id: string) {
  try {
    // GET /recipes/:id requires JWT, so we fetch from the public list and filter by ID
    const listRes = await fetch(`http://localhost:3000/recipes`, { cache: 'no-store' });
    if (!listRes.ok) return null;
    const listData = await listRes.json();
    const recipe = (listData.recipes || []).find((r: any) => String(r.id) === String(id));
    if (!recipe) return null;

    // Fetch reviews (public endpoint)
    let totalReviews = 0;
    try {
      const reviewRes = await fetch(`http://localhost:3000/recipes/${id}/reviews`, { cache: 'no-store' });
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        totalReviews = reviewData.totalReviews || 0;
      }
    } catch (e) { console.error('Failed to fetch reviews', e); }

    // Handle dummy image URL from example.com to avoid 404
    let validImageUrl = recipe.imageUrl || '/recipe-chicken.jpg';
    if (validImageUrl.includes('example.com')) {
      validImageUrl = '/recipe-chicken.jpg';
    }

    return {
      ...recipe,
      tags: [recipe.category],
      reviews: totalReviews,
      heroSrc: validImageUrl,
      ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : (recipe.ingredients || []),
      steps: typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : (recipe.steps || []),
    };
  } catch (err) {
    console.error(err);
  }
  return null;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) return { title: 'Resep Tidak Ditemukan' };
  return {
    title: `${recipe.title} — Dapur Nusantara`,
    description: recipe.description,
  };
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <Image
          src={recipe.heroSrc}
          alt={recipe.title}
          fill
          priority
          sizes="100vw"
          className={styles.heroImg}
        />
        <div className={styles.heroOverlay} />
        {/* Back button */}
        <Link href="/" className={styles.backBtn} aria-label="Kembali ke beranda">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali
        </Link>
      </div>

      {/* ── Floating header card ── */}
      <section className={styles.headerCard}>

        <div className={styles.tagRow}>
          {recipe.tags.map((t: string) => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{recipe.title}</h1>
          <FavoriteButton recipeId={id} />
        </div>

        <p className={styles.description}>{recipe.description}</p>

        {/* Metadata row */}
        <div className={styles.metaRow}>
          {[
            {
              icon: '⭐',
              label: 'Rating',
              value: `${recipe.rating}/5`,
              sub: `(${recipe.reviews} ulasan)`,
            },
            { icon: '⏱️', label: 'Persiapan', value: recipe.prepTime },
            { icon: '🔥', label: 'Masak',     value: recipe.cookTime },
            { icon: '👥', label: 'Porsi',     value: `${recipe.servings} org` },
          ].map(m => (
            <div key={m.label} className={styles.metaItem}>
              <div className={styles.metaIcon}>{m.icon}</div>
              <div>
                <p className={styles.metaLabel}>{m.label}</p>
                <p className={styles.metaValue}>
                  {m.value}
                  {m.sub && <span className={styles.metaSub}> {m.sub}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two-column body ── */}
      <section className={styles.body}>

        {/* LEFT: sticky ingredients */}
        <aside className={styles.ingredientsCol}>
          <div className={styles.ingredientsCard}>
            <div className={styles.ingredientsHeader}>
              <h2 className={styles.colTitle}>Bahan-Bahan</h2>
              <span className={styles.servingBadge}>{recipe.servings} porsi</span>
            </div>

            <ul className={styles.ingredientList}>
              {recipe.ingredients.map((ing: any, i: number) => {
                const ingText = typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.name || ''}`.trim();
                const ingNote = typeof ing === 'object' ? ing.note : null;
                return (
                  <li key={i} className={styles.ingredientItem}>
                    <label className={styles.checkLabel} htmlFor={`ing-${i}`}>
                      <input
                        type="checkbox"
                        id={`ing-${i}`}
                        className={styles.checkInput}
                      />
                      <span className={styles.checkBox} aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
                          stroke="white" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="2,6 5,9 10,3"/>
                        </svg>
                      </span>
                      <span className={styles.ingBody}>
                        <span className={styles.ingText}>{ingText}</span>
                        {ingNote && <span className={styles.ingNote}>{ingNote}</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            <TutorialButton recipeId={recipe.id} />
          </div>
        </aside>

        {/* RIGHT: steps */}
        <div className={styles.stepsCol}>
          <h2 className={styles.colTitle}>Cara Membuat</h2>

          <ol className={styles.stepList}>
            {recipe.steps.map((s: any, index: number) => {
              const stepNum = typeof s === 'object' && s.stepNumber ? s.stepNumber : index + 1;
              const stepText = typeof s === 'string' ? s : (s.description || s.text || s.title || String(s));
              const stepTitle = typeof s === 'string' ? `Langkah ${stepNum}` : (s.title || `Langkah ${stepNum}`);
              const stepIcon = typeof s === 'object' ? s.icon : null;
              return (
                <li key={stepNum} className={styles.stepCard} id={`step-${stepNum}`}>
                  <div className={styles.stepAccent} aria-hidden="true" />
                  <div className={styles.stepLeft}>
                    <div className={styles.stepNum}>{stepNum}</div>
                    {stepIcon && <span className={styles.stepIcon}>{stepIcon}</span>}
                  </div>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepTitle}>{stepTitle}</h3>
                    <p className={styles.stepText}>{stepText}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Reviews Section ── */}
      <RecipeReviews recipeId={recipe.id} />

    </div>
  );
}
