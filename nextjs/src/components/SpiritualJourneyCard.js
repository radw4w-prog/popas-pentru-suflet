'use client';
// frontend/src/components/SpiritualJourneyCard.js
import React, { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '';
const BADGES_KEY = 'sj_badges_cunoscute';

const SpiritualJourneyCard = () => {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [badgeNou, setBadgeNou] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadProfil = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/journey/profil`, {
        headers: getHeaders()
      });
      const data = await r.json();
      if (!data.success) return;

      // ── Detectează badge-uri noi ──
      const badgesCunoscute = JSON.parse(
        localStorage.getItem(BADGES_KEY) || '[]'
      );

      const badgesDeblocateIds = (data.badges?.deblocate || []).map(b => b.id);

      const badgeNouGasit = (data.badges?.deblocate || []).find(
        b => !badgesCunoscute.includes(b.id)
      );

      if (badgeNouGasit) {
        setBadgeNou(badgeNouGasit);
        // Salvează toate badge-urile cunoscute acum
        localStorage.setItem(BADGES_KEY, JSON.stringify(badgesDeblocateIds));
      }

      setProfil(data);
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadProfil();
  }, [loadProfil]);

  // Auto-dismiss notificare după 5 secunde
  useEffect(() => {
    if (!badgeNou) return;
    const timer = setTimeout(() => setBadgeNou(null), 5000);
    return () => clearTimeout(timer);
  }, [badgeNou]);

  if (loading) return null;
  if (!profil) return null;

  const { streak, nivel, saptamana, stats, badges } = profil;

  const ultimeleBadges = badges.deblocate.slice(-3).reverse();
  const zileVizuale = Array.from({ length: 7 }, (_, i) => i < saptamana.zileActive);

  const getMesajStreak = (zile) => {
    if (zile === 0) return 'Începe azi călătoria ta spirituală.';
    if (zile === 1) return 'Ai făcut primul pas. Continuă!';
    if (zile < 7) return 'Ești pe drumul cel bun. Rămâi statornic!';
    if (zile < 30) return 'Frumos! Rămâi statornic în Cuvânt.';
    if (zile < 100) return 'O lună de statornicie. Dumnezeu vede inima ta.';
    return 'Umblare credincioasă. Ești o binecuvântare!';
  };

  return (
    <>
      {/* ═══ BADGE NOU NOTIFICATION ═══ */}
      {badgeNou && (
        <div className="sj-badge-notif" onClick={() => setBadgeNou(null)}>
          <div className="sj-badge-notif-inner">
            <div className="sj-badge-notif-glow" />
            <div className="sj-badge-notif-icon">{badgeNou.icon}</div>
            <div className="sj-badge-notif-text">
              <div className="sj-badge-notif-title">Reper nou deblocat!</div>
              <div className="sj-badge-notif-name">{badgeNou.nume}</div>
              <div className="sj-badge-notif-desc">{badgeNou.descriere}</div>
            </div>
            <div className="sj-badge-notif-close">✕</div>
          </div>
          <div className="sj-badge-notif-timer" />
        </div>
      )}

      <div className="sj-card">

        {/* ═══ HEADER ═══ */}
        <div className="sj-header">
          <div className="sj-header-left">
            <div className="sj-header-icon">🕊️</div>
            <div>
              <div className="sj-header-title">Călătoria ta spirituală</div>
              <div className="sj-header-sub">Statornicie zi de zi</div>
            </div>
          </div>
          <div className="sj-nivel-badge">
            <span className="sj-nivel-icon">{nivel.icon}</span>
            <span className="sj-nivel-label">{nivel.label}</span>
          </div>
        </div>

        {/* ═══ STREAK ═══ */}
        <div className="sj-streak-row">
          <div className="sj-streak-main">
            <div className="sj-streak-flame">
              {streak.curent >= 7 ? '🔥' : streak.curent >= 3 ? '🕯️' : '🌱'}
            </div>
            <div className="sj-streak-info">
              <div className="sj-streak-num">{streak.curent}</div>
              <div className="sj-streak-label">
                {streak.curent === 1 ? 'zi consecutivă' : 'zile consecutive'}
              </div>
            </div>
          </div>

          <div className="sj-streak-divider" />

          <div className="sj-streak-max">
            <div className="sj-streak-max-num">👑 {streak.maxim}</div>
            <div className="sj-streak-max-label">record personal</div>
          </div>
        </div>

        <div className="sj-streak-msg">{getMesajStreak(streak.curent)}</div>

        {/* ═══ OBIECTIV SĂPTĂMÂNAL ═══ */}
        <div className="sj-week-section">
          <div className="sj-week-header">
            <span className="sj-week-title">🎯 Săptămâna aceasta</span>
            <span className="sj-week-count">
              {saptamana.zileActive}/{saptamana.obiectiv} zile
            </span>
          </div>

          <div className="sj-week-dots">
            {zileVizuale.map((activ, i) => (
              <div
                key={i}
                className={`sj-week-dot ${activ ? 'activ' : ''}`}
              />
            ))}
          </div>

          <div className="sj-week-bar">
            <div
              className="sj-week-bar-fill"
              style={{ width: `${Math.min(100, saptamana.procent)}%` }}
            />
          </div>
        </div>

        {/* ═══ NIVEL / PROGRES ═══ */}
        <div className="sj-nivel-section">
          <div className="sj-nivel-header">
            <span className="sj-nivel-current">
              {nivel.icon} {nivel.label}
            </span>
            {nivel.nivelUrmator && (
              <span className="sj-nivel-next">
                → {nivel.nivelUrmator.icon} {nivel.nivelUrmator.label}
              </span>
            )}
          </div>

          <div className="sj-nivel-bar">
            <div
              className="sj-nivel-bar-fill"
              style={{ width: `${nivel.procentSpреNivelUrmator}%` }}
            />
          </div>

          <div className="sj-nivel-puncte">
            {nivel.puncte} puncte
            {nivel.nivelUrmator && (
              <span className="sj-nivel-puncte-next">
                {' '}· {nivel.nivelUrmator.puncteNecesare - nivel.puncte} până la {nivel.nivelUrmator.label}
              </span>
            )}
          </div>
        </div>

        {/* ═══ STATISTICI ═══ */}
        <div className="sj-stats-grid">
          <div className="sj-stat-item">
            <span className="sj-stat-icon">📖</span>
            <span className="sj-stat-num">{stats.capitoleCitite}</span>
            <span className="sj-stat-label">capitole citite</span>
          </div>
          <div className="sj-stat-item">
            <span className="sj-stat-icon">🎧</span>
            <span className="sj-stat-num">{stats.capitoleAscultate}</span>
            <span className="sj-stat-label">capitole audio</span>
          </div>
          <div className="sj-stat-item">
            <span className="sj-stat-icon">🌅</span>
            <span className="sj-stat-num">{stats.devotionaleParcurse}</span>
            <span className="sj-stat-label">devoționale</span>
          </div>
          <div className="sj-stat-item">
            <span className="sj-stat-icon">🙏</span>
            <span className="sj-stat-num">{stats.rugaciuniInteractionate}</span>
            <span className="sj-stat-label">rugăciuni</span>
          </div>
        </div>

        {/* ═══ BADGE-URI ═══ */}
        {ultimeleBadges.length > 0 && (
          <div className="sj-badges-section">
            <div className="sj-badges-title">
              🏆 Repere spirituale
              <span className="sj-badges-count">
                {badges.total}/{badges.disponibile}
              </span>
            </div>
            <div className="sj-badges-row">
              {ultimeleBadges.map(b => (
                <div key={b.id} className="sj-badge-item" title={b.descriere}>
                  <div className="sj-badge-icon">{b.icon}</div>
                  <div className="sj-badge-name">{b.nume}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ FOOTER ═══ */}
        <div className="sj-footer">
          <span className="sj-footer-total">
            📅 {profil.totalZileActive} zile active în total
          </span>
        </div>

      </div>
    </>
  );
};

export default SpiritualJourneyCard;