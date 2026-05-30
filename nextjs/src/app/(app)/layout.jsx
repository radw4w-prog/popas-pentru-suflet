'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { FontSizeProvider } from '@/context/FontSizeContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <AuthProvider>
      <FontSizeProvider>
        <Sidebar theme={theme} />
        <Header theme={theme} toggleTheme={toggleTheme} />
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
      </FontSizeProvider>
    </AuthProvider>
  );
}
