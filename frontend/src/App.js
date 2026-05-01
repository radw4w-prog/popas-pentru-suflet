import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FacebookCallbackPage from './pages/FacebookCallbackPage';
import BottomNav from './components/BottomNav';
import PWAInstallBanner from './components/PWAInstallBanner';

// Context
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';

// Layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages - NORMALE (fără lazy)
import DashboardPage from './pages/DashboardPage';
import VersesPage from './pages/VersesPage';
import ReadingPage from './pages/ReadingPage';
import GeneratePage from './pages/GeneratePage';
import SchedulePage from './pages/SchedulePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import './styles/App.css';

export const FontSizeContext = React.createContext({
  fontSize: 'medium',
  setFontSize: () => {}
});

const AppLayout = ({ children, theme, toggleTheme }) => (
  <div className="app-layout" data-theme={theme}>
    <Sidebar theme={theme} />
    <div
      className="sidebar-overlay"
      onClick={() => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
      }}
    />
    <div className="main-content">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <div className="page-content">
        {children}
      </div>
    </div>
    <BottomNav />
    <PWAInstallBanner />
  </div>
);

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );
  const [fontSize, setFontSize] = useState(
    localStorage.getItem('fontSize') || 'medium'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-fontsize', fontSize);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <div data-theme={theme}><LoginPage /></div>
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <div data-theme={theme}><RegisterPage /></div>
              </PublicRoute>
            } />
            <Route path="/auth/facebook/callback" element={
              <div data-theme={theme}><FacebookCallbackPage /></div>
            } />
            <Route path="/dashboard" element={
              <AppLayout theme={theme} toggleTheme={toggleTheme}>
                <DashboardPage />
              </AppLayout>
            } />
            <Route path="/verses" element={
              <AppLayout theme={theme} toggleTheme={toggleTheme}>
                <VersesPage />
              </AppLayout>
            } />
            <Route path="/generate" element={
              <AppLayout theme={theme} toggleTheme={toggleTheme}>
                <GeneratePage />
              </AppLayout>
            } />
            <Route path="/reading" element={
              <ProtectedRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <ReadingPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <AdminRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <SchedulePage />
                </AppLayout>
              </AdminRoute>
            } />
            <Route path="/history" element={
              <AdminRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <HistoryPage />
                </AppLayout>
              </AdminRoute>
            } />
            <Route path="/settings" element={
              <AdminRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <SettingsPage />
                </AppLayout>
              </AdminRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <AdminPage />
                </AppLayout>
              </AdminRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </FontSizeContext.Provider>
  );
}

export default App;