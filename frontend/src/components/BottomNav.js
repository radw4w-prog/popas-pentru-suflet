// frontend/src/components/BottomNav.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  // Închide More la navigare
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const handleNav = (path) => {
    navigate(path);
    setShowMore(false);
  };

  // Items principali - mereu vizibili
  const mainItems = [
    { path: '/dashboard', icon: '🏠', label: 'Acasă' },
    { path: '/verses', icon: '📖', label: 'Biblia' },
    { path: '/generate', icon: '✨', label: 'Creează' },
    { path: '/devotional', icon: '🙏', label: 'Devoțional' },
  ];

  // Items în "Mai mult"
  const moreItems = [];

  if (isAuthenticated) {
    moreItems.push({ path: '/reading', icon: '📗', label: 'Citire' });
    moreItems.push({ path: '/bookmarks', icon: '🔖', label: 'Semne' });
  }

  if (isAdmin) {
    moreItems.push(
      { path: '/schedule', icon: '📅', label: 'Programare' },
      { path: '/history', icon: '📜', label: 'Istoric' },
	  { path: '/audio-bible', icon: '🎧', label: 'Audio' },
	  { icon: '🕊️', label: 'Călătorie', path: '/journey' },
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

  const isMainActive = mainItems.some(i => i.path === location.pathname);
  const isMoreActive = moreItems.some(i => i.path === location.pathname);

  return (
    <>
      {/* More Menu Popup */}
      {showMore && moreItems.length > 0 && (
        <div ref={moreRef} className="bottom-more-menu">
          {moreItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`bottom-more-item ${location.pathname === item.path ? 'active' : ''}`}
              style={location.pathname === item.path ? {
                background: 'var(--gold-subtle)',
                color: 'var(--gold-primary)'
              } : {}}
            >
              <span className="more-icon">{item.icon}</span>
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <span style={{ marginLeft: 'auto', color: 'var(--gold-primary)', fontSize: '0.7rem' }}>●</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          {mainItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          ))}

          {/* More button */}
          {moreItems.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={`bottom-nav-item ${showMore || isMoreActive ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{showMore ? '✕' : '⋯'}</span>
              <span className="bottom-nav-label">Mai mult</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default BottomNav;