import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { generateAPI, versesAPI } from '../services/api';

const PostGenerator = ({ onContentGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [verse, setVerse] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('inspirational');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook', 'instagram']);
  const [customVerse, setCustomVerse] = useState('');
  const [customVerseRef, setCustomVerseRef] = useState('');
  const [useCustomVerse, setUseCustomVerse] = useState(false);
  const [tone, setTone] = useState('cald');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [loadingVerse, setLoadingVerse] = useState(false);

  const themes = [
    { value: 'inspirational', label: '🌟 Inspirațional', desc: 'Mesaje de încurajare' },
    { value: 'rugaciune', label: '🙏 Rugăciune', desc: 'Invitație la rugăciune' },
    { value: 'speranta', label: '🌈 Speranță', desc: 'Mesaje de speranță' },
    { value: 'iubire', label: '❤️ Iubire', desc: 'Dragostea lui Dumnezeu' },
    { value: 'credinta', label: '✝️ Credință', desc: 'Întărirea credinței' },
    { value: 'pace', label: '🕊️ Pace', desc: 'Pacea sufletului' },
    { value: 'bucurie', label: '😊 Bucurie', desc: 'Bucuria în Domnul' },
    { value: 'intelepciune', label: '📖 Înțelepciune', desc: 'Cuvinte de înțelepciune' }
  ];

  const tones = [
    { value: 'cald', label: '🤗 Cald și prietenos' },
    { value: 'solemn', label: '🕊️ Solemn și reverent' },
    { value: 'energic', label: '⚡ Energic și motivant' },
    { value: 'meditativ', label: '🌙 Meditativ și contemplativ' }
  ];

  const platforms = [
    { value: 'facebook', label: '📘 Facebook', icon: '📘' },
    { value: 'instagram', label: '📷 Instagram', icon: '📷' },
    { value: 'tiktok', label: '🎵 TikTok', icon: '🎵' }
  ];

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = async () => {
    setLoadingVerse(true);
    try {
      const response = await versesAPI.getDaily();
      setVerse(response.data);
    } catch (error) {
      console.error('Eroare la încărcarea versetului:', error);
      setVerse({
        text: 'Căci atât de mult a iubit Dumnezeu lumea, că a dat pe singurul Lui Fiu, pentru ca oricine crede în El să nu piară, ci să aibă viața veșnică.',
        reference: 'Ioan 3:16',
        book: 'Ioan'
      });
    } finally {
      setLoadingVerse(false);
    }
  };

  const loadRandomVerse = async () => {
    setLoadingVerse(true);
    try {
      const response = await versesAPI.getRandom({ theme: selectedTheme });
      setVerse(response.data);
      toast.success('Verset nou încărcat! 📖');
    } catch (error) {
      toast.error('Eroare la încărcarea versetului');
    } finally {
      setLoadingVerse(false);
    }
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) {
      toast.warning('Selectează cel puțin o platformă!');
      return;
    }

    const activeVerse = useCustomVerse
      ? { text: customVerse, reference: customVerseRef }
      : verse;

    if (!activeVerse?.text) {
      toast.warning('Te rugăm să adaugi un verset!');
      return;
    }

    setLoading(true);
    try {
      const response = await generateAPI.generateContent({
        verse: activeVerse,
        theme: selectedTheme,
        platforms: selectedPlatforms,
        tone,
        includeHashtags
      });

      setGeneratedContent(response.data);
      onContentGenerated?.(response.data, activeVerse);
      toast.success('Conținut generat cu succes! ✨');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Eroare la generare. Verifică conexiunea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Verset Section */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            📖 Versetul Biblic
          </h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomVerse}
                onChange={(e) => setUseCustomVerse(e.target.checked)}
                className="rounded"
              />
              Verset propriu
            </label>
          </div>
        </div>

        {useCustomVerse ? (
          <div className="space-y-3">
            <textarea
              value={customVerse}
              onChange={(e) => setCustomVerse(e.target.value)}
              placeholder="Introdu textul versetului biblic..."
              className="w-full border border-amber-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
              rows={3}
            />
            <input
              type="text"
              value={customVerseRef}
              onChange={(e) => setCustomVerseRef(e.target.value)}
              placeholder="Referință (ex: Ioan 3:16)"
              className="w-full border border-amber-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
        ) : (
          <div>
            {loadingVerse ? (
              <div className="flex items-center gap-2 text-amber-600 py-3">
                <div className="animate-spin">⏳</div>
                <span className="text-sm">Se încarcă versetul...</span>
              </div>
            ) : verse ? (
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <p className="text-gray-700 italic leading-relaxed">„{verse.text}"</p>
                <p className="text-amber-600 font-semibold text-sm mt-2">— {verse.reference}</p>
              </div>
            ) : null}
            <button
              onClick={loadRandomVerse}
              disabled={loadingVerse}
              className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 hover:underline"
            >
              🔄 Generează alt verset
            </button>
          </div>
        )}
      </div>

      {/* Theme Selection */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          🎨 Tema Postării
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {themes.map(theme => (
            <button
              key={theme.value}
              onClick={() => setSelectedTheme(theme.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                selectedTheme === theme.value
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-amber-300'
              }`}
            >
              <div className="text-lg mb-1">{theme.label.split(' ')[0]}</div>
              <div className="text-xs font-semibold text-gray-700">
                {theme.label.split(' ').slice(1).join(' ')}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{theme.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">🎭 Tonul Mesajului</h3>
        <div className="grid grid-cols-2 gap-2">
          {tones.map(t => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                tone === t.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">📱 Platforme Țintă</h3>
        <div className="flex gap-3">
          {platforms.map(p => (
            <button
              key={p.value}
              onClick={() => togglePlatform(p.value)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-medium text-sm transition-all duration-150 ${
                selectedPlatforms.includes(p.value)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-green-300'
              }`}
            >
              <span className="text-lg">{p.icon}</span>
              <span className="hidden sm:inline">{p.label.split(' ')[1]}</span>
              {selectedPlatforms.includes(p.value) && (
                <span className="text-green-500">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeHashtags}
            onChange={(e) => setIncludeHashtags(e.target.checked)}
            className="rounded text-amber-500"
          />
          <span className="text-sm text-gray-600">Include hashtag-uri românești</span>
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || selectedPlatforms.length === 0}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
          loading || selectedPlatforms.length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:-translate-y-0.5 transform'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin">⏳</div>
            Se generează conținutul...
          </>
        ) : (
          <>
            ✨ Generează Postarea
          </>
        )}
      </button>

      {/* Generated Content Preview */}
      {generatedContent && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            ✅ Conținut Generat
          </h4>
          {Object.entries(generatedContent.platformContent || {}).map(([platform, content]) => (
            <div key={platform} className="mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                {platform === 'facebook' ? '📘' : platform === 'instagram' ? '📷' : '🎵'} {platform}
              </p>
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-4">
                  {content.description}
                </p>
                {content.hashtags && (
                  <p className="text-xs text-blue-500 mt-2">{content.hashtags}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostGenerator;