'use client';
import React, {useState, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useAuth} from '../context/AuthContext';
import {navigationGroups, isNavActive} from '../lib/navigation';
import '../styles/BottomNav.css';

export default function BottomNav() {
  const pathname = usePathname();
  const {isAuthenticated, isAdmin} = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {setMounted(true);}, []);
  useEffect(() => {setOpen(false);}, [pathname]);
  useEffect(() => {
    if (!mounted || !dialog.current) return;
    if (open) dialog.current.showModal();
    else if (dialog.current.open) dialog.current.close();
  }, [open, mounted]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const media = window.matchMedia('(min-width: 769px)');
    const closeOnDesktop = () => {if (media.matches) setOpen(false);};
    media.addEventListener('change', closeOnDesktop);
    return () => {document.body.style.overflow = previous; media.removeEventListener('change', closeOnDesktop);};
  }, [open]);
  const mainItems = [
    {path: isAuthenticated ? '/dashboard' : '/landing', icon: '🏠', label: 'Acasă'},
    {path: '/biblia', icon: '📖', label: 'Biblia'},
    {path: '/devotional', icon: '🙏', label: 'Devoțional'},
    {path: isAuthenticated ? '/spatiul-meu' : '/login', icon: '👤', label: isAuthenticated ? 'Spațiul meu' : 'Contul meu'},
  ];
  const personalPaths = navigationGroups(true, false).find(g => g.title === 'Spațiul meu').items.map(i => i.path);
  const active = item => item.path === '/spatiul-meu' ? personalPaths.some(path => isNavActive(pathname, path)) : isNavActive(pathname, item.path);
  return <>
    {mounted && createPortal(<dialog ref={dialog} id="mobile-navigation" aria-labelledby="mobile-navigation-title"
      onCancel={() => setOpen(false)} onClose={() => {setOpen(false); trigger.current?.focus();}}
      onClick={event => {if (event.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) setOpen(false); }}}
      style={{width: 'min(94vw, 520px)', maxHeight: '78dvh', overflowY: 'auto', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 22, background: 'var(--bg-card)', color: 'var(--text-primary)'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
        <h2 id="mobile-navigation-title" style={{fontSize: '1.25rem'}}>Toate paginile</h2>
        <button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Închide meniul" style={{minWidth: 44, minHeight: 44, background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: 12}}>✕</button>
      </div>
      {navigationGroups(isAuthenticated, isAdmin).map(group => <section key={group.title} style={{marginTop: '1.25rem'}}>
        <h3 style={{fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-secondary)'}}>{group.title}</h3>
        {group.items.map(item => <Link key={item.path} href={item.path} onClick={() => setOpen(false)} aria-current={isNavActive(pathname, item.path) ? 'page' : undefined}
          style={{display: 'flex', gap: 12, alignItems: 'center', minHeight: 48, padding: '.65rem', borderRadius: 10, textDecoration: 'none', color: 'var(--text-primary)', background: isNavActive(pathname, item.path) ? 'var(--gold-subtle)' : 'transparent'}}>
          <span aria-hidden="true">{item.icon}</span>{item.label}
        </Link>)}
      </section>)}
      {!isAuthenticated && <p><Link href="/login" onClick={() => setOpen(false)}>Autentificare</Link> · <Link href="/register" onClick={() => setOpen(false)}>Cont gratuit</Link></p>}
    </dialog>, document.body)}
    <nav className="bn-bar" aria-label="Navigare mobilă"><div className="bn-inner">
      {mainItems.map(item => <Link key={item.path} href={item.path} aria-current={active(item) ? 'page' : undefined} className={`bn-item ${active(item) ? 'bn-active' : ''}`} style={{textDecoration: 'none', minHeight: 44}}>
        <span className="bn-icon" aria-hidden="true">{item.icon}</span><span className="bn-label">{item.label}</span>
      </Link>)}
      <button type="button" ref={trigger} aria-haspopup="dialog" aria-controls="mobile-navigation" aria-expanded={open} onClick={() => setOpen(true)} className={`bn-item ${open ? 'bn-active' : ''}`} style={{minHeight: 44}}>
        <span className="bn-icon" aria-hidden="true">⋯</span><span className="bn-label">Mai mult</span>
      </button>
    </div></nav>
  </>;
}
