import React, { useState, useEffect } from 'react';
import './Settings.css';
import { apiClient } from '../utils/apiUtils';

const Settings = ({ settings }) => {
  const { settings: currentSettings, loading, saveSettings } = settings;
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_city: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    company_logo: ''
  });

  useEffect(() => {
    if (currentSettings) {
      setFormData(currentSettings);
    }
  }, [currentSettings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Database Export Function
  const handleExportDatabase = async () => {
    try {
      const [customers, items, quotations, settings] = await Promise.all([
        apiClient.get('/customers'),
        apiClient.get('/items'),
        apiClient.get('/quotations'),
        apiClient.get('/settings')
      ]);

      const databaseExport = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          customers,
          items,
          quotations,
          settings
        }
      };

      const blob = new Blob([JSON.stringify(databaseExport, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('✅ Database berhasil di-export!');
    } catch (error) {
      console.error('Error exporting database:', error);
      alert('❌ Gagal export database: ' + error.message);
    }
  };

  // Database Import Function
  const handleImportDatabase = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const confirmation = confirm(
      '⚠️ PERINGATAN: Import akan mengganti SEMUA data yang ada dengan data dari file backup.\n\nLanjutkan?'
    );

    if (!confirmation) {
      event.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.data) {
        throw new Error('Format file tidak valid');
      }

      const { customers, items, quotations, settings } = importData.data;

      await Promise.all([
        apiClient.post('/database/reset'),
        ...(customers || []).map(customer => apiClient.post('/customers', customer)),
        ...(items || []).map(item => apiClient.post('/items', item)),
        ...(quotations || []).map(quotation => apiClient.post('/quotations', quotation)),
        settings ? apiClient.put('/settings', settings) : Promise.resolve()
      ]);
      
      alert('✅ Database berhasil di-import! Halaman akan di-refresh.');
      window.location.reload();
    } catch (error) {
      console.error('Error importing database:', error);
      alert('❌ Gagal import database: ' + error.message);
      event.target.value = '';
    }
  };

  // Database Reset Function
  const handleResetDatabase = async () => {
    const confirmation = confirm(
      '🚨 PERINGATAN KERAS: Ini akan menghapus SEMUA data (customers, items, quotations) dan tidak dapat dibatalkan!\n\nKetik "RESET" untuk konfirmasi:'
    );

    if (!confirmation) return;

    const doubleConfirm = prompt('Ketik "RESET" (huruf besar) untuk konfirmasi:');
    if (doubleConfirm !== 'RESET') {
      alert('Reset dibatalkan');
      return;
    }

    try {
      await apiClient.post('/database/reset');
      alert('✅ Database berhasil di-reset! Halaman akan di-refresh.');
      window.location.reload();
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('❌ Gagal reset database: ' + error.message);
    }
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: '#1a73e8'}}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Pengaturan
        </h1>
        <p className="settings-subtitle">Konfigurasi informasi perusahaan dan pengaturan aplikasi</p>
      </div>
      
      {loading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">Memuat pengaturan...</p>
        </div>
      ) : (
        <div className="settings-content">
          {/* Company Information Section */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                  <path d="M9 9v.01"/>
                  <path d="M9 12v.01"/>
                  <path d="M9 15v.01"/>
                  <path d="M9 18v.01"/>
                </svg>
              </div>
              <div className="section-title">
                <h2>Informasi Perusahaan</h2>
                <p className="section-description">Konfigurasi data perusahaan untuk tampil di quotation</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="settings-form">
              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18"/>
                    <path d="M5 21V7l8-4v18"/>
                    <path d="M19 21V11l-6-4"/>
                  </svg>
                  Nama Perusahaan
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name || ''}
                  onChange={handleChange}
                  placeholder="Contoh: PT. Teknologi Maju"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Alamat Lengkap
                </label>
                <textarea
                  name="company_address"
                  value={formData.company_address || ''}
                  onChange={handleChange}
                  placeholder="Jl. Contoh No. 123, RT/RW 01/02"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Kota
                </label>
                <input
                  type="text"
                  name="company_city"
                  value={formData.company_city || ''}
                  onChange={handleChange}
                  placeholder="Jakarta"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  name="company_phone"
                  value={formData.company_phone || ''}
                  onChange={handleChange}
                  placeholder="+62 21 1234 5678"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email
                </label>
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email || ''}
                  onChange={handleChange}
                  placeholder="info@perusahaan.com"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  Website
                </label>
                <input
                  type="url"
                  name="company_website"
                  value={formData.company_website || ''}
                  onChange={handleChange}
                  placeholder="https://www.perusahaan.com"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </form>
          </div>

          {/* Database Utilities Section */}
          <div className="settings-section">
            <div className="section-header">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
              </div>
              <div className="section-title">
                <h2>Utilitas Database</h2>
                <p className="section-description">Backup, restore, dan kelola data aplikasi</p>
              </div>
            </div>

            <div className="utility-actions">
              <div className="utility-card export" onClick={handleExportDatabase}>
                <div className="utility-header">
                  <div className="utility-icon export">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <div className="utility-content">
                    <h3>Export Database</h3>
                    <p>Download semua data sebagai file backup</p>
                  </div>
                </div>
                <div className="utility-footer">
                  <span className="utility-status">JSON Format</span>
                  <div className="utility-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"/>
                      <polyline points="7,7 17,7 17,17"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="utility-card import" onClick={() => document.getElementById('import-file').click()}>
                <div className="utility-header">
                  <div className="utility-icon import">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div className="utility-content">
                    <h3>Import Database</h3>
                    <p>Restore data dari file backup</p>
                  </div>
                </div>
                <div className="utility-footer">
                  <span className="utility-status">Replace All Data</span>
                  <div className="utility-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"/>
                      <polyline points="7,7 17,7 17,17"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="utility-card reset" onClick={handleResetDatabase}>
                <div className="utility-header">
                  <div className="utility-icon reset">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </div>
                  <div className="utility-content">
                    <h3>Reset Database</h3>
                    <p>Hapus semua data dan mulai dari awal</p>
                  </div>
                </div>
                <div className="utility-footer">
                  <span className="utility-status">⚠️ Irreversible</span>
                  <div className="utility-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"/>
                      <polyline points="7,7 17,7 17,17"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        type="file"
        id="import-file"
        className="hidden-input"
        accept=".json"
        onChange={handleImportDatabase}
      />
    </div>
  );
};

export default Settings;
