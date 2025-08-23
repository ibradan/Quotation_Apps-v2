import { apiClient } from './apiClient';

export const quotationService = {
  // Get all quotations with optional filters
  async getAll(filters = {}) {
    return apiClient.get('/quotations', filters);
  },

  // Get paginated quotations
  async getPaginated(page = 1, limit = 10, filters = {}) {
    return apiClient.getPaginated('/quotations', page, limit, filters);
  },

  // Get quotation by ID
  async getById(id) {
    if (!id) throw new Error('ID quotation diperlukan');
    return apiClient.get(`/quotations/${id}`);
  },

  // Create new quotation
  async create(quotationData) {
    // Validate required fields
    if (!quotationData.customer_name) {
      throw new Error('Nama customer harus diisi');
    }
    if (!quotationData.date) {
      throw new Error('Tanggal harus diisi');
    }
    if (!quotationData.status) {
      quotationData.status = 'draft';
    }

    return apiClient.post('/quotations', quotationData);
  },

  // Update quotation
  async update(id, updates) {
    if (!id) throw new Error('ID quotation diperlukan');
    
    // Validate required fields for update
    if (updates.customer_name !== undefined && !updates.customer_name) {
      throw new Error('Nama customer harus diisi');
    }
    if (updates.date !== undefined && !updates.date) {
      throw new Error('Tanggal harus diisi');
    }

    return apiClient.put(`/quotations/${id}`, updates);
  },

  // Update quotation status only
  async updateStatus(id, status) {
    if (!id) throw new Error('ID quotation diperlukan');
    if (!status) throw new Error('Status harus diisi');

    const validStatuses = ['draft', 'pending', 'approved', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status tidak valid');
    }

    return apiClient.patch(`/quotations/${id}/status`, { status });
  },

  // Delete quotation
  async delete(id) {
    if (!id) throw new Error('ID quotation diperlukan');
    return apiClient.delete(`/quotations/${id}`);
  },

  // Export quotation to PDF
  async exportToPDF(id, filename) {
    if (!id) throw new Error('ID quotation diperlukan');
    const downloadFilename = filename || `quotation_${id}.pdf`;
    return apiClient.downloadFile(`/export/quotation/${id}`, downloadFilename);
  },

  // Get quotation statistics
  async getStats() {
    return apiClient.get('/quotations/stats');
  },

  // Duplicate quotation
  async duplicate(id) {
    if (!id) throw new Error('ID quotation diperlukan');
    return apiClient.post(`/quotations/${id}/duplicate`);
  },

  // Get quotation history
  async getHistory(id) {
    if (!id) throw new Error('ID quotation diperlukan');
    return apiClient.get(`/quotations/${id}/history`);
  },

  // Search quotations
  async search(query, filters = {}) {
    if (!query) return this.getAll(filters);
    
    return apiClient.get('/quotations/search', {
      q: query,
      ...filters
    });
  },

  // Get quotations by customer
  async getByCustomer(customerId, filters = {}) {
    if (!customerId) throw new Error('ID customer diperlukan');
    
    return apiClient.get('/quotations', {
      customer_id: customerId,
      ...filters
    });
  },

  // Get quotations by status
  async getByStatus(status, filters = {}) {
    if (!status) throw new Error('Status diperlukan');
    
    return apiClient.get('/quotations', {
      status,
      ...filters
    });
  },

  // Get quotations by date range
  async getByDateRange(startDate, endDate, filters = {}) {
    if (!startDate || !endDate) {
      throw new Error('Tanggal mulai dan tanggal akhir diperlukan');
    }
    
    return apiClient.get('/quotations', {
      start_date: startDate,
      end_date: endDate,
      ...filters
    });
  },

  // Generate quotation number
  async generateNumber() {
    return apiClient.get('/quotations/generate-number');
  },

  // Validate quotation data
  validateQuotationData(data) {
    const errors = [];

    if (!data.customer_name || data.customer_name.trim() === '') {
      errors.push('Nama customer harus diisi');
    }

    if (!data.date) {
      errors.push('Tanggal harus diisi');
    }

    if (!data.status) {
      errors.push('Status harus diisi');
    } else {
      const validStatuses = ['draft', 'pending', 'approved', 'rejected', 'expired'];
      if (!validStatuses.includes(data.status)) {
        errors.push('Status tidak valid');
      }
    }

    if (data.discount !== undefined) {
      const discount = parseFloat(data.discount);
      if (isNaN(discount) || discount < 0) {
        errors.push('Discount harus berupa angka positif');
      }
    }

    if (data.tax !== undefined) {
      const tax = parseFloat(data.tax);
      if (isNaN(tax) || tax < 0 || tax > 100) {
        errors.push('Tax harus berupa angka antara 0-100');
      }
    }

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
        if (!item.name || item.name.trim() === '') {
          errors.push(`Item ${index + 1}: Nama harus diisi`);
        }
        if (!item.qty || isNaN(item.qty) || parseFloat(item.qty) <= 0) {
          errors.push(`Item ${index + 1}: Quantity harus berupa angka positif`);
        }
        if (item.price === undefined || isNaN(item.price) || parseFloat(item.price) < 0) {
          errors.push(`Item ${index + 1}: Harga harus berupa angka positif`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
