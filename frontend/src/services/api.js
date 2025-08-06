import axios from 'axios';
import { errorHandler } from '../utils/errorHandler';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    errorHandler.logError(error, { type: 'request_interceptor_error' });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate response time
    const endTime = new Date();
    const duration = endTime - response.config.metadata?.startTime;
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        duration: `${duration}ms`,
        data: response.data
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - refresh token or redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await api.post('/auth/refresh', {
            refreshToken
          });
          
          localStorage.setItem('authToken', refreshResponse.data.token);
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    const errorInfo = errorHandler.handleApiError(error);
    
    // Retry logic for network errors
    if (errorInfo.shouldRetry && !originalRequest._retry) {
      originalRequest._retry = true;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, errorInfo.retryAfter);
      });
    }
    
    return Promise.reject({
      ...error,
      userMessage: errorInfo.userMessage,
      shouldRetry: errorInfo.shouldRetry
    });
  }
);

// API service methods with enhanced error handling
export const apiService = {
  // GET request with caching
  async get(url, config = {}) {
    try {
      const response = await api.get(url, {
        ...config,
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes cache
          ...config.headers
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  async patch(url, data = {}, config = {}) {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  async upload(url, file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download file
  async download(url, filename = 'download') {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Specific API endpoints
export const quotationAPI = {
  getAll: (params = {}) => apiService.get('/quotations', { params }),
  getById: (id) => apiService.get(`/quotations/${id}`),
  create: (data) => apiService.post('/quotations', data),
  update: (id, data) => apiService.put(`/quotations/${id}`, data),
  delete: (id) => apiService.delete(`/quotations/${id}`),
  exportPDF: (id) => apiService.get(`/quotations/${id}/pdf`),
  exportExcel: (params = {}) => apiService.get('/quotations/export', { params }),
};

export const customerAPI = {
  getAll: (params = {}) => apiService.get('/customers', { params }),
  getById: (id) => apiService.get(`/customers/${id}`),
  create: (data) => apiService.post('/customers', data),
  update: (id, data) => apiService.put(`/customers/${id}`, data),
  delete: (id) => apiService.delete(`/customers/${id}`),
};

export const itemAPI = {
  getAll: (params = {}) => apiService.get('/items', { params }),
  getById: (id) => apiService.get(`/items/${id}`),
  create: (data) => apiService.post('/items', data),
  update: (id, data) => apiService.put(`/items/${id}`, data),
  delete: (id) => apiService.delete(`/items/${id}`),
};

export const settingsAPI = {
  get: () => apiService.get('/settings'),
  update: (data) => apiService.put('/settings', data),
};

export const dashboardAPI = {
  getStats: () => apiService.get('/dashboard/stats'),
  getRecentQuotations: () => apiService.get('/dashboard/recent-quotations'),
  getChartData: (period = 'month') => apiService.get(`/dashboard/chart/${period}`),
};

export default apiService; 