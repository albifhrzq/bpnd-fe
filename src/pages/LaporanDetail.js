import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';

const LaporanDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [laporan, setLaporan] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [showCatatanModal, setShowCatatanModal] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/laporan/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setLaporan(res.data))
      .catch(() => setLaporan(null));
  }, [id, token]);

  if (!laporan) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(30, 41, 59, 0.5)'
    }}>
      <div style={{ color: '#fff' }}>Memuat data...</div>
    </div>
  );

  const fotoArr = Array.isArray(laporan.foto) ? laporan.foto : laporan.foto ? [laporan.foto] : [];

  const handlePrint = () => {
    window.print();
  };

  const handleStatusAction = (status) => {
    setStatusAction(status);
    setShowCatatanModal(true);
  };

  const handleSubmitStatus = async () => {
    try {
      await api.put(`/api/laporan/${laporan._id}/status`, 
        { status: statusAction, catatan }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await api.get(`/api/laporan/${laporan._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setLaporan(res.data);
      setShowCatatanModal(false);
      setCatatan('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Modal untuk catatan
  const CatatanModal = () => {
    if (!showCatatanModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ 
            color: '#fff', 
            marginTop: 0,
            marginBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '12px'
          }}>
            {statusAction === 'Disetujui' ? 'Setujui Laporan' : 'Tolak Laporan'}
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#fff',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Catatan (Opsional)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan untuk pengguna..."
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowCatatanModal(false);
                setCatatan('');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSubmitStatus}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: statusAction === 'Disetujui' ? '#22c55e' : '#ef4444',
                color: '#fff',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {statusAction === 'Disetujui' ? 'Setujui' : 'Tolak'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)',
      padding: '20px'
    }}>
      {/* Render modal catatan */}
      <CatatanModal />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(59, 130, 246, 0.5)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaArrowLeft size={16} /> Kembali
            </button>
          </div>

        </div>

        {/* Title Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          color: '#fff'
        }}>
          <h1 style={{ 
            fontSize: '24px',
            marginBottom: '8px'
          }}>LAPORAN PEMERIKSAAN</h1>
          <p style={{ 
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0
          }}>No. {laporan.npwpd}</p>
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 12px',
            color: '#fff'
          }}>
            <tbody>
              <tr>
                <td style={{ width: '200px', paddingRight: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>Nama Merk</td>
                <td style={{ fontWeight: '500' }}>{laporan.nama_merk}</td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>NPWPD</td>
                <td style={{ fontWeight: '500' }}>{laporan.npwpd}</td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Alamat</td>
                <td style={{ fontWeight: '500' }}>{laporan.alamat}</td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Hasil Pemeriksaan</td>
                <td style={{ fontWeight: '500' }}>{laporan.hasil_pemeriksaan}</td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Status</td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    fontSize: '14px',
                    background: laporan.status === 'Disetujui' 
                      ? 'rgba(34, 197, 94, 0.2)' 
                      : laporan.status === 'Ditolak'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(234, 179, 8, 0.2)',
                    color: laporan.status === 'Disetujui'
                      ? '#4ade80'
                      : laporan.status === 'Ditolak'
                      ? '#f87171'
                      : '#fbbf24'
                  }}>
                    {laporan.status}
                  </span>
                </td>
              </tr>
              {laporan.catatan && (
                <tr>
                  <td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Catatan</td>
                  <td style={{ fontWeight: '500' }}>{laporan.catatan}</td>
                </tr>
              )}
              <tr>
                <td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Tanggal</td>
                <td style={{ fontWeight: '500' }}>{new Date(laporan.tanggal).toLocaleString('id-ID', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Petugas</td>
                <td style={{ fontWeight: '500' }}>{laporan.user?.nama} ({laporan.user?.jabatan})</td>
              </tr>
            </tbody>
          </table>
        </div>

        {laporan.status === 'Belum Dicek' && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
            <button
              onClick={() => handleStatusAction('Disetujui')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >Setujui</button>
            <button
              onClick={() => handleStatusAction('Ditolak')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >Tolak</button>
          </div>
        )}

        {/* Foto Section */}
        {fotoArr.length > 0 && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <h3 style={{ 
              color: '#fff',
              marginTop: 0,
              marginBottom: '16px',
              fontSize: '16px'
            }}>Dokumentasi Foto</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {fotoArr.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setShowLightbox(true);
                    setLightboxIdx(idx);
                  }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <img
  src={`http://localhost:5000/uploads/${f}`}
  alt={`Foto ${idx + 1}`}
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }}
/>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showLightbox && (
        <Lightbox
          mainSrc={`http://localhost:5000/uploads/${fotoArr[lightboxIdx]}`}
          nextSrc={fotoArr.length > 1 ? `http://localhost:5000/uploads/${fotoArr[(lightboxIdx+1)%fotoArr.length]}` : null}
          prevSrc={fotoArr.length > 1 ? `http://localhost:5000/uploads/${fotoArr[(lightboxIdx+fotoArr.length-1)%fotoArr.length]}` : null}
          onCloseRequest={() => setShowLightbox(false)}
          onMovePrevRequest={() => setLightboxIdx((lightboxIdx+fotoArr.length-1)%fotoArr.length)}
          onMoveNextRequest={() => setLightboxIdx((lightboxIdx+1)%fotoArr.length)}
        />
      )}

      <style>{`
        @media print {
          body { background: white !important; }
          button { display: none !important; }
          div { background: white !important; box-shadow: none !important; }
          * { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default LaporanDetail; 