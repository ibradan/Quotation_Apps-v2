import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../utils/apiUtils';

const QuotationForm = ({ open, initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    title: 'PENAWARAN BARANG/JASA',
    quotation_number: '',
    discount: 0,
    tax: 11,
    status: 'Draft'
  });

  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Search and filter states
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [selectedItemQty, setSelectedItemQty] = useState(1);

  // Fetch customers and items
  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchItems();
      if (initialData) {
        setFormData({
          customer: initialData.customer || '',
          date: initialData.date || new Date().toISOString().split('T')[0],
          title: initialData.title || 'PENAWARAN BARANG/JASA',
          quotation_number: initialData.quotation_number || '',
          discount: initialData.discount || 0,
          tax: initialData.tax || 11,
          status: initialData.status || 'Draft'
        });
        setCustomerSearch(initialData.customer || '');
        if (initialData.id) {
          fetchQuotationItems(initialData.id);
        }
      } else {
        // Set today's date for new quotation
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, date: today }));
        generateQuotationNumber();
      }
    }
  }, [open, initialData]);

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch && customers.length > 0) {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone?.includes(customerSearch)
      );
      setFilteredCustomers(filtered);
      // Only show suggestions if user is actively typing (not just loaded from edit)
      setShowCustomerSuggestions(filtered.length > 0 && customerSearch !== initialData?.customer);
    } else {
      setFilteredCustomers([]);
      setShowCustomerSuggestions(false);
    }
  }, [customerSearch, customers, initialData]);

  // Filter items based on search and type
  useEffect(() => {
    if (items.length > 0) {
      let filtered = items;
      
      // Apply type filter
      if (itemTypeFilter !== 'all') {
        filtered = filtered.filter(item => (item.type || '').toLowerCase() === itemTypeFilter);
      }
      
      // Apply search filter
      if (itemSearch) {
        const term = itemSearch.toLowerCase();
        filtered = filtered.filter(item => 
          (item.name || '').toLowerCase().includes(term) ||
          (item.type || '').toLowerCase().includes(term)
        );
      }
      
      setFilteredItems(filtered.slice(0, 25));
      setShowItemSuggestions(itemSearch.length > 0 && filtered.length > 0);
    }
  }, [itemSearch, itemTypeFilter, items]);

  const fetchCustomers = async () => {
    try {
      const data = await apiClient.get('/customers');
      setCustomers(data);
    } catch (err) {
      console.error('Gagal fetch customers:', err);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await apiClient.get('/items');
      setItems(data);
    } catch (err) {
      console.error('Gagal fetch items:', err);
    }
  };

  const fetchQuotationItems = async (quotationId) => {
    try {
      const data = await apiClient.get(`/items?quotation_id=${quotationId}`);
      // Ensure total is calculated correctly for each item
      const itemsWithTotal = data.map(item => ({
        ...item,
        total: (item.price || 0) * (item.qty || 0)
      }));
      setSelectedItems(itemsWithTotal);
    } catch (err) {
      console.error('Gagal fetch quotation items:', err);
    }
  };

  const generateQuotationNumber = async () => {
    try {
      const quotations = await apiClient.get('/quotations');
      const count = quotations.length + 1;
      const number = `QT-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, quotation_number: number }));
    } catch (err) {
      console.error('Gagal generate quotation number:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({ ...prev, customer: customer.name }));
    setCustomerSearch(customer.name);
    setShowCustomerSuggestions(false);
  };

  const handleItemSelect = (item) => {
    // When picking from suggestions, add immediately with current qty
    setItemSearch('');
    setShowItemSuggestions(false);
    const existingIndex = selectedItems.findIndex(i => (i.id ?? i.name) === (item.id ?? item.name));
    if (existingIndex >= 0) {
      const updatedItems = [...selectedItems];
      const newQty = (updatedItems[existingIndex].qty || 0) + selectedItemQty;
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        qty: newQty,
        total: newQty * (item.price || 0)
      };
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems(prev => [...prev, {
        ...item,
        qty: selectedItemQty,
        total: (item.price || 0) * selectedItemQty
      }]);
    }
    setSelectedItemQty(1);
  };

  const addSelectedItem = () => {
    if (!itemSearch.trim() || selectedItemQty < 1) return;
    
    const term = itemSearch.toLowerCase();
    // Try exact by name
    let item = items.find(i => (i.name || '').toLowerCase() === term);
    // Fallback to first filtered suggestion
    if (!item && filteredItems.length > 0) item = filteredItems[0];
    // Fallback to contains
    if (!item) item = items.find(i => (i.name || '').toLowerCase().includes(term));
    if (!item) {
      alert('Item tidak ditemukan. Pilih dari daftar saran.');
      return;
    }
    
    const key = item.id ?? item.name;
    const existingIndex = selectedItems.findIndex(i => (i.id ?? i.name) === key);
    if (existingIndex >= 0) {
      const updatedItems = [...selectedItems];
      const newQty = (updatedItems[existingIndex].qty || 0) + selectedItemQty;
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        qty: newQty,
        total: newQty * (item.price || 0)
      };
      setSelectedItems(updatedItems);
    } else {
      const newItem = {
        ...item,
        qty: selectedItemQty,
        total: (item.price || 0) * selectedItemQty
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
    
    setItemSearch('');
    setSelectedItemQty(1);
  };

  const removeItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemQty = (index, newQty) => {
    if (newQty < 1) return;
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, qty: newQty, total: item.price * newQty } : item
    ));
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * formData.discount) / 100;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    return ((subtotal - discountAmount) * formData.tax) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const taxAmount = calculateTax();
    return subtotal - discountAmount + taxAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer.trim()) {
      alert('Nama customer harus diisi!');
      return;
    }
    
    if (selectedItems.length === 0) {
      alert('Minimal harus ada 1 item dalam penawaran!');
      return;
    }
    
    setLoading(true);

    try {
      const quotationData = {
        ...formData,
        items: selectedItems
      };

      await onSave(quotationData);
      onClose();
    } catch (err) {
      console.error('Gagal simpan penawaran:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    return '';
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content quotation-form-modal ${isMinimized ? 'minimized' : ''}`}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>{initialData ? 'Edit' : 'Tambah'} Penawaran</h2>
            <p className="modal-subtitle">Buat penawaran baru untuk customer</p>
          </div>
          <div className="modal-controls">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="btn-minimize"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? '🔽' : '🔼'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-close"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <form onSubmit={handleSubmit} className="quotation-form-content">
            {/* Basic Information Section */}
            <div className="form-section">
              <h3>Informasi Dasar</h3>
              <p>Data utama penawaran</p>
              
                              <div className="form-group">
                  <label>
                    <span className="label-icon"></span>
                    Judul Penawaran
                  </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: PENAWARAN BARANG/JASA"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon"></span>
                    Nomor Penawaran
                  </label>
                  <input
                    name="quotation_number"
                    type="text"
                    value={formData.quotation_number}
                    readOnly
                    placeholder="Auto-generate"
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">📅</span>
                    Tanggal Penawaran
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    title="Klik untuk memilih tanggal"
                  />
                </div>
              </div>

                              <div className="form-group">
                  <label>
                    <span className="label-icon"></span>
                    Customer
                  </label>
                <div className="input-with-suggestions">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={e => {
                      setCustomerSearch(e.target.value);
                      setFormData(prev => ({ ...prev, customer: e.target.value }));
                    }}
                    onFocus={() => {
                      // Only show suggestions if user is actively typing, not when editing existing data
                      if (customerSearch !== initialData?.customer) {
                        setShowCustomerSuggestions(filteredCustomers.length > 0);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
                    placeholder="Ketik nama customer..."
                    required
                  />
                  
                  {showCustomerSuggestions && (
                    <div className="suggestions-dropdown">
                      {filteredCustomers.map(c => (
                        <div key={c.id} className="suggestion-item" onClick={() => handleCustomerSelect(c)}>
                          <div className="suggestion-name">{c.name}</div>
                          <div className="suggestion-details">
                                                            {c.email && <span>{c.email}</span>}
                                {c.phone && <span>{c.phone}</span>}
                                {c.company && <span>{c.company}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="form-section">
              <h3>Tambah Item</h3>
              <p>Pilih barang atau jasa untuk penawaran</p>
              
              <div className="add-item-container">
                <div className="form-row three-columns">
                  <div className="form-group">
                    <label>Item</label>
                    <div className="input-with-suggestions">
                      <input
                        type="text"
                        value={itemSearch}
                        onChange={e => setItemSearch(e.target.value)}
                        onFocus={() => setShowItemSuggestions(itemSearch.length > 0)}
                        onBlur={() => setTimeout(() => setShowItemSuggestions(false), 200)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSelectedItem(); } }}
                        placeholder="Ketik nama item..."
                      />
                      
                      {/* Filter Buttons */}
                      <div className="filter-buttons">
                        <button
                          type="button"
                          className={`filter-btn ${itemTypeFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setItemTypeFilter('all')}
                        >
                          Semua
                        </button>
                        <button
                          type="button"
                          className={`filter-btn ${itemTypeFilter === 'barang' ? 'active' : ''}`}
                          onClick={() => setItemTypeFilter('barang')}
                        >
                          Barang
                        </button>
                        <button
                          type="button"
                          className={`filter-btn ${itemTypeFilter === 'jasa' ? 'active' : ''}`}
                          onClick={() => setItemTypeFilter('jasa')}
                        >
                          Jasa
                        </button>
                      </div>
                      
                      {/* Item Suggestions */}
                      {showItemSuggestions && (
                        <div className="suggestions-dropdown">
                          {filteredItems.map(item => (
                            <div key={item.id} className="suggestion-item" onClick={() => handleItemSelect(item)}>
                              <div className="suggestion-name">
                                {item.name}
                              </div>
                              <div className="suggestion-details">
                                <span className={`type-badge ${item.type}`}>
                                  {item.type}
                                </span>
                                <span>Stock: {item.stock || 0}</span>
                                <span>•</span>
                                <span>{item.unit}</span>
                                <span>•</span>
                                <span className="price">Rp {item.price?.toLocaleString('id-ID') || '0'}</span>
                                {item.description && (
                                  <span className="desc"> — {item.description.slice(0, 40)}{item.description.length > 40 ? '…' : ''}</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {filteredItems.length === 0 && (
                            <div className="no-suggestions">
                              Tidak ada item yang cocok
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Qty</label>
                    <input
                      type="number"
                      value={selectedItemQty}
                      onChange={e => setSelectedItemQty(Number(e.target.value) || 1)}
                      min="1"
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button 
                      type="button" 
                      onClick={addSelectedItem} 
                      className="btn-add-item"
                      disabled={!itemSearch.trim()}
                    >
                      <span className="btn-icon"></span>
                      <span className="btn-text">Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>



            {/* Items Table with Pricing Controls */}
            {selectedItems.length > 0 && (
              <div className="form-section">
                <h3>Item yang Dipilih</h3>
                <div className="items-table-container">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Harga</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="item-name">{item.name}</div>
                            <div className="item-type">{item.type}</div>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateItemQty(index, parseInt(e.target.value) || 1)}
                              className="qty-input"
                            />
                          </td>
                          <td className="price-cell">
                            Rp {item.price?.toLocaleString('id-ID') || '0'}
                          </td>
                          <td className="total-cell">
                            Rp {item.total?.toLocaleString('id-ID') || '0'}
                          </td>
                          <td>
                            <button 
                              type="button"
                              onClick={() => removeItem(index)} 
                              className="btn-remove-item"
                              title="Hapus item"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pricing Controls - Compact di bawah tabel */}
                <div className="pricing-controls">
                  <div className="pricing-inputs">
                    <div className="pricing-input-group">
                      <label>Diskon (%)</label>
                      <input
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.discount === 0 ? '' : formData.discount}
                        onChange={handleChange}
                        placeholder="0"
                        className="pricing-input"
                      />
                    </div>
                    <div className="pricing-input-group">
                      <label>PPN (%)</label>
                      <input
                        name="tax"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.tax}
                        onChange={handleChange}
                        placeholder="11"
                        className="pricing-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Total Breakdown - Compact */}
            {selectedItems.length > 0 && (
              <div className="form-section">
                <div className="total-breakdown-compact">
                  <div className="total-line">
                    <span>Sub Total:</span>
                    <span className="subtotal">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                  </div>
                  <div className="total-line">
                    <span>Diskon ({formData.discount}%):</span>
                    <span className="discount">-Rp {calculateDiscount().toLocaleString('id-ID')}</span>
                  </div>
                  <div className="total-line">
                    <span>PPN ({formData.tax}%):</span>
                    <span className="tax">+Rp {calculateTax().toLocaleString('id-ID')}</span>
                  </div>
                  <div className="total-line final-total">
                    <span>Total:</span>
                    <span className="final-total-amount">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                <span className="btn-icon"></span>
                <span className="btn-text">Batal</span>
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                <span className="btn-icon"></span>
                <span className="btn-text">
                  {loading ? 'Menyimpan...' : (initialData ? 'Update' : 'Simpan')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuotationForm;