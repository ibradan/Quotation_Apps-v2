import React, { useState, useEffect } from 'react';

const ItemForm = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Barang',
    qty: 1,
    unit: '',
    price: 0,
    stock: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        type: item.type || 'Barang',
        qty: item.qty || 1,
        unit: item.unit || '',
        price: item.price || 0,
        stock: item.stock || 0
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="item-form">
          <div className="modal-header">
            <div className="modal-title">
              <h2>{item ? 'Edit' : 'Tambah'} Barang/Jasa</h2>
              <p className="modal-subtitle">Tambah data barang atau jasa baru</p>
            </div>
          </div>
          
          <div className="form-content">
            <div className="form-group">
              <label>Nama Barang/Jasa</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama barang atau jasa"
                required
              />
              <small className="form-hint">
                ⚠️ Nama, tipe, dan satuan harus unik untuk mencegah duplikasi
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipe</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Barang">Barang</option>
                  <option value="Jasa">Jasa</option>
                </select>
              </div>

              <div className="form-group">
                <label>Satuan</label>
                <input
                  name="unit"
                  type="text"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="Contoh: pcs, kg, jam"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Qty Default</label>
                <input
                  name="qty"
                  type="number"
                  min="1"
                  value={formData.qty}
                  onChange={handleChange}
                  placeholder="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Harga (Rp)</label>
              <input
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              {item ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm; 