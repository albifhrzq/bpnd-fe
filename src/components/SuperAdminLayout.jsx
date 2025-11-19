import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaUsers, FaClipboardList, FaHistory, FaSignOutAlt, FaBars,
  FaCheckCircle, FaTimesCircle, FaTachometerAlt, FaPaperPlane, FaChevronDown,
  FaTools
} from 'react-icons/fa';
import backgroundImage from '../assets/gedung-sate.jpg';
import logo from '../assets/logo.png';

const SuperAdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // MENU STRUKTUR
 // MENU STRUKTUR (fix sesuai diagram)
const menu = [
  { label: 'Dashboard', path: '/superadmin/dashboard', icon: FaTachometerAlt },

  {
    label: 'Laporan',
    icon: FaClipboardList,
    children: [
      { label: 'Semua Laporan', path: '/superadmin/laporan', icon: FaClipboardList },
      { label: 'Disetujui', path: '/superadmin/laporan-disetujui', icon: FaCheckCircle },
      { label: 'Ditolak', path: '/superadmin/laporan-ditolak', icon: FaTimesCircle },
      { label: 'Instruksi', path: '/superadmin/intruksi', icon: FaCheckCircle },
    ]
  },

  {
    label: 'Wajib Pajak',
    icon: FaUsers,
    children: [
      { label: 'Input Wajib Pajak', path: '/superadmin/wajib-pajak', icon: FaUsers },
      { label: 'Manage Wajib Pajak', path: '/superadmin/manajemen-wajibpajak', icon: FaUsers },
    ]
  },

  {
    label: 'Pengguna',
    icon: FaUsers,
    children: [
      { label: 'Data Pengguna', path: '/superadmin/users', icon: FaUsers },
      { label: 'Log Aktivitas', path: '/superadmin/logs', icon: FaHistory },
    ]
  },

  {
    label: 'Tools',
    icon: FaTools,
    children: [
      { label: 'Blast WhatsApp', path: '/superadmin/blast', icon: FaPaperPlane },
       { label: 'Scanner', path: '/superadmin/scanner', icon: FaClipboardList },
    ]
  },

  {
    label: 'Logout',
    path: '/logout',
    icon: FaSignOutAlt,
    action: () => {
      logout();
      navigate('/');
    }
  },
];


  const handleMenuClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.children) {
      setOpenSubMenu(openSubMenu === item.label ? null : item.label);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div
      className="app-background"
      style={{ '--bg-image': `url(${backgroundImage})` }}
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
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: '16px',
            marginBottom: '4px'
          }}>
            {user?.name || 'Super Admin'}
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px'
          }}>
            Super Administrator
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1 }}>
          {menu.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            const isOpen = openSubMenu === item.label;

            return (
              <div key={index}>
                <div
                  onClick={() => handleMenuClick(item)}
                  style={{
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                    background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: isActive ? '4px solid #2563eb' : '4px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', marginRight: '12px' }}>
                      <IconComponent size={18} />
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                  </div>
                  {item.children && <FaChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />}
                </div>

                {item.children && isOpen && (
                  <div style={{ marginLeft: '32px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    {item.children.map((child, cIndex) => {
                      const ChildIcon = child.icon;
                      return (
                        <div
                          key={cIndex}
                          onClick={() => handleMenuClick(child)}
                          style={{
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            color: location.pathname === child.path ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                            background: location.pathname === child.path ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderLeft: location.pathname === child.path ? '4px solid #2563eb' : '4px solid transparent',
                          }}
                        >
                          <span style={{ fontSize: '16px', marginRight: '10px' }}>
                            <ChildIcon size={16} />
                          </span>
                          <span style={{ fontSize: '13px' }}>{child.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
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

export default SuperAdminLayout;
