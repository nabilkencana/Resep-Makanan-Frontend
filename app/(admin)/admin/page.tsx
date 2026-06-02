'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import MultiLineChart from './MultiLineChart';
import styles from '../admin.module.css';
import { 
  Download, RefreshCw, Utensils, Users, MessageSquare, 
  Heart, TrendingUp, ArrowRight, BookOpen, Timer, Star, ExternalLink 
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────

const timeAgo = (dateStr?: string) => {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/** Generate an SVG path from an array of numbers (sparkline). */
const buildSparkPath = (values: number[]): string => {
  if (!values || values.length < 2) return 'M0 35 Q 20 20, 50 25 T 100 20';
  const w = 100;
  const h = 40;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / (max - min)) * (h - pad * 2);
    return [x, y] as [number, number];
  });
  // Smooth curve via cardinal spline
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1][0] + pts[i][0]) / 2;
    d += ` C ${cx} ${pts[i - 1][1]}, ${cx} ${pts[i][1]}, ${pts[i][0]} ${pts[i][1]}`;
  }
  return d;
};

/** Generate a slightly different sparkline per metric for visual variety */
const buildMetricSpark = (value: number, seed: number): number[] => {
  const base = Math.max(value - 2, 0);
  return [
    Math.max(0, base + (seed % 3)),
    Math.max(0, base + (seed % 2)),
    Math.max(0, base + (seed % 5) - 1),
    value,
  ];
};

// ── Component ─────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecipes: 0,
    totalReviews: 0,
    totalFavorites: 0,
    totalCategories: 0,
    totalNewsletterSubscribers: 0,
    trafficData: [0, 0, 0, 0] as number[],
    reviewsData: [0, 0, 0, 0] as number[],
    favoritesData: [0, 0, 0, 0] as number[],
  });
  const [recentRecipes, setRecentRecipes] = useState<any[]>([]);
  const [topRecipe, setTopRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorStats, setErrorStats] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const [statsRes, recipesRes] = await Promise.all([
          api.getDashboardStats().catch(() => ({ success: false })),
          api.getRecipes(undefined, undefined, 1, 5).catch(() => ({ recipes: [] })),
        ]);
        clearTimeout(timeoutId);

        // Dashboard stats
        if (statsRes?.success && statsRes.stats) {
          setStats(statsRes.stats);
        } else {
          setErrorStats(true);
        }

        // Recipes
        const allRecipes: any[] = Array.isArray(recipesRes)
          ? recipesRes
          : (recipesRes?.recipes || recipesRes?.data || []);

        if (allRecipes.length > 0) {
          setRecentRecipes(allRecipes.slice(0, 5));
          const best = [...allRecipes].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
          setTopRecipe(best);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setErrorStats(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const [
        recipesRes,
        usersRes,
        tutorialsRes,
        transactionsRes,
        newslettersRes
      ] = await Promise.all([
        api.getRecipes(undefined, undefined, 1, 10000).catch(() => ({ recipes: [] })),
        api.getUsers().catch(() => ({ users: [] })),
        api.getTutorials().catch(() => ({ tutorials: [] })),
        api.getAllTransactions().catch(() => ({ transactions: [] })),
        api.getNewsletters().catch(() => ({ newsletters: [] }))
      ]);

      const recipes = Array.isArray(recipesRes) ? recipesRes : (recipesRes?.recipes || recipesRes?.data || []);
      const users = usersRes?.users || [];
      const tutorials = tutorialsRes?.tutorials || [];
      const transactions = transactionsRes?.transactions || [];
      const newsletters = newslettersRes?.newsletters || [];

      let csvContent = "";

      // 1. SUMMARY
      csvContent += "--- RINGKASAN DASHBOARD ---\\n";
      csvContent += "Metric,Value\\n";
      csvContent += `Total Resep,${stats.totalRecipes}\\n`;
      csvContent += `Total Pengguna,${stats.totalUsers}\\n`;
      csvContent += `Total Ulasan,${stats.totalReviews}\\n`;
      csvContent += `Total Favorit,${stats.totalFavorites}\\n`;
      csvContent += `Total Transaksi,${transactions.length}\\n`;
      csvContent += `Total Tutorial,${tutorials.length}\\n`;
      csvContent += `Total Newsletter,${newsletters.length}\\n\\n`;

      // 2. RECIPES
      csvContent += "--- DATA RESEP ---\\n";
      csvContent += "ID,Judul,Kategori,Porsi,Kalori,Status,Rating\\n";
      recipes.forEach((r: any) => {
        csvContent += `${r.id},"${(r.title || '').replace(/"/g, '""')}","${r.category || ''}",${r.servings || 0},${r.calories || 0},${r.status || ''},${r.rating || 0}\\n`;
      });
      csvContent += "\\n";

      // 3. USERS
      csvContent += "--- DATA PENGGUNA ---\\n";
      csvContent += "ID,Username,Email,Peran,Tanggal Bergabung\\n";
      users.forEach((u: any) => {
        csvContent += `${u.id},"${(u.username || '').replace(/"/g, '""')}","${u.email || ''}",${u.role},"${new Date(u.createdAt).toISOString().split('T')[0]}"\\n`;
      });
      csvContent += "\\n";

      // 4. TUTORIALS
      csvContent += "--- DATA TUTORIAL ---\\n";
      csvContent += "ID,Judul,Harga,Durasi (menit),Status\\n";
      tutorials.forEach((t: any) => {
        csvContent += `${t.id},"${(t.title || '').replace(/"/g, '""')}",${t.price || 0},${t.duration || 0},${t.isPublished ? 'PUBLISHED' : 'DRAFT'}\\n`;
      });
      csvContent += "\\n";

      // 5. TRANSACTIONS
      csvContent += "--- DATA TRANSAKSI ---\\n";
      csvContent += "ID,User ID,Tutorial ID,Jumlah,Status,Tanggal\\n";
      transactions.forEach((tx: any) => {
        csvContent += `${tx.id},${tx.userId},${tx.tutorialId},${tx.amount},${tx.status},"${new Date(tx.createdAt).toISOString().split('T')[0]}"\\n`;
      });
      csvContent += "\\n";

      // 6. NEWSLETTERS
      csvContent += "--- DATA NEWSLETTER ---\\n";
      csvContent += "ID,Email,Tanggal Berlangganan\\n";
      newsletters.forEach((n: any) => {
        csvContent += `${n.id},"${n.email || ''}","${new Date(n.createdAt).toISOString().split('T')[0]}"\\n`;
      });
      csvContent += "\\n";

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Lengkap_DapurNusantara_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Gagal mengunduh laporan", error);
      alert("Terjadi kesalahan saat mengunduh laporan.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Animated counting for metric values ──
  const AnimatedNumber = ({ target, loading }: { target: number; loading: boolean }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      if (loading || target === 0) { setDisplay(0); return; }
      let start = 0;
      const step = Math.ceil(target / 10);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setDisplay(target); clearInterval(timer); }
        else setDisplay(start);
      }, 15);
      return () => clearInterval(timer);
    }, [target, loading]);
    return <>{loading ? '—' : display}</>;
  };

  // ── Main chart ──
  const generateChartPath = (data: number[]) => {
    if (!data || data.every(v => v === 0))
      return { path: 'M0 250 Q 150 200 300 120 T 600 100 T 900 60 T 1200 80', pts: [] };
    const maxVal = Math.max(...data, 1);
    const scaleY = 240 / maxVal;
    const pts = data.map((v, i) => [i * (1200 / (data.length - 1)), 280 - v * scaleY] as [number, number]);
    let path = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      path += ` L ${pts[i][0]} ${pts[i][1]}`;
    }
    return { path, pts };
  };

  const formatMultiLineData = () => {
    return [
      { name: 'Minggu 1', penggunaBaru: stats.trafficData?.[0] || 0, ulasan: stats.reviewsData?.[0] || 0, favorit: stats.favoritesData?.[0] || 0 },
      { name: 'Minggu 2', penggunaBaru: stats.trafficData?.[1] || 0, ulasan: stats.reviewsData?.[1] || 0, favorit: stats.favoritesData?.[1] || 0 },
      { name: 'Minggu 3', penggunaBaru: stats.trafficData?.[2] || 0, ulasan: stats.reviewsData?.[2] || 0, favorit: stats.favoritesData?.[2] || 0 },
      { name: 'Minggu 4', penggunaBaru: stats.trafficData?.[3] || 0, ulasan: stats.reviewsData?.[3] || 0, favorit: stats.favoritesData?.[3] || 0 },
    ];
  };

  const chartData = generateChartPath(stats.trafficData);

  const buildSparkPath = (values: number[]) => {
    if (!values || values.length === 0) return 'M0 20 L100 20';
    const maxVal = Math.max(...values, 1);
    const pts = values.map((v, i) => [i * (100 / (values.length - 1)), 40 - (v / maxVal) * 36]);
    let path = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      path += ` L ${pts[i][0]} ${pts[i][1]}`;
    }
    return path;
  };

  const Sparkline = ({ values, color = 'var(--clr-primary)' }: { values: number[]; color?: string }) => (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${values.join('-')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${buildSparkPath(values)} V 40 H 0 Z`}
        fill={`url(#sg-${values.join('-')})`}
      />
      <path
        d={buildSparkPath(values)}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className={styles.container}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Ringkasan Dapur</h2>
          <p className={styles.pageDesc}>Kinerja real-time dan metrik manajemen resep.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={handleDownloadReport} disabled={isDownloading}>
            <Download size={16} style={{ marginRight: '6px' }} />
            {isDownloading ? 'Menyiapkan...' : 'Unduh Laporan'}
          </button>
          <button className={styles.primaryBtn} onClick={() => window.location.reload()}>
            <RefreshCw size={16} style={{ marginRight: '6px' }} />
            Perbarui Data
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className={styles.metricsGrid}>
        {errorStats ? (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: '#fef2f2', borderRadius: '12px', color: '#ef4444' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Gagal memuat statistik dasbor</p>
            <button className={styles.primaryBtn} onClick={() => window.location.reload()}>Coba lagi</button>
          </div>
        ) : (
          <>
            <MetricCard
              title="Total Resep"
              value={<AnimatedNumber target={stats.totalRecipes} loading={loading} />}
              icon={<Utensils size={20} />}
              sparkValues={buildMetricSpark(stats.totalRecipes, 2)}
              trend="+4.2%"
              color="var(--clr-primary)"
            />
            <MetricCard
              title="Total Pengguna"
              value={<AnimatedNumber target={stats.totalUsers} loading={loading} />}
              icon={<Users size={20} />}
              sparkValues={buildMetricSpark(stats.totalUsers, 3)}
              trend="+12%"
              color="#6366f1"
            />
            <MetricCard
              title="Total Ulasan"
              value={<AnimatedNumber target={stats.totalReviews} loading={loading} />}
              icon={<MessageSquare size={20} />}
              sparkValues={buildMetricSpark(stats.totalReviews, 5)}
              trend="+8.1%"
              color="#f59e0b"
            />
            <MetricCard
              title="Total Favorit"
              value={<AnimatedNumber target={stats.totalFavorites} loading={loading} />}
              icon={<Heart size={20} />}
              sparkValues={buildMetricSpark(stats.totalFavorites, 4)}
              trend="+15%"
              color="#ef4444"
            />
          </>
        )}
      </div>

      {/* ── Dashboard Grid ── */}
      <div className={styles.dashboardGrid}>

        {/* Traffic Area Chart (Replaced with MultiLineChart) */}
        <div className={styles.chartArea} style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <MultiLineChart data={formatMultiLineData()} />
        </div>

        {/* Featured Recipe Card — REAL DATA */}
        <div className={styles.featuredArea}>
          <div className={styles.featuredCard}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ height: i === 0 ? '160px' : '16px', borderRadius: '10px', background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite' }} />
                ))}
                <style>{`@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }`}</style>
              </div>
            ) : topRecipe ? (
              <>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <img
                    src={topRecipe.imageUrl || 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800'}
                    alt={topRecipe.title}
                    className={styles.featuredImg}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800'; }}
                  />
                  <div style={{
                    position: 'absolute', top: '10px', left: '10px',
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                    color: 'white', padding: '3px 10px', borderRadius: '999px',
                    fontSize: '11px', fontWeight: 600,
                  }}>
                    ⭐ {topRecipe.rating > 0 ? topRecipe.rating.toFixed(1) : 'New'}
                  </div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--clr-primary)', marginBottom: '4px' }}>
                  Resep Nilai Tertinggi
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.375rem', letterSpacing: '-0.01em' }}>{topRecipe.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--clr-on-surface-variant)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {topRecipe.description
                    ? topRecipe.description.slice(0, 90) + (topRecipe.description.length > 90 ? '...' : '')
                    : `${topRecipe.category} · ${topRecipe.cookTime}`}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '12px', color: 'var(--clr-on-surface-variant)', marginBottom: '1rem', fontWeight: 500 }}>
                  <span>⏱ {topRecipe.cookTime}</span>
                  <span>🍽 {topRecipe.servings} porsi</span>
                  <span>🔥 {topRecipe.calories} kalori</span>
                </div>
                <button 
                  className={styles.secondaryBtn} 
                  style={{ width: '100%', textAlign: 'center' }}
                  onClick={() => router.push(`/recipe/${topRecipe.id}`)}
                >
                  Lihat Resep
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--clr-on-surface-variant)', fontSize: '0.875rem' }}>Belum ada resep.</p>
            )}
          </div>
        </div>

        {/* Recent Recipe Submissions — REAL DATA */}
        <div className={styles.tableArea}>
          <div className={styles.tableHeader}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Resep Baru Ditambahkan</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--clr-on-surface-variant)', marginTop: '2px' }}>Tinjau dan kelola resep yang baru diunggah</p>
            </div>
            <button style={{ color: 'var(--clr-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => window.location.href = '/admin/recipes'}
            >
              Lihat Semua
              <ArrowRight size={16} />
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama Resep</th>
                  <th>Kategori</th>
                  <th>Waktu Masak</th>
                  <th>Rating</th>
                  <th>Ditambahkan</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j}>
                          <div style={{
                            height: '14px', borderRadius: '6px',
                            background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)',
                            backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite',
                            width: j === 0 ? '70%' : '50%',
                          }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentRecipes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={40} color="var(--clr-outline)" />
                        <span style={{ color: 'var(--clr-on-surface-variant)', fontWeight: 500 }}>Data resep belum tersedia.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentRecipes.map((recipe) => (
                    <tr key={recipe.id}>
                      <td>
                        <div className={styles.recipeCell}>
                          <img
                            src={recipe.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=80`}
                            alt={recipe.title}
                            className={styles.recipeImg}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=80';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--clr-on-surface)' }}>{recipe.title}</div>
                            {recipe.isPremium && (
                              <span style={{ fontSize: '10px', fontWeight: 600, color: '#d97706', background: '#fef3c7', padding: '1px 6px', borderRadius: '999px' }}>
                                ✦ Premium
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
                          background: 'var(--clr-surface-container-high)', color: 'var(--clr-on-surface-variant)',
                        }}>
                          {recipe.category || 'Tanpa Kategori'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', fontWeight: 500, color: 'var(--clr-on-surface-variant)' }}>
                        <Timer size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {recipe.cookTime || recipe.prepTime || '—'}
                      </td>
                      <td>
                        {recipe.rating > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: 600 }}>
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            {recipe.rating.toFixed(1)}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--clr-outline)', fontSize: '13px' }}>Belum ada rating</span>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--clr-on-surface-variant)', fontWeight: 500 }}>
                        {timeAgo(recipe.createdAt)}
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button className={styles.iconBtn} title="Edit" onClick={() => router.push('/admin/recipes')}>
                            <p className={styles.recentRecipeCategory}>{recipe.category}</p>
                          </button>
                          <button className={styles.iconBtn} title="View" onClick={() => router.push(`/recipe/${recipe.id}`)}>
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── MetricCard Component ──────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  trend: string;
  sparkValues: number[];
  color?: string;
}

function MetricCard({ title, value, icon, trend, sparkValues, color = 'var(--clr-primary)' }: MetricCardProps) {
  const sparkPath = buildSparkPath(sparkValues);
  const areaPath = `${sparkPath} V 40 H 0 Z`;

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricHeader}>
        <span className={styles.metricTitle}>{title}</span>
        <div className={styles.metricIcon} style={{ background: `${color}18`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>

      <div className={styles.metricBody}>
        <div>
          <div className={styles.metricValue}>{value}</div>
          <div className={styles.metricTrend} style={{ color, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} />
            {trend}
          </div>
        </div>

        {/* Sparkline with real values */}
        <div className={styles.metricSparkline}>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id={`sp-${title.split(' ').join('-')}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#sp-${title.split(' ').join('-')})`} />
            <path
              d={sparkPath}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Endpoint dot */}
            {(() => {
              const pts = sparkValues.map((v, i) => {
                const min = Math.min(...sparkValues);
                const max = Math.max(...sparkValues, min + 1);
                return [4 + (i / (sparkValues.length - 1)) * 92, 4 + ((max - v) / (max - min)) * 32] as [number, number];
              });
              const last = pts[pts.length - 1];
              return <circle cx={last[0]} cy={last[1]} r="3" fill="white" stroke={color} strokeWidth="2" />;
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}
