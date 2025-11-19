import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LaporanDetail from './pages/LaporanDetail';
import PrintLaporan from './pages/PrintLaporan';
import AdminCetakLaporan from './pages/AdminCetakLaporan';
import ProfilePage from './pages/ProfilePage';
import BuatLaporan from './pages/BuatLaporan';
import RiwayatLaporan from './pages/RiwayatLaporan';
import SemuaLaporan from './pages/SemuaLaporan';
import LaporanDisetujui from './pages/LaporanDisetujui';
import LaporanDitolak from './pages/LaporanDitolak';
import DataPengguna from './pages/DataPengguna';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LogAktivitas from './pages/LogAktivitas';
import BlastWhatsApp from './pages/BlastWhatsapp';
import './App.css';
import WajibPajakPage from './pages/wajibpajakpage';
import WajibPajakManagePage from './pages/WajibPajakManagePage';
import AdminBeriInstruksi from './pages/AdminBeriIntruksi';
import UserLihatInstruksi from './pages/UserLihatIntruksi';
import StickerPage from './pages/StickerPage';
import StickerAuthRedirect from './pages/StickerAuthRedirect';
import Scanner from './pages/Scanner';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  
  if (!user) {
    // Simpan URL tujuan sebelum redirect ke login
    if (window.location.pathname.startsWith('/sticker-view/')) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
    }
    return <Navigate to="/" />;
  }
  
  if (role && user.role !== role) {
    if (user.role === 'superadmin') return <Navigate to="/superadmin/laporan" />;
    if (user.role === 'admin') return <Navigate to="/admin/laporan" />;
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* 🔓 Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* ✅ Route QRIS Scan - Paksa logout & redirect ke login */}
          <Route path="/sticker/:id" element={<StickerAuthRedirect />} />
          
          {/* ✅ Route Sticker Setelah Login - Protected */}
          <Route path="/sticker-view/:id" element={
            <PrivateRoute><StickerPage /></PrivateRoute>
          } />

          {/* 👤 User Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute role="user"><Dashboard /></PrivateRoute>
          } />
          <Route path="/buat-laporan" element={
            <PrivateRoute role="user"><BuatLaporan /></PrivateRoute>
          } />
          <Route path="/riwayat-laporan" element={
            <PrivateRoute role="user"><RiwayatLaporan /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute role="user"><ProfilePage /></PrivateRoute>
          } />
          <Route path="/intruksi" element={
            <PrivateRoute role="user"><UserLihatInstruksi /></PrivateRoute>
          } />

          {/* 🛠️ Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/laporan" element={
            <PrivateRoute role="admin"><SemuaLaporan /></PrivateRoute>
          } />
          <Route path="/admin/laporan-disetujui" element={
            <PrivateRoute role="admin"><LaporanDisetujui /></PrivateRoute>
          } />
          <Route path="/admin/laporan-ditolak" element={
            <PrivateRoute role="admin"><LaporanDitolak /></PrivateRoute>
          } />
          <Route path="/admin/laporan/:id" element={
            <PrivateRoute role="admin"><LaporanDetail /></PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute role="admin"><DataPengguna /></PrivateRoute>
          } />
          <Route path="/admin/logs" element={
            <PrivateRoute role="admin"><LogAktivitas /></PrivateRoute>
          } />
          <Route path="/admin/print/:id" element={
            <PrivateRoute role="admin"><PrintLaporan /></PrivateRoute>
          } />
          <Route path="/admin/laporan/:id/cetak" element={
            <PrivateRoute role="admin"><AdminCetakLaporan /></PrivateRoute>
          } />
          <Route path="/admin/wajib-pajak" element={
            <PrivateRoute role="admin"><WajibPajakPage/></PrivateRoute>
          } /> 
          <Route path="/admin/intruksi" element={
            <PrivateRoute role="admin"><AdminBeriInstruksi/></PrivateRoute>
          } />
          <Route path="/admin/blast" element={
            <PrivateRoute role="admin"><BlastWhatsApp /></PrivateRoute>
          } />

          {/* 🛡️ Super Admin Routes */}
          <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="/superadmin/dashboard" element={
            <PrivateRoute role="superadmin"><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/superadmin/laporan" element={
            <PrivateRoute role="superadmin"><SemuaLaporan /></PrivateRoute>
          } />
          <Route path="/superadmin/laporan-disetujui" element={
            <PrivateRoute role="superadmin"><LaporanDisetujui /></PrivateRoute>
          } />
          <Route path="/superadmin/laporan-ditolak" element={
            <PrivateRoute role="superadmin"><LaporanDitolak /></PrivateRoute>
          } />
          <Route path="/superadmin/laporan/:id" element={
            <PrivateRoute role="superadmin"><LaporanDetail /></PrivateRoute>
          } />
          <Route path="/superadmin/users" element={
            <PrivateRoute role="superadmin"><DataPengguna /></PrivateRoute>
          } />
          <Route path="/superadmin/logs" element={
            <PrivateRoute role="superadmin"><LogAktivitas /></PrivateRoute>
          } />
          <Route path="/superadmin/profile" element={
            <PrivateRoute role="superadmin"><ProfilePage /></PrivateRoute>
          } />
          <Route path="/superadmin/print/:id" element={
            <PrivateRoute role="superadmin"><PrintLaporan /></PrivateRoute>
          } />
          <Route path="/superadmin/laporan/:id/cetak" element={
            <PrivateRoute role="superadmin"><AdminCetakLaporan /></PrivateRoute>
          } />
          <Route path="/superadmin/wajib-pajak" element={
            <PrivateRoute role="superadmin"><WajibPajakPage /></PrivateRoute>
          } />
          <Route path="/superadmin/manajemen-wajibpajak" element={
            <PrivateRoute role="superadmin"><WajibPajakManagePage/></PrivateRoute>
          } />
          <Route path="/superadmin/intruksi" element={
            <PrivateRoute role="superadmin"><AdminBeriInstruksi/></PrivateRoute>
          } />
          <Route path="/superadmin/blast" element={
            <PrivateRoute role="superadmin"><BlastWhatsApp /></PrivateRoute>
          } />
          <Route path="/superadmin/scanner" element={
            <PrivateRoute role="superadmin"><Scanner /></PrivateRoute>
          } />

          {/* 🚧 Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;