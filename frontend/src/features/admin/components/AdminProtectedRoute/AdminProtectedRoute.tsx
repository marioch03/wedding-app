import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <div className="spinner" role="status" aria-label="Verificando sesión" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
