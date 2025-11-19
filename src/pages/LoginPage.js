import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { login, error, loading, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectUrl = localStorage.getItem('redirectAfterLogin');

    // 🥇 PRIORITAS 1 — Jika user sudah login & ADA redirectAfterLogin → langsung redirect
    if (user && redirectUrl && !isLoggingOut) {
      console.log('📌 User login + redirect detected, menuju:', redirectUrl);
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectUrl, { replace: true });
      return;
    }

    // 🥈 PRIORITAS 2 — Jika ada redirect dan user masih login → logout dulu
    if (redirectUrl && user && !isLoggingOut) {
      console.log('🔄 Redirect detected, logging out user first...');
      setIsLoggingOut(true);
      logout().then(() => {
        console.log('✅ Logout complete, ready for login');
        setIsLoggingOut(false);
      });
      return;
    }

    // 🥉 PRIORITAS 3 — Jika user login TANPA redirectAfterLogin → ke dashboard sesuai role
    if (user && !redirectUrl && !isLoggingOut) {
      console.log('👤 User already logged in, redirecting to dashboard...');
      if (user.role === 'superadmin') {
        navigate('/superadmin/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, logout, isLoggingOut]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Attempting login...');
    const loggedIn = await login(nip, password);

    if (loggedIn) {
      console.log('✅ Login successful');
      const redirectUrl = localStorage.getItem('redirectAfterLogin');

      if (redirectUrl) {
        console.log('📌 Redirecting to saved URL:', redirectUrl);
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl, { replace: true });
      } else {
        console.log('📌 Redirecting to dashboard based on role:', loggedIn.role);
        if (loggedIn.role === 'superadmin') {
          navigate('/superadmin/dashboard', { replace: true });
        } else if (loggedIn.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  };

  const redirectUrl = localStorage.getItem('redirectAfterLogin');
  if (redirectUrl && (user || isLoggingOut)) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--light-blue)',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: 380,
            width: '100%',
            padding: '36px 32px',
            margin: '32px 0',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              color: 'var(--primary-blue)',
              marginBottom: 24,
            }}
          >
            Preparing Login...
          </h2>
          <p style={{ color: '#64748b', marginBottom: 16 }}>
            Mohon tunggu sebentar
          </p>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTopColor: 'var(--primary-blue)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          ></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--light-blue)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 380,
          width: '100%',
          padding: '36px 32px',
          margin: '32px 0',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 700,
            color: 'var(--primary-blue)',
            marginBottom: 24,
          }}
        >
          Login
        </h2>

        {redirectUrl && (
          <div
            style={{
              background: '#dbeafe',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#1e40af',
            }}
          >
            ℹ️ Anda akan diarahkan ke halaman sticker setelah login
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <input
            type="text"
            placeholder="NIP"
            value={nip}
            onChange={(e) => {
              if (/^\d{0,18}$/.test(e.target.value)) setNip(e.target.value);
            }}
            required
            minLength={18}
            maxLength={18}
            pattern="\d{18}"
            title="NIP harus 18 digit angka"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
          {error && (
            <div
              style={{
                color: 'red',
                marginTop: 8,
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
        </form>

        <p style={{ marginTop: 8, textAlign: 'center' }}>
          <a
            href="/forgot-password"
            style={{
              color: 'var(--accent-blue)',
              fontWeight: 600,
            }}
          >
            Lupa password?
          </a>
        </p>

        <p
          style={{
            marginTop: 18,
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          Belum punya akun?{' '}
          <a
            href="/register"
            style={{
              color: 'var(--accent-blue)',
              fontWeight: 600,
            }}
          >
            Daftar
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
