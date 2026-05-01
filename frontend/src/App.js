import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FacebookCallbackPage from './pages/FacebookCallbackPage';

// Context
import { AuthProvider } from './context/AuthContext';

// Route Guards
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';

// Layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages - Publice
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages - Protected (user + admin)
import DashboardPage from './pages/DashboardPage';
import VersesPage from './pages/VersesPage';
import ReadingPage from './pages/ReadingPage';

// Pages - Admin only
import GeneratePage from './pages/GeneratePage';
import SchedulePage from './pages/SchedulePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

// Styles
import './styles/App.css';
import AdminPage from './pages/AdminPage';


// Layout cu Sidebar + Header (pentru paginile interne)
const AppLayout = ({ children, theme, toggleTheme }) => (
  <div className="app-layout" data-theme={theme}>
    <Sidebar theme={theme} />
    <div className="main-content">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <div className="page-content">
        {children}
      </div>
    </div>
  </div>
);

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ═══════════════════════════════════
              RUTE PUBLICE (fără layout)
          ═══════════════════════════════════ */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div data-theme={theme}>
                  <LoginPage />
                </div>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <div data-theme={theme}>
                  <RegisterPage />
                </div>
              </PublicRoute>
            }
          />
<Route
  path="/auth/facebook/callback"
  element={
    <div data-theme={theme}>
      <FacebookCallbackPage />
    </div>
  }
/>
          {/* ═══════════════════════════════════
              RUTE PROTEJATE - User + Admin
          ═══════════════════════════════════ */}
          <Route
            path="/dashboard"
            element={
              <AppLayout theme={theme} toggleTheme={toggleTheme}>
                <DashboardPage />
              </AppLayout>
            }
          />

          <Route
            path="/verses"
            element={
              <AppLayout theme={theme} toggleTheme={toggleTheme}>
                <VersesPage />
              </AppLayout>
            }
          />

          <Route
            path="/reading"
            element={
              <ProtectedRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <ReadingPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

     <Route
  path="/generate"
  element={
    <AppLayout theme={theme} toggleTheme={toggleTheme}>
      <GeneratePage />
    </AppLayout>
  }
/>


          {/* ═══════════════════════════════════
              RUTE ADMIN ONLY
          ═══════════════════════════════════ */}
    

          <Route
            path="/schedule"
            element={
              <AdminRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <SchedulePage />
                </AppLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/history"
            element={
              <AdminRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <HistoryPage />
                </AppLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <AdminRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <SettingsPage />
                </AppLayout>
              </AdminRoute>
            }
          />
		  
		  
		  <Route
  path="/admin"
  element={
    <AdminRoute>
      <AppLayout theme={theme} toggleTheme={toggleTheme}>
        <AdminPage />
      </AppLayout>
    </AdminRoute>
  }
/>

          {/* ═══════════════════════════════════
              DEFAULT + 404
          ═══════════════════════════════════ */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;