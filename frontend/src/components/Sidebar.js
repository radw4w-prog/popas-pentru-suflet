import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ theme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  // Meniu pentru TOȚI (inclusiv vizitatori)
const publicItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/generate', icon: '✨', label: 'Generează' },
  { path: '/verses', icon: '📖', label: 'Versete' },
];

const userItems = [
  { path: '/reading', icon: '📗', label: 'Citire Biblie' },
];

const adminItems = [
  { path: '/schedule', icon: '📅', label: 'Programare' },
  { path: '/history', icon: '📜', label: 'Istoric' },
  { path: '/settings', icon: '⚙️', label: 'Setări' },
];

  // Admin Panel item
  const adminPanelItem = { path: '/admin', icon: '🛡️', label: 'Admin Panel' };

  const handleNavigate = (path) => {
    navigate(path);
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar) {
      sidebar.classList.remove('open');
    }
  };

  const NavItem = ({ item }) => (
    <div
      className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
      onClick={() => handleNavigate(item.path)}
    >
      <span className="nav-icon">{item.icon}</span>
      <span>{item.label}</span>
    </div>
  );

  const NavSection = ({ title, items }) => (
    <>
      <div style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '0.75rem 1rem 0.25rem',
        marginTop: '0.5rem'
      }}>
        {title}
      </div>
      {items.map(item => <NavItem key={item.path} item={item} />)}
    </>
  );

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🕊️</span>
          Popas pentru Suflet
        </div>
        <div className="sidebar-subtitle">Content Manager</div>
      </div>

      {/* Navigare */}
      <nav className="sidebar-nav">

        {/* PUBLIC - toți */}
        <NavSection title="General" items={publicItems} />

        {/* USER - logați */}
        {isAuthenticated && (
          <NavSection title="Contul meu" items={userItems} />
        )}

        {/* ADMIN - doar admin */}
        {isAdmin && (
          <NavSection title="Administrare" items={adminItems} />
        )}

        {/* ADMIN PANEL */}
        {isAdmin && (
          <NavSection title="Panou Control" items={[adminPanelItem]} />
        )}

        {/* LOGIN prompt pentru vizitatori */}
        {!isAuthenticated && (
          <div style={{
            margin: '1rem 0.75rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔐</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Înregistrează-te pentru acces complet
            </p>
            <button
              onClick={() => handleNavigate('/login')}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '0.4rem'
              }}>
              🔑 Login
            </button>
            <button
              onClick={() => handleNavigate('/register')}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'transparent',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>
              ✅ Înregistrare
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Info user logat */}
        {isAuthenticated && (
          <div style={{
            padding: '0.75rem',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: isAdmin
                ? 'linear-gradient(135deg, #f4d03f, #e67e22)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.nume?.slice(0, 2).toUpperCase()
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nume}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {isAdmin ? '👑 Administrator' : '👤 Utilizator'}
              </div>
            </div>
            {/* Logout rapid */}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Deconectare"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '4px',
                borderRadius: '4px',
                color: 'var(--text-muted)'
              }}>
              🚪
            </button>
          </div>
        )}

        <div className="sidebar-version">
          {theme === 'dark' ? '🌙' : '☀️'} v1.0 • Premium
        </div>
      </div>
    </div>
  );
};

export default Sidebar;