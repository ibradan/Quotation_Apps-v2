import React from 'react';
import './QuotationList.css';
import QuotationForm from './QuotationForm';
import QuotationDetail from '../QuotationDetail';
import ExportPDFMenu from './ExportPDFMenu';
import QuotationPDFExporter from './QuotationPDFExporter';
import { useSettings } from '../hooks/useSettings';

const QuotationList = ({ quotations }) => {
  const {
    quotations: filteredQuotations,
    loading,
    filter,
    setFilter,
    history,
    historyLoading,
    fetchQuotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    fetchAllQuotationHistory,
    restoreHistory,
    hasOutOfStockItems
  } = quotations;

  const [formOpen, setFormOpen] = React.useState(false);
  const [editData, setEditData] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailData, setDetailData] = React.useState(null);
  const [expandedHistory, setExpandedHistory] = React.useState(null);
  const [exportPDFOpen, setExportPDFOpen] = React.useState(false);
  const [exportPDFData, setExportPDFData] = React.useState(null);
  
  const { generateQuotationPDF } = QuotationPDFExporter();
  const { settings } = useSettings();

  const openEditForm = (quotation) => {
    setEditData(quotation);
    setFormOpen(true);
  };

  const openDetail = (quotation) => {
    setDetailData(quotation);
    setDetailOpen(true);
  };

  const toggleHistory = (quotationId) => {
    if (expandedHistory === quotationId) {
      setExpandedHistory(null);
    } else {
      setExpandedHistory(quotationId);
      quotations.fetchQuotationHistory(quotationId);
    }
  };

  const handleAdd = async (data) => {
    try {
      await addQuotation(data);
      setFormOpen(false);
    } catch (err) {
      // Error sudah ditangani di hook
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateQuotation(editData.id, data);
      setFormOpen(false);
      setEditData(null);
    } catch (err) {
      // Error sudah ditangani di hook
    }
  };

  const handleExportPDF = async (quotation) => {
    setExportPDFData(quotation);
    setExportPDFOpen(true);
  };

  const handleQuickExportPDF = async (quotation) => {
    try {
      const pdf = await generateQuotationPDF(quotation, settings || {});
      pdf.save(`quotation_${quotation.quotation_number || quotation.id}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal export PDF: ' + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      );
      case 'sent': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22,2 15,22 11,13 2,9 22,2"/>
        </svg>
      );
      case 'draft': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      );
      case 'rejected': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      );
      default: return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#10b981';
      case 'sent': return '#3b82f6';
      case 'draft': return '#6b7280';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="quotation-list">
      <div className="page-header">
        <h1>Penawaran</h1>
        <p className="page-subtitle">Kelola semua penawaran</p>
      </div>
      
      <div className="controls with-prominent">
        <div className="prominent-section">
          <button 
            className="btn-add prominent"
            onClick={() => setFormOpen(true)}
            title="Tambah Penawaran Baru"
          >
            <span className="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </span>
            <span className="btn-text">Tambah<br/>Penawaran</span>
          </button>
        </div>
        
        <div className="search-section">
          <div className="search-wrapper">
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan customer, status, atau tanggal..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="btn-refresh"
            onClick={fetchQuotations} 
            disabled={loading}
            title="Refresh data"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data penawaran...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="quotation-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pelanggan</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Total</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map(q => (
                <React.Fragment key={q.id}>
                  <tr className="quotation-row">
                    <td>
                      <span className="id-cell">#{q.id}</span>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{q.customer}</span>
                        <span className="customer-email">{q.customer_email || 'No email'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        {new Date(q.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-badge ${q.status?.toLowerCase()}`}>
                          {getStatusIcon(q.status)}
                          {q.status}
                        </span>
                        {hasOutOfStockItems(q.id) && (
                          <span className="stock-warning">Stock Habis</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="total-cell">
                        Rp {q.total?.toLocaleString('id-ID') || '0'}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => openDetail(q)}
                          title="Lihat detail"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          <span>Lihat</span>
                        </button>
                        <div className="btn-group">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleQuickExportPDF(q)}
                            title="Quick Export PDF"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7,10 12,15 17,10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            <span>PDF</span>
                          </button>
                          <button 
                            className="btn btn-primary btn-sm dropdown-toggle"
                            onClick={() => handleExportPDF(q)}
                            title="PDF Options"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6,9 12,15 18,9"/>
                            </svg>
                          </button>
                        </div>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => openEditForm(q)}
                          title="Edit penawaran"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteQuotation(q.id)}
                          title="Hapus penawaran"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v6"/>
                          </svg>
                          <span>Hapus</span>
                        </button>
                        {history.some(h => h.quotation_id === q.id) && (
                          <button 
                            className="btn btn-info btn-sm"
                            onClick={() => toggleHistory(q.id)}
                            title="Lihat riwayat revisi"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 3v5h5"/>
                              <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
                            </svg>
                            <span>Riwayat</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Dropdown riwayat revisi */}
                  {expandedHistory === q.id && (
                    <tr className="history-row">
                      <td colSpan={6}>
                        <div className="history-section">
                          <div className="history-header">
                            <h4 className="history-title">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                              </svg>
                              Riwayat Revisi
                            </h4>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => setExpandedHistory(null)}
                              title="Tutup riwayat"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              <span>Tutup</span>
                            </button>
                          </div>
                          {historyLoading ? (
                            <div className="loading-state">
                              <div className="loading-spinner"></div>
                              <p>Memuat riwayat revisi...</p>
                            </div>
                          ) : history.some(h => h.quotation_id === q.id) ? (
                            <div className="history-items">
                              {history
                                .filter(h => h.quotation_id === q.id)
                                .map((h, index) => (
                                  <div key={h.id} className="history-item">
                                    <span className="history-timestamp">
                                      {new Date(h.updated_at).toLocaleString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    <span className="history-action">Revisi #{index + 1}</span>
                                    <button 
                                      className="history-restore"
                                      onClick={() => restoreHistory(h.id)}
                                      title="Restore ke versi ini"
                                    >
                                      Restore
                                    </button>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="empty-state">
                              <p>Tidak ada riwayat revisi untuk penawaran ini</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredQuotations.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                      </div>
                      <h3>Tidak ada data penawaran</h3>
                      <p>Mulai dengan membuat penawaran baru</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {formOpen && (
        <QuotationForm
          open={formOpen}
          initialData={editData}
          onSave={editData ? handleEdit : handleAdd}
          onClose={() => {
            setFormOpen(false);
            setEditData(null);
          }}
        />
      )}

      {detailOpen && detailData && (
        <QuotationDetail
          open={detailOpen}
          data={detailData}
          onClose={() => {
            setDetailOpen(false);
            setDetailData(null);
          }}
        />
      )}

      {exportPDFOpen && exportPDFData && (
        <ExportPDFMenu
          quotation={exportPDFData}
          onClose={() => {
            setExportPDFOpen(false);
            setExportPDFData(null);
          }}
        />
      )}
    </div>
  );
};

export default QuotationList;