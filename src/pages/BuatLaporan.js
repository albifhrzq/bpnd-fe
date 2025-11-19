import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FaceCheck from '../components/FaceCheck';

// Titik pusat area geo-fencing
const GEO_CENTER = { lat: -6.911303, lng: 107.610311 };
const GEO_RADIUS_M = 50000; // 5 km

function haversine(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const BuatLaporan = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // ✅ formData di-persist pakai localStorage
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("buatLaporanForm");
    return saved
      ? JSON.parse(saved)
      : { nama_merk: '', alamat: '', npwpd: '', hasil_pemeriksaan: '', foto: [] };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locError, setLocError] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);

  // Modal FaceCheck
  const [showFaceModal, setShowFaceModal] = useState(false);

  // ✅ simpan ke localStorage setiap kali formData berubah
  useEffect(() => {
    localStorage.setItem("buatLaporanForm", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocError('Geolocation tidak didukung browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocError('');
      },
      (err) => {
        setLocError('Gagal mengambil lokasi: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.npwpd.length !== 13 || !/^[a-zA-Z0-9]{13}$/.test(formData.npwpd)) {
      setError('NPWPD harus 13 karakter (huruf/angka)!');
      setLoading(false);
      return;
    }

    if (!location.lat || !location.lng) {
      setError('Lokasi tidak tersedia. Pastikan GPS aktif dan izinkan akses lokasi.');
      setLoading(false);
      return;
    }

    // Geo-fencing validation
    const distance = haversine(location.lat, location.lng, GEO_CENTER.lat, GEO_CENTER.lng);
    if (distance > GEO_RADIUS_M) {
      setError('Anda berada di luar area yang diizinkan untuk membuat laporan.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('nama_merk', formData.nama_merk);
    data.append('alamat', formData.alamat);
    data.append('npwpd', formData.npwpd);
    data.append('hasil_pemeriksaan', formData.hasil_pemeriksaan);
    for (let i = 0; i < formData.foto.length; i++) {
      data.append('foto', formData.foto[i]);
    }
    data.append('latitude', location.lat);
    data.append('longitude', location.lng);

    try {
      await api.post('/api/laporan', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // ✅ Bersihkan form & localStorage setelah sukses
      localStorage.removeItem("buatLaporanForm");
      setFormData({ nama_merk: '', alamat: '', npwpd: '', hasil_pemeriksaan: '', foto: [] });
      setPreviewUrls([]);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating laporan:', err);
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          'Terjadi kesalahan saat mengirim laporan'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'foto') {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const combinedFiles = [...formData.foto, ...files];
      if (combinedFiles.length > 4) {
        setError('Maksimal 4 foto yang dapat diunggah');
        return;
      }

      setFormData({ ...formData, foto: combinedFiles });

      const newUrls = [...previewUrls, ...files.map((file) => URL.createObjectURL(file))];
      setPreviewUrls(newUrls);

      e.target.value = '';
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  return (
    <Layout title="Buat Laporan Baru">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            {error}
          </div>
        )}
        {locError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            {locError}
          </div>
        )}

        {/* Status lokasi */}
        <div
          style={{
            background:
              location.lat && location.lng
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(251, 191, 36, 0.1)',
            color: location.lat && location.lng ? '#22c55e' : '#fbbf24',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${
              location.lat && location.lng
                ? 'rgba(34, 197, 94, 0.2)'
                : 'rgba(251, 191, 36, 0.2)'
            }`
          }}
        >
          <strong>Status Lokasi:</strong>{' '}
          {location.lat && location.lng
            ? `Lokasi terdeteksi (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`
            : 'Menunggu lokasi GPS...'}
        </div>

        <form>
          {/* Nama Merk */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
              Nama Merk *
            </label>
            <input
              type="text"
              name="nama_merk"
              value={formData.nama_merk}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Alamat */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
              Alamat *
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                minHeight: '40px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* NPWPD */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
              NPWPD * (13 digit angka)
            </label>
            <input
              type="text"
              name="npwpd"
              value={formData.npwpd}
              onChange={(e) => {
                if (/^[a-zA-Z0-9]{0,13}$/.test(e.target.value)) handleChange(e);
              }}
              required
              minLength={13}
              maxLength={13}
              pattern="[a-zA-Z0-9]{13}"
              title="NPWPD harus 13 karakter (huruf/angka)"
              placeholder="Contoh: ABC1234567890"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px'
              }}
            />
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
              {formData.npwpd.length}/13 digit
            </div>
          </div>

          {/* Hasil Pemeriksaan */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
              Hasil Pemeriksaan *
            </label>
            <textarea
              name="hasil_pemeriksaan"
              value={formData.hasil_pemeriksaan}
              onChange={handleChange}
              required
              placeholder="Jelaskan hasil pemeriksaan secara detail..."
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

          {/* Foto Dokumentasi */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
              Foto Dokumentasi * (Maksimal 4 foto)
            </label>
            <input
              type="file"
              name="foto"
              onChange={handleChange}
              accept="image/*"
              capture="environment"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />

            {/* Preview Foto */}
            {previewUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 12 }}>
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => {
                      setShowPreview(true);
                      setPreviewIdx(idx);
                    }}
                  >
                    <img
                      src={url}
                      alt={`preview-${idx}`}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #ccc'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFiles = formData.foto.filter((_, i) => i !== idx);
                        const newUrls = previewUrls.filter((_, i) => i !== idx);
                        setFormData({ ...formData, foto: newFiles });
                        setPreviewUrls(newUrls);
                      }}
                    >
                      ×
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
              {formData.foto.length}/4 foto dipilih
            </div>
          </div>

          {/* Submit → buka modal */}
          <button
            type="button"
            onClick={() => setShowFaceModal(true)}
            disabled={loading || !location.lat || !location.lng}
            style={{
              width: '100%',
              padding: '12px',
              background:
                loading || !location.lat || !location.lng
                  ? 'rgba(107, 114, 128, 0.5)'
                  : 'rgba(59, 130, 246, 0.9)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading || !location.lat || !location.lng ? 'not-allowed' : 'pointer',
              opacity: loading || !location.lat || !location.lng ? '0.7' : '1',
              transition: 'all 0.2s'
            }}
          >
            {loading
              ? 'Mengirim...'
              : !location.lat || !location.lng
              ? 'Menunggu Lokasi GPS...'
              : 'Kirim Laporan'}
          </button>
        </form>
      </div>

      {/* FaceCheck Modal */}
      <FaceCheck
        open={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onSuccess={handleSubmit}
      />

      {/* Lightbox Preview */}
      {showPreview && previewUrls.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowPreview(false)}
        >
          <img
            src={previewUrls[previewIdx]}
            alt={`preview-big-${previewIdx}`}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 12,
              boxShadow: '0 4px 32px #0008',
              background: '#fff'
            }}
          />
          <button
            onClick={() => setShowPreview(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}
    </Layout>
  );
};

export default BuatLaporan;
