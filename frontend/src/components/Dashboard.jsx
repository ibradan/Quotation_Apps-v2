import React from 'react';
import './Dashboard.css';

const Dashboard = ({ quotations, items, customers, navigate }) => {
  const totalQuotations = quotations.quotations?.length || 0;
  const totalItems = items.items?.length || 0;
  const totalCustomers = customers.customers?.length || 0;
  
  const recentQuotations = quotations.quotations?.slice(0, 6) || [];

  // Calculate additional statistics
  const approvedQuotations = quotations.quotations?.filter(q => q.status === 'approved').length || 0;
  const pendingQuotations = quotations.quotations?.filter(q => q.status === 'sent').length || 0;
  const draftQuotations = quotations.quotations?.filter(q => q.status === 'draft').length || 0;
  const outOfStockItems = items.items?.filter(item => (item.stock || 0) === 0).length || 0;
  const totalRevenue = quotations.quotations?.reduce((sum, q) => sum + (q.total || 0), 0) || 0;

  // Calculate this month data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthQuotations = quotations.quotations?.filter(q => {
    const qDate = new Date(q.date);
    return qDate.getMonth() === currentMonth && qDate.getFullYear() === currentYear;
  }).length || 0;

  // Generate chart data for current month (1-31 days)
  const getChartData = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const monthData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const quotationsCount = quotations.quotations?.filter(q => 
        q.date === dateStr
      ).length || 0;
      
      monthData.push({
        day: day,
        date: dateStr,
        count: quotationsCount
      });
    }
    
    return monthData;
  };

  const chartData = getChartData();
  const maxCount = Math.max(...chartData.map(d => d.count), 6);
  const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Handle navigation clicks
  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-quotation':
        navigate && navigate('penawaran');
        break;
      case 'add-item':
        navigate && navigate('barangjasa');
        break;
      case 'add-customer':
        navigate && navigate('customer');
        break;
      case 'export':
        // Handle export action
        break;
      default:
        break;
    }
  };

  const handleQuotationClick = (quotationId) => {
    navigate && navigate('penawaran');
    // TODO: Open quotation detail
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#34a853';
      case 'sent': return '#1a73e8';
      case 'draft': return '#9aa0a6';
      case 'rejected': return '#ea4335';
      default: return '#9aa0a6';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: '#1a73e8'}}>
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </h1>
            <p className="dashboard-subtitle">Selamat datang! Berikut ringkasan aktivitas quotation Anda hari ini</p>
          </div>
          <div className="header-date">
            <div className="date-card">
              <span className="current-date">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="current-time">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Statistics Grid */}
      <div className="stats-grid">
        <div 
          className="stat-card primary clickable" 
          onClick={() => navigate && navigate('penawaran')}
          style={{ cursor: 'pointer' }}
          title="Klik untuk melihat semua penawaran"
        >
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Penawaran</h3>
            <p className="stat-number">{totalQuotations}</p>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-dot approved"></span>
                <span>{approvedQuotations} Disetujui</span>
              </div>
              <div className="stat-item">
                <span className="stat-dot pending"></span>
                <span>{pendingQuotations} Pending</span>
              </div>
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-badge positive">+{thisMonthQuotations} bulan ini</span>
          </div>
        </div>
        
        <div 
          className="stat-card success clickable" 
          onClick={() => navigate && navigate('barangjasa')}
          style={{ cursor: 'pointer' }}
          title="Klik untuk melihat semua barang & jasa"
        >
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Master Barang & Jasa</h3>
            <p className="stat-number">{totalItems}</p>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-dot success"></span>
                <span>{items.items?.filter(item => (item.stock || 0) > 0).length || 0} Tersedia</span>
              </div>
              {outOfStockItems > 0 && (
                <div className="stat-item">
                  <span className="stat-dot danger"></span>
                  <span>{outOfStockItems} Habis Stock</span>
                </div>
              )}
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-badge neutral">Items aktif</span>
          </div>
        </div>
        
        <div 
          className="stat-card info clickable" 
          onClick={() => navigate && navigate('customer')}
          style={{ cursor: 'pointer' }}
          title="Klik untuk melihat semua customer"
        >
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Customer</h3>
            <p className="stat-number">{totalCustomers}</p>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-dot info"></span>
                <span>{totalCustomers} Customer Aktif</span>
              </div>
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-badge neutral">Database customer</span>
          </div>
        </div>

        <div 
          className="stat-card revenue clickable" 
          onClick={() => navigate && navigate('penawaran')}
          style={{ cursor: 'pointer' }}
          title="Klik untuk melihat detail revenue"
        >
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">{formatCurrency(totalRevenue)}</p>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-dot success"></span>
                <span>Dari {approvedQuotations} deal</span>
              </div>
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-badge positive">Estimasi pendapatan</span>
          </div>
        </div>
      </div>

      {/* Quotation Chart Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: '#1a73e8'}}>
              <path d="M3 3v18h18"/>
              <path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            Grafik Penawaran Bulan {currentMonthName}
          </h2>
          <span className="section-subtitle">Jumlah penawaran yang dibuat per tanggal dalam bulan ini</span>
        </div>
        
        <div className="chart-container">
          <div className="chart-wrapper">
            <div className="chart-y-axis">
              {[0,1,2,3,4,5,6].map(num => (
                <span key={num} className="y-axis-label">{num}</span>
              ))}
            </div>
            <div className="chart-content">
              <div className="chart-bars">
                {chartData.map((data, index) => (
                  <div key={index} className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        height: `${(data.count / (maxCount || 1)) * 100}%`,
                        minHeight: data.count > 0 ? '8px' : '2px'
                      }}
                      title={`${data.day} ${currentMonthName}: ${data.count} penawaran`}
                    >
                      {data.count > 0 && (
                        <span className="bar-value">{data.count}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-x-axis">
                <div className="x-axis-days">
                  {chartData.map((data, index) => (
                    <span key={index} className="x-axis-day">{data.day}</span>
                  ))}
                </div>
                <div className="x-axis-month">
                  {currentMonthName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: '#34a853'}}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Aksi Cepat
          </h2>
          <span className="section-subtitle">Lakukan aksi umum dengan sekali klik</span>
        </div>
        
        <div className="quick-actions-grid">
          <div 
            className="quick-action-card clickable" 
            onClick={() => handleQuickAction('new-quotation')}
            style={{ cursor: 'pointer' }}
          >
            <div className="action-icon primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Buat Penawaran Baru</h4>
              <p>Mulai penawaran untuk customer baru</p>
            </div>
            <div className="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7,7 17,7 17,17"/>
              </svg>
            </div>
          </div>
          
          <div 
            className="quick-action-card clickable" 
            onClick={() => handleQuickAction('add-item')}
            style={{ cursor: 'pointer' }}
          >
            <div className="action-icon success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Tambah Barang/Jasa</h4>
              <p>Tambah item baru ke master data</p>
            </div>
            <div className="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7,7 17,7 17,17"/>
              </svg>
            </div>
          </div>
          
          <div 
            className="quick-action-card clickable" 
            onClick={() => handleQuickAction('add-customer')}
            style={{ cursor: 'pointer' }}
          >
            <div className="action-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Tambah Customer</h4>
              <p>Daftarkan customer baru</p>
            </div>
            <div className="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7,7 17,7 17,17"/>
              </svg>
            </div>
          </div>
          
          <div 
            className="quick-action-card clickable" 
            onClick={() => handleQuickAction('export')}
            style={{ cursor: 'pointer' }}
          >
            <div className="action-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <div className="action-content">
              <h4>Export Data</h4>
              <p>Download laporan atau backup</p>
            </div>
            <div className="action-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7,7 17,7 17,17"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotations Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', color: '#1a73e8'}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Penawaran Terbaru
          </h2>
          <span className="section-count">{recentQuotations.length} dari {totalQuotations} penawaran</span>
        </div>
        
        {recentQuotations.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map(q => (
                  <tr 
                    key={q.id} 
                    className="clickable-row"
                    onClick={() => handleQuotationClick(q.id)}
                    style={{ cursor: 'pointer' }}
                    title="Klik untuk melihat detail penawaran"
                  >
                    <td>
                      <div className="id-cell">
                        <span className="id-number">#{q.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{q.customer_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        {new Date(q.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`status ${q.status?.toLowerCase()}`}
                        style={{ backgroundColor: getStatusColor(q.status) + '20', color: getStatusColor(q.status) }}
                      >
                        {q.status === 'approved' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        )}
                        {q.status === 'sent' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                          </svg>
                        )}
                        {q.status === 'draft' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        )}
                        {q.status === 'rejected' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                          </svg>
                        )}
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <span className="total-amount">
                        Rp {q.total?.toLocaleString('id-ID') || '0'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <p>Tidak ada penawaran terbaru</p>
            <small>Penawaran yang baru dibuat akan muncul di sini</small>
          </div>
        )}
      </div>



      {/* Quick Actions Section */}
    </div>
  );
};

export default Dashboard; 