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
  const [statusText, setStatusText] = useState('');

  const audioRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const resumeTimerRef = useRef(null);
  const currentIndexRef = useRef(0);
  const playingRef = useRef(false);
  const abortRef = useRef(false);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Inițializare audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Verifică TTS provider
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${API_URL}/api/tts/status`);
        const data = await r.json();
        if (data.configured) {
          setTtsMode('voicerss');
          setStatusText('🇷🇴 Voce română');
        } else {
          setTtsMode('browser');
          setStatusText('🔤 Voce browser');
        }
      } catch (e) {
        setTtsMode('browser');
        setStatusText('🔤 Voce browser');
      }
    };
    check();
  }, []);

  // Media Session
  const updateMediaSession = useCallback((index) => {
    if (!('mediaSession' in navigator)) return;
    try {
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
    } catch (e) {}
  }, [bookName, chapter]);

  // ═══════════════════════════════════════
  // VOICERSS — voce română
  // ═══════════════════════════════════════
  const speakWithVoiceRSS = useCallback(async (index) => {
    if (abortRef.current) return;
    if (!verses || index >= verses.length || index < 0) {
      setPlaying(false);
      playingRef.current = false;
      setProgress(100);
      setLoadingVerse(false);
      setStatusText('✅ Capitol terminat');
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      return;
    }

    const verse = verses[index];
    const text = verse?.text || '';

    if (!text.trim()) {
      speakWithVoiceRSS(index + 1);
      return;
    }

    setCurrentIndex(index);
    currentIndexRef.current = index;
    setProgress(Math.round((index / verses.length) * 100));
    setLoadingVerse(true);
    setStatusText('⏳ Se generează...');
    updateMediaSession(index);
    onVerseChange?.(index);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/tts/speak`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: text.trim(),
          referinta: `${bookName} ${chapter}:${index + 1}`,
          rate
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (abortRef.current) return;

      if (data.success && data.audio) {
        const audio = audioRef.current;
        audio.pause();

        const src = `data:audio/mp3;base64,${data.audio}`;
        audio.src = src;

        // Viteză
        const rateMap = {
          '-3': 0.5, '-2': 0.7, '-1': 0.85,
          '0': 1, '1': 1.2, '2': 1.5, '3': 2
        };
        audio.playbackRate = rateMap[String(rate)] || 1;

        audio.oncanplaythrough = null;
        audio.onended = null;
        audio.onerror = null;

        audio.onended = () => {
          if (playingRef.current && !abortRef.current) {
            speakWithVoiceRSS(currentIndexRef.current + 1);
          }
        };

        audio.onerror = (e) => {
          console.error('Audio element error:', e);
          if (!abortRef.current) {
            setStatusText('⚠️ Eroare audio, încerc din nou...');
            setTimeout(() => speakWithVoiceRSS(currentIndexRef.current), 1000);
          }
        };

        try {
          await audio.play();
          setLoadingVerse(false);
          setPlaying(true);
          playingRef.current = true;
          setStatusText('🇷🇴 Voce română');
        } catch (playError) {
          console.error('Play error:', playError.message);
          setLoadingVerse(false);

          if (playError.name === 'NotAllowedError') {
            setPlaying(false);
            playingRef.current = false;
            setStatusText('⚠️ Apasă play pentru a porni');
          } else {
            speakWithBrowser(index);
          }
        }

      } else {
        console.warn('VoiceRSS fallback:', data.error);
        setLoadingVerse(false);
        speakWithBrowser(index);
      }

    } catch (e) {
      console.error('VoiceRSS fetch error:', e.message);
      if (!abortRef.current) {
        setLoadingVerse(false);
        speakWithBrowser(index);
      }
    }
  }, [verses, rate, bookName, chapter, updateMediaSession, onVerseChange]);

  // ═══════════════════════════════════════
  // BROWSER TTS — fallback
  // ═══════════════════════════════════════
  const speakWithBrowser = useCallback((index) => {
    if (abortRef.current) return;
    if (!verses || index >= verses.length || index < 0) {
      setPlaying(false);
      playingRef.current = false;
      setProgress(100);
      return;
    }

    synthRef.current.cancel();
    setLoadingVerse(false);

    const verse = verses[index];
    const text = verse?.text || '';
    if (!text.trim()) {
      speakWithBrowser(index + 1);
      return;
    }

    const rateMap = {
      '-3': 0.5, '-2': 0.7, '-1': 0.85,
      '0': 1, '1': 1.2, '2': 1.5, '3': 2
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ro-RO';
    utterance.rate = rateMap[String(rate)] || 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = synthRef.current.getVoices();
    const roVoice = voices.find(v =>
      v.lang?.startsWith('ro') ||
      v.name?.toLowerCase().includes('ioana') ||
      v.name?.toLowerCase().includes('roman')
    );
    if (roVoice) utterance.voice = roVoice;

    utterance.onstart = () => {
      if (abortRef.current) { synthRef.current.cancel(); return; }
      setCurrentIndex(index);
      currentIndexRef.current = index;
      setPlaying(true);
      playingRef.current = true;
      setProgress(Math.round((index / verses.length) * 100));
      setStatusText('🔤 Voce browser');
      updateMediaSession(index);
      onVerseChange?.(index);
    };

    utterance.onend = () => {
      if (playingRef.current && !abortRef.current) {
        speakWithBrowser(currentIndexRef.current + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && !abortRef.current) {
        setTimeout(() => speakWithBrowser(currentIndexRef.current + 1), 500);
      }
    };

    synthRef.current.speak(utterance);

    // Chrome bug fix
    clearInterval(resumeTimerRef.current);
    resumeTimerRef.current = setInterval(() => {
      if (synthRef.current.speaking && !synthRef.current.paused) {
        synthRef.current.pause();
        synthRef.current.resume();
      }
    }, 10000);
  }, [verses, rate, updateMediaSession, onVerseChange]);

  // ═══════════════════════════════════════
  // SPEAK — alege provider
  // ═══════════════════════════════════════
  const speakVerse = useCallback((index) => {
    abortRef.current = false;
    if (ttsMode === 'voicerss') {
      speakWithVoiceRSS(index);
    } else {
      speakWithBrowser(index);
    }
  }, [ttsMode, speakWithVoiceRSS, speakWithBrowser]);

  // Expose global
  useEffect(() => {
    window.__audioBiblePlayFrom = (index) => {
      abortRef.current = true;
      if (audioRef.current) audioRef.current.pause();
      synthRef.current.cancel();
      clearInterval(resumeTimerRef.current);
      setTimeout(() => {
        abortRef.current = false;
        speakVerse(index);
      }, 100);
    };
    return () => { delete window.__audioBiblePlayFrom; };
  }, [speakVerse]);

  // Media Session handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => handleResume());
      navigator.mediaSession.setActionHandler('pause', () => handlePause());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
    } catch (e) {}
  });

  // ═══════════════════════════════════════
  // CONTROLS
  // ═══════════════════════════════════════
  const handlePlay = useCallback(() => {
    speakVerse(currentIndexRef.current);
  }, [speakVerse]);

  const handlePause = useCallback(() => {
    abortRef.current = true;
    if (audioRef.current) audioRef.current.pause();
    synthRef.current.pause();
    clearInterval(resumeTimerRef.current);
    setPlaying(false);
    playingRef.current = false;
    setLoadingVerse(false);
    setStatusText('⏸ Pauză');
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }, []);

  const handleResume = useCallback(() => {
    abortRef.current = false;
    if (ttsMode === 'voicerss' && audioRef.current?.src && audioRef.current.src !== window.location.href) {
      audioRef.current.play()
        .then(() => {
          setPlaying(true);
          playingRef.current = true;
          setStatusText('🇷🇴 Voce română');
        })
        .catch(() => handlePlay());
    } else if (ttsMode === 'browser' && synthRef.current.paused) {
      synthRef.current.resume();
      setPlaying(true);
      playingRef.current = true;
      resumeTimerRef.current = setInterval(() => {
        if (synthRef.current.speaking && !synthRef.current.paused) {
          synthRef.current.pause();
          synthRef.current.resume();
        }
      }, 10000);
    } else {
      handlePlay();
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }, [ttsMode, handlePlay]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    synthRef.current.cancel();
    clearInterval(resumeTimerRef.current);
    setPlaying(false);
    playingRef.current = false;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setProgress(0);
    setLoadingVerse(false);
    setStatusText('');
    onVerseChange?.(0);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  }, [onVerseChange]);

  const handleNext = useCallback(() => {
    abortRef.current = true;
    if (audioRef.current) audioRef.current.pause();
    synthRef.current.cancel();
    clearInterval(resumeTimerRef.current);
    const next = Math.min(currentIndexRef.current + 1, (verses?.length || 1) - 1);
    setCurrentIndex(next);
    currentIndexRef.current = next;
    setTimeout(() => {
      if (playingRef.current) speakVerse(next);
    }, 100);
  }, [verses, speakVerse]);

  const handlePrev = useCallback(() => {
    abortRef.current = true;
    if (audioRef.current) audioRef.current.pause();
    synthRef.current.cancel();
    clearInterval(resumeTimerRef.current);
    const prev = Math.max(currentIndexRef.current - 1, 0);
    setCurrentIndex(prev);
    currentIndexRef.current = prev;
    setTimeout(() => {
      if (playingRef.current) speakVerse(prev);
    }, 100);
  }, [speakVerse]);

  const handleRateChange = useCallback((newRate) => {
    setRate(newRate);
    const rateMap = {
      '-3': 0.5, '-2': 0.7, '-1': 0.85,
      '0': 1, '1': 1.2, '2': 1.5, '3': 2
    };
    if (audioRef.current) {
      audioRef.current.playbackRate = rateMap[String(newRate)] || 1;
    }
  }, []);

  // Cleanup la unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      synthRef.current.cancel();
      clearInterval(resumeTimerRef.current);
      if ('mediaSession' in navigator) {
        try { navigator.mediaSession.playbackState = 'none'; } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    synthRef.current.getVoices();
    if (typeof speechSynthesis !== 'undefined') {
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
        <div
          className="audio-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Info */}
      <div className="audio-info">
        <div className="audio-title">
          {loadingVerse ? '⏳' : '🔊'}{' '}
          {bookName} {chapter}:{currentIndex + 1}
          <span className="audio-tts-badge">
            {statusText || (ttsMode === 'voicerss' ? '🇷🇴 Română' : '🔤 Browser')}
          </span>
        </div>
        <div className="audio-verse-preview">
          {loadingVerse
            ? 'Se generează audio în română...'
            : currentVerse?.text?.substring(0, 65) + ((currentVerse?.text?.length || 0) > 65 ? '...' : '')
          }
        </div>
      </div>

      {/* Controls */}
      <div className="audio-controls">
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

        <div className="audio-main-controls">
          <button
            className="audio-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
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
              disabled={loadingVerse || ttsMode === 'loading'}
              title="Redă"
            >
              {loadingVerse ? '⏳' : '▶️'}
            </button>
          )}

          <button
            className="audio-btn"
            onClick={handleNext}
            disabled={currentIndex >= (verses?.length || 1) - 1}
            title="Versetul următor"
          >
            ⏭
          </button>
        </div>

        <div className="audio-right-controls">
          <button
            className="audio-btn-sm"
            onClick={handleStop}
            title="Oprește"
          >
            ⏹
          </button>
          <button
            className="audio-btn-sm"
            onClick={() => { handleStop(); onClose?.(); }}
            title="Închide"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="audio-counter">
        {currentIndex + 1} / {verses?.length || 0} versete
      </div>
    </div>
  );
};

export default AudioBiblePlayer;