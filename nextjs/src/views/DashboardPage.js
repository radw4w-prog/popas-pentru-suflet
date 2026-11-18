'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useDashboardResources, {dashboardResources} from '../hooks/useDashboardResources';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import SpiritualJourneyCard from '../components/SpiritualJourneyCard';

function ResourceNotice({resourceKey, item, reload}) {
  const resource = dashboardResources[resourceKey];
  const pending = !item || item.loading;
  if (!pending && !item.error) return null;
  return <div className="dash-resource-notice" aria-busy={pending}>
    <p role="status" aria-live="polite" style={{margin: 0}}>
      <strong>{resource.label}: </strong>
      {pending ? (item?.data ? 'Se actualizează…' : 'Se încarcă…') : item.error.message}
      {!pending && item?.data && ' Conținutul afișat provine din ultima încărcare reușită.'}
    </p>
    {!pending && (item.error.kind === 'session'
      ? <Link className="dash-resource-retry" href="/login">Autentifică-te</Link>
      : item.error.kind !== 'permission' && <button className="dash-resource-retry" type="button" onClick={() => reload(resourceKey)}>Reîncearcă</button>)}
  </div>;
}

const DashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const {items, reload} = useDashboardResources(isAuthenticated, user);
  const verset = items.verse?.data?.verset;
  const gandZilei = items.thought?.data?.gand;
  const rugaciune = items.thought?.data?.rugaciune;
  const todayPlan = items.plan?.data;
  const readingProgress = items.progress?.data;
  const [showFullRug, setShowFullRug] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [shareFallback, setShareFallback] = useState('');
  const shareDailyVerse = async () => {
    if (!verset) return;
    const text = `„${verset.text}”\n— ${verset.carte} ${verset.capitol}:${verset.verset}\n\nPopas pentru Suflet`;
    const url = 'https://popas-pentru-suflet.vercel.app/';
    setShareStatus(''); setShareFallback('');
    if (typeof navigator.share === 'function') {
      try { await navigator.share({title: 'Versetul zilei', text, url}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareStatus('Verset copiat! Îl poți trimite celor dragi.');
    } catch {
      setShareFallback(`${text}\n${url}`);
      setShareStatus('Selectează și copiază textul de mai jos.');
    }
  };

  // Redirecționează vizitatorii neautentificați la landing
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('token')) {
      router.replace('/landing');
    }
  }, [isAuthenticated, router]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bună dimineața';
    if (h < 18) return 'Bună ziua';
    return 'Bună seara';
  };

  const userName = isAuthenticated ? (user?.nume || 'prietene') : '';

  return (
    <div className="animate-in dashboard-page">
      {/* Stiluri hero livrate prin JS (ca pe landing) — se actualizează
          și la navigare în aplicație, nu doar la reload complet */}
      <style>{`
        .dashboard-page .dash-resource-notice { margin: 1rem 0; padding: 1rem; border: 1px solid var(--border-color); border-radius: 14px; background: var(--bg-card); color: var(--text-primary); line-height: 1.6; }
        .dashboard-page .dash-resource-retry { display: inline-flex; align-items: center; min-height: 44px; margin-top: .6rem; padding: .5rem 1rem; border: 1px solid var(--gold-primary); border-radius: 12px; background: var(--gold-subtle); color: var(--text-primary); font: inherit; cursor: pointer; text-decoration: none; }

        .dashboard-page .dash-hero { border-radius: 28px !important; box-shadow: 0 16px 48px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(212,175,55,0.12) !important; }
        [data-theme="light"] .dashboard-page .dash-hero { box-shadow: 0 10px 32px rgba(90,70,20,0.14), inset 0 0 0 1px rgba(184,134,11,0.14) !important; }
        .dashboard-page .dash-hero:before { height: 5px !important; }
        .dashboard-page .dash-hero-content { padding: 2.5rem 2rem !important; }
        .dashboard-page .dash-verset { position: relative; padding: 0.5rem 1.5rem !important; }
        .dashboard-page .dash-verset:before { content: '❝'; position: absolute; top: -1.4rem; left: 50%; transform: translateX(-50%); font-family: 'Playfair Display', serif; font-size: 4.5rem; line-height: 1; color: var(--gold-primary); opacity: 0.18; pointer-events: none; }
        .dashboard-page .dash-verset-text { font-size: 1.5rem !important; line-height: 1.9 !important; max-width: 720px; margin: 0 auto !important; }
        .dashboard-page .dash-verset-deco { width: 110px !important; height: 3px !important; border-radius: 3px; }
        .dashboard-page .dash-verset-ref { display: inline-block !important; margin-top: 1rem !important; padding: 0.35rem 1.1rem; border-radius: 999px; background: var(--gold-subtle); border: 1px solid var(--border-color); font-size: 0.95rem !important; }
        .dashboard-page .dash-greeting-text { font-size: 1.8rem !important; }
        .dashboard-page .dash-greeting-icon { font-size: 3.2rem !important; }
      `}</style>

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

          <ResourceNotice resourceKey="verse" item={items.verse} reload={reload} />
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
              <button type="button" onClick={shareDailyVerse} style={{display: 'block', margin: '1rem auto', minHeight: 44, padding: '.65rem 1.2rem', border: '1px solid var(--gold-primary)', borderRadius: 999, background: 'var(--gold-subtle)', color: 'var(--text-primary)', font: 'inherit', cursor: 'pointer'}}>
                <span aria-hidden="true">📤 </span>Distribuie versetul
              </button>
              <p role="status" aria-live="polite" style={{color: 'var(--text-primary)', fontSize: '.9rem'}}>{shareStatus}</p>
              {shareFallback && <textarea aria-label="Verset de copiat manual" readOnly value={shareFallback} onFocus={event => event.target.select()} style={{width: '100%', minHeight: 150, padding: '.8rem', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 12}} />}
              <div className="dash-verset-deco" />
            </div>
          )}
        </div>
      </div>





     <ResourceNotice resourceKey="thought" item={items.thought} reload={reload} />
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
          onClick={() => router.push('/biblia')}>
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

      {isAuthenticated && <>
        <ResourceNotice resourceKey="plan" item={items.plan} reload={reload} />
        <ResourceNotice resourceKey="progress" item={items.progress} reload={reload} />
      </>}
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

      {isAuthenticated && todayPlan && todayPlan.capitole.length === 0 && (
        <div className="dash-card" style={{padding: '1.25rem'}}>
          <h2 style={{fontSize: '1.15rem'}}>Planul de citire</h2>
          <p>Nu sunt capitole programate pentru azi. Vezi planul și opțiunile de lectură.</p>
          <Link className="dash-resource-retry" href="/reading">Deschide planul</Link>
        </div>
      )}

      {/* Progresul detaliat vine după conținutul zilei și planul de citire. */}
      {isAuthenticated && <SpiritualJourneyCard />}

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
        <div style={{ marginTop: '0.4rem', color: 'var(--gold-primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          ✨ DESIGN NOU v14 — ROYAL ✨
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;