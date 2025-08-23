import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './App.css';
import QuotationForm from './QuotationForm';
import QuotationDetail from './QuotationDetail';
import Dashboard from './components/Dashboard';
import QuotationList from './components/QuotationList';
import ItemsManagement from './components/ItemsManagement';
import CustomerManagement from './components/CustomerManagement';
import InvoiceManagement from './components/InvoiceManagement';
import Settings from './components/Settings';
import { queryClient } from './lib/queryClient';
import { useQuotations } from './hooks/useQuotations';
import { useItems } from './hooks/useItems';
import { useCustomers } from './hooks/useCustomers';
import { useSettings } from './hooks/useSettings';

// Icon Components for better maintainability
const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconDocument = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IconInvoice = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <path d="M9 9h6"/>
    <path d="M9 15h6"/>
    <path d="M9 12h6"/>
  </svg>
);

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
);

const IconPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [pageTransition, setPageTransition] = useState('entered');
  
  // Custom hooks untuk state management
  const quotations = useQuotations();
  const items = useItems();
  const customers = useCustomers();
  const settings = useSettings();



  // Enhanced navigation items - memoized for performance
  const navigationItems = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <IconDashboard />,
      description: 'Overview & Analytics',
      color: '#1a73e8'
    },
    {
      id: 'penawaran',
      label: 'Penawaran',
      icon: <IconDocument />,
      description: 'Kelola Quotations',
      color: '#34a853'
    },
    {
      id: 'invoice',
      label: 'Invoice',
      icon: <IconInvoice />,
      description: 'Kelola Invoice',
      color: '#ea4335'
    },
    {
      id: 'barangjasa',
      label: 'Barang & Jasa',
      icon: <IconPackage />,
      description: 'Master Products',
      color: '#fbbc04'
    },
    {
      id: 'customer',
      label: 'Customer',
      icon: <IconUsers />,
      description: 'Manage Clients',
      color: '#9c27b0'
    },
    {
      id: 'setting',
      label: 'Pengaturan',
      icon: <IconSettings />,
      description: 'App Configuration',
      color: '#607d8b'
    }
  ], []);

  // Page transition handler - dengan animasi ringan
  const handlePageChange = useCallback((pageId) => {
    if (pageId === currentPage) return;
    
    // Start transition animation
    setPageTransition('entering');
    
    // Quick transition - hanya 100ms
    setTimeout(() => {
      setCurrentPage(pageId);
      setPageTransition('entered');
    }, 100);
  }, [currentPage]);

  // Sidebar toggle handler - tidak memicu loading state
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);



  // Render halaman - memoized untuk performa
  const currentPageComponent = useMemo(() => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard quotations={quotations} items={items} customers={customers} navigate={handlePageChange} />;
      
      case 'penawaran':
        return <QuotationList quotations={quotations} />;
      
      case 'invoice':
        return <InvoiceManagement quotations={quotations} />;
      
      case 'barangjasa':
        return <ItemsManagement items={items} />;
      
      case 'customer':
        return <CustomerManagement customers={customers} />;
      
      case 'setting':
        return <Settings settings={settings} />;
      
      default:
        return <Dashboard quotations={quotations} items={items} customers={customers} navigate={handlePageChange} />;
    }
  }, [currentPage, quotations, items, customers, settings]);

  return (
    <div className="app">
      {/* Backdrop untuk mobile sidebar */}
      {!sidebarCollapsed && window.innerWidth <= 768 && (
        <div 
          className="sidebar-backdrop"
          onClick={handleSidebarToggle}
        />
      )}

      {/* Enhanced Sidebar dengan better organization */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Enhanced Header dengan Toggle Button */}
        <div className="sidebar-header">
          <div className="header-content">
            {!sidebarCollapsed && (
              <div className="brand">
                <h2>Quotation Apps</h2>
                <span className="brand-subtitle">Professional Quotation Management</span>
              </div>
            )}
            {/* Tombol Toggle - Posisi yang lebih natural */}
            <button 
              className="sidebar-toggle-btn"
              onClick={handleSidebarToggle}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="toggle-icon">
                {sidebarCollapsed ? '☰' : '‹'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Enhanced Navigation */}
        <nav className="side-nav">
          <div className="nav-section">
            {!sidebarCollapsed && (
              <div className="nav-section-title">Main Menu</div>
            )}
            {navigationItems.map(item => (
              <button 
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handlePageChange(item.id)}
                title={sidebarCollapsed ? `${item.label} - ${item.description}` : item.description}
                style={{ '--nav-color': item.color }}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="collapsed-tooltip">
                    <div className="tooltip-content">
                      <span className="tooltip-label">{item.label}</span>
                      <span className="tooltip-description">{item.description}</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </nav>
        
        {/* Enhanced Footer */}
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="footer-content">
      
              <div className="app-version">
                <span className="version-label">Version</span>
                <span className="version-number">v1.0.0</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="footer-collapsed">
      
              <div className="version-dot" title="v1.0.0"></div>
            </div>
          )}
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <div className="main-content">
        {/* Mobile Header dengan Hamburger Button */}
        <div className="mobile-header">
          <button 
            className="mobile-menu-btn"
            onClick={handleSidebarToggle}
            title="Open menu"
          >
            <span className="hamburger-icon">☰</span>
          </button>
          <h1 className="mobile-title">Quotation Apps</h1>
        </div>

        {/* Main Content Area - dengan animasi ringan */}
        <main className="app-main">
          <div className={`page-content ${pageTransition}`}>
            {currentPageComponent}
          </div>
        </main>
      </div>
    </div>
  );
}

// App wrapper with React Query Provider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />

    </QueryClientProvider>
  );
}

export default App;
