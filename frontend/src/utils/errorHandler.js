// Enhanced Error Handling System
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  // Log error with context
  logError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorLog.push(errorInfo);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // In development, log to console
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorInfo);
    }

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendToMonitoring(errorInfo);
    }
  }

  // Send error to monitoring service
  async sendToMonitoring(errorInfo) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      });
    } catch (e) {
      console.error('Failed to send error to monitoring:', e);
    }
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error) {
    const errorMessages = {
      'Network Error': 'Koneksi internet bermasalah. Silakan cek koneksi Anda.',
      'Request timeout': 'Permintaan terlalu lama. Silakan coba lagi.',
      'Unauthorized': 'Sesi Anda telah berakhir. Silakan login kembali.',
      'Forbidden': 'Anda tidak memiliki akses ke fitur ini.',
      'Not Found': 'Data yang Anda cari tidak ditemukan.',
      'Internal Server Error': 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
      'Validation Error': 'Data yang Anda masukkan tidak valid.',
      'Quota exceeded': 'Batas penggunaan telah tercapai.',
      'Rate limit exceeded': 'Terlalu banyak permintaan. Silakan tunggu sebentar.'
    };

    return errorMessages[error.message] || 
           errorMessages[error.code] || 
           'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
  }

  // Handle API errors
  handleApiError(error) {
    const userMessage = this.getUserFriendlyMessage(error);
    
    this.logError(error, { type: 'api_error' });
    
    return {
      userMessage,
      technicalMessage: error.message,
      shouldRetry: this.shouldRetry(error),
      retryAfter: this.getRetryDelay(error)
    };
  }

  // Determine if request should be retried
  shouldRetry(error) {
    const retryableErrors = [
      'Network Error',
      'Request timeout',
      'Internal Server Error'
    ];
    
    return retryableErrors.includes(error.message) || 
           (error.response && error.response.status >= 500);
  }

  // Get retry delay based on error type
  getRetryDelay(error) {
    if (error.message === 'Rate limit exceeded') {
      return 60000; // 1 minute
    }
    return 5000; // 5 seconds default
  }

  // Get error log for debugging
  getErrorLog() {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Global error boundary handler
export const handleGlobalError = (error, errorInfo) => {
  errorHandler.logError(error, {
    type: 'react_error',
    componentStack: errorInfo.componentStack
  });
};

// Unhandled promise rejection handler
export const handleUnhandledRejection = (event) => {
  errorHandler.logError(new Error(event.reason), {
    type: 'unhandled_promise_rejection'
  });
};

// Initialize global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error, {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

export default errorHandler; 