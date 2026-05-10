// frontend/src/components/Sidebar.js
import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ theme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const publicItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/generate', icon: '✨', label: 'Generează' },
    { path: '/verses', icon: '📖', label: 'Biblia' },
    { path: '/audio-bible', icon: '🎧', label: 'Audio Biblie' },
    { path: '/devotional', icon: '🙏', label: 'Devoțional zilnic' },
    { path: '/journey', icon: '🕊️', label: 'Călătoria mea' },
    { path: '/journal', icon: '📔', label: 'Jurnal' },
    { path: '/prayer', icon: '🙏', label: 'Cereri rugăciune' },
  ];

  const userItems = [
    { path: '/reading', icon: '📗', label: 'Citire Biblie' },
    { path: '/bookmarks', icon: '🔖', label: 'Semnele mele' },
  ];

  const adminItems = [
    { path: '/schedule', icon: '📅', label: 'Programare' },
    { path: '/history', icon: '📜', label: 'Istoric' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
    { path: '/settings', icon: '⚙️', label: 'Setări' },
  ];

  const adminPanelItem = { path: '/admin', icon: '🛡️', label: 'Admin Panel' };

  // Închide sidebar
  const closeSidebar = useCallback(() => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.classList.remove('sidebar-open');
  }, []);

  // Navigare + închide
  const handleNavigate = (path) => {
    navigate(path);
    closeSidebar();
  };

  // Închide la schimbare pagină
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  // Închide la click pe overlay
  useEffect(() => {
    const overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) return;

    const handleOverlayClick = () => {
      closeSidebar();
    };

    overlay.addEventListener('click', handleOverlayClick);
    overlay.addEventListener('touchstart', handleOverlayClick, { passive: true });

    return () => {
      overlay.removeEventListener('click', handleOverlayClick);
      overlay.removeEventListener('touchstart', handleOverlayClick);
    };
  }, [closeSidebar]);

  // Previne scroll pe body când sidebar e deschis
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar?.classList.contains('open')) {
        document.body.classList.add('sidebar-open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.add('visible');
      } else {
        document.body.classList.remove('sidebar-open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('visible');
      }
    });

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  const NavItem = ({ item }) => (
    <div
      className={`sb-nav-item ${location.pathname === item.path ? 'sb-active' : ''}`}
      onClick={() => handleNavigate(item.path)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleNavigate(item.path)}
    >
      <span className="sb-nav-icon">{item.icon}</span>
      <span className="sb-nav-label">{item.label}</span>
      {location.pathname === item.path && <span className="sb-nav-indicator" />}
    </div>
  );

  const NavSection = ({ title, items }) => (
    <div className="sb-section">
      <div className="sb-section-title">{title}</div>
      {items.map(item => <NavItem key={item.path} item={item} />)}
    </div>
  );

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sb-header">
        <div className="sb-logo" onClick={() => handleNavigate('/dashboard')}>
          <span className="sb-logo-icon">🕊️</span>
          <div className="sb-logo-text">
            <span className="sb-logo-title">Popas pentru Suflet</span>
            <span className="sb-logo-sub">Content Manager</span>
          </div>
        </div>
        <button className="sb-close-btn" onClick={closeSidebar}>✕</button>
      </div>

      {/* Nav — scrollabil */}
      <nav className="sb-nav">
        <NavSection title="General" items={publicItems} />

        {isAuthenticated && (
          <NavSection title="Contul meu" items={userItems} />
        )}

        {isAdmin && (
          <NavSection title="Administrare" items={adminItems} />
        )}

        {isAdmin && (
          <NavSection title="Panou Control" items={[adminPanelItem]} />
        )}

        {!isAuthenticated && (
          <div className="sb-auth-prompt">
            <div className="sb-auth-icon">🔐</div>
            <p className="sb-auth-text">
              Înregistrează-te pentru acces complet
            </p>
            <button
              onClick={() => handleNavigate('/login')}
              className="sb-auth-btn sb-auth-btn-primary"
            >
              🔑 Login
            </button>
            <button
              onClick={() => handleNavigate('/register')}
              className="sb-auth-btn sb-auth-btn-secondary"
            >
              ✅ Înregistrare
            </button>
          </div>
        )}
      </nav>

      {/* Footer — fix jos */}
      <div className="sb-footer">
        {isAuthenticated && (
          <div className="sb-user">
            <div
              className="sb-user-avatar"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #f4d03f, #e67e22)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="sb-user-avatar-img"
                />
              ) : (
                user?.nume?.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user?.nume}</div>
              <div className="sb-user-role">
                {isAdmin ? '👑 Administrator' : '👤 Utilizator'}
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Deconectare"
              className="sb-logout-btn"
            >
              🚪
            </button>
          </div>
        )}
        <div className="sb-version">
          {theme === 'dark' ? '🌙' : '☀️'} v2.0 • Premium
        </div>
      </div>
    </div>
  );
};

export default Sidebar;