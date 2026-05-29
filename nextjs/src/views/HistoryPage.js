'use client';
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const HistoryPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data.posts || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter);

  const deletePost = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi această postare?')) return;
    try {
      await axios.delete(`/api/posts/${id}`);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in">
      <div className="card card-gold">
        <div className="card-header">
          <div className="card-title">
            <span className="icon">📜</span>
            Istoricul Postărilor
          </div>
          <span className="badge badge-gold">{posts.length} total</span>
        </div>

        {/* Filters */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {[
            { value: 'all', label: '📋 Toate' },
            { value: 'draft', label: '📝 Ciorne' },
            { value: 'scheduled', label: '📅 Programate' },
            { value: 'published', label: '✅ Publicate' }
          ].map(f => (
            <button
              key={f.value}
              className={`tab ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">Nicio postare găsită</div>
            <div className="empty-state-text">
              Nu există postări {filter !== 'all' ? `cu statusul "${filter}"` : ''} în istoric
            </div>
          </div>
        ) : (
          filtered.map((post, idx) => (
            <div key={post._id || idx} style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gold-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.2rem'
              }}>
                {post.platform === 'instagram' ? '📸' :
                 post.platform === 'tiktok' ? '🎵' : '📘'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                  marginBottom: '0.5rem'
                }}>
                  {post.content?.substring(0, 150)}...
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <span className={`badge ${
                    post.status === 'published' ? 'badge-green' :
                    post.status === 'scheduled' ? 'badge-blue' : 'badge-gold'
                  }`}>
                    {post.status}
                  </span>
                  {post.tema && <span className="badge badge-purple">{post.tema}</span>}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(post.createdAt).toLocaleDateString('ro-RO', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deletePost(post._id)}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;