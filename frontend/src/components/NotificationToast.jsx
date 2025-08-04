import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './NotificationToast.css';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification--${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification__icon">
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✕'}
            {notification.type === 'warning' && '⚠'}
            {notification.type === 'info' && 'ℹ'}
          </div>
          <div className="notification__content">
            {notification.title && (
              <div className="notification__title">{notification.title}</div>
            )}
            <div className="notification__message">{notification.message}</div>
          </div>
          <button
            className="notification__close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
