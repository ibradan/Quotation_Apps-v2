import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../utils/apiUtils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeTabs, setActiveTabs] = useState(['Barang', 'Jasa']);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const importInputRef = useRef();

  // Fetch items
  const fetchItems = async () => {
    setLoading(true);
    try {
      console.log('Fetching items...');
      const data = await apiClient.get('/items');
      console.log('Items received:', data?.length || 0, 'items');
      // Filter items yang bukan quotation items (tanpa quotation_id atau quotation_id = null)
      const masterItems = Array.isArray(data) ? data.filter(item => !item.quotation_id) : [];
      setItems(masterItems);
    } catch (err) {
      console.error('Gagal fetch items:', err);
      alert('Gagal memuat data barang/jasa: ' + (err?.response?.data?.error || err.message));
      setItems([]);
    }
    setLoading(false);
  };

  // Add/Update item
  const saveItem = async (data) => {
    try {
      // Check for duplicate items (same name, type, and unit)
      const isDuplicate = items.some(item => {
        // Skip current item if editing
        if (editItem && item.id === editItem.id) return false;
        
        // Check if name, type, and unit are exactly the same
        return item.name.toLowerCase().trim() === data.name.toLowerCase().trim() &&
               item.type === data.type &&
               item.unit.toLowerCase().trim() === data.unit.toLowerCase().trim();
      });

      if (isDuplicate) {
        alert('❌ Item dengan nama, tipe, dan satuan yang sama sudah ada!\n\nSilakan gunakan nama yang berbeda atau edit item yang sudah ada.');
        return;
      }

      if (editItem) {
        await apiClient.put(`/items/${editItem.id}`, data);
      } else {
        await apiClient.post('/items', data);
      }
      await fetchItems();
      setFormOpen(false);
      setEditItem(null);
    } catch (err) {
      console.error('Gagal simpan item:', err);
      alert('Gagal simpan item: ' + (err?.response?.data?.error || err.message));
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return;
    
    try {
      await apiClient.delete(`/items/${id}`);
      await fetchItems();
    } catch (err) {
      console.error('Gagal hapus item:', err);
      alert('Gagal hapus item: ' + (err?.response?.data?.error || err.message));
    }
  };

  // Export Excel
  const exportExcel = () => {
    const filteredData = items.filter(item => activeTabs.includes(item.type));
    
    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      ID: item.id,
      Nama: item.name,
      Tipe: item.type,
      Qty: item.qty,
      Satuan: item.unit,
      Stock: item.stock,
      Harga: item.price
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Barang & Jasa');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'barang_jasa.xlsx');
  };

  // Import Excel
  const importExcel = () => {
    importInputRef.current?.click();
  };

  const handleImportExcelFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const itemsToImport = jsonData.map(row => ({
        name: row.Nama || row.name,
        type: row.Tipe || row.type || 'Barang',
        qty: Number(row.Qty || row.qty || 1),
        unit: row.Satuan || row.unit || '',
        stock: Number(row.Stock || row.stock || 0),
        price: Number(row.Harga || row.price || 0)
      }));

      // Filter out duplicates before importing
      const existingItems = items;
      const uniqueItemsToImport = itemsToImport.filter(newItem => {
        return !existingItems.some(existingItem => 
          existingItem.name.toLowerCase().trim() === newItem.name.toLowerCase().trim() &&
          existingItem.type === newItem.type &&
          existingItem.unit.toLowerCase().trim() === newItem.unit.toLowerCase().trim()
        );
      });

      const duplicateCount = itemsToImport.length - uniqueItemsToImport.length;
      
      if (duplicateCount > 0) {
        const proceed = confirm(
          `⚠️ Ditemukan ${duplicateCount} item yang duplikat dan akan dilewati.\n\n` +
          `Item yang akan diimport: ${uniqueItemsToImport.length}\n` +
          `Item yang dilewati: ${duplicateCount}\n\n` +
          `Lanjutkan import?`
        );
        
        if (!proceed) {
          e.target.value = '';
          return;
        }
      }

      // Import unique items
      let successCount = 0;
      for (const item of uniqueItemsToImport) {
        try {
          await apiClient.post('/items', item);
          successCount++;
        } catch (err) {
          console.error('Gagal import item:', item, err);
        }
      }

      await fetchItems();
      
      if (duplicateCount > 0) {
        alert(`✅ Import selesai!\n\nBerhasil import: ${successCount} item\nDilewati (duplikat): ${duplicateCount} item`);
      } else {
        alert(`✅ Berhasil import ${successCount} item`);
      }
    } catch (err) {
      console.error('Gagal import Excel:', err);
      alert('Gagal import file Excel: ' + err.message);
    }

    e.target.value = '';
  };

  // Filter items berdasarkan active tabs dan search
  const filteredItems = items.filter(item => 
    activeTabs.includes(item.type) &&
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items: filteredItems,
    loading,
    filter,
    setFilter,
    activeTabs,
    setActiveTabs,
    formOpen,
    setFormOpen,
    editItem,
    setEditItem,
    importInputRef,
    fetchItems,
    saveItem,
    deleteItem,
    exportExcel,
    importExcel,
    handleImportExcelFile
  };
}; 