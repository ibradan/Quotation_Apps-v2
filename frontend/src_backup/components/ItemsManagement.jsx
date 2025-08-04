import React from 'react';
import ItemForm from './ItemForm';

const ItemsManagement = ({ items }) => {
  const mainTableRef = React.useRef(null);
  const {
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
  } = items;

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out-of-stock', icon: '❌', text: 'Habis' };
    if (stock < 5) return { status: 'low-stock', icon: '⚠️', text: stock };
    return { status: 'in-stock', icon: '✅', text: stock };
  };

  const getTypeIcon = (type) => {
    return '';
  };

  // Get low stock items (stock < 5)
  const lowStockItems = items.items?.filter(item => (item.stock || 0) < 5) || [];

  const scrollToItem = (itemId) => {
    if (mainTableRef.current) {
      const targetRow = mainTableRef.current.querySelector(`tr[data-item-id="${itemId}"]`);
      if (targetRow) {
        targetRow.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add highlight effect
        targetRow.classList.add('highlight-row');
        setTimeout(() => {
          targetRow.classList.remove('highlight-row');
        }, 2000);
      }
    }
  };

  return (
    <div className="items-management">
      <div className="page-header" style={{background: '#f5f7fa', borderBottom: '2px solid #e3e6ea', padding: '1.5rem 2rem'}}>
        <h1 style={{color: '#1a73e8', fontWeight: 700}}>Data Barang & Jasa</h1>
        <p className="page-subtitle" style={{color: '#607d8b'}}>Kelola semua produk dan layanan yang tersedia</p>
      </div>
      
      {/* Enhanced Controls */}
      <div className="controls with-prominent">
        <div className="prominent-section">
          <button 
            className="btn-add prominent"
            onClick={() => setFormOpen(true)}
            title="Tambah Barang/Jasa Baru"
            style={{background: '#34a853', color: 'white', fontWeight: 600, borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '1rem', boxShadow: '0 2px 8px rgba(52,168,83,0.08)'}}>
            <span className="btn-icon" style={{fontSize: '1.5rem'}}>➕</span>
            <span className="btn-text">Tambah Barang</span>
          </button>
        </div>
        
        <div className="search-section">
          <div className="search-wrapper">
            <span className="search-icon"></span>
            <input
              type="text"
              placeholder="Cari nama..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="btn-refresh"
            onClick={fetchItems} 
            disabled={loading}
            title="Refresh data"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="category-tabs">
          <span className="filter-label">Kategori:</span>
          <button
            className={`filter-btn ${activeTabs.includes('Barang') ? 'active' : ''}`}
            onClick={() => setActiveTabs(tabs => 
              tabs.includes('Barang') ? tabs.filter(t => t !== 'Barang') : [...tabs, 'Barang']
            )}
          >
            Barang
          </button>
          <button
            className={`filter-btn ${activeTabs.includes('Jasa') ? 'active' : ''}`}
            onClick={() => setActiveTabs(tabs => 
              tabs.includes('Jasa') ? tabs.filter(t => t !== 'Jasa') : [...tabs, 'Jasa']
            )}
          >
            Jasa
          </button>
        </div>
        
        <div className="secondary-actions">
          <button 
            className="btn-secondary btn-import"
            onClick={importExcel}
            title="Import data dari Excel"
          >
            Import Excel
          </button>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            ref={importInputRef} 
            onChange={handleImportExcelFile} 
            style={{ display: 'none' }} 
          />
          <button 
            className="btn-secondary btn-export"
            onClick={exportExcel}
            title="Export data ke Excel"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Tables Layout */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data barang/jasa...</p>
        </div>
      ) : (
        <div className="tables-layout">
          {/* Main Items Table */}
          <div className="main-table-section">
            <div className="section-header">
              <h2>Data Barang & Jasa</h2>
              <span className="section-count">{filteredItems.length} item</span>
            </div>
            <div className="table-container" ref={mainTableRef}>
              <table style={{width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(60,64,67,0.04)'}}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Item</th>
                    <th>Tipe</th>
                    <th>Kode</th>
                    <th>Satuan</th>
                    <th>Stock</th>
                    <th>Harga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const stockInfo = getStockStatus(item.stock);
                    return (
                      <tr key={item.id} className="data-row" data-item-id={item.id} style={{transition: 'background 0.2s', borderBottom: '1px solid #e3e6ea'}}>
                        <td>
                          <div className="id-cell">
                            <span className="id-number" style={{color: '#607d8b', fontWeight: 600}}>#{item.id}</span>
                          </div>
                        </td>
                        <td>
                          <div className="item-cell">
                            <span className="item-name" style={{fontWeight: 500, color: '#222'}}>{item.name}</span>
                            {item.description && (
                              <span className="item-description" style={{color: '#607d8b', fontSize: '0.9em'}}>{item.description}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`type-badge ${item.type?.toLowerCase()}`} style={{background: '#e3f2fd', color: '#1a73e8', borderRadius: '6px', padding: '2px 8px', fontWeight: 500}}>
                            {getTypeIcon(item.type)} {item.type}
                          </span>
                        </td>
                        <td>
                          <span className="item-code" style={{color: '#607d8b'}}>{item.code || '-'}</span>
                        </td>
                        <td>
                          <span className="unit-cell" style={{color: '#607d8b'}}>{item.unit}</span>
                        </td>
                        <td>
                          <span className={`stock-status ${stockInfo.status}`} style={{fontWeight: 600, color: stockInfo.status === 'out-of-stock' ? '#ea4335' : stockInfo.status === 'low-stock' ? '#fbbc04' : '#34a853'}}>
                            {stockInfo.icon} {stockInfo.text}
                          </span>
                        </td>
                        <td>
                          <span className="price-display" style={{fontWeight: 600, color: '#222'}}>
                            Rp {item.price?.toLocaleString('id-ID') || '0'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons" style={{display: 'flex', gap: '0.5rem'}}>
                            <button 
                              className="btn-edit"
                              onClick={() => {
                                setEditItem(item);
                                setFormOpen(true);
                              }}
                              title="Edit item"
                              style={{background: '#1a73e8', color: 'white', borderRadius: '6px', padding: '4px 12px', fontWeight: 500, border: 'none'}}>
                              Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => deleteItem(item.id)}
                              title="Hapus item"
                              style={{background: '#ea4335', color: 'white', borderRadius: '6px', padding: '4px 12px', fontWeight: 500, border: 'none'}}>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="no-data">
                        <div className="empty-state">
                          <div className="empty-icon"></div>
                          <p>Tidak ada data {activeTabs.length === 2 ? 'Barang/Jasa' : activeTabs[0] || ''}</p>
                          <small>Mulai dengan menambahkan item baru</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Table */}
          <div className="side-table-section">
            <div className="section-header">
              <h2>Stock Menipis</h2>
              <span className="section-count">{lowStockItems.length} item</span>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Item</th>
                    <th>Tipe</th>
                    <th>Stock</th>
                    <th>Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(item => {
                    const stockInfo = getStockStatus(item.stock);
                    return (
                      <tr 
                        key={item.id} 
                        className="data-row clickable-row"
                        onClick={() => scrollToItem(item.id)}
                        title="Klik untuk lihat di tabel utama"
                      >
                        <td>
                          <div className="id-cell">
                            <span className="id-number">#{item.id}</span>
                          </div>
                        </td>
                        <td>
                          <div className="item-cell">
                            <span className="item-name">{item.name}</span>
                            {item.description && (
                              <span className="item-description">{item.description}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`type-badge ${item.type?.toLowerCase()}`}>
                            {getTypeIcon(item.type)} {item.type}
                          </span>
                        </td>
                        <td>
                          <span className={`stock-status ${stockInfo.status}`}>
                            {stockInfo.icon} {stockInfo.text}
                          </span>
                        </td>
                        <td>
                          <span className="price-display">
                            Rp {item.price?.toLocaleString('id-ID') || '0'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {lowStockItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="no-data">
                        <div className="empty-state">
                          <div className="empty-icon"></div>
                          <p>Stock semua item baik</p>
                          <small>Tidak ada item dengan stock menipis</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {formOpen && (
        <ItemForm
          item={editItem}
          onSave={saveItem}
          onClose={() => {
            setFormOpen(false);
            setEditItem(null);
          }}
        />
      )}
    </div>
  );
};

export default ItemsManagement; 