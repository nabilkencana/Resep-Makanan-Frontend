'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface RecipeTabsProps {
  recipeInfo: React.ReactNode;
  tutorialSection: React.ReactNode;
  reviewsSection: React.ReactNode;
}

export default function RecipeTabs({
  recipeInfo,
  tutorialSection,
  reviewsSection,
}: RecipeTabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'tutorial' | 'review'>('info');
  const [mountedTabs, setMountedTabs] = useState({
    info: true,
    tutorial: false,
    review: false,
  });

  const handleTabClick = (tab: 'info' | 'tutorial' | 'review') => {
    setActiveTab(tab);
    if (!mountedTabs[tab]) {
      setMountedTabs((prev) => ({ ...prev, [tab]: true }));
    }
  };

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabList}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'info' ? styles.activeTab : ''}`}
          onClick={() => handleTabClick('info')}
        >
          Informasi Resep
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'tutorial' ? styles.activeTab : ''}`}
          onClick={() => handleTabClick('tutorial')}
        >
          Tutorial Video
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'review' ? styles.activeTab : ''}`}
          onClick={() => handleTabClick('review')}
        >
          Ulasan
        </button>
      </div>

      <div className={styles.tabPanel} style={{ display: activeTab === 'info' ? 'block' : 'none' }}>
        {recipeInfo}
      </div>

      <div className={styles.tabPanel} style={{ display: activeTab === 'tutorial' ? 'block' : 'none' }}>
        {mountedTabs.tutorial ? tutorialSection : null}
      </div>

      <div className={styles.tabPanel} style={{ display: activeTab === 'review' ? 'block' : 'none' }}>
        {mountedTabs.review ? reviewsSection : null}
      </div>
    </div>
  );
}
