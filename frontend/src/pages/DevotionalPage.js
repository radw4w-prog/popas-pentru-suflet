// frontend/src/pages/DevotionalPage.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DevotionalShare from '../components/DevotionalShare';

export default function DevotionalPage() {
  const [loading, setLoading] = useState(true);
  const [devotional, setDevotional] = useState(null);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadDevotional();
  }, []);

  const loadDevotional = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/devotionals/today');
      setDevotional(res.data.data);

      if (isAuthenticated) {
        api.post('/api/devotionals/viewed').catch(() => {});
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Nu am putut încărca devoționalul.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dev-loading">
        <div className="dev-loading-icon">🙏</div>
        <div className="dev-loading-text">Se încarcă devoționalul zilei...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dev-error">
        <div className="dev-error-icon">😔</div>
        <h2 className="dev-error-title">Devoțional zilnic</h2>
        <p className="dev-error-text">{error}</p>
        <button className="dev-error-btn" onClick={loadDevotional}>
          🔄 Reîncearcă
        </button>
      </div>
    );
  }

  if (!devotional) return null;

  const azi = new Date().toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="dev-page">

      {/* ═══ HERO ═══ */}
      <div className="dev-hero">
        <div className="dev-hero-bg" />
        <div className="dev-hero-content">
          <div className="dev-hero-icon">🙏</div>
          <div className="dev-hero-badges">
            <span className="dev-badge dev-badge-primary">Devoțional zilnic</span>
            <span className="dev-badge dev-badge-secondary">{devotional.theme}</span>
          </div>
          <h1 className="dev-hero-title">{devotional.title}</h1>
          <p className="dev-hero-date">{azi}</p>
        </div>
      </div>

      <div className="dev-content">

        {/* ═══ VERSET PRINCIPAL ═══ */}
        <div className="dev-verse-card">
          <div className="dev-verse-deco-top" />
          <div className="dev-verse-quote">✦</div>
          <blockquote className="dev-verse-text">
            „{devotional.verseText}"
          </blockquote>
          <cite className="dev-verse-ref">
            — {devotional.verseReference}
          </cite>
          <div className="dev-verse-deco-bottom" />
        </div>

        {/* ═══ SHARE — vizibil imediat după verset ═══ */}
        <DevotionalShare devotional={devotional} />

        {/* ═══ SECȚIUNI DEVOȚIONAL ═══ */}
        <div className="dev-sections">

          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-section-icon">📖</span>
              <h3 className="dev-section-title">Introducere</h3>
            </div>
            <p className="dev-section-text">{devotional.introduction}</p>
          </div>

          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-section-icon">💡</span>
              <h3 className="dev-section-title">Mesaj</h3>
            </div>
            <p className="dev-section-text">{devotional.reflection}</p>
          </div>

          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-section-icon">🎯</span>
              <h3 className="dev-section-title">Aplică astăzi</h3>
            </div>
            <p className="dev-section-text">{devotional.practicalApplication}</p>
          </div>

          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-section-icon">🙏</span>
              <h3 className="dev-section-title">Rugăciune</h3>
            </div>
            <p className="dev-section-text dev-section-text-prayer">
              {devotional.prayer}
            </p>
          </div>

          {/* Gândul zilei — highlight */}
          <div className="dev-section dev-section-highlight">
            <div className="dev-section-header">
              <span className="dev-section-icon">✨</span>
              <h3 className="dev-section-title">Gândul zilei</h3>
            </div>
            <p className="dev-section-text dev-section-text-highlight">
              {devotional.thoughtOfTheDay}
            </p>
          </div>

        </div>

        {/* ═══ SHARE BOTTOM — al doilea buton jos ═══ */}
        <div className="dev-share-bottom">
          <div className="dev-share-bottom-label">
            🕊️ Distribuie acest devoțional cu prietenii tăi
          </div>
          <DevotionalShare devotional={devotional} />
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="dev-footer">
          <div className="dev-footer-generated">
            <span className="dev-footer-icon">🤖</span>
            <small className="dev-footer-text">
              {devotional.generatedBy === 'ai'
                ? 'Generat cu AI + validare structură'
                : 'Conținut editorial'}
            </small>
          </div>
          <div className="dev-footer-brand">
            🕊️ Popas pentru Suflet
          </div>
        </div>

      </div>
    </div>
  );
}