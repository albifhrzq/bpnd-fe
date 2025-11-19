import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { instruksiAPI, usersAPI } from '../config/api';
import api from '../config/api'; // Add this import for direct API calls
import { useNavigate } from 'react-router-dom';
import './AdminBeriIntruksi.css';
import SuperAdminLayout from '../components/SuperAdminLayout';

const AdminBeriInstruksi = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    user: [],
    instruksi: '',
    deadline: '',
    lokasi: '',
    catatan: ''
  });

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    setError('');
    
    try {
      // Check authentication
      if (!user || !token) {
        throw new Error('Silakan login terlebih dahulu');
      }

      // Check admin permission
      if (!['admin', 'superadmin'].includes(user.role)) {
        throw new Error('Anda tidak memiliki akses untuk halaman ini');
      }

      console.log('🔍 Fetching users list...');
      
      const result = await usersAPI.getAllUsers();
      
      if (result.success) {
        // Filter out current user and only show non-admin users
        // Also ensure users have required fields
        const filteredUsers = result.data
          .filter(u => u && u._id && u._id !== user._id)
          .filter(u => !['admin', 'superadmin'].includes(u.role))
          .map(u => ({
            ...u,
            nama: u.nama || 'Nama tidak tersedia',
            jabatan: u.jabatan || 'Jabatan tidak tersedia'
          }));
        
        setUsers(filteredUsers);
        console.log('✅ Users loaded:', filteredUsers.length);
      } else {
        throw new Error(result.error || 'Gagal mengambil data user');
      }
      
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(err.message || 'Gagal mengambil data user');
      
      // Handle authentication errors
      if (err.message.includes('login') || err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleUserCheck = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const selected = new Set(prev.user);
      if (checked) {
        selected.add(value);
      } else {
        selected.delete(value);
      }
      return { ...prev, user: Array.from(selected) };
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredUsers.map((u) => u._id);
    setForm({ ...form, user: allIds });
  };

  const handleClearAll = () => {
    setForm({ ...form, user: [] });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      // Client-side validation
      if (form.user.length === 0) {
        throw new Error('Pilih minimal 1 petugas penerima instruksi');
      }
      
      if (!form.instruksi || !form.instruksi.trim()) {
        throw new Error('Instruksi wajib diisi');
      }

      if (form.instruksi.trim().length < 5) {
        throw new Error('Instruksi minimal 5 karakter');
      }

      // ==============================================
      // DEBUG CODE - TAMBAHAN BARU
      // ==============================================
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      console.log('🔍 =========================');
      console.log('🔍 FULL DEBUG INFO:');
      console.log('🔍 =========================');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token?.substring(0, 50) + '...');
      console.log('User data:', userData);
      console.log('User role:', userData.role);
      console.log('User authenticated:', isAuthenticated);
      console.log('User from context:', user);

      console.log('🔍 FORM DATA DEBUG:');
      console.log('form.instruksi type:', typeof form.instruksi);
      console.log('form.instruksi value:', JSON.stringify(form.instruksi));
      console.log('form.instruksi length:', form.instruksi.length);
      console.log('form.instruksi.trim() length:', form.instruksi.trim().length);
      console.log('form.user type:', typeof form.user);
      console.log('form.user value:', JSON.stringify(form.user));
      console.log('form.user length:', form.user.length);

      // Test payload yang akan dikirim
      const testPayload = {
        user: form.user,
        instruksi: form.instruksi.trim()
      };

      console.log('🔍 FINAL PAYLOAD TO SEND:');
      console.log(JSON.stringify(testPayload, null, 2));
      console.log('🔍 =========================');
      // ==============================================
      // END DEBUG CODE
      // ==============================================

      // Prepare data - TRY BOTH SPELLINGS
      const instructionData = {
        user: form.user, // Array of user IDs
        instruksi: form.instruksi.trim(),
        intruksi: form.instruksi.trim(), // Backend typo version
      };

      // Add optional fields only if they have values
      if (form.deadline) {
        instructionData.deadline = form.deadline;
      }
      
      if (form.lokasi && form.lokasi.trim()) {
        instructionData.lokasi = form.lokasi.trim();
      }
      
      if (form.catatan && form.catatan.trim()) {
        instructionData.catatan = form.catatan.trim();
      }

      console.log('📤 SENDING API REQUEST...');
      
      // LANGSUNG PAKAI API CALL SEDERHANA
      const result = await api.post('/api/instruksi', instructionData);
      
      console.log('✅ SUCCESS:', result.data);
      
      setSuccess(`Instruksi berhasil dikirim ke ${result.data.count || form.user.length} petugas!`);
      
      // Reset form
      setForm({ 
        user: [], 
        instruksi: '', 
        deadline: '', 
        lokasi: '',
        catatan: '' 
      });
      
      setTimeout(() => setSuccess(''), 5000);

    } catch (err) {
      console.error('❌ =========================');
      console.error('❌ FULL ERROR DEBUG:');
      console.error('❌ =========================');
      console.error('❌ Error object:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error response data:', err.response?.data);
      console.error('❌ Error response status:', err.response?.status);
      console.error('❌ Error response headers:', err.response?.headers);
      console.error('❌ =========================');
      
      setError(err.response?.data?.message || err.message || 'Gagal mengirim instruksi');
      
      // Auto-hide error message after 8 seconds
      setTimeout(() => setError(''), 8000);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    // Safe check for undefined values
    const nama = u.nama || '';
    const jabatan = u.jabatan || '';
    const searchLower = searchTerm.toLowerCase();
    
    return nama.toLowerCase().includes(searchLower) ||
           jabatan.toLowerCase().includes(searchLower);
  });

  // Check authentication and authorization
  if (!user || !isAuthenticated || !token) {
    return (
      <SuperAdminLayout>
        <div className="error-container">
          <h2>Akses Ditolak</h2>
          <p>Silakan login terlebih dahulu untuk mengakses halaman ini.</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!['admin', 'superadmin'].includes(user.role)) {
    return (
      <SuperAdminLayout>
        <div className="error-container">
          <h2>Akses Ditolak</h2>
          <p>Anda tidak memiliki akses untuk memberikan instruksi.</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="admin-instruksi-container">
        {/* Page Header */}
        <div className="page-header">
          <h2>Beri Instruksi ke Petugas</h2>
          <p>Kirim instruksi dan tugas kepada petugas yang dipilih</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="instruksi-form">
          {/* User Search Section */}
          <div className="form-section">
            <h3>Pilih Penerima Instruksi</h3>
            
            <div className="search-container">
              <label htmlFor="searchTerm">Cari Petugas:</label>
              <input
                id="searchTerm"
                type="text"
                placeholder="Cari berdasarkan nama atau jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="user-select-controls">
              <div className="selected-count">
                <span className="count-badge">{form.user.length}</span>
                <span>petugas dipilih</span>
              </div>
              
              <div className="control-buttons">
                <button 
                  type="button" 
                  onClick={handleSelectAll}
                  className="btn-select-all"
                  disabled={filteredUsers.length === 0}
                >
                  Pilih Semua ({filteredUsers.length})
                </button>
                <button 
                  type="button" 
                  onClick={handleClearAll}
                  className="btn-clear-all"
                  disabled={form.user.length === 0}
                >
                  Hapus Semua
                </button>
              </div>
            </div>

            {/* User List */}
            <div className="user-select-list">
              {fetchingUsers ? (
                <div className="loading-users">
                  <div className="loading-spinner"></div>
                  <p>Memuat data petugas...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="empty-users">
                  <p>
                    {searchTerm 
                      ? `Tidak ada petugas ditemukan dengan kata kunci "${searchTerm}"`
                      : 'Tidak ada petugas tersedia'
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      type="button" 
                      onClick={() => setSearchTerm('')}
                      className="clear-search-btn"
                    >
                      Hapus pencarian
                    </button>
                  )}
                </div>
              ) : (
                <div className="user-checkbox-grid">
                  {filteredUsers.map((u) => (
                    <label key={u._id} className="user-checkbox-item">
                      <input
                        type="checkbox"
                        value={u._id}
                        checked={form.user.includes(u._id)}
                        onChange={handleUserCheck}
                      />
                      <div className="user-info">
                        <span className="user-name">{u.nama || 'Nama tidak tersedia'}</span>
                        <span className="user-position">({u.jabatan || 'Jabatan tidak tersedia'})</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instruction Details Section */}
          <div className="form-section">
            <h3>Detail Instruksi</h3>
            
            <div className="form-group">
              <label htmlFor="instruksi">
                Instruksi/Tugas <span className="required">*</span>
              </label>
              <textarea
                id="instruksi"
                name="instruksi"
                placeholder="Tulis instruksi atau tugas yang harus dikerjakan dengan jelas dan detail..."
                value={form.instruksi}
                onChange={handleChange}
                required
                minLength={5}
                rows={4}
                className="instruction-textarea"
              />
              <small className="field-hint">
                Minimal 5 karakter. Jelaskan dengan detail apa yang harus dikerjakan.
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deadline">Deadline</label>
                <input
                  id="deadline"
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="date-input"
                />
                <small className="field-hint">Opsional - Batas waktu penyelesaian tugas</small>
              </div>

              <div className="form-group">
                <label htmlFor="lokasi">Lokasi Pemeriksaan</label>
                <input
                  id="lokasi"
                  type="text"
                  name="lokasi"
                  placeholder="Contoh: Gedung A Lantai 2, Ruang Server..."
                  value={form.lokasi}
                  onChange={handleChange}
                  className="location-input"
                />
                <small className="field-hint">Opsional - Lokasi spesifik jika diperlukan</small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="catatan">Catatan Tambahan</label>
              <textarea
                id="catatan"
                name="catatan"
                placeholder="Catatan atau informasi tambahan yang perlu diketahui petugas..."
                value={form.catatan}
                onChange={handleChange}
                rows={3}
                className="notes-textarea"
              />
              <small className="field-hint">Opsional - Informasi tambahan atau catatan khusus</small>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading || form.user.length === 0 || !form.instruksi.trim()}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <span className="loading-spinner small"></span>
                  Mengirim...
                </>
              ) : (
                <>
                  <span className="send-icon">📤</span>
                  Kirim Instruksi ({form.user.length} petugas)
                </>
              )}
            </button>
            
            {form.user.length === 0 && (
              <small className="submit-hint">Pilih minimal 1 petugas untuk mengirim instruksi</small>
            )}
          </div>
        </form>

        {/* Instructions Summary */}
        {form.user.length > 0 && (
          <div className="instruction-preview">
            <h4>Ringkasan Instruksi</h4>
            <div className="preview-content">
              <p><strong>Penerima:</strong> {form.user.length} petugas</p>
              {form.instruksi && (
                <p><strong>Instruksi:</strong> {form.instruksi.substring(0, 100)}{form.instruksi.length > 100 ? '...' : ''}</p>
              )}
              {form.deadline && (
                <p><strong>Deadline:</strong> {new Date(form.deadline).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              )}
              {form.lokasi && <p><strong>Lokasi:</strong> {form.lokasi}</p>}
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default AdminBeriInstruksi;