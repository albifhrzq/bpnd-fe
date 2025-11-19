// QUICK FIX untuk AdminDashboard.js
import React, { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import SuperAdminLayout from '../components/SuperAdminLayout';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLaporan: 0,
    laporanBaru: 0,
    laporanDiproses: 0
  });
  const [recentLaporan, setRecentLaporan] = useState([]); // PASTIKAN SELALU ARRAY
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const Layout = user?.role === 'superadmin' ? SuperAdminLayout : AdminLayout;

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchRecentLaporan();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      const res = await api.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Stats response:', res.data);
      setStats(res.data || {
        totalUsers: 0,
        totalLaporan: 0,
        laporanBaru: 0,
        laporanDiproses: 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      console.error('Stats error response:', err.response?.data);
      setError(`Gagal memuat statistik: ${err.response?.data?.msg || err.message}`);
    }
  };

  const fetchRecentLaporan = async () => {
    try {
      console.log('Fetching recent laporan...');
      const res = await api.get('/api/admin/recent-laporan', {  
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Recent laporan response:', res.data);
      console.log('Recent laporan type:', typeof res.data);
      console.log('Is recent laporan array?', Array.isArray(res.data));
      
      // PASTIKAN SELALU SET ARRAY
      if (Array.isArray(res.data)) {
        setRecentLaporan(res.data);
      } else {
        console.error('Recent laporan response bukan array:', res.data);
        setRecentLaporan([]); // Set empty array jika bukan array
        setError('Data laporan tidak valid');
      }
    } catch (err) {
      console.error('Error fetching recent laporan:', err);
      console.error('Recent laporan error response:', err.response?.data);
      setError(`Gagal memuat laporan terbaru: ${err.response?.data?.msg || err.message}`);
      setRecentLaporan([]); // PASTIKAN SET EMPTY ARRAY SAAT ERROR
    } finally {
      setLoading(false);
    }
  };

  // Helper function untuk mendapatkan URL foto
  const getFotoUrl = (filename) => {
    if (!filename) return null;
    return `http://localhost:5000/uploads/${filename}`;
  };

  if (loading) {
    return (
      <Layout title={user?.role === 'superadmin' ? 'Dashboard Super Admin' : 'Dashboard Admin'}>
        <div style={{ color: '#fff', textAlign: 'center' }}>Memuat data...</div>
      </Layout>
    );
  }

  return (
    <Layout title={user?.role === 'superadmin' ? 'Dashboard Super Admin' : 'Dashboard Admin'}>
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          {error}
          <button 
            onClick={() => {
              fetchStats();
              fetchRecentLaporan();
            }}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '4px',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
          <div style={{ color: '#fff', marginBottom: '10px' }}>Total Pengguna</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{stats.totalUsers || 0}</div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📑</div>
          <div style={{ color: '#fff', marginBottom: '10px' }}>Total Laporan</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{stats.totalLaporan || 0}</div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔔</div>
          <div style={{ color: '#fff', marginBottom: '10px' }}>Laporan Baru</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{stats.laporanBaru || 0}</div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
          <div style={{ color: '#fff', marginBottom: '10px' }}>Sedang Diproses</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{stats.laporanDiproses || 0}</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <div style={{ 
          color: '#fff', 
          marginBottom: '20px', 
          fontSize: '18px', 
          fontWeight: '600',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '12px'
        }}>
          Laporan Terbaru
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PASTIKAN recentLaporan adalah array sebelum map */}
          {!Array.isArray(recentLaporan) || recentLaporan.length === 0 ? (
            <div style={{ 
              color: 'rgba(255,255,255,0.7)', 
              textAlign: 'center', 
              padding: '32px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {error ? 'Gagal memuat laporan' : 'Belum ada laporan'}
            </div>
          ) : (
            recentLaporan.map(l => (
              <div key={l._id || Math.random()} style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div style={{ flex: 1, color: '#fff' }}>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    {l.nama_merk || 'Nama tidak tersedia'}
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginLeft: '8px' }}>
                      ({l.npwpd || 'NPWPD tidak tersedia'})
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '4px 0' }}>
                    {l.alamat || 'Alamat tidak tersedia'}
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    <span style={{
                      color: l.status === 'Disetujui' ? '#4ade80' : 
                             l.status === 'Ditolak' ? '#f87171' : '#fbbf24',
                      fontWeight: 600,
                      marginRight: '12px'
                    }}>{l.status || 'Status tidak tersedia'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {l.tanggal ? new Date(l.tanggal).toLocaleString() : 'Tanggal tidak tersedia'}
                    </span>
                  </div>
                </div>
                {Array.isArray(l.foto) && l.foto.length > 0 && l.foto[0] && (
                  <div style={{
                    minWidth: '80px',
                    height: '80px',
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <img 
                      src={getFotoUrl(l.foto[0])}
                      alt="foto" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;