import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SettingsPage = () => {
  const [fbStatus, setFbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    fbToken: '',
    fbPageId: '',
    openaiKey: ''
  });
  const [activeTab, setActiveTab] = useState('facebook');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/social/status');
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
      // Salveaza in settings
      await axios.post('/api/settings', {
        FACEBOOK_ACCESS_TOKEN: config.fbToken,
        FACEBOOK_PAGE_ID: config.fbPageId,
        OPENAI_API_KEY: config.openaiKey
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Re-verifica statusul
      setTimeout(checkStatus, 1000);
    } catch (e) {
      alert('Eroare la salvare: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const testPublish = async () => {
    if (!window.confirm(
      'Publici un mesaj de test pe Facebook?\n"Test conexiune - Popas pentru Suflet 🕊️"'
    )) return;

    try {
      const r = await axios.post('/api/social/publish-direct', {
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

  return (
    <div className="animate-in">

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        {[
          { id: 'facebook', label: '📘 Facebook' },
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

          {/* Status conectare */}
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
                {/* Status indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
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

                {/* Info pagina daca e conectat */}
                {fbStatus.valid && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem'
                  }}>
                    {fbStatus.picture && (
                      <img
                        src={fbStatus.picture}
                        alt="Page"
                        style={{
                          width: '50px', height: '50px',
                          borderRadius: '50%',
                          border: '2px solid var(--border-color)'
                        }}
                      />
                    )}
                    <div>
                      <div style={{
                        fontWeight: '700',
                        fontSize: '1rem',
                        color: 'var(--text-primary)'
                      }}>
                        {fbStatus.pageName}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)'
                      }}>
                        👥 {fbStatus.followers?.toLocaleString() || 0} urmăritori
                      </div>
                    </div>
                  </div>
                )}

                {/* Test publish */}
                {fbStatus.valid && (
                  <button
                    className="btn btn-outline btn-block"
                    onClick={testPublish}
                    style={{
                      borderColor: 'rgba(24,119,242,0.4)',
                      color: '#1877F2'
                    }}
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

          {/* Configurare */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="icon">🔑</span>
                Configurare Facebook
              </div>
            </div>

            {/* Ghid */}
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
                fontWeight: '700',
                color: '#1877F2',
                marginBottom: '0.5rem',
                fontSize: '0.88rem'
              }}>
                📋 Cum obții token-ul:
              </div>
              <div>
                1. Mergi la{' '}
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1877F2' }}
                >
                  Graph API Explorer
                </a>
                <br />
                2. Selectează aplicația ta<br />
                3. Selectează pagina Facebook<br />
                4. Adaugă permisiunile:<br />
                &nbsp;&nbsp;• <code>pages_manage_posts</code><br />
                &nbsp;&nbsp;• <code>pages_read_engagement</code><br />
                5. Click <strong>Generate Access Token</strong><br />
                6. Copiază token-ul de mai jos
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                🔑 Page Access Token
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="EAAxxxxxxxxxxxxxxx..."
                value={config.fbToken}
                onChange={e => setConfig(p => ({
                  ...p, fbToken: e.target.value
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                🆔 Page ID
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="123456789012345"
                value={config.fbPageId}
                onChange={e => setConfig(p => ({
                  ...p, fbPageId: e.target.value
                }))}
              />
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.35rem'
              }}>
                Găsit în: Pagina Facebook → About → Page ID
              </div>
            </div>

            <button
              className="btn btn-gold btn-block"
              onClick={handleSaveConfig}
              disabled={saving || (!config.fbToken && !config.fbPageId)}
              style={{ marginTop: '0.5rem' }}
            >
              {saving ? '⏳ Se salvează...' :
               saved ? '✅ Salvat!' :
               '💾 Salvează & Verifică'}
            </button>

            {/* Nota .env */}
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              💡 <strong>Alternativ:</strong> Adaugă direct în{' '}
              <code style={{ color: 'var(--gold-primary)' }}>
                backend/.env
              </code>
              <br />
              <code>FACEBOOK_ACCESS_TOKEN=token_tau</code><br />
              <code>FACEBOOK_PAGE_ID=id_paginii</code>
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
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-purple)' }}
            >
              🔗 Obține cheie API → platform.openai.com
            </a>
          </div>

          <div className="form-group">
            <label className="form-label">🔑 OpenAI API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.openaiKey}
              onChange={e => setConfig(p => ({
                ...p, openaiKey: e.target.value
              }))}
            />
          </div>

          <button
            className="btn btn-gold btn-block"
            onClick={handleSaveConfig}
            disabled={saving || !config.openaiKey}
          >
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
              { label: 'Backend', value: 'http://localhost:5000' },
              { label: 'Frontend', value: 'http://localhost:3000' },
              { label: 'Baza de date', value: 'MongoDB Local' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.88rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {item.label}
                </span>
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
              {
                label: 'Graph API Explorer',
                url: 'https://developers.facebook.com/tools/explorer/',
                icon: '📘'
              },
              {
                label: 'Facebook Developers',
                url: 'https://developers.facebook.com/',
                icon: '⚙️'
              },
              {
                label: 'OpenAI Platform',
                url: 'https://platform.openai.com/',
                icon: '🤖'
              },
              {
                label: 'Unsplash (Imagini)',
                url: 'https://unsplash.com/',
                icon: '🖼️'
              }
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '0.5rem',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  transition: 'var(--transition)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                <span>{link.label}</span>
                <span style={{
                  marginLeft: 'auto',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem'
                }}>
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;