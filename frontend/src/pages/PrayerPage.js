// frontend/src/pages/PrayerPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const CATEGORII = [
  { id: 'toate', label: 'Toate', icon: '🙏' },
  { id: 'sanatate', label: 'Sănătate', icon: '💊' },
  { id: 'familie', label: 'Familie', icon: '👨‍👩‍👧' },
  { id: 'munca', label: 'Muncă', icon: '💼' },
  { id: 'credinta', label: 'Credință', icon: '✝️' },
  { id: 'relatii', label: 'Relații', icon: '❤️' },
  { id: 'financiar', label: 'Financiar', icon: '🌿' },
  { id: 'multumire', label: 'Mulțumire', icon: '🌟' },
  { id: 'altele', label: 'Altele', icon: '📌' }
];

// ✅ HTTP helper cu fetch nativ - fără axios, fără api.js
const API_URL = process.env.REACT_APP_API_URL || '';

const http = {
  getToken: () => localStorage.getItem('token') || '',

  async get(path) {
    const r = await fetch(`${API_URL}${path}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || data.error || `Eroare ${r.status}`);
    return data;
  },

  async post(path, body = {}) {
    const r = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || data.error || `Eroare ${r.status}`);
    return data;
  },

  async patch(path, body = {}) {
    const r = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || data.error || `Eroare ${r.status}`);
    return data;
  },

  async delete(path) {
    const r = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || data.error || `Eroare ${r.status}`);
    return data;
  }
};

const PrayerPage = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  const [cereri, setCereri] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categorie, setCategorie] = useState('toate');
  const [sort, setSort] = useState('nou');
  const [tab, setTab] = useState('lista');
  const [form, setForm] = useState({
    titlu: '',
    cerere: '',
    categorie: 'altele',
    anonim: false,
    vizibilitate: 'public'
  });
  const [cereriMele, setCereriMele] = useState([]);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadStats = useCallback(async () => {
    try {
      const data = await http.get('/api/prayer/stats');
      if (data.success) setStats(data.stats);
    } catch (e) {
      console.error('Stats error:', e.message);
    }
  }, []);

  const loadCereri = useCallback(async () => {
    try {
      setLoading(true);
      const data = await http.get(
        `/api/prayer?categorie=${categorie}&sort=${sort}&limit=30`
      );
      if (data.success) setCereri(data.data);
    } catch (e) {
      console.error('Load cereri error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [categorie, sort]);

  const loadCereriMele = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await http.get('/api/prayer/ale-mele');
      if (data.success) setCereriMele(data.data);
    } catch (e) {
      console.error('Ale mele error:', e.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCereri();
    loadStats();
  }, [loadCereri, loadStats]);

  useEffect(() => {
    if (tab === 'ale-mele') loadCereriMele();
  }, [tab, loadCereriMele]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titlu.trim() || !form.cerere.trim()) {
      showToast('❌ Completează titlul și cererea!');
      return;
    }
    if (!isAuthenticated) {
      showToast('❌ Trebuie să fii autentificat!');
      return;
    }

    try {
      setSubmitting(true);
      const token = http.getToken();
      console.log('🔑 Submit - token preview:', token?.substring(0, 30));

      const data = await http.post('/api/prayer', form);
      if (data.success) {
        showToast('✅ Cererea a fost adăugată!');
        setForm({
          titlu: '',
          cerere: '',
          categorie: 'altele',
          anonim: false,
          vizibilitate: 'public'
        });
        setTab('lista');
        loadCereri();
        loadStats();
      }
    } catch (e) {
      console.error('Submit error:', e.message);
      showToast('❌ ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePray = async (id) => {
    try {
      const data = await http.post(`/api/prayer/${id}/pray`);
      if (data.success) {
        setCereri(prev => prev.map(c =>
          c._id === id
            ? { ...c, rugaciuni: data.rugaciuni, euMAmRugat: data.euMAmRugat }
            : c
        ));
        showToast(data.euMAmRugat ? '🙏 M-am rugat!' : '↩️ Anulat');
      }
    } catch (e) {
      showToast('❌ Eroare');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ștergi această cerere?')) return;
    try {
      await http.delete(`/api/prayer/${id}`);
      setCereri(prev => prev.filter(c => c._id !== id));
      setCereriMele(prev => prev.filter(c => c._id !== id));
      showToast('🗑️ Cerere ștearsă');
      loadStats();
    } catch (e) {
      console.error('Delete error:', e.message);
      showToast('❌ ' + e.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      const data = await http.patch(`/api/prayer/${id}/resolve`);
      if (data.success) {
        setCereri(prev => prev.map(c =>
          c._id === id ? { ...c, rezolvat: data.data.rezolvat } : c
        ));
        setCereriMele(prev => prev.map(c =>
          c._id === id ? { ...c, rezolvat: data.data.rezolvat } : c
        ));
        showToast(data.data.rezolvat ? '✅ Marcată ca răspunsă!' : '↩️ Reactivată');
        loadStats();
      }
    } catch (e) {
      showToast('❌ ' + e.message);
    }
  };

  const getCatIcon = (cat) => CATEGORII.find(c => c.id === cat)?.icon || '🙏';
  const getCatLabel = (cat) => CATEGORII.find(c => c.id === cat)?.label || cat;

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const diff = Date.now() - date.getTime();
    const ore = Math.floor(diff / 3600000);
    const zile = Math.floor(diff / 86400000);
    if (ore < 1) return 'acum câteva minute';
    if (ore < 24) return `acum ${ore}h`;
    if (zile < 7) return `acum ${zile} zile`;
    return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="prayer-page">

      {/* TOAST */}
      {toast && <div className="prayer-toast">{toast}</div>}

      {/* HERO */}
      <div className="prayer-hero">
        <div className="prayer-hero-bg" />
        <div className="prayer-hero-content">
          <div className="prayer-hero-icon">🙏</div>
          <h1 className="prayer-hero-title">Cereri de Rugăciune</h1>
          <p className="prayer-hero-sub">
            Împreună suntem mai puternici în rugăciune.
          </p>
          {stats && (
            <div className="prayer-stats-row">
              <div className="prayer-stat">
                <span className="prayer-stat-num">{stats.total}</span>
                <span className="prayer-stat-label">cereri active</span>
              </div>
              <div className="prayer-stat-divider" />
              <div className="prayer-stat">
                <span className="prayer-stat-num">{stats.rugaciuniTotal}</span>
                <span className="prayer-stat-label">rugăciuni oferite</span>
              </div>
              <div className="prayer-stat-divider" />
              <div className="prayer-stat">
                <span className="prayer-stat-num">{stats.rezolvate}</span>
                <span className="prayer-stat-label">rugăciuni răspunse</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="prayer-tabs">
        <button
          className={`prayer-tab ${tab === 'lista' ? 'active' : ''}`}
          onClick={() => setTab('lista')}
        >
          📋 Cereri ({stats?.total || 0})
        </button>
        <button
          className={`prayer-tab ${tab === 'adauga' ? 'active' : ''}`}
          onClick={() => {
            if (!isAuthenticated) {
              showToast('🔑 Trebuie să fii autentificat!');
              return;
            }
            setTab('adauga');
          }}
        >
          ➕ Adaugă
        </button>
        {isAuthenticated && (
          <button
            className={`prayer-tab ${tab === 'ale-mele' ? 'active' : ''}`}
            onClick={() => setTab('ale-mele')}
          >
            👤 Ale mele
          </button>
        )}
      </div>

      {/* LISTA */}
      {tab === 'lista' && (
        <div className="prayer-lista">
          <div className="prayer-filters">
            <div className="prayer-cats">
              {CATEGORII.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategorie(cat.id)}
                  className={`prayer-cat-btn ${categorie === cat.id ? 'active' : ''}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
            <div className="prayer-sort">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
              >
                <option value="nou">🕐 Cele mai noi</option>
                <option value="rugaciuni">🙏 Cele mai rugăciuni</option>
                <option value="vechi">📅 Cele mai vechi</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="prayer-loading">
              <div className="spinner" />
              <p>Se încarcă...</p>
            </div>
          ) : cereri.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🙏</div>
              <div className="empty-state-title">Nu există cereri</div>
              <button
                className="btn btn-gold"
                onClick={() => setTab('adauga')}
                style={{ marginTop: '1rem' }}
              >
                ➕ Adaugă cerere
              </button>
            </div>
          ) : (
            <div className="prayer-cards">
              {cereri.map(cerere => (
                <PrayerCard
                  key={cerere._id}
                  cerere={cerere}
                  onPray={handlePray}
                  onDelete={handleDelete}
                  onResolve={handleResolve}
                  getCatIcon={getCatIcon}
                  getCatLabel={getCatLabel}
                  formatDate={formatDate}
                  currentUserId={user?._id || user?.id}
                  isAdminUser={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADAUGĂ */}
      {tab === 'adauga' && (
        <div className="prayer-form-wrap">
          <div className="prayer-form-card">
            <div className="prayer-form-header">
              <h2 className="prayer-form-title">🙏 Adaugă cererea ta</h2>
              <p className="prayer-form-sub">
                Comunitatea va fi alături de tine în rugăciune.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="prayer-form">
              <div className="form-group">
                <label className="form-label">Titlu *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ex: Rugăciune pentru vindecarea mamei"
                  value={form.titlu}
                  onChange={e => setForm(p => ({ ...p, titlu: e.target.value }))}
                  maxLength={100}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>
                  {form.titlu.length}/100
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cererea ta *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Scrie cererea ta de rugăciune..."
                  value={form.cerere}
                  onChange={e => setForm(p => ({ ...p, cerere: e.target.value }))}
                  maxLength={1000}
                  rows={5}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>
                  {form.cerere.length}/1000
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Categorie</label>
                <div className="prayer-cat-grid">
                  {CATEGORII.filter(c => c.id !== 'toate').map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, categorie: cat.id }))}
                      className={`prayer-cat-select ${form.categorie === cat.id ? 'active' : ''}`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="prayer-option-row">
                <input
                  type="checkbox"
                  checked={form.anonim}
                  onChange={e => setForm(p => ({ ...p, anonim: e.target.checked }))}
                  style={{ accentColor: 'var(--gold-primary)', width: 16, height: 16 }}
                />
                <span>Postează anonim</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  (numele nu va fi afișat)
                </span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-gold btn-block"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Se salvează...' : '🙏 Adaugă cererea'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setTab('lista')}
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>

          <div className="prayer-encourage">
            <div className="prayer-encourage-icon">✝️</div>
            <p className="prayer-encourage-text">
              „Rugăciunea fierbinte a celui drept are mare putere."
            </p>
            <span className="prayer-encourage-ref">— Iacov 5:16</span>
          </div>
        </div>
      )}

      {/* ALE MELE */}
      {tab === 'ale-mele' && isAuthenticated && (
        <div className="prayer-mele">
          {cereriMele.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🙏</div>
              <div className="empty-state-title">Nu ai cereri</div>
              <button
                className="btn btn-gold"
                onClick={() => setTab('adauga')}
                style={{ marginTop: '1rem' }}
              >
                ➕ Prima cerere
              </button>
            </div>
          ) : (
            <div className="prayer-cards">
              {cereriMele.map(cerere => (
                <div
                  key={cerere._id}
                  className={`prayer-card my-card ${cerere.rezolvat ? 'resolved' : ''}`}
                >
                  <div className="prayer-card-top">
                    <span className="prayer-cat-badge">
                      {getCatIcon(cerere.categorie)} {getCatLabel(cerere.categorie)}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {cerere.rezolvat && (
                        <span className="prayer-resolved-badge">✅ Răspunsă</span>
                      )}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formatDate(cerere.createdAt)}
                      </span>
                    </div>
                  </div>
                  <h3 className="prayer-card-title">{cerere.titlu}</h3>
                  <p className="prayer-card-text">{cerere.cerere}</p>
                  <div className="prayer-card-bottom">
                    <div className="prayer-rugaciuni">🙏 {cerere.rugaciuni} rugăciuni</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleResolve(cerere._id)}
                        className={`btn btn-sm ${cerere.rezolvat ? 'btn-secondary' : 'btn-outline'}`}
                      >
                        {cerere.rezolvat ? '↩️ Reactivează' : '✅ Răspunsă'}
                      </button>
                      <button
                        onClick={() => handleDelete(cerere._id)}
                        className="btn btn-sm btn-danger"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════
// PRAYER CARD
// ═══════════════════════════════════════
const PrayerCard = ({
  cerere,
  onPray,
  onDelete,
  onResolve,
  getCatIcon,
  getCatLabel,
  formatDate,
  currentUserId,
  isAdminUser
}) => {
  const [praying, setPraying] = useState(false);

  const handlePray = async () => {
    if (praying) return;
    setPraying(true);
    await onPray(cerere._id);
    setTimeout(() => setPraying(false), 1000);
  };

  // Verifică dacă poate șterge/edita
  const ownerId = cerere.userId?.toString ? cerere.userId.toString() : cerere.userId;
  const userId = currentUserId?.toString ? currentUserId.toString() : currentUserId;
  const canModify = isAdminUser || (userId && ownerId && ownerId === userId) || cerere.poateSterge;

  return (
    <div className={`prayer-card ${cerere.rezolvat ? 'resolved' : ''}`}>
      <div className="prayer-card-top">
        <span className="prayer-cat-badge">
          {getCatIcon(cerere.categorie)} {getCatLabel(cerere.categorie)}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {cerere.rezolvat && (
            <span className="prayer-resolved-badge">✅ Răspunsă</span>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {formatDate(cerere.createdAt)}
          </span>
        </div>
      </div>

      <h3 className="prayer-card-title">{cerere.titlu}</h3>
      <p className="prayer-card-text">{cerere.cerere}</p>

      <div className="prayer-card-bottom">
        <div className="prayer-card-author">
          <span className="prayer-author-avatar">
            {cerere.numeAfisat?.[0]?.toUpperCase() || '?'}
          </span>
          <span className="prayer-author-name">{cerere.numeAfisat}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={handlePray}
            disabled={praying}
            className={`prayer-pray-btn ${cerere.euMAmRugat ? 'prayed' : ''}`}
          >
            <span className="prayer-pray-icon">🙏</span>
            <span>{cerere.rugaciuni}</span>
            <span className="prayer-pray-label">
              {cerere.euMAmRugat ? 'Rugat' : 'Roagă-te'}
            </span>
          </button>

          {canModify && (
            <>
              <button
                onClick={() => onResolve(cerere._id)}
                className="prayer-action-btn"
                title={cerere.rezolvat ? 'Reactivează' : 'Marchează răspunsă'}
              >
                {cerere.rezolvat ? '↩️' : '✅'}
              </button>
              <button
                onClick={() => onDelete(cerere._id)}
                className="prayer-action-btn danger"
                title="Șterge"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerPage;