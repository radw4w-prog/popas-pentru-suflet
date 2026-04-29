import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  const formatDate = (date) => {
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="header">
      <div>
        <h1 className="header-title">
          {current.title} <span>• {current.subtitle}</span>
        </h1>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {formatDate(time)}
        </div>
      </div>
      <div className="header-actions">
        <div className="header-time">
          🕐 {time.toLocaleTimeString('ro-RO')}
        </div>
        <button className="header-btn" onClick={() => window.location.reload()}>
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default Header;