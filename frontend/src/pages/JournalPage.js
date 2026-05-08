// frontend/src/pages/JournalPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || '';

const STARI = [
  { id: 'recunoscator', emoji: '🙏', label: 'Recunoscător' },
  { id: 'bucuros', emoji: '😊', label: 'Bucuros' },
  { id: 'linistit', emoji: '😌', label: 'Liniștit' },
  { id: 'incercat', emoji: '💪', label: 'Încercat' },
  { id: 'trist', emoji: '😢', label: 'Trist' },
  { id: 'confuz', emoji: '🤔', label: 'Confuz' },
  { id: 'hotarat', emoji: '🔥', label: 'Hotărât' },
  { id: 'plin_de_har', emoji: '✨', label: 'Plin de har' }
];

const getStareInfo = (id) => STARI.find(s => s.id === id) || STARI[0];

const getDateKey = (date = new Date()) => date.toISOString().split('T')[0];

const formatDate = (dateKey) => {
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const http = {
  token: () => localStorage.getItem('token') || '',
  async get(path) {
    const r = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${this.token()}` }
    });
    return r.json();
  },
  async post(path, body = {}) {
    const r = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return r.json();
  },
  async delete(path) {
    const r = await fetch(`${API}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.token()}` }
    });
    return r.json();
  }
};

const JournalPage = () => {
  const { isAuthenticated } = useAuth();

  // View state
  const [view, setView] = useState('today'); // today | list | calendar
  const [selectedDate, setSelectedDate] = useState(getDateKey());

  // Form state
  const [notita, setNotita] = useState('');
  const [cuvant, setCuvant] = useState('');
  const [stare, setStare] = useState('recunoscator');
  const [versetText, setVersetText] = useState('');
  const [versetRef, setVersetRef] = useState('');
  const [rugaciune, setRugaciune] = useState('');

  // Data state
  const [entries, setEntries] = useState([]);
  const [calendarMap, setCalendarMap] = useState({});
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Calendar
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // ═══════════════════════════════════════
  // LOAD
  // ═══════════════════════════════════════
  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const [todayR, devR] = await Promise.all([
        http.get(`/api/journal/today`),
        http.get(`/api/devotionals/today`).catch(() => null)
      ]);

      if (todayR.success && todayR.data) {
        const d = todayR.data;
        setNotita(d.notita || '');
        setCuvant(d.cuvantDeLaDumnezeu || '');
        setStare(d.stare || 'recunoscator');
        setVersetText(d.vpierset?.text || '');
        setVersetRef(d.vpierset?.referinta || '');
        setRugaciune(d.rugaciune || '');
        setEditing(true);
      } else {
        resetForm();
        // Pre-fill versetul zilei din devoțional
        if (devR?.success && devR?.data) {
          setVersetText(devR.data.verseText || '');
          setVersetRef(devR.data.verseReference || '');
        }
        setEditing(false);
      }
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  const loadEntry = useCallback(async (dateKey) => {
    setLoading(true);
    try {
      const r = await http.get(`/api/journal/${dateKey}`);
      if (r.success && r.data) {
        const d = r.data;
        setNotita(d.notita || '');
        setCuvant(d.cuvantDeLaDumnezeu || '');
        setStare(d.stare || 'recunoscator');
        setVersetText(d.vpierset?.text || '');
        setVersetRef(d.vpierset?.referinta || '');
        setRugaciune(d.rugaciune || '');
        setEditing(true);
      } else {
        resetForm();
        setEditing(false);
      }
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  const loadEntries = useCallback(async (p = 1, s = '') => {
    setLoading(true);
    try {
      const params = `?page=${p}&limit=20${s ? `&search=${encodeURIComponent(s)}` : ''}`;
      const r = await http.get(`/api/journal${params}`);
      if (r.success) {
        setEntries(r.data);
        setTotal(r.total);
        setPage(r.page);
      }
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  const loadCalendar = useCallback(async () => {
    try {
      const r = await http.get('/api/journal/calendar');
      if (r.success) setCalendarMap(r.map);
    } catch (e) {}
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const r = await http.get('/api/journal/stats/summary');
      if (r.success) setStats(r.stats);
    } catch (e) {}
  }, []);

  // Initial load
  useEffect(() => {
    if (!isAuthenticated) return;
    loadToday();
    loadCalendar();
    loadStats();
  }, [isAuthenticated, loadToday, loadCalendar, loadStats]);

  // Load entries on list view
  useEffect(() => {
    if (view === 'list') loadEntries(1, search);
  }, [view]);

  // ═══════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════
  const resetForm = () => {
    setNotita('');
    setCuvant('');
    setStare('recunoscator');
    setVersetText('');
    setVersetRef('');
    setRugaciune('');
    setEditing(false);
    setShowDelete(false);
  };

  const handleSave = async () => {
    if (!notita.trim() && !cuvant.trim() && !rugaciune.trim()) {
      setMessage('Scrie cel puțin o notiță, un cuvânt sau o rugăciune.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSaving(true);
    try {
      const r = await http.post('/api/journal', {
        dateKey: selectedDate,
        notita,
        cuvantDeLaDumnezeu: cuvant,
        stare,
        vpierset: { text: versetText, referinta: versetRef },
        rugaciune
      });

      if (r.success) {
        setMessage(editing ? 'Jurnal actualizat 🕊️' : 'Jurnal salvat 🕊️');
        setEditing(true);
        loadCalendar();
        loadStats();
      } else {
        setMessage(r.error || 'Eroare la salvare');
      }
    } catch (e) {
      setMessage('Eroare la salvare');
    }
    finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async () => {
    try {
      const r = await http.delete(`/api/journal/${selectedDate}`);
      if (r.success) {
        resetForm();
        setMessage('Intrare ștearsă');
        loadCalendar();
        loadStats();
      }
    } catch (e) {}
    finally {
      setShowDelete(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSearch = () => {
    loadEntries(1, search);
  };

  const handleSelectDay = (dateKey) => {
    setSelectedDate(dateKey);
    setView('today');
    loadEntry(dateKey);
  };

  const handleToday = () => {
    setSelectedDate(getDateKey());
    setView('today');
    loadToday();
  };

  // ═══════════════════════════════════════
  // CALENDAR HELPERS
  // ═══════════════════════════════════════
  const getCalendarDays = () => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay() || 7; // luni = 1

    const days = [];

    // Zile goale înainte
    for (let i = 1; i < startDay; i++) {
      days.push({ day: null, dateKey: null });
    }

    // Zilele lunii
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateKey,
        stare: calendarMap[dateKey] || null,
        isToday: dateKey === getDateKey(),
        isSelected: dateKey === selectedDate
      });
    }

    return days;
  };

  const prevMonth = () => {
    const [y, m] = calendarMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const [y, m] = calendarMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const getMonthLabel = () => {
    const [y, m] = calendarMonth.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('ro-RO', {
      month: 'long',
      year: 'numeric'
    });
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="jn-page">
        <div className="jn-auth-prompt">
          <div className="jn-auth-icon">📔</div>
          <h2>Jurnal Spiritual</h2>
          <p>Autentifică-te pentru a accesa jurnalul tău privat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jn-page">

      {/* ═══ HERO ═══ */}
      <div className="jn-hero">
        <div className="jn-hero-bg" />
        <div className="jn-hero-content">
          <div className="jn-hero-icon">📔</div>
          <h1 className="jn-hero-title">Jurnal Spiritual</h1>
          <p className="jn-hero-sub">
            Un loc doar al tău — pentru gânduri, rugăciuni și pași cu Dumnezeu.
          </p>

          {stats && (
            <div className="jn-hero-stats">
              <div className="jn-hero-stat">
                <span className="jn-hero-stat-num">{stats.totalIntrari}</span>
                <span className="jn-hero-stat-label">intrări</span>
              </div>
              {stats.ultimaIntrare && (
                <div className="jn-hero-stat">
                  <span className="jn-hero-stat-num">📅</span>
                  <span className="jn-hero-stat-label">ultima: {stats.ultimaIntrare}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="jn-tabs">
        <button
          className={`jn-tab ${view === 'today' ? 'activ' : ''}`}
          onClick={handleToday}
        >
          ✏️ Scrie
        </button>
        <button
          className={`jn-tab ${view === 'list' ? 'activ' : ''}`}
          onClick={() => setView('list')}
        >
          📋 Istoric
        </button>
        <button
          className={`jn-tab ${view === 'calendar' ? 'activ' : ''}`}
          onClick={() => setView('calendar')}
        >
          📅 Calendar
        </button>
      </div>

      {/* ═══ MESSAGE ═══ */}
      {message && (
        <div className="jn-message">{message}</div>
      )}

      {/* ═══ VIEW: SCRIE ═══ */}
      {view === 'today' && (
        <div className="jn-content">

          {/* Data */}
          <div className="jn-date-header">
            <span className="jn-date-label">📅 {formatDate(selectedDate)}</span>
            {selectedDate !== getDateKey() && (
              <button className="jn-today-btn" onClick={handleToday}>
                Mergi la azi →
              </button>
            )}
            {editing && (
              <span className="jn-editing-badge">✏️ Editare</span>
            )}
          </div>

          {loading ? (
            <div className="jn-loading">Se încarcă...</div>
          ) : (
            <>
              {/* Stare spirituală */}
              <div className="jn-section">
                <div className="jn-section-title">😊 Cum te simți spiritual azi?</div>
                <div className="jn-stari-grid">
                  {STARI.map(s => (
                    <button
                      key={s.id}
                      className={`jn-stare-btn ${stare === s.id ? 'activ' : ''}`}
                      onClick={() => setStare(s.id)}
                    >
                      <span className="jn-stare-emoji">{s.emoji}</span>
                      <span className="jn-stare-label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notiță */}
              <div className="jn-section">
                <div className="jn-section-title">📝 Gândurile tale de azi</div>
                <textarea
                  className="jn-textarea"
                  placeholder="Ce ai pe suflet azi? Scrie liber..."
                  value={notita}
                  onChange={e => setNotita(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Cuvânt de la Dumnezeu */}
              <div className="jn-section">
                <div className="jn-section-title">🙏 Ce ți-a vorbit Dumnezeu azi?</div>
                <textarea
                  className="jn-textarea"
                  placeholder="Un gând, o convingere, o direcție..."
                  value={cuvant}
                  onChange={e => setCuvant(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Verset */}
              <div className="jn-section">
                <div className="jn-section-title">📖 Versetul zilei</div>
                <textarea
                  className="jn-textarea jn-textarea-sm"
                  placeholder="Textul versetului..."
                  value={versetText}
                  onChange={e => setVersetText(e.target.value)}
                  rows={2}
                />
                <input
                  className="jn-input"
                  placeholder="Referința (ex: Ioan 3:16)"
                  value={versetRef}
                  onChange={e => setVersetRef(e.target.value)}
                />
              </div>

              {/* Rugăciune */}
              <div className="jn-section">
                <div className="jn-section-title">💫 Rugăciunea ta</div>
                <textarea
                  className="jn-textarea"
                  placeholder="O rugăciune personală pentru azi..."
                  value={rugaciune}
                  onChange={e => setRugaciune(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="jn-actions">
                <button
                  className="jn-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? '⏳ Se salvează...'
                    : editing
                      ? '💾 Actualizează'
                      : '🕊️ Salvează în jurnal'
                  }
                </button>

                {editing && (
                  <button
                    className="jn-delete-btn"
                    onClick={() => setShowDelete(true)}
                  >
                    🗑️ Șterge
                  </button>
                )}
              </div>

              {/* Confirm delete */}
              {showDelete && (
                <div className="jn-confirm-delete">
                  <p>Sigur vrei să ștergi această intrare?</p>
                  <div className="jn-confirm-btns">
                    <button className="jn-confirm-yes" onClick={handleDelete}>
                      Da, șterge
                    </button>
                    <button className="jn-confirm-no" onClick={() => setShowDelete(false)}>
                      Anulează
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ VIEW: ISTORIC ═══ */}
      {view === 'list' && (
        <div className="jn-content">

          {/* Search */}
          <div className="jn-search-row">
            <input
              className="jn-search-input"
              placeholder="🔍 Caută în jurnal..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="jn-search-btn" onClick={handleSearch}>
              Caută
            </button>
          </div>

          {loading ? (
            <div className="jn-loading">Se încarcă...</div>
          ) : entries.length === 0 ? (
            <div className="jn-empty">
              <div className="jn-empty-icon">📔</div>
              <p>Nu ai încă intrări în jurnal.</p>
              <button className="jn-empty-btn" onClick={handleToday}>
                ✏️ Scrie prima intrare
              </button>
            </div>
          ) : (
            <>
              <div className="jn-entries-list">
                {entries.map(entry => {
                  const stareInfo = getStareInfo(entry.stare);
                  return (
                    <div
                      key={entry.dateKey}
                      className="jn-entry-card"
                      onClick={() => handleSelectDay(entry.dateKey)}
                    >
                      <div className="jn-entry-header">
                        <span className="jn-entry-stare">{stareInfo.emoji}</span>
                        <span className="jn-entry-date">
                          {formatDate(entry.dateKey)}
                        </span>
                      </div>

                      {entry.notita && (
                        <p className="jn-entry-text">
                          {entry.notita.length > 120
                            ? entry.notita.substring(0, 120) + '...'
                            : entry.notita
                          }
                        </p>
                      )}

                      {entry.vpierset?.referinta && (
                        <div className="jn-entry-verset">
                          📖 {entry.vpierset.referinta}
                        </div>
                      )}

                      <div className="jn-entry-arrow">→</div>
                    </div>
                  );
                })}
              </div>

              {/* Paginare */}
              {total > 20 && (
                <div className="jn-pagination">
                  <button
                    className="jn-page-btn"
                    disabled={page <= 1}
                    onClick={() => loadEntries(page - 1, search)}
                  >
                    ← Anterior
                  </button>
                  <span className="jn-page-info">Pagina {page}</span>
                  <button
                    className="jn-page-btn"
                    disabled={entries.length < 20}
                    onClick={() => loadEntries(page + 1, search)}
                  >
                    Următor →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ VIEW: CALENDAR ═══ */}
      {view === 'calendar' && (
        <div className="jn-content">

          <div className="jn-cal-header">
            <button className="jn-cal-nav" onClick={prevMonth}>←</button>
            <span className="jn-cal-month">{getMonthLabel()}</span>
            <button className="jn-cal-nav" onClick={nextMonth}>→</button>
          </div>

          <div className="jn-cal-weekdays">
            {['L', 'M', 'Mi', 'J', 'V', 'S', 'D'].map(z => (
              <div key={z} className="jn-cal-weekday">{z}</div>
            ))}
          </div>

          <div className="jn-cal-grid">
            {getCalendarDays().map((d, i) => (
              <div
                key={i}
                className={`jn-cal-day ${d.day ? '' : 'jn-cal-empty'} ${d.stare ? 'jn-cal-has' : ''} ${d.isToday ? 'jn-cal-today' : ''} ${d.isSelected ? 'jn-cal-selected' : ''}`}
                onClick={() => d.day && handleSelectDay(d.dateKey)}
              >
                {d.day && (
                  <>
                    <span className="jn-cal-day-num">{d.day}</span>
                    {d.stare && (
                      <span className="jn-cal-day-stare">
                        {getStareInfo(d.stare).emoji}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Legendă */}
          <div className="jn-cal-legend">
            <span className="jn-cal-legend-item">
              <span className="jn-cal-legend-dot jn-cal-legend-has" /> Ai scris
            </span>
            <span className="jn-cal-legend-item">
              <span className="jn-cal-legend-dot jn-cal-legend-today" /> Azi
            </span>
          </div>

        </div>
      )}

    </div>
  );
};

export default JournalPage;