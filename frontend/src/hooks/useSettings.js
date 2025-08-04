import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiUtils';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    company_name: 'QUOTATION APPS',
    company_address: 'Jl. Contoh No. 123',
    company_city: 'Jakarta, Indonesia 12345',
    company_phone: '+62 21 1234 5678',
    company_email: 'info@quotationapps.com',
    company_website: '',
    company_logo: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/settings');
      setSettings(data);
    } catch (err) {
      console.error('Gagal fetch settings:', err);
      // Tidak perlu alert karena settings bisa menggunakan default
    }
    setLoading(false);
  };

  // Save settings
  const saveSettings = async (data) => {
    setLoading(true);
    try {
      const result = await apiClient.put('/settings', data);
      setSettings(result);
      alert('Pengaturan berhasil disimpan');
    } catch (err) {
      console.error('Gagal simpan settings:', err);
      alert('Gagal simpan pengaturan: ' + (err?.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    fetchSettings,
    saveSettings
  };
}; 