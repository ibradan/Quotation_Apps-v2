import { useState, useEffect } from 'react';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import './InvoiceManagement.css';

// Icon Components untuk Invoice
const IconInvoice = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <path d="M9 9h6"/>
    <path d="M9 15h6"/>
    <path d="M9 12h6"/>
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

function InvoiceManagement({ quotations }) {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState('');
  const [formData, setFormData] = useState({
    quotationId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    notes: '',
    paymentTerms: '30 days',
    taxRate: 11,
    discountRate: 0
  });

  // Generate nomor invoice otomatis
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const count = invoices.length + 1;
    return `INV-${year}${month}-${count.toString().padStart(3, '0')}`;
  };

  // Sample data untuk demo
  useEffect(() => {
    if (invoices.length === 0) {
      console.log('Loading sample invoices...');
      const sampleInvoices = [
        {
          id: 1,
          invoiceNumber: 'INV-202408-001',
          quotationId: 1,
          quotationNumber: 'QUO-2024-001',
          customerName: 'PT. Maju Jaya',
          invoiceDate: '2024-08-01',
          dueDate: '2024-08-31',
          status: 'sent',
          totalAmount: 15750000,
          paidAmount: 0,
          notes: 'Pembayaran dalam 30 hari',
          paymentTerms: '30 days',
          taxRate: 11,
          discountRate: 0
        },
        {
          id: 2,
          invoiceNumber: 'INV-202408-002',
          quotationId: 2,
          quotationNumber: 'QUO-2024-002',
          customerName: 'CV. Sukses Makmur',
          invoiceDate: '2024-08-03',
          dueDate: '2024-09-02',
          status: 'paid',
          totalAmount: 22500000,
          paidAmount: 22500000,
          notes: 'Lunas - Transfer Bank',
          paymentTerms: '30 days',
          taxRate: 11,
          discountRate: 5
        }
      ];
      setInvoices(sampleInvoices);
      console.log('Sample invoices loaded:', sampleInvoices);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedQuot = quotations.quotations?.find(q => q.id === parseInt(formData.quotationId));
    
    if (!selectedQuot) {
      alert('Pilih quotation terlebih dahulu');
      return;
    }

    const invoiceData = {
      ...formData,
      id: editingInvoice ? editingInvoice.id : Date.now(),
      quotationNumber: selectedQuot.quotationNumber,
      customerName: selectedQuot.customerName,
      totalAmount: selectedQuot.totalAmount,
      paidAmount: 0,
      invoiceNumber: editingInvoice ? editingInvoice.invoiceNumber : generateInvoiceNumber()
    };

    if (editingInvoice) {
      setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? invoiceData : inv));
    } else {
      setInvoices(prev => [...prev, invoiceData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      quotationId: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'draft',
      notes: '',
      paymentTerms: '30 days',
      taxRate: 11,
      discountRate: 0
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      quotationId: invoice.quotationId.toString(),
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      notes: invoice.notes,
      paymentTerms: invoice.paymentTerms,
      taxRate: invoice.taxRate,
      discountRate: invoice.discountRate
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus invoice ini?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const handleDownloadPDF = (invoice) => {
    console.log('Generating PDF for invoice:', invoice);
    try {
      // Get quotation data for PDF
      const quotationData = quotations.quotations?.find(q => q.id === invoice.quotationId);
      console.log('Quotation data:', quotationData);
      
      // Company info (in real app, this would come from settings)
      const companyInfo = {
        name: 'PT. Quotation Apps Indonesia',
        address: 'Jl. Technology Street No. 123',
        city: 'Jakarta 12345',
        phone: 'Phone: +62 21 1234 5678',
        email: 'Email: info@quotationapps.com'
      };
      
      generateInvoicePDF(invoice, quotationData, companyInfo);
      console.log('PDF generation completed');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', class: 'status-draft' },
      sent: { label: 'Terkirim', class: 'status-sent' },
      paid: { label: 'Lunas', class: 'status-paid' },
      overdue: { label: 'Overdue', class: 'status-overdue' },
      cancelled: { label: 'Batal', class: 'status-cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const availableQuotations = quotations.quotations?.filter(q => 
    q.status === 'approved' && !invoices.some(inv => inv.quotationId === q.id)
  ) || [];

  return (
    <div className="invoice-management">
      <div className="invoice-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title">
              <IconInvoice />
              Invoice Management
            </h1>
            <p className="page-subtitle">Kelola invoice dari quotation yang approved</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
            disabled={availableQuotations.length === 0}
            style={{
              background: availableQuotations.length === 0 ? '#9aa0a6' : '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: availableQuotations.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(26,115,232,0.15)'
            }}
            onMouseOver={(e) => {
              if (availableQuotations.length > 0) {
                e.target.style.background = '#1557b0';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(26,115,232,0.25)';
              }
            }}
            onMouseOut={(e) => {
              if (availableQuotations.length > 0) {
                e.target.style.background = '#1a73e8';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(26,115,232,0.15)';
              }
            }}
          >
            <IconInvoice />
            Buat Invoice Baru
          </button>
        </div>

        {/* Stats Cards */}
        <div className="invoice-stats">
          <div className="stat-card stat-total">
            <div className="stat-icon">
              <IconInvoice />
            </div>
            <div className="stat-content">
              <div className="stat-number">{invoices.length}</div>
              <div className="stat-label">Total Invoice</div>
            </div>
          </div>
          
          <div className="stat-card stat-paid">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-number">{invoices.filter(inv => inv.status === 'paid').length}</div>
              <div className="stat-label">Lunas</div>
            </div>
          </div>
          
          <div className="stat-card stat-pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{invoices.filter(inv => inv.status === 'sent').length}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          
          <div className="stat-card stat-revenue">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-number">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0))}
              </div>
              <div className="stat-label">Total Pendapatan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="invoice-form-modal">
            <div className="modal-header">
              <h2>{editingInvoice ? 'Edit Invoice' : 'Buat Invoice Baru'}</h2>
              <button 
                className="close-btn" 
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#5f6368',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f1f3f4';
                  e.target.style.color = '#202124';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#5f6368';
                }}
              >×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="invoice-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Quotation</label>
                  <select
                    value={formData.quotationId}
                    onChange={(e) => setFormData(prev => ({...prev, quotationId: e.target.value}))}
                    required
                    disabled={editingInvoice}
                  >
                    <option value="">Pilih Quotation</option>
                    {availableQuotations.map(quotation => (
                      <option key={quotation.id} value={quotation.id}>
                        {quotation.quotationNumber} - {quotation.customerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tanggal Invoice</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData(prev => ({...prev, invoiceDate: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tanggal Jatuh Tempo</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({...prev, dueDate: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Terkirim</option>
                    <option value="paid">Lunas</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Batal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Term Pembayaran</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData(prev => ({...prev, paymentTerms: e.target.value}))}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="15 days">15 Hari</option>
                    <option value="30 days">30 Hari</option>
                    <option value="45 days">45 Hari</option>
                    <option value="60 days">60 Hari</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData(prev => ({...prev, taxRate: parseFloat(e.target.value)}))}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Catatan tambahan untuk invoice..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={resetForm}
                  style={{
                    background: '#f1f3f4',
                    color: '#5f6368',
                    border: '1px solid #dadce0',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#e8eaed';
                    e.target.style.borderColor = '#bdc1c6';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#f1f3f4';
                    e.target.style.borderColor = '#dadce0';
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{
                    background: '#1a73e8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(26,115,232,0.15)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#1557b0';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(26,115,232,0.25)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#1a73e8';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(26,115,232,0.15)';
                  }}
                >
                  {editingInvoice ? 'Update Invoice' : 'Buat Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="invoice-list">
        <div className="invoice-table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Quotation</th>
                <th>Customer</th>
                <th>Tanggal</th>
                <th>Jatuh Tempo</th>
                <th>Total</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>
                    <span className="invoice-number">{invoice.invoiceNumber}</span>
                  </td>
                  <td>
                    <span className="quotation-ref">{invoice.quotationNumber}</span>
                  </td>
                  <td>
                    <span className="customer-name">{invoice.customerName}</span>
                  </td>
                  <td>
                    <span className="invoice-date">
                      {new Date(invoice.invoiceDate).toLocaleDateString('id-ID')}
                    </span>
                  </td>
                  <td>
                    <span className="due-date">
                      {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
                    </span>
                  </td>
                  <td>
                    <span className="total-amount">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-view"
                        onClick={() => alert('Fitur preview invoice akan segera tersedia')}
                        title="Lihat Detail"
                        style={{
                          background: '#1a73e8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#1557b0'}
                        onMouseOut={(e) => e.target.style.background = '#1a73e8'}
                      >
                        <IconEye />
                        <span>View</span>
                      </button>
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(invoice)}
                        title="Edit Invoice"
                        style={{
                          background: '#34a853',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#2d7b47'}
                        onMouseOut={(e) => e.target.style.background = '#34a853'}
                      >
                        <IconEdit />
                        <span>Edit</span>
                      </button>
                      <button 
                        className="btn-icon btn-download"
                        onClick={() => handleDownloadPDF(invoice)}
                        title="Download PDF"
                        style={{
                          background: '#fbbc04',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#e37400'}
                        onMouseOut={(e) => e.target.style.background = '#fbbc04'}
                      >
                        <IconDownload />
                        <span>PDF</span>
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(invoice.id)}
                        title="Hapus Invoice"
                        style={{
                          background: '#ea4335',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#c5221f'}
                        onMouseOut={(e) => e.target.style.background = '#ea4335'}
                      >
                        <IconDelete />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {invoices.length === 0 && (
            <div className="empty-state">
              <IconInvoice />
              <h3>Belum Ada Invoice</h3>
              <p>Mulai buat invoice dari quotation yang sudah approved</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceManagement;
