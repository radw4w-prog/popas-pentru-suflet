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

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e) => {
      // Sidebar
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

      // User menu
      if (!e.target.closest('.user-menu-wrapper')) {
        setUserMenuOpen(false);
      }

      // Font menu
      if (!e.target.closest('.font-menu-wrapper')) {
        setFontMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  // Close sidebar on route change (mobile)
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
    // Close all dropdowns on route change
    setUserMenuOpen(false);
    setFontMenuOpen(false);
  }, [location.pathname, isMobile]);

  const pageTitles = {
    '/dashboard': { title: 'Popas pentru Suflet', subtitle: 'verset de încurajare, rugăciune și pași zilnici cu Dumnezeu' },
    '/devotional': { title: 'Devoțional zilnic', subtitle: 'meditație, rugăciune și aplicație practică' },
    '/generate': { title: 'Creator Creștin', subtitle: 'imagini și texte inspiraționale pentru postări' },
    '/bookmarks': { title: 'Semnele mele', subtitle: 'versete salvate, evidențiate și cu notițe personale' },
    '/prayer': { title: 'Cereri de rugăciune', subtitle: 'comunitate de rugăciune și susținere' },
    '/schedule': { title: 'Programări Facebook', subtitle: 'publicare organizată și consecventă' },
    '/history': { title: 'Istoric Publicări', subtitle: 'urmărește postările create și distribuite' },
    '/verses': { title: 'Biblia Cornilescu', subtitle: '31.102 versete pentru citire, căutare și meditație' },
    '/reading': { title: 'Plan de citire', subtitle: 'drumul tău zilnic prin Cuvântul lui Dumnezeu' },
    '/settings': { title: 'Setări și conexiuni', subtitle: 'cont, notificări și integrări' },
    '/admin': { title: 'Administrare', subtitle: 'utilizatori, conținut și control complet' },
    '/analytics': { title: 'Statistici Facebook', subtitle: 'reach, engagement, creștere și top postări' },
  };

  const current = pageTitles[location.pathname] || {
    title: 'Popas pentru Suflet',
    subtitle: 'spațiu de liniște, credință și inspirație'
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

  return (
    <div className="header">
      {/* STÂNGA */}
      <div className="header-left">
        <button
          className="menu-btn"
          onClick={toggleMenu}
          aria-label="Meniu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className="header-info">
          <h1 className="header-title">{current.title}</h1>
          <div className="header-subtext">{current.subtitle}</div>
        </div>
      </div>

      {/* DREAPTA */}
      <div className="header-actions">

        {/* FONT SIZE - doar desktop */}
        {!isMobile && (
          <div className="font-menu-wrapper">
            <button
              onClick={() => setFontMenuOpen(!fontMenuOpen)}
              className="header-action-btn"
              title="Mărime text"
            >
              <span>Aa</span>
              <span className="header-action-arrow">▼</span>
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
                    <span style={{ fontSize: opt.size, opacity: 0.6 }}>Abc</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* THEME */}
        <button
          onClick={toggleTheme}
          className="header-action-btn header-theme-btn"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(244,208,63,0.15), rgba(244,208,63,0.05))'
              : 'linear-gradient(135deg, rgba(30,30,60,0.15), rgba(30,30,60,0.05))',
            borderColor: theme === 'dark' ? 'rgba(244,208,63,0.3)' : 'rgba(30,30,60,0.2)'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
          <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* CEAS - doar desktop */}
        <div className="header-time">
          🕐 {time.toLocaleTimeString('ro-RO')}
        </div>

        {/* NOTIFICĂRI */}
        {isAuthenticated && <NotificationBell />}

        {/* USER MENU */}
        {isAuthenticated ? (
          <div className="user-menu-wrapper">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="header-user-btn"
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
                  <img src={user.avatar} alt="" className="header-user-avatar-img" />
                ) : (
                  getInitiale(user?.nume)
                )}
              </div>

              <span className="user-name">{user?.nume}</span>

              {isAdmin && <span className="admin-badge">ADMIN</span>}

              <span className="header-action-arrow">
                {userMenuOpen ? '▲' : '▼'}
              </span>
            </button>

            {userMenuOpen && (
              <div className="header-user-dropdown">
                {/* User info */}
                <div className="header-dropdown-user-info">
                  <div className="header-dropdown-user-name">{user?.nume}</div>
                  <div className="header-dropdown-user-email">{user?.email}</div>
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
                  onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                  className="header-dropdown-item"
                >
                  ⚙️ Setări cont
                </button>

                {/* Font size pe mobile - în user dropdown */}
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
          <button
            onClick={() => navigate('/login')}
            className="header-login-btn"
          >
            🔑 <span className="theme-label">Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;