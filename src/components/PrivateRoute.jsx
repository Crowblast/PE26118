import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: '16px',
          color: 'var(--accent-primary)'
        }}
      >
        <Loader2 className="animate-spin" size={40} style={{ animation: 'spin 1.5s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          Verificando credenciales...
        </span>
      </div>
    );
  }

  const isAuthorized = currentUser && currentUser.email === 'tecnoadmin@tecnomundo.com.ar';

  return isAuthorized ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
