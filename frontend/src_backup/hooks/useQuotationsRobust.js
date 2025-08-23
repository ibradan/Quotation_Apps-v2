import { useState, useEffect, useCallback } from 'react';
import { apiClient, safeApiCall } from '../utils/apiUtils';

export const useQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [quotationItems, setQuotationItems] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch quotations dengan error handling robust
  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch quotations
      const quotationsData = await safeApiCall(
        () => apiClient.get('/quotations'),
        2,
        'fetch quotations'
      );
      
      setQuotations(Array.isArray(quotationsData) ? quotationsData : []);
      
      // Fetch all items untuk stock checking
      const allItemsData = await safeApiCall(
        () => apiClient.get('/items'),
        2,
        'fetch all items'
      );
      
      const allItems = Array.isArray(allItemsData) ? allItemsData : [];
      
      // Fetch items untuk setiap quotation
      const itemsMap = {};
      const quotationList = Array.isArray(quotationsData) ? quotationsData : [];
      
      for (const quotation of quotationList) {
        if (quotation && quotation.id) {
          try {
            const quotationItemsData = await safeApiCall(
              () => apiClient.get(`/items?quotation_id=${quotation.id}`),
              1,
              `fetch items for quotation ${quotation.id}`
            );
            
            const quotationItems = Array.isArray(quotationItemsData) ? quotationItemsData : [];
            
            // Map dengan stock data
            const itemsWithStock = quotationItems.map(item => {
              const masterItem = allItems.find(master => 
                master && item && 
                master.name && item.name &&
                master.name.toLowerCase() === item.name.toLowerCase() && 
                master.type === item.type
              );
              
              return {
                ...item,
                stock: masterItem ? (masterItem.stock || 0) : 0
              };
            });
            
            itemsMap[quotation.id] = itemsWithStock;
          } catch (err) {
            console.warn(`Could not fetch items for quotation ${quotation.id}:`, err.message);
            itemsMap[quotation.id] = [];
          }
        }
      }
      
      setQuotationItems(itemsMap);
      
    } catch (err) {
      setError(err.message || 'Gagal memuat data quotations');
      setQuotations([]);
      setQuotationItems({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh stock data
  const refreshStockData = useCallback(async () => {
    if (quotations.length === 0) return;
    
    try {
      const allItemsData = await safeApiCall(
        () => apiClient.get('/items'),
        1,
        'refresh stock data'
      );
      
      const allItems = Array.isArray(allItemsData) ? allItemsData : [];
      const updatedItemsMap = { ...quotationItems };
      
      for (const quotation of quotations) {
        if (quotation && quotation.id && quotationItems[quotation.id]) {
          const updatedItems = quotationItems[quotation.id].map(item => {
            const masterItem = allItems.find(master => 
              master && item &&
              master.name && item.name &&
              master.name.toLowerCase() === item.name.toLowerCase() && 
              master.type === item.type
            );
            
            return {
              ...item,
              stock: masterItem ? (masterItem.stock || 0) : 0
            };
          });
          
          updatedItemsMap[quotation.id] = updatedItems;
        }
      }
      
      setQuotationItems(updatedItemsMap);
    } catch (err) {
      console.warn('Could not refresh stock data:', err.message);
    }
  }, [quotations, quotationItems]);

  // Add quotation
  const addQuotation = useCallback(async (data) => {
    try {
      const result = await safeApiCall(
        () => apiClient.post('/quotations', data),
        1,
        'add quotation'
      );
      
      await fetchQuotations(); // Refresh data
      return result;
    } catch (err) {
      setError(err.message || 'Gagal menambah quotation');
      throw err;
    }
  }, [fetchQuotations]);

  // Update quotation
  const updateQuotation = useCallback(async (id, data) => {
    try {
      const result = await safeApiCall(
        () => apiClient.put(`/quotations/${id}`, data),
        1,
        'update quotation'
      );
      
      await fetchQuotations(); // Refresh data
      return result;
    } catch (err) {
      setError(err.message || 'Gagal mengupdate quotation');
      throw err;
    }
  }, [fetchQuotations]);

  // Delete quotation
  const deleteQuotation = useCallback(async (id) => {
    try {
      await safeApiCall(
        () => apiClient.delete(`/quotations/${id}`),
        1,
        'delete quotation'
      );
      
      await fetchQuotations(); // Refresh data
    } catch (err) {
      setError(err.message || 'Gagal menghapus quotation');
      throw err;
    }
  }, [fetchQuotations]);

  // Fetch quotation history
  const fetchQuotationHistory = useCallback(async (quotationId) => {
    setHistoryLoading(true);
    setError(null);
    
    try {
      const historyData = await safeApiCall(
        () => apiClient.get(`/quotation-history?quotation_id=${quotationId}`),
        1,
        'fetch quotation history'
      );
      
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      setError(err.message || 'Gagal memuat history');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Fetch all quotation history
  const fetchAllQuotationHistory = useCallback(async () => {
    setHistoryLoading(true);
    setError(null);
    
    try {
      const historyData = await safeApiCall(
        () => apiClient.get('/quotation-history'),
        1,
        'fetch all quotation history'
      );
      
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      setError(err.message || 'Gagal memuat history');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Helper untuk format display data
  const formatQuotationDisplay = useCallback((data) => {
    if (!data) return 'N/A';
    
    try {
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        return `Customer: ${parsed.customer_name || 'N/A'}, Status: ${parsed.status || 'N/A'}`;
      }
      return `Customer: ${data.customer_name || 'N/A'}, Status: ${data.status || 'N/A'}`;
    } catch (err) {
      return typeof data === 'string' ? data : 'N/A';
    }
  }, []);

  // Filter quotations
  const filteredQuotations = quotations.filter(q => {
    if (!q) return false;
    
    const searchText = filter.toLowerCase();
    return (
      (q.customer_name && q.customer_name.toLowerCase().includes(searchText)) ||
      (q.date && q.date.includes(filter)) ||
      (q.status && q.status.toLowerCase().includes(searchText)) ||
      (q.quotation_number && q.quotation_number.toLowerCase().includes(searchText))
    );
  });

  // Load quotations on mount
  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  return {
    // Data
    quotations: filteredQuotations,
    quotationItems,
    history,
    
    // States
    loading,
    historyLoading,
    error,
    filter,
    
    // Actions
    setFilter,
    fetchQuotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    fetchQuotationHistory,
    fetchAllQuotationHistory,
    refreshStockData,
    formatQuotationDisplay,
    
    // Clear error manually
    clearError: () => setError(null)
  };
};
