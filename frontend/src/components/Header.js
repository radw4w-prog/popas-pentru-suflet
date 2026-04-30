import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
      setMenuOpen(!menuOpen);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      const sidebar = document.querySelector('.sidebar');
      const btn = document.querySelector('.menu-btn');
      if (sidebar && !sidebar.contains(e.target) && !btn?.contains(e.target)) {
        sidebar.classList.remove('open');
        setMenuOpen(false);
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
    '/settings': { title: 'Setări', subtitle: 'Configurare' },
  };

  const current = pageTitles[location.pathname] || { title: 'Popas', subtitle: '' };

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="menu-btn" onClick={toggleMenu}
          id="menu-toggle" style={{
            display: 'none', background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', padding: '0.5rem',
            cursor: 'pointer', color: 'var(--gold-primary)',
            fontSize: '1.2rem', width: 38, height: 38,
            alignItems: 'center', justifyContent: 'center'
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

      <div className="header-actions">
        {/* Theme Toggle */}
        <button onClick={toggleTheme} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.45rem 0.85rem',
          cursor: 'pointer', fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'var(--transition)'
        }}>
          {theme === 'dark' ? '☀️' : '🌙'}
          <span style={{ fontSize: '0.78rem' }}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        <div className="header-time">
          🕐 {time.toLocaleTimeString('ro-RO')}
        </div>
        <button className="header-btn" onClick={() => window.location.reload()}>
          🔄
        </button>
      </div>
    </div>
  );
};

export default Header;