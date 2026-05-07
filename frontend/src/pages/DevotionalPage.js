import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    } catch (err) {
      setError(err.response?.data?.error || 'Nu am putut încărca devoționalul.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">Se încarcă devoționalul zilei...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card">
          <h2>Devoțional zilnic</h2>
          <p>{error}</p>
          <button onClick={loadDevotional}>Reîncearcă</button>
        </div>
      </div>
    );
  }

  if (!devotional) return null;
  
  
  const loadDevotional = async () => {
  try {
    setLoading(true);
    setError('');
    const res = await api.get('/api/devotionals/today');
    setDevotional(res.data.data);

    // Hook spiritual journey — marchează devoționalul ca văzut
    if (isAuthenticated) {
      api.post('/api/devotionals/viewed').catch(() => {});
    }

  } catch (err) {
    setError(err.response?.data?.error || 'Nu am putut încărca devoționalul.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="page-container">
      <div className="card devotional-card">
        <div className="devotional-header">
          <span className="badge">🙏 Devoțional zilnic</span>
          <span className="badge secondary">{devotional.theme}</span>
        </div>

        <h1>{devotional.title}</h1>

        <div className="verse-box">
          <p className="verse-text">“{devotional.verseText}”</p>
          <div className="verse-ref">— {devotional.verseReference}</div>
        </div>

        <section className="devotional-section">
          <h3>Introducere</h3>
          <p>{devotional.introduction}</p>
        </section>

        <section className="devotional-section">
          <h3>Mesaj</h3>
          <p>{devotional.reflection}</p>
        </section>

        <section className="devotional-section">
          <h3>Aplică astăzi</h3>
          <p>{devotional.practicalApplication}</p>
        </section>

        <section className="devotional-section">
          <h3>Rugăciune</h3>
          <p>{devotional.prayer}</p>
        </section>

        <section className="devotional-section highlight">
          <h3>Gândul zilei</h3>
          <p>{devotional.thoughtOfTheDay}</p>
        </section>

        <div className="devotional-footer">
          <small>Generat: {devotional.generatedBy === 'ai' ? 'AI + validare structură' : 'fallback local'}</small>
        </div>
      </div>
    </div>
  );
}