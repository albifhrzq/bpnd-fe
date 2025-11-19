import React from 'react';  
import { useLocation } from 'react-router-dom';
import './Topbar.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/buat-laporan': 'Buat Laporan',
  '/riwayat-laporan': 'Riwayat Laporan',
  '/profile': 'Profil Saya',
  '/admin': 'Admin Panel',
  '/admin/laporan': 'Semua Laporan',
  '/admin/laporan-disetujui': 'Laporan Disetujui',
  '/admin/laporan-ditolak': 'Laporan Ditolak',
  '/admin/users': 'Data Pengguna',
};

const Topbar = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'SIPERIKSA';

  return (
    <header className="topbar">
      <div className="topbar-center">
        <span className="topbar-title">{title}</span>
      </div>
    </header>
  );
};

export default Topbar;