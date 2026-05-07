// frontend/src/components/Header.js
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
console.log('✅ HEADER BUILD TEST 777');
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
      const isOpen = sidebar.classList.toggle('open');
      setMenuOpen(isOpen);
      if (overlay) overlay.style.display = isOpen ? 'block' : 'none';
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      const btn = document.querySelector('.menu-btn');

      if (sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !btn?.contains(e.target)) {
          sidebar.classList.remove('open');
          setMenuOpen(false);
          if (overlay) overlay.style.display = 'none';
        }
      }

      if (!e.target.closest('.user-menu-wrapper')) setUserMenuOpen(false);
      if (!e.target.closest('.font-menu-wrapper')) setFontMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      if (sidebar) {
        sidebar.classList.remove('open');
        setMenuOpen(false);
        if (overlay) overlay.style.display = 'none';
      }
    }
    setUserMenuOpen(false);
    setFontMenuOpen(false);
  }, [location.pathname, isMobile]);

  const pageTitles = {
    '/dashboard': {
      title: 'Popas pentru Suflet',
      subtitle: 'Biblia zilnică, rugăciune și inspirație creștină'
    },
    '/devotional': {
      title: 'Devoțional zilnic',
      subtitle: 'Meditație biblică, rugăciune și gânduri de credință'
    },
    '/generate': {
      title: 'Creator Conținut',
      subtitle: 'Generează postări creștine cu AI pentru social media'
    },
    '/bookmarks': {
      title: 'Semnele mele',
      subtitle: 'Versete salvate, evidențiate și notițe personale'
    },
    '/prayer': {
      title: 'Cereri de rugăciune',
      subtitle: 'Comunitate de rugăciune și susținere spirituală'
    },
    '/schedule': {
      title: 'Programări',
      subtitle: 'Planifică publicarea postărilor pe Facebook'
    },
    '/history': {
      title: 'Istoric publicări',
      subtitle: 'Postările tale create și distribuite'
    },
    '/verses': {
      title: 'Biblia Cornilescu',
      subtitle: '31.102 versete — citește, caută și meditează zilnic'
    },
    '/reading': {
      title: 'Plan de citire',
      subtitle: 'Parcurge Biblia zilnic, la ritmul tău'
    },
    '/settings': {
      title: 'Setări',
      subtitle: 'Cont, notificări și integrări'
    },
    '/admin': {
      title: 'Administrare',
      subtitle: 'Utilizatori, conținut și control complet'
    },
    '/analytics': {
      title: 'Statistici Facebook',
      subtitle: 'Reach, engagement și performanța postărilor'
    },
    '/notifications': {
      title: 'Notificări',
      subtitle: 'Toate notificările și alertele tale'
    }
  };

  const current = pageTitles[location.pathname] || {
    title: 'Popas pentru Suflet',
    subtitle: 'Biblia online, rugăciuni și inspirație creștină zilnică'
  };

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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Dimineață binecuvântată';
    if (h < 18) return 'Dumnezeu să te binecuvânteze';
    return 'Seară liniștită';
  };

  return (
    <header className="header" role="banner">
      {/* STÂNGA */}
      <div className="header-left">
        <button
          className="menu-btn"
          onClick={toggleMenu}
          aria-label="Deschide meniu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div
          className="header-brand"
          onClick={() => navigate('/dashboard')}
          role="link"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate('/dashboard')}
          title="Pagina principală — Popas pentru Suflet"
        >
          <span className="header-brand-icon">🕊️</span>
          <div className="header-brand-text">
            <h1 className="header-title" style={{ color: 'red', fontSize: '32px' }}>
  TEST HEADER NOU 777
</h1>
            <p className="header-subtitle" style={{ color: 'lime', fontSize: '18px' }}>
  DACA VEZI ASTA, HEADER.JS ESTE CEL CORECT
</p>
          </div>
        </div>
      </div>

      {/* DREAPTA */}
      <div className="header-actions">

        {/* Greeting - doar desktop */}
        {!isMobile && isAuthenticated && (
          <div className="header-greeting">
            {greeting()}, <strong>{user?.nume?.split(' ')[0]}</strong>
          </div>
        )}

        {/* Font Size - doar desktop */}
        {!isMobile && (
          <div className="font-menu-wrapper">
            <button
              onClick={() => setFontMenuOpen(!fontMenuOpen)}
              className="header-action-btn"
              title="Mărime text"
              aria-label="Schimbă mărimea textului"
            >
              Aa <span className="header-arrow">▼</span>
            </button>

            {fontMenuOpen && (
              <div className="header-font-dropdown">
                <div className="header-dropdown-label">Mărime text</div>
                {fontSizeOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setFontSize(opt.key); setFontMenuOpen(false); }}
                    className={`header-dropdown-option ${fontSize === opt.key ? 'active' : ''}`}
                  >
                    <span style={{ fontSize: opt.size, fontWeight: 600 }}>{opt.label}</span>
                    <span style={{ fontSize: opt.size, opacity: 0.5 }}>Abc</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="header-action-btn"
          title={theme === 'dark' ? 'Mod luminos' : 'Mod întunecat'}
          aria-label={theme === 'dark' ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(244,208,63,0.12), rgba(244,208,63,0.04))'
              : 'linear-gradient(135deg, rgba(30,30,60,0.1), rgba(30,30,60,0.04))',
            borderColor: theme === 'dark' ? 'rgba(244,208,63,0.25)' : 'rgba(30,30,60,0.15)'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
          <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Ceas - doar desktop */}
        <div className="header-time">
          🕐 {time.toLocaleTimeString('ro-RO')}
        </div>

        {/* Notificări */}
        {isAuthenticated && <NotificationBell />}

        {/* User Menu */}
        {isAuthenticated ? (
          <div className="user-menu-wrapper">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="header-user-btn"
              aria-label="Meniu utilizator"
            >
              <div
                className="header-user-avatar"
                style={{
                  background: isAdmin
                    ? 'linear-gradient(135deg, #f4d03f, #e67e22)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.nume} className="header-user-avatar-img" />
                ) : (
                  getInitiale(user?.nume)
                )}
              </div>
              <span className="user-name">{user?.nume}</span>
              {isAdmin && <span className="admin-badge">ADMIN</span>}
              <span className="header-arrow">{userMenuOpen ? '▲' : '▼'}</span>
            </button>

            {userMenuOpen && (
              <div className="header-user-dropdown">
                <div className="header-dropdown-user-info">
                  <div className="header-dropdown-user-name">{user?.nume}</div>
                  <div className="header-dropdown-user-email">{user?.email}</div>
                  {isAdmin && (
                    <div className="header-dropdown-user-role">👑 Administrator</div>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                    className="header-dropdown-item"
                  >
                    🛡️ Admin Panel
                  </button>
                )}

                <button
                  onClick={() => { navigate('/notifications'); setUserMenuOpen(false); }}
                  className="header-dropdown-item"
                >
                  🔔 Notificări
                </button>

                <button
                  onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                  className="header-dropdown-item"
                >
                  ⚙️ Setări cont
                </button>

                {/* Font size pe mobil */}
                {isMobile && (
                  <>
                    <div className="header-dropdown-separator" />
                    <div className="header-dropdown-label">Mărime text</div>
                    {fontSizeOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setFontSize(opt.key); setUserMenuOpen(false); }}
                        className={`header-dropdown-item ${fontSize === opt.key ? 'font-active' : ''}`}
                      >
                        <span style={{ fontSize: opt.size }}>Aa</span>
                        <span>{opt.label}</span>
                        {fontSize === opt.key && <span style={{ marginLeft: 'auto' }}>✓</span>}
                      </button>
                    ))}
                  </>
                )}

                <div className="header-dropdown-separator" />

                <button
                  onClick={handleLogout}
                  className="header-dropdown-item logout"
                >
                  🚪 Deconectare
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="header-auth-buttons">
            <button
              onClick={() => navigate('/login')}
              className="header-login-btn"
            >
              🔑 <span className="theme-label">Intră în cont</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;