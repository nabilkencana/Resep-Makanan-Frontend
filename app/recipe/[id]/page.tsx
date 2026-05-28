import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from '../../components/FavoriteButton';
import styles from './page.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

async function getRecipeById(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/recipes/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    
    // Fetch reviews
    let totalReviews = 0;
    try {
      const reviewRes = await fetch(`http://localhost:3000/api/recipes/${id}/reviews`, { cache: 'no-store' });
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        totalReviews = reviewData.totalReviews || 0;
      }
    } catch (e) { console.error('Failed to fetch reviews', e); }

    if (data.recipe) {
      return {
        ...data.recipe,
        tags: [data.recipe.category],
        reviews: totalReviews,
        heroSrc: data.recipe.imageUrl || '/recipe-chicken.jpg',
        ingredients: typeof data.recipe.ingredients === 'string' ? JSON.parse(data.recipe.ingredients) : data.recipe.ingredients,
        steps: typeof data.recipe.steps === 'string' ? JSON.parse(data.recipe.steps) : data.recipe.steps,
      };
    }
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
              {recipe.ingredients.map((ing: { amount: string; name: string; note?: string }, i: number) => (
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
                      <span className={styles.ingText}>
                        <strong className={styles.ingAmount}>{ing.amount}</strong> {ing.name}
                      </span>
                      {ing.note && <span className={styles.ingNote}>{ing.note}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <button className={styles.groceryBtn} id="btn-video-tutorial">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              Tonton Video Tutorial
            </button>
          </div>
        </aside>

        {/* RIGHT: steps */}
        <div className={styles.stepsCol}>
          <h2 className={styles.colTitle}>Cara Membuat</h2>

          <ol className={styles.stepList}>
            {recipe.steps.map((s: { step: number; title: string; text: string; icon: string }) => (
              <li key={s.step} className={styles.stepCard} id={`step-${s.step}`}>
                <div className={styles.stepAccent} aria-hidden="true" />
                <div className={styles.stepLeft}>
                  <div className={styles.stepNum}>{s.step}</div>
                  <span className={styles.stepIcon}>{s.icon}</span>
                </div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepText}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

    </div>
  );
}
