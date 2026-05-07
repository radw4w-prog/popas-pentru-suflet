// frontend/src/components/AudioBiblePlayer.js
import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || '';

const AudioBiblePlayer = ({ verses, bookName, chapter, onClose, onVerseChange }) => {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRate] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ttsMode, setTtsMode] = useState('loading');
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [error, setError] = useState('');

  const audioRef = useRef(new Audio());
  const synthRef = useRef(window.speechSynthesis);
  const resumeTimerRef = useRef(null);
  const currentIndexRef = useRef(0);
  const playingRef = useRef(false);

  // Sync refs
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Verifică status TTS
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const r = await fetch(`${API_URL}/api/tts/status`);
        const data = await r.json();
        setTtsMode(data.configured ? 'voicerss' : 'browser');
        console.log('🎙️ TTS Provider:', data.provider);
      } catch (e) {
        setTtsMode('browser');
      }
    };
    checkStatus();
  }, []);

  // Media Session setup
  const updateMediaSession = useCallback((index) => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${bookName} ${chapter}:${index + 1}`,
      artist: 'Popas pentru Suflet',
      album: `${bookName} — Capitol ${chapter}`,
      artwork: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.playbackState = 'playing';
  }, [bookName, chapter]);

  // ═══════════════════════════════════════
  // VOICERSS TTS
  // ═══════════════════════════════════════
  const speakWithVoiceRSS = useCallback(async (index) => {
    if (!verses || index >= verses.length || index < 0) {
      setPlaying(false);
      playingRef.current = false;
      setProgress(100);
      setLoadingVerse(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      return;
    }

    const verse = verses[index];
    const text = verse.text || '';

    if (!text.trim()) {
      speakWithVoiceRSS(index + 1);
      return;
    }

    setCurrentIndex(index);
    currentIndexRef.current = index;
    setProgress(Math.round((index / verses.length) * 100));
    setLoadingVerse(true);
    setError('');
    updateMediaSession(index);
    onVerseChange?.(index);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tts/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          text,
          referinta: `${bookName} ${chapter}:${index + 1}`,
          rate
        })
      });

      const data = await response.json();

      if (data.success && data.audio) {
        const audio = audioRef.current;

        // Oprește audio anterior
        audio.pause();
        audio.src = '';

        audio.src = `data:audio/mp3;base64,${data.audio}`;
        audio.playbackRate = getRateMultiplier();

        audio.onloadeddata = async () => {
          setLoadingVerse(false);
          try {
            await audio.play();
            setPlaying(true);
            playingRef.current = true;
          } catch (e) {
            console.error('Audio play error:', e);
            speakWithBrowser(index);
          }
        };

        audio.onended = () => {
          if (playingRef.current) {
            speakWithVoiceRSS(currentIndexRef.current + 1);
          }
        };

        audio.onerror = () => {
          console.warn('Audio element error, fallback to browser');
          setLoadingVerse(false);
          speakWithBrowser(index);
        };

      } else if (data.fallbackToBrowser) {
        setLoadingVerse(false);
        speakWithBrowser(index);
      } else {
        setLoadingVerse(false);
        setError('Eroare TTS. Folosesc voce browser.');
        speakWithBrowser(index);
      }

    } catch (e) {
      console.error('VoiceRSS fetch error:', e);
      setLoadingVerse(false);
      speakWithBrowser(index);
    }
  }, [verses, rate, bookName, chapter, updateMediaSession, onVerseChange]);

  // ═══════════════════════════════════════
  // BROWSER TTS — fallback
  // ═══════════════════════════════════════
  const speakWithBrowser = useCallback((index) => {
    if (!verses || index >= verses.length || index < 0) {
      setPlaying(false);
      playingRef.current = false;
      setProgress(100);
      return;
    }

    synthRef.current.cancel();
    setLoadingVerse(false);

    const verse = verses[index];
    const text = verse.text || '';

    if (!text.trim()) {
      speakWithBrowser(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ro-RO';
    utterance.rate = getBrowserRate();
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = synthRef.current.getVoices();
    const roVoice = voices.find(v =>
      v.lang.startsWith('ro') ||
      v.name.toLowerCase().includes('ioana') ||
      v.name.toLowerCase().includes('roman')
    );
    if (roVoice) utterance.voice = roVoice;

    utterance.onstart = () => {
      setCurrentIndex(index);
      currentIndexRef.current = index;
      setPlaying(true);
      playingRef.current = true;
      setProgress(Math.round((index / verses.length) * 100));
      updateMediaSession(index);
      onVerseChange?.(index);
    };

    utterance.onend = () => {
      if (playingRef.current) {
        speakWithBrowser(currentIndexRef.current + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        setTimeout(() => speakWithBrowser(currentIndexRef.current + 1), 500);
      }
    };

    synthRef.current.speak(utterance);

    clearInterval(resumeTimerRef.current);
    resumeTimerRef.current = setInterval(() => {
      if (synthRef.current.speaking && !synthRef.current.paused) {
        synthRef.current.pause();
        synthRef.current.resume();
      }
    }, 10000);
  }, [verses, rate, updateMediaSession, onVerseChange]);

  // Rate helpers
  const getRateMultiplier = () => {
    const rateMap = { '-3': 0.5, '-2': 0.7, '-1': 0.85, '0': 1, '1': 1.2, '2': 1.5, '3': 2 };
    return rateMap[String(rate)] || 1;
  };

  const getBrowserRate = () => {
    const rateMap = { '-3': 0.5, '-2': 0.7, '-1': 0.85, '0': 1, '1': 1.2, '2': 1.5, '3': 2 };
    return rateMap[String(rate)] || 1;
  };

  // ═══════════════════════════════════════
  // SPEAK — alege provider
  // ═══════════════════════════════════════
  const speakVerse = useCallback((index) => {
    if (ttsMode === 'voicerss') {
      speakWithVoiceRSS(index);
    } else {
      speakWithBrowser(index);
    }
  }, [ttsMode, speakWithVoiceRSS, speakWithBrowser]);

  // Expose global pentru click pe verset
  useEffect(() => {
    window.__audioBiblePlayFrom = (index) => {
      audioRef.current.pause();
      synthRef.current.cancel();
      clearInterval(resumeTimerRef.current);
      speakVerse(index);
    };
    return () => { delete window.__audioBiblePlayFrom; };
  }, [speakVerse]);

  // Media Session action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const handlers = {
      play: () => handleResume(),
      pause: () => handlePause(),
      previoustrack: () => handlePrev(),
      nexttrack: () => handleNext()
    };

    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    });
  });

  // ═══════════════════════════════════════
  // CONTROLS
  // ═══════════════════════════════════════
  const handlePlay = useCallback(() => {
    speakVerse(currentIndexRef.current);
  }, [speakVerse]);

  const handlePause = useCallback(() => {
    audioRef.current.pause();
    synthRef.current.pause();
    clearInterval(resumeTimerRef.current);
    setPlaying(false);
    playingRef.current = false;
    setLoadingVerse(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }, []);

  const handleResume = useCallback(() => {
    if (ttsMode === 'voicerss' && audioRef.current.src) {
      audioRef.current.play();
      setPlaying(true);
      playingRef.current = true;
    } else if (ttsMode === 'browser' && synthRef.current.paused) {
      synthRef.current.resume();
      setPlaying(true);
      playingRef.current = true;
    } else {
      handlePlay();
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }, [ttsMode, handlePlay]);

  const handleStop = useCallback(() => {
    audioRef.current.pause();
    audioRef.current.src = '';
    synthRef.current.cancel();
    clearInterval(resumeTimerRef.current);
    setPlaying(false);
    playingRef.current = false;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setProgress(0);
    setLoadingVerse(false);
    setError('');
    onVerseChange?.(0);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  }, [onVerseChange]);

  const handleNext = useCallback(() => {
    audioRef.current.pause();
    synthRef.current.cancel();
    clearInterval(resumeTimerRef.current);
    const next = Math.min(currentIndexRef.current + 1, verses.length - 1);
    setCurrentIndex(next);
    currentIndexRef.current = next;
    if (playingRef.current) speakVerse(next);
  }, [verses, speakVerse]);

  const handlePrev = useCallback(() => {
    audioRef.current.pause();
    synthRef.current.cancel();
    clearInterval(resumeTimerRef.current);
    const prev = Math.max(currentIndexRef.current - 1, 0);
    setCurrentIndex(prev);
    currentIndexRef.current = prev;
    if (playingRef.current) speakVerse(prev);
  }, [speakVerse]);

  const handleRateChange = useCallback((newRate) => {
    setRate(newRate);
    if (ttsMode === 'voicerss') {
      const rateMap = { '-3': 0.5, '-2': 0.7, '-1': 0.85, '0': 1, '1': 1.2, '2': 1.5, '3': 2 };
      audioRef.current.playbackRate = rateMap[String(newRate)] || 1;
    }
  }, [ttsMode]);

  // Cleanup
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.src = '';
      synthRef.current.cancel();
      clearInterval(resumeTimerRef.current);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
    };
  }, []);

  useEffect(() => {
    synthRef.current.getVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => synthRef.current.getVoices();
    }
  }, []);

  const currentVerse = verses?.[currentIndex];

  const rateOptions = [
    { value: -3, label: '0.5x' },
    { value: -2, label: '0.7x' },
    { value: -1, label: '0.85x' },
    { value: 0, label: '1x' },
    { value: 1, label: '1.2x' },
    { value: 2, label: '1.5x' },
    { value: 3, label: '2x' }
  ];

  return (
    <div className="audio-player">
      {/* Progress */}
      <div className="audio-progress-bar">
        <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Info */}
      <div className="audio-info">
        <div className="audio-title">
          {loadingVerse ? '⏳' : '🔊'}{' '}
          {bookName} {chapter}:{currentIndex + 1}
          <span className="audio-tts-badge">
            {ttsMode === 'voicerss' ? '🇷🇴 VoiceRSS' : ttsMode === 'browser' ? '🔤 Browser' : '⏳'}
          </span>
        </div>
        <div className="audio-verse-preview">
          {loadingVerse
            ? 'Se generează audio în română...'
            : error
              ? error
              : (currentVerse?.text?.substring(0, 65) || '...')
                + ((currentVerse?.text?.length || 0) > 65 ? '...' : '')
          }
        </div>
      </div>

      {/* Controls */}
      <div className="audio-controls">
        {/* Viteză */}
        <div className="audio-speed">
          <select
            value={rate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            className="audio-speed-select"
          >
            {rateOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Main */}
        <div className="audio-main-controls">
          <button
            className="audio-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0 || loadingVerse}
            title="Versetul anterior"
          >
            ⏮
          </button>

          {playing ? (
            <button
              className="audio-btn audio-btn-main"
              onClick={handlePause}
              title="Pauză"
            >
              ⏸️
            </button>
          ) : (
            <button
              className="audio-btn audio-btn-main"
              onClick={loadingVerse ? undefined : handleResume}
              disabled={loadingVerse}
              title="Redă"
            >
              {loadingVerse ? '⏳' : '▶️'}
            </button>
          )}

          <button
            className="audio-btn"
            onClick={handleNext}
            disabled={currentIndex >= verses.length - 1 || loadingVerse}
            title="Versetul următor"
          >
            ⏭
          </button>
        </div>

        {/* Right */}
        <div className="audio-right-controls">
          <button
            className="audio-btn-sm"
            onClick={handleStop}
            title="Oprește și resetează"
          >
            ⏹
          </button>
          <button
            className="audio-btn-sm"
            onClick={() => { handleStop(); onClose?.(); }}
            title="Închide player"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="audio-counter">
        {currentIndex + 1} / {verses.length} versete
        {ttsMode === 'voicerss' && (
          <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>
            • voce română
          </span>
        )}
      </div>
    </div>
  );
};

export default AudioBiblePlayer;