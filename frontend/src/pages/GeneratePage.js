import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

const DEFAULT_TEMPLATES = [
  { id: 'v_apus1', name: 'Apus dramatic', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop&q=60', categorie: 'apus' },
  { id: 'v_munte1', name: 'Munte maiestuos', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=500&fit=crop&q=60', categorie: 'munte' },
  { id: 'v_padure1', name: 'Pădure luminoasă', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=500&fit=crop&q=60', categorie: 'padure' },
  { id: 'v_mare1', name: 'Mare liniștită', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=500&fit=crop&q=60', categorie: 'apa' },
  { id: 'v_cer1', name: 'Cer înstelat', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=500&fit=crop&q=60', categorie: 'cer' },
  { id: 'v_sp1', name: 'Cruce la apus', url: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=400&h=500&fit=crop&q=60', categorie: 'spiritual' },
  { id: 'v_sp2', name: 'Biblie deschisă', url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=500&fit=crop&q=60', categorie: 'spiritual' },
  { id: 'v_min1', name: 'Abstract dark', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=500&fit=crop&q=60', categorie: 'minimalist' },
  { id: 'v_flori1', name: 'Câmp cu flori', url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=400&h=500&fit=crop&q=60', categorie: 'flori' },
  { id: 'v_dim1', name: 'Dimineață de aur', url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1080&h=1350&fit=crop&q=80', thumbnail: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=500&fit=crop&q=60', categorie: 'dimineata' },
];

const CATEGORII = [
  { id: 'all', label: '📋 Toate' },
  { id: 'apus', label: '🌅 Apusuri' },
  { id: 'munte', label: '🏔️ Munți' },
  { id: 'padure', label: '🌲 Păduri' },
  { id: 'apa', label: '🌊 Ape' },
  { id: 'cer', label: '⭐ Cer' },
  { id: 'flori', label: '🌸 Flori' },
  { id: 'spiritual', label: '✝️ Spiritual' },
  { id: 'minimalist', label: '🖤 Minimalist' },
  { id: 'dimineata', label: '🌄 Dimineață' },
  { id: 'natura', label: '🌿 Natură' },
  { id: 'custom', label: '📁 Ale mele' },
];

const FONTURI = [
  { group: 'Elegante', opts: ['Playfair Display', 'Cinzel', 'Cormorant Garamond', 'EB Garamond', 'Libre Baskerville'] },
  { group: 'Romantice', opts: ['Great Vibes', 'Dancing Script'] },
  { group: 'Clasice', opts: ['Lora', 'Merriweather', 'Georgia', 'Times New Roman'] },
  { group: 'Moderne', opts: ['Inter', 'Arial'] },
];

const GeneratePage = () => {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState({ builtIn: DEFAULT_TEMPLATES, uploadate: [] });
  const [templateSelectat, setTemplateSelectat] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tema, setTema] = useState('dragoste');
  const [platform, setPlatform] = useState('facebook');
  const [versetSelectat, setVersetSelectat] = useState(null);
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
  const [generatedImageBase64, setGeneratedImageBase64] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [stilText, setStilText] = useState({
    fontSize: 26, culoare: '#FFFFFF', pozitie: 'center',
    umbra: true, font: 'Playfair Display'
  });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // ═══ EFFECTS ═══
  useEffect(() => {
    fetchTemplates();
    fetchTeme();
  }, []);

  useEffect(() => {
    if (templateSelectat && versetSelectat) {
      renderCanvas();
    }
  }, [templateSelectat, versetSelectat, stilText, platform, step]);

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

  // ═══ GENERATE ═══
  const handleGenerate = async () => {
    setGenerating(true);
    setGenerated(null);
    setVariantaActiva(0);
    setPublishResult(null);
    setScheduleResult(null);
    try {
      const r = await axios.post(`${API}/api/generate`, {
        tema, platform,
        versetCustom: versetSelectat || null
      });
      if (r.data.success) {
        setGenerated(r.data);
        if (!versetSelectat) setVersetSelectat(r.data.verset);
        setStep(3);
      }
    } catch (e) {
      alert('Eroare: ' + (e.response?.data?.error || e.message));
    } finally { setGenerating(false); }
  };

  // ═══ SAVE ═══
  const handleSave = async () => {
    if (!generated) return;
    try {
      await axios.post(`${API}/api/posts`, {
        content: generated.variante?.[variantaActiva] || generated.descriere,
        hashtags: generated.hashtags,
        platform, tema,
        verset: generated.verset,
        status: 'draft'
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert('Eroare salvare!'); }
  };

  // ═══ PUBLISH ═══
  const handlePublish = async () => {
    if (!generated) return;
    if (!window.confirm('Publici pe Facebook?')) return;
    setPublishing(true);
    setPublishResult(null);
    try {
      const descriere = generated.variante?.[variantaActiva] || generated.descriere;
      const r = await axios.post(`${API}/api/social/publish-direct`, {
        content: descriere,
        hashtags: generated.hashtags,
        imageBase64: generatedImageBase64 || null,
        imageUrl: (!generatedImageBase64 && templateSelectat?.url) ? templateSelectat.url : null,
        platform: 'facebook'
      });
      if (r.data.success) {
        setPublishResult({ success: true, message: '✅ Publicat pe Facebook!' });
      }
    } catch (e) {
      setPublishResult({
        success: false,
        message: '❌ ' + (e.response?.data?.error || e.message)
      });
    } finally { setPublishing(false); }
  };

  // ═══ SCHEDULE ═══
  {/* În handleSchedule, înainte de axios.post */}
const handleSchedule = async () => {
  if (!generated) { alert('Generează mai întâi!'); return; }
  if (!scheduledAt) { alert('Alege data și ora!'); return; }

  setScheduling(true);
  setScheduleResult(null);

  try {
    const descriere = generated.variante?.[variantaActiva] || generated.descriere;

    // ✅ Trimitem direct datetime-ul local - browserul îl convertește automat la UTC
    const r = await axios.post(`${API}/api/social/schedule`, {
      content: descriere,
      hashtags: generated.hashtags,
      imageBase64: generatedImageBase64 || null,
      imageUrl: (!generatedImageBase64 && templateSelectat?.url) ? templateSelectat.url : null,
      platform: 'facebook',
      scheduledDate: new Date(scheduledAt).toISOString(), // ✅ Convertit corect la UTC
      tema,
      verset: generated.verset
    });

    if (r.data.success) {
      setScheduleResult({ success: true, message: r.data.message });
    }
  } catch (e) {
    setScheduleResult({
      success: false,
      message: '❌ ' + (e.response?.data?.error || e.message)
    });
  } finally { setScheduling(false); }
};
  
  

  // ═══ CANVAS ═══
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !templateSelectat || !versetSelectat) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = templateSelectat.url || templateSelectat.thumbnail;

    img.onload = () => {
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

      // Overlay
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(0,0,0,0.05)');
      grad.addColorStop(0.25, 'rgba(0,0,0,0.2)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
      grad.addColorStop(0.75, 'rgba(0,0,0,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const sc = W / 1080;
      const fz = Math.round(stilText.fontSize * 2 * sc);

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
      const ref = versetSelectat.referintaCompleta || versetSelectat.referinta;
      const raw = `\u201C${versetSelectat.text}\u201D`;
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
      else if (stilText.pozitie === 'bottom') startY = H - th - H * 0.25;
      else startY = (H - th) / 2 - 30;

      // Linie decorativă
      ctx.strokeStyle = 'rgba(212,175,55,0.6)';
      ctx.lineWidth = 2 * sc;
      const lineW = 70 * sc;
      ctx.beginPath();
      ctx.moveTo(W / 2 - lineW, startY - 35 * sc);
      ctx.lineTo(W / 2 + lineW, startY - 35 * sc);
      ctx.stroke();

      dl.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lh));

      ctx.beginPath();
      ctx.moveTo(W / 2 - lineW, startY + th + 15 * sc);
      ctx.lineTo(W / 2 + lineW, startY + th + 15 * sc);
      ctx.stroke();

      // Referinta
      ctx.shadowBlur = 12 * sc;
      ctx.font = `bold ${Math.round(fz * 0.48)}px '${stilText.font}', Georgia, serif`;
      ctx.fillStyle = '#D4AF37';
      ctx.fillText(`\u2014 ${ref}`, W / 2, startY + th + 55 * sc);

      // Logo
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = '/logo.png';

      logo.onload = () => {
        const logoH = 95 * sc;
        const logoW = logoH;
        const logoX = W / 2 - logoW / 2;
        const logoY = H - logoH - 85 * sc;

        ctx.beginPath();
        ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 7 * sc, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 7 * sc, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212,175,55,0.7)';
        ctx.lineWidth = 2.5 * sc;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, logoY + logoH / 2, logoH / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, logoX, logoY, logoW, logoH);
        ctx.restore();

        const wmFz = Math.round(fz * 0.38);
        ctx.font = `700 ${wmFz}px Inter, Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.textAlign = 'center';
        ctx.fillText('Popas pentru Suflet', W / 2, logoY + logoH + 36 * sc);

        saveCanvasImage();
      };

      logo.onerror = () => {
        const wmFz = Math.round(fz * 0.42);
        ctx.font = `700 ${wmFz}px Inter, Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('Popas pentru Suflet', W / 2, H - 45 * sc);

        saveCanvasImage();
      };
    };

    img.onerror = () => console.error('Eroare încărcare imagine');
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

  // ═══ COMPUTED ═══
  const allTemplates = [
    ...(templates.builtIn || []),
    ...(templates.uploadate || [])
  ].filter(t => {
    if (categorieFiltre === 'all') return true;
    if (categorieFiltre === 'custom') return t.custom;
    return t.categorie === categorieFiltre;
  });

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="animate-in">

      {/* ═══ STEPS BAR ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', marginBottom: '1.5rem',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
        padding: '0.5rem', border: '1px solid var(--border-subtle)',
        overflowX: 'auto'
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
              cursor: step > s.nr ? 'pointer' : 'default', transition: 'var(--transition)',
              minWidth: 'fit-content'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: step > s.nr ? 'var(--accent-green)' : step === s.nr ? 'var(--gold-primary)' : 'var(--bg-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
                color: step >= s.nr ? '#000' : 'var(--text-muted)'
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

      {/* Canvas ascuns - mereu prezent */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ═══ STEP 1 ═══ */}
      {step === 1 && (
        <div className="card card-gold animate-in">
          <div className="card-header">
            <div className="card-title"><span className="icon">🖼️</span> Alege Imaginea</div>
            <div>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                accept="image/*" onChange={e => handleUpload(e.target.files[0])} />
              <button className="btn btn-gold btn-sm"
                onClick={() => fileInputRef.current.click()} disabled={uploading}>
                {uploading ? '⏳...' : '⬆️ Upload'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
            {CATEGORII.map(c => (
              <button key={c.id} onClick={() => setCategorieFiltre(c.id)} style={{
                padding: '0.3rem 0.7rem', borderRadius: 20,
                border: `1px solid ${categorieFiltre === c.id ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                background: categorieFiltre === c.id ? 'rgba(212,175,55,0.1)' : 'var(--bg-input)',
                color: categorieFiltre === c.id ? 'var(--gold-primary)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500
              }}>{c.label}</button>
            ))}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            📐 Imagine verticală <strong>1080×1350</strong> — ideal pentru Facebook, Instagram, TikTok
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem'
          }}>
            <div onClick={() => fileInputRef.current.click()} style={{
              aspectRatio: '4/5', borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border-color)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', background: 'var(--bg-input)',
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontSize: '2rem' }}>⬆️</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>Upload</div>
            </div>

            {allTemplates.map(t => (
              <div key={t.id} onClick={() => { setTemplateSelectat(t); setPreviewUrl(null); setStep(2); }} style={{
                position: 'relative', aspectRatio: '4/5',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer',
                border: templateSelectat?.id === t.id ? '3px solid var(--gold-primary)' : '2px solid var(--border-subtle)',
                boxShadow: templateSelectat?.id === t.id ? 'var(--shadow-gold)' : 'none'
              }}>
                <img src={t.thumbnail} alt={t.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent 50%)',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', padding: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'white' }}>{t.name}</div>
                </div>
                {templateSelectat?.id === t.id && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6, width: 24, height: 24,
                    background: 'var(--gold-primary)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: '#000'
                  }}>✓</div>
                )}
                {t.custom && (
                  <button onClick={e => { e.stopPropagation(); handleDeleteTemplate(t.id); }} style={{
                    position: 'absolute', top: 6, left: 6, width: 22, height: 22,
                    background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '50%',
                    color: 'white', cursor: 'pointer', fontSize: '0.65rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>✕</button>
                )}
              </div>
            ))}
          </div>
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
                      setVersetSelectat({
                        text: v.text, referinta: v.referinta,
                        referintaCompleta: `${v.carte} ${v.capitol}:${v.verset}`
                      });
                      setVerseteGasite([]); setVersetSearch('');
                    }} style={{
                      padding: '0.65rem', marginBottom: '0.35rem', background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                      cursor: 'pointer'
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
                    letterSpacing: 2, fontWeight: 700, marginBottom: '0.4rem' }}>✅ Selectat</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.88rem', fontStyle: 'italic',
                    color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    "{versetSelectat.text.substring(0, 120)}{versetSelectat.text.length > 120 ? '...' : ''}"
                  </div>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    — {versetSelectat.referintaCompleta || versetSelectat.referinta}
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}
                    onClick={() => { setVersetSelectat(null); setPreviewUrl(null); setGeneratedImageBase64(null); }}>
                    ✕ Schimbă
                  </button>
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
                {[{ id: 'facebook', l: '📘 Facebook' }, { id: 'instagram', l: '📸 Instagram' }, { id: 'tiktok', l: '🎵 TikTok' }].map(p => (
                  <button key={p.id} className={`tab ${platform === p.id ? 'active' : ''}`}
                    onClick={() => setPlatform(p.id)}>{p.l}</button>
                ))}
              </div>
              <button className="btn btn-gold btn-lg btn-block" onClick={handleGenerate} disabled={generating}>
                {generating ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Se generează...</> : '✨ Generează Descriere & Hashtags'}
              </button>
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
                <img src={previewUrl} alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : templateSelectat ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img src={templateSelectat.thumbnail} alt="Template"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {!versetSelectat && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.88rem', textAlign: 'center', padding: '1rem'
                    }}>
                      📖 Selectează un verset<br />pentru preview complet
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)' }}>
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

                {versetSelectat && (
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

            <div className="verse-card">
              <div style={{ fontSize: '0.62rem', color: 'var(--gold-primary)', textTransform: 'uppercase',
                letterSpacing: 2, fontWeight: 700, marginBottom: '0.4rem' }}>📖 Verset</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.88rem', fontStyle: 'italic',
                color: 'var(--text-primary)', lineHeight: 1.6 }}>
                "{generated.verset?.text?.substring(0, 150)}{generated.verset?.text?.length > 150 ? '...' : ''}"
              </div>
              <div style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: '0.8rem', marginTop: '0.35rem' }}>
                — {generated.verset?.referintaCompleta || generated.verset?.referinta}
              </div>
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

            {/* Rezultate */}
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

            {/* Acțiuni */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button className="btn btn-gold" onClick={handleSave} disabled={saved}>
                {saved ? '✅ Salvat!' : '💾 Salvează'}
              </button>
              <button className="btn btn-outline" onClick={downloadImage}>⬇️ PNG</button>
              <button onClick={handlePublish} disabled={publishing} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 600,
                background: publishing ? 'rgba(24,119,242,0.5)' : 'linear-gradient(135deg,#1877F2,#0C5DC7)',
                color: 'white', boxShadow: '0 4px 15px rgba(24,119,242,0.3)'
              }}>
                {publishing ? '⏳...' : '📘 Facebook Acum'}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setStep(1); setGenerated(null); setVersetSelectat(null);
                setPublishResult(null); setScheduleResult(null);
                setGeneratedImageBase64(null); setPreviewUrl(null);
              }}>🔄 Nouă</button>
            </div>

            {/* Programare */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><span className="icon">📅</span> Programare Automată</div>
              </div>
              <div className="form-group">
                <label className="form-label">Data și ora (ora României):</label>
                <input type="datetime-local" className="form-input"
                  value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
              </div>
              <button className="btn btn-gold btn-block" onClick={handleSchedule} disabled={scheduling}>
                {scheduling ? '⏳ Se programează...' : '📅 Programează pe Facebook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratePage;