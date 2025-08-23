import React from 'react';
import { useLoading } from '../contexts/LoadingContext';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary',
  overlay = false,
  text = null 
}) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  const colorClasses = {
    primary: 'loading-spinner--primary',
    white: 'loading-spinner--white',
    gray: 'loading-spinner--gray'
  };

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-overlay__content">
          <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
            <div className="loading-spinner__circle"></div>
          </div>
          {text && <div className="loading-overlay__text">{text}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
      <div className="loading-spinner__circle"></div>
    </div>
  );
};

export const GlobalLoading = () => {
  const { isGlobalLoading } = useLoading();

  if (!isGlobalLoading()) return null;

  return (
    <LoadingSpinner 
      overlay 
      size="large" 
      color="primary" 
      text="Loading..." 
    />
  );
};

export default LoadingSpinner;
