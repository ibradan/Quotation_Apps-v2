import React from 'react';

export const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  overlay = false,
  fullscreen = false 
}) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerStyle = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    ...(overlay && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 1000
    }),
    ...(fullscreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      zIndex: 9999
    }),
    ...(!overlay && !fullscreen && {
      padding: '2rem'
    })
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={containerStyle}>
        <div style={spinnerStyle}></div>
        {message && (
          <div style={{
            color: '#6c757d',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export const LoadingCard = ({ children, loading, error, onRetry }) => {
  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        color: '#721c24'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <div style={{ marginBottom: '1rem' }}>{error}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return children;
};

export default LoadingSpinner;
