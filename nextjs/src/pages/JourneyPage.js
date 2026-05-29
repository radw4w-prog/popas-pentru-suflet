'use client';
// frontend/src/pages/JourneyPage.js
import React, { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORII_BADGES = [
  { id: 'toate', label: '✨ Toate' },
  { id: 'statornicie', label: '🔥 Statornicie' },
  { id: 'biblie', label: '📖 Biblie' },
  { id: 'audio', label: '🎧 Audio' },
  { id: 'devotional', label: '🌅 Devoțional' },
  { id: 'rugaciune', label: '🙏 Rugăciune' }
];

const JourneyPage = () => {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categorieActiva, setCategorieActiva] = useState('toate');
  const [tabActiv, setTabActiv] = useState('overview');

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
      if (data.success) setProfil(data);
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadProfil();
  }, [loadProfil]);

  if (loading) {
    return (
      <div className="jp-loading">
        <div className="jp-loading-icon">🕊️</div>
        <div className="jp-loading-text">Se încarcă călătoria ta...</div>
      </div>
    );
  }

  if (!profil) return null;

  const { streak, nivel, saptamana, stats, badges, totalZileActive } = profil;

  // Badge-uri filtrate
  const badgesFiltrate = categorieActiva === 'toate'
    ? badges.toate
    : badges.toate.filter(b => b.categorie === categorieActiva);

  const badgeDeblocate = badgesFiltrate.filter(b => b.deblocat);
  const badgeLocked = badgesFiltrate.filter(b => !b.deblocat);

  // Progres spre nivelul următor
  const procentNivel = nivel.procentSpреNivelUrmator || 0;

  const getMesajStreak = (zile) => {
    if (zile === 0) return 'Începe azi călătoria ta spirituală.';
    if (zile === 1) return 'Ai făcut primul pas. Continuă!';
    if (zile < 7) return 'Ești pe drumul cel bun. Rămâi statornic!';
    if (zile < 30) return 'Frumos! Rămâi statornic în Cuvânt.';
    if (zile < 100) return 'O lună de statornicie. Dumnezeu vede inima ta.';
    return 'Umblare credincioasă. Ești o binecuvântare!';
  };

  return (
    <div className="jp-page">

      {/* ═══ HERO ═══ */}
      <div className="jp-hero">
        <div className="jp-hero-bg" />
        <div className="jp-hero-content">
          <div className="jp-hero-icon">🕊️</div>
          <h1 className="jp-hero-title">Călătoria ta spirituală</h1>
          <p className="jp-hero-sub">Statornicie zi de zi în Cuvântul lui Dumnezeu</p>

          {/* Nivel curent */}
          <div className="jp-nivel-hero">
            <span className="jp-nivel-hero-icon">{nivel.icon}</span>
            <span className="jp-nivel-hero-label">{nivel.label}</span>
          </div>

          {/* Streak mare */}
          <div className="jp-streak-hero">
            <div className="jp-streak-hero-num">
              {streak.curent >= 7 ? '🔥' : streak.curent >= 3 ? '🕯️' : '🌱'}
              {streak.curent}
            </div>
            <div className="jp-streak-hero-label">
              {streak.curent === 1 ? 'zi consecutivă' : 'zile consecutive'}
            </div>
            <div className="jp-streak-hero-msg">
              {getMesajStreak(streak.curent)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="jp-tabs">
        {[
          { id: 'overview', label: '📊 Prezentare' },
          { id: 'badges', label: '🏆 Repere' },
          { id: 'stats', label: '📈 Statistici' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`jp-tab ${tabActiv === tab.id ? 'activ' : ''}`}
            onClick={() => setTabActiv(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: OVERVIEW ═══ */}
      {tabActiv === 'overview' && (
        <div className="jp-content">

          {/* Streak + Record */}
          <div className="jp-card">
            <div className="jp-card-title">🔥 Statornicie</div>
            <div className="jp-streak-row">
              <div className="jp-streak-item">
                <div className="jp-streak-num jp-gold">
                  {streak.curent}
                </div>
                <div className="jp-streak-sub">zile consecutive</div>
              </div>
              <div className="jp-streak-divider" />
              <div className="jp-streak-item">
                <div className="jp-streak-num">
                  {streak.maxim}
                </div>
                <div className="jp-streak-sub">👑 record personal</div>
              </div>
              <div className="jp-streak-divider" />
              <div className="jp-streak-item">
                <div className="jp-streak-num">
                  {totalZileActive}
                </div>
                <div className="jp-streak-sub">📅 total zile active</div>
              </div>
            </div>
          </div>

          {/* Obiectiv săptămânal */}
          <div className="jp-card">
            <div className="jp-card-title">🎯 Obiectiv săptămânal</div>
            <div className="jp-week-info">
              <span className="jp-week-count">
                {saptamana.zileActive} / {saptamana.obiectiv} zile
              </span>
              <span className="jp-week-pct">
                {Math.min(100, saptamana.procent)}%
              </span>
            </div>
            <div className="jp-week-dots">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className={`jp-week-dot ${i < saptamana.zileActive ? 'activ' : ''}`}
                >
                  {i < saptamana.zileActive ? '✓' : ''}
                </div>
              ))}
            </div>
            <div className="jp-week-bar">
              <div
                className="jp-week-bar-fill"
                style={{ width: `${Math.min(100, saptamana.procent)}%` }}
              />
            </div>
            {saptamana.zileActive >= saptamana.obiectiv && (
              <div className="jp-week-done">
                ✅ Obiectiv săptămânal atins! Slavă Domnului!
              </div>
            )}
          </div>

          {/* Nivel / Progres */}
          <div className="jp-card">
            <div className="jp-card-title">⭐ Etapa călătoriei</div>
            <div className="jp-nivel-row">
              <div className="jp-nivel-current">
                <span className="jp-nivel-icon-lg">{nivel.icon}</span>
                <div>
                  <div className="jp-nivel-name">{nivel.label}</div>
                  <div className="jp-nivel-puncte">{nivel.puncte} puncte</div>
                </div>
              </div>
              {nivel.nivelUrmator && (
                <div className="jp-nivel-arrow">
                  <div className="jp-nivel-arrow-line" />
                  <div className="jp-nivel-next-info">
                    <span>{nivel.nivelUrmator.icon}</span>
                    <span className="jp-nivel-next-name">
                      {nivel.nivelUrmator.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="jp-nivel-bar">
              <div
                className="jp-nivel-bar-fill"
                style={{ width: `${procentNivel}%` }}
              />
            </div>

            {nivel.nivelUrmator ? (
              <div className="jp-nivel-sub">
                Mai ai nevoie de{' '}
                <strong>
                  {nivel.nivelUrmator.puncteNecesare - nivel.puncte} puncte
                </strong>{' '}
                pentru a ajunge la {nivel.nivelUrmator.label}
              </div>
            ) : (
              <div className="jp-nivel-sub jp-gold">
                ✨ Ai atins cel mai înalt nivel. Umblare credincioasă!
              </div>
            )}
          </div>

          {/* Ultimele repere */}
          {badges.deblocate.length > 0 && (
            <div className="jp-card">
              <div className="jp-card-title">
                🏆 Ultimele repere
                <button
                  className="jp-card-link"
                  onClick={() => setTabActiv('badges')}
                >
                  Vezi toate →
                </button>
              </div>
              <div className="jp-badges-preview">
                {badges.deblocate.slice(-4).reverse().map(b => (
                  <div key={b.id} className="jp-badge-preview-item">
                    <div className="jp-badge-preview-icon">{b.icon}</div>
                    <div className="jp-badge-preview-name">{b.nume}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═══ TAB: BADGES ═══ */}
      {tabActiv === 'badges' && (
        <div className="jp-content">

          {/* Progres general */}
          <div className="jp-badges-progress-card">
            <div className="jp-badges-progress-text">
              <span className="jp-badges-progress-num">
                {badges.total}
              </span>
              <span className="jp-badges-progress-slash">/</span>
              <span className="jp-badges-progress-total">
                {badges.disponibile}
              </span>
              <span className="jp-badges-progress-label">
                repere deblocate
              </span>
            </div>
            <div className="jp-badges-progress-bar">
              <div
                className="jp-badges-progress-fill"
                style={{
                  width: `${Math.round((badges.total / badges.disponibile) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Filtre categorii */}
          <div className="jp-categorii">
            {CATEGORII_BADGES.map(cat => (
              <button
                key={cat.id}
                className={`jp-cat-btn ${categorieActiva === cat.id ? 'activ' : ''}`}
                onClick={() => setCategorieActiva(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Badge-uri deblocate */}
          {badgeDeblocate.length > 0 && (
            <div className="jp-badges-section">
              <div className="jp-badges-section-title">
                ✅ Deblocate ({badgeDeblocate.length})
              </div>
              <div className="jp-badges-grid">
                {badgeDeblocate.map(b => (
                  <div key={b.id} className="jp-badge-card jp-badge-deblocat">
                    <div className="jp-badge-card-glow" />
                    <div className="jp-badge-card-icon">{b.icon}</div>
                    <div className="jp-badge-card-name">{b.nume}</div>
                    <div className="jp-badge-card-desc">{b.descriere}</div>
                    {b.deblocatLa && (
                      <div className="jp-badge-card-data">
                        {new Date(b.deblocatLa).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badge-uri locked */}
          {badgeLocked.length > 0 && (
            <div className="jp-badges-section">
              <div className="jp-badges-section-title">
                🔒 Încă nedeblocate ({badgeLocked.length})
              </div>
              <div className="jp-badges-grid">
                {badgeLocked.map(b => (
                  <div key={b.id} className="jp-badge-card jp-badge-locked">
                    <div className="jp-badge-card-icon jp-badge-locked-icon">
                      🔒
                    </div>
                    <div className="jp-badge-card-name jp-badge-locked-name">
                      {b.nume}
                    </div>
                    <div className="jp-badge-card-desc">{b.descriere}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═══ TAB: STATISTICI ═══ */}
      {tabActiv === 'stats' && (
        <div className="jp-content">

          <div className="jp-stats-cards">

            <div className="jp-stat-card">
              <div className="jp-stat-card-icon">📖</div>
              <div className="jp-stat-card-num">{stats.capitoleCitite}</div>
              <div className="jp-stat-card-label">Capitole citite</div>
              <div className="jp-stat-card-bar">
                <div
                  className="jp-stat-card-fill jp-fill-blue"
                  style={{
                    width: `${Math.min(100, (stats.capitoleCitite / 1189) * 100)}%`
                  }}
                />
              </div>
              <div className="jp-stat-card-sub">
                {Math.round((stats.capitoleCitite / 1189) * 100)}% din Biblie
              </div>
            </div>

            <div className="jp-stat-card">
              <div className="jp-stat-card-icon">🎧</div>
              <div className="jp-stat-card-num">{stats.capitoleAscultate}</div>
              <div className="jp-stat-card-label">Capitole ascultate</div>
              <div className="jp-stat-card-bar">
                <div
                  className="jp-stat-card-fill jp-fill-purple"
                  style={{
                    width: `${Math.min(100, (stats.capitoleAscultate / 1189) * 100)}%`
                  }}
                />
              </div>
              <div className="jp-stat-card-sub">
                {Math.round((stats.capitoleAscultate / 1189) * 100)}% din Biblie
              </div>
            </div>

            <div className="jp-stat-card">
              <div className="jp-stat-card-icon">🌅</div>
              <div className="jp-stat-card-num">{stats.devotionaleParcurse}</div>
              <div className="jp-stat-card-label">Devoționale parcurse</div>
              <div className="jp-stat-card-bar">
                <div
                  className="jp-stat-card-fill jp-fill-gold"
                  style={{
                    width: `${Math.min(100, (stats.devotionaleParcurse / 365) * 100)}%`
                  }}
                />
              </div>
              <div className="jp-stat-card-sub">
                {Math.round((stats.devotionaleParcurse / 365) * 100)}% din an
              </div>
            </div>

            <div className="jp-stat-card">
              <div className="jp-stat-card-icon">🙏</div>
              <div className="jp-stat-card-num">{stats.rugaciuniInteractionate}</div>
              <div className="jp-stat-card-label">Rugăciuni</div>
              <div className="jp-stat-card-bar">
                <div
                  className="jp-stat-card-fill jp-fill-green"
                  style={{
                    width: `${Math.min(100, (stats.rugaciuniInteractionate / 100) * 100)}%`
                  }}
                />
              </div>
              <div className="jp-stat-card-sub">
                din 100 obiectiv
              </div>
            </div>

          </div>

          {/* Sumar general */}
          <div className="jp-card jp-sumar">
            <div className="jp-card-title">📊 Sumar general</div>
            <div className="jp-sumar-row">
              <span>Zile active total</span>
              <span className="jp-sumar-val">{totalZileActive}</span>
            </div>
            <div className="jp-sumar-row">
              <span>Streak curent</span>
              <span className="jp-sumar-val">🔥 {streak.curent} zile</span>
            </div>
            <div className="jp-sumar-row">
              <span>Record personal</span>
              <span className="jp-sumar-val">👑 {streak.maxim} zile</span>
            </div>
            <div className="jp-sumar-row">
              <span>Repere deblocate</span>
              <span className="jp-sumar-val">
                🏆 {badges.total}/{badges.disponibile}
              </span>
            </div>
            <div className="jp-sumar-row">
              <span>Puncte acumulate</span>
              <span className="jp-sumar-val">⭐ {nivel.puncte}</span>
            </div>
            <div className="jp-sumar-row">
              <span>Etapa curentă</span>
              <span className="jp-sumar-val">
                {nivel.icon} {nivel.label}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default JourneyPage;