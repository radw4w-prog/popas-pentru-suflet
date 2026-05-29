'use client';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ═══ PRESETURI PLAN ═══
const PRESETURI = [
  { label: '3 luni', zile: 90, icon: '⚡', capitoleZi: 14 },
  { label: '6 luni', zile: 180, icon: '🔥', capitoleZi: 7 },
  { label: '1 an', zile: 365, icon: '📅', capitoleZi: 4 },
  { label: '2 ani', zile: 730, icon: '🌿', capitoleZi: 2 },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ═══════════════════════════════════════
// COMPONENTA PRINCIPALĂ
// ═══════════════════════════════════════
const ReadingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState('plan');
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [today, setToday] = useState(null);
  const [carti, setCarti] = useState([]);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  // Plan setup
  const [dataStart, setDataStart] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dataFinal, setDataFinal] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );
  const [showSetupPlan, setShowSetupPlan] = useState(false);

  // Reader
  const [readerData, setReaderData] = useState(null);
  const [loadingReader, setLoadingReader] = useState(false);
  const [showReader, setShowReader] = useState(false);

  // Carti - filtru testament
  const [filtruTestament, setFiltruTestament] = useState('all');

  // ═══ LOAD DATE ═══
  const loadAll = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = { headers: getAuthHeaders() };

      const [planRes, progressRes, todayRes, cartiRes, calendarRes] =
        await Promise.all([
          axios.get(`${API}/api/reading/plan`, headers),
          axios.get(`${API}/api/reading/progress`, headers),
          axios.get(`${API}/api/reading/today`, headers),
          axios.get(`${API}/api/reading/carti`, headers),
          axios.get(`${API}/api/reading/calendar`, headers),
        ]);

      if (planRes.data.success) setPlan(planRes.data.plan);
      if (progressRes.data.success) setProgress(progressRes.data);
      if (todayRes.data.success) setToday(todayRes.data);
      if (cartiRes.data.success) setCarti(cartiRes.data.carti || []);
      if (calendarRes.data.success) setCalendar(calendarRes.data);
    } catch (err) {
      console.error('Eroare loadAll:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ═══ CREARE PLAN ═══
  const handleCreatePlan = async () => {
    try {
      setLoadingAction(true);
      const res = await axios.post(
        `${API}/api/reading/plan`,
        { dataStart, dataFinal },
        { headers: getAuthHeaders() }
      );

      if (res.data.success) {
        setShowSetupPlan(false);
        await loadAll();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Eroare la crearea planului.');
    } finally {
      setLoadingAction(false);
    }
  };

  // ═══ ȘTERGERE PLAN ═══
  const handleDeletePlan = async () => {
    if (!window.confirm('Sigur vrei să ștergi planul? Progresul de citire se păstrează.'))
      return;
    try {
      await axios.delete(`${API}/api/reading/plan`, {
        headers: getAuthHeaders()
      });
      setPlan(null);
      await loadAll();
    } catch (err) {
      alert('Eroare la ștergerea planului.');
    }
  };

  // ═══ MARCARE CAPITOL ═══
  const handleMarkCapitol = async (carte, capitol, abreviere) => {
    try {
      const res = await axios.post(
        `${API}/api/reading/mark`,
        { carte, capitol, abreviere },
        { headers: getAuthHeaders() }
      );

      if (res.data.success) {
        await loadAll();
        if (readerData && readerData.carte === carte && readerData.capitol === capitol) {
          setReaderData(prev => ({ ...prev, citit: res.data.action === 'marked' }));
        }
      }
    } catch (err) {
      alert('Eroare la marcare.');
    }
  };

  // ═══ MARCARE AZI ═══
  const handleMarkToday = async () => {
    try {
      setLoadingAction(true);
      const res = await axios.post(
        `${API}/api/reading/mark-today`,
        {},
        { headers: getAuthHeaders() }
      );

      if (res.data.success) {
        alert(res.data.message);
        await loadAll();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Eroare.');
    } finally {
      setLoadingAction(false);
    }
  };

  // ═══ DESCHIDE READER ═══
  const handleOpenReader = async (carte, capitol) => {
    try {
      setLoadingReader(true);
      setShowReader(true);

      const res = await axios.get(
        `${API}/api/reading/capitol/${encodeURIComponent(carte)}/${capitol}`,
        { headers: getAuthHeaders() }
      );

      if (res.data.success) {
        setReaderData(res.data);
      }
    } catch (err) {
      alert('Eroare la încărcarea capitolului.');
      setShowReader(false);
    } finally {
      setLoadingReader(false);
    }
  };

  // ═══ NAVIGARE READER ═══
  const handleNavReader = async (nav) => {
    if (!nav) return;
    await handleOpenReader(nav.carte, nav.capitol);
  };

  // ═══ PRESET PLAN ═══
  const applyPreset = (zile) => {
    const start = new Date();
    const final = new Date(Date.now() + zile * 86400000);
    setDataStart(start.toISOString().split('T')[0]);
    setDataFinal(final.toISOString().split('T')[0]);
  };

  // ─────────────────────────────────────────────
  // RENDER - Neautentificat
  // ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Plan Citire Biblie
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Creează un cont gratuit pentru a-ți urmări progresul de citire și
          a-ți seta un plan personalizat.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/register')}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '10px',
              color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '1rem'
            }}
          >
            ✅ Creează cont gratuit
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            🔑 Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>📖</div>
        <p style={{ color: 'var(--text-secondary)' }}>Se încarcă...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER - Reader modal
  // ─────────────────────────────────────────────
  if (showReader) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>
        {/* Header Reader */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '1.5rem',
          padding: '1rem', background: 'var(--bg-card)',
          borderRadius: '16px', border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setShowReader(false)}
            style={{
              padding: '0.5rem 1rem', background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)', borderRadius: '8px',
              color: 'var(--text-primary)', cursor: 'pointer'
            }}
          >
            ← Înapoi
          </button>

          {readerData && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontWeight: 700, fontSize: '1.1rem',
                color: 'var(--text-primary)'
              }}>
                {readerData.carte} {readerData.capitol}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {readerData.totalVersete} versete
                {readerData.testament && ` • ${readerData.testament}`}
              </div>
            </div>
          )}

          {readerData && (
            <button
              onClick={() => handleMarkCapitol(
                readerData.carte,
                readerData.capitol,
                readerData.abreviere
              )}
              style={{
                padding: '0.5rem 1rem',
                background: readerData.citit
                  ? 'rgba(34,197,94,0.1)'
                  : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: readerData.citit
                  ? '1px solid rgba(34,197,94,0.3)'
                  : 'none',
                borderRadius: '8px',
                color: readerData.citit ? '#22c55e' : 'white',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
              }}
            >
              {readerData.citit ? '✅ Citit' : '✅ Marchează citit'}
            </button>
          )}
        </div>

        {/* Conținut Capitol */}
        {loadingReader ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            Se încarcă capitolul...
          </div>
        ) : readerData ? (
          <>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px', padding: '2rem',
              marginBottom: '1.5rem'
            }}>
              {readerData.versete.map((v) => (
                <div
                  key={v.verset}
                  style={{
                    display: 'flex', gap: '1rem',
                    marginBottom: '1rem', lineHeight: 1.8
                  }}
                >
                  <span style={{
                    color: 'var(--gold-primary)',
                    fontWeight: 700, fontSize: '0.8rem',
                    minWidth: 28, paddingTop: '0.2rem',
                    flexShrink: 0
                  }}>
                    {v.verset}
                  </span>
                  <span style={{
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontFamily: "'Lora', serif"
                  }}>
                    {v.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Navigare */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <button
                onClick={() => handleNavReader(readerData.navigare?.anterior)}
                disabled={!readerData.navigare?.anterior}
                style={{
                  flex: 1, padding: '0.875rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px', cursor: 'pointer',
                  color: 'var(--text-primary)', fontWeight: 600,
                  opacity: !readerData.navigare?.anterior ? 0.4 : 1
                }}
              >
                ← {readerData.navigare?.anterior
                  ? `${readerData.navigare.anterior.carte} ${readerData.navigare.anterior.capitol}`
                  : 'Primul capitol'}
              </button>

              <button
                onClick={() => handleMarkCapitol(
                  readerData.carte,
                  readerData.capitol,
                  readerData.abreviere
                )}
                style={{
                  flex: 1, padding: '0.875rem',
                  background: readerData.citit
                    ? 'rgba(34,197,94,0.15)'
                    : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: readerData.citit
                    ? '1px solid rgba(34,197,94,0.3)'
                    : 'none',
                  borderRadius: '12px',
                  color: readerData.citit ? '#22c55e' : 'white',
                  cursor: 'pointer', fontWeight: 700
                }}
              >
                {readerData.citit ? '✅ Citit!' : '✅ Marchează citit'}
              </button>

              <button
                onClick={() => handleNavReader(readerData.navigare?.urmator)}
                disabled={!readerData.navigare?.urmator}
                style={{
                  flex: 1, padding: '0.875rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px', cursor: 'pointer',
                  color: 'var(--text-primary)', fontWeight: 600,
                  opacity: !readerData.navigare?.urmator ? 0.4 : 1,
                  textAlign: 'right'
                }}
              >
                {readerData.navigare?.urmator
                  ? `${readerData.navigare.urmator.carte} ${readerData.navigare.urmator.capitol}`
                  : 'Ultimul capitol'} →
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER - Pagina principală
  // ─────────────────────────────────────────────
  const procent = progress?.procent || 0;
  const capitoleCitite = progress?.capitoleCitite || 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ═══ HEADER ═══ */}
      <div style={{
        marginBottom: '1.5rem',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>
            📖 Plan Citire Biblie
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>
            Bun venit, {user?.nume}!
            {capitoleCitite > 0 && ` Ai citit ${capitoleCitite} capitole.`}
          </p>
        </div>

        {plan && (
          <button
            onClick={() => setShowSetupPlan(true)}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '0.85rem'
            }}
          >
            ⚙️ Modifică planul
          </button>
        )}
      </div>

      {/* ═══ TABS ═══ */}
      <div style={{
        display: 'flex', gap: '0.5rem',
        marginBottom: '1.5rem', flexWrap: 'wrap'
      }}>
        {[
          { key: 'plan', label: '📅 Planul meu' },
          { key: 'carti', label: '📚 Cărți' },
          { key: 'calendar', label: '🗓️ Calendar' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '10px',
              border: tab === t.key
                ? '1px solid rgba(212,175,55,0.5)'
                : '1px solid var(--border-color)',
              background: tab === t.key
                ? 'rgba(212,175,55,0.1)'
                : 'var(--bg-card)',
              color: tab === t.key
                ? 'var(--gold-primary)'
                : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: PLANUL MEU ═══ */}
      {tab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* SETUP PLAN sau CARD PLAN */}
          {!plan || showSetupPlan ? (
            <SetupPlan
              dataStart={dataStart}
              dataFinal={dataFinal}
              setDataStart={setDataStart}
              setDataFinal={setDataFinal}
              applyPreset={applyPreset}
              handleCreatePlan={handleCreatePlan}
              loadingAction={loadingAction}
              hasPlan={!!plan}
              onCancel={() => setShowSetupPlan(false)}
              onDeletePlan={handleDeletePlan}
            />
          ) : (
            <PlanCard
              plan={plan}
              procent={procent}
              capitoleCitite={capitoleCitite}
            />
          )}

          {/* PLANUL DE AZI */}
          {plan && today && !showSetupPlan && (
            <TodayCard
              today={today}
              loadingAction={loadingAction}
              handleMarkToday={handleMarkToday}
              handleOpenReader={handleOpenReader}
              handleMarkCapitol={handleMarkCapitol}
            />
          )}

          {/* PROGRES GENERAL */}
          {!showSetupPlan && (
            <ProgressCard
              procent={procent}
              capitoleCitite={capitoleCitite}
              progress={progress}
            />
          )}
        </div>
      )}

      {/* ═══ TAB: CĂRȚI ═══ */}
      {tab === 'carti' && (
        <div>
          {/* Filtru testament */}
          <div style={{
            display: 'flex', gap: '0.5rem',
            marginBottom: '1rem', flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: '📋 Toate' },
              { key: 'VT', label: '📜 Vechiul Testament' },
              { key: 'NT', label: '✝️ Noul Testament' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFiltruTestament(f.key)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '20px',
                  border: filtruTestament === f.key
                    ? '1px solid var(--gold-primary)'
                    : '1px solid var(--border-color)',
                  background: filtruTestament === f.key
                    ? 'rgba(212,175,55,0.1)'
                    : 'var(--bg-card)',
                  color: filtruTestament === f.key
                    ? 'var(--gold-primary)'
                    : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.75rem'
          }}>
            {carti
              .filter(c => filtruTestament === 'all' || c.testament === filtruTestament)
              .map(carte => (
                <CarteCard
                  key={carte.carte}
                  carte={carte}
                  handleOpenReader={handleOpenReader}
                  handleMarkCapitol={handleMarkCapitol}
                  progress={progress}
                />
              ))}
          </div>
        </div>
      )}

      {/* ═══ TAB: CALENDAR ═══ */}
      {tab === 'calendar' && calendar && (
        <CalendarCard calendar={calendar} />
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// SUB-COMPONENTE
// ═══════════════════════════════════════

const SetupPlan = ({
  dataStart, dataFinal, setDataStart, setDataFinal,
  applyPreset, handleCreatePlan, loadingAction,
  hasPlan, onCancel, onDeletePlan
}) => {
  const zile = Math.max(1, Math.floor(
    (new Date(dataFinal) - new Date(dataStart)) / 86400000
  ));
  const capitoleZi = Math.max(1, Math.ceil(1189 / zile));

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px', padding: '1.5rem'
    }}>
      <h3 style={{ margin: '0 0 1rem', color: 'var(--text-primary)' }}>
        {hasPlan ? '⚙️ Modifică planul' : '📅 Configurează planul de citire'}
      </h3>

      {/* Preseturi */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{
          fontSize: '0.8rem', color: 'var(--text-muted)',
          marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase'
        }}>
          Preseturi rapide:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESETURI.map(p => (
            <button
              key={p.zile}
              onClick={() => applyPreset(p.zile)}
              style={{
                padding: '0.55rem 1rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
              }}
            >
              {p.icon} {p.label}
              <span style={{
                display: 'block', fontSize: '0.7rem',
                color: 'var(--text-muted)', fontWeight: 400
              }}>
                ~{p.capitoleZi} cap/zi
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem', marginBottom: '1rem'
      }}>
        <div>
          <label style={{
            display: 'block', fontSize: '0.8rem',
            color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600
          }}>
            📅 Data start:
          </label>
          <input
            type="date"
            value={dataStart}
            onChange={e => setDataStart(e.target.value)}
            style={{
              width: '100%', padding: '0.65rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px', color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
        </div>
        <div>
          <label style={{
            display: 'block', fontSize: '0.8rem',
            color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600
          }}>
            🏁 Data final:
          </label>
          <input
            type="date"
            value={dataFinal}
            onChange={e => setDataFinal(e.target.value)}
            style={{
              width: '100%', padding: '0.65rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px', color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* Preview calcul */}
      <div style={{
        padding: '0.875rem', background: 'rgba(212,175,55,0.06)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '10px', marginBottom: '1.25rem',
        display: 'flex', gap: '2rem', flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--gold-primary)'
          }}>
            {capitoleZi}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            capitole/zi
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {zile}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            zile total
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            1.189
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            capitole total
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleCreatePlan}
          disabled={loadingAction}
          style={{
            flex: 1, padding: '0.875rem',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border: 'none', borderRadius: '10px',
            color: 'white', fontWeight: 700,
            cursor: 'pointer', fontSize: '0.95rem'
          }}
        >
          {loadingAction ? '⏳ Se salvează...' : '✅ Salvează planul'}
        </button>

        {hasPlan && (
          <button
            onClick={onCancel}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Anulează
          </button>
        )}

        {hasPlan && (
          <button
            onClick={onDeletePlan}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              color: '#ef4444', cursor: 'pointer'
            }}
          >
            🗑️ Șterge planul
          </button>
        )}
      </div>
    </div>
  );
};

const PlanCard = ({ plan, procent, capitoleCitite }) => {
  const start = new Date(plan.dataStart).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const final = new Date(plan.dataFinal).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px', padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h3 style={{ margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>
            📅 Planul meu de citire
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {start} → {final}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '2rem', fontWeight: 700,
            color: 'var(--gold-primary)'
          }}>
            {procent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            completat
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--bg-primary)', borderRadius: '999px',
        height: 12, overflow: 'hidden', marginBottom: '1rem'
      }}>
        <div style={{
          width: `${procent}%`, height: '100%',
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          borderRadius: '999px',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.75rem'
      }}>
        {[
          { label: 'Capitole citite', value: capitoleCitite, icon: '✅' },
          { label: 'Rămase', value: 1189 - capitoleCitite, icon: '📖' },
          { label: 'Cap./zi', value: plan.capitolePerZi, icon: '📅' },
          { label: 'Zile rămase', value: plan.zileRamase || '-', icon: '⏳' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-primary)',
            borderRadius: '10px', padding: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
              {s.icon}
            </div>
            <div style={{
              fontWeight: 700, fontSize: '1.2rem',
              color: 'var(--text-primary)'
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Status plan */}
      {plan.intarziere > 0 && (
        <div style={{
          marginTop: '1rem', padding: '0.75rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px', fontSize: '0.85rem', color: '#ef4444'
        }}>
          ⚠️ Ești cu <strong>{plan.intarziere} capitole</strong> în urmă față de plan.
        </div>
      )}

      {plan.inainte > 0 && (
        <div style={{
          marginTop: '1rem', padding: '0.75rem',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '10px', fontSize: '0.85rem', color: '#22c55e'
        }}>
          🎉 Ești cu <strong>{plan.inainte} capitole</strong> înaintea planului!
        </div>
      )}
    </div>
  );
};

const TodayCard = ({
  today, loadingAction, handleMarkToday,
  handleOpenReader, handleMarkCapitol
}) => {
  if (!today || !today.capitole?.length) return null;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px', padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
            📖 Planul de azi
            <span style={{
              marginLeft: '0.5rem', fontSize: '0.75rem',
              background: 'rgba(99,102,241,0.1)',
              color: '#6366f1', padding: '2px 8px',
              borderRadius: '10px', fontWeight: 600
            }}>
              Ziua {today.ziuaCurenta}
            </span>
          </h3>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {today.toateCititeAzi
              ? '✅ Ai citit tot planul de azi!'
              : `Mai ai ${today.citesteAzi} capitol(e) de citit`}
          </p>
        </div>

        {!today.toateCititeAzi && (
          <button
            onClick={handleMarkToday}
            disabled={loadingAction}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              border: 'none', borderRadius: '10px',
              color: 'white', fontWeight: 700,
              cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            {loadingAction ? '⏳' : '✅ Am citit planul de azi'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: '0.6rem' }}>
        {today.capitole.map((cap, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: '0.75rem 1rem',
              background: cap.citit
                ? 'rgba(34,197,94,0.06)'
                : 'var(--bg-primary)',
              border: `1px solid ${cap.citit
                ? 'rgba(34,197,94,0.2)'
                : 'var(--border-color)'}`,
              borderRadius: '10px'
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: cap.citit
                ? 'rgba(34,197,94,0.15)'
                : 'var(--bg-card)',
              border: `2px solid ${cap.citit ? '#22c55e' : 'var(--border-color)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', cursor: 'pointer'
            }}
              onClick={() => handleMarkCapitol(cap.carte, cap.capitol, cap.abreviere)}
            >
              {cap.citit ? '✓' : ''}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 600, color: 'var(--text-primary)',
                fontSize: '0.9rem',
                textDecoration: cap.citit ? 'line-through' : 'none',
                opacity: cap.citit ? 0.6 : 1
              }}>
                {cap.carte} {cap.capitol}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {cap.testament} • {cap.abreviere} {cap.capitol}
              </div>
            </div>

            <button
              onClick={() => handleOpenReader(cap.carte, cap.capitol)}
              style={{
                padding: '0.4rem 0.85rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem'
              }}
            >
              📖 Citește
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressCard = ({ procent, capitoleCitite, progress }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px', padding: '1.5rem'
  }}>
    <h3 style={{ margin: '0 0 1rem', color: 'var(--text-primary)' }}>
      📊 Progres general
    </h3>

    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: '0.5rem', fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        <span>{capitoleCitite} capitole citite</span>
        <span>{procent}%</span>
      </div>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: '999px',
        height: 16, overflow: 'hidden'
      }}>
        <div style={{
          width: `${procent}%`, height: '100%',
          background: 'linear-gradient(135deg,#f4d03f,#e67e22)',
          borderRadius: '999px',
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>

    {/* Milestones */}
    <div style={{
      display: 'flex', gap: '0.5rem', flexWrap: 'wrap'
    }}>
      {[10, 25, 50, 75, 100].map(milestone => (
        <div
          key={milestone}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            background: procent >= milestone
              ? 'rgba(212,175,55,0.15)'
              : 'var(--bg-primary)',
            border: `1px solid ${procent >= milestone
              ? 'rgba(212,175,55,0.4)'
              : 'var(--border-color)'}`,
            color: procent >= milestone
              ? 'var(--gold-primary)'
              : 'var(--text-muted)',
            fontSize: '0.8rem', fontWeight: 600
          }}
        >
          {procent >= milestone ? '🏆' : '○'} {milestone}%
        </div>
      ))}
    </div>

    {/* Ultimele citite */}
    {progress?.ultimeleCitite?.length > 0 && (
      <div style={{ marginTop: '1.25rem' }}>
        <div style={{
          fontSize: '0.8rem', color: 'var(--text-muted)',
          marginBottom: '0.5rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          Ultimele citite:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {progress.ultimeleCitite.map((c, i) => (
            <span
              key={i}
              style={{
                padding: '0.3rem 0.7rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}
            >
              {c.carte} {c.capitol}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const CarteCard = ({ carte, handleOpenReader, progress }) => {
  const [expanded, setExpanded] = useState(false);

  const capitoleArray = Array.from(
    { length: carte.capitole },
    (_, i) => i + 1
  );

  const cititeSet = new Set(
    (progress?.perCarte?.[carte.carte] || [])
  );

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${carte.terminata
        ? 'rgba(34,197,94,0.3)'
        : 'var(--border-color)'}`,
      borderRadius: '14px', overflow: 'hidden'
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '0.875rem 1rem', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: '0.75rem'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700, color: 'var(--text-primary)',
            fontSize: '0.9rem', marginBottom: '0.3rem'
          }}>
            {carte.terminata && '✅ '}{carte.carte}
          </div>
          {/* Mini progress bar */}
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '999px', height: 5,
            overflow: 'hidden', marginBottom: '0.2rem'
          }}>
            <div style={{
              width: `${carte.procent}%`, height: '100%',
              background: carte.terminata
                ? '#22c55e'
                : 'linear-gradient(135deg,#6366f1,#a78bfa)',
              borderRadius: '999px'
            }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {carte.capitoleCitite}/{carte.capitole} capitole
            • {carte.procent}%
            • {carte.testament}
          </div>
        </div>
        <span style={{
          color: 'var(--text-muted)', fontSize: '0.9rem'
        }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div style={{
          padding: '0 1rem 1rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            gap: '0.4rem', paddingTop: '0.75rem'
          }}>
            {capitoleArray.map(nr => {
              const isCitit = [...cititeSet].includes(nr);
              return (
                <button
                  key={nr}
                  onClick={() => handleOpenReader(carte.carte, nr)}
                  title={`${carte.carte} ${nr}`}
                  style={{
                    width: 36, height: 36,
                    borderRadius: '8px',
                    border: `1px solid ${isCitit
                      ? 'rgba(34,197,94,0.3)'
                      : 'var(--border-color)'}`,
                    background: isCitit
                      ? 'rgba(34,197,94,0.12)'
                      : 'var(--bg-primary)',
                    color: isCitit ? '#22c55e' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: '0.78rem',
                    fontWeight: isCitit ? 700 : 400
                  }}
                >
                  {nr}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarCard = ({ calendar }) => {
  const getLunaZi = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };

  const getZiSaptamana = (dateStr) => {
    const d = new Date(dateStr);
    return ['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()];
  };

  const maxCapitole = Math.max(...calendar.zile.map(z => z.capitole), 1);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px', padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
          🗓️ Calendarul ultimelor 30 zile
        </h3>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.5rem', fontWeight: 700,
              color: 'var(--gold-primary)'
            }}>
              {calendar.streakCurent}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              zile consecutiv 🔥
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.5rem', fontWeight: 700,
              color: 'var(--text-primary)'
            }}>
              {calendar.totalZileCuCitire}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              zile cu citire
            </div>
          </div>
        </div>
      </div>

      {/* Grid calendar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.35rem'
      }}>
        {/* Header săptămână */}
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((z, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: '0.7rem',
            color: 'var(--text-muted)', fontWeight: 600,
            paddingBottom: '0.4rem'
          }}>
            {z}
          </div>
        ))}

        {/* Zile */}
        {calendar.zile.map((zi, idx) => {
          const intensitate = zi.capitole > 0
            ? Math.max(0.2, zi.capitole / maxCapitole)
            : 0;

          return (
            <div
              key={idx}
              title={`${getLunaZi(zi.data)}: ${zi.capitole} capitole`}
              style={{
                aspectRatio: '1',
                borderRadius: '6px',
                background: zi.citit
                  ? `rgba(99,102,241,${intensitate})`
                  : 'var(--bg-primary)',
                border: `1px solid ${zi.citit
                  ? 'rgba(99,102,241,0.3)'
                  : 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default'
              }}
            >
              {zi.capitole > 0 && (
                <span style={{
                  fontSize: '0.6rem', color: 'white',
                  fontWeight: 700
                }}>
                  {zi.capitole}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legendă */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '0.5rem', marginTop: '1rem',
        fontSize: '0.75rem', color: 'var(--text-muted)'
      }}>
        <span>Mai puțin</span>
        {[0.15, 0.35, 0.55, 0.75, 1].map((op, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: '3px',
            background: `rgba(99,102,241,${op})`
          }} />
        ))}
        <span>Mai mult</span>
      </div>
    </div>
  );
};

export default ReadingPage;