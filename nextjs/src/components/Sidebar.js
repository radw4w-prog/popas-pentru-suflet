'use client';
import React, { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ theme }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const publicItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/generate', icon: '✨', label: 'Generează' },
    { path: '/biblia', icon: '📖', label: 'Biblia' },
    { path: '/audio', icon: '🎧', label: 'Audio Biblie' },
    { path: '/devotional', icon: '🙏', label: 'Devoțional zilnic' },
    { path: '/journey', icon: '🕊️', label: 'Călătoria mea' },
    { path: '/journal', icon: '📔', label: 'Jurnal' },
    { path: '/rugaciuni', icon: '🙏', label: 'Cereri rugăciune' },
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
    { path: '/admin', icon: '🛡️', label: 'Admin Panel' },
  ];

  const closeSidebar = useCallback(() => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.classList.remove('sidebar-open');
  }, []);

  const handleNavigate = (path) => {
    router.push(path);
    closeSidebar();
  };

  useEffect(() => { closeSidebar(); }, [pathname, closeSidebar]);

  useEffect(() => {
    const overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) return;
    const handleClick = () => closeSidebar();
    overlay.addEventListener('click', handleClick);
    overlay.addEventListener('touchstart', handleClick, { passive: true });
    return () => {
      overlay.removeEventListener('click', handleClick);
      overlay.removeEventListener('touchstart', handleClick);
    };
  }, [closeSidebar]);

  // Folosim clasele din Sidebar.css: sb-nav-item, sb-active, sb-nav-icon, sb-nav-label
  const NavItem = ({ item }) => (
    <div
      className={`sb-nav-item ${pathname === item.path ? 'sb-active' : ''}`}
      onClick={() => handleNavigate(item.path)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleNavigate(item.path)}
    >
      <span className="sb-nav-icon">{item.icon}</span>
      <span className="sb-nav-label">{item.label}</span>
      {pathname === item.path && <span className="sb-nav-indicator" />}
    </div>
  );

  const NavSection = ({ title, items }) => (
    <div className="sb-section">
      <div className="sb-section-title">{title}</div>
      {items.map(item => <NavItem key={item.path} item={item} />)}
    </div>
  );

  return (
    <>
      <aside className="sidebar">
        {/* Header */}
        <div className="sb-header">
          <div className="sb-logo" onClick={() => handleNavigate('/dashboard')} role="button" tabIndex={0}>
            <span className="sb-logo-icon">🕊️</span>
            <div className="sb-logo-text">
              <div className="sb-logo-title">Popas pentru Suflet</div>
              <div className="sb-logo-sub">Content Manager</div>
            </div>
          </div>
          <button className="sb-close-btn" onClick={closeSidebar} aria-label="Închide">✕</button>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <NavSection title="Principal" items={publicItems} />
          {isAuthenticated && <NavSection title="Contul meu" items={userItems} />}
          {isAdmin && <NavSection title="Administrare" items={adminItems} />}

          {!isAuthenticated && (
            <div className="sb-auth-prompt">
              <div className="sb-auth-icon">🕊️</div>
              <div className="sb-auth-text">Creează un cont gratuit pentru funcții complete</div>
              <button className="sb-auth-btn sb-auth-btn-primary" onClick={() => handleNavigate('/register')}>
                ✅ Cont gratuit
              </button>
              <button className="sb-auth-btn sb-auth-btn-secondary" onClick={() => handleNavigate('/login')}>
                🔑 Am deja cont
              </button>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          {isAuthenticated && (
            <div className="sb-user">
              <div className="sb-user-avatar" style={{ background: 'linear-gradient(135deg, #d4af37, #b8960c)' }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.nume} className="sb-user-avatar-img" />
                ) : (
                  <span>{user?.nume?.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="sb-user-info">
                <div className="sb-user-name">{user?.nume}</div>
                <div className="sb-user-role">{isAdmin ? '👑 Administrator' : '👤 Utilizator'}</div>
              </div>
              <button
                onClick={() => { logout(); router.push('/login'); }}
                title="Deconectare"
                className="sb-logout-btn"
              >
                🚪
              </button>
            </div>
          )}
          <div className="sb-version">
            {theme === 'dark' ? '🌙' : '☀️'} v2.0 • Premium
          </div>
        </div>
      </aside>

      {/* Overlay */}
      <div className="sidebar-overlay" onClick={closeSidebar} />
    </>
  );
};

export default Sidebar;
