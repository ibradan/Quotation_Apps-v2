import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const notification = {
      id,
      message,
      type,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper methods
  const success = useCallback((message, duration) => {
    return addNotification(message, 'success', duration);
  }, [addNotification]);

  const error = useCallback((message, duration) => {
    return addNotification(message, 'error', duration);
  }, [addNotification]);

  const warning = useCallback((message, duration) => {
    return addNotification(message, 'warning', duration);
  }, [addNotification]);

  const info = useCallback((message, duration) => {
    return addNotification(message, 'info', duration);
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    }}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onClose }) => {
  const { type, message } = notification;

  const typeStyles = {
    success: {
      backgroundColor: '#d4edda',
      borderColor: '#c3e6cb',
      color: '#155724',
      icon: '✅'
    },
    error: {
      backgroundColor: '#f8d7da',
      borderColor: '#f5c6cb',
      color: '#721c24',
      icon: '❌'
    },
    warning: {
      backgroundColor: '#fff3cd',
      borderColor: '#ffeaa7',
      color: '#856404',
      icon: '⚠️'
    },
    info: {
      backgroundColor: '#d1ecf1',
      borderColor: '#bee5eb',
      color: '#0c5460',
      icon: 'ℹ️'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: style.backgroundColor,
      border: `1px solid ${style.borderColor}`,
      borderRadius: '6px',
      color: style.color,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      maxWidth: '100%',
      wordBreak: 'break-word',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ fontSize: '16px', flexShrink: 0 }}>
        {style.icon}
      </div>
      
      <div style={{ flex: 1, fontSize: '14px', lineHeight: '1.4' }}>
        {message}
      </div>
      
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: style.color,
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0',
          opacity: 0.7,
          flexShrink: 0
        }}
        onMouseOver={(e) => e.target.style.opacity = 1}
        onMouseOut={(e) => e.target.style.opacity = 0.7}
      >
        ×
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
