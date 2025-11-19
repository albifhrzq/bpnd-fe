import React, { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { token } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/laporan/user', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setLaporan(res.data);
    } catch (err) {
      setLaporan([]);
    }
    setLoading(false);
  };

  const laporanTerakhir = laporan.length > 0 ? laporan[0] : null;

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div style={{ color: '#fff', textAlign: 'center' }}>Memuat data...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Welcome Section */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
            Selamat Datang di Bapenda
          </h2>
          <p style={{ margin: '0', color: 'rgba(255, 255, 255, 0.7)' }}>
            Sistem Pelaporan Pajak Daerah
          </p>
        </div>

        {/* Latest Report Section */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
            Laporan Terakhir
          </h3>
          
          {laporanTerakhir ? (
            <div style={{
              display: 'flex',
              gap: '18px',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>
                  {laporanTerakhir.nama_merk}
                  <span style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: '14px', 
                    marginLeft: '8px' 
                  }}>
                    ({laporanTerakhir.npwpd})
                  </span>
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '14px', 
                  margin: '4px 0' 
                }}>
                  {laporanTerakhir.alamat}
                </div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{
                    color: laporanTerakhir.status === 'Disetujui' ? '#4ade80' : 
                           laporanTerakhir.status === 'Ditolak' ? '#f87171' : '#fbbf24',
                    fontWeight: 600,
                    marginRight: '12px'
                  }}>
                    {laporanTerakhir.status}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {new Date(laporanTerakhir.tanggal).toLocaleString()}
                  </span>
                </div>
              </div>
              {Array.isArray(laporanTerakhir.foto) && typeof laporanTerakhir.foto[0] === 'string' && laporanTerakhir.foto.length > 0 && (
                <div style={{
                  minWidth: '80px',
                  height: '80px',
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <img 
                    src={`http://localhost:5000/uploads/${laporanTerakhir.foto[0]}`} 
                    alt="foto" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }} 
                  />
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              color: 'rgba(255,255,255,0.7)', 
              textAlign: 'center', 
              padding: '16px' 
            }}>
              Belum ada laporan
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;