'use client';

import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './PageLoader.module.css';

export default function PageLoader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Hide the loader when the window finishes loading
    if (document.readyState === 'complete') {
      // Add a slight delay to ensure the Lottie animation has a chance to play a bit
      setTimeout(() => setHidden(true), 3500);
    } else {
      const onLoad = () => {
        setTimeout(() => setHidden(true), 3500);
      };
      window.addEventListener('load', onLoad, { once: true });
    }
  }, []);

  return (
    <div className={`${styles.overlay} ${hidden ? styles.hidden : ''}`} aria-hidden="true">
      <div className={styles.lottieContainer}>
        <DotLottieReact
          src="https://lottie.host/21195970-ce13-43b0-92f8-ac5581ff5465/wK3O3EWzfO.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}
