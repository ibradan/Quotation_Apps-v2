import { useState, useEffect } from 'react';
import { apiClient } from './utils/apiUtils';
import ExportPDFMenu from './components/ExportPDFMenu';
import './QuotationDetail.css';

export default function QuotationDetail({ open, onClose, data }) {
  const [quotationItems, setQuotationItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportPDFOpen, setExportPDFOpen] = useState(false);

  useEffect(() => {
    if (open && data?.id) {
      fetchQuotationItems();
    }
  }, [open, data]);

  const fetchQuotationItems = async () => {
    setLoading(true);
    try {
      // Fetch semua items untuk cek stock
      const allItems = await apiClient.get('/items');
      
      // Fetch items untuk penawaran ini
      const quotationItems = await apiClient.get(`/quotation-items/${data.id}`);
      
      // Map quotation items dengan stock data dari master
      const itemsWithStock = quotationItems.map(item => {
        // Cari item yang sama di master data berdasarkan nama
        const masterItem = allItems.find(master => 
          master.name.toLowerCase() === item.name.toLowerCase() && 
          master.type === item.type
        );
        return {
          ...item,
          stock: masterItem ? masterItem.stock : 0
        };
      });
      
      setQuotationItems(itemsWithStock);
    } catch (err) {
      console.error('Gagal fetch quotation items:', err);
      setQuotationItems([]);
    }
    setLoading(false);
  };

  const handleExportPDF = async () => {
    setExportPDFOpen(true);
  };

  if (!open || !data) return null;
  
  const totalAmount = quotationItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="quotation-detail-overlay">
      <div className="quotation-detail-modal">
        <div className="quotation-detail-header">
          <h2>Detail Penawaran #{data.id}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        {/* Info dasar penawaran */}
        <div className="quotation-info">
          <div className="info-row">
            <span className="info-label">Pelanggan:</span>
            <span className="info-value">{data.customer}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tanggal:</span>
            <span className="info-value">{data.date}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className={`status-badge status-${data.status?.toLowerCase()}`}>
              {data.status}
            </span>
          </div>
        </div>

        {/* Tabel items */}
        <div className="items-section">
          <h3>Daftar Item</h3>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Memuat data item...</p>
            </div>
          ) : (
            <div className="items-table-container">
              {quotationItems.length > 0 ? (
                <table className="items-detail-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Item</th>
                      <th>Tipe</th>
                      <th>Qty</th>
                      <th>Satuan</th>
                      <th>Stock</th>
                      <th>Harga Satuan</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationItems.map((item, index) => (
                      <tr key={item.id} className={item.stock === 0 ? 'out-of-stock' : ''}>
                        <td className="item-number">{index + 1}</td>
                        <td className="item-name">
                          {item.name}
                          {item.stock === 0 && (
                            <span className="stock-warning">Habis</span>
                          )}
                        </td>
                        <td>
                          <span className={`type-badge ${item.type?.toLowerCase()}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="item-qty">{item.qty}</td>
                        <td className="item-unit">{item.unit}</td>
                        <td className={`item-stock ${item.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
                          {item.stock || 0}
                        </td>
                        <td className="item-price">Rp {item.price?.toLocaleString('id-ID')}</td>
                        <td className="item-total">Rp {(item.price * item.qty)?.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={7} className="total-label">
                        Total:
                      </td>
                      <td className="total-amount">
                        Rp {totalAmount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <div className="empty-state">
                  <p>Tidak ada item dalam penawaran ini</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="quotation-detail-actions">
          <button className="btn-secondary" onClick={handleExportPDF}>
            📄 Export PDF
          </button>
          <button className="btn-primary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>

      {exportPDFOpen && (
        <ExportPDFMenu
          quotation={{
            ...data,
            items: quotationItems,
            total: totalAmount
          }}
          onClose={() => setExportPDFOpen(false)}
        />
      )}
    </div>
  );
} 