'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { generateAPI, postsAPI, scheduleAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedToday: 0,
    platforms: { facebook: 0, instagram: 0, tiktok: 0 }
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [upcomingScheduled, setUpcomingScheduled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [postsRes, scheduleRes] = await Promise.all([
        postsAPI.getAll({ limit: 5 }),
        scheduleAPI.getUpcoming()
      ]);
      
      const posts = postsRes.data?.posts || [];
      const scheduled = scheduleRes.data?.schedules || [];
      
      setRecentPosts(posts);
      setUpcomingScheduled(scheduled.slice(0, 5));
      
      setStats({
        totalPosts: postsRes.data?.total || posts.length,
        scheduledPosts: scheduled.length,
        publishedToday: posts.filter(p => {
          const today = new Date().toDateString();
          return new Date(p.createdAt).toDateString() === today;
        }).length,
        platforms: {
          facebook: posts.filter(p => p.platforms?.includes('facebook')).length,
          instagram: posts.filter(p => p.platforms?.includes('instagram')).length,
          tiktok: posts.filter(p => p.platforms?.includes('tiktok')).length
        }
      });
    } catch (error) {
      console.error('Eroare la încărcarea datelor:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color, link }) => (
    <Link to={link || '#'} className="block">
      <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
            {icon}
          </div>
          <span className={`text-3xl font-bold text-gray-800`}>{value}</span>
        </div>
        <p className="font-semibold text-gray-700">{title}</p>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </Link>
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformEmoji = (platform) => {
    const map = { facebook: '📘', instagram: '📷', tiktok: '🎵' };
    return map[platform] || '📱';
  };

  const getStatusBadge = (status) => {
    const map = {
      published: 'bg-green-100 text-green-700',
      scheduled: 'bg-blue-100 text-blue-700',
      draft: 'bg-gray-100 text-gray-600',
      failed: 'bg-red-100 text-red-700'
    };
    const labels = {
      published: 'Publicat',
      scheduled: 'Programat',
      draft: 'Ciornă',
      failed: 'Eșuat'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] || map.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">✨</div>
          <p className="text-gray-500">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            🏠 Bun venit la Popas pentru Suflet
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('ro-RO', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Link
          to="/generate"
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          ✨ Generează Postare
        </Link>
      </div>

      {/* Versete zilnic */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📖</div>
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
              Versetul Zilei
            </p>
            <p className="text-gray-700 italic font-medium leading-relaxed">
              „Domnul este păstorul meu: nu voi duce lipsă de nimic."
            </p>
            <p className="text-amber-600 text-sm font-semibold mt-2">
              — Psalmul 23:1
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📝"
          title="Total Postări"
          value={stats.totalPosts}
          subtitle="Toate platformele"
          color="bg-blue-50"
          link="/history"
        />
        <StatCard
          icon="⏰"
          title="Programate"
          value={stats.scheduledPosts}
          subtitle="În așteptare"
          color="bg-purple-50"
          link="/schedule"
        />
        <StatCard
          icon="✅"
          title="Astăzi"
          value={stats.publishedToday}
          subtitle="Publicate azi"
          color="bg-green-50"
          link="/history"
        />
        <StatCard
          icon="🌐"
          title="Platforme Active"
          value="3"
          subtitle="FB • IG • TikTok"
          color="bg-amber-50"
          link="/settings"
        />
      </div>

      {/* Platform Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4 text-lg">📊 Statistici Platforme</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Facebook', icon: '📘', count: stats.platforms.facebook, color: 'bg-blue-500' },
            { name: 'Instagram', icon: '📷', count: stats.platforms.instagram, color: 'bg-pink-500' },
            { name: 'TikTok', icon: '🎵', count: stats.platforms.tiktok, color: 'bg-gray-800' }
          ].map(platform => (
            <div key={platform.name} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-2">{platform.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{platform.count}</p>
              <p className="text-sm text-gray-500">{platform.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-lg">📋 Postări Recente</h2>
            <Link to="/history" className="text-amber-600 text-sm hover:underline">
              Vezi toate →
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>Nu există postări încă</p>
              <Link to="/generate" className="text-amber-600 text-sm hover:underline mt-1 block">
                Generează prima postare
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-xl">
                    {getPlatformEmoji(post.platforms?.[0])}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate font-medium">
                      {post.description || post.content || 'Postare fără descriere'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(post.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Scheduled */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-lg">⏰ Programate Următor</h2>
            <Link to="/schedule" className="text-amber-600 text-sm hover:underline">
              Gestionează →
            </Link>
          </div>
          {upcomingScheduled.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📅</div>
              <p>Nu există postări programate</p>
              <Link to="/schedule" className="text-amber-600 text-sm hover:underline mt-1 block">
                Programează o postare
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingScheduled.map((schedule, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="text-xl">📅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {schedule.post?.description || 'Postare programată'}
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5 font-medium">
                      {formatDate(schedule.scheduledTime)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {schedule.platforms?.map(p => (
                      <span key={p} className="text-sm">{getPlatformEmoji(p)}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-4">⚡ Acțiuni Rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '✨', label: 'Generează Postare', link: '/generate', color: 'from-amber-500 to-orange-500' },
            { icon: '📅', label: 'Programează', link: '/schedule', color: 'from-blue-500 to-indigo-500' },
            { icon: '📊', label: 'Istoric', link: '/history', color: 'from-green-500 to-teal-500' },
            { icon: '⚙️', label: 'Setări', link: '/settings', color: 'from-purple-500 to-pink-500' }
          ].map(action => (
            <Link
              key={action.label}
              to={action.link}
              className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-xl text-center hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <p className="text-sm font-semibold">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;