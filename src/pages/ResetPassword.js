import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { API_BASE_URL } from '../config/api';

export default function ResetPassword() {
  const { token } = useParams();  
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/auth/reset-password/${token}`, { password });
      setMsg(res.data.msg);
      setSuccess(true);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Terjadi kesalahan');
      setSuccess(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{maxWidth:380,width:'100%',padding:'36px 32px',margin:'32px 0',background:'#fff',borderRadius:16,boxShadow:'0 2px 16px rgba(0,0,0,0.07)'}}>
        <h2 style={{textAlign:'center',fontWeight:700,color:'#2563eb',marginBottom:24}}>Reset Password</h2>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password Baru" required style={{padding:12,borderRadius:8,border:'1px solid #cbd5e1',fontSize:16}} />
          <button type="submit" style={{padding:12,borderRadius:8,background:'#2563eb',color:'#fff',fontWeight:600,fontSize:16,border:'none',cursor:'pointer'}}>Reset Password</button>
        </form>
        {msg && <p style={{marginTop:16,textAlign:'center',color:success?'#16a34a':'#dc2626',fontWeight:500}}>{msg}</p>}
        <p style={{marginTop:24,textAlign:'center'}}>
          <a href="/" style={{color:'#2563eb',fontWeight:600,textDecoration:'none'}}>Kembali ke Login</a>
        </p>
      </div>
    </div>
  );
} 