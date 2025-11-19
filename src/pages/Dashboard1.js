import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaListAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLaporan();
    // eslint-disable-next-line
  }, []);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/laporan/user', { headers: { Authorization: `Bearer ${token}` } });
      setLaporan(res.data);
    } catch (err) {
      setLaporan([]);
    }
    setLoading(false);
  };

  const laporanTerakhir = laporan.length > 0 ? laporan[0] : null;

  const menu = [
    { label: 'Dashboard', path: '/dashboard', icon: <FaListAlt />, tooltip: 'Dashboard' },
    { label: 'Buat Laporan Baru', path: '/buat-laporan', icon: <FaPlus />, tooltip: 'Buat Laporan' },
    { label: 'Riwayat Laporan', path: '/riwayat-laporan', icon: <FaListAlt />, tooltip: 'Riwayat' },
    { label: 'Profil Saya', path: '/profile', icon: <FaUser />, tooltip: 'Profil' },
    { label: 'Logout', path: '/logout', icon: <FaSignOutAlt />, tooltip: 'Logout', action: () => { logout(); navigate('/'); } },
  ];

  return (
    <div className="dashboard-container" style={{
      minHeight: '100vh',
      background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/assets/gedung-sate.jpg') center/cover no-repeat fixed`,
      position: 'relative',
      width: '100%',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Topbar */}
      <div className="topbar" style={{
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        background: 'rgba(19, 34, 53, 0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        height: '60px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)'
      }}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="menu-toggle"
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            position: 'absolute',
            left: '24px'
          }}
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/assets/logo.png" alt="Logo" style={{ height: '35px' }} />
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: '600' }}>Bapenda</span>
        </div>
      </div>

      {/* Sidebar */}
      <nav className={`sidebar`} style={{
        position: 'fixed',
        left: isSidebarOpen ? '0' : '-280px',
        top: '60px',
        width: '280px',
        height: 'calc(100vh - 60px)',
        background: 'rgba(19, 34, 53, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        transition: 'left 0.3s ease',
        zIndex: 99
      }}>
        <div className="sidebar-header">
          <div className="sidebar-avatar">{user?.nama ? user.nama[0].toUpperCase() : '?'}</div>
          <div className="sidebar-username">{user?.nama}</div>
        </div>
        <ul className="sidebar-menu">
          {menu.map(m => (
            <li key={m.path}>
              <button className="sidebar-menu-item" onClick={() => m.action ? m.action() : navigate(m.path)}>
                {m.icon} <span>{m.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="dashboard-layout" style={{ 
        paddingTop: '80px',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        padding: '20px',
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        marginLeft: isSidebarOpen ? '280px' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        <div className="dashboard-content" style={{
          background: 'rgba(19, 34, 53, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '32px'
        }}>
          <div className="dashboard-header" style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{ 
              fontSize: '28px',
              color: '#fff',
              marginBottom: '10px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>Riwayat Laporan</h2>
            <div className="dashboard-subtitle" style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '16px'
            }}>Selamat datang, {user?.nama}</div>
          </div>

          <div className="dashboard-stats" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div className="statistik-card" style={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="statistik-icon">📑</div>
              <div className="statistik-title" style={{ color: '#fff', marginBottom: '10px' }}>Jumlah Laporan</div>
              <div className="statistik-value" style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{laporan.length}</div>
            </div>
            
            <div className="statistik-card" style={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="statistik-icon">🕒</div>
              <div className="statistik-title" style={{ color: '#fff', marginBottom: '10px' }}>Laporan Terakhir</div>
              <div className="statistik-value" style={{ fontSize: '15px', color: '#fff' }}>
                {laporanTerakhir ? (
                  <>
                    <div style={{ marginBottom: '4px' }}>{new Date(laporanTerakhir.tanggal).toLocaleString()}</div>
                    <div><span style={{
                      color: laporanTerakhir.status === 'Disetujui' ? '#4ade80' : 
                             laporanTerakhir.status === 'Ditolak' ? '#f87171' : '#fbbf24',
                      fontWeight: 600
                    }}>{laporanTerakhir.status}</span></div>
                  </>
                ) : (
                  <div>Belum ada laporan</div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-riwayat" style={{ marginTop: '40px' }}>
            <div className="dashboard-riwayat-title" style={{ 
              color: '#fff', 
              marginBottom: '20px', 
              fontSize: '18px', 
              fontWeight: '600',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '12px'
            }}>
              Riwayat Laporan Terbaru
            </div>
            <div className="dashboard-riwayat-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {laporan.map(l => (
                <div key={l._id} className="dashboard-riwayat-card" style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}>
                  <div className="dashboard-riwayat-info" style={{ flex: 1, color: '#fff' }}>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{l.nama_merk} 
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginLeft: '8px' }}>({l.npwpd})</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '4px 0' }}>{l.alamat}</div>
                    <div style={{ fontSize: '13px' }}>
                      <span style={{
                        color: l.status === 'Disetujui' ? '#4ade80' : 
                               l.status === 'Ditolak' ? '#f87171' : '#fbbf24',
                        fontWeight: 600,
                        marginRight: '12px'
                      }}>{l.status}</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {new Date(l.tanggal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {Array.isArray(l.foto) && typeof l.foto[0] === 'string' && l.foto.length > 0 && (
                    <div style={{
                      minWidth: '80px',
                      height: '80px',
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <img 
                        src={`http://localhost:5000/uploads/${l.foto[0]}`} 
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
              ))}
              {laporan.length === 0 && (
                <div style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textAlign: 'center', 
                  padding: '32px',
                  background: 'rgba(30, 41, 59, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  Belum ada laporan
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;