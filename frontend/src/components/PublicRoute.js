import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '60vh', fontSize: 18, color: '#d1a309'
      }}>
        Loading...
      </div>
    );
  }

  if (isLoggedIn && !location.state?.pendingCart) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
