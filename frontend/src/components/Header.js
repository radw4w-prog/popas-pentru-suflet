import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Header = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  // Închide sidebar la click outside
  useEffect(() => {
    const handleClick = (e) => {
      const sidebar = document.querySelector('.sidebar');
      const btn = document.querySelector('.menu-btn');
      if (sidebar && !sidebar.contains(e.target) && !btn?.contains(e.target)) {
        sidebar.classList.remove('open');
        setMenuOpen(false);
      }
      // Închide user menu
      if (!e.target.closest('.user-menu-wrapper')) {
        setUserMenuOpen(false);
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

  // Inițiale pentru avatar
  const getInitiale = (nume) => {
    if (!nume) return '?';
    return nume.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="header">
      {/* Stânga - Menu btn + Titlu pagină */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className="menu-btn"
          onClick={toggleMenu}
          style={{
            display: 'none',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--gold-primary)',
            fontSize: '1.2rem',
            width: 38, height: 38,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div>
          <h1 className="header-title">
            {current.title}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
              {' '}• {current.subtitle}
            </span>
          </h1>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {time.toLocaleDateString('ro-RO', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </div>
        </div>
      </div>

      {/* Dreapta - Acțiuni */}
      <div className="header-actions">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
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
          }}>
          {theme === 'dark' ? '☀️' : '🌙'}
          <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Ceas */}
        <div className="header-time">
          🕐 {time.toLocaleTimeString('ro-RO')}
        </div>
		
		{/* NOTIFICĂRI - NOU */}
  {isAuthenticated && <NotificationBell />}

        {/* USER MENU sau Login button */}
        {isAuthenticated ? (
          <div className="user-menu-wrapper" style={{ position: 'relative' }}>
            {/* Avatar Button */}
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
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
              }}>
              {/* Avatar */}
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: isAdmin
                  ? 'linear-gradient(135deg, #f4d03f, #e67e22)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0
              }}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : getInitiale(user?.nume)
                }
              </div>

              <span style={{ fontSize: '0.82rem', fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nume}
              </span>

              {isAdmin && (
                <span style={{
                  fontSize: '0.6rem',
                  background: 'linear-gradient(135deg, #f4d03f, #e67e22)',
                  color: '#000',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  ADMIN
                </span>
              )}

              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {userMenuOpen ? '▲' : '▼'}
              </span>
            </button>

            {/* Dropdown Menu */}
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
                {/* Info user */}
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

                {/* Admin Panel link */}
                {isAdmin && (
                  <button
                    onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                    style={dropdownItemStyle}>
                    🛡️ Admin Panel
                  </button>
                )}

                {/* Settings */}
                <button
                  onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                  style={dropdownItemStyle}>
                  ⚙️ Setări cont
                </button>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{ ...dropdownItemStyle, color: '#ef4444' }}>
                  🚪 Deconectare
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Buton Login pentru vizitatori */
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
            }}>
            🔑 Login
          </button>
        )}
      </div>
    </div>
  );
};

// Style refolosibil pentru dropdown items
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