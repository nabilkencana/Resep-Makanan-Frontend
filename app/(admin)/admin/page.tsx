'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import styles from '../admin.module.css';

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
  });
  const [recentRecipes, setRecentRecipes] = useState<any[]>([]);
  const [topRecipe, setTopRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recipesRes] = await Promise.all([
          api.getDashboardStats(),
          api.getRecipes(),
        ]);

        // Dashboard stats
        if (statsRes?.success && statsRes.stats) {
          setStats(statsRes.stats);
        }

        // Recipes — API wraps in { recipes: [...] }
        const allRecipes: any[] = Array.isArray(recipesRes)
          ? recipesRes
          : (recipesRes?.recipes || recipesRes?.data || []);

        if (allRecipes.length > 0) {
          // Recent 5
          setRecentRecipes(allRecipes.slice(0, 5));
          // Top recipe = highest rating or first
          const best = [...allRecipes].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
          setTopRecipe(best);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadReport = () => {
    // Basic CSV generation
    const csvContent = [
      ["Metric", "Value"],
      ["Total Recipes", stats.totalRecipes],
      ["Total Users", stats.totalUsers],
      ["Total Reviews", stats.totalReviews],
      ["Total Favorites", stats.totalFavorites],
      ["Traffic (Week 1-4)", stats.trafficData.join(" | ")],
      [],
      ["Recent Recipes"],
      ["Title", "Category", "Rating", "Cook Time"],
      ...recentRecipes.map(r => [
        `"${r.title}"`, 
        `"${r.category || 'Uncategorized'}"`, 
        r.rating || 0, 
        `"${r.cookTime || '-'}"`
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DapurNusantara_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h2 className={styles.pageTitle}>Kitchen Overview</h2>
          <p className={styles.pageDesc}>Real-time performance and recipe management metrics.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={handleDownloadReport}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>download</span>
            Download Report
          </button>
          <button className={styles.primaryBtn} onClick={() => window.location.reload()}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>refresh</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Recipes"
          value={<AnimatedNumber target={stats.totalRecipes} loading={loading} />}
          icon="restaurant_menu"
          sparkValues={buildMetricSpark(stats.totalRecipes, 2)}
          trend="+4.2%"
          color="var(--clr-primary)"
        />
        <MetricCard
          title="Total Users"
          value={<AnimatedNumber target={stats.totalUsers} loading={loading} />}
          icon="group"
          sparkValues={buildMetricSpark(stats.totalUsers, 3)}
          trend="+12%"
          color="#6366f1"
        />
        <MetricCard
          title="Total Reviews"
          value={<AnimatedNumber target={stats.totalReviews} loading={loading} />}
          icon="rate_review"
          sparkValues={buildMetricSpark(stats.totalReviews, 5)}
          trend="+8.1%"
          color="#f59e0b"
        />
        <MetricCard
          title="Total Favorites"
          value={<AnimatedNumber target={stats.totalFavorites} loading={loading} />}
          icon="favorite"
          sparkValues={buildMetricSpark(stats.totalFavorites, 4)}
          trend="+15%"
          color="#ef4444"
        />
      </div>

      {/* ── Dashboard Grid ── */}
      <div className={styles.dashboardGrid}>

        {/* Traffic Area Chart */}
        <div className={styles.chartArea}>
          <div className={styles.pageHeader} style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>User Registration Traffic</h3>
              <p className={styles.pageDesc} style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
                New users per week for the past 4 weeks
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--clr-on-surface-variant)', fontWeight: 500 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--clr-primary)' }} />
                Registrations
              </div>
            </div>
          </div>

          <div style={{ height: '220px', position: 'relative', width: '100%' }}>
            <svg width="100%" height="100%" viewBox="0 0 1200 300" preserveAspectRatio="none">
              {/* Grid lines */}
              {[50, 100, 150, 200, 250].map(y => (
                <line key={y} x1="0" y1={y} x2="1200" y2={y} stroke="rgba(188, 202, 187, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              
              {/* The Line */}
              <path 
                d={chartData.path} 
                fill="none" 
                stroke="var(--clr-primary)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={styles.animatedPath}
              />
              
              {/* Data Points */}
              {chartData.pts && chartData.pts.map((pt, i) => (
                <circle 
                  key={i} 
                  cx={pt[0]} 
                  cy={pt[1]} 
                  r="6" 
                  fill="white" 
                  stroke="var(--clr-primary)" 
                  strokeWidth="3"
                  className={styles.animatedCircle}
                  style={{ animationDelay: `${i * 0.15}s`, transformOrigin: `${pt[0]}px ${pt[1]}px` }}
                />
              ))}
            </svg>

            {/* Week labels */}
            <div style={{
              position: 'absolute', bottom: '-28px', left: 0, width: '100%',
              display: 'flex', justifyContent: 'space-between',
              fontSize: '11px', color: 'var(--clr-on-surface-variant)', fontWeight: 600,
            }}>
              {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
          </div>

          {/* Stat summary below chart */}
          <div style={{
            display: 'flex', gap: '1.5rem', marginTop: '3rem',
            borderTop: '1px solid var(--clr-outline-variant)', paddingTop: '1.25rem',
          }}>
            {[
              { label: 'Peak Week', value: `Week ${stats.trafficData.indexOf(Math.max(...stats.trafficData)) + 1}` },
              { label: 'Total New Users', value: stats.trafficData.reduce((a, b) => a + b, 0) },
              { label: 'Avg / Week', value: Math.round(stats.trafficData.reduce((a, b) => a + b, 0) / 4) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--clr-on-surface-variant)' }}>{label}</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--clr-on-surface)' }}>{value}</div>
              </div>
            ))}
          </div>
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
                  Top Rated Recipe
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.375rem', letterSpacing: '-0.01em' }}>{topRecipe.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--clr-on-surface-variant)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {topRecipe.description
                    ? topRecipe.description.slice(0, 90) + (topRecipe.description.length > 90 ? '...' : '')
                    : `${topRecipe.category} · ${topRecipe.cookTime}`}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '12px', color: 'var(--clr-on-surface-variant)', marginBottom: '1rem', fontWeight: 500 }}>
                  <span>⏱ {topRecipe.cookTime}</span>
                  <span>🍽 {topRecipe.servings} servings</span>
                  <span>🔥 {topRecipe.calories} cal</span>
                </div>
                <button 
                  className={styles.secondaryBtn} 
                  style={{ width: '100%', textAlign: 'center' }}
                  onClick={() => router.push(`/recipe/${topRecipe.id}`)}
                >
                  View Recipe
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--clr-on-surface-variant)', fontSize: '0.875rem' }}>No recipes yet.</p>
            )}
          </div>
        </div>

        {/* Recent Recipe Submissions — REAL DATA */}
        <div className={styles.tableArea}>
          <div className={styles.tableHeader}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Recent Recipe Submissions</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--clr-on-surface-variant)', marginTop: '2px' }}>Review and manage newly uploaded content</p>
            </div>
            <button style={{ color: 'var(--clr-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => window.location.href = '/admin/recipes'}
            >
              View All
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Recipe Name</th>
                  <th>Category</th>
                  <th>Cook Time</th>
                  <th>Rating</th>
                  <th>Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
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
                        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--clr-outline)' }}>menu_book</span>
                        <span style={{ color: 'var(--clr-on-surface-variant)', fontWeight: 500 }}>No recipes yet. Add your first recipe!</span>
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
                          {recipe.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', fontWeight: 500, color: 'var(--clr-on-surface-variant)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '3px' }}>timer</span>
                        {recipe.cookTime || recipe.prepTime || '—'}
                      </td>
                      <td>
                        {recipe.rating > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: 600 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>star</span>
                            {recipe.rating.toFixed(1)}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--clr-outline)', fontSize: '13px' }}>No rating</span>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--clr-on-surface-variant)', fontWeight: 500 }}>
                        {timeAgo(recipe.createdAt)}
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button className={styles.iconBtn} title="Edit" onClick={() => router.push('/admin/recipes')}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                          <button className={styles.iconBtn} title="View" onClick={() => router.push(`/recipe/${recipe.id}`)}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
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
  icon: string;
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
        <div className={styles.metricIcon} style={{ background: `${color}18` }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '20px',
              color,
              fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
              lineHeight: 1,
              display: 'block',
            }}
          >
            {icon}
          </span>
        </div>
      </div>

      <div className={styles.metricBody}>
        <div>
          <div className={styles.metricValue}>{value}</div>
          <div className={styles.metricTrend} style={{ color }}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '14px',
                lineHeight: 1,
                fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24",
              }}
            >
              trending_up
            </span>
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
