import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './InvoiceManagement.css';

const API_BASE_URL = 'http://localhost:3001';

// Icon Components
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  
  const [formData, setFormData] = useState({
    customer: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    title: 'INVOICE BARANG/JASA',
    paymentTerms: 'Net 30',
    taxRate: 11,
    discountRate: 0,
    totalAmount: 0,
    downPayment: 0,
    notes: ''
  });

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const count = invoices.length + 1;
    return `INV-${year}${month}-${count.toString().padStart(3, '0')}`;
  };

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/invoices`);
        setInvoices(response.data);
      } catch (error) {
        setError('Gagal memuat data invoice: ' + (error.response?.data?.error || error.message));
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const invoiceData = {
        customer: formData.customer || 'Customer',
        date: formData.invoiceDate,
        status: formData.status,
        title: formData.title || 'INVOICE BARANG/JASA',
        invoice_number: formData.invoiceNumber || generateInvoiceNumber(),
        discount: formData.discountRate || 0,
        tax: formData.taxRate || 11,
        total: formData.totalAmount || 0,
        down_payment: formData.downPayment || 0,
        due_date: formData.dueDate,
        payment_terms: formData.paymentTerms || 'Net 30'
      };

      if (editingInvoice) {
        await axios.put(`${API_BASE_URL}/invoices/${editingInvoice.id}`, invoiceData);
        setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? { ...inv, ...invoiceData } : inv));
      } else {
        const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData);
        setInvoices(prev => [...prev, response.data]);
      }

      resetForm();
    } catch (error) {
      alert('Gagal menyimpan invoice: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'draft',
      title: 'INVOICE BARANG/JASA',
      paymentTerms: 'Net 30',
      taxRate: 11,
      discountRate: 0,
      totalAmount: 0,
      downPayment: 0,
      notes: ''
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customer: invoice.customer || '',
      invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || '',
      invoiceDate: invoice.date || invoice.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: invoice.due_date || invoice.dueDate || '',
      status: invoice.status || 'draft',
      title: invoice.title || 'INVOICE BARANG/JASA',
      paymentTerms: invoice.payment_terms || invoice.paymentTerms || 'Net 30',
      taxRate: invoice.tax || invoice.taxRate || 11,
      discountRate: invoice.discount || invoice.discountRate || 0,
      totalAmount: invoice.total || invoice.totalAmount || 0,
      notes: invoice.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus invoice ini?')) {
      try {
        await axios.delete(`${API_BASE_URL}/invoices/${id}`);
        setInvoices(prev => prev.filter(inv => inv.id !== id));
      } catch (error) {
        alert('Gagal menghapus invoice: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handlePreview = (invoice) => {
    setPreviewInvoice(invoice);
    setShowPreview(true);
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      // Create a temporary hidden element for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.id = 'invoice-pdf-content';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.color = '#333';
      
      // Generate invoice HTML content
      const invoiceHTML = `
        <div style="background: #4ecdc4; padding: 40px; font-family: Arial, sans-serif; color: #333;">
          <div style="background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; max-width: 800px; margin: 0 auto;">
            <!-- Header -->
            <div style="padding: 20px; border-bottom: 2px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="display: flex; gap: 3px;">
                  <div style="width: 8px; height: 25px; border-radius: 2px; background: #00d4aa;"></div>
                  <div style="width: 8px; height: 25px; border-radius: 2px; background: #ff6b35;"></div>
                  <div style="width: 8px; height: 25px; border-radius: 2px; background: #4ecdc4;"></div>
                  <div style="width: 8px; height: 25px; border-radius: 2px; background: #45b7d1;"></div>
                </div>
                <div>
                  <h2 style="margin: 0; color: #333; font-size: 24px; font-weight: 700;">Quotation Apps</h2>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Solusi Bisnis Profesional</p>
                </div>
              </div>
              <div style="background: white; color: #333; padding: 15px; border-radius: 10px; text-align: center; min-width: 200px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; text-transform: uppercase;">INVOICE</h1>
                <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Detail Invoice</h3>
                <div style="font-size: 12px; line-height: 1.4;">
                  <p style="margin: 3px 0;"><strong>No. Invoice:</strong> ${invoice.invoice_number || invoice.invoiceNumber}</p>
                  <p style="margin: 3px 0;"><strong>Tanggal:</strong> ${new Date(invoice.date || invoice.invoiceDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p style="margin: 3px 0;"><strong>Status:</strong> ${invoice.status}</p>
                  <div style="font-size: 18px; font-weight: 700; margin-top: 8px; color: #ff4757;">
                    Total: ${formatCurrency(invoice.total || invoice.totalAmount || 0)}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 20px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 20px;">
                <div>
                  <h3 style="color: #4ecdc4; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Tagihan Kepada</h3>
                  <div style="font-size: 18px; font-weight: 700; color: #333; margin: 6px 0;">${invoice.customer}</div>
                  <p style="margin: 4px 0; color: #333; font-size: 14px;">Pelanggan</p>
                  <p style="margin: 4px 0; color: #333; font-size: 14px;">Telepon: +62 21 1234 5678</p>
                  <p style="margin: 4px 0; color: #333; font-size: 14px;">Email: customer@example.com</p>
                </div>
                <div>
                  <h3 style="color: #4ecdc4; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Proyek</h3>
                  <p style="margin: 4px 0; color: #333; font-size: 14px;">Layanan bisnis profesional dan solusi yang disediakan sesuai dengan kesepakatan penawaran.</p>
                  <div style="height: 1px; background: #f0f0f0; margin: 12px 0;"></div>
                  <p style="margin: 4px 0; color: #333; font-size: 14px;"><strong>ID Klien:</strong> CL-${Math.floor(Math.random() * 1000000)}</p>
                  <p style="margin: 4px 0; color: #333; font-size: 14px;"><strong>No. Akun:</strong> ACC-${Math.floor(Math.random() * 1000000)}</p>
                </div>
              </div>
              
              <!-- Items Table -->
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; fontWeight: '600'; color: '#333'; borderBottom: '2px solid #e9ecef';">NO</th>
                    <th style="padding: 10px; text-align: left; fontWeight: '600'; color: '#333'; borderBottom: '2px solid #e9ecef';">DESKRIPSI ITEM</th>
                    <th style="padding: 10px; text-align: center; fontWeight: '600'; color: '#333'; borderBottom: '2px solid #e9ecef';">QTY</th>
                    <th style="padding: 10px; text-align: right; fontWeight: '600'; color: '#333'; borderBottom: '2px solid #e9ecef';">HARGA</th>
                    <th style="padding: 10px; text-align: right; fontWeight: '600'; color: '#333'; borderBottom: '2px solid #e9ecef';">JUMLAH</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 10px; borderBottom: '1px solid #f0f0f0'; color: '#333';">1</td>
                    <td style="padding: 10px; borderBottom: '1px solid #f0f0f0'; color: '#333';">
                      <div style="fontWeight: '600'; color: '#333';">Layanan Profesional</div>
                      <div style="color: '#666'; fontSize: '12px'; marginTop: '2px';">Solusi bisnis komprehensif dan layanan konsultasi yang disediakan sesuai dengan persyaratan proyek.</div>
                    </td>
                    <td style="padding: 10px; borderBottom: '1px solid #f0f0f0'; color: '#333'; textAlign: 'center';">1</td>
                    <td style="padding: 10px; borderBottom: '1px solid #f0f0f0'; color: '#333'; textAlign: 'right';">
                      ${formatCurrency(invoice.total || invoice.totalAmount || 0)}
                    </td>
                    <td style="padding: 10px; borderBottom: '1px solid #f0f0f0'; color: '#333'; textAlign: 'right'; fontWeight: '700';">
                      ${formatCurrency(invoice.total || invoice.totalAmount || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Summary -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                <div>
                  <h3 style="color: #4ecdc4; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Metode Pembayaran</h3>
                  <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                    <div style="width: 20px; height: 12px; border-radius: 4px; background: #00d4aa;"></div>
                    <div style="width: 20px; height: 12px; border-radius: 4px; background: #ff6b35;"></div>
                    <div style="width: 20px; height: 12px; border-radius: 4px; background: #4ecdc4;"></div>
                    <div style="width: 20px; height: 12px; border-radius: 4px; background: #ff4757;"></div>
                  </div>
                  <p style="margin: 4px 0; color: #333; font-size: 14px;"><strong>Transfer Bank:</strong> 1234-5678-9012-3456</p>
                  <p style="margin: 4px 0; color: #333; font-size: 14px;"><strong>PayPal:</strong> payment@quotationapps.com</p>
                </div>
                <div style="text-align: right;">
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
                    <span>Sub-Total:</span>
                    <span>${formatCurrency(invoice.total || invoice.totalAmount || 0)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
                    <span>Pajak (11%):</span>
                    <span>${formatCurrency((invoice.total || invoice.totalAmount || 0) * 0.11)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
                    <span>Diskon (10%):</span>
                    <span>-${formatCurrency((invoice.total || invoice.totalAmount || 0) * 0.10)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px;">
                    <span>DP (Down Payment):</span>
                    <span>-${formatCurrency(invoice.down_payment || 0)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 16px; font-weight: 800; color: #ff4757; border-top: 2px solid #f0f0f0; padding-top: 6px; margin-top: 6px;">
                    <span>TOTAL:</span>
                    <span>${formatCurrency((invoice.total || invoice.totalAmount || 0) - (invoice.down_payment || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 15px; background: #f8f9fa; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div style="color: #333;">
                <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700;">Terima Kasih Telah Berbisnis Dengan Kami!</h3>
                <p style="margin: 4px 0; color: #666; font-size: 10px; line-height: 1.3;">
                  Pembayaran jatuh tempo dalam 30 hari. Denda keterlambatan 2% per bulan. 
                  Layanan kami mencakup konsultasi, implementasi, dan dukungan teknis sesuai dengan 
                  kesepakatan yang telah ditandatangani.
                </p>
              </div>
              <div style="text-align: right; color: #333;">
                <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700;">Tanda Tangan</h3>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">Tim Quotation Apps</p>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">Manajer Akun</p>
                <div style="display: flex; gap: 3px; justify-content: flex-end; margin-top: 8px;">
                  <div style="width: 8px; height: 25px; border-radius: 2px; background: #00d4aa;"></div>
                  <div style="width: 8px; height: 25px; border-radius: 2px; background: #ff6b35;"></div>
                  <div style="width: 8px; height: 25px; border-radius: 2px; background: #4ecdc4;"></div>
                  <div style="width: 8px; height: 25px; border-radius: 2px; background: #45b7d1;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      tempDiv.innerHTML = invoiceHTML;
      document.body.appendChild(tempDiv);
      
      // Generate PDF
      const canvas = await html2canvas(tempDiv, { 
        scale: 1.5, // Better balance between quality and size
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#4ecdc4',
        logging: false,
        imageTimeout: 0,
        removeContainer: true
      });
      const imgData = canvas.toDataURL('image/png', 1.0); // PNG for better text clarity

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice_${invoice.invoice_number || invoice.invoiceNumber}.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
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

  // Loading and error states
  if (loading) {
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
          </div>
        </div>
        <div className="loading-state">
          Loading invoice data...
        </div>
      </div>
    );
  }

  if (error) {
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
          </div>
        </div>
        <div className="error-state">
          <div>❌ Error</div>
          <div>{error}</div>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

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
            style={{
              background: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total || 0), 0))}
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
                  <label>Customer</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData(prev => ({...prev, customer: e.target.value}))}
                    placeholder="Masukkan nama customer"
                    required
                  />
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

                <div className="form-group">
                  <label>Discount Rate (%)</label>
                  <input
                    type="number"
                    value={formData.discountRate}
                    onChange={(e) => setFormData(prev => ({...prev, discountRate: parseFloat(e.target.value)}))}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Total Amount</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({...prev, totalAmount: parseFloat(e.target.value)}))}
                    min="0"
                    step="1000"
                    placeholder="Masukkan total amount"
                  />
                </div>

                <div className="form-group">
                  <label>Down Payment (DP)</label>
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => setFormData(prev => ({...prev, downPayment: parseFloat(e.target.value)}))}
                    min="0"
                    step="1000"
                    placeholder="Masukkan jumlah DP"
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

      {/* Preview Modal */}
      {showPreview && previewInvoice && (
        <div className="modal-overlay">
          <div className="invoice-form-modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>Preview Invoice - {previewInvoice.invoice_number || previewInvoice.invoiceNumber}</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowPreview(false)}
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
            
                          <div style={{ 
                padding: '0', 
                background: '#4ecdc4',
                minHeight: '80vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <div id="invoice-preview-content" style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                width: '800px',
                maxWidth: '90vw',
                overflow: 'hidden',
                fontFamily: 'Arial, sans-serif',
                color: '#333'
              }}>
                {/* Header */}
                <div style={{
                  padding: '40px',
                  borderBottom: '2px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '30px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <div style={{ width: '8px', height: '25px', borderRadius: '2px', background: '#00d4aa' }}></div>
                      <div style={{ width: '8px', height: '25px', borderRadius: '2px', background: '#ff6b35' }}></div>
                      <div style={{ width: '8px', height: '25px', borderRadius: '2px', background: '#4ecdc4' }}></div>
                      <div style={{ width: '8px', height: '25px', borderRadius: '2px', background: '#45b7d1' }}></div>
                    </div>
                    <div>
                      <h2 style={{ margin: '0', color: '#333', fontSize: '24px', fontWeight: '700' }}>Quotation Apps</h2>
                      <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Solusi Bisnis Profesional</p>
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '800', color: '#333', textTransform: 'uppercase' }}>INVOICE</h1>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>Detail Invoice</h3>
                    <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666' }}>
                      <p style={{ margin: '5px 0' }}><strong>No. Invoice:</strong> {previewInvoice.invoice_number || previewInvoice.invoiceNumber}</p>
                      <p style={{ margin: '5px 0' }}><strong>Tanggal:</strong> {new Date(previewInvoice.date || previewInvoice.invoiceDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      <p style={{ margin: '5px 0' }}><strong>Status:</strong> {previewInvoice.status}</p>
                      <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '15px', color: '#ff4757' }}>
                        Total: {formatCurrency(previewInvoice.total || previewInvoice.totalAmount || 0)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div style={{ padding: '0 40px 40px 40px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                    <div>
                      <h3 style={{ color: '#4ecdc4', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>Tagihan Kepada</h3>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#333', margin: '10px 0' }}>{previewInvoice.customer}</div>
                      <div style={{ color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
                        <p style={{ margin: '5px 0' }}>Alamat: {previewInvoice.customer_address || 'N/A'}</p>
                        <p style={{ margin: '5px 0' }}>Email: {previewInvoice.customer_email || 'N/A'}</p>
                        <p style={{ margin: '5px 0' }}>Telp: {previewInvoice.customer_phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 style={{ color: '#4ecdc4', margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>Informasi Pembayaran</h3>
                      <div style={{ color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
                        <p style={{ margin: '5px 0' }}><strong>Metode:</strong> {previewInvoice.payment_method || 'Transfer Bank'}</p>
                        <p style={{ margin: '5px 0' }}><strong>Rekening:</strong> {previewInvoice.bank_account || 'N/A'}</p>
                        <p style={{ margin: '5px 0' }}><strong>Jatuh Tempo:</strong> {previewInvoice.due_date ? new Date(previewInvoice.due_date).toLocaleDateString('id-ID') : 'N/A'}</p>
                        <p style={{ margin: '5px 0' }}><strong>Terms:</strong> {previewInvoice.payment_terms || 'Net 30'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Items Table */}
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ color: '#4ecdc4', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Detail Barang/Jasa</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', background: 'white' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #e0e0e0', fontWeight: '600', fontSize: '14px', color: '#333' }}>No</th>
                          <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #e0e0e0', fontWeight: '600', fontSize: '14px', color: '#333' }}>DESKRIPSI BARANG/JASA</th>
                          <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #e0e0e0', fontWeight: '600', fontSize: '14px', color: '#333' }}>QTY</th>
                          <th style={{ padding: '15px', textAlign: 'right', border: '1px solid #e0e0e0', fontWeight: '600', fontSize: '14px', color: '#333' }}>HARGA</th>
                          <th style={{ padding: '15px', textAlign: 'right', border: '1px solid #e0e0e0', fontWeight: '600', fontSize: '14px', color: '#333' }}>TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '15px', border: '1px solid #e0e0e0', fontSize: '14px' }}>1</td>
                          <td style={{ padding: '15px', border: '1px solid #e0e0e0', fontSize: '14px' }}>{previewInvoice.title || 'INVOICE BARANG/JASA'}</td>
                          <td style={{ padding: '15px', textAlign: 'center', border: '1px solid #e0e0e0', fontSize: '14px' }}>1</td>
                          <td style={{ padding: '15px', textAlign: 'right', border: '1px solid #e0e0e0', fontSize: '14px' }}>{formatCurrency(previewInvoice.total || previewInvoice.totalAmount || 0)}</td>
                          <td style={{ padding: '15px', textAlign: 'right', border: '1px solid #e0e0e0', fontSize: '14px' }}>{formatCurrency(previewInvoice.total || previewInvoice.totalAmount || 0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Summary */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '300px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>Subtotal:</span>
                        <span style={{ color: '#333' }}>{formatCurrency(previewInvoice.subtotal || previewInvoice.total || previewInvoice.totalAmount || 0)}</span>
                      </div>
                      {previewInvoice.discount_rate && previewInvoice.discount_rate > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                          <span style={{ color: '#666' }}>Diskon ({previewInvoice.discount_rate}%):</span>
                          <span style={{ color: '#333' }}>-{formatCurrency((previewInvoice.subtotal || previewInvoice.total || previewInvoice.totalAmount || 0) * (previewInvoice.discount_rate / 100))}</span>
                        </div>
                      )}
                      {previewInvoice.tax_rate && previewInvoice.tax_rate > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                          <span style={{ color: '#666' }}>PPN ({previewInvoice.tax_rate}%):</span>
                          <span style={{ color: '#333' }}>{formatCurrency((previewInvoice.subtotal || previewInvoice.total || previewInvoice.totalAmount || 0) * (previewInvoice.tax_rate / 100))}</span>
                        </div>
                      )}
                      {previewInvoice.down_payment && previewInvoice.down_payment > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                          <span style={{ color: '#666' }}>DP (Down Payment):</span>
                          <span style={{ color: '#333' }}>-{formatCurrency(previewInvoice.down_payment)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '18px', borderTop: '2px solid #e0e0e0', paddingTop: '15px', marginTop: '15px' }}>
                        <span style={{ color: '#333' }}>TOTAL:</span>
                        <span style={{ color: '#ff4757' }}>{formatCurrency((previewInvoice.total || previewInvoice.totalAmount || 0) - (previewInvoice.down_payment || 0))}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div style={{ padding: '30px', background: '#f8f9fa', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div style={{ color: '#333' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700' }}>Terima Kasih Telah Berbisnis Dengan Kami!</h3>
                    <div style={{ color: '#666', fontSize: '12px', lineHeight: '1.6' }}>
                      <strong>Syarat:</strong> Pembayaran jatuh tempo dalam {previewInvoice.payment_terms || '30'} hari dari tanggal invoice. Pembayaran terlambat dapat dikenakan biaya tambahan. Semua layanan disediakan sesuai dengan syarat dan ketentuan standar kami.
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', color: '#333' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600', fontFamily: 'Brush Script MT, cursive' }}>Tanda Tangan</h3>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Tim Quotation Apps</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Manajer Akun</p>
                    <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <div style={{ width: '6px', height: '20px', borderRadius: '2px', background: '#00d4aa' }}></div>
                      <div style={{ width: '6px', height: '20px', borderRadius: '2px', background: '#ff6b35' }}></div>
                      <div style={{ width: '6px', height: '20px', borderRadius: '2px', background: '#4ecdc4' }}></div>
                      <div style={{ width: '6px', height: '20px', borderRadius: '2px', background: '#ff4757' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    <span className="invoice-number">{invoice.invoice_number || invoice.invoiceNumber}</span>
                  </td>
                  <td>
                    <span className="customer-name">{invoice.customer}</span>
                  </td>
                  <td>
                    <span className="invoice-date">
                      {new Date(invoice.date || invoice.invoiceDate).toLocaleDateString('id-ID')}
                    </span>
                  </td>
                  <td>
                    <span className="due-date">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </td>
                  <td>
                    <span className="total-amount">
                      {formatCurrency(invoice.total || invoice.totalAmount || 0)}
                    </span>
                  </td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-info btn-sm"
                        onClick={() => handlePreview(invoice)}
                        title="Lihat Detail">
                        <IconEye />
                        <span>Lihat</span>
                      </button>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleEdit(invoice)}
                        title="Edit Invoice">
                        <IconEdit />
                        <span>Edit</span>
                      </button>
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleDownloadPDF(invoice)}
                        title="Download PDF">
                        <IconDownload />
                        <span>PDF</span>
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(invoice.id)}
                        title="Hapus Invoice">
                        <IconDelete />
                        <span>Hapus</span>
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
