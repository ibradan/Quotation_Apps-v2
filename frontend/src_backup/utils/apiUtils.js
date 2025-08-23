/**
 * Robust API utilities dengan error handling yang comprehensive
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const ENABLE_CONSOLE_LOGS = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true';

// Helper function untuk logging yang bisa di-toggle
const debugLog = (...args) => {
  if (ENABLE_CONSOLE_LOGS || import.meta.env.MODE === 'development') {
    console.log(...args);
  }
};

// Response handler yang robust
export const handleApiResponse = (response) => {
  // Cek apakah response memiliki struktur API yang valid
  if (response && typeof response === 'object') {
    // Jika ada success flag
    if (response.hasOwnProperty('success')) {
      if (response.success) {
        return response.data || response.result || [];
      } else {
        throw new Error(response.message || response.error || 'API returned unsuccessful response');
      }
    }
    
    // Jika response langsung berupa data
    if (response.hasOwnProperty('data')) {
      return response.data;
    }
    
    // Jika response berupa array langsung
    if (Array.isArray(response)) {
      return response;
    }
    
    // Jika response berupa object biasa
    return response;
  }
  
  // Fallback untuk response kosong
  return [];
};

// Error handler yang comprehensive
export const handleApiError = (error, context = 'API call') => {
  if (ENABLE_CONSOLE_LOGS) {
    console.error(`Error in ${context}:`, error);
  }
  
  let errorMessage = 'Terjadi kesalahan tidak dikenal';
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    if (status >= 500) {
      errorMessage = 'Server sedang bermasalah. Silakan coba lagi nanti.';
    } else if (status === 404) {
      errorMessage = 'Data tidak ditemukan.';
    } else if (status === 401) {
      errorMessage = 'Unauthorized access.';
    } else if (status === 403) {
      errorMessage = 'Access forbidden.';
    } else if (data && data.message) {
      errorMessage = data.message;
    } else if (data && data.error) {
      errorMessage = data.error;
    }
  } else if (error.request) {
    // Request made but no response
    errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  } else if (error.message) {
    // Other error
    errorMessage = error.message;
  }
  
  return errorMessage;
};

// Safe API caller dengan retry mechanism
export const safeApiCall = async (apiFunction, retries = 2, context = 'API call') => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await apiFunction();
      return handleApiResponse(response);
    } catch (error) {
      if (attempt === retries) {
        // Last attempt failed
        throw new Error(handleApiError(error, context));
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
};

// Robust API client
export class RobustApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle PDF downloads
      if (response.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotation.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true, message: 'PDF downloaded' };
      }

      const data = await response.json();
      return handleApiResponse(data);
    } catch (error) {
      throw new Error(handleApiError(error, `${options.method || 'GET'} ${endpoint}`));
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new RobustApiClient();
