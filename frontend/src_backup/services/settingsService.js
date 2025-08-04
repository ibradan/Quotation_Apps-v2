import { apiClient } from './apiClient';

export const settingsService = {
  // Get settings
  async get() {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  // Update settings
  async update(settingsData) {
    const response = await apiClient.put('/settings', settingsData);
    return response.data;
  }
};
