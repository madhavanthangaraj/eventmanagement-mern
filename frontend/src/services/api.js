import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 12000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

// Super Admin API
export const superAdminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/superadmin/dashboard-stats'),
  
  // User Management
  getUsers: (filters = {}) => api.get('/superadmin/users', { params: filters }),
  approveUser: (userId) => api.put(`/superadmin/approve-user/${userId}`),
  rejectUser: (userId) => api.put(`/superadmin/reject-user/${userId}`),
  toggleUserStatus: (userId) => api.put(`/superadmin/toggle-status/${userId}`),
  assignRole: (userId, role) => api.put(`/superadmin/assign-role/${userId}`, { role }),
};

export default api;
