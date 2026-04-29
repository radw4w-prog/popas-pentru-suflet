import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    totalVerses: 0
  });
  const [recentPosts, setRecentPosts] = useState([]); // ✅ Array gol implicit
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const postsRes = await api.get('/api/posts?limit=5');
      const data = postsRes.data;

      // ✅ Detectăm automat formatul răspunsului
      let posts = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if (data && Array.isArray(data.posts)) {
        posts = data.posts;
      } else if (data && Array.isArray(data.data)) {
        posts = data.data;
      }

      setRecentPosts(posts);
      setStats({
        totalPosts: posts.length,
        scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        totalVerses: 150
      });
    } catch (error) {
      console.error('Eroare fetch:', error);
      setRecentPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>
          <div className="spinner"></div>
          <div className="loading-text">Se încarcă datele...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card gold">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-label">Total Postări</div>
            <div className="stat-value">{stats.totalPosts}</div>
            <div className="stat-change positive">↗ Activ</div>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-label">Programate</div>
            <div className="stat-value">{stats.scheduledPosts}</div>
            <div className="stat-change positive">În așteptare</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Publicate</div>
            <div className="stat-value">{stats.publishedPosts}</div>
            <div className="stat-change positive">↗ Succes</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <div className="stat-label">Versete</div>
            <div className="stat-value">{stats.totalVerses}</div>
            <div className="stat-change positive">Biblioteca</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid-2">
        {/* Recent Posts */}
        <div className="card card-gold">
          <div className="card-header">
            <div className="card-title">
              <span className="icon">📋</span>
              Postări Recente
            </div>
            <span className="badge badge-gold">Ultimele 5</span>
          </div>

          {/* ✅ Verificare sigură înainte de .map() */}
          {!Array.isArray(recentPosts) || recentPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">Nicio postare încă</div>
              <div className="empty-state-text">
                Generează prima ta postare din meniul "Generează"
              </div>
            </div>
          ) : (
            recentPosts.map((post, idx) => (
              <div key={post._id || idx} style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    lineHeight: '1.5'
                  }}>
                    {(post.content || '').substring(0, 80)}
                    {(post.content || '').length > 80 ? '...' : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString('ro-RO')
                      : 'Data necunoscută'}
                  </div>
                </div>
                <span className={`badge ${
                  post.status === 'published' ? 'badge-green' :
                  post.status === 'scheduled' ? 'badge-blue' : 'badge-gold'
                }`}>
                  {post.status || 'draft'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions + Verse */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div className="card-title">
                <span className="icon">⚡</span>
                Acțiuni Rapide
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-gold btn-block"
                onClick={() => window.location.href = '/generate'}
              >
                ✨ Generează Postare Nouă
              </button>
              <button
                className="btn btn-outline btn-block"
                onClick={() => window.location.href = '/schedule'}
              >
                📅 Programează Postare
              </button>
              <button
                className="btn btn-secondary btn-block"
                onClick={() => window.location.href = '/verses'}
              >
                📖 Explorează Versete
              </button>
            </div>
          </div>

          {/* Daily Verse */}
          <div className="verse-card">
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--gold-primary)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '700',
              marginBottom: '0.75rem'
            }}>
              ✝️ Versetul Zilei
            </div>
            <div className="verse-text">
              "Căci atât de mult a iubit Dumnezeu lumea, încât L-a dat pe
              singurul Lui Fiu, pentru ca oricine crede în El să nu piară,
              ci să aibă viața veșnică."
            </div>
            <div className="verse-reference">— Ioan 3:16</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;