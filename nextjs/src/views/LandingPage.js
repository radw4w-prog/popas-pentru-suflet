'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';

export default function LandingPage() {
  const router = useRouter();
  const [verset, setVerset] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/verses/versetul-zilei`)
      .then(r => r.json())
      .then(data => { if (data.success) setVerset(data.verset); })
      .catch(() => {});
  }, []);

  const features = [
    { icon: '📖', title: 'Biblia Cornilescu', desc: '31.102 versete cu referințe încrucișate și cuvintele lui Isus cu roșu', color: '#d4af37' },
    { icon: '🙏', title: 'Devoțional zilnic', desc: 'Meditație zilnică cu verset, mesaj, rugăciune și gândul zilei', color: '#7c3aed' },
    { icon: '🎧', title: 'Audio Biblie', desc: 'Ascultă Biblia completă, cu redare continuă pe mobil', color: '#10b981' },
    { icon: '✨', title: 'Imagini cu versete', desc: 'Generează imagini pentru Instagram, Facebook și WhatsApp', color: '#3b82f6' },
    { icon: '📔', title: 'Jurnal spiritual', desc: 'Scrie gândurile, rugăciunile și momentele tale cu Dumnezeu', color: '#ec4899' },
    { icon: '🕊️', title: 'Călătoria spirituală', desc: 'Streak zilnic, badge-uri și statistici de citire personalizate', color: '#f59e0b' },
  ];

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing { background: #0a0a0f; color: #f0f0f0; font-family: Inter, -apple-system, sans-serif; overflow-x: hidden; }
        
        /* NAV */
        .lnd-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(10,10,15,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(212,175,55,0.12); padding: 0.875rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
        .lnd-logo { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; text-decoration: none; }
        .lnd-logo-text { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #d4af37; }
        .lnd-nav-btns { display: flex; gap: 0.6rem; }
        .btn-ghost { padding: 0.5rem 1rem; background: transparent; border: 1px solid rgba(212,175,55,0.35); border-radius: 20px; color: #d4af37; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
        .btn-ghost:hover { background: rgba(212,175,55,0.1); }
        .btn-gold { padding: 0.5rem 1rem; background: linear-gradient(135deg, #d4af37, #b8960c); border: none; border-radius: 20px; color: #0a0a0f; cursor: pointer; font-size: 0.82rem; font-weight: 700; transition: all 0.2s; }
        .btn-gold:hover { box-shadow: 0 4px 15px rgba(212,175,55,0.4); transform: translateY(-1px); }

        /* HERO */
        .lnd-hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 7rem 1.25rem 4rem; position: relative; }
        .lnd-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.09) 0%, transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(124,58,237,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(59,130,246,0.05) 0%, transparent 50%); pointer-events: none; }
        .lnd-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.25); border-radius: 20px; padding: 0.35rem 0.9rem; margin-bottom: 1.75rem; font-size: 0.78rem; color: #d4af37; font-weight: 600; }
        .lnd-h1 { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 6vw, 3.5rem); font-weight: 700; line-height: 1.2; margin-bottom: 1.25rem; }
        .lnd-h1 span { color: #d4af37; }
        .lnd-sub { font-size: clamp(0.9rem, 2.5vw, 1.1rem); line-height: 1.8; color: #a0a0b0; margin-bottom: 2.25rem; max-width: 550px; }
        .lnd-cta { display: flex; gap: 0.875rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem; }
        .btn-primary { padding: 0.875rem 1.75rem; background: linear-gradient(135deg, #d4af37, #b8960c); border: none; border-radius: 14px; color: #0a0a0f; cursor: pointer; font-size: 0.95rem; font-weight: 700; box-shadow: 0 4px 20px rgba(212,175,55,0.3); transition: all 0.2s; }
        .btn-primary:hover { box-shadow: 0 6px 25px rgba(212,175,55,0.45); transform: translateY(-2px); }
        .btn-secondary { padding: 0.875rem 1.75rem; background: transparent; border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; color: #f0f0f0; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.2s; }
        .btn-secondary:hover { border-color: rgba(212,175,55,0.4); color: #d4af37; }

        /* VERSET CARD */
        .lnd-verset { background: rgba(212,175,55,0.06); border: 1px solid rgba(212,175,55,0.18); border-radius: 20px; padding: 1.5rem 1.75rem; max-width: 580px; margin: 0 auto; cursor: pointer; transition: all 0.2s; }
        .lnd-verset:hover { border-color: rgba(212,175,55,0.35); background: rgba(212,175,55,0.09); }
        .lnd-verset-label { color: #d4af37; font-size: 0.65rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.75rem; }
        .lnd-verset-text { font-family: 'Playfair Display', serif; font-size: clamp(0.9rem, 2.5vw, 1.05rem); font-style: italic; line-height: 1.8; color: #f0f0f0; margin-bottom: 0.75rem; }
        .lnd-verset-ref { color: #d4af37; font-weight: 700; font-size: 0.85rem; }

        /* FEATURES */
        .lnd-section { padding: 5rem 1.25rem; }
        .lnd-section-alt { background: rgba(255,255,255,0.018); }
        .lnd-section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.4rem, 4vw, 2.25rem); font-weight: 700; text-align: center; margin-bottom: 0.75rem; }
        .lnd-section-sub { color: #a0a0b0; text-align: center; font-size: 0.95rem; margin-bottom: 3rem; }
        .lnd-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.1rem; max-width: 1000px; margin: 0 auto; }
        .lnd-feature { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 1.6rem; transition: all 0.2s; cursor: pointer; }
        .lnd-feature:hover { border-color: rgba(212,175,55,0.25); transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
        .lnd-feature-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 1rem; }
        .lnd-feature-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; margin-bottom: 0.4rem; }
        .lnd-feature-desc { color: #a0a0b0; font-size: 0.87rem; line-height: 1.7; }

        /* STATS */
        .lnd-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; max-width: 700px; margin: 0 auto; }
        .lnd-stat { text-align: center; padding: 1.5rem; background: rgba(212,175,55,0.04); border: 1px solid rgba(212,175,55,0.12); border-radius: 20px; }
        .lnd-stat-nr { font-family: 'Playfair Display', serif; font-size: 2.25rem; font-weight: 700; color: #d4af37; }
        .lnd-stat-label { color: #a0a0b0; font-size: 0.85rem; margin-top: 0.3rem; }

        /* TESTIMONIALE */
        .lnd-testimoniale { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.1rem; max-width: 950px; margin: 0 auto; }
        .lnd-testimonial { background: rgba(212,175,55,0.04); border: 1px solid rgba(212,175,55,0.12); border-radius: 20px; padding: 1.75rem; }
        .lnd-testimonial-quote { font-size: 2rem; color: rgba(212,175,55,0.4); margin-bottom: 0.75rem; line-height: 1; }
        .lnd-testimonial-text { font-family: 'Lora', Georgia, serif; font-style: italic; line-height: 1.8; color: #d0d0e0; font-size: 0.92rem; margin-bottom: 1rem; }
        .lnd-testimonial-autor { color: #d4af37; font-weight: 600; font-size: 0.82rem; }

        /* APEL FINAL */
        .lnd-final { text-align: center; padding: 6rem 1.25rem; }
        .lnd-final-icon { font-size: 3.5rem; margin-bottom: 1.5rem; }
        .lnd-final-h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 700; margin-bottom: 1rem; }
        .lnd-final-sub { color: #a0a0b0; margin-bottom: 2.25rem; line-height: 1.8; font-size: 1rem; }

        /* FOOTER */
        .lnd-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 2rem 1.25rem; text-align: center; color: #6b6b80; font-size: 0.8rem; }
        .lnd-footer-links { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-top: 0.75rem; }
        .lnd-footer-link { cursor: pointer; transition: color 0.2s; }
        .lnd-footer-link:hover { color: #d4af37; }

        /* MOBILE */
        @media (max-width: 600px) {
          .lnd-nav { padding: 0.75rem 1rem; }
          .lnd-logo-text { font-size: 0.88rem; }
          .btn-ghost { display: none; }
          .lnd-hero { padding: 6rem 1rem 3rem; }
          .lnd-cta { flex-direction: column; align-items: center; }
          .btn-primary, .btn-secondary { width: 100%; max-width: 320px; }
          .lnd-section { padding: 3.5rem 1rem; }
          .lnd-stats { grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
          .lnd-stat-nr { font-size: 1.75rem; }
          .lnd-grid { grid-template-columns: 1fr; }
          .lnd-testimoniale { grid-template-columns: 1fr; }
          .lnd-final { padding: 4rem 1rem; }
        }

        @media (min-width: 601px) and (max-width: 900px) {
          .lnd-stats { grid-template-columns: repeat(4, 1fr); }
          .lnd-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 901px) {
          .lnd-stats { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div className="landing">
        {/* ══ NAVBAR ══ */}
        <nav className="lnd-nav">
          <div className="lnd-logo" onClick={() => router.push('/')}>
            <span style={{ fontSize: '1.4rem' }}>🕊️</span>
            <span className="lnd-logo-text">Popas pentru Suflet</span>
          </div>
          <div className="lnd-nav-btns">
            <button className="btn-ghost" onClick={() => router.push('/login')}>Autentificare</button>
            <button className="btn-gold" onClick={() => router.push('/register')}>Cont gratuit</button>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <section className="lnd-hero">
          <div className="lnd-hero-bg" />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '750px' }}>
            <div className="lnd-badge">🕊️ Aplicație creștină gratuită în limba română</div>
            <h1 className="lnd-h1">
              Un loc de <span>odihnă</span> și <span>hrană</span><br />pentru suflet
            </h1>
            <p className="lnd-sub">
              Biblia Cornilescu completă, devoțional zilnic generat cu AI,
              rugăciuni și imagini cu versete. Totul gratuit.
            </p>
            <div className="lnd-cta">
              <button className="btn-primary" onClick={() => router.push('/register')}>
                ✅ Creează cont gratuit
              </button>
              <button className="btn-secondary" onClick={() => router.push('/dashboard')}>
                📖 Explorează aplicația
              </button>
            </div>

            {/* Versetul zilei */}
            {verset && (
              <div className="lnd-verset" onClick={() => router.push('/dashboard')}>
                <div className="lnd-verset-label">✦ Versetul zilei ✦</div>
                <p className="lnd-verset-text">„{verset.text}"</p>
                <div className="lnd-verset-ref">— {verset.carte} {verset.capitol}:{verset.verset}</div>
              </div>
            )}
          </div>
        </section>

        {/* ══ STATISTICI ══ */}
        <section className="lnd-section">
          <div className="lnd-stats">
            {[
              { nr: '31.102', label: 'versete biblice' },
              { nr: '66', label: 'cărți ale Bibliei' },
              { nr: '100%', label: 'complet gratuit' },
              { nr: '∞', label: 'devoționale zilnice' },
            ].map((s, i) => (
              <div key={i} className="lnd-stat">
                <div className="lnd-stat-nr">{s.nr}</div>
                <div className="lnd-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section className="lnd-section lnd-section-alt">
          <h2 className="lnd-section-title">
            Tot ce ai nevoie pentru <span style={{ color: '#d4af37' }}>viața spirituală</span>
          </h2>
          <p className="lnd-section-sub">O aplicație completă, gratuită, în limba română</p>
          <div className="lnd-grid">
            {features.map((f, i) => (
              <div key={i} className="lnd-feature" onClick={() => router.push('/dashboard')}>
                <div className="lnd-feature-icon" style={{ background: `${f.color}18` }}>
                  {f.icon}
                </div>
                <div className="lnd-feature-title">{f.title}</div>
                <div className="lnd-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TESTIMONIALE ══ */}
        <section className="lnd-section">
          <h2 className="lnd-section-title">
            Ce spun <span style={{ color: '#d4af37' }}>utilizatorii</span> noștri
          </h2>
          <p className="lnd-section-sub">Mii de creștini folosesc aplicația zilnic</p>
          <div className="lnd-testimoniale">
            {[
              { text: 'Această aplicație m-a ajutat să citesc Biblia zilnic. Devoționalul de dimineață a devenit parte din rutina mea.', autor: 'Maria C.' },
              { text: 'Referințele încrucișate din Biblie sunt incredibile. Găsesc conexiuni pe care nu le observasem niciodată.', autor: 'Ioan P.' },
              { text: 'Folosesc imaginile cu versete pentru pagina mea de Facebook. Comunitatea mea le adoră!', autor: 'Ana M.' },
            ].map((t, i) => (
              <div key={i} className="lnd-testimonial">
                <div className="lnd-testimonial-quote">❝</div>
                <p className="lnd-testimonial-text">{t.text}</p>
                <div className="lnd-testimonial-autor">— {t.autor}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CTA FINAL ══ */}
        <section className="lnd-section lnd-section-alt lnd-final">
          <div className="lnd-final-icon">🕊️</div>
          <h2 className="lnd-final-h2">
            Începe <span style={{ color: '#d4af37' }}>călătoria</span> ta spirituală
          </h2>
          <p className="lnd-final-sub">
            Alătură-te comunității noastre. Gratuit, fără obligații.
          </p>
          <div className="lnd-cta">
            <button className="btn-primary" onClick={() => router.push('/register')}>
              ✅ Creează cont gratuit
            </button>
            <button className="btn-secondary" onClick={() => router.push('/biblia')}>
              📖 Citește Biblia acum
            </button>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="lnd-footer">
          <div>🕊️ <strong style={{ color: '#d4af37' }}>Popas pentru Suflet</strong> — Aplicație creștină gratuită în limba română</div>
          <div className="lnd-footer-links">
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Biblia', path: '/biblia' },
              { label: 'Devoțional', path: '/devotional' },
              { label: 'Audio', path: '/audio' },
              { label: 'Înregistrare', path: '/register' },
            ].map((l, i) => (
              <span key={i} className="lnd-footer-link" onClick={() => router.push(l.path)}>{l.label}</span>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
