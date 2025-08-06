import React from 'react';
import CustomerForm from './CustomerForm';

const CustomerManagement = ({ customers }) => {
  const {
    customers: filteredCustomers,
    loading,
    filter,
    setFilter,
    formOpen,
    setFormOpen,
    editCustomer,
    setEditCustomer,
    fetchCustomers,
    saveCustomer,
    deleteCustomer
  } = customers;

  return (
    <div className="customer-management">
      <div className="page-header">
        <h1>Database Customer</h1>
        <p className="page-subtitle">Kelola semua data pelanggan dan kontak</p>
      </div>
      
      {/* Enhanced Controls */}
      <div className="controls with-prominent">
        <div className="prominent-section">
          <button 
            className="btn-add prominent"
            onClick={() => setFormOpen(true)}
            title="Tambah Customer Baru"
          >
            <span className="btn-icon">➕</span>
            <span className="btn-text">Tambah<br/>Customer</span>
          </button>
        </div>
        
        <div className="search-section">
          <div className="search-wrapper">
            <span className="search-icon"></span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau telepon..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="btn-refresh"
            onClick={fetchCustomers} 
            disabled={loading}
            title="Refresh data"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Enhanced Customers Table */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data customer...</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Customer</th>
                <th>Kontak</th>
                <th>Alamat</th>
                <th>Info Tambahan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="data-row">
                  <td>
                    <div className="id-cell">
                      <span className="id-number">#{customer.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-name">{customer.name}</span>
                      {customer.company && (
                        <span className="customer-company">{customer.company}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      {customer.email && (
                        <div className="contact-item">
                          <span className="contact-icon"></span>
                          <span className="contact-value">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="contact-item">
                          <span className="contact-icon"></span>
                          <span className="contact-value">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="address-cell">
                      {customer.address ? (
                        <span className="address-text">{customer.address}</span>
                      ) : (
                        <span className="no-address">Tidak ada alamat</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="info-cell">
                      {customer.website && (
                        <div className="info-item">
                          <span className="info-icon"></span>
                          <span className="info-value">{customer.website}</span>
                        </div>
                      )}
                      {customer.note && (
                        <div className="info-item">
                          <span className="info-icon"></span>
                          <span className="info-value">{customer.note}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setEditCustomer(customer);
                          setFormOpen(true);
                        }}
                        title="Edit customer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteCustomer(customer.id)}
                        title="Hapus customer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                        </svg>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="no-data">
                    <div className="empty-state">
                      <div className="empty-icon"></div>
                      <p>Tidak ada data customer</p>
                      <small>Mulai dengan menambahkan customer baru</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Form Modal */}
      {formOpen && (
        <CustomerForm
          customer={editCustomer}
          onSave={saveCustomer}
          onClose={() => {
            setFormOpen(false);
            setEditCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerManagement; 