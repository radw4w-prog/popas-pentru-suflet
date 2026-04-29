import React, { useEffect, useState } from 'react';
import api from '../services/api';

const SchedulePage = () => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scheduledRes, historyRes] = await Promise.all([
        axios.get('/api/social/scheduled'),
        axios.get('/api/social/history')
      ]);
      setScheduledPosts(scheduledRes.data || []);
      setHistoryPosts(historyRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduled = async (id) => {
    if (!window.confirm('Ștergi această programare?')) return;
    try {
      await axios.delete(`/api/social/scheduled/${id}`);
      fetchData();
    } catch (e) {
      alert('Eroare la ștergere!');
    }
  };

  const publishNow = async (id) => {
    if (!window.confirm('Publici acum această postare?')) return;
    try {
      await axios.post(`/api/social/publish/${id}`);
      fetchData();
      alert('✅ Publicată!');
    } catch (e) {
      alert('❌ ' + (e.response?.data?.error || e.message));
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-in">
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          📅 Programate ({scheduledPosts.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Istoric ({historyPosts.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div>
            <div className="spinner"></div>
            <div className="loading-text">Se încarcă programările...</div>
          </div>
        </div>
      ) : activeTab === 'scheduled' ? (
        <div className="card card-gold">
          <div className="card-header">
            <div className="card-title">
              <span className="icon">📅</span>
              Postări programate
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchData}>
              🔄 Refresh
            </button>
          </div>

          {scheduledPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">Nicio postare programată</div>
              <div className="empty-state-text">
                Generează o postare și alege data/ora pentru publicare automată.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {scheduledPosts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1.6',
                        marginBottom: '0.5rem'
                      }}>
                        {post.content?.substring(0, 180)}
                        {post.content?.length > 180 ? '...' : ''}
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        <span className="badge badge-blue">
                          📘 {post.platform}
                        </span>
                        {post.tema && (
                          <span className="badge badge-gold">
                            🎯 {post.tema}
                          </span>
                        )}
                        <span className="badge badge-purple">
                          🕐 {formatDate(post.scheduledDate)}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      minWidth: '140px'
                    }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => publishNow(post._id)}
                      >
                        ⚡ Publică acum
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteScheduled(post._id)}
                      >
                        🗑️ Șterge
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="icon">📜</span>
              Istoric publicări
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchData}>
              🔄 Refresh
            </button>
          </div>

          {historyPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">Fără istoric</div>
              <div className="empty-state-text">
                Nu există încă publicări automate sau manuale.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {historyPosts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1.6',
                        marginBottom: '0.5rem'
                      }}>
                        {post.content?.substring(0, 180)}
                        {post.content?.length > 180 ? '...' : ''}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${
                          post.status === 'published' ? 'badge-green' : 'badge-red'
                        }`}>
                          {post.status === 'published' ? '✅ Publicată' : '❌ Eșuată'}
                        </span>

                        <span className="badge badge-blue">
                          📘 {post.platform}
                        </span>

                        {post.publishedAt && (
                          <span className="badge badge-purple">
                            🕐 {formatDate(post.publishedAt)}
                          </span>
                        )}
                      </div>

                      {post.failedReason && (
                        <div style={{
                          marginTop: '0.5rem',
                          color: 'var(--accent-red)',
                          fontSize: '0.8rem'
                        }}>
                          Eroare: {post.failedReason}
                        </div>
                      )}
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

export default SchedulePage;