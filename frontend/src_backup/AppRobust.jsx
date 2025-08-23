import React, { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingComponents';
import { NotificationProvider, useNotification } from './components/NotificationSystem';
import { useQuotations } from './hooks/useQuotationsRobust';
import { useItems } from './hooks/useItemsRobust';
import { useCustomers } from './hooks/useCustomersRobust';
import { useSettings } from './hooks/useSettingsRobust';

// Import robust components
import { 
  Dashboard, 
  QuotationList, 
  ItemsManagement, 
  CustomerManagement, 
  Settings 
} from './components/SimpleComponents';

// Main App Content
const AppContent = () => {
  const notification = useNotification();
  
  // Initialize hooks dengan error handling
  const quotations = useQuotations();
  const items = useItems({
    onStockChange: () => {
      quotations.refreshStockData();
      notification.info('Stock data telah diperbarui');
    }
  });
  const customers = useCustomers();
  const settings = useSettings();

  // Show notifications untuk errors
  React.useEffect(() => {
    if (quotations.error) {
      notification.error(`Quotations: ${quotations.error}`);
    }
  }, [quotations.error, notification]);

  React.useEffect(() => {
    if (items.error) {
      notification.error(`Items: ${items.error}`);
    }
  }, [items.error, notification]);

  React.useEffect(() => {
    if (customers.error) {
      notification.error(`Customers: ${customers.error}`);
    }
  }, [customers.error, notification]);

  React.useEffect(() => {
    if (settings.error) {
      notification.error(`Settings: ${settings.error}`);
    }
  }, [settings.error, notification]);

  // Navigation state
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  // Loading state untuk initial load
  const isInitialLoading = quotations.loading && items.loading && customers.loading && settings.loading;

  if (isInitialLoading) {
    return (
      <LoadingSpinner 
        size="large" 
        message="Memuat aplikasi..." 
        fullscreen 
      />
    );
  }

  // Navigation handler
  const navigate = (page) => {
    setCurrentPage(page);
  };

  // Render current page
  const renderCurrentPage = () => {
    const pageProps = {
      quotations,
      items,
      customers,
      settings,
      navigate,
      notification
    };

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'quotations':
        return <QuotationList {...pageProps} />;
      case 'items':
        return <ItemsManagement {...pageProps} />;
      case 'customers':
        return <CustomerManagement {...pageProps} />;
      case 'settings':
        return <Settings {...pageProps} />;
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Halaman tidak ditemukan</h2>
            <button onClick={() => navigate('dashboard')}>
              Kembali ke Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            📝 Quotation Apps
          </h1>
          
          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '1rem' }}>
            {[
              { key: 'dashboard', label: '🏠 Dashboard' },
              { key: 'quotations', label: '📋 Quotations' },
              { key: 'items', label: '📦 Items' },
              { key: 'customers', label: '👥 Customers' },
              { key: 'settings', label: '⚙️ Settings' }
            ].map(nav => (
              <button
                key={nav.key}
                onClick={() => navigate(nav.key)}
                style={{
                  background: currentPage === nav.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (currentPage !== nav.key) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentPage !== nav.key) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {nav.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ minHeight: 'calc(100vh - 80px)' }}>
        <ErrorBoundary>
          {renderCurrentPage()}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#f8f9fa',
        padding: '1rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid #dee2e6',
        color: '#6c757d',
        fontSize: '0.875rem'
      }}>
        <div>
          Quotation Apps v2.0 - Robust Edition | 
          {quotations.quotations.length} Quotations | 
          {items.allItems.length} Items | 
          {customers.allCustomers.length} Customers
        </div>
      </footer>
    </div>
  );
};

// Root App Component
const App = () => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;
