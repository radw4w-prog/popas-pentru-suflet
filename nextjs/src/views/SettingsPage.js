'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import usePushNotifications from '../hooks/usePushNotifications';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const {
    supported: pushSupported,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    loading: pushLoading,
    serverConfigured: pushServerConfigured,
    subscribe: enablePush,
    unsubscribe: disablePush,
    sendTestNotification,
    sendTestDevotional,
    sendTestReading,
    refreshStatus: refreshPushStatus
  } = usePushNotifications();

  const [fbStatus, setFbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [savedNotif, setSavedNotif] = useState(false);
  const [pushActionMessage, setPushActionMessage] = useState(null);

  const [config, setConfig] = useState({
    fbToken: '',
    fbPageId: '',
    openaiKey: ''
  });

  const [notifSetari, setNotifSetari] = useState({
    active: true,
    devotional: true,
    reminderZilnic: true,
    milestones: true,
    intarziere: true
  });

  const [activeTab, setActiveTab] = useState('facebook');

  useEffect(() => {
    checkStatus();
    refreshPushStatus();
  }, [refreshPushStatus]);

  // Inițializează setările notificărilor din user
  useEffect(() => {
    if (user?.setari?.notificari) {
      setNotifSetari(prev => ({ ...prev, ...user.setari.notificari }));
    }
  }, [user]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/social/status');
      setFbStatus(r.data.facebook);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await api.post('/api/settings', {
        FACEBOOK_ACCESS_TOKEN: config.fbToken,
        FACEBOOK_PAGE_ID: config.fbPageId,
        OPENAI_API_KEY: config.openaiKey
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setTimeout(checkStatus, 1000);
    } catch (e) {
      alert('Eroare la salvare: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificari = async () => {
    setSavingNotif(true);
    try {
      const res = await axios.put(
        `${API}/api/auth/update-profile`,
        {
          setari: {
            notificari: notifSetari,
            tema: user?.setari?.tema || 'dark'
          }
        },
        { headers: getHeaders() }
      );

      if (res.data.success) {
        updateUser(res.data.user);
        setSavedNotif(true);
        setTimeout(() => setSavedNotif(false), 3000);
      }
    } catch (e) {
      alert('Eroare la salvarea notificărilor: ' + e.message);
    } finally {
      setSavingNotif(false);
    }
  };

  const testPublish = async () => {
    if (!window.confirm(
      'Publici un mesaj de test pe Facebook?\n"Test conexiune - Popas pentru Suflet 🕊️"'
    )) return;

    try {
      const r = await api.post('/api/social/publish-direct', {
        content: 'Test conexiune - Popas pentru Suflet 🕊️\n\nAcesta este un mesaj de test.',
        hashtags: '#Test #PopasPentruSuflet',
        platform: 'facebook'
      });

      if (r.data.success) {
        alert('✅ Test reușit! Verifică pagina ta Facebook.');
      }
    } catch (e) {
      alert('❌ Eroare: ' + (e.response?.data?.error || e.message));
    }
  };

  // ═══ TOGGLE NOTIFICARE ═══
  const toggleNotif = (key) => {
    if (key === 'active') {
      setNotifSetari(prev => ({ ...prev, active: !prev.active }));
    } else {
      setNotifSetari(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleEnablePush = async () => {
    const result = await enablePush();
    setPushActionMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setTimeout(() => setPushActionMessage(null), 4000);
    }
  };

  const handleDisablePush = async () => {
    const result = await disablePush();
    setPushActionMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setTimeout(() => setPushActionMessage(null), 4000);
    }
  };

  const handleTestPush = async () => {
    const result = await sendTestNotification();
    setPushActionMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setPushActionMessage(null), 5000);
  };

  const handleTestDevotionalPush = async () => {
    const result = await sendTestDevotional();
    setPushActionMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setPushActionMessage(null), 5000);
  };

  const handleTestReadingPush = async () => {
    const result = await sendTestReading();
    setPushActionMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setPushActionMessage(null), 5000);
  };

  return (
    <div className="animate-in">

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        {[
          { id: 'facebook', label: '📘 Facebook' },
          { id: 'notificari', label: '🔔 Notificări' },
          { id: 'openai', label: '🤖 OpenAI' },
          { id: 'general', label: '⚙️ General' }
        ].map(t => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB FACEBOOK ═══ */}
      {activeTab === 'facebook' && (
        <div className="grid-2">
          <div className="card card-gold">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">📘</span>
                Status Facebook
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={checkStatus}
                disabled={loading}
              >
                {loading ? '⏳' : '🔄 Verifică'}
              </button>
            </div>

            {loading ? (
              <div className="loading-spinner">
                <div className="spinner" />
              </div>
            ) : fbStatus ? (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.25rem',
                  background: fbStatus.valid
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(239,68,68,0.08)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${fbStatus.valid
                    ? 'rgba(16,185,129,0.2)'
                    : 'rgba(239,68,68,0.2)'}`,
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '2.5rem' }}>
                    {fbStatus.valid ? '✅' : '❌'}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '700',
                      color: fbStatus.valid
                        ? 'var(--accent-green)'
                        : 'var(--accent-red)',
                      fontSize: '1rem',
                      marginBottom: '0.25rem'
                    }}>
                      {fbStatus.valid ? 'Conectat!' : 'Neconectat'}
                    </div>
                    <div style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)'
                    }}>
                      {fbStatus.valid
                        ? `Pagina: ${fbStatus.pageName}`
                        : fbStatus.error || 'Configurează token-ul'}
                    </div>
                  </div>
                </div>

                {fbStatus.valid && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem'
                  }}>
                    {fbStatus.picture && (
                      <img src={fbStatus.picture} alt="Page"
                        style={{
                          width: '50px', height: '50px',
                          borderRadius: '50%',
                          border: '2px solid var(--border-color)'
                        }} />
                    )}
                    <div>
                      <div style={{
                        fontWeight: '700', fontSize: '1rem',
                        color: 'var(--text-primary)'
                      }}>
                        {fbStatus.pageName}
                      </div>
                      <div style={{
                        fontSize: '0.8rem', color: 'var(--text-muted)'
                      }}>
                        👥 {fbStatus.followers?.toLocaleString() || 0} urmăritori
                      </div>
                    </div>
                  </div>
                )}

                {fbStatus.valid && (
                  <button
                    className="btn btn-outline btn-block"
                    onClick={testPublish}
                    style={{ borderColor: 'rgba(24,119,242,0.4)', color: '#1877F2' }}
                  >
                    🧪 Test publicare pe Facebook
                  </button>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📘</div>
                <div className="empty-state-title">Nu s-a putut verifica</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">🔑</span>
                Configurare Facebook
              </div>
            </div>

            <div style={{
              padding: '1rem',
              background: 'rgba(24,119,242,0.06)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(24,119,242,0.15)',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.8'
            }}>
              <div style={{
                fontWeight: '700', color: '#1877F2',
                marginBottom: '0.5rem', fontSize: '0.88rem'
              }}>
                📋 Cum obții token-ul:
              </div>
              1. Mergi la{' '}
              <a href="https://developers.facebook.com/tools/explorer/"
                target="_blank" rel="noopener noreferrer"
                style={{ color: '#1877F2' }}>
                Graph API Explorer
              </a><br />
              2. Selectează aplicația ta<br />
              3. Selectează pagina Facebook<br />
              4. Adaugă permisiunile: <code>pages_manage_posts</code><br />
              5. Click <strong>Generate Access Token</strong>
            </div>

            <div className="form-group">
              <label className="form-label">🔑 Page Access Token</label>
              <input type="password" className="form-input"
                placeholder="EAAxxxxxxxxxxxxxxx..."
                value={config.fbToken}
                onChange={e => setConfig(p => ({ ...p, fbToken: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">🆔 Page ID</label>
              <input type="text" className="form-input"
                placeholder="123456789012345"
                value={config.fbPageId}
                onChange={e => setConfig(p => ({ ...p, fbPageId: e.target.value }))} />
            </div>

            <button
              className="btn btn-gold btn-block"
              onClick={handleSaveConfig}
              disabled={saving || (!config.fbToken && !config.fbPageId)}
              style={{ marginTop: '0.5rem' }}
            >
              {saving ? '⏳ Se salvează...' : saved ? '✅ Salvat!' : '💾 Salvează & Verifică'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ TAB NOTIFICĂRI ═══ */}
      {activeTab === 'notificari' && (
        <div style={{ maxWidth: 860, display: 'grid', gap: '1rem' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">🔔</span>
                Setări Notificări
              </div>
            </div>

            {/* Toggle principal */}
            <div style={{
              padding: '1.25rem',
              background: notifSetari.active
                ? 'rgba(99,102,241,0.06)'
                : 'rgba(239,68,68,0.06)',
              border: `1px solid ${notifSetari.active
                ? 'rgba(99,102,241,0.2)'
                : 'rgba(239,68,68,0.2)'}`,
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div>
                <div style={{
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.2rem'
                }}>
                  🔔 Notificări active
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {notifSetari.active
                    ? 'Primești notificări despre devoțional și planul de citire'
                    : 'Toate notificările sunt dezactivate'}
                </div>
              </div>
              <ToggleSwitch
                checked={notifSetari.active}
                onChange={() => toggleNotif('active')}
              />
            </div>

            {/* Tipuri notificări */}
            <div style={{
              opacity: notifSetari.active ? 1 : 0.4,
              pointerEvents: notifSetari.active ? 'auto' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.25rem'
              }}>
                Tipuri de notificări:
              </div>

              <NotifRow
                icon="☀️"
                titlu="Devoțional zilnic"
                descriere="Primești dimineața o notificare către devoționalul zilei"
                checked={notifSetari.devotional}
                onChange={() => toggleNotif('devotional')}
              />

              <NotifRow
                icon="📖"
                titlu="Reminder citire zilnică"
                descriere="Primești un reminder dacă nu ai citit în ziua respectivă (08:00 și 21:00)"
                checked={notifSetari.reminderZilnic}
                onChange={() => toggleNotif('reminderZilnic')}
              />

              <NotifRow
                icon="🏆"
                titlu="Milestone-uri progres"
                descriere="Notificare când atingi 10%, 25%, 50%, 75% și 100% din Biblie"
                checked={notifSetari.milestones}
                onChange={() => toggleNotif('milestones')}
              />

              <NotifRow
                icon="⚠️"
                titlu="Avertisment întârziere"
                descriere="Notificare când ești în urmă față de planul de citire"
                checked={notifSetari.intarziere}
                onChange={() => toggleNotif('intarziere')}
              />
            </div>

            <div style={{
              padding: '0.875rem',
              background: 'var(--bg-input)',
              borderRadius: '10px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '1.25rem'
            }}>
              <strong>ℹ️ Când primești notificări?</strong><br />
              Devoționalul zilnic este programat dimineața, iar reminder-ele de citire rulează la
              <strong> 08:00</strong> și <strong>21:00</strong>.
              Nu vei primi duplicate dacă o notificare similară a fost deja creată recent.
            </div>

            <button
              onClick={handleSaveNotificari}
              disabled={savingNotif}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: savedNotif
                  ? 'rgba(34,197,94,0.15)'
                  : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: savedNotif
                  ? '1px solid rgba(34,197,94,0.3)'
                  : 'none',
                borderRadius: '10px',
                color: savedNotif ? '#22c55e' : 'white',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {savingNotif
                ? '⏳ Se salvează...'
                : savedNotif
                  ? '✅ Setări salvate!'
                  : '💾 Salvează setările'}
            </button>
          </div>

          <div className="card card-gold">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">📲</span>
                Notificări Push în browser
              </div>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'rgba(212,175,55,0.06)',
              marginBottom: '1rem',
              display: 'grid',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Suport browser</span>
                <strong style={{ color: pushSupported ? '#22c55e' : '#ef4444' }}>
                  {pushSupported ? 'Da' : 'Nu'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Permisiune</span>
                <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {pushPermission}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Abonare activă</span>
                <strong style={{ color: pushSubscribed ? '#22c55e' : 'var(--text-primary)' }}>
                  {pushSubscribed ? 'Activă' : 'Inactivă'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Server configurat</span>
                <strong style={{ color: pushServerConfigured ? '#22c55e' : '#f59e0b' }}>
                  {pushServerConfigured ? 'Da' : 'Lipsesc chei VAPID'}
                </strong>
              </div>
            </div>

            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              marginBottom: '1rem'
            }}>
              Activează notificările push pentru a primi direct în browser devoționalul zilnic și reminder-ele de citire,
              chiar și atunci când nu ai pagina deschisă activ.
            </div>

            {pushActionMessage && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                border: `1px solid ${pushActionMessage.type === 'success' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                background: pushActionMessage.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                color: pushActionMessage.type === 'success' ? '#22c55e' : '#f87171'
              }}>
                {pushActionMessage.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {!pushSubscribed ? (
                <button
                  className="btn btn-gold"
                  onClick={handleEnablePush}
                  disabled={!pushSupported || pushLoading}
                >
                  {pushLoading ? '⏳ Se activează...' : '🔔 Activează push'}
                </button>
              ) : (
                <button
                  className="btn btn-outline"
                  onClick={handleDisablePush}
                  disabled={pushLoading}
                >
                  {pushLoading ? '⏳ Se dezactivează...' : '🔕 Dezactivează push'}
                </button>
              )}

              <button
                className="btn btn-secondary"
                onClick={handleTestPush}
                disabled={!pushSubscribed || !pushServerConfigured || pushLoading}
              >
                🧪 Test generic
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleTestDevotionalPush}
                disabled={!pushSubscribed || !pushServerConfigured || pushLoading}
              >
                ☀️ Test devoțional
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleTestReadingPush}
                disabled={!pushSubscribed || !pushServerConfigured || pushLoading}
              >
                📖 Test citire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB OPENAI ═══ */}
      {activeTab === 'openai' && (
        <div className="card card-gold" style={{ maxWidth: '600px' }}>
          <div className="card-header">
            <div className="card-title">
              <span className="icon">🤖</span>
              OpenAI - Generator AI
            </div>
            <span className="badge badge-purple">Opțional</span>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(124,58,237,0.06)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(124,58,237,0.15)',
            marginBottom: '1.25rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8'
          }}>
            <div style={{
              fontWeight: '700',
              color: 'var(--accent-purple)',
              marginBottom: '0.5rem'
            }}>
              🤖 De ce OpenAI?
            </div>
            Fără OpenAI, aplicația generează conținut din template-uri predefinite.
            Cu OpenAI (GPT-4), conținutul este unic și personalizat.<br /><br />
            <a href="https://platform.openai.com/api-keys"
              target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--accent-purple)' }}>
              🔗 Obține cheie API → platform.openai.com
            </a>
          </div>

          <div className="form-group">
            <label className="form-label">🔑 OpenAI API Key</label>
            <input type="password" className="form-input"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.openaiKey}
              onChange={e => setConfig(p => ({ ...p, openaiKey: e.target.value }))} />
          </div>

          <button className="btn btn-gold btn-block"
            onClick={handleSaveConfig}
            disabled={saving || !config.openaiKey}>
            {saving ? '⏳...' : saved ? '✅ Salvat!' : '💾 Salvează'}
          </button>
        </div>
      )}

      {/* ═══ TAB GENERAL ═══ */}
      {activeTab === 'general' && (
        <div className="grid-2">
          <div className="card card-gold">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">📊</span>
                Informații Aplicație
              </div>
            </div>

            {[
              { label: 'Versiune', value: 'v1.0.0' },
              { label: 'Backend', value: 'localhost:5000' },
              { label: 'Frontend', value: 'localhost:3000' },
              { label: 'Baza de date', value: 'MongoDB Atlas' },
              { label: 'Biblie', value: 'Cornilescu (31.102 versete)' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '0.75rem 0',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.88rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{
                  color: 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.8rem'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">🔗</span>
                Link-uri Utile
              </div>
            </div>

            {[
              { label: 'Graph API Explorer', url: 'https://developers.facebook.com/tools/explorer/', icon: '📘' },
              { label: 'Facebook Developers', url: 'https://developers.facebook.com/', icon: '⚙️' },
              { label: 'OpenAI Platform', url: 'https://platform.openai.com/', icon: '🤖' },
              { label: 'Unsplash (Imagini)', url: 'https://unsplash.com/', icon: '🖼️' }
            ].map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                  marginBottom: '0.5rem', textDecoration: 'none',
                  color: 'var(--text-primary)', fontSize: '0.88rem'
                }}>
                <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                <span>{link.label}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══ SUBCOMPONENTE ═══

const ToggleSwitch = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    style={{
      width: 48, height: 26,
      borderRadius: '999px',
      background: checked
        ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
        : 'var(--bg-input)',
      border: `1px solid ${checked ? 'transparent' : 'var(--border-color)'}`,
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s',
      flexShrink: 0
    }}
  >
    <div style={{
      position: 'absolute',
      top: 3, left: checked ? 25 : 3,
      width: 18, height: 18,
      borderRadius: '50%',
      background: 'white',
      transition: 'left 0.2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
    }} />
  </div>
);

const NotifRow = ({ icon, titlu, descriere, checked, onChange }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1rem',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px'
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: '10px',
      background: 'var(--bg-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.3rem', flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        fontWeight: 600, color: 'var(--text-primary)',
        fontSize: '0.875rem', marginBottom: '0.2rem'
      }}>
        {titlu}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {descriere}
      </div>
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} />
  </div>
);

export default SettingsPage;