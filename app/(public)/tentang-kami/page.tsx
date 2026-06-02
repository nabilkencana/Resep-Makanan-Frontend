import Image from 'next/image';
import styles from './TentangKami.module.css';

const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;

const developers = [
  {
    id: 1,
    name: "Sarpra",
    role: "Lead Full-Stack Developer",
    description: "Seorang software engineer yang berdedikasi membangun antarmuka web modern dan sistem backend yang tangguh. Membangun Dapur Nusantara untuk mendigitalkan kekayaan resep autentik Indonesia dengan performa dan desain kelas atas.",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
    }
  },
  {
    id: 2,
    name: "Rania UI/UX",
    role: "Product Designer",
    description: "Merancang setiap sudut aplikasi agar terlihat cantik, modern, dan sangat mudah digunakan. Memastikan bahwa setiap sentuhan di Dapur Nusantara membawa pengalaman visual terbaik bagi para koki rumahan.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    socials: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
    }
  }
];

export const metadata = {
  title: 'Tentang Kami - Dapur Nusantara',
  description: 'Kenali para pengembang di balik pembuatan aplikasi web Dapur Nusantara.',
};

export default function TentangKamiPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Di Balik Dapur Nusantara</h1>
        <p className={styles.subtitle}>
          Kami adalah tim kecil dengan mimpi besar: mendigitalkan dan melestarikan kekayaan kuliner Nusantara agar bisa diakses oleh siapa saja, di mana saja, dengan teknologi modern.
        </p>
      </div>

      <div className={styles.grid}>
        {developers.map((dev) => (
          <div key={dev.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image 
                src={dev.image} 
                alt={dev.name}
                width={140}
                height={140}
                className={styles.image}
              />
            </div>
            <h2 className={styles.name}>{dev.name}</h2>
            <div className={styles.role}>{dev.role}</div>
            <p className={styles.description}>{dev.description}</p>
            
            <div className={styles.socialLinks}>
              {dev.socials.github && (
                <a href={dev.socials.github} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Github">
                  <GithubIcon />
                </a>
              )}
              {dev.socials.linkedin && (
                <a href={dev.socials.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="LinkedIn">
                  <LinkedinIcon />
                </a>
              )}
              {dev.socials.instagram && (
                <a href={dev.socials.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
              {dev.socials.twitter && (
                <a href={dev.socials.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Twitter">
                  <TwitterIcon />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
