// Utility functions for formatting data

// Format currency
export const formatCurrency = (amount, currency = 'IDR') => {
  if (amount === null || amount === undefined) return '-';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '-';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
};

// Format number
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '-';
  
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(num)) return '-';
  
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '-';
  
  return `${num.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    
    return new Intl.DateTimeFormat('id-ID', defaultOptions).format(dateObj);
  } catch (error) {
    return '-';
  }
};

// Format date time
export const formatDateTime = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Baru saja';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari yang lalu`;
    } else {
      return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  } catch (error) {
    return '-';
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Indonesian phone number
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+62${cleaned.substring(1)}`;
  } else {
    return phone;
  }
};

// Format quotation number
export const formatQuotationNumber = (number, prefix = 'QTN') => {
  if (!number) return '-';
  
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequence = String(number).padStart(4, '0');
  
  return `${prefix}/${year}/${month}/${sequence}`;
};

// Format status
export const formatStatus = (status) => {
  const statusMap = {
    'draft': 'Draft',
    'pending': 'Menunggu',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan',
    'expired': 'Kadaluarsa'
  };
  
  return statusMap[status] || status;
};

// Get status color
export const getStatusColor = (status) => {
  const colorMap = {
    'draft': 'default',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'error',
    'completed': 'success',
    'cancelled': 'error',
    'expired': 'error'
  };
  
  return colorMap[status] || 'default';
};

// Format address
export const formatAddress = (address) => {
  if (!address) return '-';
  
  // Remove extra whitespace and normalize line breaks
  return address
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ', ')
    .trim();
};

// Format name
export const formatName = (name) => {
  if (!name) return '-';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Format initials
export const formatInitials = (name) => {
  if (!name) return '-';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Format duration
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '-';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

// Format decimal
export const formatDecimal = (number, decimals = 2) => {
  if (number === null || number === undefined) return '-';
  
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(num)) return '-';
  
  return num.toFixed(decimals);
};

// Format weight
export const formatWeight = (weight, unit = 'kg') => {
  if (weight === null || weight === undefined) return '-';
  
  const num = typeof weight === 'string' ? parseFloat(weight) : weight;
  
  if (isNaN(num)) return '-';
  
  return `${formatNumber(num, 2)} ${unit}`;
};

// Format dimensions
export const formatDimensions = (length, width, height, unit = 'cm') => {
  if (!length || !width || !height) return '-';
  
  const l = typeof length === 'string' ? parseFloat(length) : length;
  const w = typeof width === 'string' ? parseFloat(width) : width;
  const h = typeof height === 'string' ? parseFloat(height) : height;
  
  if (isNaN(l) || isNaN(w) || isNaN(h)) return '-';
  
  return `${formatNumber(l)} × ${formatNumber(w)} × ${formatNumber(h)} ${unit}`;
}; 