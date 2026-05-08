// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FacebookCallbackPage from './pages/FacebookCallbackPage';
import BottomNav from './components/BottomNav';
import PWAInstallBanner from './components/PWAInstallBanner';
import AnalyticsPage from './pages/AnalyticsPage';
import BookmarksPage from './pages/BookmarksPage';
import DevotionalPage from './pages/DevotionalPage';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

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
import PrayerPage from './pages/PrayerPage';
import NotificationsPage from './pages/NotificationsPage';
import AudioBiblePage from './pages/AudioBiblePage';
import JourneyPage from './pages/JourneyPage';
import JournalPage from './pages/JournalPage';

import './styles/App.css';
import './styles/Premium.css';

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
            {/* Public routes fără layout */}
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
			<Route path="/notifications" element={
  <ProtectedRoute>
    <AppLayout theme={theme} toggleTheme={toggleTheme}>
      <NotificationsPage />
    </AppLayout>
  </ProtectedRoute>
} />


<Route path="/audio-bible" element={
  <AppLayout theme={theme} toggleTheme={toggleTheme}>
    <AudioBiblePage />
  </AppLayout>
} />

<Route path="/journey" element={
  <ProtectedRoute>
    <AppLayout theme={theme} toggleTheme={toggleTheme}>
      <JourneyPage />
    </AppLayout>
  </ProtectedRoute>
} />
<Route path="/journal" element={
  <ProtectedRoute>
    <AppLayout theme={theme} toggleTheme={toggleTheme}>
      <JournalPage />
    </AppLayout>
  </ProtectedRoute>
} />
            <Route path="/auth/facebook/callback" element={
              <div data-theme={theme}><FacebookCallbackPage /></div>
            } />

            {/* Routes cu AppLayout */}
            <Route path="/dashboard" element={
              <AppLayout theme={theme} toggleTheme={toggleTheme}>
                <DashboardPage />
              </AppLayout>
            } />
			<Route path="/prayer" element={
  <AppLayout theme={theme} toggleTheme={toggleTheme}>
    <PrayerPage />
  </AppLayout>
} />
            <Route path="/devotional" element={
              <AppLayout theme={theme} toggleTheme={toggleTheme}>
                <DevotionalPage />
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
            <Route path="/bookmarks" element={
              <ProtectedRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <BookmarksPage />
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
            <Route path="/analytics" element={
              <AdminRoute>
                <AppLayout theme={theme} toggleTheme={toggleTheme}>
                  <AnalyticsPage />
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