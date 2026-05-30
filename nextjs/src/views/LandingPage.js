'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';

export default function LandingPage() {
  const router = useRouter();
  const [verset, setVerset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ora, setOra] = useState('');

  useEffect(() => {
    // Fetch versetul zilei
    fetch(`${API_URL}/api/verses/versetul-zilei`)
      .then(r => r.json())
      .then(data => { if (data.success) setVerset(data.verset); })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Ora curentă
    const updateOra = () => {
      const now = new Date();
      setOra(now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }));
    };
    updateOra();
    const interval = setInterval(updateOra, 60000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: '📖', title: 'Biblia Cornilescu', desc: '31.102 versete cu referințe încrucișate, cuvintele lui Isus cu roșu și bookmark-uri personale.' },
    { icon: '🙏', title: 'Devoțional zilnic', desc: 'Meditație zilnică generată cu AI — verset, mesaj, rugăciune și gândul zilei.' },
    { icon: '🎧', title: 'Audio Biblie', desc: 'Ascultă Biblia Cornilescu completă. Redare continuă, compatibil cu ecranul blocat.' },
    { icon: '✨', title: 'Imagini cu versete', desc: 'Generează imagini frumoase cu versete pentru Instagram, Facebook și WhatsApp.' },
    { icon: '📔', title: 'Jurnal spiritual', desc: 'Scrie gândurile tale, rugăciunile și momentele cu Dumnezeu.' },
    { icon: '🕊️', title: 'Călătoria spirituală', desc: 'Urmărește-ți progresul: streak zilnic, badge-uri și statistici de citire.' },
  ];

  const testimoniale = [
    { text: 'Această aplicație m-a ajutat să citesc Biblia zilnic. Devoționalul de dimineață a devenit parte din rutina mea.', autor: 'Maria C.' },
    { text: 'Referințele încrucișate din Biblie sunt incredibile. Găsesc conexiuni pe care nu le observasem niciodată.', autor: 'Ioan P.' },
    { text: 'Folosesc imaginile cu versete pentru pagina mea de Facebook. Comunitatea mea le adoră!', autor: 'Ana M.' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary, #0a0a0f)', color: 'var(--text-primary, #f0f0f0)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
        padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <span style={{ fontSize: '1.5rem' }}>🕊️</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: '#d4af37' }}>
            Popas pentru Suflet
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => router.push('/login')}
            style={{ padding: '0.5rem 1.25rem', background: 'transparent', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '20px', color: '#d4af37', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            Autentificare
          </button>
          <button
            onClick={() => router.push('/register')}
            style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #d4af37, #b8960c)', border: 'none', borderRadius: '20px', color: '#0a0a0f', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
          >
            Cont gratuit
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '8rem 1.5rem 4rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.08) 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, rgba(124,58,237,0.06) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '20px', padding: '0.4rem 1rem', marginBottom: '2rem',
            fontSize: '0.82rem', color: '#d4af37', fontWeight: 600
          }}>
            🕊️ Aplicație creștină gratuită
          </div>

          {/* Titlu */}
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem',
            color: '#f0f0f0'
          }}>
            Un loc de{' '}
            <span style={{ color: '#d4af37' }}>odihnă</span>
            {' '}și{' '}
            <span style={{ color: '#d4af37' }}>hrană</span>
            {' '}pentru suflet
          </h1>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#a0a0b0', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Biblia Cornilescu completă, devoțional zilnic, rugăciuni și imagini cu versete.
            Totul gratuit, în limba română.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button
              onClick={() => router.push('/register')}
              style={{
                padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #d4af37, #b8960c)',
                border: 'none', borderRadius: '14px', color: '#0a0a0f', cursor: 'pointer',
                fontSize: '1rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
                transition: 'all 0.2s'
              }}
            >
              ✅ Creează cont gratuit
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '0.9rem 2rem', background: 'transparent',
                border: '1px solid rgba(212,175,55,0.4)', borderRadius: '14px',
                color: '#f0f0f0', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              📖 Explorează aplicația
            </button>
          </div>

          {/* Versetul zilei */}
          {!loading && verset && (
            <div style={{
              background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '20px', padding: '1.5rem 2rem', maxWidth: '600px', margin: '0 auto',
              cursor: 'pointer'
            }}
              onClick={() => router.push('/dashboard')}
            >
              <div style={{ color: '#d4af37', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                ✦ Versetul zilei ✦
              </div>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', lineHeight: 1.8, fontStyle: 'italic', color: '#f0f0f0', margin: '0 0 0.75rem' }}>
                „{verset.text}"
              </p>
              <div style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.88rem' }}>
                — {verset.carte} {verset.capitol}:{verset.verset}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
              Tot ce ai nevoie pentru{' '}
              <span style={{ color: '#d4af37' }}>viața spirituală</span>
            </h2>
            <p style={{ color: '#a0a0b0', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              O aplicație completă, gratuită, în limba română.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px', padding: '1.75rem', transition: 'all 0.2s',
                cursor: 'pointer'
              }}
                onClick={() => router.push('/dashboard')}
              >
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f0f0f0' }}>
                  {f.title}
                </h3>
                <p style={{ color: '#a0a0b0', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATISTICI
      ══════════════════════════════════════ */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { nr: '31.102', label: 'versete biblice' },
            { nr: '66', label: 'cărți ale Bibliei' },
            { nr: '100%', label: 'gratuit' },
            { nr: '∞', label: 'devoționale zilnice' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 700, color: '#d4af37' }}>{s.nr}</div>
              <div style={{ color: '#a0a0b0', fontSize: '0.9rem', marginTop: '0.35rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALE
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'center', marginBottom: '3rem', fontWeight: 700 }}>
            Ce spun <span style={{ color: '#d4af37' }}>utilizatorii</span> noștri
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {testimoniale.map((t, i) => (
              <div key={i} style={{
                background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '20px', padding: '1.75rem'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#d4af37' }}>❝</div>
                <p style={{ fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic', lineHeight: 1.8, color: '#d0d0e0', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  {t.text}
                </p>
                <div style={{ color: '#d4af37', fontWeight: 600, fontSize: '0.85rem' }}>— {t.autor}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════ */}
      <section style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🕊️</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
            Începe călătoria ta spirituală
          </h2>
          <p style={{ color: '#a0a0b0', marginBottom: '2rem', lineHeight: 1.8, fontSize: '1rem' }}>
            Alătură-te comunității noastre. Gratuit, fără obligații.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/register')}
              style={{
                padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #d4af37, #b8960c)',
                border: 'none', borderRadius: '14px', color: '#0a0a0f', cursor: 'pointer',
                fontSize: '1.05rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
              }}
            >
              ✅ Creează cont gratuit
            </button>
            <button
              onClick={() => router.push('/biblia')}
              style={{
                padding: '1rem 2.5rem', background: 'transparent',
                border: '1px solid rgba(212,175,55,0.4)', borderRadius: '14px',
                color: '#f0f0f0', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 600
              }}
            >
              📖 Citește Biblia
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem 1.5rem', textAlign: 'center', color: '#6b6b80', fontSize: '0.82rem'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          🕊️ <strong style={{ color: '#d4af37' }}>Popas pentru Suflet</strong> — Aplicație creștină gratuită în limba română
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>Dashboard</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/biblia')}>Biblia</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/devotional')}>Devoțional</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/register')}>Înregistrare</span>
        </div>
      </footer>
    </div>
  );
}
