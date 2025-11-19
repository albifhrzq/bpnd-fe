// QUICK FIX untuk SemuaLaporan.js
import React, { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from '../components/AdminLayout';
import SuperAdminLayout from '../components/SuperAdminLayout';
import { FaEye, FaPrint } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerImg from '../assets/marker.png';

const customMarker = new L.Icon({
  iconUrl: markerImg,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const SemuaLaporan = () => {
  const { token, user } = useAuth();
  const [laporan, setLaporan] = useState([]); // PASTIKAN SELALU ARRAY
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, id: null });
  const navigate = useNavigate();

  const Layout = user?.role === 'superadmin' ? SuperAdminLayout : AdminLayout;

  useEffect(() => {
    if (token) {
      fetchLaporan();
    }
  }, [status, tanggal, token]);

  // Debug logging untuk koordinat
  useEffect(() => {
    if (Array.isArray(laporan) && laporan.length > 0) {
      console.log('Laporan dengan koordinat:', laporan.filter(l => l.latitude && l.longitude));
    }
  }, [laporan]);

  const fetchLaporan = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching all laporan...');
      const res = await api.get('/api/laporan', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('All laporan response:', res.data);
      console.log('All laporan type:', typeof res.data);
      console.log('Is all laporan array?', Array.isArray(res.data));
      
      // PASTIKAN SELALU SET ARRAY
      if (Array.isArray(res.data)) {
        setLaporan(res.data);
      } else {
        console.error('All laporan response bukan array:', res.data);
        setLaporan([]); // Set empty array jika bukan array
        setError('Data laporan tidak valid');
      }
    } catch (err) {
      console.error('Error fetching laporan:', err);
      console.error('All laporan error response:', err.response?.data);
      setError(`Gagal memuat data laporan: ${err.response?.data?.msg || err.message}`);
      setLaporan([]); // PASTIKAN SET EMPTY ARRAY SAAT ERROR
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/laporan/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Laporan ${newStatus}`);
      fetchLaporan();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Gagal update status');
    }
  };
  

  const handleDelete = async () => {
    try {
      await api.delete(`/api/laporan/${modal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Laporan dihapus');
      setModal({ open: false, id: null });
      fetchLaporan();
    } catch (err) {
      console.error('Error deleting laporan:', err);
      toast.error('Gagal hapus laporan');
    }
  };

  // Helper function untuk mendapatkan URL foto
  const getFotoUrl = (filename) => {
    if (!filename) return null;
    return `http://localhost:5000/uploads/${filename}`;
  };

  // PASTIKAN laporan adalah array sebelum filter
  const filteredLaporan = Array.isArray(laporan) ? laporan
    .filter(l => {
      if (!l) return false; // Skip jika l undefined/null
      const searchLower = search.toLowerCase();
      return (
        (l.nama_merk && l.nama_merk.toLowerCase().includes(searchLower)) ||
        (l.npwpd && l.npwpd.includes(search)) ||
        (l.alamat && l.alamat.toLowerCase().includes(searchLower))
      );
    })
    .filter(l => !status || l.status === status)
    .filter(l => {
      if (!tanggal) return true;
      try {
        return new Date(l.tanggal).toLocaleDateString() === new Date(tanggal).toLocaleDateString();
      } catch {
        return false;
      }
    }) : []; // Return empty array jika laporan bukan array

  if (loading) {
    return (
      <Layout title="Semua Laporan">
        <div style={{ color: '#fff', textAlign: 'center' }}>Memuat data...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Semua Laporan">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              onClick={fetchLaporan}
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

        {/* Debug Info - Hapus setelah masalah selesai */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          fontSize: '12px'
        }}>
          Debug: Total laporan = {Array.isArray(laporan) ? laporan.length : 'BUKAN ARRAY'} | 
          Filtered = {filteredLaporan.length} | 
          Token = {token ? 'Ada' : 'Tidak ada'}
        </div>

        {/* Peta Lokasi Laporan */}
        <div style={{ height: '350px', width: '100%', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <MapContainer center={[-6.9147, 107.6098]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Array.isArray(laporan) && laporan.filter(l => l && l.latitude && l.longitude).map(l => (
              <Marker key={l._id} position={[l.latitude, l.longitude]} icon={customMarker}>
                <Popup>
                  <div>
                    <strong>{l.nama_merk || 'Nama tidak tersedia'}</strong><br/>
                    {l.alamat || 'Alamat tidak tersedia'}<br/>
                    Status: {l.status || 'Status tidak tersedia'}<br/>
                    {l.tanggal ? new Date(l.tanggal).toLocaleString() : 'Tanggal tidak tersedia'}
                    {Array.isArray(l.foto) && l.foto.length > 0 && l.foto[0] && (
                      <div style={{marginTop: 8}}>
                        <img 
                          src={getFotoUrl(l.foto[0])} 
                          alt="foto" 
                          style={{width: 80, height: 80, objectFit: 'cover', borderRadius: 4}}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
            <option value="">Semua Status</option>
            <option value="Belum Dicek">Belum Dicek</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
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
        </div>

        {/* Laporan List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredLaporan.length === 0 ? (
            <div style={{ 
              color: 'rgba(255,255,255,0.7)', 
              textAlign: 'center', 
              padding: '32px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {error ? 'Gagal memuat data' : 'Tidak ada laporan yang sesuai dengan filter'}
            </div>
          ) : (
            filteredLaporan.map(l => {
              if (!l) return null; // Skip jika l undefined/null
              const fotoArr = Array.isArray(l.foto) ? l.foto : l.foto ? [l.foto] : [];
              return (
                <div 
                  key={l._id || Math.random()} 
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
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
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
                      }}>
                        {l.status || 'Status tidak tersedia'}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {l.tanggal ? new Date(l.tanggal).toLocaleString() : 'Tanggal tidak tersedia'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Thumbnail Foto */}
                  {fotoArr.length > 0 ? (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {fotoArr.slice(0, 3).map((foto, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:5000/uploads/${foto}`}
                          alt={`Foto ${idx + 1}`}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                      {fotoArr.length > 3 && (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          background: 'rgba(0,0,0,0.5)', 
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          +{fotoArr.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Tidak ada foto</span>
                  )}
                  
                  {/* Tombol aksi lihat detail */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const prefix = user?.role === 'superadmin' ? '/superadmin' : '/admin';
                      navigate(`${prefix}/laporan/${l._id}`);
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.5)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      color: '#fff',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                    title="Lihat Detail"
                  >
                    <FaEye size={16} />
                  </button>

                  {/* Tombol cetak BERITA ACARA */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const prefix = user?.role === 'superadmin' ? '/superadmin' : '/admin';
                      navigate(`${prefix}/laporan/${l._id}/cetak`);
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(168, 85, 247, 0.5)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      color: '#fff',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                    title="Cetak BERITA ACARA"
                  >
                    <FaPrint size={16} />
                  </button>
                  
                  {/* Tombol aksi jika status Belum Dicek */}
                  {(l.status === 'Belum Dicek' || l.status === 'Tugas Diberikan') && (
  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }} onClick={e => e.stopPropagation()}>
    <button
      onClick={async (e) => {
        e.stopPropagation();
        await handleStatus(l._id, 'Disetujui');
        const prefix = user?.role === 'superadmin' ? '/superadmin' : '/admin';
        navigate(`${prefix}/laporan/${l._id}/disetujui`);
      }}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        background: '#22c55e',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600
      }}
    >
      Setujui
    </button>

    <button
      onClick={async (e) => {
        e.stopPropagation();
        await handleStatus(l._id, 'Ditolak');
        const prefix = user?.role === 'superadmin' ? '/superadmin' : '/admin';
        navigate(`${prefix}/laporan/${l._id}/ditolak`);
      }}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        background: '#ef4444',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600
      }}
    >
      Tolak
    </button>
  </div>
)}


                </div>
              );
            }).filter(Boolean) // Remove null elements
          )}
        </div>
      </div>

      {/* Modal konfirmasi delete */}
      {modal.open && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.9)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Konfirmasi Hapus</h3>
            <p style={{ marginBottom: '24px', color: 'rgba(255,255,255,0.8)' }}>
              Apakah Anda yakin ingin menghapus laporan ini?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModal({ open: false, id: null })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </Layout>
  );
};

export default SemuaLaporan;