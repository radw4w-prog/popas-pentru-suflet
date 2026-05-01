import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);

  // Închide meniul More la click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setShowMore(false);
  };

  const mainItems = [
    { path: '/dashboard', icon: '📊', label: 'Acasă' },
    { path: '/generate', icon: '✨', label: 'Creează' },
    { path: '/verses', icon: '📖', label: 'Biblia' },
  ];

  if (isAuthenticated) {
    mainItems.push({ path: '/reading', icon: '📗', label: 'Citire' });
  }

  const moreItems = [];

  if (isAdmin) {
    moreItems.push(
      { path: '/schedule', icon: '📅', label: 'Programare' },
      { path: '/history', icon: '📜', label: 'Istoric' },
      { path: '/settings', icon: '⚙️', label: 'Setări' },
	  { path: '/analytics', icon: '📊', label: 'Analytics' },
      { path: '/admin', icon: '🛡️', label: 'Admin' },
    );
  }

  if (!isAuthenticated) {
    moreItems.push(
      { path: '/login', icon: '🔑', label: 'Login' },
      { path: '/register', icon: '✅', label: 'Cont nou' },
    );
  }

  return (
    <>
      {/* More Menu Popup */}
      {showMore && moreItems.length > 0 && (
        <div ref={moreRef} className="bottom-more-menu">
          {moreItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className="bottom-more-item"
            >
              <span className="more-icon">{item.icon}</span>
              <span>{item.label}</span>
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
              className={`bottom-nav-item ${showMore ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{showMore ? '✕' : '•••'}</span>
              <span className="bottom-nav-label">Mai mult</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default BottomNav;