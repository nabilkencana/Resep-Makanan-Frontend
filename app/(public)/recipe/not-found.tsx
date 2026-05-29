import Link from 'next/link';

export default function RecipeNotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <span style={{ fontSize: '3rem' }}>🍽️</span>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1c1d', margin: 0 }}>
        Resep Tidak Ditemukan
      </h1>
      <p style={{ color: '#6d7b6d', maxWidth: '360px', lineHeight: 1.6 }}>
        Sepertinya resep yang kamu cari belum ada di dapur kami. Yuk jelajahi resep lainnya!
      </p>
      <Link href="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#006d36',
        color: '#fff',
        padding: '0.7rem 1.5rem',
        borderRadius: '9999px',
        fontWeight: 600,
        textDecoration: 'none',
        fontSize: '0.9rem',
      }}>
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
