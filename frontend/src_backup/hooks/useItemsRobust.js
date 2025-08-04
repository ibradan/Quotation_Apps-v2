import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, safeApiCall } from '../utils/apiUtils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const useItems = ({ onStockChange } = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeTabs, setActiveTabs] = useState(['Barang', 'Jasa']);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [error, setError] = useState(null);
  const importInputRef = useRef();

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch items dengan error handling robust
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const itemsData = await safeApiCall(
        () => apiClient.get('/items'),
        2,
        'fetch items'
      );
      
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add/Update item
  const saveItem = useCallback(async (data) => {
    if (!data || !data.name || !data.type) {
      throw new Error('Data item tidak lengkap');
    }

    try {
      // Check for duplicates
      const isDuplicate = items.some(item => {
        if (editItem && item.id === editItem.id) return false;
        
        return item.name && data.name &&
               item.name.toLowerCase().trim() === data.name.toLowerCase().trim() &&
               item.type === data.type &&
               item.unit && data.unit &&
               item.unit.toLowerCase().trim() === data.unit.toLowerCase().trim();
      });

      if (isDuplicate) {
        throw new Error('Item dengan nama, tipe, dan satuan yang sama sudah ada!');
      }

      let result;
      if (editItem) {
        result = await safeApiCall(
          () => apiClient.put(`/items/${editItem.id}`, data),
          1,
          'update item'
        );
      } else {
        result = await safeApiCall(
          () => apiClient.post('/items', data),
          1,
          'add item'
        );
      }

      await fetchItems(); // Refresh data
      
      // Notify parent about stock change
      if (onStockChange && typeof onStockChange === 'function') {
        onStockChange();
      }
      
      // Close form
      setFormOpen(false);
      setEditItem(null);
      
      return result;
    } catch (err) {
      setError(err.message || 'Gagal menyimpan item');
      throw err;
    }
  }, [items, editItem, fetchItems, onStockChange]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    if (!id) {
      throw new Error('ID item tidak valid');
    }

    try {
      await safeApiCall(
        () => apiClient.delete(`/items/${id}`),
        1,
        'delete item'
      );
      
      await fetchItems(); // Refresh data
      
      // Notify parent about stock change
      if (onStockChange && typeof onStockChange === 'function') {
        onStockChange();
      }
    } catch (err) {
      setError(err.message || 'Gagal menghapus item');
      throw err;
    }
  }, [fetchItems, onStockChange]);

  // Export to Excel
  const exportToExcel = useCallback(() => {
    try {
      if (!items || items.length === 0) {
        throw new Error('Tidak ada data untuk diekspor');
      }

      const exportData = items.map(item => ({
        'Nama': item.name || '',
        'Tipe': item.type || '',
        'Harga': item.price || 0,
        'Satuan': item.unit || '',
        'Stock': item.stock || 0,
        'Kategori': item.category || '',
        'Deskripsi': item.description || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Items');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(data, `items_export_${timestamp}.xlsx`);
    } catch (err) {
      setError(err.message || 'Gagal mengekspor data');
    }
  }, [items]);

  // Import from Excel
  const importFromExcel = useCallback((file) => {
    if (!file) {
      setError('File tidak valid');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
          throw new Error('File Excel kosong atau tidak valid');
        }

        // Validate required fields
        const requiredFields = ['Nama', 'Tipe', 'Harga', 'Satuan'];
        const hasRequiredFields = requiredFields.every(field => 
          jsonData[0].hasOwnProperty(field)
        );

        if (!hasRequiredFields) {
          throw new Error(`File Excel harus memiliki kolom: ${requiredFields.join(', ')}`);
        }

        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData) {
          try {
            if (!row.Nama || !row.Tipe) continue;

            const itemData = {
              name: String(row.Nama).trim(),
              type: String(row.Tipe).trim(),
              price: parseFloat(row.Harga) || 0,
              unit: String(row.Satuan || '').trim(),
              stock: parseInt(row.Stock) || 0,
              category: String(row.Kategori || '').trim(),
              description: String(row.Deskripsi || '').trim()
            };

            await safeApiCall(
              () => apiClient.post('/items', itemData),
              1,
              'import item'
            );
            
            successCount++;
          } catch (err) {
            console.warn(`Error importing row:`, row, err.message);
            errorCount++;
          }
        }

        await fetchItems(); // Refresh data
        
        if (onStockChange && typeof onStockChange === 'function') {
          onStockChange();
        }

        if (successCount > 0) {
          alert(`✅ Import berhasil!\n${successCount} item ditambahkan${errorCount > 0 ? `, ${errorCount} item gagal` : ''}`);
        } else {
          throw new Error('Tidak ada item yang berhasil diimport');
        }

      } catch (err) {
        setError(err.message || 'Gagal mengimport file Excel');
      }
    };

    reader.onerror = () => {
      setError('Gagal membaca file');
    };

    reader.readAsArrayBuffer(file);
  }, [fetchItems, onStockChange]);

  // Handle file import
  const handleFileImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromExcel(file);
      // Reset input
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  }, [importFromExcel]);

  // Form handlers
  const openAddForm = useCallback(() => {
    setEditItem(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((item) => {
    setEditItem(item);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditItem(null);
  }, []);

  // Filter items
  const filteredItems = items.filter(item => {
    if (!item) return false;

    // Filter by active tabs
    if (!activeTabs.includes(item.type)) return false;

    // Filter by search text
    if (filter) {
      const searchText = filter.toLowerCase();
      return (
        (item.name && item.name.toLowerCase().includes(searchText)) ||
        (item.category && item.category.toLowerCase().includes(searchText)) ||
        (item.description && item.description.toLowerCase().includes(searchText))
      );
    }

    return true;
  });

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    // Data
    items: filteredItems,
    allItems: items, // Unfiltered items
    
    // States
    loading,
    error,
    filter,
    activeTabs,
    formOpen,
    editItem,
    
    // Actions
    setFilter,
    setActiveTabs,
    fetchItems,
    saveItem,
    deleteItem,
    exportToExcel,
    handleFileImport,
    openAddForm,
    openEditForm,
    closeForm,
    
    // Refs
    importInputRef,
    
    // Clear error manually
    clearError: () => setError(null)
  };
};
