import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { FontSizeContext } from '../App';

const Header = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { fontSize, setFontSize } = useContext(FontSizeContext);

  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
      setMenuOpen(!menuOpen);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      // Închide sidebar overlay
      const sidebar = document.querySelector('.sidebar');
      const btn = document.querySelector('.menu-btn');
      if (sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !btn?.contains(e.target)) {
          sidebar.classList.remove('open');
          setMenuOpen(false);
        }
      }
      // Închide user menu
      if (!e.target.closest('.user-menu-wrapper')) {
        setUserMenuOpen(false);
      }
      // Închide font menu
      if (!e.target.closest('.font-menu-wrapper')) {
        setFontMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const pageTitles = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Privire de ansamblu' },
    '/generate': { title: 'Generează', subtitle: 'Conținut nou' },
    '/schedule': { title: 'Programare', subtitle: 'Calendar postări' },
    '/history': { title: 'Istoric', subtitle: 'Postări anterioare' },
    '/verses': { title: 'Versete', subtitle: 'Biblioteca biblică' },
    '/reading': { title: 'Citire Biblie', subtitle: 'Planul meu' },
    '/settings': { title: 'Setări', subtitle: 'Configurare' },
    '/admin': { title: 'Admin Panel', subtitle: 'Administrare' },
  };

  const current = pageTitles[location.pathname] || { title: 'Popas', subtitle: '' };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const getInitiale = (nume) => {
    if (!nume) return '?';
    return nume.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const fontSizeOptions = [
    { key: 'small', label: 'Mic', size: '13px' },
    { key: 'medium', label: 'Mediu', size: '15px' },
    { key: 'large', label: 'Mare', size: '17px' },
  ];

  return (
    <div className="header">
      {/* Stânga */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* Hamburger - doar pe mobile */}
        <button
          className="menu-btn"
          onClick={toggleMenu}
          aria-label="Meniu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div>
          <h1 className="header-title">
            {current.title}
            <span className="header-subtitle"> • {current.subtitle}</span>
          </h1>
          <div className="header-date">
            {time.toLocaleDateString('ro-RO', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </div>
        </div>
      </div>

      {/* Dreapta */}
      <div className="header-actions">

        {/* Mărime text */}
        <div className="font-menu-wrapper" style={{ position: 'relative' }}>
          <button
            onClick={() => setFontMenuOpen(!fontMenuOpen)}
            className="header-icon-btn"
            title="Mărime text"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem'
            }}
          >
            <span>Aa</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>▼</span>
          </button>

          {fontMenuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem',
              zIndex: 1000,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              minWidth: 140
            }}>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                padding: '0.25rem 0.5rem',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Mărime text
              </div>
              {fontSizeOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setFontSize(opt.key); setFontMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: fontSize === opt.key
                      ? 'rgba(99,102,241,0.1)'
                      : 'transparent',
                    border: fontSize === opt.key
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: fontSize === opt.key
                      ? '#6366f1'
                      : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '2px'
                  }}
                >
                  <span style={{ fontSize: opt.size, fontWeight: 600 }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: opt.size, opacity: 0.6 }}>
                    Abc
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="header-icon-btn"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(244,208,63,0.15), rgba(244,208,63,0.05))'
              : 'linear-gradient(135deg, rgba(30,30,60,0.15), rgba(30,30,60,0.05))',
            border: `1px solid ${theme === 'dark' ? 'rgba(244,208,63,0.3)' : 'rgba(30,30,60,0.2)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem 0.85rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
          <span className="theme-label" style={{ fontSize: '0.78rem', fontWeight: 500 }}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Ceas - ascuns pe mobile mic */}
        <div className="header-time">
          🕐 {time.toLocaleTimeString('ro-RO')}
        </div>

        {/* Notificări */}
        {isAuthenticated && <NotificationBell />}

        {/* User Menu / Login */}
        {isAuthenticated ? (
          <div className="user-menu-wrapper" style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="user-menu-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isAdmin
                  ? 'linear-gradient(135deg, #f4d03f, #e67e22)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0,
                overflow: 'hidden'
              }}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitiale(user?.nume)
                }
              </div>

              <span className="user-name" style={{
                fontSize: '0.82rem', fontWeight: 500,
                maxWidth: 80, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {user?.nume}
              </span>

              {isAdmin && (
                <span className="admin-badge" style={{
                  fontSize: '0.6rem',
                  background: 'linear-gradient(135deg, #f4d03f, #e67e22)',
                  color: '#000', padding: '1px 5px',
                  borderRadius: '10px', fontWeight: 700
                }}>
                  ADMIN
                </span>
              )}

              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {userMenuOpen ? '▲' : '▼'}
              </span>
            </button>

            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.5rem',
                minWidth: 200,
                zIndex: 1000,
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user?.nume}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user?.email}
                  </div>
                </div>

                {isAdmin && (
                  <button onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                    style={dropdownItemStyle}>
                    🛡️ Admin Panel
                  </button>
                )}

                <button onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                  style={dropdownItemStyle}>
                  ⚙️ Setări cont
                </button>

                <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

                <button onClick={handleLogout}
                  style={{ ...dropdownItemStyle, color: '#ef4444' }}>
                  🚪 Deconectare
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 1rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: 'white',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔑 Login
          </button>
        )}
      </div>
    </div>
  );
};

const dropdownItemStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'background 0.15s'
};

export default Header;