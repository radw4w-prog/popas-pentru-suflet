import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { socialAPI } from '../services/api';

const SocialAccounts = () => {
  const [connections, setConnections] = useState({
    facebook: { connected: false, pageName: '', followers: 0 },
    instagram: { connected: false, username: '', followers: 0 },
    tiktok: { connected: false, username: '', followers: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await socialAPI.getStatus();
      if (response.data) setConnections(response.data);
    } catch (error) {
      console.error('Error fetching social connections');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (platform) => {
    try {
      await socialAPI.disconnect(platform);
      setConnections(prev => ({
        ...prev,
        [platform]: { connected: false, pageName: '', username: '', followers: 0 }
      }));
      toast.success(`${platform} deconectat`);
    } catch (error) {
      toast.error(`Eroare la deconectare`);
    }
  };

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600',
      description: 'Publică pe Pagina ta de Facebook',
      connectAction: () => {
        const appId = process.env.REACT_APP_FACEBOOK_APP_ID;
        const redirectUri = `${window.location.origin}/api/social/facebook/callback`;
        window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement`;
      }
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Necesită cont Business/Creator + Facebook conectat',
      connectAction: () => toast.info('Conectează mai întâi Facebook pentru a accesa Instagram')
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black',
      description: 'Publică videoclipuri pe TikTok',
      connectAction: () => toast.info('Conectare TikTok în curând')
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {platforms.map((platform) => {
        const connection = connections[platform.id];
        return (
          <div key={platform.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                {platform.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{platform.name}</h3>
                {connection.connected ? (
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      ✅ {connection.pageName || connection.username}
                    </p>
                    {connection.followers > 0 && (
                      <p className="text-xs text-gray-500">
                        {connection.followers.toLocaleString()} urmăritori
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{platform.description}</p>
                )}
              </div>
            </div>
            {connection.connected ? (
              <button
                onClick={() => handleDisconnect(platform.id)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Deconectează
              </button>
            ) : (
              <button
                onClick={platform.connectAction}
                className={`${platform.color} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
              >
                Conectează
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SocialAccounts;