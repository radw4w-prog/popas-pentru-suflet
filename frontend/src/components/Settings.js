import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { settingsAPI } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    pageName: 'Popas pentru Suflet',
    language: 'ro',
    defaultTheme: 'inspirational',
    defaultTone: 'cald',
    autoHashtags: true,
    hashtagCount: 15,
    defaultPlatforms: ['facebook', 'instagram'],
    postingSchedule: {
      enabled: true,
      times: ['08:00', '18:00'],
      timezone: 'Europe/Bucharest'
    },
    aiModel: 'gpt-4',
    imageStyle: 'warm',
    notifications: {
      email: true,
      browser: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.log('Setările implicite sunt active');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsAPI.save(settings);
      setSaved(true);
      toast.success('Setările au fost salvate! ✅');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedSetting = (parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value }
    }));
  };

  const togglePlatform = (platform) => {
    setSettings(prev => ({
      ...prev,
      defaultPlatforms: prev.defaultPlatforms.includes(platform)
        ? prev.defaultPlatforms.filter(p => p !== platform)
        : [...prev.defaultPlatforms, platform]
    }));
  };

  const addScheduleTime = () => {
    setSettings(prev => ({
      ...prev,
      postingSchedule: {
        ...prev.postingSchedule,
        times: [...prev.postingSchedule.times, '12:00']
      }
    }));
  };

  const removeScheduleTime = (idx) => {
    setSettings(prev => ({
      ...prev,
      postingSchedule: {
        ...prev.postingSchedule,
        times: prev.postingSchedule.times.filter((_, i) => i !== idx)
      }
    }));
  };

  const SectionTitle = ({ icon, title, subtitle }) => (
    <div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-100">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          value ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          value ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <SectionTitle icon="⚙️" title="Setări Generale" subtitle="Configurația de bază a aplicației" />
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Numele Paginii
            </label>
            <input
              type="text"
              value={settings.pageName}
              onChange={(e) => updateSetting('pageName', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Limbă
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400"
            >
              <option value="ro">🇷🇴 Română</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <SectionTitle icon="🤖" title="Setări AI" subtitle="Configurează modelul de inteligență artificială" />
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Model AI
            </label>
            <select
              value={settings.aiModel}
              onChange={(e) => updateSetting('aiModel', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400"
            >
              <option value="gpt-4">GPT-4 (Recomandat)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Mai rapid)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tema Implicită
            </label>
            <select
              value={settings.defaultTheme}
              onChange={(e) => updateSetting('defaultTheme', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400"
            >
              <option value="inspirational">🌟 Inspirațional</option>
              <option value="rugaciune">🙏 Rugăciune</option>
              <option value="speranta">🌈 Speranță</option>
              <option value="iubire">❤️ Iubire</option>
              <option value="credinta">✝️ Credință</option>
              <option value="pace">🕊️ Pace</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ton Implicit
            </label>
            <select
              value={settings.defaultTone}
              onChange={(e) => updateSetting('defaultTone', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400"
            >
              <option value="cald">🤗 Cald și prietenos</option>
              <option value="solemn">🕊️ Solemn și reverent</option>
              <option value="energic">⚡ Energic și motivant</option>
              <option value="meditativ">🌙 Meditativ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hashtags */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <SectionTitle icon="#️⃣" title="Hashtag-uri" subtitle="Configurează hashtagurile automate" />
        
        <div className="space-y-4">
          <Toggle
            value={settings.autoHashtags}
            onChange={(v) => updateSetting('autoHashtags', v)}
            label="Generare automată hashtag-uri"
          />
          
          {settings.autoHashtags && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Număr hashtag-uri: {settings.hashtagCount}
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={settings.hashtagCount}
                onChange={(e) => updateSetting('hashtagCount', parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 (minim)</span>
                <span>30 (maxim)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platforms */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <SectionTitle icon="📱" title="Platforme Implicite" subtitle="Platformele selectate automat la generare" />
        
        <div className="flex gap-3">
          {[
            { value: 'facebook', icon: '📘', label: 'Facebook' },
            { value: 'instagram', icon: '📷', label: 'Instagram' },
            { value: 'tiktok', icon: '🎵', label: 'TikTok' }
          ].map(p => (
            <button
              key={p.value}
              onClick={() => togglePlatform(p.value)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                settings.defaultPlatforms.includes(p.value)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-sm font-medium text-gray-700">{p.label}</span>
              {settings.defaultPlatforms.includes(p.value) && (
                <span className="text-xs text-green-600 font-bold">✓ Activ</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <SectionTitle icon="⏰" title="Programare Automată" subtitle="Orele implicite pentru postare" />
        
        <div className="space-y-4">
          <Toggle
            value={settings.postingSchedule.enabled}
            onChange={(v) => updateNestedSetting('postingSchedule', 'enabled', v)}
            label="Activează programarea automată"
          />

          {settings.postingSchedule.enabled && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Ore de Postare
                  </label>
                  <button
                    onClick={addScheduleTime}
                    className="text-xs text-amber-600 hover:underline font-medium"
                  >
                    + Adaugă oră
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.postingSchedule.times.map((time, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...settings.postingSchedule.times];
                          newTimes[idx] = e.target.value;
                          updateNestedSetting('postingSchedule', 'times', newTimes);
                        }}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400"
                      />
                      {settings.postingSchedule.times.length > 1 && (
                        <button
                          onClick={() => removeScheduleTime(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Fus Orar
                </label>
                <select
                  value={settings.postingSchedule.timezone}
                  onChange={(e) => updateNestedSetting('postingSchedule', 'timezone', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Europe/Bucharest">Europa/București (GMT+2)</option>
                  <option value="Europe/London">Europa/Londra (GMT+0)</option>
                  <option value="America/New_York">America/New York (GMT-5)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <SectionTitle icon="🔔" title="Notificări" subtitle="Configurează alertele" />
        
        <div className="space-y-3">
          <Toggle
            value={settings.notifications.email}
            onChange={(v) => updateNestedSetting('notifications', 'email', v)}
            label="Notificări email"
          />
          <Toggle
            value={settings.notifications.browser}
            onChange={(v) => updateNestedSetting('notifications', 'browser', v)}
            label="Notificări browser"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          saved
            ? 'bg-green-500'
            : loading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg'
        }`}
      >
        {loading ? (
          <><div className="animate-spin">⏳</div> Se salvează...</>
        ) : saved ? (
          <>✅ Salvat cu succes!</>
        ) : (
          <>💾 Salvează Setările</>
        )}
      </button>
    </div>
  );
};

export default Settings;