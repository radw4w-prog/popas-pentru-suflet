'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import '../styles/BottomNav.css';

const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setShowMore(false); }, [pathname]);

  const handleNav = (path) => {
    router.push(path);
    setShowMore(false);
  };

  // Clasele din BottomNav.css: bn-bar, bn-inner, bn-item, bn-active, bn-icon, bn-label
  const mainItems = [
    { path: '/dashboard', icon: '🏠', label: 'Acasă' },
    { path: '/biblia', icon: '📖', label: 'Biblia' },
    { path: '/audio', icon: '🎧', label: 'Audio' },
    { path: '/devotional', icon: '🙏', label: 'Devoțional' },
  ];

  const moreItems = [
    { path: '/generate', icon: '✨', label: 'Creează' },
    { path: '/journey', icon: '🕊️', label: 'Călătorie' },
    { path: '/journal', icon: '📔', label: 'Jurnal' },
    { path: '/rugaciuni', icon: '🙏', label: 'Rugăciuni' },
  ];

  if (isAuthenticated) {
    moreItems.push(
      { path: '/reading', icon: '📗', label: 'Plan citire' },
      { path: '/bookmarks', icon: '🔖', label: 'Salvate' },
      { path: '/profile', icon: '👤', label: 'Profil' },
    );
  }

  if (isAdmin) {
    moreItems.push(
      { path: '/schedule', icon: '📅', label: 'Programare' },
      { path: '/history', icon: '📜', label: 'Istoric' },
      { path: '/analytics', icon: '📊', label: 'Analytics' },
      { path: '/settings', icon: '⚙️', label: 'Setări' },
      { path: '/admin', icon: '🛡️', label: 'Admin' },
    );
  }

  if (!isAuthenticated) {
    moreItems.push(
      { path: '/login', icon: '🔑', label: 'Login' },
      { path: '/register', icon: '✅', label: 'Cont nou' },
    );
  }

  const isMoreActive = moreItems.some(i => i.path === pathname);

  const renderMoreMenu = () => {
    if (!showMore || !mounted) return null;
    return createPortal(
      <>
        <div className="bn-overlay" onClick={() => setShowMore(false)} />
        <div className="bn-more-menu">
          <div className="bn-more-header">
            <span className="bn-more-title">📋 Mai mult</span>
            <button className="bn-more-close" onClick={() => setShowMore(false)}>✕</button>
          </div>
          <div className="bn-more-grid">
            {moreItems.map(item => (
              <div
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`bn-more-item ${pathname === item.path ? 'bn-more-active' : ''}`}
              >
                <span className="bn-more-icon">{item.icon}</span>
                <span className="bn-more-label">{item.label}</span>
                {pathname === item.path && <span className="bn-more-dot">●</span>}
              </div>
            ))}
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <>
      {renderMoreMenu()}
      <div className="bn-bar">
        <div className="bn-inner">
          {mainItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`bn-item ${pathname === item.path ? 'bn-active' : ''}`}
            >
              <span className="bn-icon">{item.icon}</span>
              <span className="bn-label">{item.label}</span>
            </button>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); setShowMore(prev => !prev); }}
            className={`bn-item ${showMore || isMoreActive ? 'bn-active' : ''}`}
          >
            <span className="bn-icon">{showMore ? '✕' : '⋯'}</span>
            <span className="bn-label">Mai mult</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
