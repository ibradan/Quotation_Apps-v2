import { useState, useEffect } from 'react';
import { apiClient } from './utils/apiUtils';

export default function QuotationForm({ open, onClose, onSave, initialData }) {
  // Simple form state
  const [customer, setCustomer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('PENAWARAN BARANG/JASA');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(11);
  const [items, setItems] = useState([]);
  
  // UI state
  const [availableItems, setAvailableItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  // Initialize form
  useEffect(() => {
    if (open) {
      if (initialData) {
        setCustomer(initialData.customer || '');
        setDate(initialData.date || new Date().toISOString().split('T')[0]);
        setTitle(initialData.title || 'PENAWARAN BARANG/JASA');
        setQuotationNumber(initialData.quotation_number || '');
        setDiscount(initialData.discount || 0);
        setTax(initialData.tax || 11);
        setItems(initialData.items || []);
      } else {
        setCustomer('');
        setDate(new Date().toISOString().split('T')[0]);
        setTitle('PENAWARAN BARANG/JASA');
        setQuotationNumber('');
        setDiscount(0);
        setTax(11);
        setItems([]);
        generateQuotationNumber();
      }
      
      fetchData();
    }
  }, [open, initialData]);

  const fetchData = async () => {
    try {
      const [items, customers] = await Promise.all([
        apiClient.get('/items'),
        apiClient.get('/customers')
      ]);
      setAvailableItems(items);
      setCustomers(customers);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const generateQuotationNumber = async () => {
    try {
      const quotations = await apiClient.get('/quotations');
      const count = quotations.length + 1;
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setQuotationNumber(`QTN-${year}${month}-${String(count).padStart(3, '0')}`);
    } catch (err) {
      setQuotationNumber(`QTN-${Date.now()}`);
    }
  };

  const handleCustomerSelect = (selectedCustomer) => {
    setCustomer(selectedCustomer.name);
    setShowCustomerDropdown(false);
  };

  const handleAddItem = () => {
    if (!selectedItem || itemQty < 1) return;
    
    const item = availableItems.find(i => i.name === selectedItem);
    if (!item) return;
    
    const existingIndex = items.findIndex(i => i.name === item.name);
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].qty += itemQty;
      setItems(updatedItems);
    } else {
      setItems([...items, { ...item, qty: itemQty }]);
    }
    
    setSelectedItem('');
    setItemQty(1);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItemQty = (index, newQty) => {
    if (newQty < 1) return;
    const updatedItems = [...items];
    updatedItems[index].qty = newQty;
    setItems(updatedItems);
  };

  const handleSave = async () => {
    // Validasi
    if (!customer) {
      alert('Harap pilih customer');
      return;
    }
    
    if (!date) {
      alert('Harap isi tanggal');
      return;
    }
    
    if (items.length === 0) {
      alert('Harap tambahkan minimal satu item');
      return;
    }
    
    const submitData = {
      customer: customer.trim(),
      date: date,
      status: 'Draft',
      title: title,
      quotation_number: quotationNumber,
      discount: discount,
      tax: tax,
      items: items
    };
    
    try {
      await onSave(submitData);
    } catch (error) {
      console.error('Error calling onSave:', error);
      alert('Gagal menyimpan quotation: ' + error.message);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customer.toLowerCase())
  );

  const filteredItems = availableItems.filter(item => 
    item.name.toLowerCase().includes(selectedItem.toLowerCase())
  );

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (tax / 100);
  const total = afterDiscount + taxAmount;

  return (
    <div className="modal-overlay">
      <div className="modal-content quotation-form-modal">
        <div className="modal-header">
          <div className="modal-title">
            <h2>{initialData ? 'Edit' : 'Tambah'} Penawaran</h2>
            <p className="modal-subtitle">Isi detail penawaran dengan lengkap</p>
          </div>
          <div className="modal-controls">
            <button type="button" className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        
        <div className="quotation-form-content">
          <div className="form-section">
            <h3>Informasi Penawaran</h3>
            
            <div className="form-group">
              <label>Judul Penawaran</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="PENAWARAN BARANG/JASA"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nomor Penawaran</label>
                <input
                  type="text"
                  value={quotationNumber}
                  readOnly
                  className="readonly-input"
                />
              </div>
              <div className="form-group">
                <label>Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Pelanggan</label>
              <div className="input-with-suggestions">
                <input
                  type="text"
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                  placeholder="Ketik nama customer..."
                  required
                />
                
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="suggestions-dropdown">
                    {filteredCustomers.map(c => (
                      <div key={c.id} className="suggestion-item" onClick={() => handleCustomerSelect(c)}>
                        <div className="suggestion-name">{c.name}</div>
                        <div className="suggestion-details">
                          {c.email || ''} • {c.phone || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Diskon (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>PPN (%)</label>
                <input
                  type="number"
                  value={tax}
                  onChange={e => setTax(Number(e.target.value) || 11)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Item Penawaran</h3>
            
            <div className="add-item-container">
              <div className="form-row three-columns">
                <div className="form-group">
                  <div className="input-with-suggestions">
                    <input
                      type="text"
                      value={selectedItem}
                      onChange={e => setSelectedItem(e.target.value)}
                      onFocus={() => setShowItemDropdown(true)}
                      onBlur={() => setTimeout(() => setShowItemDropdown(false), 200)}
                      placeholder="Ketik nama item..."
                    />
                    
                    {showItemDropdown && filteredItems.length > 0 && (
                      <div className="suggestions-dropdown">
                        {filteredItems.map(item => (
                          <div key={item.id} className="suggestion-item" onClick={() => setSelectedItem(item.name)}>
                            <div className="suggestion-name">{item.name}</div>
                            <div className="suggestion-details">
                              {item.type} • Rp {item.price?.toLocaleString() || 0} / {item.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Qty</label>
                  <input
                    type="number"
                    value={itemQty}
                    onChange={e => setItemQty(Number(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="btn-add-item"
                    onClick={handleAddItem}
                    disabled={!selectedItem || itemQty < 1}
                  >
                    Tambah Item
                  </button>
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Tipe</th>
                      <th>Qty</th>
                      <th>Harga</th>
                      <th>Total</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>
                          <span className={`type-badge ${item.type.toLowerCase()}`}>
                            {item.type}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="qty-input"
                            value={item.qty}
                            onChange={e => handleUpdateItemQty(index, Number(e.target.value) || 1)}
                            min="1"
                          />
                        </td>
                        <td className="price-cell">
                          Rp {item.price?.toLocaleString() || 0}
                        </td>
                        <td className="total-cell">
                          Rp {(item.price * item.qty)?.toLocaleString() || 0}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-remove-item"
                            onClick={() => handleRemoveItem(index)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="form-section">
              <h3>Total Penawaran</h3>
              
              <div className="total-breakdown">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span className="subtotal">
                    Rp {subtotal.toLocaleString()}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="total-line">
                    <span>Diskon ({discount}%):</span>
                    <span className="discount">
                      - Rp {discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {tax > 0 && (
                  <div className="total-line">
                    <span>PPN ({tax}%):</span>
                    <span className="tax">
                      Rp {taxAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="total-line final-total">
                  <span>Total:</span>
                  <span>Rp {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            {initialData ? 'Update' : 'Simpan'} Penawaran
          </button>
        </div>
      </div>
    </div>
  );
}
