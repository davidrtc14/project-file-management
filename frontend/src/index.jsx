import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Importante!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* O AuthProvider envolve o App */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);