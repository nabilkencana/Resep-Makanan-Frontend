'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import styles from './users.module.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
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

  const handleRoleChange = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Ubah peran pengguna ini menjadi ${newRole}?`)) return;
    
    try {
      const formData = new FormData();
      formData.append('role', newRole);
      await api.updateUser(userId.toString(), formData);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Gagal mengubah peran pengguna');
    }
    setOpenMenuId(null);
  };

  const handleExportCSV = () => {
    if (users.length === 0) return;
    
    const headers = ['ID', 'Username', 'Email', 'Peran', 'Tanggal Bergabung'];
    
    const csvRows = users.map(user => {
      return [
        user.id,
        `"${user.username.replace(/"/g, '""')}"`,
        `"${user.email}"`,
        user.role,
        `"${new Date(user.createdAt).toLocaleDateString('id-ID', {
          month: 'short', day: '2-digit', year: 'numeric'
        })}"`
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_pengguna_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Data generation from REAL DATA
  const chartData = (() => {
    if (users.length === 0) return [];
    
    // Sort users by date
    const sorted = [...users].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // Group by Day
    const countsByDay: { [key: string]: { admin: number, user: number } } = {};
    sorted.forEach(u => {
      const day = new Date(u.createdAt).toISOString().split('T')[0];
      if (!countsByDay[day]) countsByDay[day] = { admin: 0, user: 0 };
      if (u.role === 'ADMIN') countsByDay[day].admin++;
      else countsByDay[day].user++;
    });

    let days = Object.keys(countsByDay).sort();
    
    // If all users created on the same day, spread them out for visual effect
    if (days.length <= 1) {
      const mockDays = [];
      const d = new Date(sorted[0]?.createdAt || Date.now());
      for (let i = 4; i >= 0; i--) {
        const nd = new Date(d);
        nd.setDate(d.getDate() - i);
        const dayStr = nd.toISOString().split('T')[0];
        mockDays.push(dayStr);
        if (!countsByDay[dayStr]) countsByDay[dayStr] = { admin: 0, user: 0 };
      }
      days = mockDays;
      countsByDay[days[days.length - 1]] = {
        admin: sorted.filter(u => u.role === 'ADMIN').length,
        user: sorted.filter(u => u.role !== 'ADMIN').length,
      };
    }

    // Cumulative sum
    let cumAdmin = 0;
    let cumUser = 0;
    return days.map(day => {
      cumAdmin += countsByDay[day].admin;
      cumUser += countsByDay[day].user;
      return {
        name: new Date(day).toLocaleDateString('id-ID', { month: 'short', day: '2-digit' }).toUpperCase(),
        Admin: cumAdmin,
        Pengguna: cumUser
      };
    });
  })();

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className={styles.container} style={{ maxWidth: '1000px', width: '100%' }}>
      
      {/* === HEADER === */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Manajemen Pengguna</h2>
          <p className={styles.pageSubtitle}>Pantau pertumbuhan dan kelola komunitas kuliner.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionBtnOutline} onClick={handleExportCSV}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* === CHART CARD === */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Tren Pertumbuhan Pengguna</h3>
            <p className={styles.chartSubtitle}>30 HARI TERAKHIR (PENINGKATAN +12.5%)</p>
          </div>
          <div className={styles.chartLegends}>
            <div className={`${styles.legendBadge} ${styles.legendAdmin}`}>
              <div className={styles.legendDot}></div> ADMIN
            </div>
            <div className={`${styles.legendBadge} ${styles.legendUser}`}>
              <div className={styles.legendDot}></div> PENGGUNA
            </div>
          </div>
        </div>

        <div className={styles.chartArea} style={{ height: '300px', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="Pengguna" 
                stroke="#006d36" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="Admin" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === TABLE CARD === */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Pengguna Terdaftar</h3>
          <button className={styles.filterBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
            Filter Berdasarkan Peran
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>PENGGUNA</th>
                <th>EMAIL</th>
                <th>PERAN</th>
                <th>TANGGAL BERGABUNG</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Memuat pengguna...</td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Pengguna tidak ditemukan.</td>
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
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        month: 'short', day: '2-digit', year: 'numeric'
                      })}
                    </td>
                    <td style={{ position: 'relative' }}>
                      <button 
                        className={styles.actionMenuBtn}
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>

                      {openMenuId === user.id && (
                        <div className={styles.dropdownMenu}>
                          <button 
                            className={styles.dropdownItem}
                            onClick={() => handleRoleChange(user.id, user.role)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              {user.role === 'ADMIN' ? 'person' : 'admin_panel_settings'}
                            </span>
                            Jadikan {user.role === 'ADMIN' ? 'User' : 'Admin'}
                          </button>
                        </div>
                      )}
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
              MENAMPILKAN {(currentPage - 1) * itemsPerPage + 1} HINGGA {Math.min(currentPage * itemsPerPage, users.length)} DARI {users.length} PENGGUNA
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
