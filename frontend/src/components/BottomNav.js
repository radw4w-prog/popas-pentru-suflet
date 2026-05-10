// frontend/src/components/BottomNav.js
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [showMore, setShowMore] = useState(false);

  // Închide More la navigare
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const handleNav = (path) => {
    navigate(path);
    setShowMore(false);
  };

  // Items principali
  const mainItems = [
    { path: '/dashboard', icon: '🏠', label: 'Acasă' },
    { path: '/verses', icon: '📖', label: 'Biblia' },
    { path: '/audio-bible', icon: '🎧', label: 'Audio' },
    { path: '/devotional', icon: '🙏', label: 'Devoțional' },
  ];

  // Items în "Mai mult"
  const moreItems = [
    { path: '/generate', icon: '✨', label: 'Creează conținut' },
    { path: '/journey', icon: '🕊️', label: 'Călătoria spirituală' },
    { path: '/journal', icon: '📔', label: 'Jurnal spiritual' },
    { path: '/prayer', icon: '🙏', label: 'Cereri de rugăciune' },
  ];

  if (isAuthenticated) {
    moreItems.push(
      { path: '/reading', icon: '📗', label: 'Plan citire' },
      { path: '/bookmarks', icon: '🔖', label: 'Semnele mele' },
      { path: '/profile', icon: '👤', label: 'Profilul meu' },
    );
  }

  if (isAdmin) {
    moreItems.push(
      { path: '/schedule', icon: '📅', label: 'Programare' },
      { path: '/history', icon: '📜', label: 'Istoric' },
      { path: '/analytics', icon: '📊', label: 'Analytics' },
      { path: '/settings', icon: '⚙️', label: 'Setări' },
      { path: '/admin', icon: '🛡️', label: 'Admin Panel' },
    );
  }

  if (!isAuthenticated) {
    moreItems.push(
      { path: '/login', icon: '🔑', label: 'Autentificare' },
      { path: '/register', icon: '✅', label: 'Cont nou gratuit' },
    );
  }

  const isMoreActive = moreItems.some(i => i.path === location.pathname);

  // Render More menu prin Portal
  const renderMoreMenu = () => {
    if (!showMore || moreItems.length === 0) return null;

    return createPortal(
      <>
        {/* Overlay */}
        <div
          className="bn-overlay"
          onClick={() => setShowMore(false)}
        />

        {/* Menu */}
        <div className="bn-more-menu">
          <div className="bn-more-header">
            <span className="bn-more-title">📋 Mai mult</span>
            <button
              className="bn-more-close"
              onClick={() => setShowMore(false)}
            >
              ✕
            </button>
          </div>

          <div className="bn-more-grid">
            {moreItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`bn-more-item ${location.pathname === item.path ? 'bn-more-active' : ''}`}
              >
                <span className="bn-more-icon">{item.icon}</span>
                <span className="bn-more-label">{item.label}</span>
                {location.pathname === item.path && (
                  <span className="bn-more-dot">●</span>
                )}
              </button>
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

      {/* Bottom Nav Bar */}
      <div className="bn-bar">
        <div className="bn-inner">
          {mainItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`bn-item ${location.pathname === item.path ? 'bn-active' : ''}`}
            >
              <span className="bn-icon">{item.icon}</span>
              <span className="bn-label">{item.label}</span>
            </button>
          ))}

          {/* More button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMore(prev => !prev);
            }}
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