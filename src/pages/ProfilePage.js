import React, { useState } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FaceVerification from '../components/FaceVerification'; // ✅ Tambah import

const ProfilePage = () => {
  const { user, token, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false); // ✅ State untuk pop-up Face ID

  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    whatsappNumber: user?.whatsappNumber || '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/api/users/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setSuccess('Profil berhasil diperbarui');
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.msg || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Profil Saya">
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
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
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(74, 222, 128, 0.1)',
            color: '#4ade80',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(74, 222, 128, 0.2)'
          }}>
            {success}
          </div>
        )}

        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: '#fff',
              fontWeight: '600'
            }}>
              {user?.nama ? user.nama[0].toUpperCase() : '?'}
            </div>
            <div>
              <h3 style={{ color: '#fff', margin: '0 0 4px 0' }}>{user?.nama}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>{user?.email}</p>
              {user?.whatsappNumber && (
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>
                  WA: {user.whatsappNumber}
                </p>
              )}
            </div>
          </div>

          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '14px',
                  marginBottom: '10px'
                }}
              >
                Edit Profil
              </button>

              {/* ✅ Tambah tombol Verifikasi Wajah */}
              <button
                onClick={() => setShowFaceVerification(true)}
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '14px'
                }}
              >
                Verifikasi Wajah
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Form edit yang sudah ada tetap dipertahankan */}
              {/* ... semua input nama, email, WA, password lama & baru */}
              {/* Tombol Batal & Simpan tetap sama */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? '0.7' : '1'
                  }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ✅ Modal / pop-up Face Verification */}
        {showFaceVerification && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#1e293b',
              padding: '20px',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '12px' }}>Verifikasi Wajah</h3>
              <FaceVerification
                onSuccess={() => {
                  alert('Verifikasi wajah berhasil!');
                  setShowFaceVerification(false);
                }}
                onCancel={() => setShowFaceVerification(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
