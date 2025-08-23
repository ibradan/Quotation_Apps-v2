import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiUtils';

export const useQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [quotationItems, setQuotationItems] = useState({});
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch quotations
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      console.log('Fetching quotations...');
      const data = await apiClient.get('/quotations');
      console.log('Quotations received:', data?.length || 0, 'quotations');
      setQuotations(Array.isArray(data) ? data : []);
      
      // Fetch semua items untuk cek stock
      const allItems = await apiClient.get('/items');
      
      // Fetch items untuk setiap penawaran dan cek stock dari master data
      const itemsMap = {};
      for (const quotation of data) {
        try {
          const quotationItems = await apiClient.get(`/quotation-items/${quotation.id}`);
          
          // Map quotation items dengan stock data dari master
          const itemsWithStock = quotationItems.map(item => {
            const masterItem = allItems.find(master => 
              master.name.toLowerCase() === item.name.toLowerCase() && 
              master.type === item.type
            );
            return {
              ...item,
              stock: masterItem ? masterItem.stock : 0
            };
          });
          
          itemsMap[quotation.id] = itemsWithStock;
        } catch (err) {
          console.error(`Gagal fetch items untuk quotation ${quotation.id}:`, err);
          itemsMap[quotation.id] = [];
        }
      }
      setQuotationItems(itemsMap);
    } catch (err) {
      console.error('Gagal fetch quotations:', err);
      alert('Gagal memuat data penawaran: ' + (err?.message || 'Unknown error'));
      setQuotations([]);
    }
    setLoading(false);
  };

    // Add quotation
  const addQuotation = async (data) => {
    try {
      await apiClient.post('/quotations', data);
      await fetchQuotations();
    } catch (err) {
      console.error('Gagal tambah penawaran:', err);
      alert('Gagal tambah penawaran: ' + (err?.message || 'Unknown error'));
      throw err;
    }
  };

  // Update quotation
  const updateQuotation = async (id, data) => {
    try {
      const result = await apiClient.put(`/quotations/${id}`, data);
      await fetchQuotations();
      return result;
    } catch (err) {
      console.error('Gagal update penawaran:', err);
      alert('Gagal update penawaran: ' + (err?.message || 'Unknown error'));
      throw err;
    }
  };

  // Delete quotation
  const deleteQuotation = async (id) => {
    if (!confirm('Yakin ingin menghapus penawaran ini?')) return;
    
    try {
      await apiClient.delete(`/quotations/${id}`);
      await fetchQuotations();
    } catch (err) {
      console.error('Gagal hapus penawaran:', err);
      alert('Gagal hapus penawaran: ' + (err?.message || 'Unknown error'));
    }
  };

  // Fetch quotation history
  const fetchQuotationHistory = async (quotationId) => {
    setHistoryLoading(true);
    try {
      const data = await apiClient.get(`/quotation-history?quotation_id=${quotationId}`);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal fetch history:', err);
      setHistory([]);
    }
    setHistoryLoading(false);
  };

  // Fetch all quotation history
  const fetchAllQuotationHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await apiClient.get(`/quotation-history`);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal fetch all history:', err);
      setHistory([]);
    }
    setHistoryLoading(false);
  };

  // Restore history
  const restoreHistory = async (historyId) => {
    if (!confirm('Yakin ingin restore ke versi ini?')) return;
    
    try {
      await apiClient.post(`/quotation-history/${historyId}/restore`);
      await fetchQuotations();
      alert('Berhasil restore penawaran');
    } catch (err) {
      console.error('Gagal restore history:', err);
      alert('Gagal restore: ' + (err?.message || 'Unknown error'));
    }
  };

  // Helper function untuk cek apakah ada item dengan stock habis
  const hasOutOfStockItems = (quotationId) => {
    const items = quotationItems[quotationId] || [];
    return items.some(item => {
      const stock = item.stock || 0;
      return stock === 0;
    });
  };

  // Format history data
  const formatHistoryData = (dataStr) => {
    try {
      const data = JSON.parse(dataStr);
      return `Customer: ${data.customer_name || 'N/A'}, Status: ${data.status || 'N/A'}`;
    } catch (err) {
      return dataStr;
    }
  };

  // Filter quotations
  const filteredQuotations = quotations.filter(q => 
    q.customer_name?.toLowerCase().includes(filter.toLowerCase()) ||
    q.date?.includes(filter) ||
    q.status?.toLowerCase().includes(filter.toLowerCase())
  );

  // Load quotations on mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  return {
    quotations: filteredQuotations,
    loading,
    filter,
    setFilter,
    quotationItems,
    history,
    historyLoading,
    fetchQuotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    fetchQuotationHistory,
    fetchAllQuotationHistory,
    restoreHistory,
    hasOutOfStockItems,
    formatHistoryData
  };
}; 