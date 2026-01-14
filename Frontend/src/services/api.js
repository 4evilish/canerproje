import axios from 'axios';

// Use relative URL for same-domain deployment (Backend + Frontend together)
// For development with separate servers, use VITE_API_URL env variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  createUser: (userData) => api.post('/auth/create-user', userData),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
  toggleUserActive: (id) => api.put(`/auth/users/${id}/toggle-active`),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  updateTaskStatus: (id, status) => api.put(`/tasks/${id}/status`, status),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getCustomers: () => api.get('/tasks/customers'),
  addNote: (id, content) => api.post(`/tasks/${id}/notes`, JSON.stringify(content), {
    headers: { 'Content-Type': 'application/json' }
  }),
  getNotes: (id) => api.get(`/tasks/${id}/notes`),
  addAlarm: (id, alarmData) => api.post(`/tasks/${id}/alarms`, alarmData),
  getAlarms: (id) => api.get(`/tasks/${id}/alarms`),
};

// Task Categories API (also used for filter dropdown)
export const taskCategoriesAPI = {
  getCategories: () => api.get('/taskcategories'),
  createCategory: (name) => api.post('/taskcategories', { name }),
  deleteCategory: (id) => api.delete(`/taskcategories/${id}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
