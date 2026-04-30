import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle sidebar pe mobile
  const toggleMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
      setMenuOpen(!menuOpen);
    }
  };

  // Închide sidebar când dai click în altă parte
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Buton meniu mobile */}
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
            width: '38px',
            height: '38px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          id="menu-toggle"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div>
          <h1 className="header-title">
            {current.title}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
              {' '}• {current.subtitle}
            </span>
          </h1>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {time.toLocaleDateString('ro-RO', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </div>
        </div>
      </div>

      <div className="header-actions">
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