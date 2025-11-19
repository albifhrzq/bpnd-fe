import axios from 'axios';

// Base URL configuration
export const BASE_URL = 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    console.log('🚀 API Request Details:');
    console.log('  Method:', config.method?.toUpperCase());
    console.log('  URL:', config.url);
    console.log('  Base URL:', config.baseURL);
    console.log('  Full URL:', config.baseURL + config.url);
    console.log('  Headers:', JSON.stringify(config.headers, null, 2));
    
    if (config.data) {
      console.log('  Request Body:', JSON.stringify(config.data, null, 2));
      console.log('  Request Body Type:', typeof config.data);
      console.log('  Request Body Keys:', Object.keys(config.data || {}));
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized access - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// =======================
// Face API helpers
// =======================
export const faceAPI = {
  // Check status
  async getStatus() {
    try {
      const res = await api.get('/api/face/status');
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // Register face
  async registerFace(data) {
    try {
      const res = await api.post('/api/face/register', data);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
};

// =======================
// Instruksi API helpers
// =======================
export const instruksiAPI = {
  async getMyInstructions() {
    try {
      const response = await api.get('/api/instruksi/me');
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil instruksi'
      };
    }
  },
  async getAllInstructions(params = {}) {
    try {
      const response = await api.get('/api/instruksi', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil semua instruksi'
      };
    }
  },
  async getUserInstructions(userId, params = {}) {
    try {
      const response = await api.get(`/api/instruksi/user/${userId}`, { params });
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengambil instruksi user'
      };
    }
  },
  async createInstruction(data) {
    try {
      if (!data.instruksi || !data.instruksi.trim()) {
        throw new Error('Instruksi wajib diisi');
      }
      if (!data.user || !Array.isArray(data.user) || data.user.length === 0) {
        throw new Error('Minimal pilih 1 user penerima');
      }
      const response = await api.post('/api/instruksi', data);
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message ||
               error.response?.data?.errors?.[0]?.msg ||
               error.message || 'Gagal membuat instruksi'
      };
    }
  },
  async updateStatus(instruksiId, status) {
    try {
      const response = await api.put(`/api/instruksi/${instruksiId}/status`, { status });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengupdate status'
      };
    }
  },
  async updateInstruction(instruksiId, data) {
    try {
      const response = await api.put(`/api/instruksi/${instruksiId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal mengupdate instruksi'
      };
    }
  },
  async deleteInstruction(instruksiId) {
    try {
      const response = await api.delete(`/api/instruksi/${instruksiId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Gagal menghapus instruksi'
      };
    }
  }
};

// =======================
// Users API helpers
// =======================
export const usersAPI = {
  async getAllUsers() {
    try {
      const response = await api.get('/api/users');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message || 'Gagal mengambil data users' };
    }
  },
  async getUserById(userId) {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message || 'Gagal mengambil data user' };
    }
  }
};

// Export additional useful properties
export const baseURL = BASE_URL;
export const apiHelpers = {
  faceAPI,
  instruksiAPI,
  usersAPI
};

export default api;
