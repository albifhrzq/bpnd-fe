import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { instruksiAPI } from '../config/api';
import Layout from '../components/Layout';
import './UserLihatIntruksi.css';

const UserLihatInstruksi = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateLoading, setUpdateLoading] = useState(null);

  // Fetch instructions on component mount
  useEffect(() => {
    fetchInstructions();
  }, [user, token]);

  const fetchInstructions = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check authentication
      if (!user || !token) {
        throw new Error('Silakan login terlebih dahulu');
      }

      console.log('🔍 Fetching instructions for user:', user._id);
      
      const result = await instruksiAPI.getMyInstructions();
      
      if (result.success) {
        setInstructions(result.data || []);
        console.log('✅ Instructions loaded:', result.data?.length || 0);
      } else {
        throw new Error(result.error || 'Gagal mengambil data instruksi');
      }
      
    } catch (err) {
      console.error('❌ Error fetching instructions:', err);
      setError(err.message || 'Gagal mengambil data instruksi');
      
      // Handle authentication errors
      if (err.message.includes('login') || err.status === 401) {
        // Redirect to login handled by API interceptor
      }
    } finally {
      setLoading(false);
    }
  };

  const updateInstructionStatus = async (instruksiId, newStatus) => {
    setUpdateLoading(instruksiId);
    
    try {
      const result = await instruksiAPI.updateStatus(instruksiId, newStatus);
      
      if (result.success) {
        // Update local state
        setInstructions(prev => 
          prev.map(item => 
            item._id === instruksiId 
              ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
              : item
          )
        );
        
        console.log('✅ Status updated successfully:', newStatus);
      } else {
        throw new Error(result.error || 'Gagal mengupdate status');
      }
      
    } catch (err) {
      console.error('❌ Error updating status:', err);
      alert(`Gagal mengupdate status: ${err.message}`);
    } finally {
      setUpdateLoading(null);
    }
  };

  // Filter instructions based on status
  const filteredInstructions = instructions.filter(item => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // Group instructions by status for statistics
  const stats = {
    total: instructions.length,
    tugas_diberikan: instructions.filter(i => i.status === 'Tugas Diberikan').length,
    sedang_dikerjakan: instructions.filter(i => i.status === 'Sedang Dikerjakan').length,
    selesai: instructions.filter(i => i.status === 'Selesai').length
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if instruction is overdue
  const isOverdue = (deadline, status) => {
    if (!deadline || status === 'Selesai') return false;
    return new Date() > new Date(deadline);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Tugas Diberikan':
        return 'status-pending';
      case 'Sedang Dikerjakan':
        return 'status-progress';
      case 'Selesai':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  if (!user || !isAuthenticated || !token) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Akses Ditolak</h2>
          <p>Silakan login terlebih dahulu untuk melihat instruksi Anda.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="user-instruksi-container">
        {/* Header */}
        <div className="page-header">
          <h2>Instruksi Saya</h2>
          <p>Daftar instruksi dan tugas yang diberikan kepada Anda</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Instruksi</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.tugas_diberikan}</div>
            <div className="stat-label">Tugas Diberikan</div>
          </div>
          <div className="stat-card progress">
            <div className="stat-number">{stats.sedang_dikerjakan}</div>
            <div className="stat-label">Sedang Dikerjakan</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{stats.selesai}</div>
            <div className="stat-label">Selesai</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <label htmlFor="statusFilter">Filter berdasarkan status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Semua Status ({stats.total})</option>
            <option value="Tugas Diberikan">Tugas Diberikan ({stats.tugas_diberikan})</option>
            <option value="Sedang Dikerjakan">Sedang Dikerjakan ({stats.sedang_dikerjakan})</option>
            <option value="Selesai">Selesai ({stats.selesai})</option>
          </select>
          
          <button 
            onClick={fetchInstructions}
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Memuat instruksi...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">
              <h3>Terjadi Kesalahan</h3>
              <p>{error}</p>
              <button onClick={fetchInstructions} className="retry-btn">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : filteredInstructions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>
              {statusFilter === 'all' 
                ? 'Belum ada instruksi'
                : `Tidak ada instruksi dengan status "${statusFilter}"`
              }
            </h3>
            <p>
              {statusFilter === 'all'
                ? 'Anda belum menerima instruksi apapun saat ini.'
                : 'Coba ubah filter status untuk melihat instruksi lainnya.'
              }
            </p>
          </div>
        ) : (
          <div className="instruksi-list">
            {filteredInstructions.map((item) => (
              <div 
                key={item._id} 
                className={`instruksi-card ${getStatusBadgeClass(item.status)} ${
                  isOverdue(item.deadline, item.status) ? 'overdue' : ''
                }`}
              >
                {/* Card Header */}
                <div className="card-header">
                  <div className="card-title">
                    <h3>{item.instruksi}</h3>
                    {isOverdue(item.deadline, item.status) && (
                      <span className="overdue-badge">Terlambat</span>
                    )}
                  </div>
                  <div className="card-meta">
                    <span className="sender">
                      Dari: {item.pengirim?.nama || 'Admin'} ({item.pengirim?.jabatan || 'Administrator'})
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Lokasi:</strong> {item.lokasi || 'Tidak ditentukan'}
                    </div>
                    <div className="info-item">
                      <strong>Deadline:</strong> {formatDate(item.deadline)}
                    </div>
                    <div className="info-item">
                      <strong>Dibuat:</strong> {formatDate(item.createdAt)}
                    </div>
                    {item.updatedAt !== item.createdAt && (
                      <div className="info-item">
                        <strong>Diupdate:</strong> {formatDate(item.updatedAt)}
                      </div>
                    )}
                  </div>

                  {item.catatan && (
                    <div className="catatan-section">
                      <strong>Catatan:</strong>
                      <p>{item.catatan}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer - Status Update */}
                <div className="card-footer">
                  <div className="status-section">
                    <label htmlFor={`status-${item._id}`}>
                      <strong>Status Tugas:</strong>
                    </label>
                    <div className="status-controls">
                      <select
                        id={`status-${item._id}`}
                        value={item.status}
                        onChange={(e) => updateInstructionStatus(item._id, e.target.value)}
                        className="status-select"
                        disabled={updateLoading === item._id}
                      >
                        <option value="Tugas Diberikan">Tugas Diberikan</option>
                        <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                      
                      {updateLoading === item._id && (
                        <div className="update-loading">
                          <span className="loading-spinner small"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserLihatInstruksi;