'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import ReelGenerator from '../components/ReelGenerator';


const API = process.env.NEXT_PUBLIC_API_URL || '';


import { DEFAULT_TEMPLATES } from '../data/templates';

const CATEGORII = [
  { id: 'all', label: '📋 Toate' },
  { id: 'apus', label: '🌅 Apusuri' },
  { id: 'rasarit', label: '🌄 Răsărituri' },
  { id: 'cer', label: '☁️ Cer' },
  { id: 'nori', label: '🌤️ Nori' },
  { id: 'stele', label: '⭐ Stele' },
  { id: 'luna', label: '🌙 Lună' },
  { id: 'munte', label: '🏔️ Munți' },
  { id: 'padure', label: '🌲 Păduri' },
  { id: 'mare', label: '🌊 Mare' },
  { id: 'lac', label: '💧 Lac' },
  { id: 'cascada', label: '🏞️ Cascade' },
  { id: 'rau', label: '🏞️ Râuri' },
  { id: 'flori', label: '🌸 Flori' },
  { id: 'natura', label: '🌿 Natură' },
  { id: 'dimineata', label: '🌅 Dimineață' },
  { id: 'ceata', label: '🌫️ Ceață' },
  { id: 'lumina', label: '☀️ Lumină' },
  { id: 'spiritual', label: '✝️ Spiritual' },
  { id: 'biserica', label: '⛪ Biserică' },
  { id: 'minimalist', label: '🖤 Minimalist' },
  { id: 'iarna', label: '❄️ Iarnă' },
  { id: 'toamna', label: '🍂 Toamnă' },
  { id: 'primavara', label: '🌱 Primăvară' },
  { id: 'vara', label: '☀️ Vară' },
  { id: 'custom', label: '📁 Ale mele' },
];

const FONTURI = [
  { group: 'Elegante', opts: ['Playfair Display', 'Cinzel', 'Cormorant Garamond', 'EB Garamond', 'Libre Baskerville'] },
  { group: 'Romantice', opts: ['Great Vibes', 'Dancing Script'] },
  { group: 'Clasice', opts: ['Lora', 'Merriweather', 'Georgia', 'Times New Roman'] },
  { group: 'Moderne', opts: ['Inter', 'Arial'] },
];

const GeneratePage = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState({ builtIn: DEFAULT_TEMPLATES, uploadate: [] });
  const [templateSelectat, setTemplateSelectat] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tema, setTema] = useState('dragoste');
  const [platform, setPlatform] = useState('facebook');
  const [versetSelectat, setVersetSelectat] = useState(null);
  const [versetEditat, setVersetEditat] = useState('');
  const [referintaEditata, setReferintaEditata] = useState('');
  const [versetSearch, setVersetSearch] = useState('');
  const [verseteGasite, setVerseteGasite] = useState([]);
  const [searching, setSearching] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [variantaActiva, setVariantaActiva] = useState(0);
  const [teme, setTeme] = useState([]);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduleResult, setScheduleResult] = useState(null);
  const [categorieFiltre, setCategorieFiltre] = useState('all');
  const [paginaCurenta, setPaginaCurenta] = useState(1);
const TEMPLATES_PER_PAGINA = 24;
  const [generatedImageBase64, setGeneratedImageBase64] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [stilText, setStilText] = useState({
    fontSize: 26, culoare: '#FFFFFF', pozitie: 'center',
    umbra: true, font: 'Playfair Display'
  });
  const [limitStatus, setLimitStatus] = useState(null);
  const [limitLoading, setLimitLoading] = useState(true);
  const [renderKey, setRenderKey] = useState(0);
  const [aiResult, setAiResult] = useState(null);
const [generatingAI, setGeneratingAI] = useState(false);
const [aiTab, setAiTab] = useState('normal');
const [aiVarianta, setAiVarianta] = useState(0);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const loadedImgRef = useRef(null);
  const loadedLogoRef = useRef(null);

  // ═══ PRELOAD LOGO ═══
  useEffect(() => {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/logo.png';
    logo.onload = () => { loadedLogoRef.current = logo; };
    logo.onerror = () => { loadedLogoRef.current = null; };
  }, []);

  // ═══ EFFECTS ═══
  useEffect(() => {
    fetchTemplates();
    fetchTeme();
    fetchLimitStatus();
  }, []);

  // ═══ CANVAS RENDER ═══
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateSelectat) return;

    const textDePus = versetEditat || versetSelectat?.text;
    const refDePus = referintaEditata || versetSelectat?.referintaCompleta || versetSelectat?.referinta;

    if (!textDePus) return;

    const drawOnCanvas = (img) => {
      const ctx = canvas.getContext('2d');
      const W = 1080;
      const H = 1350;
      canvas.width = W;
      canvas.height = H;

      // Cover crop
      const imgR = img.width / img.height;
      const canR = W / H;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgR > canR) { sw = img.height * canR; sx = (img.width - sw) / 2; }
      else { sh = img.width / canR; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

      // Gradient overlay
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(0,0,0,0.05)');
      grad.addColorStop(0.25, 'rgba(0,0,0,0.2)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
      grad.addColorStop(0.75, 'rgba(0,0,0,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const sc = 1;
      const fz = Math.round(stilText.fontSize * 2 * sc);

      // ═══ WATERMARK REPETAT PE FUNDAL (greu de decupat) ═══
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.font = `700 ${Math.round(28 * sc)}px Inter, Arial, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      for (let y = 60; y < H; y += 120) {
        for (let x = 80; x < W; x += 380) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-0.35);
          ctx.fillText('popaspentrusuflet.ro', 0, 0);
          ctx.restore();
        }
      }
      ctx.restore();

      // ═══ TEXT VERSET ═══
      ctx.font = `italic ${fz}px '${stilText.font}', Georgia, serif`;
      ctx.fillStyle = stilText.culoare;
      ctx.textAlign = 'center';

      if (stilText.umbra) {
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 25 * sc;
        ctx.shadowOffsetX = 2 * sc;
        ctx.shadowOffsetY = 3 * sc;
      }

      // Word wrap
      const maxW = W * 0.82;
      const lh = fz * 1.5;
      const raw = `\u201C${textDePus}\u201D`;
      const words = raw.split(' ');
      const lines = [];
      let cur = '';
      words.forEach(w => {
        const t = cur + w + ' ';
        if (ctx.measureText(t).width > maxW && cur) {
          lines.push(cur.trim());
          cur = w + ' ';
        } else { cur = t; }
      });
      lines.push(cur.trim());

      const maxLines = 8;
      const dl = lines.slice(0, maxLines);
      if (lines.length > maxLines) dl[maxLines - 1] += '...';
      const th = dl.length * lh;

      let startY;
      if (stilText.pozitie === 'top') startY = H * 0.12;
      else if (stilText.pozitie === 'bottom') startY = H - th - H * 0.28;
      else startY = (H - th) / 2 - 40;

      // Linie decorativă sus
      ctx.strokeStyle = 'rgba(212,175,55,0.6)';
      ctx.lineWidth = 2 * sc;
      const lineW = 70 * sc;
      ctx.beginPath();
      ctx.moveTo(W / 2 - lineW, startY - 35 * sc);
      ctx.lineTo(W / 2 + lineW, startY - 35 * sc);
      ctx.stroke();

      // Desenează liniile de text
      dl.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lh));

      // Linie decorativă jos
      ctx.beginPath();
      ctx.moveTo(W / 2 - lineW, startY + th + 15 * sc);
      ctx.lineTo(W / 2 + lineW, startY + th + 15 * sc);
      ctx.stroke();

      // Referința
      ctx.shadowBlur = 12 * sc;
      ctx.font = `bold ${Math.round(fz * 0.48)}px '${stilText.font}', Georgia, serif`;
      ctx.fillStyle = '#D4AF37';
      ctx.fillText(`\u2014 ${refDePus}`, W / 2, startY + th + 55 * sc);

      // ═══ WATERMARK LOGO + TEXT - INTEGRAT ═══
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      const logo = loadedLogoRef.current;
      const wmY = H - 140 * sc;

      if (logo) {
        const logoH = 75 * sc;
        const logoW = logoH;
        const logoX = W / 2 - logoW / 2;
        const logoY = wmY;

        // Glow subtil în spatele logo-ului
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 30, 0, Math.PI * 2);
        const glowGrad = ctx.createRadialGradient(
          W / 2, logoY + logoH / 2, logoH / 2,
          W / 2, logoY + logoH / 2, logoH / 2 + 30
        );
        glowGrad.addColorStop(0, 'rgba(212,175,55,0.4)');
        glowGrad.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.fillStyle = glowGrad;
        ctx.fill();
        ctx.restore();

        // Cerc exterior
        ctx.beginPath();
        ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 5 * sc, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 5 * sc, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212,175,55,0.5)';
        ctx.lineWidth = 1.5 * sc;
        ctx.stroke();

        // Logo circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, logoY + logoH / 2, logoH / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, logoX, logoY, logoW, logoH);
        ctx.restore();

        // Text sub logo - semi-transparent, integrat
        ctx.globalAlpha = 0.75;
        const wmFz = Math.round(24 * sc);
        ctx.font = `600 ${wmFz}px Inter, Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('Popas pentru Suflet', W / 2, logoY + logoH + 30 * sc);

        // Linie subțire decorativă sub text
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 90, logoY + logoH + 42 * sc);
        ctx.lineTo(W / 2 + 90, logoY + logoH + 42 * sc);
        ctx.stroke();

        ctx.globalAlpha = 1.0;
      } else {
        // Fallback fără logo
        ctx.globalAlpha = 0.6;
        const wmFz = Math.round(28 * sc);
        ctx.font = `700 ${wmFz}px Inter, Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('🕊️ Popas pentru Suflet', W / 2, H - 50 * sc);
        ctx.globalAlpha = 1.0;
      }

      // ═══ WATERMARK COLȚURI (anti-decupare) ═══
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.font = `600 ${Math.round(16 * sc)}px Inter, Arial, sans-serif`;
      ctx.fillStyle = '#FFFFFF';

      // Colț stânga-sus
      ctx.textAlign = 'left';
      ctx.fillText('popaspentrusuflet.ro', 15, 25);

      // Colț dreapta-sus
      ctx.textAlign = 'right';
      ctx.fillText('popaspentrusuflet.ro', W - 15, 25);

      // Colț stânga-jos
      ctx.textAlign = 'left';
      ctx.fillText('popaspentrusuflet.ro', 15, H - 12);

      // Colț dreapta-jos
      ctx.textAlign = 'right';
      ctx.fillText('popaspentrusuflet.ro', W - 15, H - 12);

      ctx.restore();

      // Salvare
      saveCanvasImage();
    };

    // Dacă imaginea e deja încărcată
    if (loadedImgRef.current && loadedImgRef.current._src === (templateSelectat.url || templateSelectat.thumbnail)) {
      drawOnCanvas(loadedImgRef.current);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    const src = templateSelectat.url || templateSelectat.thumbnail;
    img._src = src;
    img.src = src;

    img.onload = () => {
      loadedImgRef.current = img;
      drawOnCanvas(img);
    };

    img.onerror = () => console.error('Eroare încărcare imagine template');
  }, [templateSelectat, versetEditat, versetSelectat, referintaEditata, stilText]);

  // Trigger renderCanvas când se schimbă parametrii
  useEffect(() => {
    const textExists = versetEditat || versetSelectat?.text;
    if (templateSelectat && textExists && (step === 2 || step === 3)) {
      const timeout = setTimeout(() => renderCanvas(), 100);
      return () => clearTimeout(timeout);
    }
  }, [templateSelectat, versetEditat, versetSelectat, referintaEditata, stilText, step, renderKey, renderCanvas]);

  // Când se selectează un verset, populează editarea
  useEffect(() => {
    if (versetSelectat) {
      setVersetEditat(versetSelectat.text);
      setReferintaEditata(versetSelectat.referintaCompleta || versetSelectat.referinta || '');
    }
  }, [versetSelectat]);

  // ═══ FETCH LIMIT STATUS ═══
  const fetchLimitStatus = async () => {
    try {
      setLimitLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const r = await axios.get(`${API}/api/generate/limit-status`, { headers });
      setLimitStatus(r.data);
    } catch (e) {
      console.error('Eroare la limit-status:', e);
    } finally {
      setLimitLoading(false);
    }
  };

  // ═══ FETCH ═══
  const fetchTemplates = async () => {
    try {
      const r = await axios.get(`${API}/api/generate/templates`);
      const builtIn = r.data?.builtIn?.length > 0 ? r.data.builtIn : DEFAULT_TEMPLATES;
      setTemplates({ builtIn, uploadate: r.data?.uploadate || [] });
    } catch (e) {
      setTemplates({ builtIn: DEFAULT_TEMPLATES, uploadate: [] });
    }
  };

  const fetchTeme = async () => {
    try {
      const r = await axios.get(`${API}/api/generate/teme`);
      setTeme(r.data.teme || []);
    } catch (e) {}
  };

  const searchVerset = async () => {
    if (!versetSearch.trim()) return;
    setSearching(true);
    try {
      const r = await axios.get(
        `${API}/api/verses?search=${encodeURIComponent(versetSearch)}&limit=50`
      );
      setVerseteGasite(r.data.versete || []);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setSearching(false);
    }
  };

  // ═══ UPLOAD ═══
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('template', file);
    try {
      const r = await axios.post(`${API}/api/generate/upload`, formData,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      if (r.data.success) {
        await fetchTemplates();
        setTemplateSelectat(r.data.file);
        setStep(2);
      }
    } catch (e) {
      alert('Eroare upload!');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (filename) => {
    if (!window.confirm('Ștergi?')) return;
    try {
      await axios.delete(`${API}/api/generate/templates/${filename}`);
      await fetchTemplates();
      if (templateSelectat?.id === filename) setTemplateSelectat(null);
    } catch (e) {}
  };

  // ═══ GENERATE ═══
  const handleGenerate = async () => {
    if (!isAdmin && limitStatus && limitStatus.remaining <= 0) {
      if (limitStatus.type === 'guest') {
        const ok = window.confirm(
          'Ai atins limita de 3 generări/zi pentru vizitatori.\n\nCreează un cont gratuit pentru 5 generări/oră!'
        );
        if (ok) router.push('/register');
      } else {
        alert('Ai atins limita de 5 generări/oră. Încearcă din nou mai târziu.');
      }
      return;
    }

    setGenerating(true);
    setGenerated(null);
    setVariantaActiva(0);
    setPublishResult(null);
    setScheduleResult(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const r = await axios.post(
        `${API}/api/generate`,
        {
          tema,
          platform,
          versetCustom: versetSelectat || null
        },
        { headers }
      );

      if (r.data.success) {
        setGenerated(r.data);
        setVariantaActiva(0);

        // Dacă nu era verset selectat, setează cel generat
        if (!versetSelectat && r.data.verset) {
          setVersetSelectat(r.data.verset);
          setVersetEditat(r.data.verset.text);
          setReferintaEditata(r.data.verset.referintaCompleta || r.data.verset.referinta || '');
        }

        if (r.data.limitInfo) {
          setLimitStatus(prev => ({
            ...prev,
            used: r.data.limitInfo.used,
            remaining: r.data.limitInfo.remaining
          }));
        } else {
          await fetchLimitStatus();
        }

        // Force re-render canvas
        setRenderKey(k => k + 1);
        setStep(3);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const msg = error.response?.data?.message || 'Limită atinsă.';
        const needAccount = error.response?.data?.needAccount;
        if (needAccount) {
          const ok = window.confirm(msg + '\n\nVrei să creezi un cont gratuit?');
          if (ok) router.push('/register');
        } else {
          alert(msg);
        }
        await fetchLimitStatus();
      } else {
        alert('Eroare la generare: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setGenerating(false);
    }
  };



const handleGenerateAI = async () => {
  if (!isAdmin && limitStatus && limitStatus.remaining <= 0) {
    if (limitStatus.type === 'guest') {
      const ok = window.confirm('Ai atins limita. Creează un cont gratuit!');
      if (ok) router.push('/register');
    } else {
      alert('Ai atins limita de generări/oră.');
    }
    return;
  }

  setGeneratingAI(true);
  setAiResult(null);
  setPublishResult(null);
  setScheduleResult(null);

  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const r = await axios.post(
      `${API}/api/generate/ai`,
      {
        tema,
        platform,
        versetCustom: versetSelectat || null
      },
      { headers }
    );

    if (r.data.success) {
  setAiResult(r.data.ai);
  setAiVarianta(0);

  // Setează versetul
  if (!versetSelectat && r.data.verset) {
    setVersetSelectat(r.data.verset);
    setVersetEditat(r.data.verset.text);
    setReferintaEditata(r.data.verset.referintaCompleta || r.data.verset.referinta || '');
  }

  // Construiește variante COMPLETE cu hook + descriere + cta
  const ai = r.data.ai;
  const hook = ai.hook ? `${ai.hook}\n\n` : '';
  const cta = ai.cta ? `\n\n${ai.cta}` : '';

  const varianteComplete = [
    ai.descriere ? (hook + ai.descriere + cta) : null,
    ai.variantaCalda ? (hook + ai.variantaCalda + cta) : null,
    ai.variantaPuternica ? (hook + ai.variantaPuternica + cta) : null
  ].filter(Boolean);

  setGenerated({
    ...r.data,
    descriere: varianteComplete[0] || ai.descriere || '',
    variante: varianteComplete,
    hashtags: ai.hashtags || r.data.hashtags || ''
  });

  if (r.data.limitInfo) {
    setLimitStatus(prev => ({
      ...prev,
      used: r.data.limitInfo.used,
      remaining: r.data.limitInfo.remaining
    }));
  }

  setRenderKey(k => k + 1);
  setStep(3);
  setAiTab('ai');
}
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    alert('Eroare AI: ' + msg);
  } finally {
    setGeneratingAI(false);
  }
};




  // ═══ SAVE ═══
  const handleSave = async () => {
    if (!generated) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${API}/api/posts`,
        {
          content: generated.variante?.[variantaActiva] || generated.descriere,
          hashtags: generated.hashtags,
          platform, tema,
          verset: {
            text: versetEditat || generated.verset?.text,
            referinta: referintaEditata || generated.verset?.referinta,
            referintaCompleta: referintaEditata || generated.verset?.referintaCompleta
          },
          status: 'draft'
        },
        { headers }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Eroare salvare!');
    }
  };

  // ═══ PUBLISH (admin only) ═══
  const handlePublish = async () => {
    if (!isAdmin) {
      alert('Publicarea pe Facebook este disponibilă doar pentru administratori.');
      return;
    }
    if (!generated) return;
    if (!window.confirm('Publici pe Facebook?')) return;

    setPublishing(true);
    setPublishResult(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const descriere = generated.variante?.[variantaActiva] || generated.descriere;

      const r = await axios.post(
        `${API}/api/social/publish-direct`,
        {
          content: descriere,
          hashtags: generated.hashtags,
          imageBase64: generatedImageBase64 || null,
          imageUrl: generatedImageBase64 ? null : (templateSelectat?.url || null),
          platform: 'facebook'
        },
        { headers }
      );

      if (r.data.success) {
        setPublishResult({ success: true, message: '✅ Publicat pe Facebook!' });
      }
    } catch (e) {
      setPublishResult({
        success: false,
        message: '❌ ' + (e.response?.data?.error || e.message)
      });
    } finally {
      setPublishing(false);
    }
  };

  // ═══ SCHEDULE (admin only) ═══
  const handleSchedule = async () => {
    if (!isAdmin) {
      alert('Programarea pe Facebook este disponibilă doar pentru administratori.');
      return;
    }
    if (!generated) { alert('Generează mai întâi!'); return; }
    if (!scheduledAt) { alert('Alege data și ora!'); return; }

    setScheduling(true);
    setScheduleResult(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const descriere = generated.variante?.[variantaActiva] || generated.descriere;

      const r = await axios.post(
        `${API}/api/social/schedule`,
        {
          content: descriere,
          hashtags: generated.hashtags,
          imageBase64: generatedImageBase64 || null,
          imageUrl: (!generatedImageBase64 && templateSelectat?.url) ? templateSelectat.url : null,
          platform: 'facebook',
          scheduledDate: new Date(scheduledAt).toISOString(),
          tema,
          verset: {
            text: versetEditat || generated.verset?.text,
            referinta: referintaEditata || generated.verset?.referinta,
            referintaCompleta: referintaEditata || generated.verset?.referintaCompleta
          }
        },
        { headers }
      );

      if (r.data.success) {
        setScheduleResult({ success: true, message: r.data.message });
      }
    } catch (e) {
      setScheduleResult({
        success: false,
        message: '❌ ' + (e.response?.data?.error || e.message)
      });
    } finally {
      setScheduling(false);
    }
  };

  const saveCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const base64 = canvas.toDataURL('image/jpeg', 0.92);
      setGeneratedImageBase64(base64);
      setPreviewUrl(base64);
    } catch (e) {
      console.error('Canvas save error:', e);
      setGeneratedImageBase64(null);
      setPreviewUrl(templateSelectat?.thumbnail || null);
    }
  };

  const downloadImage = () => {
    if (generatedImageBase64) {
      const link = document.createElement('a');
      link.download = `popas-suflet-${Date.now()}.jpg`;
      link.href = generatedImageBase64;
      link.click();
    } else {
      alert('Nu există imagine de descărcat!');
    }
  };

  // Forțează re-render canvas
  const forceRender = () => {
    setRenderKey(k => k + 1);
  };

  // ═══ COMPUTED ═══
  const allTemplates = [
    ...(templates.builtIn || []),
    ...(templates.uploadate || [])
  ].filter(t => {
    if (categorieFiltre === 'all') return true;
    if (categorieFiltre === 'custom') return t.custom;
    return t.categorie === categorieFiltre;
  });
  
  
  const totalTemplates = allTemplates.length;
const totalPagini = Math.max(1, Math.ceil(totalTemplates / TEMPLATES_PER_PAGINA));
const startIdx = (paginaCurenta - 1) * TEMPLATES_PER_PAGINA;
const templatesPagina = allTemplates.slice(startIdx, startIdx + TEMPLATES_PER_PAGINA);

  // ═══ BANNER LIMITĂ ═══
  const LimitBanner = () => {
    if (limitLoading || !limitStatus) return null;
    const isBlocked = !isAdmin && limitStatus.remaining <= 0;

    return (
      <div style={{
        marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '12px',
        border: `1px solid ${limitStatus.type === 'admin' ? 'rgba(34,197,94,0.3)' : isBlocked ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'}`,
        background: limitStatus.type === 'admin' ? 'rgba(34,197,94,0.07)' : isBlocked ? 'rgba(239,68,68,0.07)' : 'rgba(99,102,241,0.07)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
      }}>
        {limitStatus.type === 'admin' ? (
          <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
            ♾️ <strong>Administrator:</strong> generări nelimitate
          </span>
        ) : (
          <>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {limitStatus.type === 'guest' ? '👤 Vizitator' : '🔑 Cont'}{' '}
              — folosite: <strong>{limitStatus.used}</strong> / {limitStatus.limit}
              {' '}• rămase:{' '}
              <strong style={{ color: isBlocked ? '#ef4444' : 'var(--text-primary)' }}>
                {limitStatus.remaining}
              </strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {limitStatus.type === 'guest' ? ' (reset la miezul nopții)' : ' (reset la fiecare oră)'}
              </span>
            </div>
            {!isAuthenticated && (
              <button onClick={() => router.push('/register')} style={{
                padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap'
              }}>✅ Creează cont gratuit</button>
            )}
          </>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="animate-in">
      <LimitBanner />

      {/* ═══ STEPS BAR ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', marginBottom: '1.5rem',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        padding: '0.5rem', border: '1px solid var(--border-subtle)', overflowX: 'auto'
      }}>
        {[
          { nr: 1, label: 'Imaginea', icon: '🖼️' },
          { nr: 2, label: 'Versetul', icon: '📖' },
          { nr: 3, label: 'Publică', icon: '✨' }
        ].map((s, idx) => (
          <React.Fragment key={s.nr}>
            <div onClick={() => step > s.nr && setStep(s.nr)} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-lg)',
              background: step === s.nr ? 'linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05))' : 'transparent',
              border: step === s.nr ? '1px solid var(--border-color)' : '1px solid transparent',
              cursor: step > s.nr ? 'pointer' : 'default', transition: 'var(--transition)', minWidth: 'fit-content'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: step > s.nr ? 'var(--accent-green)' : step === s.nr ? 'var(--gold-primary)' : 'var(--bg-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: step >= s.nr ? '#000' : 'var(--text-muted)'
              }}>
                {step > s.nr ? '✓' : s.nr}
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Pasul {s.nr}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: step === s.nr ? 'var(--gold-primary)' : 'var(--text-secondary)' }}>
                  {s.icon} {s.label}
                </div>
              </div>
            </div>
            {idx < 2 && <div style={{ width: 20, height: 2, flexShrink: 0, background: step > s.nr ? 'var(--accent-green)' : 'var(--border-subtle)' }} />}
          </React.Fragment>
        ))}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ═══ STEP 1 ═══ */}
{step === 1 && (
  <div className="card card-gold animate-in">
    <div className="card-header">
      <div className="card-title">
        <span className="icon">🖼️</span> Alege Imaginea
      </div>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={e => handleUpload(e.target.files[0])}
        />
        <button
          className="btn btn-gold btn-sm"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          {uploading ? '⏳...' : '⬆️ Upload'}
        </button>
      </div>
    </div>

    {/* Categorii */}
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.35rem',
      marginBottom: '1.25rem'
    }}>
      {CATEGORII.map(c => (
        <button
          key={c.id}
          onClick={() => {
            setCategorieFiltre(c.id);
            setPaginaCurenta(1);
          }}
          style={{
            padding: '0.3rem 0.7rem',
            borderRadius: 20,
            border: `1px solid ${categorieFiltre === c.id ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
            background: categorieFiltre === c.id ? 'rgba(212,175,55,0.1)' : 'var(--bg-input)',
            color: categorieFiltre === c.id ? 'var(--gold-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 500
          }}
        >
          {c.label}
        </button>
      ))}
    </div>

    <div style={{
      fontSize: '0.78rem',
      color: 'var(--text-muted)',
      marginBottom: '1rem'
    }}>
      📐 Imagine verticală <strong>1080×1350</strong> — ideal pentru Facebook, Instagram, TikTok
    </div>

    {/* Info paginare */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {totalTemplates} template-uri • Pagina {paginaCurenta}/{totalPagini}
      </span>

      <div style={{ display: 'flex', gap: '0.35rem' }}>
        <button
          onClick={() => setPaginaCurenta(p => Math.max(1, p - 1))}
          disabled={paginaCurenta <= 1}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-input)',
            color: 'var(--text-secondary)',
            cursor: paginaCurenta <= 1 ? 'default' : 'pointer',
            opacity: paginaCurenta <= 1 ? 0.4 : 1,
            fontSize: '0.8rem'
          }}
        >
          ← Anterior
        </button>

        <button
          onClick={() => setPaginaCurenta(p => Math.min(totalPagini, p + 1))}
          disabled={paginaCurenta >= totalPagini}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-input)',
            color: 'var(--text-secondary)',
            cursor: paginaCurenta >= totalPagini ? 'default' : 'pointer',
            opacity: paginaCurenta >= totalPagini ? 0.4 : 1,
            fontSize: '0.8rem'
          }}
        >
          Următor →
        </button>
      </div>
    </div>

    {/* Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '0.75rem'
    }}>
      {/* Upload card */}
      <div
        onClick={() => fileInputRef.current.click()}
        style={{
          aspectRatio: '4/5',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: 'var(--bg-input)',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ fontSize: '2rem' }}>⬆️</div>
        <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>Upload</div>
      </div>

      {/* Template-uri pagină curentă */}
      {templatesPagina.map(t => (
        <div
          key={t.id}
          onClick={() => {
            setTemplateSelectat(t);
            setPreviewUrl(null);
            loadedImgRef.current = null;
            setStep(2);
          }}
          style={{
            position: 'relative',
            aspectRatio: '4/5',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            cursor: 'pointer',
            border: templateSelectat?.id === t.id
              ? '3px solid var(--gold-primary)'
              : '2px solid var(--border-subtle)',
            boxShadow: templateSelectat?.id === t.id
              ? 'var(--shadow-gold)'
              : 'none'
          }}
        >
          <img
            src={t.thumbnail}
            alt={t.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={e => {
              e.target.style.display = 'none';
            }}
          />

          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent 50%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'white'
            }}>
              {t.name}
            </div>
          </div>

          {templateSelectat?.id === t.id && (
            <div style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              background: 'var(--gold-primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#000'
            }}>
              ✓
            </div>
          )}

          {t.custom && (
            <button
              onClick={e => {
                e.stopPropagation();
                handleDeleteTemplate(t.id);
              }}
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                width: 22,
                height: 22,
                background: 'rgba(239,68,68,0.9)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>

    {/* Paginare jos */}
    {totalPagini > 1 && (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.3rem',
        marginTop: '1rem',
        flexWrap: 'wrap'
      }}>
        {Array.from({ length: totalPagini }, (_, i) => i + 1).map(pg => (
          <button
            key={pg}
            onClick={() => setPaginaCurenta(pg)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: pg === paginaCurenta
                ? '1px solid var(--gold-primary)'
                : '1px solid var(--border-color)',
              background: pg === paginaCurenta
                ? 'rgba(212,175,55,0.15)'
                : 'var(--bg-input)',
              color: pg === paginaCurenta
                ? 'var(--gold-primary)'
                : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: pg === paginaCurenta ? 700 : 400
            }}
          >
            {pg}
          </button>
        ))}
      </div>
    )}
  </div>
)}

      {/* ═══ STEP 2 ═══ */}
      {step === 2 && (
        <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card card-gold">
              <div className="card-header">
                <div className="card-title"><span className="icon">📖</span> Alege Versetul</div>
              </div>

              <div className="form-label" style={{ marginBottom: '0.5rem' }}>🎯 Tema:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                {teme.map(t => (
                  <button key={t.id} onClick={() => setTema(t.id)} style={{
                    padding: '0.45rem', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${tema === t.id ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                    background: tema === t.id ? 'rgba(212,175,55,0.1)' : 'var(--bg-input)',
                    color: tema === t.id ? 'var(--gold-primary)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.73rem', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', gap: 2
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">🔍 Caută verset:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="form-input" placeholder="Ioan 3:16, dragoste, pace..."
                    value={versetSearch} onChange={e => setVersetSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchVerset()} />
                  <button className="btn btn-gold" onClick={searchVerset} disabled={searching}>
                    {searching ? '⏳' : '🔍'}
                  </button>
                </div>
              </div>

              {verseteGasite.length > 0 && (
                <div style={{ maxHeight: 250, overflowY: 'auto', marginTop: '0.5rem' }}>
                  {verseteGasite.map((v, i) => (
                    <div key={i} onClick={() => {
                      const vs = {
                        text: v.text, referinta: v.referinta,
                        referintaCompleta: `${v.carte} ${v.capitol}:${v.verset}`
                      };
                      setVersetSelectat(vs);
                      setVerseteGasite([]);
                      setVersetSearch('');
                    }} style={{
                      padding: '0.65rem', marginBottom: '0.35rem', background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', cursor: 'pointer'
                    }}>
                      <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.5 }}>
                        "{v.text.substring(0, 85)}{v.text.length > 85 ? '...' : ''}"
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                        {v.carte} {v.capitol}:{v.verset}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {versetSelectat ? (
                <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'rgba(212,175,55,0.06)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--gold-primary)', textTransform: 'uppercase',
                    letterSpacing: 2, fontWeight: 700, marginBottom: '0.4rem' }}>✅ Selectat — editează mai jos</div>

                  {/* EDITARE TEXT VERSET */}
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>✏️ Text verset:</label>
                    <textarea
                      className="form-input"
                      value={versetEditat}
                      onChange={e => setVersetEditat(e.target.value)}
                      rows={3}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: 'italic',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* EDITARE REFERINȚĂ */}
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>📌 Referință:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={referintaEditata}
                      onChange={e => setReferintaEditata(e.target.value)}
                      style={{ fontWeight: 700, color: 'var(--gold-primary)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setVersetSelectat(null);
                        setVersetEditat('');
                        setReferintaEditata('');
                        setPreviewUrl(null);
                        setGeneratedImageBase64(null);
                      }}>
                      ✕ Schimbă
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={forceRender}>
                      🔄 Reîncarcă preview
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0.6rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  💡 Lasă gol = verset aleatoriu pe baza temei
                </div>
              )}
            </div>

            <div className="card">
  <div className="card-header">
    <div className="card-title"><span className="icon">📱</span> Platformă</div>
  </div>
  <div className="tabs" style={{ marginBottom: '1rem' }}>
    {[
      { id: 'facebook', l: '📘 Facebook' },
      { id: 'instagram', l: '📸 Instagram' },
      { id: 'tiktok', l: '🎵 TikTok' }
    ].map(p => (
      <button key={p.id} className={`tab ${platform === p.id ? 'active' : ''}`}
        onClick={() => setPlatform(p.id)}>{p.l}</button>
    ))}
  </div>

  {/* Buton AI */}
  <button
    className="btn btn-lg btn-block"
    onClick={handleGenerateAI}
    disabled={generatingAI || generating || (!isAdmin && limitStatus && limitStatus.remaining <= 0)}
    style={{
      background: generatingAI
        ? 'rgba(99,102,241,0.5)'
        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      border: 'none', borderRadius: '14px',
      color: 'white', fontWeight: 700,
      marginBottom: '0.65rem',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '0.5rem'
    }}
  >
    {generatingAI ? (
      <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Gemini AI generează...</>
    ) : (
      <>🤖 Generează cu AI <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>(Gemini)</span></>
    )}
  </button>

  {/* Separator */}
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    marginBottom: '0.65rem'
  }}>
    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>sau</span>
    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
  </div>

  {/* Buton normal */}
  <button
    className="btn btn-gold btn-lg btn-block"
    onClick={handleGenerate}
    disabled={generating || generatingAI || (!isAdmin && limitStatus && limitStatus.remaining <= 0)}
  >
    {generating ? (
      <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Se generează...</>
    ) : (!isAdmin && limitStatus && limitStatus.remaining <= 0) ? (
      '🚫 Limită atinsă'
    ) : (
      '✨ Generează Standard'
    )}
  </button>

  {!isAdmin && limitStatus && limitStatus.remaining <= 0 && (
    <div style={{
      marginTop: '0.75rem', padding: '0.75rem', borderRadius: '10px',
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
      fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center'
    }}>
      {limitStatus.type === 'guest' ? (
        <>
          Ai folosit toate cele 3 generări de azi.{' '}
          <span onClick={() => router.push('/register')}
            style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>
            Creează un cont gratuit
          </span>{' '}pentru 5 generări/oră!
        </>
      ) : (
        'Ai folosit toate cele 5 generări din această oră. Încearcă din nou mai târziu.'
      )}
    </div>
  )}
</div>
          </div>

          {/* Preview */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span className="icon">👁️</span> Preview</div>
              <span className="badge badge-gold">1080×1350</span>
            </div>

            <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: 'var(--radius-md)',
              overflow: 'hidden', background: 'var(--bg-input)', marginBottom: '1rem' }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : templateSelectat ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img src={templateSelectat.thumbnail} alt="Template" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {!versetEditat && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.88rem', textAlign: 'center', padding: '1rem'
                    }}>
                      📖 Selectează un verset<br />pentru preview complet
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', opacity: 0.3 }}>🖼️</div>
                  <div>Nicio imagine</div>
                </div>
              )}
            </div>

            {templateSelectat && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Mărime: {stilText.fontSize}px</label>
                    <input type="range" min="16" max="44" step="2" value={stilText.fontSize}
                      onChange={e => setStilText(p => ({ ...p, fontSize: +e.target.value }))}
                      style={{ width: '100%', accentColor: 'var(--gold-primary)' }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Poziție</label>
                    <select className="form-select" value={stilText.pozitie}
                      onChange={e => setStilText(p => ({ ...p, pozitie: e.target.value }))}>
                      <option value="top">Sus</option>
                      <option value="center">Centru</option>
                      <option value="bottom">Jos</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Font</label>
                    <select className="form-select" value={stilText.font}
                      onChange={e => setStilText(p => ({ ...p, font: e.target.value }))}>
                      {FONTURI.map(g => (
                        <optgroup key={g.group} label={g.group}>
                          {g.opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Culoare</label>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {['#FFFFFF', '#F4D03F', '#FFE4E1', '#E8F5E9', '#E3F2FD', '#000000'].map(c => (
                        <div key={c} onClick={() => setStilText(p => ({ ...p, culoare: c }))} style={{
                          width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                          border: stilText.culoare === c ? '3px solid var(--gold-primary)' : '2px solid var(--border-subtle)'
                        }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                  fontFamily: stilText.font, fontSize: '0.85rem', fontStyle: 'italic',
                  color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.75rem' }}>
                  "Domnul este Păstorul meu"
                </div>

                {versetEditat && (
                  <button className="btn btn-outline btn-block" onClick={downloadImage}>
                    ⬇️ Descarcă 1080×1350
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ STEP 3 ═══ */}
      {step === 3 && generated && (
        <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span className="icon">🖼️</span> Imagine Finală</div>
              <button className="btn btn-gold btn-sm" onClick={downloadImage}>⬇️ Descarcă</button>
            </div>

            <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: 'var(--radius-md)',
              overflow: 'hidden', marginBottom: '1rem' }}>
              {generatedImageBase64 || previewUrl ? (
                <img src={generatedImageBase64 || previewUrl} alt="Generated"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : templateSelectat ? (
                <img src={templateSelectat.thumbnail} alt="Template"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : null}
            </div>

            {/* Editare verset din Step 3 */}
            <div className="verse-card">
              <div style={{ fontSize: '0.62rem', color: 'var(--gold-primary)', textTransform: 'uppercase',
                letterSpacing: 2, fontWeight: 700, marginBottom: '0.4rem' }}>📖 Verset (editabil)</div>
              <textarea
                value={versetEditat}
                onChange={e => setVersetEditat(e.target.value)}
                rows={3}
                style={{
                  width: '100%', fontFamily: "'Playfair Display', serif", fontSize: '0.88rem',
                  fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6,
                  background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: '0.5rem', resize: 'vertical'
                }}
              />
              <input
                type="text"
                value={referintaEditata}
                onChange={e => setReferintaEditata(e.target.value)}
                style={{
                  width: '100%', marginTop: '0.4rem', fontWeight: 700, color: 'var(--gold-primary)',
                  background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: '0.4rem 0.5rem', fontSize: '0.8rem'
                }}
              />
              <button className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }} onClick={forceRender}>
                🔄 Actualizează imaginea
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {generated.variante?.length > 1 && (
              <div className="tabs">
                {generated.variante.slice(0, 5).map((_, i) => (
                  <button key={i} className={`tab ${variantaActiva === i ? 'active' : ''}`}
                    onClick={() => setVariantaActiva(i)}>
                    {i === 0 ? '✨ V1' : `🔄 V${i + 1}`}
                  </button>
                ))}
              </div>
            )}
			
			
			{/* AI Results Panel */}
{aiResult && (
  <div style={{
    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '16px',
    padding: '1rem',
    marginBottom: '0.75rem'
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      marginBottom: '0.75rem'
    }}>
      <span style={{ fontSize: '1.1rem' }}>🤖</span>
      <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.9rem' }}>
        Gemini AI
      </span>
      <span style={{
        fontSize: '0.68rem', background: 'rgba(99,102,241,0.1)',
        color: '#6366f1', padding: '1px 6px', borderRadius: '10px'
      }}>
        {aiResult.platform}
      </span>
    </div>

    {/* Hook */}
    {aiResult.hook && (
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{
          fontSize: '0.68rem', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem'
        }}>
          🎣 Hook
        </div>
        <div style={{
          fontWeight: 700, color: 'var(--text-primary)',
          fontSize: '0.9rem', fontStyle: 'italic'
        }}>
          "{aiResult.hook}"
        </div>
      </div>
    )}

    {/* Ore recomandate */}
    <div style={{
      display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
      marginBottom: '0.5rem'
    }}>
      <div style={{
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '10px', padding: '0.4rem 0.75rem',
        fontSize: '0.8rem', color: '#10b981', fontWeight: 600
      }}>
        🌅 Dimineață: {aiResult.oraDimineata}
      </div>
      <div style={{
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '10px', padding: '0.4rem 0.75rem',
        fontSize: '0.8rem', color: '#6366f1', fontWeight: 600
      }}>
        🌙 Seară: {aiResult.oraSeara}
      </div>
    </div>

    {/* Motiv ore */}
    {aiResult.motivOre && (
      <div style={{
        fontSize: '0.75rem', color: 'var(--text-muted)',
        marginBottom: '0.5rem'
      }}>
        ℹ️ {aiResult.motivOre}
      </div>
    )}

    {/* Story text */}
    {aiResult.storyText && (
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{
          fontSize: '0.68rem', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem'
        }}>
          📱 Story/Reel text
        </div>
        <div style={{
          background: 'var(--bg-input)', borderRadius: '8px',
          padding: '0.4rem 0.75rem', fontSize: '0.85rem',
          color: 'var(--text-primary)', fontWeight: 600,
          display: 'inline-block'
        }}>
          {aiResult.storyText}
        </div>
      </div>
    )}

    {/* Emoji */}
    {aiResult.emojiTema && (
      <div style={{ fontSize: '1.1rem' }}>{aiResult.emojiTema}</div>
    )}

    {/* Sfat imagine */}
    {aiResult.sfatImagine && (
      <div style={{
        marginTop: '0.5rem', fontSize: '0.75rem',
        color: 'var(--text-muted)', fontStyle: 'italic'
      }}>
        🖼️ {aiResult.sfatImagine}
      </div>
    )}
  </div>
)}

{/* Variante tabs - AI */}
{aiResult && (
  <div className="tabs" style={{ marginBottom: '0.75rem' }}>
    <button
      className={`tab ${aiVarianta === 0 ? 'active' : ''}`}
      onClick={() => {
        setAiVarianta(0);
        setVariantaActiva(0);
      }}
    >
      ✨ Standard
    </button>
    <button
      className={`tab ${aiVarianta === 1 ? 'active' : ''}`}
      onClick={() => {
        setAiVarianta(1);
        setVariantaActiva(1);
      }}
    >
      ❤️ Caldă
    </button>
    <button
      className={`tab ${aiVarianta === 2 ? 'active' : ''}`}
      onClick={() => {
        setAiVarianta(2);
        setVariantaActiva(2);
      }}
    >
      🔥 Puternică
    </button>
  </div>
)}
			
			
			

            <div className="card card-gold">
              <div className="card-header">
                <div className="card-title"><span className="icon">📝</span> Descriere</div>
                <button className="btn btn-outline btn-sm" onClick={() =>
                  navigator.clipboard.writeText(generated.variante?.[variantaActiva] || generated.descriere)
                }>📋 Copiază</button>
              </div>
              <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '1rem',
                whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.7, minHeight: 100 }}>
                {generated.variante?.[variantaActiva] || generated.descriere}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title"><span className="icon">#️⃣</span> Hashtags</div>
                <button className="btn btn-outline btn-sm"
                  onClick={() => navigator.clipboard.writeText(generated.hashtags)}>📋 Copiază</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {(generated.hashtags || '').split(' ').filter(Boolean).map((h, i) => (
                  <span key={i} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{h}</span>
                ))}
              </div>
            </div>

            {publishResult && (
              <div style={{
                padding: '0.75rem', borderRadius: 'var(--radius-md)',
                background: publishResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${publishResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: publishResult.success ? 'var(--accent-green)' : 'var(--accent-red)',
                fontSize: '0.85rem', fontWeight: 600
              }}>{publishResult.message}</div>
            )}

            {scheduleResult && (
              <div style={{
                padding: '0.75rem', borderRadius: 'var(--radius-md)',
                background: scheduleResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${scheduleResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: scheduleResult.success ? 'var(--accent-green)' : 'var(--accent-red)',
                fontSize: '0.85rem', fontWeight: 600
              }}>{scheduleResult.message}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button className="btn btn-gold" onClick={handleSave} disabled={saved}>
                {saved ? '✅ Salvat!' : '💾 Salvează'}
              </button>
              <button className="btn btn-outline" onClick={downloadImage}>⬇️ PNG</button>

              {isAdmin ? (
                <button onClick={handlePublish} disabled={publishing} style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600,
                  background: publishing ? 'rgba(24,119,242,0.5)' : 'linear-gradient(135deg,#1877F2,#0C5DC7)',
                  color: 'white', boxShadow: '0 4px 15px rgba(24,119,242,0.3)'
                }}>
                  {publishing ? '⏳...' : '📘 Facebook Acum'}
                </button>
              ) : (
                <div style={{
                  padding: '0.75rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
                }}>🔒 Publicare doar admin</div>
              )}

              <button className="btn btn-secondary" onClick={() => {
                setStep(1); setGenerated(null); setVersetSelectat(null);
                setVersetEditat(''); setReferintaEditata('');
                setPublishResult(null); setScheduleResult(null);
                setGeneratedImageBase64(null); setPreviewUrl(null);
              }}>🔄 Nouă</button>
            </div>

            {isAdmin && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><span className="icon">📅</span> Programare Automată</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Data și ora (ora României):</label>
                  <input type="datetime-local" className="form-input"
                    value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                </div>
                <button
  className="btn btn-gold btn-block"
  onClick={handleSchedule}
  disabled={scheduling}
>
  {scheduling ? '⏳ Se programează...' : '📅 Programează pe Facebook'}
</button>
              </div>
            )}
			{/* ═══ REEL GENERATOR ═══ */}
<ReelGenerator
  templateUrl={templateSelectat?.url || templateSelectat?.thumbnail || null}
  versetText={versetEditat || generated?.verset?.text || ''}
  versetReferinta={referintaEditata || generated?.verset?.referintaCompleta || generated?.verset?.referinta || ''}
  descriere={generated?.variante?.[variantaActiva] || generated?.descriere || ''}
  hashtags={generated?.hashtags || ''}
  tema={tema}
  isAdmin={isAdmin}
/>
			
			
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratePage;