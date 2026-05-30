'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import ReelGenerator from '../components/ReelGenerator';
import { DEFAULT_TEMPLATES, CATEGORII_TEMPLATE, CITATE_TEOLOGI } from '../data/templates';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORII = CATEGORII_TEMPLATE;

const FONTURI = [
  { group: 'Elegante', opts: ['Playfair Display', 'Cinzel', 'Cormorant Garamond', 'EB Garamond', 'Libre Baskerville'] },
  { group: 'Caligrafice', opts: ['Great Vibes', 'Dancing Script'] },
  { group: 'Clasice', opts: ['Lora', 'Merriweather', 'Georgia', 'Times New Roman'] },
  { group: 'Moderne', opts: ['Inter', 'Arial'] },
];

// Cuvinte care primesc culoarea aurie pe imagine
const CUVINTE_CHEIE_AURII = [
  'Dumnezeu', 'Domnul', 'Hristos', 'Isus', 'Iisus', 'Tatăl', 'Duhul', 'Sfânt',
  'iubire', 'dragoste', 'har', 'credință', 'nădejde', 'pace', 'bucurie',
  'mântuire', 'viață', 'adevăr', 'lumină', 'putere', 'slavă', 'veșnic',
  'iertare', 'binecuvântare', 'Sfântul', 'Domnului', 'Dumnezeului', 'Tatălui'
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
  // Opțiuni design avansate
  const [afiseazaCitat, setAfiseazaCitat] = useState(false);
  const [afiseazaSimbol, setAfiseazaSimbol] = useState('cruce');
  const [citatSelectat, setCitatSelectat] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const loadedImgRef = useRef(null);
  const loadedLogoRef = useRef(null);
  const [citatFontSize, setCitatFontSize] = useState(22);

  // Preload logo
  useEffect(() => {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/logo.png';
    logo.onload = () => { loadedLogoRef.current = logo; };
    logo.onerror = () => { loadedLogoRef.current = null; };
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchTeme();
    fetchLimitStatus();
  }, []);

  // ═══ CANVAS RENDER PREMIUM ═══
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateSelectat) return;

    const textDePus = versetEditat || versetSelectat?.text;
    const refDePus = referintaEditata || versetSelectat?.referintaCompleta || versetSelectat?.referinta;
    if (!textDePus) return;

    const gandZilei2 = generated?.gand?.text || '';
    const citat = citatSelectat || (afiseazaCitat ? CITATE_TEOLOGI[Math.floor(Math.random() * CITATE_TEOLOGI.length)] : null);

    const drawOnCanvas = (img) => {
      const ctx = canvas.getContext('2d');
      const W = 1080;
      const H = 1350;
      canvas.width = W;
      canvas.height = H;

      // ── Cover crop ──
      const imgR = img.width / img.height;
      const canR = W / H;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgR > canR) { sw = img.height * canR; sx = (img.width - sw) / 2; }
      else { sh = img.width / canR; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

      // ── Overlay gradient dramatic ──
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(0,0,0,0.08)');
      grad.addColorStop(0.15, 'rgba(0,0,0,0.28)');
      grad.addColorStop(0.45, 'rgba(0,0,0,0.52)');
      grad.addColorStop(0.72, 'rgba(0,0,0,0.72)');
      grad.addColorStop(1, 'rgba(0,0,0,0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // ── Watermark repetat discret ──
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.font = '700 22px Inter, Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      for (let y = 60; y < H; y += 120) {
        for (let x = 80; x < W; x += 380) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-0.35);
          ctx.fillText('PopaspentruSuflet', 0, 0);
          ctx.restore();
        }
      }
      ctx.restore();

      // ── Helper: separator auriu ──
      const drawSep = (y, w = 120, opacity = 0.6) => {
        const sg = ctx.createLinearGradient(W/2 - w, 0, W/2 + w, 0);
        sg.addColorStop(0, 'transparent');
        sg.addColorStop(0.3, `rgba(212,175,55,${opacity})`);
        sg.addColorStop(0.7, `rgba(212,175,55,${opacity})`);
        sg.addColorStop(1, 'transparent');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(W/2 - w, y);
        ctx.lineTo(W/2 + w, y);
        ctx.stroke();
      };

      // ── Helper: wrap text ──
      const wrapLines = (text, maxW, maxL = 8) => {
        const words = text.split(' ');
        const lines = [];
        let cur = '';
        for (const w of words) {
          const t = cur + w + ' ';
          if (ctx.measureText(t).width > maxW && cur) {
            lines.push(cur.trim());
            cur = w + ' ';
            if (lines.length >= maxL - 1) break;
          } else { cur = t; }
        }
        lines.push(cur.trim());
        return lines.slice(0, maxL);
      };

      // ── ORNAMENTE COLȚURI ──
      const drawColt = (x, y, dx, dy) => {
        ctx.strokeStyle = 'rgba(212,175,55,0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + dx * 42, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + dy * 42);
        ctx.stroke();
        ctx.fillStyle = 'rgba(212,175,55,0.55)';
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawColt(55, 55, 1, 1);
      drawColt(W-55, 55, -1, 1);
      drawColt(55, H-55, 1, -1);
      drawColt(W-55, H-55, -1, -1);

      // Linie decorativă sus
      drawSep(88, 200, 0.3);

      // ── SIMBOL CREȘTIN SUS ──
      if (afiseazaSimbol === 'cruce') {
        ctx.save();
        ctx.shadowColor = 'rgba(212,175,55,0.7)';
        ctx.shadowBlur = 30;
        const cY = 168, cHh = 68, cWw = 14, bW = 46, bH = 14;
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(W/2 - cWw/2, cY - cHh/2, cWw, cHh);
        ctx.fillRect(W/2 - bW/2, cY - cHh*0.15, bW, bH);
        ctx.restore();
      } else if (afiseazaSimbol === 'porumbel') {
        ctx.save();
        ctx.font = '65px serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(212,175,55,0.6)';
        ctx.shadowBlur = 20;
        ctx.fillText('🕊️', W/2, 185);
        ctx.restore();
      } else if (afiseazaSimbol === 'stea') {
        ctx.save();
        ctx.font = 'bold 60px serif';
        ctx.fillStyle = '#D4AF37';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(212,175,55,0.7)';
        ctx.shadowBlur = 25;
        ctx.fillText('✦', W/2, 185);
        ctx.restore();
      }

      // ── TEXT VERSET PRINCIPAL ──
      const fz = Math.round(stilText.fontSize * 2);
      const lh = fz * 1.55;
      const maxW = W * 0.82;

      const versetText2 = `\u201C${textDePus}\u201D`;
      ctx.font = `italic ${fz}px '${stilText.font}', Georgia, serif`;
      const lines = wrapLines(versetText2, maxW, 8);
      const totalH = lines.length * lh;

      let startY;
      if (stilText.pozitie === 'top') startY = 280;
      else if (stilText.pozitie === 'bottom') startY = H - totalH - 280;
      else startY = Math.max(280, (H - totalH) / 2 - 50);

      // Separator sus verset
      drawSep(startY - 32, 110, 0.5);

      // Ghilimele decorative
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.font = 'bold 170px Georgia, serif';
      ctx.fillStyle = '#D4AF37';
      ctx.textAlign = 'left';
      ctx.fillText('\u201C', 35, startY + 90);
      ctx.restore();

      // ÎNLOCUIEȘTE secțiunea "── Cuvinte cheie COLORATE ──" din renderCanvas
// în GeneratePage.js cu codul de mai jos:

// ── Cuvinte cheie COLORATE — cuvânt cu cuvânt ──
const CUVINTE_CHEIE_AURII = [
  'dumnezeu', 'domnul', 'hristos', 'isus', 'iisus', 'tatăl', 'tatal',
  'duhul', 'sfânt', 'sfant', 'iubire', 'dragoste', 'har', 'credință',
  'credinta', 'nădejde', 'nadejde', 'pace', 'bucurie', 'mântuire',
  'mantuire', 'viață', 'viata', 'adevăr', 'adevar', 'lumină', 'lumina',
  'putere', 'slavă', 'slava', 'veșnic', 'vesnic', 'iertare',
  'binecuvântare', 'binecuvantare', 'sfântul', 'sfantul',
  'domnului', 'dumnezeului', 'tatălui', 'tatalui', 'hristoase'
];

const isKeyword = (word) => {
  const clean = word.replace(/[„""''.,;:!?«»\-()]/g, '').toLowerCase();
  return CUVINTE_CHEIE_AURII.includes(clean);
};

// Funcție pentru a desena o linie cu cuvinte colorate individual
const drawLineColored = (line, x, y, fz, font, defaultColor, accentColor) => {
  const words = line.split(' ');
  
  // Calculăm lățimea totală pentru centrare
  ctx.font = `italic ${fz}px '${font}', Georgia, serif`;
  const totalWidth = ctx.measureText(line).width;
  let curX = x - totalWidth / 2;

  words.forEach((word, i) => {
    const isKey = isKeyword(word);
    
    if (isKey) {
      ctx.font = `bold italic ${Math.round(fz * 1.04)}px '${font}', Georgia, serif`;
      ctx.fillStyle = accentColor;
    } else {
      ctx.font = `italic ${fz}px '${font}', Georgia, serif`;
      ctx.fillStyle = defaultColor;
    }
    
    ctx.textAlign = 'left';
    ctx.fillText(word, curX, y);
    curX += ctx.measureText(word).width + ctx.measureText(' ').width;
  });
  
  // Reset
  ctx.textAlign = 'center';
};

// Desenează fiecare linie cu cuvinte colorate
lines.forEach((line, i) => {
  const y = startY + i * lh;
  drawLineColored(
    line,
    W / 2,
    y,
    fz,
    stilText.font,
    stilText.culoare,  // culoarea normală (alb de obicei)
    '#F4D03F'          // auriu pentru cuvinte cheie
  );
});


      const afterVerset = startY + totalH;
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

      // Separator jos verset
      drawSep(afterVerset + 20, 110, 0.5);

      // Referință
      ctx.save();
      ctx.font = `bold ${Math.round(fz * 0.44)}px '${stilText.font}', Georgia, serif`;
      ctx.fillStyle = '#D4AF37';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 15;
      ctx.fillText(`\u2014 ${refDePus} \u2014`, W/2, afterVerset + 60);
      ctx.restore();

      // ── GÂNDUL ZILEI ──
      if (gandZilei2 && afterVerset + 120 < H - 320) {
        const gY = afterVerset + 115;
        drawSep(gY, 85, 0.25);
        ctx.save();
        ctx.font = `500 30px 'Inter', Arial, sans-serif`;
        ctx.fillStyle = 'rgba(212,175,55,0.9)';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText('✦ Gândul zilei ✦', W/2, gY + 35);
        ctx.font = `italic 32px Georgia, serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.82)';
        const gandLines = wrapLines(gandZilei2, W * 0.75, 3);
        gandLines.forEach((line, i) => { ctx.fillText(line, W/2, gY + 80 + i * 42); });
        ctx.restore();
      }

      // ── CITAT TEOLOG ──
if (citat && afiseazaCitat) {
  const citY = H - 235;
  ctx.save();
  
  // Text citat — fără fundal
  ctx.font = `italic ${Math.round(fz * 0.42)}px '${stilText.font}', Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;
  
  const citLines = wrapLines(`„${citat.text}"`, W * 0.78, 2);
  citLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, citY + i * Math.round(fz * 0.55));
  });
  
  // Autor
  ctx.font = `600 ${Math.round(fz * 0.36)}px 'Inter', Arial, sans-serif`;
  ctx.fillStyle = '#D4AF37';
  ctx.shadowBlur = 12;
  ctx.fillText(`— ${citat.autor}`, W / 2, citY + citLines.length * Math.round(fz * 0.55) + 20);
  
  ctx.restore();
}

      // Separator jos
      drawSep(H - 168, 210, 0.28);

      // ── BRANDING / LOGO ──
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
      const logo = loadedLogoRef.current;
      const wmY = H - 145;

      if (logo) {
        const logoH = 70;
        const logoX = W/2 - 35;
        const logoY = wmY;

        ctx.save();
        ctx.globalAlpha = 0.12;
        const glowG = ctx.createRadialGradient(W/2, logoY+logoH/2, logoH/2, W/2, logoY+logoH/2, logoH/2+28);
        glowG.addColorStop(0, 'rgba(212,175,55,0.4)');
        glowG.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.beginPath();
        ctx.arc(W/2, logoY+logoH/2, logoH/2+28, 0, Math.PI*2);
        ctx.fillStyle = glowG;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.arc(W/2, logoY+logoH/2, logoH/2+4, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(212,175,55,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(W/2, logoY+logoH/2, logoH/2, 0, Math.PI*2);
        ctx.clip();
        ctx.drawImage(logo, logoX, logoY, logoH, logoH);
        ctx.restore();

        ctx.globalAlpha = 0.75;
        ctx.font = '600 22px Inter, Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('Popas pentru Suflet', W/2, logoY+logoH+28);

        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W/2-90, logoY+logoH+40);
        ctx.lineTo(W/2+90, logoY+logoH+40);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.6;
        ctx.font = '700 26px Inter, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('🕊️ Popas pentru Suflet', W/2, H-50);
        ctx.globalAlpha = 1;
      }

      // Watermark colțuri
      ctx.save();
      ctx.globalAlpha = 0.055;
      ctx.font = '600 15px Inter, Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left'; ctx.fillText('popaspentrusuflet.ro', 15, 24);
      ctx.textAlign = 'right'; ctx.fillText('popaspentrusuflet.ro', W-15, 24);
      ctx.textAlign = 'left'; ctx.fillText('popaspentrusuflet.ro', 15, H-12);
      ctx.textAlign = 'right'; ctx.fillText('popaspentrusuflet.ro', W-15, H-12);
      ctx.restore();

      saveCanvasImage();
    };

    if (loadedImgRef.current && loadedImgRef.current._src === (templateSelectat.url || templateSelectat.thumbnail)) {
      drawOnCanvas(loadedImgRef.current);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    const src = templateSelectat.url || templateSelectat.thumbnail;
    img._src = src;
    img.src = src;
    img.onload = () => { loadedImgRef.current = img; drawOnCanvas(img); };
    img.onerror = () => console.error('Eroare încărcare imagine template');
  }, [templateSelectat, versetEditat, versetSelectat, referintaEditata, stilText, generated, afiseazaCitat, afiseazaSimbol, citatSelectat, citatFontSize]);

  // Helper rounded rect
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }

  useEffect(() => {
    const textExists = versetEditat || versetSelectat?.text;
    if (templateSelectat && textExists && (step === 2 || step === 3)) {
      const timeout = setTimeout(() => renderCanvas(), 150);
      return () => clearTimeout(timeout);
    }
  }, [templateSelectat, versetEditat, versetSelectat, referintaEditata, stilText, step, renderKey, afiseazaCitat, afiseazaSimbol, citatSelectat, renderCanvas]);

  useEffect(() => {
    if (versetSelectat) {
      setVersetEditat(versetSelectat.text);
      setReferintaEditata(versetSelectat.referintaCompleta || versetSelectat.referinta || '');
    }
  }, [versetSelectat]);

  const fetchLimitStatus = async () => {
    try {
      setLimitLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const r = await axios.get(`${API}/api/generate/limit-status`, { headers });
      setLimitStatus(r.data);
    } catch (e) { console.error('Eroare la limit-status:', e); }
    finally { setLimitLoading(false); }
  };

  const fetchTemplates = async () => {
    try {
      const r = await axios.get(`${API}/api/generate/templates`);
      const builtIn = r.data?.builtIn?.length > 0 ? r.data.builtIn : DEFAULT_TEMPLATES;
      setTemplates({ builtIn, uploadate: r.data?.uploadate || [] });
    } catch (e) { setTemplates({ builtIn: DEFAULT_TEMPLATES, uploadate: [] }); }
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
      const r = await axios.get(`${API}/api/verses?search=${encodeURIComponent(versetSearch)}&limit=50`);
      setVerseteGasite(r.data.versete || []);
    } catch (e) { console.error('Search error:', e); }
    finally { setSearching(false); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('template', file);
    try {
      const r = await axios.post(`${API}/api/generate/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (r.data.success) { await fetchTemplates(); setTemplateSelectat(r.data.file); setStep(2); }
    } catch (e) { alert('Eroare upload!'); }
    finally { setUploading(false); }
  };

  const handleDeleteTemplate = async (filename) => {
    if (!window.confirm('Ștergi?')) return;
    try {
      await axios.delete(`${API}/api/generate/templates/${filename}`);
      await fetchTemplates();
      if (templateSelectat?.id === filename) setTemplateSelectat(null);
    } catch (e) {}
  };

  const handleGenerate = async () => {
    if (!isAdmin && limitStatus && limitStatus.remaining <= 0) {
      if (limitStatus.type === 'guest') {
        const ok = window.confirm('Ai atins limita de 3 generări/zi pentru vizitatori.\n\nCreează un cont gratuit pentru 5 generări/oră!');
        if (ok) router.push('/register');
      } else { alert('Ai atins limita de 5 generări/oră. Încearcă din nou mai târziu.'); }
      return;
    }
    setGenerating(true); setGenerated(null); setVariantaActiva(0); setPublishResult(null); setScheduleResult(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const r = await axios.post(`${API}/api/generate`, { tema, platform, versetCustom: versetSelectat || null }, { headers });
      if (r.data.success) {
        setGenerated(r.data); setVariantaActiva(0);
        if (!versetSelectat && r.data.verset) {
          setVersetSelectat(r.data.verset);
          setVersetEditat(r.data.verset.text);
          setReferintaEditata(r.data.verset.referintaCompleta || r.data.verset.referinta || '');
        }
        if (r.data.limitInfo) { setLimitStatus(prev => ({ ...prev, used: r.data.limitInfo.used, remaining: r.data.limitInfo.remaining })); }
        else { await fetchLimitStatus(); }
        setRenderKey(k => k + 1); setStep(3);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const msg = error.response?.data?.message || 'Limită atinsă.';
        const needAccount = error.response?.data?.needAccount;
        if (needAccount) { const ok = window.confirm(msg + '\n\nVrei să creezi un cont gratuit?'); if (ok) router.push('/register'); }
        else { alert(msg); }
        await fetchLimitStatus();
      } else { alert('Eroare la generare: ' + (error.response?.data?.error || error.message)); }
    } finally { setGenerating(false); }
  };

  const handleGenerateAI = async () => {
    if (!isAdmin && limitStatus && limitStatus.remaining <= 0) {
      if (limitStatus.type === 'guest') { const ok = window.confirm('Ai atins limita. Creează un cont gratuit!'); if (ok) router.push('/register'); }
      else { alert('Ai atins limita de generări/oră.'); }
      return;
    }
    setGeneratingAI(true); setAiResult(null); setPublishResult(null); setScheduleResult(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const r = await axios.post(`${API}/api/generate/ai`, { tema, platform, versetCustom: versetSelectat || null }, { headers });
      if (r.data.success) {
        setAiResult(r.data.ai); setAiVarianta(0);
        if (!versetSelectat && r.data.verset) {
          setVersetSelectat(r.data.verset);
          setVersetEditat(r.data.verset.text);
          setReferintaEditata(r.data.verset.referintaCompleta || r.data.verset.referinta || '');
        }
        const ai = r.data.ai;
        const hook = ai.hook ? `${ai.hook}\n\n` : '';
        const cta = ai.cta ? `\n\n${ai.cta}` : '';
        const varianteComplete = [
          ai.descriere ? (hook + ai.descriere + cta) : null,
          ai.variantaCalda ? (hook + ai.variantaCalda + cta) : null,
          ai.variantaPuternica ? (hook + ai.variantaPuternica + cta) : null
        ].filter(Boolean);
        setGenerated({ ...r.data, descriere: varianteComplete[0] || ai.descriere || '', variante: varianteComplete, hashtags: ai.hashtags || r.data.hashtags || '' });
        if (r.data.limitInfo) { setLimitStatus(prev => ({ ...prev, used: r.data.limitInfo.used, remaining: r.data.limitInfo.remaining })); }
        setRenderKey(k => k + 1); setStep(3); setAiTab('ai');
      }
    } catch (error) { alert('Eroare AI: ' + (error.response?.data?.error || error.message)); }
    finally { setGeneratingAI(false); }
  };

  const handleSave = async () => {
    if (!generated) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API}/api/posts`, {
        content: generated.variante?.[variantaActiva] || generated.descriere,
        hashtags: generated.hashtags, platform, tema,
        verset: { text: versetEditat || generated.verset?.text, referinta: referintaEditata || generated.verset?.referinta, referintaCompleta: referintaEditata || generated.verset?.referintaCompleta },
        status: 'draft'
      }, { headers });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert('Eroare salvare!'); }
  };

  const handlePublish = async () => {
    if (!isAdmin) { alert('Publicarea pe Facebook este disponibilă doar pentru administratori.'); return; }
    if (!generated) return;
    if (!window.confirm('Publici pe Facebook?')) return;
    setPublishing(true); setPublishResult(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const descriere = generated.variante?.[variantaActiva] || generated.descriere;
      const r = await axios.post(`${API}/api/social/publish-direct`, {
        content: descriere, hashtags: generated.hashtags,
        imageBase64: generatedImageBase64 || null,
        imageUrl: generatedImageBase64 ? null : (templateSelectat?.url || null), platform: 'facebook'
      }, { headers });
      if (r.data.success) { setPublishResult({ success: true, message: '✅ Publicat pe Facebook!' }); }
    } catch (e) { setPublishResult({ success: false, message: '❌ ' + (e.response?.data?.error || e.message) }); }
    finally { setPublishing(false); }
  };

  const handleSchedule = async () => {
    if (!isAdmin) { alert('Programarea pe Facebook este disponibilă doar pentru administratori.'); return; }
    if (!generated) { alert('Generează mai întâi!'); return; }
    if (!scheduledAt) { alert('Alege data și ora!'); return; }
    setScheduling(true); setScheduleResult(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const descriere = generated.variante?.[variantaActiva] || generated.descriere;
      const r = await axios.post(`${API}/api/social/schedule`, {
        content: descriere, hashtags: generated.hashtags,
        imageBase64: generatedImageBase64 || null,
        imageUrl: (!generatedImageBase64 && templateSelectat?.url) ? templateSelectat.url : null,
        platform: 'facebook', scheduledDate: new Date(scheduledAt).toISOString(), tema,
        verset: { text: versetEditat || generated.verset?.text, referinta: referintaEditata || generated.verset?.referinta, referintaCompleta: referintaEditata || generated.verset?.referintaCompleta }
      }, { headers });
      if (r.data.success) { setScheduleResult({ success: true, message: r.data.message }); }
    } catch (e) { setScheduleResult({ success: false, message: '❌ ' + (e.response?.data?.error || e.message) }); }
    finally { setScheduling(false); }
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
    } else { alert('Nu există imagine de descărcat!'); }
  };

  const forceRender = () => setRenderKey(k => k + 1);

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

  const LimitBanner = () => {
    if (limitLoading || !limitStatus) return null;
    return (
      <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {limitStatus.type === 'admin' ? (
          <span>♾️ <strong>Administrator:</strong> generări nelimitate</span>
        ) : (
          <>
            <span>
              {limitStatus.type === 'guest' ? '👤 Vizitator' : '🔑 Cont'}{' '}
              — folosite: <strong>{limitStatus.used}</strong> / {limitStatus.limit}
              {' '}• rămase: <strong style={{ color: limitStatus.remaining > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{limitStatus.remaining}</strong>
              {limitStatus.type === 'guest' ? ' (reset la miezul nopții)' : ' (reset la fiecare oră)'}
            </span>
            {!isAuthenticated && (
              <button onClick={() => router.push('/register')} style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                ✅ Creează cont gratuit
              </button>
            )}
          </>
        )}
      </div>
    );
  };


const [showReel, setShowReel] = useState(false);

const ReelSection = () => (
  <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
    <button
      onClick={() => setShowReel(p => !p)}
      style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: showReel ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
    >
      <span>🎬 Generează Reel — Video 15s · 1080×1920 · Optim Facebook/Instagram</span>
      <span>{showReel ? '▲' : '▼'}</span>
    </button>
    {showReel && (
      <div style={{ marginTop: '1rem' }}>
        <ReelGenerator />
      </div>
    )}
  </div>
);





  return (
    <div className="animate-in" style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>

      {/* ═══ STEPS BAR ═══ */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '0.5rem', border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
        {[{ nr: 1, label: 'Imaginea', icon: '🖼️' }, { nr: 2, label: 'Versetul', icon: '📖' }, { nr: 3, label: 'Publică', icon: '✨' }].map((s, idx) => (
          <React.Fragment key={s.nr}>
            <div onClick={() => step > s.nr && setStep(s.nr)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-lg)', background: step === s.nr ? 'linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05))' : 'transparent', border: step === s.nr ? '1px solid var(--border-color)' : '1px solid transparent', cursor: step > s.nr ? 'pointer' : 'default', transition: 'var(--transition)', minWidth: 'fit-content' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > s.nr ? 'var(--accent-green)' : step === s.nr ? 'var(--gold-primary)' : 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: step >= s.nr ? '#000' : 'var(--text-muted)', flexShrink: 0 }}>
                {step > s.nr ? '✓' : s.nr}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pasul {s.nr}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: step === s.nr ? 'var(--gold-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.icon} {s.label}</div>
              </div>
            </div>
            {idx < 2 && <div style={{ width: 20, height: 1, background: step > s.nr ? 'var(--accent-green)' : 'var(--border-subtle)', flexShrink: 0 }} />}
          </React.Fragment>
        ))}
      </div>

      <LimitBanner />

      {/* ═══ STEP 1: ALEGE IMAGINEA ═══ */}
      {step === 1 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Playfair Display, serif' }}>🖼️ Alege Imaginea de Fundal</h2>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} />
            <button onClick={() => fileInputRef.current.click()} disabled={uploading} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>
              {uploading ? '⏳...' : '⬆️ Upload imagine proprie'}
            </button>
          </div>

          {/* Categorii */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {CATEGORII.map(c => (
              <button key={c.id} onClick={() => { setCategorieFiltre(c.id); setPaginaCurenta(1); }} style={{ padding: '0.3rem 0.7rem', borderRadius: 20, border: `1px solid ${categorieFiltre === c.id ? 'var(--gold-primary)' : 'var(--border-subtle)'}`, background: categorieFiltre === c.id ? 'rgba(212,175,55,0.1)' : 'var(--bg-input)', color: categorieFiltre === c.id ? 'var(--gold-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>📐 Imagine verticală <strong>1080×1350</strong> — ideal pentru Facebook, Instagram, TikTok</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{totalTemplates} template-uri • Pagina {paginaCurenta}/{totalPagini}</span>
              <button onClick={() => setPaginaCurenta(p => Math.max(1, p-1))} disabled={paginaCurenta <= 1} style={{ padding: '0.3rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-secondary)', cursor: paginaCurenta <= 1 ? 'default' : 'pointer', opacity: paginaCurenta <= 1 ? 0.4 : 1, fontSize: '0.78rem' }}>←</button>
              <button onClick={() => setPaginaCurenta(p => Math.min(totalPagini, p+1))} disabled={paginaCurenta >= totalPagini} style={{ padding: '0.3rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-secondary)', cursor: paginaCurenta >= totalPagini ? 'default' : 'pointer', opacity: paginaCurenta >= totalPagini ? 0.4 : 1, fontSize: '0.78rem' }}>→</button>
            </div>
          </div>

          {/* Grid template-uri */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.65rem' }}>
            {/* Upload card */}
            <div onClick={() => fileInputRef.current.click()} style={{ aspectRatio: '4/5', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-input)', color: 'var(--text-muted)', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⬆️</span>
              <span style={{ fontSize: '0.75rem' }}>Upload</span>
            </div>

            {templatesPagina.map(t => (
              <div key={t.id} style={{ position: 'relative' }}>
                <div onClick={() => { setTemplateSelectat(t); setPreviewUrl(null); loadedImgRef.current = null; setStep(2); }} style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', border: templateSelectat?.id === t.id ? '3px solid var(--gold-primary)' : '2px solid var(--border-subtle)', boxShadow: templateSelectat?.id === t.id ? 'var(--shadow-gold)' : 'none', transition: 'all 0.15s' }}>
                  <img src={t.thumbnail} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '0.5rem 0.35rem 0.35rem', fontSize: '0.65rem', color: '#fff', fontWeight: 600 }}>{t.name}</div>
                  {templateSelectat?.id === t.id && (
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, background: 'var(--gold-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#000' }}>✓</div>
                  )}
                </div>
                {t.custom && (
                  <button onClick={e => { e.stopPropagation(); handleDeleteTemplate(t.id); }} style={{ position: 'absolute', top: 6, left: 6, width: 22, height: 22, background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                )}
              </div>
            ))}
          </div>

          {/* Paginare jos */}
          {totalPagini > 1 && (
            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              {Array.from({ length: totalPagini }, (_, i) => i+1).map(pg => (
                <button key={pg} onClick={() => setPaginaCurenta(pg)} style={{ width: 32, height: 32, borderRadius: '8px', border: pg === paginaCurenta ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)', background: pg === paginaCurenta ? 'rgba(212,175,55,0.15)' : 'var(--bg-input)', color: pg === paginaCurenta ? 'var(--gold-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: pg === paginaCurenta ? 700 : 400 }}>{pg}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ STEP 2: VERSET + CANVAS ═══ */}
      {step === 2 && (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          {/* Stânga — controale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Playfair Display, serif' }}>📖 Personalizează</h2>

            {/* Temă */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>🎯 Tema postării:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {teme.map(t => (
                  <button key={t.id} onClick={() => setTema(t.id)} style={{ padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)', border: `1px solid ${tema === t.id ? 'var(--gold-primary)' : 'var(--border-subtle)'}`, background: tema === t.id ? 'rgba(212,175,55,0.1)' : 'var(--bg-input)', color: tema === t.id ? 'var(--gold-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Căutare verset */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>🔍 Caută verset:</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="form-input" value={versetSearch} onChange={e => setVersetSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchVerset()} placeholder="ex: Ioan 3:16 sau dragoste..." style={{ flex: 1, fontSize: '0.85rem' }} />
                <button onClick={searchVerset} disabled={searching} style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--gold-primary)', fontWeight: 600 }}>
                  {searching ? '⏳' : '🔍'}
                </button>
              </div>

              {verseteGasite.length > 0 && (
                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {verseteGasite.map((v, i) => (
                    <div key={i} onClick={() => { const vs = { text: v.text, referinta: v.referinta, referintaCompleta: `${v.carte} ${v.capitol}:${v.verset}` }; setVersetSelectat(vs); setVerseteGasite([]); setVersetSearch(''); }} style={{ padding: '0.65rem', marginBottom: '0.35rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{v.text.substring(0, 85)}{v.text.length > 85 ? '...' : ''}"</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', marginTop: '0.25rem', fontWeight: 600 }}>{v.carte} {v.capitol}:{v.verset}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Editare text */}
            {versetSelectat ? (
              <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>✅ Selectat — editează mai jos</div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>✏️ Text verset:</label>
                  <textarea className="form-textarea" value={versetEditat} onChange={e => setVersetEditat(e.target.value)} rows={4} style={{ fontSize: '0.85rem', resize: 'vertical' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>📌 Referință:</label>
                  <input className="form-input" value={referintaEditata} onChange={e => setReferintaEditata(e.target.value)} style={{ fontSize: '0.85rem' }} />
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ☝️ Caută și selectează un verset de mai sus
              </div>
            )}

            {/* Stil text */}
            <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>🎨 Stil text:</div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Mărime: {stilText.fontSize}px</label>
                <input type="range" min="18" max="40" step="1" value={stilText.fontSize} onChange={e => setStilText(p => ({ ...p, fontSize: +e.target.value }))} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Font:</label>
                <select className="form-select" value={stilText.font} onChange={e => setStilText(p => ({ ...p, font: e.target.value }))} style={{ fontSize: '0.82rem' }}>
                  {FONTURI.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Culoare text:</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['#FFFFFF', '#F4D03F', '#FFE4E1', '#E8F5E9', '#E3F2FD', '#000000'].map(c => (
                    <div key={c} onClick={() => setStilText(p => ({ ...p, culoare: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: stilText.culoare === c ? '3px solid var(--gold-primary)' : '2px solid var(--border-color)', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Poziție:</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[{ id: 'top', label: '⬆ Sus' }, { id: 'center', label: '↕ Centru' }, { id: 'bottom', label: '⬇ Jos' }].map(p => (
                    <button key={p.id} onClick={() => setStilText(prev => ({ ...prev, pozitie: p.id }))} style={{ flex: 1, padding: '0.4rem', borderRadius: '8px', border: `1px solid ${stilText.pozitie === p.id ? 'var(--gold-primary)' : 'var(--border-subtle)'}`, background: stilText.pozitie === p.id ? 'rgba(212,175,55,0.1)' : 'var(--bg-input)', color: stilText.pozitie === p.id ? 'var(--gold-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>{p.label}</button>
                  ))}
                </div>
              </div>
            </div>

           {/* Design avansat */}
<div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>✝️ Design avansat:</div>

  {/* Simbol sus */}
  <div>
    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Simbol sus:</label>
    <div style={{ display: 'flex', gap: '0.35rem' }}>
      {[{ id: 'cruce', label: '✝️ Cruce' }, { id: 'porumbel', label: '🕊️ Porumbel' }, { id: 'stea', label: '✦ Stea' }, { id: 'none', label: '✕ Fără' }].map(s => (
        <button key={s.id} onClick={() => setAfiseazaSimbol(s.id)} style={{ flex: 1, padding: '0.35rem 0.25rem', borderRadius: '8px', border: `1px solid ${afiseazaSimbol === s.id ? 'var(--gold-primary)' : 'var(--border-subtle)'}`, background: afiseazaSimbol === s.id ? 'rgba(212,175,55,0.1)' : 'var(--bg-input)', color: afiseazaSimbol === s.id ? 'var(--gold-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}>{s.label}</button>
      ))}
    </div>
  </div>

  {/* Citat teolog */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <input
      type="checkbox"
      id="citat"
      checked={afiseazaCitat}
      onChange={e => {
        setAfiseazaCitat(e.target.checked);
        if (e.target.checked) setCitatSelectat(CITATE_TEOLOGI[Math.floor(Math.random() * CITATE_TEOLOGI.length)]);
      }}
    />
    <label htmlFor="citat" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
      Adaugă citat teolog (Luther, Calvin, Spurgeon...)
    </label>
  </div>

  {afiseazaCitat && citatSelectat && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Preview citat */}
      <div style={{ background: 'var(--bg-input)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.78rem' }}>
        <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
          „{citatSelectat.text.substring(0, 80)}..."
        </div>
        <div style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>— {citatSelectat.autor}</div>
        <button
          onClick={() => setCitatSelectat(CITATE_TEOLOGI[Math.floor(Math.random() * CITATE_TEOLOGI.length)])}
          style={{ marginTop: '0.5rem', padding: '0.3rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem' }}
        >
          🔄 Alt citat
        </button>
      </div>

      {/* Slider font size citat */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
          Mărime font citat: {citatFontSize}px
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCitatFontSize(p => Math.max(14, p - 2))}
            style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >−</button>
          <input
            type="range"
            min="14"
            max="32"
            step="1"
            value={citatFontSize}
            onChange={e => setCitatFontSize(+e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => setCitatFontSize(p => Math.min(32, p + 2))}
            style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          <span>Mic (14)</span>
          <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{citatFontSize}px</span>
          <span>Mare (32)</span>
        </div>
      </div>
    </div>
  )}
</div>

			

            {/* Butoane generate */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={handleGenerate} disabled={generating || !versetSelectat} style={{ padding: '0.875rem', borderRadius: '12px', border: 'none', background: !versetSelectat ? 'var(--bg-input)' : 'linear-gradient(135deg, #d4af37, #b8960c)', color: !versetSelectat ? 'var(--text-muted)' : '#000', cursor: !versetSelectat ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                {generating ? '⏳ Se generează...' : '✨ Generează text postare'}
              </button>
              <button onClick={handleGenerateAI} disabled={generatingAI || !versetSelectat} style={{ padding: '0.875rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.5)', background: !versetSelectat ? 'transparent' : 'rgba(99,102,241,0.1)', color: !versetSelectat ? 'var(--text-muted)' : '#a5b4fc', cursor: !versetSelectat ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                {generatingAI ? '⏳ AI generează...' : '🤖 Generează cu AI avansat'}
              </button>
              <button onClick={forceRender} disabled={!templateSelectat || !versetSelectat} style={{ padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}>
                🔄 Actualizează imaginea
              </button>
            </div>
          </div>

          {/* Dreapta — preview canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'var(--radius-lg)' }} />
              {!versetSelectat && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>📖</span>
                  <span>Selectează un verset pentru preview</span>
                </div>
              )}
            </div>
            <button onClick={downloadImage} disabled={!generatedImageBase64} style={{ padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: !generatedImageBase64 ? 'var(--text-muted)' : 'var(--gold-primary)', cursor: !generatedImageBase64 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              ⬇️ Descarcă imaginea (JPG)
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: PUBLICĂ ═══ */}
      {step === 3 && generated && (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          {/* Stânga — text generat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Playfair Display, serif' }}>✨ Text Generat</h2>

            {/* Tabs AI/Normal */}
            {generated.variante?.length > 1 && (
              <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-input)', borderRadius: '10px', padding: '4px' }}>
                {generated.variante.map((_, i) => (
                  <button key={i} onClick={() => setVariantaActiva(i)} style={{ flex: 1, padding: '0.45rem', borderRadius: '8px', border: 'none', background: variantaActiva === i ? 'var(--bg-card)' : 'transparent', color: variantaActiva === i ? 'var(--gold-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: variantaActiva === i ? 600 : 400 }}>
                    Varianta {i+1}
                  </button>
                ))}
              </div>
            )}

            <div className="card" style={{ padding: '1rem' }}>
              <textarea className="form-textarea" value={generated.variante?.[variantaActiva] || generated.descriere} onChange={e => setGenerated(prev => { const v = [...(prev.variante || [prev.descriere])]; v[variantaActiva] = e.target.value; return { ...prev, variante: v, descriere: v[0] }; })} rows={10} style={{ fontSize: '0.88rem', resize: 'vertical' }} />
              {generated.hashtags && (
                <div style={{ marginTop: '0.75rem', padding: '0.65rem', background: 'var(--bg-input)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--accent-blue)', wordBreak: 'break-word' }}>
                  {generated.hashtags}
                </div>
              )}
            </div>

            {/* Acțiuni */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={handleSave} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: saved ? 'var(--accent-green)' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                {saved ? '✅ Salvat!' : '💾 Salvează ca draft'}
              </button>

              {isAdmin && (
                <>
                  <button onClick={handlePublish} disabled={publishing} style={{ padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1877F2, #0C5DC7)', color: '#fff', cursor: publishing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                    {publishing ? '⏳ Se publică...' : '📘 Publică pe Facebook acum'}
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="form-input" style={{ flex: 1, fontSize: '0.82rem' }} />
                    <button onClick={handleSchedule} disabled={scheduling || !scheduledAt} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {scheduling ? '⏳...' : '📅 Programează'}
                    </button>
                  </div>
                </>
              )}

              {publishResult && (
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: publishResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${publishResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: publishResult.success ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {publishResult.message}
                </div>
              )}

              {scheduleResult && (
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: scheduleResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${scheduleResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: scheduleResult.success ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {scheduleResult.message}
                </div>
              )}
            </div>

            <button onClick={() => { setStep(2); setGenerated(null); setPublishResult(null); setScheduleResult(null); }} style={{ padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>
              ← Înapoi la editare
            </button>
          </div>

          {/* Dreapta — preview imagine */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <button onClick={downloadImage} style={{ padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--gold-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              ⬇️ Descarcă imaginea (JPG)
            </button>
          </div>
        </div>
      )}

      {/* ReelGenerator */}
    {isAdmin && <ReelSection />}
    </div>
  );
};




export default GeneratePage;
