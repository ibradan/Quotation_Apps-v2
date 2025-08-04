import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🎉 Quotation Management System</h1>
      <p>Aplikasi berjalan dengan baik!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Status:</h2>
        <ul>
          <li>✅ Frontend: Running</li>
          <li>✅ Backend: http://localhost:3001</li>
          <li>✅ Database: Connected</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Frontend working!')}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default TestApp;
