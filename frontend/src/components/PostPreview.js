import React, { useState } from 'react';

const PostPreview = ({ post, platforms = [] }) => {
  const [activePlatform, setActivePlatform] = useState(platforms[0] || 'facebook');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${post.content}\n\n${post.hashtags?.join(' ') || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformConfig = {
    facebook: {
      name: 'Facebook',
      icon: '📘',
      bgColor: 'bg-blue-600',
      maxLength: 63206,
      aspectRatio: 'aspect-video'
    },
    instagram: {
      name: 'Instagram',
      icon: '📷',
      bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      maxLength: 2200,
      aspectRatio: 'aspect-square'
    },
    tiktok: {
      name: 'TikTok',
      icon: '🎵',
      bgColor: 'bg-black',
      maxLength: 2200,
      aspectRatio: 'aspect-[9/16]'
    }
  };

  const config = platformConfig[activePlatform] || platformConfig.facebook;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">👁️ Previzualizare</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          {copied ? '✅ Copiat!' : '📋 Copiază'}
        </button>
      </div>

      {/* Platform Selector */}
      {platforms.length > 1 && (
        <div className="flex gap-2 mb-4">
          {platforms.map((platform) => {
            const cfg = platformConfig[platform];
            return (
              <button
                key={platform}
                onClick={() => setActivePlatform(platform)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activePlatform === platform
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cfg?.icon} {cfg?.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Preview Card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden max-w-sm mx-auto">
        {/* Platform Header */}
        <div className={`${config.bgColor} px-4 py-2 flex items-center gap-2`}>
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">
            {config.icon}
          </div>
          <span className="text-white text-sm font-medium">{config.name}</span>
        </div>

        {/* Post Author */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              P
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">Popas pentru Suflet</div>
              <div className="text-xs text-gray-500">Acum • 🌍</div>
            </div>
          </div>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className={`${config.aspectRatio} bg-gray-100 overflow-hidden`}>
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-3">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {post.hashtags?.length > 0 && (
            <p className="text-sm text-blue-600 mt-2 leading-relaxed">
              {post.hashtags.join(' ')}
            </p>
          )}

          {/* Engagement Bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex gap-3">
              <button className="text-gray-400 hover:text-blue-500 text-sm transition-colors">
                👍 Apreciez
              </button>
              <button className="text-gray-400 hover:text-blue-500 text-sm transition-colors">
                💬 Comentez
              </button>
              <button className="text-gray-400 hover:text-blue-500 text-sm transition-colors">
                ↗️ Distribuie
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Character Count */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>Caractere: {post.content?.length || 0}</span>
        <span className={post.content?.length > config.maxLength ? 'text-red-500' : 'text-green-600'}>
          {config.maxLength - (post.content?.length || 0)} rămase pentru {config.name}
        </span>
      </div>
    </div>
  );
};

export default PostPreview;