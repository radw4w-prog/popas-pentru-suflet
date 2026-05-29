'use client';
// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const http = {
  token: () => localStorage.getItem('token') || '',
  async get(path) {
    const r = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${this.token()}` }
    });
    return r.json();
  },
  async put(path, body = {}) {
    const r = await fetch(`${API}${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const ProfilePage = () => {
  const { user: authUser, logout } = useAuth();

  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabActiv, setTabActiv] = useState('profil');

  // Edit nume
  const [numeNou, setNumeNou] = useState('');
  const [savingNume, setSavingNume] = useState(false);
  const [messageNume, setMessageNume] = useState('');

  // Edit parola
  const [parolaVeche, setParolaVeche] = useState('');
  const [parolaNoua, setParolaNoua] = useState('');
  const [parolaConfirm, setParolaConfirm] = useState('');
  const [savingParola, setSavingParola] = useState(false);
  const [messageParola, setMessageParola] = useState('');

  // Avatar
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [messageAvatar, setMessageAvatar] = useState('');

  // ═══════════════════════════════════════
  // LOAD
  // ═══════════════════════════════════════
  const loadProfil = useCallback(async () => {
    setLoading(true);
    try {
      const r = await http.get('/api/profile/me');
      if (r.success) {
        setProfil(r);
        setNumeNou(r.user.nume || '');
      }
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadProfil();
  }, [loadProfil]);

  // ═══════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════
  const handleSaveNume = async () => {
    if (!numeNou.trim() || numeNou.trim() === profil?.user?.nume) return;
    setSavingNume(true);
    try {
      const r = await http.put('/api/profile/me', { nume: numeNou.trim() });
      if (r.success) {
        setMessageNume('✅ Numele a fost actualizat.');
        setProfil(prev => ({
          ...prev,
          user: { ...prev.user, nume: r.user.nume }
        }));
      } else {
        setMessageNume('❌ ' + (r.error || 'Eroare'));
      }
    } catch (e) {
      setMessageNume('❌ Eroare la salvare');
    }
    finally {
      setSavingNume(false);
      setTimeout(() => setMessageNume(''), 3000);
    }
  };

  const handleSaveParola = async () => {
    if (!parolaNoua || parolaNoua.length < 6) {
      setMessageParola('❌ Parola trebuie să aibă cel puțin 6 caractere.');
      setTimeout(() => setMessageParola(''), 3000);
      return;
    }
    if (parolaNoua !== parolaConfirm) {
      setMessageParola('❌ Parolele nu coincid.');
      setTimeout(() => setMessageParola(''), 3000);
      return;
    }
    setSavingParola(true);
    try {
      const r = await http.put('/api/profile/password', {
        parolaVeche,
        parolaNoua
      });
      if (r.success) {
        setMessageParola('✅ Parola a fost schimbată.');
        setParolaVeche('');
        setParolaNoua('');
        setParolaConfirm('');
      } else {
        setMessageParola('❌ ' + (r.error || 'Eroare'));
      }
    } catch (e) {
      setMessageParola('❌ Eroare la salvare');
    }
    finally {
      setSavingParola(false);
      setTimeout(() => setMessageParola(''), 3000);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessageAvatar('❌ Selectează o imagine.');
      return;
    }

    if (file.size > 500 * 1024) {
      setMessageAvatar('❌ Imaginea trebuie să fie sub 500KB.');
      setTimeout(() => setMessageAvatar(''), 3000);
      return;
    }

    setSavingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const r = await http.post('/api/profile/avatar', { avatar: reader.result });
        if (r.success) {
          setMessageAvatar('✅ Avatar actualizat.');
          setProfil(prev => ({
            ...prev,
            user: { ...prev.user, avatar: r.avatar }
          }));
        } else {
          setMessageAvatar('❌ ' + (r.error || 'Eroare'));
        }
      } catch (ex) {
        setMessageAvatar('❌ Eroare la upload');
      }
      finally {
        setSavingAvatar(false);
        setTimeout(() => setMessageAvatar(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = async () => {
    setSavingAvatar(true);
    try {
      const r = await http.delete('/api/profile/avatar');
      if (r.success) {
        setProfil(prev => ({
          ...prev,
          user: { ...prev.user, avatar: null }
        }));
        setMessageAvatar('✅ Avatar șters.');
      }
    } catch (e) {}
    finally {
      setSavingAvatar(false);
      setTimeout(() => setMessageAvatar(''), 3000);
    }
  };

  // ═══════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  if (loading) {
    return (
      <div className="pr-loading">
        <div className="pr-loading-icon">🕊️</div>
        <div className="pr-loading-text">Se încarcă profilul...</div>
      </div>
    );
  }

  if (!profil) return null;

  const { user, stats, journey } = profil;

  return (
    <div className="pr-page">

      {/* ═══ HERO ═══ */}
      <div className="pr-hero">
        <div className="pr-hero-bg" />
        <div className="pr-hero-content">

          {/* Avatar */}
          <div className="pr-avatar-wrap">
            {user.avatar ? (
              <img src={user.avatar} alt={user.nume} className="pr-avatar-img" />
            ) : (
              <div className="pr-avatar-initials">
                {getInitials(user.nume)}
              </div>
            )}
            <label className="pr-avatar-edit" title="Schimbă avatarul">
              📷
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {messageAvatar && (
            <div className="pr-avatar-msg">{messageAvatar}</div>
          )}

          {user.avatar && (
            <button className="pr-avatar-delete" onClick={handleDeleteAvatar}>
              Șterge avatarul
            </button>
          )}

          {/* Nume + email */}
          <h1 className="pr-hero-name">{user.nume}</h1>
          <p className="pr-hero-email">{user.email}</p>

          {/* Badges */}
          <div className="pr-hero-badges">
            {user.rol === 'admin' && (
              <span className="pr-badge pr-badge-admin">🛡️ Admin</span>
            )}
            {user.facebookConectat && (
              <span className="pr-badge pr-badge-fb">📘 Facebook</span>
            )}
            {journey?.nivel && (
              <span className="pr-badge pr-badge-nivel">
                {journey.nivel.icon} {journey.nivel.label}
              </span>
            )}
          </div>

          {/* Streak */}
          {journey?.streak && (
            <div className="pr-streak-hero">
              <span className="pr-streak-icon">
                {journey.streak.curent >= 7 ? '🔥' : '🌱'}
              </span>
              <span className="pr-streak-num">{journey.streak.curent}</span>
              <span className="pr-streak-label">
                {journey.streak.curent === 1 ? 'zi consecutivă' : 'zile consecutive'}
              </span>
            </div>
          )}

          <p className="pr-hero-membru">
            Membru din {formatDate(user.membruDin)}
          </p>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="pr-tabs">
        {[
          { id: 'profil', label: '👤 Profil' },
          { id: 'stats', label: '📊 Statistici' },
          { id: 'badges', label: '🏆 Repere' },
          { id: 'setari', label: '⚙️ Setări' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`pr-tab ${tabActiv === tab.id ? 'activ' : ''}`}
            onClick={() => setTabActiv(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: PROFIL ═══ */}
      {tabActiv === 'profil' && (
        <div className="pr-content">

          {/* Editare nume */}
          <div className="pr-card">
            <div className="pr-card-title">✏️ Editare nume</div>
            <input
              className="pr-input"
              value={numeNou}
              onChange={e => setNumeNou(e.target.value)}
              placeholder="Numele tău"
            />
            {messageNume && <div className="pr-msg">{messageNume}</div>}
            <button
              className="pr-btn-primary"
              onClick={handleSaveNume}
              disabled={savingNume || numeNou.trim() === user.nume}
            >
              {savingNume ? '⏳ Se salvează...' : '💾 Salvează numele'}
            </button>
          </div>

          {/* Info cont */}
          <div className="pr-card">
            <div className="pr-card-title">📋 Informații cont</div>
            <div className="pr-info-row">
              <span className="pr-info-label">Email</span>
              <span className="pr-info-val">{user.email}</span>
            </div>
            <div className="pr-info-row">
              <span className="pr-info-label">Rol</span>
              <span className="pr-info-val">
                {user.rol === 'admin' ? '🛡️ Administrator' : '👤 Utilizator'}
              </span>
            </div>
            <div className="pr-info-row">
              <span className="pr-info-label">Facebook</span>
              <span className="pr-info-val">
                {user.facebookConectat ? '✅ Conectat' : '❌ Neconectat'}
              </span>
            </div>
            <div className="pr-info-row">
              <span className="pr-info-label">Membru din</span>
              <span className="pr-info-val">{formatDate(user.membruDin)}</span>
            </div>
            {user.lastLogin && (
              <div className="pr-info-row">
                <span className="pr-info-label">Ultima autentificare</span>
                <span className="pr-info-val">{formatDate(user.lastLogin)}</span>
              </div>
            )}
          </div>

          {/* Schimbare parolă */}
          {!user.facebookConectat && (
            <div className="pr-card">
              <div className="pr-card-title">🔒 Schimbare parolă</div>
              <input
                className="pr-input"
                type="password"
                placeholder="Parola actuală"
                value={parolaVeche}
                onChange={e => setParolaVeche(e.target.value)}
              />
              <input
                className="pr-input"
                type="password"
                placeholder="Parola nouă (minim 6 caractere)"
                value={parolaNoua}
                onChange={e => setParolaNoua(e.target.value)}
              />
              <input
                className="pr-input"
                type="password"
                placeholder="Confirmă parola nouă"
                value={parolaConfirm}
                onChange={e => setParolaConfirm(e.target.value)}
              />
              {messageParola && <div className="pr-msg">{messageParola}</div>}
              <button
                className="pr-btn-primary"
                onClick={handleSaveParola}
                disabled={savingParola}
              >
                {savingParola ? '⏳ Se salvează...' : '🔒 Schimbă parola'}
              </button>
            </div>
          )}

        </div>
      )}

      {/* ═══ TAB: STATISTICI ═══ */}
      {tabActiv === 'stats' && (
        <div className="pr-content">

          <div className="pr-stats-grid">
            <div className="pr-stat-card">
              <div className="pr-stat-icon">📖</div>
              <div className="pr-stat-num">{stats.capitoleCitite}</div>
              <div className="pr-stat-label">capitole citite</div>
              <div className="pr-stat-bar">
                <div
                  className="pr-stat-fill pr-fill-blue"
                  style={{ width: `${Math.min(100, stats.procentBiblie)}%` }}
                />
              </div>
              <div className="pr-stat-sub">{stats.procentBiblie}% din Biblie</div>
            </div>

            <div className="pr-stat-card">
              <div className="pr-stat-icon">🎧</div>
              <div className="pr-stat-num">{stats.audioComplete}</div>
              <div className="pr-stat-label">capitole audio complete</div>
              <div className="pr-stat-bar">
                <div
                  className="pr-stat-fill pr-fill-purple"
                  style={{ width: `${Math.min(100, (stats.audioComplete / 1189) * 100)}%` }}
                />
              </div>
              <div className="pr-stat-sub">
                {Math.round((stats.audioComplete / 1189) * 100)}% din Biblie
              </div>
            </div>

            <div className="pr-stat-card">
              <div className="pr-stat-icon">📔</div>
              <div className="pr-stat-num">{stats.jurnalIntrari}</div>
              <div className="pr-stat-label">intrări jurnal</div>
            </div>

            <div className="pr-stat-card">
              <div className="pr-stat-icon">🙏</div>
              <div className="pr-stat-num">{stats.rugaciuniPostate}</div>
              <div className="pr-stat-label">cereri de rugăciune</div>
            </div>

            <div className="pr-stat-card">
              <div className="pr-stat-icon">🔖</div>
              <div className="pr-stat-num">{stats.bookmarks}</div>
              <div className="pr-stat-label">bookmarks</div>
            </div>

            {journey && (
              <div className="pr-stat-card">
                <div className="pr-stat-icon">📅</div>
                <div className="pr-stat-num">{journey.totalZileActive}</div>
                <div className="pr-stat-label">zile active total</div>
              </div>
            )}
          </div>

          {/* Journey sumar */}
          {journey && (
            <div className="pr-card">
              <div className="pr-card-title">🕊️ Călătoria spirituală</div>
              <div className="pr-info-row">
                <span className="pr-info-label">Streak curent</span>
                <span className="pr-info-val">🔥 {journey.streak.curent} zile</span>
              </div>
              <div className="pr-info-row">
                <span className="pr-info-label">Record personal</span>
                <span className="pr-info-val">👑 {journey.streak.maxim} zile</span>
              </div>
              <div className="pr-info-row">
                <span className="pr-info-label">Nivel</span>
                <span className="pr-info-val">
                  {journey.nivel.icon} {journey.nivel.label}
                </span>
              </div>
              <div className="pr-info-row">
                <span className="pr-info-label">Puncte</span>
                <span className="pr-info-val">⭐ {journey.nivel.puncte}</span>
              </div>
              <div className="pr-info-row">
                <span className="pr-info-label">Repere deblocate</span>
                <span className="pr-info-val">
                  🏆 {journey.badges.total}/{journey.badges.disponibile}
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═══ TAB: BADGES ═══ */}
      {tabActiv === 'badges' && (
        <div className="pr-content">
          {journey?.badges?.deblocate?.length > 0 ? (
            <>
              <div className="pr-badges-header">
                <span className="pr-badges-count-text">
                  🏆 {journey.badges.total} din {journey.badges.disponibile} repere deblocate
                </span>
              </div>
              <div className="pr-badges-grid">
                {journey.badges.deblocate.map(b => (
                  <div key={b.id} className="pr-badge-card">
                    <div className="pr-badge-glow" />
                    <div className="pr-badge-icon">{b.icon}</div>
                    <div className="pr-badge-name">{b.nume}</div>
                    <div className="pr-badge-desc">{b.descriere}</div>
                    {b.deblocatLa && (
                      <div className="pr-badge-data">
                        {formatDate(b.deblocatLa)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="pr-empty">
              <div className="pr-empty-icon">🏆</div>
              <p>Nu ai deblocat încă niciun reper.</p>
              <p className="pr-empty-sub">
                Citește, ascultă și revino zilnic pentru a debloca repere spirituale.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: SETĂRI ═══ */}
      {tabActiv === 'setari' && (
        <div className="pr-content">

          <div className="pr-card">
            <div className="pr-card-title">⚙️ Cont</div>
            <div className="pr-setari-row">
              <div>
                <div className="pr-setari-label">Email</div>
                <div className="pr-setari-sub">{user.email}</div>
              </div>
            </div>
            <div className="pr-setari-row">
              <div>
                <div className="pr-setari-label">Tip cont</div>
                <div className="pr-setari-sub">
                  {user.facebookConectat ? 'Facebook OAuth' : 'Email + Parolă'}
                </div>
              </div>
            </div>
          </div>

          <div className="pr-card">
            <div className="pr-card-title">🚪 Sesiune</div>
            <p className="pr-setari-sub" style={{ marginBottom: 14 }}>
              Deconectează-te de pe acest dispozitiv.
            </p>
            <button
              className="pr-btn-logout"
              onClick={logout}
            >
              🚪 Deconectare
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default ProfilePage;