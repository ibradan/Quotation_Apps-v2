import React from 'react';
import { LoadingCard } from './LoadingComponents';

const SimpleComponent = ({ 
  title, 
  data = [], 
  loading = false, 
  error = null,
  onRetry = null,
  children,
  actions = []
}) => {
  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '2px solid #007bff',
        paddingBottom: '1rem'
      }}>
        <h1 style={{ 
          color: '#007bff', 
          margin: 0,
          fontSize: '1.8rem'
        }}>
          {title}
        </h1>
        
        {actions.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: action.color || '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {action.icon && <span style={{ marginRight: '0.5rem' }}>{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <LoadingCard loading={loading} error={error} onRetry={onRetry}>
        {children || (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Komponen dalam pengembangan</h3>
            <p>Fitur {title.toLowerCase()} sedang dikembangkan dengan sistem yang robust.</p>
            {data.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>{data.length}</strong> data tersedia
              </div>
            )}
          </div>
        )}
      </LoadingCard>
    </div>
  );
};

// Quick Dashboard Component
export const Dashboard = ({ quotations, items, customers, settings }) => {
  const stats = [
    {
      title: 'Total Quotations',
      value: quotations?.quotations?.length || 0,
      icon: '📋',
      color: '#007bff'
    },
    {
      title: 'Total Items',
      value: items?.allItems?.length || 0,
      icon: '📦',
      color: '#28a745'
    },
    {
      title: 'Total Customers',
      value: customers?.allCustomers?.length || 0,
      icon: '👥',
      color: '#17a2b8'
    },
    {
      title: 'Settings',
      value: Object.keys(settings?.settings || {}).length,
      icon: '⚙️',
      color: '#6c757d'
    }
  ];

  return (
    <SimpleComponent 
      title="Dashboard" 
      loading={quotations?.loading || items?.loading}
      error={quotations?.error || items?.error}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: `3px solid ${stat.color}`,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {stat.icon}
            </div>
            <h3 style={{ color: stat.color, marginBottom: '0.5rem' }}>
              {stat.title}
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: '#e8f4fd',
        border: '1px solid #b8daff',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#004085', marginBottom: '1rem' }}>
          🎉 Sistem Robust Aktif!
        </h3>
        <p style={{ color: '#004085' }}>
          Aplikasi Quotation sudah menggunakan sistem robust dengan error handling yang comprehensive,
          retry mechanism, dan notifikasi yang user-friendly.
        </p>
      </div>
    </SimpleComponent>
  );
};

// Other quick components
export const QuotationList = ({ quotations, navigate }) => (
  <SimpleComponent 
    title="Quotations Management" 
    data={quotations?.quotations || []}
    loading={quotations?.loading}
    error={quotations?.error}
    onRetry={quotations?.fetchQuotations}
    actions={[
      {
        label: 'Tambah Quotation',
        icon: '➕',
        color: '#28a745',
        onClick: () => alert('Fitur tambah quotation dalam pengembangan')
      }
    ]}
  />
);

export const ItemsManagement = ({ items, navigate }) => (
  <SimpleComponent 
    title="Items Management" 
    data={items?.allItems || []}
    loading={items?.loading}
    error={items?.error}
    onRetry={items?.fetchItems}
    actions={[
      {
        label: 'Tambah Item',
        icon: '➕',
        color: '#28a745',
        onClick: () => alert('Fitur tambah item dalam pengembangan')
      },
      {
        label: 'Import Excel',
        icon: '📥',
        color: '#17a2b8',
        onClick: () => alert('Fitur import dalam pengembangan')
      }
    ]}
  />
);

export const CustomerManagement = ({ customers, navigate }) => (
  <SimpleComponent 
    title="Customer Management" 
    data={customers?.allCustomers || []}
    loading={customers?.loading}
    error={customers?.error}
    onRetry={customers?.fetchCustomers}
    actions={[
      {
        label: 'Tambah Customer',
        icon: '➕',
        color: '#28a745',
        onClick: () => alert('Fitur tambah customer dalam pengembangan')
      }
    ]}
  />
);

export const Settings = ({ settings, navigate }) => (
  <SimpleComponent 
    title="Settings" 
    data={Object.keys(settings?.settings || {})}
    loading={settings?.loading}
    error={settings?.error}
    onRetry={settings?.fetchSettings}
    actions={[
      {
        label: 'Reset ke Default',
        icon: '🔄',
        color: '#dc3545',
        onClick: () => {
          if (confirm('Reset semua pengaturan ke default?')) {
            settings?.resetSettings?.();
          }
        }
      }
    ]}
  />
);

export default SimpleComponent;
