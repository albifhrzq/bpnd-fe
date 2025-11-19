import React, { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { FaFileExcel, FaSearch } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import SuperAdminLayout from '../components/SuperAdminLayout';

const aktivitasOptions = [
  { value: '', label: 'Semua Aktivitas' },
  { value: 'Disetujui', label: 'Disetujui' },
  { value: 'Ditolak', label: 'Ditolak' },
  { value: 'Dicetak', label: 'Dicetak' },
];

function exportToExcel(data) {
  // Simple export to CSV (Excel-compatible)
  const header = ['Nama Petugas','Nama Merk','NPWPD','Aktivitas','Waktu'];
  const rows = data.map(l => [
    l.petugas?.nama || '-',
    l.laporan?.nama_merk || '-',
    l.laporan?.npwpd || '-',
    l.aktivitas,
    new Date(l.waktu).toLocaleString('id-ID')
  ]);
  let csv = [header, ...rows].map(r=>r.map(x=>`"${x}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'log-aktivitas.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const LogAktivitas = () => {
  const { token, user } = useAuth();
  const [log, setLog] = useState([]);
  const [search, setSearch] = useState('');
  const [aktivitasFilter, setAktivitasFilter] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const Layout = user?.role === 'superadmin' ? SuperAdminLayout : AdminLayout;

  useEffect(() => {
    if (user?.role === 'superadmin' && token) {
      fetchLogs();
    } else if (user && user.role !== 'superadmin') {
      setLoading(false);
    }
  }, [user, token]);

  const fetchLogs = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
        const res = await api.get('/api/superadmin/logs', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Pastikan res.data adalah array
      const logData = Array.isArray(res.data) ? res.data : [];
      setLog(logData);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLog([]);
    }
    setLoading(false);
  };

  // Check user access
  if (!user || user.role !== 'superadmin') {
    return (
      <Layout title="Log Aktivitas">
        <div style={{
          padding: '40px', 
          textAlign: 'center',
          color: '#fff',
          fontSize: '16px'
        }}>
          {!user ? 'Silakan login terlebih dahulu' : 'Akses hanya untuk Super Admin'}
        </div>
      </Layout>
    );
  }

  // Filter logs
  let filtered = log.filter(l => {
    if (!l) return false;
    
    const matchAktivitas = !aktivitasFilter || l.aktivitas === aktivitasFilter;
    const matchTanggal = !tanggal || (l.waktu && new Date(l.waktu).toISOString().slice(0,10) === tanggal);
    const matchSearch = !search || (
      (l.petugas?.nama && l.petugas.nama.toLowerCase().includes(search.toLowerCase())) ||
      (l.laporan?.nama_merk && l.laporan.nama_merk.toLowerCase().includes(search.toLowerCase())) ||
      (l.laporan?.npwpd && l.laporan.npwpd.toLowerCase().includes(search.toLowerCase()))
    );
    
    return matchAktivitas && matchTanggal && matchSearch;
  });

  const total = filtered.length;
  const perPage = 10;
  const maxPage = Math.ceil(total/perPage);
  const paginatedData = filtered.slice((page-1)*perPage, page*perPage);

  // Loading state
  if (loading) {
    return (
      <Layout title="Log Aktivitas">
        <div style={{ 
          color: '#fff', 
          textAlign: 'center',
          padding: '40px',
          fontSize: '16px'
        }}>
          Memuat data...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Log Aktivitas">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Search and Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ 
            flex: 1,
            minWidth: '200px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FaSearch style={{
              position: 'absolute',
              left: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              pointerEvents: 'none'
            }} />
            <input
              type="text"
              placeholder="Cari aktivitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 16px 8px 36px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>
          <select
            value={aktivitasFilter}
            onChange={(e) => setAktivitasFilter(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {aktivitasOptions.map(opt => (
              <option key={opt.value} value={opt.value} style={{ background: '#1e293b', color: '#fff' }}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => exportToExcel(filtered)}
            disabled={filtered.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: filtered.length === 0 ? 'rgba(100, 116, 139, 0.5)' : '#2563eb',
              color: '#fff',
              fontSize: '14px',
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: filtered.length === 0 ? 0.5 : 1
            }}
            title={filtered.length === 0 ? 'Tidak ada data untuk diekspor' : 'Export ke Excel'}
          >
            <FaFileExcel /> Export Excel
          </button>
        </div>

        {/* Log List */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}>
          {paginatedData.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px'
            }}>
              {log.length === 0 ? 
                'Belum ada log aktivitas' : 
                'Tidak ada data yang sesuai dengan filter'
              }
            </div>
          ) : (
            <>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                color: '#fff'
              }}>
                <thead>
                  <tr style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Petugas
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Nama Merk
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      NPWPD
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Aktivitas
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Waktu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((l, index) => (
                    <tr key={l._id || index} style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        {l.petugas?.nama || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        {l.laporan?.nama_merk || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        {l.laporan?.npwpd || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: l.aktivitas === 'Disetujui' ? 'rgba(74, 222, 128, 0.2)' : 
                                    l.aktivitas === 'Ditolak' ? 'rgba(248, 113, 113, 0.2)' :
                                    'rgba(251, 191, 36, 0.2)',
                          color: l.aktivitas === 'Disetujui' ? '#4ade80' : 
                                l.aktivitas === 'Ditolak' ? '#f87171' :
                                '#fbbf24',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {l.aktivitas || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        {l.waktu ? new Date(l.waktu).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {maxPage > 1 && (
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(30, 41, 59, 0.3)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: page === 1 ? 'rgba(100, 116, 139, 0.3)' : 'rgba(59, 130, 246, 0.5)',
                      color: '#fff',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    Previous
                  </button>
                  
                  <span style={{ 
                    color: '#fff', 
                    fontSize: '14px',
                    margin: '0 16px'
                  }}>
                    Page {page} of {maxPage} ({total} total)
                  </span>
                  
                  <button
                    onClick={() => setPage(Math.min(maxPage, page + 1))}
                    disabled={page === maxPage}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: page === maxPage ? 'rgba(100, 116, 139, 0.3)' : 'rgba(59, 130, 246, 0.5)',
                      color: '#fff',
                      cursor: page === maxPage ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: page === maxPage ? 0.5 : 1
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LogAktivitas;