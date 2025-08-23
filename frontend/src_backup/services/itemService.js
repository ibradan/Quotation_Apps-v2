import { apiClient } from './apiClient';

export const itemService = {
  // Get all items
  async getAll(params = {}) {
    const response = await apiClient.get('/items', params);
    return response;
  },

  // Get item by ID
  async getById(id) {
    const response = await apiClient.get(`/items/${id}`);
    return response.data;
  },

  // Create new item
  async create(itemData) {
    const response = await apiClient.post('/items', itemData);
    return response.data;
  },

  // Update item
  async update(id, itemData) {
    const response = await apiClient.put(`/items/${id}`, itemData);
    return response.data;
  },

  // Delete item
  async delete(id) {
    const response = await apiClient.delete(`/items/${id}`);
    return response;
  },

  // Get items by quotation
  async getByQuotation(quotationId) {
    const response = await apiClient.get(`/items/quotation/${quotationId}`);
    return response.data;
  },

  // Get statistics
  async getStatistics() {
    const response = await apiClient.get('/items/statistics');
    return response.data;
  }
};
