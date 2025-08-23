import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state untuk menampilkan fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error untuk debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Kirim error ke monitoring service jika tersedia
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI yang user-friendly
      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            color: '#dc3545'
          }}>
            ⚠️
          </div>
          
          <h2 style={{
            color: '#dc3545',
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            Oops! Terjadi Kesalahan
          </h2>
          
          <p style={{
            color: '#6c757d',
            marginBottom: '1.5rem',
            maxWidth: '500px'
          }}>
            Maaf, terjadi kesalahan tidak terduga. Tim kami telah diberitahu dan sedang menangani masalah ini.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              🔄 Coba Lagi
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              🔄 Refresh Halaman
            </button>
          </div>

          {/* Error details untuk development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              maxWidth: '800px',
              textAlign: 'left'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#721c24'
              }}>
                Developer Info (Development Mode)
              </summary>
              
              <div style={{
                marginTop: '1rem',
                fontSize: '0.875rem',
                fontFamily: 'monospace'
              }}>
                <strong>Error:</strong>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  color: '#721c24',
                  margin: '0.5rem 0'
                }}>
                  {this.state.error.toString()}
                </pre>
                
                <strong>Stack Trace:</strong>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  color: '#721c24',
                  margin: '0.5rem 0',
                  fontSize: '0.75rem'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}

          <div style={{
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: '#6c757d'
          }}>
            Error ID: {this.state.errorId}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
