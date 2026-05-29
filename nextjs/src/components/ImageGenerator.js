'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { generateAPI } from '../services/api';

const ImageGenerator = ({ content, theme, onImageGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageStyle, setImageStyle] = useState('warm');
  const [platform, setPlatform] = useState('instagram');
  const [customPrompt, setCustomPrompt] = useState('');

  const styles = [
    { value: 'warm', label: '🌅 Cald', desc: 'Tonuri aurii' },
    { value: 'nature', label: '🌿 Natură', desc: 'Peisaje naturale' },
    { value: 'minimal', label: '⬜ Minimal', desc: 'Design simplu' },
    { value: 'spiritual', label: '✨ Spiritual', desc: 'Luminos, eteric' },
    { value: 'church', label: '⛪ Bisericesc', desc: 'Arhitectură sacră' },
    { value: 'abstract', label: '🎨 Abstract', desc: 'Arte abstracte' }
  ];

  const platforms = [
    { value: 'instagram', label: '📷 Instagram', size: '1080×1080' },
    { value: 'facebook', label: '📘 Facebook', size: '1200×630' },
    { value: 'tiktok', label: '🎵 TikTok', size: '1080×1920' },
    { value: 'story', label: '📱 Story', size: '1080×1920' }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await generateAPI.generateImage({
        content,
        theme,
        style: imageStyle,
        platform,
        customPrompt,
        count: 2
      });

      const images = response.data.images || [response.data];
      setGeneratedImages(images);
      if (images.length > 0) setSelectedImage(images[0]);
      toast.success('Imagini generate cu succes! 🎨');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Eroare la generarea imaginii');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (image) => {
    setSelectedImage(image);
    onImageGenerated?.(image);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>🎨</span> Generator Imagini
      </h3>

      {/* Platform Selection */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600 mb-2 block">
          Platformă & Dimensiune
        </label>
        <div className="grid grid-cols-2 gap-2">
          {platforms.map(p => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              className={`p-2 rounded-lg border text-left transition-all ${
                platform === p.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{p.label}</div>
              <div className="text-xs text-gray-500">{p.size}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style Selection */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600 mb-2 block">
          Stil Vizual
        </label>
        <div className="grid grid-cols-3 gap-2">
          {styles.map(s => (
            <button
              key={s.value}
              onClick={() => setImageStyle(s.value)}
              className={`p-2 rounded-lg border text-center transition-all ${
                imageStyle === s.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm">{s.label}</div>
              <div className="text-xs text-gray-400">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600 mb-2 block">
          Descriere Personalizată (opțional)
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ex: o lumânare aprinsă pe un fundal auriu cu raze de lumină..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Generez imagini...
          </span>
        ) : (
          '✨ Generează Imagini'
        )}
      </button>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            Imagini Generate - selectează una:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {generatedImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectImage(img)}
                className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage === img
                    ? 'border-purple-500 shadow-lg'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={img.url || img}
                  alt={`Generated ${idx + 1}`}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/300x200/9333ea/white?text=Imagine+${idx + 1}`;
                  }}
                />
                {selectedImage === img && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white
                                  rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedImage && (
            <div className="mt-3 flex gap-2">
              <a
                href={selectedImage.url || selectedImage}
                download="imagine-spirituala.jpg"
                className="flex-1 py-2 text-center text-sm bg-gray-100 hover:bg-gray-200
                           rounded-lg transition-colors font-medium"
              >
                ⬇️ Descarcă
              </a>
              <button
                onClick={() => {
                  onImageGenerated?.(selectedImage);
                  toast.success('Imagine selectată pentru post!');
                }}
                className="flex-1 py-2 text-sm bg-purple-100 hover:bg-purple-200
                           text-purple-700 rounded-lg transition-colors font-medium"
              >
                ✅ Folosește
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;