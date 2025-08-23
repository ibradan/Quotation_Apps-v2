/**
 * Validation utilities untuk form inputs
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indonesian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} wajib diisi`;
  }
  return null;
};

// Number validation
export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return 'Harus berupa angka';
  }
  if (num < min) {
    return `Minimal ${min}`;
  }
  if (num > max) {
    return `Maksimal ${max}`;
  }
  return null;
};

// Date validation
export const validateDate = (date) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Format tanggal tidak valid';
  }
  
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());
  
  if (dateObj < minDate) {
    return 'Tanggal tidak boleh lebih dari 1 tahun yang lalu';
  }
  if (dateObj > maxDate) {
    return 'Tanggal tidak boleh lebih dari 2 tahun ke depan';
  }
  
  return null;
};

// Quotation item validation
export const validateQuotationItem = (item) => {
  const errors = {};
  
  if (!item.item_id) {
    errors.item_id = 'Barang/jasa wajib dipilih';
  }
  
  const qtyError = validateNumber(item.qty, 1);
  if (qtyError) {
    errors.qty = qtyError;
  }
  
  const priceError = validateNumber(item.price, 0);
  if (priceError) {
    errors.price = priceError;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Customer validation
export const validateCustomer = (customer) => {
  const errors = {};
  
  const nameError = validateRequired(customer.name, 'Nama customer');
  if (nameError) errors.name = nameError;
  
  if (customer.email && !validateEmail(customer.email)) {
    errors.email = 'Format email tidak valid';
  }
  
  if (customer.phone && !validatePhone(customer.phone)) {
    errors.phone = 'Format nomor telepon tidak valid';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Item validation
export const validateItem = (item) => {
  const errors = {};
  
  const nameError = validateRequired(item.name, 'Nama barang/jasa');
  if (nameError) errors.name = nameError;
  
  const priceError = validateNumber(item.price, 0);
  if (priceError) errors.price = priceError;
  
  if (item.stock !== undefined) {
    const stockError = validateNumber(item.stock, 0);
    if (stockError) errors.stock = stockError;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Quotation validation
export const validateQuotation = (quotation) => {
  const errors = {};
  
  const customerError = validateRequired(quotation.customer_id, 'Customer');
  if (customerError) errors.customer_id = customerError;
  
  const dateError = validateDate(quotation.date);
  if (dateError) errors.date = dateError;
  
  if (!quotation.items || quotation.items.length === 0) {
    errors.items = 'Minimal harus ada 1 item';
  } else {
    // Validate each item
    const itemErrors = quotation.items.map(validateQuotationItem).filter(Boolean);
    if (itemErrors.length > 0) {
      errors.items = `Ada ${itemErrors.length} item dengan data tidak valid`;
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Format currency for display
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format number with thousands separator
export const formatNumber = (number) => {
  return new Intl.NumberFormat('id-ID').format(number);
};

// Clean phone number for storage
export const cleanPhoneNumber = (phone) => {
  return phone.replace(/\s+/g, '').replace(/\-/g, '');
};
