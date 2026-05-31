'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './PageLoader.module.css';



export default function PageLoader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Hide the loader when the window finishes loading
    if (document.readyState === 'complete') {
      // Add a slight delay to ensure the Lottie animation has a chance to play a bit
      setTimeout(() => setHidden(true), 300);
    } else {
      const onLoad = () => {
        setTimeout(() => setHidden(true), 300);
      };
      window.addEventListener('load', onLoad, { once: true });
    }
  }, []);

  return (
    <div className={`${styles.overlay} ${hidden ? styles.hidden : ''}`} aria-hidden="true">
      <div className={styles.spinner}></div>
    </div>
  );
}
