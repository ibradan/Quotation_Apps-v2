import { apiClient } from './apiClient';

export const customerService = {
  // Get all customers
  async getAll(params = {}) {
    const response = await apiClient.get('/customers', params);
    return response;
  },

  // Get customer by ID
  async getById(id) {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  // Get customer by name
  async getByName(name) {
    const response = await apiClient.get(`/customers/name/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Create new customer
  async create(customerData) {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  // Update customer
  async update(id, customerData) {
    const response = await apiClient.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer
  async delete(id) {
    const response = await apiClient.delete(`/customers/${id}`);
    return response;
  },

  // Search customers
  async search(query) {
    const response = await apiClient.get('/customers/search', { q: query });
    return response.data;
  },

  // Get statistics
  async getStatistics() {
    const response = await apiClient.get('/customers/statistics');
    return response.data;
  }
};
