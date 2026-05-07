// frontend/src/pages/AudioBiblePage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '';
const AUDIO_BASE = 'https://www.wordproaudio.net/bibles/app/audio/34';

const CARTI = [
  { index: 1,  ab: 'Gen',   nume: 'Geneza',                    capitole: 50, test: 'VT' },
  { index: 2,  ab: 'Ex',    nume: 'Exodul',                    capitole: 40, test: 'VT' },
  { index: 3,  ab: 'Lev',   nume: 'Leviticul',                 capitole: 27, test: 'VT' },
  { index: 4,  ab: 'Num',   nume: 'Numeri',                    capitole: 36, test: 'VT' },
  { index: 5,  ab: 'Deut',  nume: 'Deuteronomul',              capitole: 34, test: 'VT' },
  { index: 6,  ab: 'Ios',   nume: 'Iosua',                     capitole: 24, test: 'VT' },
  { index: 7,  ab: 'Jud',   nume: 'Judecătorii',               capitole: 21, test: 'VT' },
  { index: 8,  ab: 'Rut',   nume: 'Rut',                       capitole: 4,  test: 'VT' },
  { index: 9,  ab: '1Sam',  nume: '1 Samuel',                  capitole: 31, test: 'VT' },
  { index: 10, ab: '2Sam',  nume: '2 Samuel',                  capitole: 24, test: 'VT' },
  { index: 11, ab: '1Împ',  nume: '1 Împărați',                capitole: 22, test: 'VT' },
  { index: 12, ab: '2Împ',  nume: '2 Împărați',                capitole: 25, test: 'VT' },
  { index: 13, ab: '1Cro',  nume: '1 Cronici',                 capitole: 29, test: 'VT' },
  { index: 14, ab: '2Cro',  nume: '2 Cronici',                 capitole: 36, test: 'VT' },
  { index: 15, ab: 'Ezra',  nume: 'Ezra',                      capitole: 10, test: 'VT' },
  { index: 16, ab: 'Neem',  nume: 'Neemia',                    capitole: 13, test: 'VT' },
  { index: 17, ab: 'Est',   nume: 'Estera',                    capitole: 10, test: 'VT' },
  { index: 18, ab: 'Iov',   nume: 'Iov',                       capitole: 42, test: 'VT' },
  { index: 19, ab: 'Ps',    nume: 'Psalmii',                   capitole: 150, test: 'VT' },
  { index: 20, ab: 'Prov',  nume: 'Proverbele',                capitole: 31, test: 'VT' },
  { index: 21, ab: 'Ecl',   nume: 'Eclesiastul',               capitole: 12, test: 'VT' },
  { index: 22, ab: 'Cânt',  nume: 'Cântarea Cântărilor',       capitole: 8,  test: 'VT' },
  { index: 23, ab: 'Is',    nume: 'Isaia',                     capitole: 66, test: 'VT' },
  { index: 24, ab: 'Ier',   nume: 'Ieremia',                   capitole: 52, test: 'VT' },
  { index: 25, ab: 'Plâng', nume: 'Plângerile',                capitole: 5,  test: 'VT' },
  { index: 26, ab: 'Ezec',  nume: 'Ezechiel',                  capitole: 48, test: 'VT' },
  { index: 27, ab: 'Dan',   nume: 'Daniel',                    capitole: 12, test: 'VT' },
  { index: 28, ab: 'Osea',  nume: 'Osea',                      capitole: 14, test: 'VT' },
  { index: 29, ab: 'Ioel',  nume: 'Ioel',                      capitole: 3,  test: 'VT' },
  { index: 30, ab: 'Amos',  nume: 'Amos',                      capitole: 9,  test: 'VT' },
  { index: 31, ab: 'Obad',  nume: 'Obadia',                    capitole: 1,  test: 'VT' },
  { index: 32, ab: 'Iona',  nume: 'Iona',                      capitole: 4,  test: 'VT' },
  { index: 33, ab: 'Mica',  nume: 'Mica',                      capitole: 7,  test: 'VT' },
  { index: 34, ab: 'Naum',  nume: 'Naum',                      capitole: 3,  test: 'VT' },
  { index: 35, ab: 'Hab',   nume: 'Habacuc',                   capitole: 3,  test: 'VT' },
  { index: 36, ab: 'Țef',   nume: 'Țefania',                   capitole: 3,  test: 'VT' },
  { index: 37, ab: 'Hag',   nume: 'Hagai',                     capitole: 2,  test: 'VT' },
  { index: 38, ab: 'Zah',   nume: 'Zaharia',                   capitole: 14, test: 'VT' },
  { index: 39, ab: 'Mal',   nume: 'Maleahi',                   capitole: 4,  test: 'VT' },
  { index: 40, ab: 'Mat',   nume: 'Matei',                     capitole: 28, test: 'NT' },
  { index: 41, ab: 'Marc',  nume: 'Marcu',                     capitole: 16, test: 'NT' },
  { index: 42, ab: 'Luca',  nume: 'Luca',                      capitole: 24, test: 'NT' },
  { index: 43, ab: 'Ioan',  nume: 'Ioan',                      capitole: 21, test: 'NT' },
  { index: 44, ab: 'Fapt',  nume: 'Faptele Apostolilor',       capitole: 28, test: 'NT' },
  { index: 45, ab: 'Rom',   nume: 'Romani',                    capitole: 16, test: 'NT' },
  { index: 46, ab: '1Cor',  nume: '1 Corinteni',               capitole: 16, test: 'NT' },
  { index: 47, ab: '2Cor',  nume: '2 Corinteni',               capitole: 13, test: 'NT' },
  { index: 48, ab: 'Gal',   nume: 'Galateni',                  capitole: 6,  test: 'NT' },
  { index: 49, ab: 'Ef',    nume: 'Efeseni',                   capitole: 6,  test: 'NT' },
  { index: 50, ab: 'Fil',   nume: 'Filipeni',                  capitole: 4,  test: 'NT' },
  { index: 51, ab: 'Col',   nume: 'Coloseni',                  capitole: 4,  test: 'NT' },
  { index: 52, ab: '1Tes',  nume: '1 Tesaloniceni',            capitole: 5,  test: 'NT' },
  { index: 53, ab: '2Tes',  nume: '2 Tesaloniceni',            capitole: 3,  test: 'NT' },
  { index: 54, ab: '1Tim',  nume: '1 Timotei',                 capitole: 6,  test: 'NT' },
  { index: 55, ab: '2Tim',  nume: '2 Timotei',                 capitole: 4,  test: 'NT' },
  { index: 56, ab: 'Tit',   nume: 'Tit',                       capitole: 3,  test: 'NT' },
  { index: 57, ab: 'Flm',   nume: 'Filimon',                   capitole: 1,  test: 'NT' },
  { index: 58, ab: 'Evr',   nume: 'Evrei',                     capitole: 13, test: 'NT' },
  { index: 59, ab: 'Iac',   nume: 'Iacov',                     capitole: 5,  test: 'NT' },
  { index: 60, ab: '1Pet',  nume: '1 Petru',                   capitole: 5,  test: 'NT' },
  { index: 61, ab: '2Pet',  nume: '2 Petru',                   capitole: 3,  test: 'NT' },
  { index: 62, ab: '1Ioan', nume: '1 Ioan',                    capitole: 5,  test: 'NT' },
  { index: 63, ab: '2Ioan', nume: '2 Ioan',                    capitole: 1,  test: 'NT' },
  { index: 64, ab: '3Ioan', nume: '3 Ioan',                    capitole: 1,  test: 'NT' },
  { index: 65, ab: 'Iuda',  nume: 'Iuda',                      capitole: 1,  test: 'NT' },
  { index: 66, ab: 'Apoc',  nume: 'Apocalipsa',                capitole: 22, test: 'NT' }
];

const http = {
  token: () => localStorage.getItem('token') || '',
  async get(path) {
    const r = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${this.token()}` }
    });
    return r.json();
  },
  async post(path, body = {}) {
    const r = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return r.json();
  }
};

const formatTimp = (sec) => {
  if (!sec || sec < 60) return `${Math.round(sec || 0)}s`;
  const ore = Math.floor(sec / 3600);
  const min = Math.floor((sec % 3600) / 60);
  if (ore > 0) return `${ore}h ${min}m`;
  return `${min} min`;
};

const AudioBiblePage = () => {
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState('carti');
  const [testamentFilter, setTestamentFilter] = useState('all');
  const [selectedCarte, setSelectedCarte] = useState(null);
  const [selectedCapitol, setSelectedCapitol] = useState(null);

  const [progressMap, setProgressMap] = useState({});
  const [stats, setStats] = useState(null);
  const [ultimul, setUltimul] = useState(null);

  // Player state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [audioError, setAudioError] = useState('');

  // Volum + boost
  const [volume, setVolume] = useState(1);
  const [boostActive, setBoostActive] = useState(false);

  // ═══════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════
  const audioRef = useRef(null);
  const lastSavedRef = useRef(0);

  // Refs pentru valori fresh în event listeners (fix stale closure)
  const selectedCarteRef = useRef(null);
  const selectedCapitolRef = useRef(null);
  const progressMapRef = useRef({});

  // AudioContext refs pentru boost volum
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const audioCtxInitedRef = useRef(false);

  // ═══════════════════════════════════════
  // SYNC REFS la fiecare schimbare de state
  // ═══════════════════════════════════════
  useEffect(() => {
    selectedCarteRef.current = selectedCarte;
  }, [selectedCarte]);

  useEffect(() => {
    selectedCapitolRef.current = selectedCapitol;
  }, [selectedCapitol]);

  useEffect(() => {
    progressMapRef.current = progressMap;
  }, [progressMap]);

  // ═══════════════════════════════════════
  // AUDIO CONTEXT — boost volum
  // ═══════════════════════════════════════
  const initAudioContext = useCallback(() => {
    if (audioCtxInitedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const gainNode = ctx.createGain();
      gainNode.gain.value = boostActive ? 2.5 : volume;

      const source = ctx.createMediaElementSource(audio);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gainNode;
      sourceNodeRef.current = source;
      audioCtxInitedRef.current = true;
    } catch (e) {
      // AudioContext nu e suportat sau audio e deja conectat
      console.warn('AudioContext init failed:', e.message);
    }
  }, [boostActive, volume]);

  // Actualizează gain când se schimbă volumul sau boostul
  useEffect(() => {
    if (!gainNodeRef.current) return;
    if (boostActive) {
      gainNodeRef.current.gain.value = 2.5;
    } else {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume, boostActive]);

  // Actualizează și volumul direct pe elementul audio (fallback)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Fără boost: volume direct pe element
    if (!audioCtxInitedRef.current) {
      audio.volume = volume;
    }
  }, [volume]);

  // ═══════════════════════════════════════
  // LOAD PROGRES
  // ═══════════════════════════════════════
  const loadProgress = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await http.get('/api/audio-bible/progress');
      if (data.success) {
        setProgressMap(data.map || {});
        setStats(data.stats);
        setUltimul(data.ultimul);
      }
    } catch (e) {}
  }, [isAuthenticated]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // ═══════════════════════════════════════
  // SALVARE PROGRES
  // ═══════════════════════════════════════
  const saveProgress = useCallback(async (carte, capitol, pozitie, durata, complet = false) => {
    if (!isAuthenticated) return;
    try {
      await http.post('/api/audio-bible/progress', {
        carteIndex: carte.index,
        carte: carte.nume,
        capitol,
        pozitieSecunde: Math.round(pozitie),
        durataSecunde: Math.round(durata),
        complet
      });

      setProgressMap(prev => ({
        ...prev,
        [carte.index]: {
          ...(prev[carte.index] || {}),
          [capitol]: {
            pozitieSecunde: Math.round(pozitie),
            durataSecunde: Math.round(durata),
            complet
          }
        }
      }));
    } catch (e) {}
  }, [isAuthenticated]);

  // ═══════════════════════════════════════
  // NAVIGARE CAPITOL / CARTE — folosesc refs
  // ═══════════════════════════════════════

  // Funcție internă de încărcare capitol (nu depinde de state, ci de parametri direcți)
  const loadCapitolDirect = useCallback((carte, capitol, currentProgressMap) => {
    const audio = audioRef.current;
    if (!audio) return;

    setLoading(true);
    setAudioError('');
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const url = `${AUDIO_BASE}/${carte.index}/${capitol}.mp3`;
    audio.src = url;
    audio.playbackRate = speed;
    audio.load();

    const map = currentProgressMap || progressMapRef.current;
    const cap = map[carte.index]?.[capitol];
    if (cap && cap.pozitieSecunde > 10 && !cap.complet) {
      // Se setează după loadedmetadata
      audio.addEventListener('loadedmetadata', function onMeta() {
        audio.currentTime = cap.pozitieSecunde;
        audio.removeEventListener('loadedmetadata', onMeta);
      }, { once: true });
    }
  }, [speed]);

  // Next capitol sau next carte — folosit din event listener (ref-based)
  const goNext = useCallback(() => {
    const carte = selectedCarteRef.current;
    const capitol = selectedCapitolRef.current;
    if (!carte || !capitol) return;

    if (capitol < carte.capitole) {
      // Next capitol în aceeași carte
      const nextCapitol = capitol + 1;
      setSelectedCapitol(nextCapitol);
      selectedCapitolRef.current = nextCapitol;
      loadCapitolDirect(carte, nextCapitol, progressMapRef.current);

      // Update Media Session
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${carte.nume} ${nextCapitol}`,
          artist: 'Popas pentru Suflet',
          album: 'Biblia Cornilescu Audio',
          artwork: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      }

      // Auto play după 1.5s
      setTimeout(() => {
        audioRef.current?.play().catch(() => {});
      }, 1500);

    } else {
      // Ultima carte s-a terminat — mergi la cartea următoare
      const nextCarteObj = CARTI.find(c => c.index === carte.index + 1);
      if (!nextCarteObj) return; // Apocalipsa s-a terminat

      setSelectedCarte(nextCarteObj);
      selectedCarteRef.current = nextCarteObj;
      setSelectedCapitol(1);
      selectedCapitolRef.current = 1;
      loadCapitolDirect(nextCarteObj, 1, progressMapRef.current);

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${nextCarteObj.nume} 1`,
          artist: 'Popas pentru Suflet',
          album: 'Biblia Cornilescu Audio',
          artwork: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      }

      setTimeout(() => {
        audioRef.current?.play().catch(() => {});
      }, 1500);
    }
  }, [loadCapitolDirect]);

  // ═══════════════════════════════════════
  // AUDIO EVENTS — montat o singură dată
  // ═══════════════════════════════════════
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setLoading(false);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);

      // Salvează la fiecare 10 secunde
      if (audio.currentTime - lastSavedRef.current >= 10) {
        lastSavedRef.current = audio.currentTime;
        const carte = selectedCarteRef.current;
        const capitol = selectedCapitolRef.current;
        if (carte && capitol) {
          saveProgress(carte, capitol, audio.currentTime, audio.duration, false);
        }
      }
    });

    audio.addEventListener('play', () => {
      setPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });

    audio.addEventListener('pause', () => {
      setPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    });

    audio.addEventListener('ended', () => {
      setPlaying(false);
      const carte = selectedCarteRef.current;
      const capitol = selectedCapitolRef.current;

      if (carte && capitol) {
        // Marchează ca complet
        saveProgress(carte, capitol, audio.duration, audio.duration, true);

        // Merge automat la next (capitol sau carte)
        setTimeout(() => {
          goNext();
        }, 1500);
      }
    });

    audio.addEventListener('waiting', () => setLoading(true));
    audio.addEventListener('canplay', () => setLoading(false));

    audio.addEventListener('error', () => {
      setLoading(false);
      setAudioError('Nu am putut încărca audio. Verifică conexiunea.');
    });

        return () => {
      audio.pause();
      audio.src = '';
    };
  // eslint-disable-next-line
  }, []);

  // Actualizează goNext în listener când se schimbă (prin ref trick)
  const goNextRef = useRef(goNext);
  useEffect(() => {
    goNextRef.current = goNext;
  }, [goNext]);

  // ═══════════════════════════════════════
  // CONTROLS UI
  // ═══════════════════════════════════════
  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    // Inițializează AudioContext la primul play (necesită user gesture)
    initAudioContext();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    audio.play().catch(e => setAudioError('Nu pot reda audio: ' + e.message));
  };

  const handlePause = () => {
    audioRef.current?.pause();
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  };

  const handleSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setBoostActive(false);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = val;
    } else if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const handleBoost = () => {
    const newBoost = !boostActive;
    setBoostActive(newBoost);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newBoost ? 2.5 : volume;
    } else {
      // Dacă AudioContext nu e inițiat, încearcă init la boost
      if (newBoost) initAudioContext();
    }
  };

  const handlePrevCapitol = () => {
    const carte = selectedCarteRef.current;
    const capitol = selectedCapitolRef.current;
    if (!carte || !capitol || capitol <= 1) return;
    const prev = capitol - 1;
    setSelectedCapitol(prev);
    selectedCapitolRef.current = prev;
    loadCapitolDirect(carte, prev, progressMapRef.current);
  };

  const handleNextCapitol = () => {
    goNext();
  };

  const handleSelectCarte = (carte) => {
    setSelectedCarte(carte);
    setStep('capitole');
  };

  const handleSelectCapitol = (capitol) => {
    setSelectedCapitol(capitol);
    setStep('player');
    loadCapitolDirect(selectedCarte, capitol, progressMapRef.current);
  };

  const handleBack = () => {
    if (step === 'player') {
      audioRef.current?.pause();
      setStep('capitole');
      setSelectedCapitol(null);
      setPlaying(false);
      loadProgress();
    } else if (step === 'capitole') {
      setStep('carti');
      setSelectedCarte(null);
    }
  };

  const handleResume = () => {
    if (!ultimul) return;
    const carte = CARTI.find(c => c.index === ultimul.carteIndex);
    if (!carte) return;
    setSelectedCarte(carte);
    setSelectedCapitol(ultimul.capitol);
    setStep('player');
    loadCapitolDirect(carte, ultimul.capitol, progressMapRef.current);
  };

  // ═══════════════════════════════════════
  // MEDIA SESSION
  // ═══════════════════════════════════════
  useEffect(() => {
    if (!('mediaSession' in navigator) || !selectedCarte || !selectedCapitol) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${selectedCarte.nume} ${selectedCapitol}`,
      artist: 'Popas pentru Suflet',
      album: 'Biblia Cornilescu Audio',
      artwork: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', handlePlay);
    navigator.mediaSession.setActionHandler('pause', handlePause);
    navigator.mediaSession.setActionHandler('previoustrack', handlePrevCapitol);
    navigator.mediaSession.setActionHandler('nexttrack', handleNextCapitol);
  }, [selectedCarte, selectedCapitol]);

  // ═══════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════
  const getCapitolStatus = (carteIndex, capitol) => {
    const cap = progressMap[carteIndex]?.[capitol];
    if (!cap) return 'neascultat';
    if (cap.complet) return 'complet';
    if (cap.pozitieSecunde > 5) return 'inProgress';
    return 'neascultat';
  };

  const getCarteProgress = (carteIndex, totalCapitole) => {
    const capMap = progressMap[carteIndex] || {};
    const complete = Object.values(capMap).filter(c => c.complet).length;
    const inProgress = Object.values(capMap).filter(c => !c.complet && c.pozitieSecunde > 5).length;
    return { complete, inProgress, total: totalCapitole, pct: Math.round((complete / totalCapitole) * 100) };
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const carti_vt = CARTI.filter(c => c.test === 'VT');
  const carti_nt = CARTI.filter(c => c.test === 'NT');

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="ab-page">

      {/* HERO */}
      <div className="ab-hero">
        <div className="ab-hero-bg" />
        <div className="ab-hero-content">
          <div className="ab-hero-icon">🎧</div>
          <h1 className="ab-hero-title">Audio Biblie</h1>
          <p className="ab-hero-sub">
            Ascultă Biblia Cornilescu completă în română. Progresul se salvează automat.
          </p>

          {stats && (
            <div className="ab-stats-row">
              <div className="ab-stat">
                <span className="ab-stat-num">{stats.capitoleComplete}</span>
                <span className="ab-stat-label">capitole complete</span>
              </div>
              <div className="ab-stat-div" />
              <div className="ab-stat">
                <span className="ab-stat-num">{stats.capitoleAscultate}</span>
                <span className="ab-stat-label">capitole începute</span>
              </div>
              <div className="ab-stat-div" />
              <div className="ab-stat">
                <span className="ab-stat-num">{formatTimp(stats.timpTotalSecunde)}</span>
                <span className="ab-stat-label">timp ascultat</span>
              </div>
            </div>
          )}

          {ultimul && (
            <button className="ab-resume-btn" onClick={handleResume}>
              ▶️ Continuă: {ultimul.carte} {ultimul.capitol}
              {!ultimul.complet && (
                <span className="ab-resume-pos">
                  · {formatTimp(ultimul.pozitieSecunde)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* STEP: CĂRȚI */}
      {step === 'carti' && (
        <div className="ab-content">
          <div className="ab-test-filter">
            {[
              { key: 'all', label: '📚 Toate' },
              { key: 'VT', label: '📜 Vechiul Testament' },
              { key: 'NT', label: '✝️ Noul Testament' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setTestamentFilter(f.key)}
                className={`ab-test-btn ${testamentFilter === f.key ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {(testamentFilter === 'all' || testamentFilter === 'VT') && (
            <div className="ab-section">
              <h3 className="ab-section-title">📜 Vechiul Testament</h3>
              <div className="ab-books-grid">
                {carti_vt.map(carte => {
                  const prog = getCarteProgress(carte.index, carte.capitole);
                  return (
                    <button
                      key={carte.index}
                      className={`ab-book-btn ${prog.complete > 0 ? 'started' : ''} ${prog.pct === 100 ? 'done' : ''}`}
                      onClick={() => handleSelectCarte(carte)}
                      title={carte.nume}
                    >
                      <span className="ab-book-ab">{carte.ab}</span>
                      {prog.complete > 0 && (
                        <span className="ab-book-pct">
                          {prog.pct === 100 ? '✓' : `${prog.pct}%`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(testamentFilter === 'all' || testamentFilter === 'NT') && (
            <div className="ab-section">
              <h3 className="ab-section-title">✝️ Noul Testament</h3>
              <div className="ab-books-grid">
                {carti_nt.map(carte => {
                  const prog = getCarteProgress(carte.index, carte.capitole);
                  return (
                    <button
                      key={carte.index}
                      className={`ab-book-btn nt ${prog.complete > 0 ? 'started' : ''} ${prog.pct === 100 ? 'done' : ''}`}
                      onClick={() => handleSelectCarte(carte)}
                      title={carte.nume}
                    >
                      <span className="ab-book-ab">{carte.ab}</span>
                      {prog.complete > 0 && (
                        <span className="ab-book-pct">
                          {prog.pct === 100 ? '✓' : `${prog.pct}%`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP: CAPITOLE */}
      {step === 'capitole' && selectedCarte && (
        <div className="ab-content">
          <button className="ab-back-btn" onClick={handleBack}>
            ← Înapoi
          </button>

          <div className="ab-carte-header">
            <h2 className="ab-carte-title">{selectedCarte.nume}</h2>
            <p className="ab-carte-meta">
              {selectedCarte.test === 'VT' ? '📜 Vechiul Testament' : '✝️ Noul Testament'}
              {' '}· {selectedCarte.capitole} capitole
            </p>

            {(() => {
              const prog = getCarteProgress(selectedCarte.index, selectedCarte.capitole);
              return prog.complete > 0 ? (
                <div className="ab-carte-progress">
                  <div className="ab-progress-bar">
                    <div className="ab-progress-fill" style={{ width: `${prog.pct}%` }} />
                  </div>
                  <span className="ab-progress-text">
                    {prog.complete}/{prog.total} capitole complete ({prog.pct}%)
                  </span>
                </div>
              ) : null;
            })()}
          </div>

          <div className="ab-chapters-grid">
            {Array.from({ length: selectedCarte.capitole }, (_, i) => i + 1).map(cap => {
              const status = getCapitolStatus(selectedCarte.index, cap);
              const capData = progressMap[selectedCarte.index]?.[cap];
              const isSelected = selectedCapitol === cap && step === 'player';

              return (
                <button
                  key={cap}
                  className={`ab-chapter-btn ab-chapter-${status} ${isSelected ? 'ab-chapter-selected' : ''}`}
                  onClick={() => handleSelectCapitol(cap)}
                  title={`${selectedCarte.ab} ${cap}${capData ? ` · ${formatTimp(capData.pozitieSecunde)}` : ''}`}
                >
                  <span className="ab-chapter-num">{cap}</span>
                  {status === 'complet' && <span className="ab-chapter-badge">✓</span>}
                  {status === 'inProgress' && (
                    <span className="ab-chapter-badge ab-chapter-badge-orange">▶</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="ab-legend">
            <span className="ab-legend-item">
              <span className="ab-legend-dot ab-dot-complet" /> Complet
            </span>
            <span className="ab-legend-item">
              <span className="ab-legend-dot ab-dot-progress" /> În progres
            </span>
            <span className="ab-legend-item">
              <span className="ab-legend-dot ab-dot-none" /> Neascultat
            </span>
          </div>
        </div>
      )}

      {/* STEP: PLAYER */}
      {step === 'player' && selectedCarte && selectedCapitol && (
        <div className="ab-content">
          <button className="ab-back-btn" onClick={handleBack}>
            ← {selectedCarte.ab}
          </button>

          {/* Player Card */}
          <div className="ab-player-card">
            <div className="ab-player-header">
              <div className="ab-player-icon">📖</div>
              <div className="ab-player-info">
                <div className="ab-player-title">
                  {selectedCarte.nume} {selectedCapitol}
                </div>
                <div className="ab-player-sub">
                  Capitol {selectedCapitol} din {selectedCarte.capitole}
                </div>
              </div>
              <div className={`ab-player-status ${playing ? 'playing' : ''}`}>
                {loading ? '⏳' : playing ? '🔊' : '⏸'}
              </div>
            </div>

            {audioError && (
              <div className="ab-player-error">{audioError}</div>
            )}

            {/* Progress Bar */}
            <div className="ab-player-progress" onClick={handleSeek}>
              <div className="ab-player-progress-fill" style={{ width: `${pct}%` }} />
              <div className="ab-player-progress-thumb" style={{ left: `${pct}%` }} />
            </div>

            <div className="ab-player-times">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
            </div>

            {/* Controls */}
            <div className="ab-player-controls">
              <button
                className="ab-ctrl-btn"
                onClick={handlePrevCapitol}
                disabled={selectedCapitol <= 1}
                title="Capitol anterior"
              >
                ⏮
              </button>

              <button
                className="ab-ctrl-btn ab-ctrl-skip"
                onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 15; }}
                title="Înapoi 15 sec"
              >
                ↺15
              </button>

              {playing ? (
                <button className="ab-ctrl-btn ab-ctrl-main" onClick={handlePause}>
                  ⏸
                </button>
              ) : (
                <button
                  className="ab-ctrl-btn ab-ctrl-main"
                  onClick={handlePlay}
                  disabled={loading}
                >
                  {loading ? '⏳' : '▶'}
                </button>
              )}

              <button
                className="ab-ctrl-btn ab-ctrl-skip"
                onClick={() => { if (audioRef.current) audioRef.current.currentTime += 15; }}
                title="Înainte 15 sec"
              >
                15↻
              </button>

              <button
                className="ab-ctrl-btn"
                onClick={handleNextCapitol}
                disabled={selectedCapitol >= selectedCarte.capitole && selectedCarte.index >= 66}
                title="Capitol următor"
              >
                ⏭
              </button>
            </div>

            {/* Speed */}
            <div className="ab-speed-row">
              {[0.75, 1, 1.25, 1.5, 2].map(s => (
                <button
                  key={s}
                  className={`ab-speed-btn ${speed === s ? 'active' : ''}`}
                  onClick={() => handleSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* ═══ VOLUM + BOOST ═══ */}
            <div className="ab-volume-row">
              <span className="ab-volume-icon">
                {volume === 0 ? '🔇' : volume < 0.4 ? '🔈' : volume < 0.8 ? '🔉' : '🔊'}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="ab-volume-slider"
                title={`Volum: ${Math.round(volume * 100)}%`}
              />
              <span className="ab-volume-pct">{Math.round(volume * 100)}%</span>
              <button
                className={`ab-boost-btn ${boostActive ? 'active' : ''}`}
                onClick={handleBoost}
                title={boostActive ? 'Boost activ (250%) — click pentru dezactivare' : 'Boost volum la 250%'}
              >
                {boostActive ? '🔥 Boost ON' : '⚡ Boost'}
              </button>
            </div>

            {boostActive && (
              <div className="ab-boost-warning">
                ⚠️ Boost activ — volum amplificat. Folosește cu grijă căștile.
              </div>
            )}
          </div>

          {/* Status capitol */}
          {(() => {
            const status = getCapitolStatus(selectedCarte.index, selectedCapitol);
            const capData = progressMap[selectedCarte.index]?.[selectedCapitol];
            return (
              <div className={`ab-status-badge ab-status-${status}`}>
                {status === 'complet' && '✅ Capitol complet ascultat'}
                {status === 'inProgress' && `▶️ Reluare de la ${formatTimp(capData?.pozitieSecunde || 0)}`}
                {status === 'neascultat' && '🎧 Nou'}
              </div>
            );
          })()}

          {/* Nav capitole */}
          <div className="ab-nav-caps">
            <button
              className="ab-nav-btn"
              onClick={handlePrevCapitol}
              disabled={selectedCapitol <= 1}
            >
              ← Cap. {selectedCapitol - 1}
            </button>
            <span className="ab-nav-current">
              {selectedCarte.ab} {selectedCapitol}
            </span>
            <button
              className="ab-nav-btn"
              onClick={handleNextCapitol}
              disabled={selectedCapitol >= selectedCarte.capitole && selectedCarte.index >= 66}
            >
              Cap. {selectedCapitol + 1} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioBiblePage;