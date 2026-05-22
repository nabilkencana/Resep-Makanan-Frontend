'use client';

import styles from './page.module.css';

export default function NewsletterForm() {
  return (
    <form
      className={styles.newsletterForm}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        id="newsletter-email"
        className={styles.newsletterInput}
        placeholder="email@kamu.com"
        aria-label="Alamat email untuk newsletter"
      />
      <button
        type="submit"
        className={styles.newsletterBtn}
        id="newsletter-submit"
      >
        Daftar Sekarang
      </button>
    </form>
  );
}
