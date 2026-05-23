import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import styles from './page.module.css';
import Image from 'next/image';
import TiltedCard from '../components/TiltedCard';

const RECIPES = [
  { id: '1', title: 'Avocado Smash Toast', time: '15 min', image: '/images/avocado_toast.png' },
  { id: '2', title: 'Sup Tomat Panggang', time: '45 min', image: '/images/roasted_tomato_soup.png' },
  { id: '3', title: 'Nourish Bowl', time: '25 min', image: '/images/nourish_bowl.png' },
];

type Meal = { title: string; image: string };
type DaySchedule = {
  day: string;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
  };
};

const SCHEDULE: DaySchedule[] = [
  { day: 'Sen', meals: { lunch: { title: 'Quinoa Power Bowl', image: '/images/quinoa_power_bowl.png' } } },
  { day: 'Sel', meals: { dinner: { title: 'Basil Pesto Pasta', image: '/images/basil_pesto_pasta.png' } } },
  { day: 'Rab', meals: {} },
  { day: 'Kam', meals: {} },
  { day: 'Jum', meals: {} },
];

const IconList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const IconFire = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" style={{ color: 'var(--clr-tertiary)' }}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const IconDrag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="9" cy="12" r="1"/>
    <circle cx="9" cy="5" r="1"/>
    <circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="12" r="1"/>
    <circle cx="15" cy="5" r="1"/>
    <circle cx="15" cy="19" r="1"/>
  </svg>
);

export default function JournalPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Perencana Makan Mingguan</h1>
            <p className={styles.subtitle}>Atur jadwal mingguan Anda dengan resep musiman yang lezat.</p>
          </div>
          <button className={styles.generateBtn}>
            <IconList />
            Buat Daftar Belanja
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.planner}>
            <div className={styles.plannerHeader}>
              <div className={styles.headerCell}>HARI</div>
              <div className={styles.headerCell}>SARAPAN</div>
              <div className={styles.headerCell}>MAKAN SIANG</div>
              <div className={styles.headerCell}>MAKAN MALAM</div>
            </div>
            
            <div className={styles.plannerBody}>
              {SCHEDULE.map((row) => (
                <div key={row.day} className={styles.plannerRow}>
                  <div className={styles.dayCell}>{row.day}</div>
                  <div className={styles.mealCell}>
                    {row.meals.breakfast && (
                      <div className={styles.mealCard}>
                        <div className={styles.mealImageWrapper}>
                          <TiltedCard
                            imageSrc={row.meals.breakfast.image}
                            altText={row.meals.breakfast.title}
                            captionText="Lihat Resep"
                            containerHeight="60px"
                            containerWidth="100%"
                            imageHeight="60px"
                            imageWidth="100%"
                            rotateAmplitude={15}
                            scaleOnHover={1.1}
                            showMobileWarning={false}
                            showTooltip={true}
                            displayOverlayContent={false}
                          />
                        </div>
                        <p className={styles.mealTitle}>{row.meals.breakfast.title}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.mealCell}>
                    {row.meals.lunch && (
                      <div className={styles.mealCard}>
                        <div className={styles.mealImageWrapper}>
                          <TiltedCard
                            imageSrc={row.meals.lunch.image}
                            altText={row.meals.lunch.title}
                            captionText="Lihat Resep"
                            containerHeight="60px"
                            containerWidth="100%"
                            imageHeight="60px"
                            imageWidth="100%"
                            rotateAmplitude={15}
                            scaleOnHover={1.1}
                            showMobileWarning={false}
                            showTooltip={true}
                            displayOverlayContent={false}
                          />
                        </div>
                        <p className={styles.mealTitle}>{row.meals.lunch.title}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.mealCell}>
                    {row.meals.dinner && (
                      <div className={styles.mealCard}>
                        <div className={styles.mealImageWrapper}>
                          <TiltedCard
                            imageSrc={row.meals.dinner.image}
                            altText={row.meals.dinner.title}
                            captionText="Lihat Resep"
                            containerHeight="60px"
                            containerWidth="100%"
                            imageHeight="60px"
                            imageWidth="100%"
                            rotateAmplitude={15}
                            scaleOnHover={1.1}
                            showMobileWarning={false}
                            showTooltip={true}
                            displayOverlayContent={false}
                          />
                        </div>
                        <p className={styles.mealTitle}>{row.meals.dinner.title}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <IconFire />
              <h2>Rekomendasi Musiman</h2>
            </div>
            <p className={styles.sidebarHint}>Tarik resep ini ke perencana untuk menyusun jadwal mingguan Anda.</p>
            
            <div className={styles.recipeList}>
              {RECIPES.map((recipe) => (
                <div key={recipe.id} className={styles.recipeItem}>
                  <div className={styles.recipeItemImage}>
                    <Image src={recipe.image} alt={recipe.title} width={60} height={60} style={{ objectFit: 'cover' }} />
                  </div>
                  <div className={styles.recipeItemInfo}>
                    <h3>{recipe.title}</h3>
                    <span className={styles.recipeTime}>{recipe.time}</span>
                  </div>
                  <button className={styles.dragHandle} aria-label="Drag to reorder">
                    <IconDrag />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
