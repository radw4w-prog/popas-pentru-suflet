import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ theme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/generate', icon: '✨', label: 'Generează' },
    { path: '/schedule', icon: '📅', label: 'Programare' },
    { path: '/history', icon: '📜', label: 'Istoric' },
    { path: '/verses', icon: '📖', label: 'Versete' },
    { path: '/settings', icon: '⚙️', label: 'Setări' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🕊️</span>
          Popas pentru Suflet
        </div>
        <div className="sidebar-subtitle">Content Manager</div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => {
              navigate(item.path);
              // Închide sidebar pe mobile
              const sidebar = document.querySelector('.sidebar');
              if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('open');
              }
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">
          {theme === 'dark' ? '🌙' : '☀️'} v1.0 • Premium
        </div>
      </div>
    </div>
  );
};

export default Sidebar;