import { useState, useEffect, useCallback } from 'react';
import { apiClient, safeApiCall } from '../utils/apiUtils';

export const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Default settings
  const defaultSettings = {
    company_name: 'PT. QUOTATION APPS',
    company_address: 'Jalan Raya No. 123, Jakarta',
    company_phone: '021-1234567',
    company_email: 'info@quotationapps.com',
    tax_rate: 11,
    currency: 'IDR',
    quotation_prefix: 'QT',
    quotation_footer: 'Terima kasih atas kepercayaan Anda',
    bank_name: 'Bank Mandiri',
    bank_account: '1234567890',
    bank_account_name: 'PT. QUOTATION APPS'
  };

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch settings dengan error handling robust
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settingsData = await safeApiCall(
        () => apiClient.get('/settings'),
        2,
        'fetch settings'
      );
      
      // Merge dengan default settings
      const mergedSettings = { ...defaultSettings };
      
      if (Array.isArray(settingsData)) {
        // Convert array of settings to object
        settingsData.forEach(setting => {
          if (setting && setting.key && setting.value !== undefined) {
            mergedSettings[setting.key] = setting.value;
          }
        });
      } else if (settingsData && typeof settingsData === 'object') {
        // Direct object
        Object.assign(mergedSettings, settingsData);
      }
      
      setSettings(mergedSettings);
    } catch (err) {
      setError(err.message || 'Gagal memuat pengaturan');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings
  const saveSettings = useCallback(async (newSettings) => {
    if (!newSettings || typeof newSettings !== 'object') {
      throw new Error('Data pengaturan tidak valid');
    }

    setSaving(true);
    setError(null);
    
    try {
      const result = await safeApiCall(
        () => apiClient.post('/settings', newSettings),
        1,
        'save settings'
      );
      
      // Update local state
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      return result;
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengaturan');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Update single setting
  const updateSetting = useCallback(async (key, value) => {
    if (!key) {
      throw new Error('Key pengaturan tidak valid');
    }

    try {
      await saveSettings({ [key]: value });
    } catch (err) {
      throw err;
    }
  }, [saveSettings]);

  // Reset settings to default
  const resetSettings = useCallback(async () => {
    try {
      await saveSettings(defaultSettings);
    } catch (err) {
      setError(err.message || 'Gagal mereset pengaturan');
      throw err;
    }
  }, [saveSettings]);

  // Get setting by key
  const getSetting = useCallback((key, defaultValue = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }, [settings]);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    // Data
    settings,
    defaultSettings,
    
    // States
    loading,
    saving,
    error,
    
    // Actions
    fetchSettings,
    saveSettings,
    updateSetting,
    resetSettings,
    getSetting,
    
    // Clear error manually
    clearError: () => setError(null)
  };
};
