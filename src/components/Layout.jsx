import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaListAlt, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import backgroundImage from '../assets/gedung-sate.jpg';
import logo from '../assets/logo.png';

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Define menu items with icon components
  const menu = [
    { label: 'Dashboard', path: '/dashboard', icon: FaListAlt },
    { label: 'Tugas', path: '/intruksi', icon: FaListAlt },
    { label: 'Buat Laporan Baru', path: '/buat-laporan', icon: FaPlus },
    { label: 'Riwayat Laporan', path: '/riwayat-laporan', icon: FaListAlt },
    { label: 'Profil Saya', path: '/profile', icon: FaUser },
    { label: 'Logout', path: '/logout', icon: FaSignOutAlt, action: () => { logout(); navigate('/'); } },
  ];

  const handleMenuClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      navigate(item.path);
    }
  };

  return (
    <div 
      className="app-background"
      style={{ 
        '--bg-image': `url(${backgroundImage})`
      }}
    >
      {/* Topbar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(19, 34, 53, 0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        height: '60px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)'
      }}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaBars size={18} />
        </button>
        
        <img 
          src={logo} 
          alt="Logo" 
          style={{ 
            height: '40px', 
            marginLeft: '16px',
            marginRight: '16px'
          }} 
        />
        
        <h1 style={{ 
          margin: '0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#fff'
        }}>
          {title}
        </h1>
      </div>

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isSidebarOpen ? 0 : '-280px',
        bottom: 0,
        width: '280px',
        background: 'rgba(19, 34, 53, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '80px 0 24px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'left 0.3s ease',
        zIndex: 90
      }}>
        {/* User Profile */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#2563eb',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: '16px',
            marginBottom: '4px'
          }}>
            {user?.name || 'User'}
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px'
          }}>
            {user?.email || 'user@example.com'}
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1 }}>
          {menu.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                onClick={() => handleMenuClick(item)}
                style={{
                  padding: '12px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  background: location.pathname === item.path ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: location.pathname === item.path ? '4px solid #2563eb' : '4px solid transparent',
                  '&:hover': {
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#fff'
                  }
                }}
              >
                <span style={{ fontSize: '18px', marginRight: '12px' }}>
                  <IconComponent size={18} />
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className={`page-container ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
