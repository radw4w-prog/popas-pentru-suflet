'use client';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import SpiritualJourneyCard from '../components/SpiritualJourneyCard';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const DashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const [verset, setVerset] = useState(null);
  const [gandZilei, setGandZilei] = useState(null);
  const [rugaciune, setRugaciune] = useState(null);
  const [todayPlan, setTodayPlan] = useState(null);
  const [readingProgress, setReadingProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullRug, setShowFullRug] = useState(false);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const headers = { headers: getHeaders() };

        const [versetR, gandR] = await Promise.all([
          axios.get(`${API}/api/verses/versetul-zilei`).catch(() => null),
          axios.get(`${API}/api/verses/gandul-zilei`).catch(() => null)
        ]);

        if (versetR?.data?.success) setVerset(versetR.data.verset);
        if (gandR?.data?.success) {
          setGandZilei(gandR.data.gand);
          setRugaciune(gandR.data.rugaciune);
        }

        if (isAuthenticated) {
          const [todayR, progressR] = await Promise.all([
            axios.get(`${API}/api/reading/today`, headers).catch(() => null),
            axios.get(`${API}/api/reading/progress`, headers).catch(() => null)
          ]);
          if (todayR?.data?.success) setTodayPlan(todayR.data);
          if (progressR?.data?.success) setReadingProgress(progressR.data);
        }
      } catch (e) {
        console.error('Dashboard error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, getHeaders]);

  // Refresh verset la 30 min
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const r = await axios.get(`${API}/api/verses/versetul-zilei`);
        if (r.data?.success) setVerset(r.data.verset);
      } catch (e) {}
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bună dimineața';
    if (h < 18) return 'Bună ziua';
    return 'Bună seara';
  };

  const userName = isAuthenticated ? (user?.nume || 'prietene') : '';

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '70vh', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ fontSize: '4rem' }}>🕊️</div>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-in dashboard-page">

      {/* ═══ HERO ═══ */}
      <div className="dash-hero">
        <div className="dash-hero-bg" />
        <div className="dash-hero-content">

          {/* Greeting */}
          <div className="dash-greeting">
            <span className="dash-greeting-icon">🕊️</span>
            <div>
              <h1 className="dash-greeting-text">
                {getGreeting()}{userName ? ', ' : ''}
                {userName && <span className="dash-name">{userName}</span>}
              </h1>
              <p className="dash-greeting-sub">
                {new Date().toLocaleDateString('ro-RO', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </p>
            </div>
          </div>

          {/* Verset de încurajare */}
          {verset && (
            <div className="dash-verset">
              <div className="dash-verset-label">✦ Versetul zilei ✦</div>
              <div className="dash-verset-deco" />
              <blockquote className="dash-verset-text">
                „{verset.text}"
              </blockquote>
              <cite className="dash-verset-ref">
                — {verset.carte} {verset.capitol}:{verset.verset}
              </cite>
              <div className="dash-verset-deco" />
            </div>
          )}
        </div>
      </div>

{/* ═══ CĂLĂTORIA SPIRITUALĂ ═══ */}
{isAuthenticated && <SpiritualJourneyCard />}



     {/* ═══ GÂNDUL ZILEI ═══ */}
{gandZilei && (
  <div className="dash-card dash-gand">
    <div className="dash-gand-icon">💭</div>
    <div className="dash-gand-label">Gândul zilei</div>
    <p className="dash-gand-text">{gandZilei.text}</p>
    <span className="dash-gand-tema">#{gandZilei.tema}</span>
    <button
      className="ds-mini-share-btn"
      onClick={() => {
        const text = encodeURIComponent(
          `💭 ${gandZilei.text}\n\n📖 Devoțional zilnic pe: https://popas-pentru-suflet.vercel.app/devotional`
        );
        if (navigator.share) {
          navigator.share({
            title: 'Gândul zilei — Popas pentru Suflet',
            text: gandZilei.text,
            url: 'https://popas-pentru-suflet.vercel.app/devotional'
          }).catch(() => {});
        } else {
          window.open(`https://wa.me/?text=${text}`, '_blank');
        }
      }}
    >
      📤 Distribuie gândul
    </button>
  </div>
)}

      {/* ═══ RUGĂCIUNEA ZILEI ═══ */}
      {rugaciune && (
        <div className="dash-card dash-rugaciune">
          <div className="dash-rug-header">
            <div>
              <span className="dash-rug-icon">🙏</span>
              <span className="dash-rug-label">Rugăciunea zilei</span>
            </div>
            <span className="dash-rug-tema">{rugaciune.titlu}</span>
          </div>

          <p className="dash-rug-text" style={{
            maxHeight: showFullRug ? 'none' : '4.5em',
            overflow: 'hidden'
          }}>
            {rugaciune.text}
          </p>

          <button
            className="dash-rug-toggle"
            onClick={() => setShowFullRug(!showFullRug)}
          >
            {showFullRug ? 'Ascunde △' : 'Citește rugăciunea ▽'}
          </button>
        </div>
      )}

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="dash-actions">
        <button className="dash-action-btn dash-action-primary"
          onClick={() => router.push('/verses')}>
          <span className="dash-action-icon">📖</span>
          <span className="dash-action-label">Biblia</span>
          <span className="dash-action-sub">31.102 versete</span>
        </button>

        <button className="dash-action-btn dash-action-secondary"
          onClick={() => router.push(isAuthenticated ? '/reading' : '/register')}>
          <span className="dash-action-icon">📗</span>
          <span className="dash-action-label">Plan Citire</span>
          <span className="dash-action-sub">Citește zilnic</span>
        </button>

        <button className="dash-action-btn dash-action-tertiary"
          onClick={() => router.push('/generate')}>
          <span className="dash-action-icon">✨</span>
          <span className="dash-action-label">Creează</span>
          <span className="dash-action-sub">Imagini cu versete</span>
        </button>

        {isAdmin && (
          <button className="dash-action-btn dash-action-admin"
            onClick={() => router.push('/analytics')}>
            <span className="dash-action-icon">📊</span>
            <span className="dash-action-label">Analytics</span>
            <span className="dash-action-sub">Statistici FB</span>
          </button>
        )}
      </div>

      {/* ═══ PLAN CITIRE AZI ═══ */}
      {isAuthenticated && todayPlan && todayPlan.capitole?.length > 0 && (
        <div className="dash-card dash-reading">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span>📖</span> Planul tău de azi
            </div>
            {todayPlan.ziuaCurenta && (
              <span className="dash-badge">Ziua {todayPlan.ziuaCurenta}</span>
            )}
          </div>

          <div className="dash-reading-list">
            {todayPlan.capitole.map((cap, idx) => (
              <button key={idx}
                className={`dash-reading-item ${cap.citit ? 'citit' : ''}`}
                onClick={() => router.push('/reading')}>
                <span className="dash-reading-check">
                  {cap.citit ? '✓' : '○'}
                </span>
                <span className="dash-reading-name">
                  {cap.carte} {cap.capitol}
                </span>
                <span className="dash-reading-arrow">→</span>
              </button>
            ))}
          </div>

          {readingProgress && (
            <div className="dash-reading-progress">
              <div className="dash-progress-info">
                <span>Progres total</span>
                <span className="dash-progress-pct">
                  {readingProgress.procent}%
                </span>
              </div>
              <div className="dash-progress-bar">
                <div className="dash-progress-fill"
                  style={{ width: `${readingProgress.procent}%` }} />
              </div>
              <div className="dash-progress-sub">
                {readingProgress.capitoleCitite} din 1.189 capitole
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ PROMPT REGISTER ═══ */}
      {!isAuthenticated && (
        <div className="dash-card dash-register-prompt">
          <div className="dash-register-icon">🕊️</div>
          <h3 className="dash-register-title">
            Alătură-te comunității
          </h3>
          <p className="dash-register-text">
            Creează un cont gratuit pentru plan personal de citire,
            rugăciuni zilnice și progres spiritual.
          </p>
          <div className="dash-register-actions">
            <button className="btn btn-gold"
              onClick={() => router.push('/register')}>
              ✅ Cont gratuit
            </button>
            <button className="btn btn-outline"
              onClick={() => router.push('/login')}>
              🔑 Am deja cont
            </button>
          </div>
        </div>
      )}

      {/* ═══ ADMIN ═══ */}
      {isAdmin && (
        <div className="dash-card dash-admin-quick">
          <div className="dash-card-header">
            <div className="dash-card-title"><span>🛡️</span> Admin</div>
          </div>
          <div className="dash-admin-grid">
            {[
              { icon: '📅', label: 'Programări', path: '/schedule' },
              { icon: '📊', label: 'Analytics', path: '/analytics' },
              { icon: '📜', label: 'Istoric', path: '/history' },
              { icon: '⚙️', label: 'Setări', path: '/settings' },
              { icon: '👥', label: 'Useri', path: '/admin' },
            ].map((item, idx) => (
              <button key={idx} className="dash-admin-btn"
                onClick={() => router.push(item.path)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <div className="dash-footer">
        🕊️ Popas pentru Suflet
      </div>
    </div>
  );
};

export default DashboardPage;