import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--bg-primary, #0a0a0f)',
    color: 'var(--text-primary, #f0f0f0)'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🕊️</div>
    <div>Se încarcă...</div>
  </div>
);

// ProtectedRoute cu delay de siguranță — 
// așteaptă 500ms după loading=false înainte să redirecționeze
// previne redirect prematur când initAuth e în curs
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [safeToRedirect, setSafeToRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Delay mic — permite AuthContext să termine complet initAuth
      const timer = setTimeout(() => {
        setSafeToRedirect(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSafeToRedirect(false);
    }
  }, [loading, isAuthenticated]);

  // Cât timp loading sau în delay — afișează loading screen
  if (loading || (!isAuthenticated && !safeToRedirect)) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated && safeToRedirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [safeToRedirect, setSafeToRedirect] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      const timer = setTimeout(() => {
        setSafeToRedirect(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSafeToRedirect(false);
    }
  }, [loading, isAuthenticated, isAdmin]);

  if (loading || ((!isAuthenticated || !isAdmin) && !safeToRedirect)) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated && safeToRedirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin && safeToRedirect) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
