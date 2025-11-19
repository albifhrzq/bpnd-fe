import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AdminLayout from '../components/AdminLayout';
import SuperAdminLayout from '../components/SuperAdminLayout';

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
];
const statusOptions = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
];

const DataPengguna = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit'); // 'edit' | 'add'
  const [form, setForm] = useState({ nip: '', nama: '', username: '', email: '', jabatan: '', password: '', role: 'user', status: 'aktif' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const Layout = user?.role === 'superadmin' ? SuperAdminLayout : AdminLayout;

  useEffect(() => {
    if (user?.role !== 'superadmin') return;
    fetchUsers();
    // eslint-disable-next-line
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/superadmin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ nip: u.nip, nama: u.nama, username: u.username, email: u.email, jabatan: u.jabatan, password: '', role: u.role, status: u.status || 'aktif' });
    setModalType('edit');
    setModalOpen(true);
    setError('');
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ nip: '', nama: '', username: '', email: '', jabatan: '', password: '', role: 'user', status: 'aktif' });
    setModalType('add');
    setModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditUser(null);
    setError('');
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.nip || !form.nama || !form.username || !form.email || !form.jabatan || (modalType==='add' && !form.password)) {
      setError('Semua field wajib diisi');
      return;
    }
    setSaving(true);
    try {
      if (modalType === 'edit') {
        await api.put(`/api/superadmin/users/${editUser._id}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post('/api/auth/register', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      closeModal();
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.msg || 'Gagal simpan user');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/superadmin/users/${deleteId}`, { headers: { Authorization: `Bearer ${token}` } });
      setDeleteId(null);
      fetchUsers();
    } catch {}
  };

  const filtered = users.filter(u =>
    (u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.jabatan||'').toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter) &&
    (!statusFilter || u.status === statusFilter)
  );
  const maxPage = Math.ceil(filtered.length/perPage);
  const paged = filtered.slice((page-1)*perPage, page*perPage);

  if (loading) {
    return (
      <Layout title="Data Pengguna">
        <div style={{ color: '#fff', textAlign: 'center' }}>Memuat data...</div>
      </Layout>
    );
  }

  if (!user || user.role !== 'superadmin') {
    return <div style={{padding:40, textAlign:'center'}}>Akses hanya untuk Super Admin</div>;
  }

  return (
    <Layout title="Data Pengguna">
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
            <FaSearch size={14} style={{
              position: 'absolute',
              left: '12px',
              color: 'rgba(255, 255, 255, 0.5)'
            }} />
            <input
              type="text"
              placeholder="Cari pengguna..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <option value="">Semua Role</option>
            {roleOptions.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setModalType('add');
              setForm({ nip: '', nama: '', username: '', email: '', jabatan: '', password: '', role: 'user', status: 'aktif' });
              setModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            <FaPlus size={14} /> Tambah User
          </button>
        </div>

        {/* Users List */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#fff'
          }}>
            <thead>
  <tr>
    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nama</th>
    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Username</th>
    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Foto Wajah</th> {/* 🔥 Tambah kolom */}
    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Aksi</th>
  </tr>
</thead>
           <tbody>
  {paged.map((user) => (
    <tr key={user._id} style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      '&:last-child': { borderBottom: 'none' }
    }}>
      <td style={{ padding: '12px 16px' }}>{user.nama}</td>
      <td style={{ padding: '12px 16px' }}>{user.username}</td>
      <td style={{ padding: '12px 16px' }}>{user.email}</td>
      <td style={{ padding: '12px 16px' }}>{user.role}</td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          background: user.status === 'aktif' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
          color: user.status === 'aktif' ? '#4ade80' : '#f87171',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {user.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>

      {/* 🔥 Foto wajah */}
      <td style={{ padding: '12px 16px' }}>
        {user.faceImage ? (
          <img
            src={`${BASE_URL}${user.faceImage}`}
            alt="face"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer'
            }}
            onClick={() => {
              setImageUrl(`${BASE_URL}${user.faceImage}`);
              setShowImage(true);
            }}
          />
        ) : (
          <span style={{ fontSize: '12px', color: '#aaa' }}>Belum ada</span>
        )}
      </td>

      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setModalType('edit');
              setEditUser(user);
              setForm(user);
              setModalOpen(true);
            }}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => setDeleteId(user._id)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: '#ef4444',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <FaTrash size={14} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

          </table>
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
          Menampilkan {((page-1)*perPage)+1}-{Math.min(page*perPage, filtered.length)} dari {filtered.length} pengguna
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{modalType==='add'?'Tambah Pengguna':'Edit Pengguna'}</h3>
            <div className="form-group"><label>NIP</label><input name="nip" value={form.nip} onChange={handleChange} maxLength={18} minLength={18} required /></div>
            <div className="form-group"><label>Nama Lengkap</label><input name="nama" value={form.nama} onChange={handleChange} required /></div>
            <div className="form-group"><label>Username</label><input name="username" value={form.username} onChange={handleChange} required /></div>
            <div className="form-group"><label>Email</label><input name="email" value={form.email} onChange={handleChange} required /></div>
            <div className="form-group"><label>Jabatan</label><input name="jabatan" value={form.jabatan} onChange={handleChange} required /></div>
            <div className="form-group"><label>Password {modalType==='edit' && <span style={{color:'#888'}}>(kosongkan jika tidak diubah)</span>}</label><input name="password" type="password" value={form.password} onChange={handleChange} required={modalType==='add'} /></div>
            <div className="form-group"><label>Role</label><select name="role" value={form.role} onChange={handleChange}>{roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
            <div className="form-group"><label>Status</label><select name="status" value={form.status} onChange={handleChange}>{statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
            {error && <div style={{color:'#e11d48',marginBottom:8}}>{error}</div>}
            <div style={{marginTop:16}}>
              <button onClick={handleSave} disabled={saving} style={{marginRight:8}}>{saving?'Menyimpan...':modalType==='add'?'Tambah':'Simpan'}</button>
              <button onClick={closeModal} disabled={saving}>Batal</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Konfirmasi Hapus</h3>
            <p>Yakin ingin menghapus pengguna ini?</p>
            <div style={{marginTop:16}}>
              <button onClick={confirmDelete} style={{background:'#e11d48',color:'#fff',marginRight:8}}>Hapus</button>
              <button onClick={()=>setDeleteId(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
      body, .dark-bg{background:#181c24;color:#f3f4f6;}
      .card-box, .dark-card{background:#232837;border-radius:14px;box-shadow:0 2px 16px #0004;padding:32px 24px;margin:0 auto;max-width:100%;color:#f3f4f6;}
      .filter-bar input, .filter-bar select, .form-group input, .form-group select{background:#232837;color:#f3f4f6;border:1px solid #353b4a;}
      .filter-bar input::placeholder{color:#b0b3bb;}
      .btn-primary{background:#2563eb;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px}
      .btn-primary:hover{background:#1d4ed8}
      .icon-btn{background:none;border:none;cursor:pointer;padding:4px 8px;font-size:18px;color:#60a5fa}
      .icon-btn:hover{color:#93c5fd;background:#232837}
      .user-table th,.user-table td{vertical-align:middle}
      .user-table tr:nth-child(even){background:#232837}
      .user-table tr:hover{background:#1e2230}
      table{width:100%;border-collapse:collapse}
      th,td{padding:8px 12px;border-bottom:1px solid #353b4a;text-align:left}
      th{background:#232837;color:#93c5fd}
      .table-wrapper{overflow-x:auto}
      .modal{background:#232837;color:#f3f4f6;}
      .modal-backdrop{background:rgba(24,28,36,0.7);}
      .form-group label{color:#93c5fd;}
      .filter-bar{display:flex;gap:8;margin-bottom:16;flex-wrap:wrap}
      @media(max-width:800px){.card-box{padding:18px 4vw}.filter-bar{flex-direction:column;gap:12px}}
      @media(max-width:600px){.card-box{padding:8px 2vw} .modal{min-width:90vw;padding:16px 4vw} th,td{padding:6px 4px;font-size:13px} .btn-primary{width:100%;justify-content:center} .icon-btn{font-size:22px;padding:8px 12px} .filter-bar{flex-direction:column;gap:12px}}
      `}</style>
      {/* Modal Pop Out Foto Wajah */}
      {showImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }} onClick={() => setShowImage(false)}>
          <img
            src={imageUrl}
            alt="face"
            style={{
              maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16,
              boxShadow: '0 4px 32px rgba(0,0,0,0.5)', background: '#fff', padding: 8
            }}
          />
        </div>
      )}
    </Layout>
  );
};

export default DataPengguna;