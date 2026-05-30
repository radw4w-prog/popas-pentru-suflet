'use client';
import React, { useState, useEffect, useContext, createContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFontSize } from '../context/FontSizeContext';

import { createPortal } from 'react-dom';
import NotificationBell from './NotificationBell';

export const FontSizeContext = createContext({ fontSize: 'medium', setFontSize: () => {} });

const pageTitles = {
  '/dashboard': { title: 'Popas pentru Suflet', subtitle: 'Biblia zilnică, rugăciune și inspirație creștină' },
  '/devotional': { title: 'Devoțional zilnic', subtitle: 'Meditație biblică, rugăciune și gânduri de credință' },
  '/audio': { title: 'Audio Biblie', subtitle: 'Ascultă Biblia Cornilescu completă în română' },
  '/generate': { title: 'Creator Conținut', subtitle: 'Generează postări creștine cu AI' },
  '/bookmarks': { title: 'Semnele mele', subtitle: 'Versete salvate și notițe personale' },
  '/rugaciuni': { title: 'Cereri de rugăciune', subtitle: 'Comunitate de rugăciune' },
  '/schedule': { title: 'Programări', subtitle: 'Planifică publicarea postărilor' },
  '/history': { title: 'Istoric publicări', subtitle: 'Postările tale create și distribuite' },
  '/biblia': { title: 'Biblia Cornilescu', subtitle: '31.102 versete — citește, caută și meditează zilnic' },
  '/reading': { title: 'Plan de citire', subtitle: 'Parcurge Biblia zilnic, la ritmul tău' },
  '/settings': { title: 'Setări', subtitle: 'Cont, notificări și integrări' },
  '/admin': { title: 'Administrare', subtitle: 'Utilizatori, conținut și control complet' },
  '/analytics': { title: 'Statistici Facebook', subtitle: 'Reach, engagement și performanța postărilor' },
  '/notifications': { title: 'Notificări', subtitle: 'Toate notificările și alertele tale' },
  '/profile': { title: 'Profilul meu', subtitle: 'Contul tău, statistici și repere spirituale' },
  '/journey': { title: 'Călătoria spirituală', subtitle: 'Streak, badge-uri și progres spiritual' },
  '/journal': { title: 'Jurnal Spiritual', subtitle: 'Gânduri, rugăciuni și pași cu Dumnezeu' },
};

const { fontSize, setFontSize } = useFontSize();


const Header = ({ theme, toggleTheme }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { fontSize, setFontSize } = useContext(FontSizeContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Închide sidebar la navigare
  useEffect(() => {
    if (!mounted) return;
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.classList.remove('sidebar-open');
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname, mounted]);

  const toggleMenu = () => {
    if (!mounted) return;
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
      const isOpen = sidebar.classList.toggle('open');
      setMenuOpen(isOpen);
      if (overlay) overlay.classList.toggle('visible', isOpen);
      document.body.classList.toggle('sidebar-open', isOpen);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/login');
  };

  const getInitiale = (nume) => {
    if (!nume) return '?';
    return nume.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const current = pageTitles[pathname] || { title: 'Popas pentru Suflet', subtitle: 'Biblia online, rugăciuni și inspirație' };

  const fontSizeOptions = [
    { key: 'small', label: 'Mic' },
    { key: 'medium', label: 'Mediu' },
    { key: 'large', label: 'Mare' },
  ];

  const renderUserDropdown = () => {
    if (!userMenuOpen || !mounted) return null;
    return createPortal(
      <>
        <div
          onClick={() => setUserMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 19998 }}
        />
        <div className="header-user-dropdown" style={{ 
		
  position: 'fixed',
  top: '60px',
  right: '1rem',
  zIndex: 19999,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '0.5rem',
  minWidth: '200px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
}}>
          <div className="header-dropdown-user-info">
            <div className="header-dropdown-name">{user?.nume}</div>
            <div className="header-dropdown-email">{user?.email}</div>
            {isAdmin && <div className="header-dropdown-role">👑 Administrator</div>}
          </div>
          <div className="header-dropdown-divider" />
          {isAdmin && (
            <div onClick={() => { router.push('/admin'); setUserMenuOpen(false); }} className="header-dropdown-item">
              🛡️ Admin Panel
            </div>
          )}
          <div onClick={() => { router.push('/profile'); setUserMenuOpen(false); }} className="header-dropdown-item">👤 Profilul meu</div>
          <div onClick={() => { router.push('/journey'); setUserMenuOpen(false); }} className="header-dropdown-item">🕊️ Călătoria spirituală</div>
          <div onClick={() => { router.push('/journal'); setUserMenuOpen(false); }} className="header-dropdown-item">📔 Jurnal spiritual</div>
          <div onClick={() => { router.push('/settings'); setUserMenuOpen(false); }} className="header-dropdown-item">⚙️ Setări cont</div>
          <div className="header-dropdown-divider" />
          <div onClick={handleLogout} className="header-dropdown-item header-dropdown-logout">🚪 Deconectare</div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <header className="header">
     <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
  {/* Menu button — vizibil doar pe mobile */}
  <button
    className="menu-btn"
    onClick={toggleMenu}
    aria-label="Meniu"
    style={{ display: 'flex' }}
  >
    <span style={{ fontSize: '1.2rem' }}>☰</span>
  </button>

  {/* Titlul paginii */}
  <div style={{ minWidth: 0 }}>
    <div className="header-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {current.title}
    </div>
    <div className="header-subtext" style={{ 
      color: 'var(--text-muted)', 
      fontSize: '0.72rem',
      lineHeight: '1.4',
      marginTop: '2px'
    }}>
      {current.subtitle}
    </div>
  </div>
</div>



      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
	  {isAuthenticated && <NotificationBell />}
        {/* Font size — doar desktop */}
        {mounted && !isMobile && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {fontSizeOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setFontSize(opt.key)}
                className="header-btn"
                style={{
                  padding: '0.4rem 0.6rem',
                  fontWeight: fontSize === opt.key ? 700 : 400,
                  color: fontSize === opt.key ? '#d4af37' : undefined,
                  borderColor: fontSize === opt.key ? '#d4af37' : undefined,
                }}
                title={opt.label}
              >
                Aa
              </button>
            ))}
          </div>
        )}

        {/* Tema */}
        <button onClick={toggleTheme} className="header-btn" aria-label="Schimbă tema">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* User */}
        {isAuthenticated ? (
          <button
            className="header-btn"
            onClick={() => setUserMenuOpen(p => !p)}
            style={{ padding: '0.4rem' }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.nume}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37, #b8960c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: '#000'
              }}>
                {getInitiale(user?.nume)}
              </div>
            )}
          </button>
        ) : (
          <button className="header-btn" onClick={() => router.push('/login')}>
            🔑 Login
          </button>
        )}

        {renderUserDropdown()}
      </div>
    </header>
  );
};



export default Header;
