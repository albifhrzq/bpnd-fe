import React, { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from '../components/AdminLayout';
import SuperAdminLayout from '../components/SuperAdminLayout';
import { FaEye, FaCheckCircle, FaTimesCircle, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const LaporanDitolak = () => {
  const { token, user } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [search, setSearch] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, id: null });
  const [page, setPage] = useState(1);
  const perPage = 10;
  const navigate = useNavigate();

  const Layout = user?.role === 'superadmin' ? SuperAdminLayout : AdminLayout;

  useEffect(() => {
    fetchLaporan();
  }, [tanggal]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/laporan', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setLaporan(res.data.filter(l => l.status === 'Ditolak'));
    } catch {
      setLaporan([]);
    }
    setLoading(false);
  };

  const handleSetujui = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/api/laporan/${id}/status`, { status: 'Disetujui' }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Laporan disetujui');
      fetchLaporan();
    } catch {
      toast.error('Gagal menyetujui laporan');
    }
  };

  const handleTolak = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/api/laporan/${id}/status`, { status: 'Ditolak' }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Laporan ditolak');
      fetchLaporan();
    } catch {
      toast.error('Gagal menolak laporan');
    }
  };

  const handleDetail = (id, e) => {
    e.stopPropagation();
    const prefix = user?.role === 'superadmin' ? '/superadmin' : '/admin';
    navigate(`${prefix}/laporan/${id}`);
  };

  if (loading) {
    return (
      <Layout title="Laporan Ditolak">
        <div style={{ color: '#fff', textAlign: 'center' }}>Memuat data...</div>
      </Layout>
    );
  }

  const filtered = laporan
    .filter(l => 
      l.nama_merk.toLowerCase().includes(search.toLowerCase()) ||
      l.npwpd.includes(search) ||
      l.alamat.toLowerCase().includes(search.toLowerCase())
    )
    .filter(l => !tanggal || new Date(l.tanggal).toLocaleDateString() === new Date(tanggal).toLocaleDateString());

  const maxPage = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <Layout title="Laporan Ditolak">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Search and Filter Controls */}
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
          <input
            type="text"
            placeholder="Cari laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
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
        </div>

        {/* Laporan List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {paged.map(l => (
            <div 
              key={l._id} 
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <div style={{ flex: 1, color: '#fff' }}>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>{l.nama_merk}
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginLeft: '8px' }}>({l.npwpd})</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '4px 0' }}>{l.alamat}</div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{
                    color: '#ef4444',
                    fontWeight: 600,
                    marginRight: '12px'
                  }}>Ditolak</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {new Date(l.tanggal).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={(e) => handleDetail(l._id, e)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <FaEye size={16} />
                </button>
                <button
                  onClick={(e) => handleSetujui(l._id, e)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.5)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <FaCheckCircle size={16} />
                </button>
                <button
                  onClick={(e) => handleTolak(l._id, e)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.5)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <FaTimesCircle size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setModal({ open: true, id: l._id }); }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.5)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                  title="Hapus Laporan"
                >
                  <FaTrash size={16} />
                </button>
              </div>

              {Array.isArray(l.foto) && l.foto.length > 0 && (
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
        </div>

        {/* Pagination */}
        {maxPage > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: page === 1 ? 'rgba(255, 255, 255, 0.1)' : '#2563eb',
                color: page === 1 ? 'rgba(255, 255, 255, 0.4)' : '#fff',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              <FaChevronLeft size={12} /> Sebelumnya
            </button>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: maxPage }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: p === page ? '#2563eb' : 'rgba(255, 255, 255, 0.1)',
                    color: p === page ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: p === page ? '600' : '400'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(Math.min(maxPage, page + 1))}
              disabled={page === maxPage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: page === maxPage ? 'rgba(255, 255, 255, 0.1)' : '#2563eb',
                color: page === maxPage ? 'rgba(255, 255, 255, 0.4)' : '#fff',
                cursor: page === maxPage ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Selanjutnya <FaChevronRight size={12} />
            </button>
          </div>
        )}

        {/* Info */}
        <div style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px'
        }}>
          Menampilkan {((page-1)*perPage)+1}-{Math.min(page*perPage, filtered.length)} dari {filtered.length} laporan ditolak
        </div>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
      {/* Modal konfirmasi hapus */}
      {modal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '32px',
            minWidth: '320px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '24px', color: '#111', fontWeight: 600, fontSize: '18px' }}>
              Yakin ingin menghapus laporan ini?
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/api/laporan/${modal.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    toast.success('Laporan dihapus');
                    setModal({ open: false, id: null });
                    fetchLaporan();
                  } catch {
                    toast.error('Gagal hapus laporan');
                  }
                }}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >Hapus</button>
              <button
                onClick={() => setModal({ open: false, id: null })}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: '#e5e7eb',
                  color: '#111',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >Batal</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LaporanDitolak;