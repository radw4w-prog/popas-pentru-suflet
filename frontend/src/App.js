import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import GeneratePage from './pages/GeneratePage';
import SchedulePage from './pages/SchedulePage';
import HistoryPage from './pages/HistoryPage';
import VersesPage from './pages/VersesPage';
import SettingsPage from './pages/SettingsPage';
import './styles/App.css';

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
    <Router>
      <div className="app-layout" data-theme={theme}>
        <Sidebar theme={theme} />
        <div className="main-content">
          <Header theme={theme} toggleTheme={toggleTheme} />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/verses" element={<VersesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;