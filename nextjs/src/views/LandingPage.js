'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';

// Imagini Unsplash gratuite — natură, lumină, spiritual
const HERO_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format&fit=crop';
const FEATURE_IMAGES = [
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=70&auto=format&fit=crop', // Biblie
  'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=600&q=70&auto=format&fit=crop', // rugăciune
  'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?w=600&q=70&auto=format&fit=crop', // natură
];

export default function LandingPage() {
  const router = useRouter();
  const [verset, setVerset] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/verses/versetul-zilei`)
      .then(r => r.json())
      .then(data => { if (data.success) setVerset(data.verset); })
      .catch(() => {});
  }, []);

  const features = [
    { icon: '📖', title: 'Biblia Cornilescu', desc: '31.102 versete cu referințe încrucișate și cuvintele lui Isus cu roșu', color: '#d4af37', bg: 'rgba(212,175,55,0.12)' },
    { icon: '🙏', title: 'Devoțional zilnic', desc: 'Meditație zilnică cu verset, mesaj, rugăciune și gândul zilei', color: '#a78bfa', bg: 'rgba(124,58,237,0.12)' },
    { icon: '🎧', title: 'Audio Biblie', desc: 'Ascultă Biblia completă, cu redare continuă pe mobil', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
    { icon: '✨', title: 'Imagini cu versete', desc: 'Generează imagini pentru Instagram, Facebook și WhatsApp', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
    { icon: '📔', title: 'Jurnal spiritual', desc: 'Scrie gândurile, rugăciunile și momentele tale cu Dumnezeu', color: '#f472b6', bg: 'rgba(236,72,153,0.12)' },
    { icon: '🕊️', title: 'Călătoria spirituală', desc: 'Streak zilnic, badge-uri și statistici de citire personalizate', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&family=Lora:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .lp { font-family: 'Inter', sans-serif; color: #f0f0f0; overflow-x: hidden; }

        /* ── NAV ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(0,0,0,0.45); backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between;
        }
        .lp-logo { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; }
        .lp-logo span { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: #f4d03f; }
        .lp-nav-btns { display: flex; gap: 0.6rem; }
        .lp-btn-outline { padding: 0.5rem 1.1rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 25px; color: #fff; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
        .lp-btn-outline:hover { background: rgba(255,255,255,0.18); }
        .lp-btn-cta { padding: 0.5rem 1.1rem; background: linear-gradient(135deg, #f4d03f, #d4af37); border: none; border-radius: 25px; color: #1a0000; cursor: pointer; font-size: 0.82rem; font-weight: 700; transition: all 0.2s; }
        .lp-btn-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(244,208,63,0.4); }

        /* ── HERO ── */
        .lp-hero {
          min-height: 100vh; position: relative;
          display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 8rem 1.5rem 5rem;
        }
        .lp-hero-img {
          position: absolute; inset: 0;
          background-image: url('${HERO_IMAGE}');
          background-size: cover; background-position: center 30%;
        }
        .lp-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.55) 0%,
            rgba(0,0,0,0.4) 40%,
            rgba(0,0,0,0.75) 80%,
            rgba(0,0,0,0.95) 100%
          );
        }
        .lp-hero-content { position: relative; z-index: 2; max-width: 780px; }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(244,208,63,0.15); border: 1px solid rgba(244,208,63,0.35);
          border-radius: 25px; padding: 0.4rem 1rem;
          font-size: 0.78rem; color: #f4d03f; font-weight: 600; margin-bottom: 1.75rem;
          backdrop-filter: blur(10px);
        }
        .lp-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 700; line-height: 1.2; margin-bottom: 1.25rem;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        .lp-h1 em { color: #f4d03f; font-style: normal; }
        .lp-hero-sub {
          font-size: clamp(0.95rem, 2.5vw, 1.15rem); line-height: 1.8;
          color: rgba(255,255,255,0.85); margin-bottom: 2.5rem;
          text-shadow: 0 1px 10px rgba(0,0,0,0.5);
        }
        .lp-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3.5rem; }
        .lp-btn-main {
          padding: 1rem 2rem; background: linear-gradient(135deg, #f4d03f, #d4af37);
          border: none; border-radius: 14px; color: #1a0000; cursor: pointer;
          font-size: 1rem; font-weight: 700;
          box-shadow: 0 6px 25px rgba(244,208,63,0.4); transition: all 0.25s;
        }
        .lp-btn-main:hover { transform: translateY(-2px); box-shadow: 0 10px 35px rgba(244,208,63,0.5); }
        .lp-btn-sec {
          padding: 1rem 2rem; background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.3); border-radius: 14px;
          color: #fff; cursor: pointer; font-size: 1rem; font-weight: 600;
          backdrop-filter: blur(10px); transition: all 0.25s;
        }
        .lp-btn-sec:hover { background: rgba(255,255,255,0.2); }

        /* Verset card în hero */
        .lp-verset {
          background: rgba(0,0,0,0.45); backdrop-filter: blur(20px);
          border: 1px solid rgba(244,208,63,0.25); border-radius: 20px;
          padding: 1.5rem 2rem; max-width: 560px; margin: 0 auto;
          cursor: pointer; transition: all 0.2s;
        }
        .lp-verset:hover { border-color: rgba(244,208,63,0.5); background: rgba(0,0,0,0.55); }
        .lp-verset-label { color: #f4d03f; font-size: 0.65rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lp-verset-text { font-family: 'Lora', serif; font-style: italic; font-size: clamp(0.9rem, 2.5vw, 1.05rem); line-height: 1.85; color: #fff; margin-bottom: 0.75rem; }
        .lp-verset-ref { color: #f4d03f; font-weight: 700; font-size: 0.85rem; }

        /* Scroll indicator */
        .lp-scroll {
          position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
          z-index: 2; color: rgba(255,255,255,0.5); font-size: 0.75rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          animation: bounce 2s infinite;
        }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-6px)} }

        /* ── STATS BAR ── */
        .lp-stats-bar {
          background: linear-gradient(135deg, #1a1206, #0f0f0a);
          border-top: 1px solid rgba(212,175,55,0.2);
          border-bottom: 1px solid rgba(212,175,55,0.2);
          padding: 2.5rem 1.5rem;
        }
        .lp-stats-inner { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; max-width: 800px; margin: 0 auto; text-align: center; }
        .lp-stat-nr { font-family: 'Playfair Display', serif; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; color: #f4d03f; }
        .lp-stat-label { color: #a0a0b0; font-size: 0.8rem; margin-top: 0.25rem; }

        /* ── FEATURES ── */
        .lp-section { padding: 5.5rem 1.5rem; }
        .lp-section-dark { background: #08080d; }
        .lp-section-warm { background: linear-gradient(135deg, #0f0c04, #0a0a0f); }
        .lp-section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 700; text-align: center; margin-bottom: 0.75rem; }
        .lp-section-sub { color: #a0a0b0; text-align: center; font-size: 0.95rem; margin-bottom: 3.5rem; }
        .lp-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; max-width: 1050px; margin: 0 auto; }
        .lp-feature-card {
          border-radius: 22px; padding: 1.75rem; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
          transition: all 0.25s; position: relative; overflow: hidden;
        }
        .lp-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        .lp-feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0; transition: opacity 0.25s; }
        .lp-feature-card:hover::before { opacity: 1; }
        .lp-feature-ico { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.1rem; }
        .lp-feature-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; }
        .lp-feature-desc { color: #a0a0b0; font-size: 0.875rem; line-height: 1.75; }

        /* ── IMAGINE CENTRALĂ ── */
        .lp-showcase {
          position: relative; height: 420px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-showcase-img { position: absolute; inset: 0; background-image: url('${FEATURE_IMAGES[0]}'); background-size: cover; background-position: center; }
        .lp-showcase-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%); }
        .lp-showcase-content { position: relative; z-index: 2; padding: 2rem; max-width: 500px; }
        .lp-showcase-tag { color: #f4d03f; font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1rem; }
        .lp-showcase-title { font-family: 'Playfair Display', serif; font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 700; margin-bottom: 1rem; line-height: 1.3; }
        .lp-showcase-text { color: rgba(255,255,255,0.8); line-height: 1.8; margin-bottom: 1.5rem; font-size: 0.95rem; }

        /* ── TESTIMONIALE ── */
        .lp-testimoniale { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; max-width: 1000px; margin: 0 auto; }
        .lp-testimonial {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 2rem; transition: all 0.2s;
        }
        .lp-testimonial:hover { border-color: rgba(212,175,55,0.2); }
        .lp-t-stars { color: #f4d03f; font-size: 0.9rem; margin-bottom: 1rem; letter-spacing: 2px; }
        .lp-t-text { font-family: 'Lora', serif; font-style: italic; line-height: 1.85; color: #d0d0e0; font-size: 0.92rem; margin-bottom: 1.25rem; }
        .lp-t-autor { display: flex; align-items: center; gap: 0.75rem; }
        .lp-t-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #d4af37, #7c3aed); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0; }
        .lp-t-name { font-weight: 600; font-size: 0.88rem; }
        .lp-t-role { color: #6b6b80; font-size: 0.75rem; }

        /* ── CTA FINAL ── */
        .lp-final {
          position: relative; padding: 7rem 1.5rem; text-align: center; overflow: hidden;
        }
        .lp-final-bg { position: absolute; inset: 0; background-image: url('${FEATURE_IMAGES[1]}'); background-size: cover; background-position: center; }
        .lp-final-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.75); }
        .lp-final-content { position: relative; z-index: 2; max-width: 600px; margin: 0 auto; }
        .lp-final-icon { font-size: 4rem; margin-bottom: 1.5rem; }
        .lp-final-title { font-family: 'Playfair Display', serif; font-size: clamp(1.75rem, 5vw, 3rem); font-weight: 700; margin-bottom: 1rem; line-height: 1.2; }
        .lp-final-title em { color: #f4d03f; font-style: normal; }
        .lp-final-sub { color: rgba(255,255,255,0.8); margin-bottom: 2.5rem; line-height: 1.8; font-size: 1rem; }

        /* ── FOOTER ── */
        .lp-footer { background: #050508; border-top: 1px solid rgba(255,255,255,0.06); padding: 2.5rem 1.5rem; text-align: center; }
        .lp-footer-logo { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #f4d03f; margin-bottom: 1rem; }
        .lp-footer-links { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .lp-footer-link { color: #6b6b80; font-size: 0.82rem; cursor: pointer; transition: color 0.2s; }
        .lp-footer-link:hover { color: #f4d03f; }
        .lp-footer-copy { color: #3a3a4a; font-size: 0.75rem; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .lp-nav { padding: 0.875rem 1rem; }
          .lp-btn-outline { font-size: 0.75rem; padding: 0.4rem 0.8rem; }
          .lp-grid-3 { grid-template-columns: 1fr; }
          .lp-testimoniale { grid-template-columns: 1fr; }
          .lp-stats-inner { grid-template-columns: repeat(2,1fr); }
          .lp-cta { flex-direction: column; align-items: center; }
          .lp-btn-main, .lp-btn-sec { width: 100%; max-width: 300px; }
          .lp-showcase { height: auto; flex-direction: column; }
          .lp-showcase-img { position: relative; height: 220px; width: 100%; }
          .lp-showcase-overlay { display: none; }
          .lp-showcase-content { background: #08080d; padding: 1.75rem 1.25rem; max-width: 100%; }
          .lp-section { padding: 3.5rem 1rem; }
          .lp-final { padding: 5rem 1rem; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .lp-grid-3 { grid-template-columns: repeat(2,1fr); }
          .lp-testimoniale { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      <div className="lp">

        {/* ══ NAVBAR ══ */}
        <nav className="lp-nav">
          <div className="lp-logo" onClick={() => router.push('/')}>
            <span style={{ fontSize: '1.4rem' }}>🕊️</span>
            <span>Popas pentru Suflet</span>
          </div>
          <div className="lp-nav-btns">
            <button className="lp-btn-outline" onClick={() => router.push('/login')}>Autentificare</button>
            <button className="lp-btn-cta" onClick={() => router.push('/register')}>✅ Cont gratuit</button>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <section className="lp-hero">
          <div className="lp-hero-img" />
          <div className="lp-hero-overlay" />

          <div className="lp-hero-content">
            <div className="lp-badge">🕊️ Aplicație creștină gratuită în limba română</div>

            <h1 className="lp-h1">
              Un loc de <em>odihnă</em><br />și <em>hrană</em> pentru suflet
            </h1>

            <p className="lp-hero-sub">
              Biblia Cornilescu completă, devoțional zilnic generat cu AI,
              rugăciuni și imagini cu versete — totul gratuit.
            </p>

            <div className="lp-cta">
              <button className="lp-btn-main" onClick={() => router.push('/register')}>
                ✅ Creează cont gratuit
              </button>
              <button className="lp-btn-sec" onClick={() => router.push('/dashboard')}>
                📖 Explorează aplicația
              </button>
            </div>

            {verset && (
              <div className="lp-verset" onClick={() => router.push('/dashboard')}>
                <div className="lp-verset-label">✦ Versetul zilei ✦</div>
                <p className="lp-verset-text">„{verset.text}"</p>
                <div className="lp-verset-ref">— {verset.carte} {verset.capitol}:{verset.verset}</div>
              </div>
            )}
          </div>

          <div className="lp-scroll">
            <span>Descoperă mai mult</span>
            <span>↓</span>
          </div>
        </section>

        {/* ══ STATS BAR ══ */}
        <div className="lp-stats-bar">
          <div className="lp-stats-inner">
            {[
              { nr: '31.102', label: 'versete biblice' },
              { nr: '66', label: 'cărți ale Bibliei' },
              { nr: '100%', label: 'complet gratuit' },
              { nr: '∞', label: 'devoționale zilnice' },
            ].map((s, i) => (
              <div key={i}>
                <div className="lp-stat-nr">{s.nr}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FEATURES ══ */}
        <section className="lp-section lp-section-dark">
          <h2 className="lp-section-title">
            Tot ce ai nevoie pentru{' '}
            <span style={{ color: '#f4d03f' }}>viața spirituală</span>
          </h2>
          <p className="lp-section-sub">O aplicație completă, gratuită, în limba română</p>

          <div className="lp-grid-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="lp-feature-card"
                onClick={() => router.push('/dashboard')}
                style={{ '--accent': f.color }}
              >
                <div className="lp-feature-ico" style={{ background: f.bg }}>
                  {f.icon}
                </div>
                <div className="lp-feature-title" style={{ color: f.color }}>
                  {f.title}
                </div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ IMAGINE SHOWCASE ══ */}
        <div className="lp-showcase">
          <div className="lp-showcase-img" />
          <div className="lp-showcase-overlay" />
          <div className="lp-showcase-content">
            <div className="lp-showcase-tag">✦ Biblia online</div>
            <h2 className="lp-showcase-title">
              Citește Biblia ca niciodată până acum
            </h2>
            <p className="lp-showcase-text">
              Referințe încrucișate, cuvintele lui Isus cu roșu, bookmark-uri,
              highlight-uri colorate și navigare ușoară prin toate cele 66 de cărți.
            </p>
            <button className="lp-btn-main" onClick={() => router.push('/biblia')}>
              📖 Deschide Biblia
            </button>
          </div>
        </div>

        {/* ══ TESTIMONIALE ══ */}
        <section className="lp-section lp-section-warm">
          <h2 className="lp-section-title">
            Ce spun <span style={{ color: '#f4d03f' }}>utilizatorii</span> noștri
          </h2>
          <p className="lp-section-sub">Mii de creștini folosesc aplicația zilnic</p>

          <div className="lp-testimoniale">
            {[
              { text: 'Această aplicație m-a ajutat să citesc Biblia zilnic. Devoționalul de dimineață a devenit parte din rutina mea spirituală.', autor: 'Maria C.', rol: 'Utilizatoare din Cluj', initiale: 'MC' },
              { text: 'Referințele încrucișate din Biblie sunt incredibile. Găsesc conexiuni pe care nu le observasem în 20 de ani de citit Biblia.', autor: 'Ioan P.', rol: 'Pastor, București', initiale: 'IP' },
              { text: 'Folosesc imaginile cu versete pentru pagina mea de Facebook creștină. Comunitatea mea le adoră! Mulțumesc!', autor: 'Ana M.', rol: 'Utilizatoare din Iași', initiale: 'AM' },
            ].map((t, i) => (
              <div key={i} className="lp-testimonial">
                <div className="lp-t-stars">★★★★★</div>
                <p className="lp-t-text">„{t.text}"</p>
                <div className="lp-t-autor">
                  <div className="lp-t-avatar">{t.initiale}</div>
                  <div>
                    <div className="lp-t-name">{t.autor}</div>
                    <div className="lp-t-role">{t.rol}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CTA FINAL ══ */}
        <section className="lp-final">
          <div className="lp-final-bg" />
          <div className="lp-final-overlay" />
          <div className="lp-final-content">
            <div className="lp-final-icon">🕊️</div>
            <h2 className="lp-final-title">
              Începe <em>călătoria</em> ta<br />spirituală astăzi
            </h2>
            <p className="lp-final-sub">
              Alătură-te comunității noastre de creștini din România.
              Gratuit, fără obligații, pentru totdeauna.
            </p>
            <div className="lp-cta">
              <button className="lp-btn-main" onClick={() => router.push('/register')}>
                ✅ Creează cont gratuit
              </button>
              <button className="lp-btn-sec" onClick={() => router.push('/biblia')}>
                📖 Citește Biblia acum
              </button>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="lp-footer">
          <div className="lp-footer-logo">🕊️ Popas pentru Suflet</div>
          <div className="lp-footer-links">
            {[
              { l: 'Dashboard', p: '/dashboard' }, { l: 'Biblia', p: '/biblia' },
              { l: 'Devoțional', p: '/devotional' }, { l: 'Audio', p: '/audio' },
              { l: 'Generează', p: '/generate' }, { l: 'Înregistrare', p: '/register' },
            ].map((x, i) => (
              <span key={i} className="lp-footer-link" onClick={() => router.push(x.p)}>{x.l}</span>
            ))}
          </div>
          <div className="lp-footer-copy">
            © 2026 Popas pentru Suflet — Aplicație creștină gratuită în limba română
          </div>
        </footer>

      </div>
    </>
  );
}
