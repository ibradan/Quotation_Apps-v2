/**
 * Constants untuk aplikasi Quotation Management
 */

// API Configuration
export const API = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000
};

// Quotation Status
export const QUOTATION_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Status Labels (for display)
export const STATUS_LABELS = {
  [QUOTATION_STATUS.DRAFT]: 'Draft',
  [QUOTATION_STATUS.SENT]: 'Terkirim',
  [QUOTATION_STATUS.APPROVED]: 'Disetujui',
  [QUOTATION_STATUS.REJECTED]: 'Ditolak'
};

// Status Colors
export const STATUS_COLORS = {
  [QUOTATION_STATUS.DRAFT]: '#6b7280',
  [QUOTATION_STATUS.SENT]: '#3b82f6',
  [QUOTATION_STATUS.APPROVED]: '#10b981',
  [QUOTATION_STATUS.REJECTED]: '#ef4444'
};

// Default Values
export const DEFAULTS = {
  TAX_RATE: 11, // Default PPN 11%
  DISCOUNT: 0,
  QUOTATION_VALIDITY_DAYS: 30,
  QUOTATION_PREFIX: 'QUO',
  CURRENCY: 'IDR',
  ITEMS_PER_PAGE: 10,
  RECENT_ITEMS_COUNT: 5
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_ADDRESS_LENGTH: 255,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
  MIN_QTY: 1,
  MAX_QTY: 9999,
  MIN_STOCK: 0,
  MAX_STOCK: 99999,
  MAX_DISCOUNT: 100,
  MAX_TAX: 100
};

// Format Options
export const FORMAT = {
  CURRENCY: {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  },
  NUMBER: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  DATE: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'quotation_app_theme',
  USER_PREFERENCES: 'quotation_app_preferences',
  FORM_DRAFT: 'quotation_form_draft'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  SERVER_ERROR: 'Server sedang bermasalah. Silakan coba lagi nanti.',
  NOT_FOUND: 'Data tidak ditemukan.',
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid.',
  UNKNOWN_ERROR: 'Terjadi kesalahan tidak dikenal.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Data berhasil disimpan',
  UPDATE_SUCCESS: 'Data berhasil diperbarui', 
  DELETE_SUCCESS: 'Data berhasil dihapus',
  EXPORT_SUCCESS: 'File berhasil diekspor',
  IMPORT_SUCCESS: 'Data berhasil diimpor'
};

// Loading Messages
export const LOADING_MESSAGES = {
  SAVING: 'Menyimpan data...',
  LOADING: 'Memuat data...',
  DELETING: 'Menghapus data...',
  EXPORTING: 'Mengekspor file...',
  IMPORTING: 'Mengimpor data...',
  PROCESSING: 'Memproses...'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// File Types
export const ALLOWED_FILE_TYPES = {
  EXCEL: ['.xlsx', '.xls'],
  PDF: ['.pdf'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif']
};

// Export Formats
export const EXPORT_FORMATS = {
  EXCEL: 'excel',
  PDF: 'pdf',
  CSV: 'csv'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  FILENAME: 'YYYYMMDD'
};

// Breakpoints untuk responsive design
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Overview aplikasi',
    color: '#4285f4'
  },
  {
    id: 'penawaran',
    label: 'Penawaran',
    icon: '📋',
    description: 'Kelola penawaran',
    color: '#34a853'
  },
  {
    id: 'barangjasa',
    label: 'Barang & Jasa',
    icon: '📦',
    description: 'Kelola produk',
    color: '#fbbc04'
  },
  {
    id: 'customer',
    label: 'Customer',
    icon: '👥',
    description: 'Kelola customer',
    color: '#ea4335'
  },
  {
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: '⚙️',
    description: 'Pengaturan aplikasi',
    color: '#9aa0a6'
  }
];
