// frontend/src/components/AudioBiblePlayer.js
import React, { useState, useEffect, useRef, useCallback } from 'react';

const AudioBiblePlayer = ({ verses, bookName, chapter, onClose, onVerseChange }) => {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [progress, setProgress] = useState(0);

  const synthRef = useRef(window.speechSynthesis);
  const resumeTimerRef = useRef(null);
  const silentAudioRef = useRef(null);

  // Silent audio pentru background play
  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      gainNode.gain.value = 0.001;
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 1;

      silentAudioRef.current = { audioCtx, oscillator, started: false };

      return () => {
        try {
          if (silentAudioRef.current?.started) oscillator.stop();
          audioCtx.close();
        } catch (e) {}
      };
    } catch (e) {}
  }, []);

  const startSilentAudio = useCallback(() => {
    try {
      const sa = silentAudioRef.current;
      if (sa && !sa.started) {
        sa.oscillator.start();
        sa.started = true;
      }
    } catch (e) {}
  }, []);

  // Media Session
  const updateMediaSession = useCallback((index) => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${bookName} ${chapter}:${index + 1}`,
      artist: 'Popas pentru Suflet',
      album: `${bookName} - Capitol ${chapter}`,
      artwork: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.playbackState = 'playing';
  }, [bookName, chapter]);

  const speakVerse = useCallback((index) => {
    if (!verses || index >= verses.length || index < 0) {
      setPlaying(false);
      setProgress(100);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      return;
    }

    synthRef.current.cancel();

    const verse = verses[index];
    const text = verse.text || '';

    if (!text.trim()) {
      speakVerse(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ro-RO';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = synthRef.current.getVoices();
    const roVoice = voices.find(v =>
      v.lang.startsWith('ro') || v.name.toLowerCase().includes('ioana')
    );
    if (roVoice) utterance.voice = roVoice;

    utterance.onstart = () => {
      setCurrentIndex(index);
      setPlaying(true);
      setProgress(Math.round((index / verses.length) * 100));
      updateMediaSession(index);
      onVerseChange?.(index);
    };

    utterance.onend = () => {
      speakVerse(index + 1);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        setTimeout(() => speakVerse(index + 1), 500);
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

  // Expose play from index
  useEffect(() => {
    window.__audioBiblePlayFrom = (index) => {
      synthRef.current.cancel();
      startSilentAudio();
      speakVerse(index);
    };

    return () => {
      delete window.__audioBiblePlayFrom;
    };
  }, [speakVerse, startSilentAudio]);

  // Media Session handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => handleResume());
    navigator.mediaSession.setActionHandler('pause', () => handlePause());
    navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
  });

  const handlePlay = useCallback(() => {
    startSilentAudio();
    speakVerse(currentIndex);
  }, [currentIndex, speakVerse, startSilentAudio]);

  const handlePause = useCallback(() => {
    synthRef.current.pause();
    setPlaying(false);
    clearInterval(resumeTimerRef.current);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  }, []);

  const handleResume = useCallback(() => {
    if (synthRef.current.paused) {
      synthRef.current.resume();
      setPlaying(true);
      resumeTimerRef.current = setInterval(() => {
        if (synthRef.current.speaking && !synthRef.current.paused) {
          synthRef.current.pause();
          synthRef.current.resume();
        }
      }, 10000);
    } else {
      handlePlay();
    }
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  }, [handlePlay]);

  const handleStop = useCallback(() => {
    synthRef.current.cancel();
    clearInterval(resumeTimerRef.current);
    setPlaying(false);
    setCurrentIndex(0);
    setProgress(0);
    onVerseChange?.(0);
  }, [onVerseChange]);

  const handleNext = useCallback(() => {
    synthRef.current.cancel();
    const next = Math.min(currentIndex + 1, verses.length - 1);
    setCurrentIndex(next);
    if (playing) speakVerse(next);
  }, [currentIndex, verses, playing, speakVerse]);

  const handlePrev = useCallback(() => {
    synthRef.current.cancel();
    const prev = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prev);
    if (playing) speakVerse(prev);
  }, [currentIndex, playing, speakVerse]);

  const handleRateChange = useCallback((newRate) => {
    setRate(newRate);
    if (playing) {
      synthRef.current.cancel();
      setTimeout(() => speakVerse(currentIndex), 100);
    }
  }, [playing, currentIndex, speakVerse]);

  useEffect(() => {
    return () => {
      synthRef.current.cancel();
      clearInterval(resumeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    synthRef.current.getVoices();
    speechSynthesis.onvoiceschanged = () => synthRef.current.getVoices();
  }, []);

  const currentVerse = verses?.[currentIndex];
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="audio-player">
      <div className="audio-progress-bar">
        <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="audio-info">
        <div className="audio-title">
          🔊 {bookName} {chapter}:{currentIndex + 1}
        </div>
        <div className="audio-verse-preview">
          {currentVerse?.text?.substring(0, 60) || '...'}
          {(currentVerse?.text?.length || 0) > 60 ? '...' : ''}
        </div>
      </div>

      <div className="audio-controls">
        <div className="audio-speed">
          <select
            value={rate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            className="audio-speed-select"
          >
            {speeds.map(s => (
              <option key={s} value={s}>{s}x</option>
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
            <button className="audio-btn audio-btn-main" onClick={handlePause} title="Pauză">
              ⏸️
            </button>
          ) : (
            <button className="audio-btn audio-btn-main" onClick={handleResume} title="Redă">
              ▶️
            </button>
          )}

          <button
            className="audio-btn"
            onClick={handleNext}
            disabled={currentIndex >= verses.length - 1}
            title="Versetul următor"
          >
            ⏭
          </button>
        </div>

        <div className="audio-right-controls">
          <button className="audio-btn-sm" onClick={handleStop} title="Oprește">
            ⏹
          </button>
          <button className="audio-btn-sm" onClick={() => { handleStop(); onClose?.(); }} title="Închide">
            ✕
          </button>
        </div>
      </div>

      <div className="audio-counter">
        {currentIndex + 1} / {verses.length} versete
      </div>
    </div>
  );
};

export default AudioBiblePlayer;