import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { BASE_URL } from '../config/api'; // Changed from API_BASE_URL to BASE_URL

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load token dari localStorage saat aplikasi start
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken) {
      setToken(savedToken);
      console.log('Token loaded from localStorage:', savedToken);
    }
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        console.log('User loaded from localStorage:', JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (nip, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login with:', { nip, baseUrl: BASE_URL }); // Changed to BASE_URL
      
      // Menggunakan axios instance dari config/api.js
      const res = await api.post('/api/auth/login', { 
        nip, 
        password 
      });
      
      console.log('Login response:', res.data);
      
      // Validasi response
      if (!res.data.token) {
        throw new Error('Token tidak ditemukan dalam response');
      }
      
      // Simpan ke state
      setUser(res.data.user);
      setToken(res.data.token);
      
      // PENTING: Simpan ke localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      console.log('Token saved to localStorage:', res.data.token);
      console.log('User saved to localStorage:', res.data.user);
      
      setLoading(false);
      return res.data.user;
      
    } catch (err) {
      console.error('Login error:', err);
      
      const errorMessage = err.response?.data?.msg || 
                          err.response?.data?.message || 
                          err.message || 
                          'Login gagal';
      
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
  return new Promise((resolve) => {
    // Clear state
    setUser(null);
    setToken(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    console.log('✅ User logged out, localStorage cleared');

    // Pastikan benar-benar null sebelum lanjut
    setTimeout(() => {
      resolve(true);
    }, 150); // delay kecil agar React sempat update state
  });
};


  // Function untuk cek apakah user sudah login
  const isAuthenticated = () => {
    return !!(token && user);
  };

  const value = { 
    user, 
    token, 
    loading, 
    error, 
    login, 
    logout, 
    setUser, 
    setToken, 
    isAuthenticated 
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};