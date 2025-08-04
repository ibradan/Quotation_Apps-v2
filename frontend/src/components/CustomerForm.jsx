import React, { useState, useEffect } from 'react';

const CustomerForm = ({ customer, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      });
    }
  }, [customer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="modal-header">
            <div className="modal-title">
              <h2>{customer ? 'Edit' : 'Tambah'} Customer</h2>
              <p className="modal-subtitle">Tambah data customer baru</p>
            </div>
          </div>
          
          <div className="form-content">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap customer"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Telepon</label>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Alamat Lengkap</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Masukkan alamat lengkap customer"
                required
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              {customer ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm; 