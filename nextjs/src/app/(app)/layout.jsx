'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { FontSizeContext } from '@/components/Header';

export default function AppLayout({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    setTheme(savedTheme);
    setFontSize(savedFontSize);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-fontsize', savedFontSize);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSetFontSize = (size) => {
    setFontSize(size);
    document.documentElement.setAttribute('data-fontsize', size);
    localStorage.setItem('fontSize', size);
  };

  return (
    <AuthProvider>
      <FontSizeContext.Provider value={{ fontSize, setFontSize: handleSetFontSize }}>
        <div className="app-layout">
          {mounted && (
            <>
              <Header theme={theme} toggleTheme={toggleTheme} />
              <Sidebar theme={theme} />
            </>
          )}
          <div
            className="main-content"
            style={{
              marginLeft: 'var(--sidebar-width, 280px)',
              minHeight: '100vh',
              width: 'calc(100% - var(--sidebar-width, 280px))',
              boxSizing: 'border-box',
            }}
          >
            <div className="page-content">
              {children}
            </div>
          </div>
          {mounted && <BottomNav />}
        </div>
      </FontSizeContext.Provider>
    </AuthProvider>
  );
}