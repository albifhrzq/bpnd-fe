import React, { useState } from 'react';
import api, { API_BASE_URL } from '../config/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMsg(res.data.msg);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Terjadi kesalahan');
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{maxWidth:380,width:'100%',padding:'36px 32px',margin:'32px 0',background:'#fff',borderRadius:16,boxShadow:'0 2px 16px rgba(0,0,0,0.07)'}}>
        <h2 style={{textAlign:'center',fontWeight:700,color:'#2563eb',marginBottom:24}}>Lupa Password</h2>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Masukkan email Anda" required style={{padding:12,borderRadius:8,border:'1px solid #cbd5e1',fontSize:16}} />
          <button type="submit" style={{padding:12,borderRadius:8,background:'#2563eb',color:'#fff',fontWeight:600,fontSize:16,border:'none',cursor:'pointer'}}>Kirim Email Reset</button>
        </form>
        {msg && <p style={{marginTop:16,textAlign:'center',color:msg.includes('berhasil')?'#16a34a':'#dc2626',fontWeight:500}}>{msg}</p>}
        <p style={{marginTop:24,textAlign:'center'}}>
          <a href="/" style={{color:'#2563eb',fontWeight:600,textDecoration:'none'}}>Kembali ke Login</a>
        </p>
      </div>
    </div>
  );
} 