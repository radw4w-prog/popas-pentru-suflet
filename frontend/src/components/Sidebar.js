// frontend/src/components/Sidebar.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
	// În publicItems sau userItems:
{ path: '/prayer', icon: '🙏', label: 'Cereri rugăciune' }
/*{ path: '/notifications', icon: '🔔', label: 'Notificări' }*/
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

  const handleNavigate = (path) => {
    navigate(path);
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
  };

  const NavItem = ({ item }) => (
    <div
      className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
      onClick={() => handleNavigate(item.path)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleNavigate(item.path)}
    >
      <span className="nav-icon">{item.icon}</span>
      <span className="nav-label">{item.label}</span>
    </div>
  );

  const NavSection = ({ title, items }) => (
    <>
      <div className="nav-section-title">{title}</div>
      {items.map(item => <NavItem key={item.path} item={item} />)}
    </>
  );

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🕊️</span>
          <span className="logo-text">Popas pentru Suflet</span>
        </div>
        <div className="sidebar-subtitle">Content Manager</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
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
          <div className="sidebar-auth-prompt">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔐</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Înregistrează-te pentru acces complet
            </p>
            <button onClick={() => handleNavigate('/login')} className="sidebar-auth-btn sidebar-auth-btn-primary">
              🔑 Login
            </button>
            <button onClick={() => handleNavigate('/register')} className="sidebar-auth-btn sidebar-auth-btn-secondary">
              ✅ Înregistrare
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {isAuthenticated && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" style={{
              background: isAdmin
                ? 'linear-gradient(135deg, #f4d03f, #e67e22)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.nume?.slice(0, 2).toUpperCase()
              }
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nume}</div>
              <div className="sidebar-user-role">
                {isAdmin ? '👑 Administrator' : '👤 Utilizator'}
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Deconectare"
              className="sidebar-logout-btn"
            >
              🚪
            </button>
          </div>
        )}
        <div className="sidebar-version">
          {theme === 'dark' ? '🌙' : '☀️'} v2.0 • Premium
        </div>
      </div>
    </div>
  );
};

export default Sidebar;