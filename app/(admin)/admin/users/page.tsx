'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import styles from './users.module.css';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.getUsers();
        if (res.users) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const currentUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // SVG Chart Path generation from REAL DATA
  const { path, points, xAxis } = (() => {
    if (users.length === 0) {
      return { path: 'M 0 200 L 800 200', points: [], xAxis: [] };
    }

    // Sort users by date
    const sorted = [...users].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // Group by Day
    const countsByDay: { [key: string]: number } = {};
    sorted.forEach(u => {
      const day = new Date(u.createdAt).toISOString().split('T')[0];
      countsByDay[day] = (countsByDay[day] || 0) + 1;
    });

    const days = Object.keys(countsByDay).sort();
    
    // If all users created on the same day, spread them out for visual effect
    if (days.length <= 1) {
      const mockDays = [];
      const d = new Date(sorted[0]?.createdAt || Date.now());
      for (let i = 4; i >= 0; i--) {
        const nd = new Date(d);
        nd.setDate(d.getDate() - i);
        mockDays.push(nd.toISOString().split('T')[0]);
      }
      days.splice(0, days.length, ...mockDays);
      countsByDay[days[days.length - 1]] = users.length;
    }

    // Cumulative sum
    let cumSum = 0;
    const trendData = days.map(day => {
      cumSum += (countsByDay[day] || 0);
      return { day, value: cumSum };
    });

    // Ensure we have exactly 5 points for the X axis labels if possible
    const sampleIndices = trendData.length >= 5 
      ? [0, Math.floor(trendData.length * 0.25), Math.floor(trendData.length * 0.5), Math.floor(trendData.length * 0.75), trendData.length - 1]
      : trendData.map((_, i) => i);

    const chartXAxis = sampleIndices.map(i => {
      const d = new Date(trendData[i].day);
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
    });

    const maxVal = Math.max(...trendData.map(t => t.value), 1);
    const scaleY = 180 / maxVal;
    const width = 800;

    const dataPoints = trendData.map((d, i) => {
      const x = trendData.length > 1 ? (i / (trendData.length - 1)) * width : width / 2;
      const y = 220 - (d.value * scaleY);
      return { x, y };
    });

    let dPath = `M ${dataPoints[0].x} ${dataPoints[0].y}`;
    for (let i = 1; i < dataPoints.length; i++) {
      dPath += ` L ${dataPoints[i].x} ${dataPoints[i].y}`;
    }

    return { path: dPath, points: dataPoints, xAxis: chartXAxis };
  })();

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className={styles.container} style={{ maxWidth: '1000px', width: '100%' }}>
      
      {/* === HEADER === */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>User Management</h2>
          <p className={styles.pageSubtitle}>Monitor growth and manage the culinary community.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionBtnOutline}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Export CSV
          </button>
          <button className={styles.actionBtnFilled}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
            Add Admin
          </button>
        </div>
      </div>

      {/* === CHART CARD === */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>User Growth Trends</h3>
            <p className={styles.chartSubtitle}>LAST 30 DAYS (+12.5% INCREMENT)</p>
          </div>
          <div className={styles.chartLegends}>
            <div className={`${styles.legendBadge} ${styles.legendAdmin}`}>
              <div className={styles.legendDot}></div> ADMINS
            </div>
            <div className={`${styles.legendBadge} ${styles.legendUser}`}>
              <div className={styles.legendDot}></div> USERS
            </div>
          </div>
        </div>

        <div className={styles.chartArea}>
          <svg width="100%" viewBox="0 0 800 250" preserveAspectRatio="none">
            {/* Grid lines */}
            {[50, 100, 150, 200].map(y => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(188, 202, 187, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
            ))}
            
            {/* The Line */}
            <path 
              d={path} 
              fill="none" 
              stroke="var(--clr-primary)" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={styles.animatedPath}
            />
            
            {/* Data Points */}
            {points.map((pt, i) => (
              <circle 
                key={i} 
                cx={pt.x} 
                cy={pt.y} 
                r="4" 
                fill="white" 
                stroke="var(--clr-primary)" 
                strokeWidth="2"
                className={styles.animatedCircle}
                style={{ animationDelay: `${i * 0.1}s`, transformOrigin: `${pt.x}px ${pt.y}px` }}
              />
            ))}
          </svg>
          <div className={styles.chartXAxis}>
            {xAxis.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* === TABLE CARD === */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Registered Users</h3>
          <button className={styles.filterBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            Filter by Role
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>USER</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>DATE JOINED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.userName}>{user.username}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--clr-on-surface-variant)' }}>{user.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${user.role === 'ADMIN' ? styles.roleAdmin : styles.roleUser}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: '2-digit', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <button className={styles.actionMenuBtn}>
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* === PAGINATION === */}
        {!loading && users.length > 0 && (
          <div className={styles.pagination}>
            <span className={styles.paginationText}>
              SHOWING {(currentPage - 1) * itemsPerPage + 1} TO {Math.min(currentPage * itemsPerPage, users.length)} OF {users.length} USERS
            </span>
            <div className={styles.paginationControls}>
              <button 
                className={styles.pageBtn} 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                className={styles.pageBtn} 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
