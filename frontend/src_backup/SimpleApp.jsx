import React, { useState } from 'react';
import './App.css';

function SimpleApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>📊 Quotation</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={currentPage === 'dashboard' ? 'active' : ''}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('quotations')}
            className={currentPage === 'quotations' ? 'active' : ''}
          >
            📋 Quotations
          </button>
          <button 
            onClick={() => setCurrentPage('customers')}
            className={currentPage === 'customers' ? 'active' : ''}
          >
            👥 Customers
          </button>
          <button 
            onClick={() => setCurrentPage('items')}
            className={currentPage === 'items' ? 'active' : ''}
          >
            📦 Items
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className={currentPage === 'settings' ? 'active' : ''}
          >
            ⚙️ Settings
          </button>
        </nav>
      </div>
      
      <div className="main-content">
        <div className="content-area">
          {currentPage === 'dashboard' && (
            <div>
              <h1>Dashboard</h1>
              <p>Welcome to Quotation Management System!</p>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Quotations</h3>
                  <p>Loading...</p>
                </div>
                <div className="stat-card">
                  <h3>Total Customers</h3>
                  <p>Loading...</p>
                </div>
                <div className="stat-card">
                  <h3>Total Items</h3>
                  <p>Loading...</p>
                </div>
              </div>
            </div>
          )}
          
          {currentPage === 'quotations' && (
            <div>
              <h1>Quotations</h1>
              <p>Manage your quotations here.</p>
            </div>
          )}
          
          {currentPage === 'customers' && (
            <div>
              <h1>Customers</h1>
              <p>Manage your customers here.</p>
            </div>
          )}
          
          {currentPage === 'items' && (
            <div>
              <h1>Items</h1>
              <p>Manage your items here.</p>
            </div>
          )}
          
          {currentPage === 'settings' && (
            <div>
              <h1>Settings</h1>
              <p>Configure your application settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;
