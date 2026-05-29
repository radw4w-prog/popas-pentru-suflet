'use client';



// frontend/src/pages/DevotionalPage.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_TEMPLATES } from '../data/templates';
import { uploadOgImage } from '../services/ogImageService';

const APP_URL = 'https://popas-pentru-suflet.vercel.app';
const APP_NAME = 'Popas pentru Suflet';

const FONTURI = [
  { group: 'Elegante', opts: ['Playfair Display', 'Cinzel', 'Cormorant Garamond', 'EB Garamond'] },
  { group: 'Romantice', opts: ['Great Vibes', 'Dancing Script'] },
  { group: 'Clasice', opts: ['Lora', 'Merriweather', 'Georgia', 'Times New Roman'] },
  { group: 'Moderne', opts: ['Inter', 'Arial'] },
];

const templateAleatoriu = () =>
  DEFAULT_TEMPLATES[Math.floor(Math.random() * DEFAULT_TEMPLATES.length)];

export default function DevotionalPage() {
  const { isAuthenticated } = useAuth();

  // Date devotional
  const [loading, setLoading] = useState(true);
  const [devotional, setDevotional] = useState(null);
  const [error, setError] = useState('');

  // Canvas / imagine
  const [template, setTemplate] = useState(null);
  const [imagine, setImagine] = useState(null);
  const [generandImagine, setGenerandImagine] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [categorieFiltre, setCategorieFiltre] = useState('all');

  // ═══════════════════════════════════════
  // TEXTURI EDITABILE PENTRU IMAGINE
  // ═══════════════════════════════════════
  const [editedVerseText, setEditedVerseText] = useState('');
  const [editedThoughtText, setEditedThoughtText] = useState('');

  // Stiluri text
  const [stilText, setStilText] = useState({
    fontSize: 28,
    culoare: '#FFFFFF',
    pozitie: 'center',
    umbra: true,
    font: 'Playfair Display'
  });

  // Share
  const [copied, setCopied] = useState('');

  // Refs
  const loadedLogoRef = useRef(null);
  const loadedImgRef = useRef(null);

  // Preload logo
  useEffect(() => {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/logo.png';
    logo.onload = () => { loadedLogoRef.current = logo; };
    logo.onerror = () => { loadedLogoRef.current = null; };
  }, []);

  // Init template
  useEffect(() => {
    setTemplate(templateAleatoriu());
  }, []);

  // Load devotional
  useEffect(() => {
    loadDevotional();
  }, []);

  // ── Sincronizează textele editate când se încarcă devoționalul ──
  useEffect(() => {
    if (devotional) {
      setEditedVerseText(devotional.verseText || '');
      setEditedThoughtText(devotional.thoughtOfTheDay || '');
    }
  }, [devotional]);

  const loadDevotional = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/devotionals/today');
      setDevotional(res.data.data);

      if (isAuthenticated) {
        api.post('/api/devotionals/viewed').catch(() => {});
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Nu am putut încărca devoționalul.');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════
  // GENERARE IMAGINE CANVAS
  // ═══════════════════════════════════════
  const genereazaImagine = useCallback(async (tplOverride = null, stilOverride = null) => {
    if (!devotional) return null;
    setGenerandImagine(true);
    setImagine(null);

    const tpl = tplOverride || template || templateAleatoriu();
    const stil = stilOverride || stilText;

    // ── Folosește textele editate dacă există, altfel originalele ──
    const versetFinal = editedVerseText?.trim() || devotional.verseText || '';
    const gandFinal = editedThoughtText?.trim() || devotional.thoughtOfTheDay || '';

    return new Promise((resolve) => {
      const useExisting = loadedImgRef.current?._src === (tpl.url || tpl.thumbnail);

      const draw = (img) => {
        try {
          const canvas = document.createElement('canvas');
          const W = 1080;
          const H = 1350;
          canvas.width = W;
          canvas.height = H;
          const ctx = canvas.getContext('2d');

          // Cover crop
          const imgR = img.width / img.height;
          const canR = W / H;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (imgR > canR) { sw = img.height * canR; sx = (img.width - sw) / 2; }
          else { sh = img.width / canR; sy = (img.height - sh) / 2; }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

          // Gradient overlay
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'rgba(0,0,0,0.08)');
          grad.addColorStop(0.25, 'rgba(0,0,0,0.3)');
          grad.addColorStop(0.5, 'rgba(0,0,0,0.52)');
          grad.addColorStop(0.75, 'rgba(0,0,0,0.7)');
          grad.addColorStop(1, 'rgba(0,0,0,0.85)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // Watermark repetat
          ctx.save();
          ctx.globalAlpha = 0.04;
          ctx.font = '700 28px Inter, Arial, sans-serif';
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

          const fz = Math.round(stil.fontSize * 2);
          const lh = fz * 1.5;
          const maxW = W * 0.82;

          const setShadow = (blur = 20) => {
            if (stil.umbra) {
              ctx.shadowColor = 'rgba(0,0,0,0.9)';
              ctx.shadowBlur = blur;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 3;
            }
          };

          const clearShadow = () => {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          };

          const getLines = (text, maxWidth, maxL = 8) => {
            const words = text.split(' ');
            const lines = [];
            let cur = '';
            for (const w of words) {
              const t = cur + w + ' ';
              if (ctx.measureText(t).width > maxWidth && cur) {
                lines.push(cur.trim());
                cur = w + ' ';
                if (lines.length >= maxL - 1) break;
              } else { cur = t; }
            }
            lines.push(cur.trim());
            return lines.slice(0, maxL);
          };

          const drawSep = (y, width = 160, opacity = 0.5) => {
            const sg = ctx.createLinearGradient(W / 2 - width, 0, W / 2 + width, 0);
            sg.addColorStop(0, 'transparent');
            sg.addColorStop(0.3, `rgba(212,175,55,${opacity})`);
            sg.addColorStop(0.7, `rgba(212,175,55,${opacity})`);
            sg.addColorStop(1, 'transparent');
            ctx.strokeStyle = sg;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(W / 2 - width, y);
            ctx.lineTo(W / 2 + width, y);
            ctx.stroke();
          };

          // ── TITLU ──
          ctx.font = `600 ${Math.round(fz * 0.58)}px Inter, Arial, sans-serif`;
          ctx.fillStyle = '#D4AF37';
          ctx.textAlign = 'center';
          setShadow(15);

          const titluLines = getLines(devotional.title || '', maxW, 2);
          let currentY = 105;
          titluLines.forEach(line => {
            ctx.fillText(line, W / 2, currentY);
            currentY += Math.round(fz * 0.68);
          });
          const afterTitlu = currentY + 15;

          clearShadow();
          drawSep(afterTitlu);

          // ── VERSET (cu text editat) ──
          ctx.font = `italic ${fz}px '${stil.font}', Georgia, serif`;
          ctx.fillStyle = stil.culoare;
          ctx.textAlign = 'center';
          setShadow(25);

          const versetText = `\u201C${versetFinal}\u201D`;
          const versetLines = getLines(versetText, maxW, 7);
          const versetH = versetLines.length * lh;

          let versetStartY;
          if (stil.pozitie === 'top') versetStartY = afterTitlu + 60;
          else if (stil.pozitie === 'bottom') versetStartY = H - versetH - 340;
          else versetStartY = Math.max(afterTitlu + 60, (H - versetH) / 2 - 80);

          clearShadow();
          ctx.strokeStyle = 'rgba(212,175,55,0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(W / 2 - 80, versetStartY - 28);
          ctx.lineTo(W / 2 + 80, versetStartY - 28);
          ctx.stroke();

          // Ghilimele decorative
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.font = 'bold 140px Georgia, serif';
          ctx.fillStyle = '#D4AF37';
          ctx.textAlign = 'left';
          ctx.fillText('\u201C', 45, versetStartY + 60);
          ctx.restore();

          setShadow(25);
          ctx.font = `italic ${fz}px '${stil.font}', Georgia, serif`;
          ctx.fillStyle = stil.culoare;
          ctx.textAlign = 'center';
          versetLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, versetStartY + i * lh);
          });

          const afterVerset = versetStartY + versetH;

          clearShadow();
          ctx.beginPath();
          ctx.moveTo(W / 2 - 80, afterVerset + 14);
          ctx.lineTo(W / 2 + 80, afterVerset + 14);
          ctx.stroke();

          // ── REFERINȚĂ ──
          setShadow(12);
          ctx.font = `bold ${Math.round(fz * 0.46)}px '${stil.font}', Georgia, serif`;
          ctx.fillStyle = '#D4AF37';
          ctx.textAlign = 'center';
          ctx.fillText(`\u2014 ${devotional.verseReference}`, W / 2, afterVerset + 54);

          // ── GÂNDUL ZILEI (cu text editat) ──
          const gandY = afterVerset + 108;
          clearShadow();
          drawSep(gandY, 120, 0.3);

          ctx.font = `500 ${Math.round(fz * 0.36)}px Inter, Arial, sans-serif`;
          ctx.fillStyle = 'rgba(167,139,250,0.9)';
          ctx.textAlign = 'center';
          setShadow(10);
          ctx.fillText('✦ Gândul zilei ✦', W / 2, gandY + 32);

          ctx.font = `italic ${Math.round(fz * 0.42)}px Georgia, serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          setShadow(12);
          const gandLines = getLines(gandFinal, maxW, 4);
          gandLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, gandY + 72 + i * Math.round(fz * 0.54));
          });

          // ── LOGO / BRANDING ──
          clearShadow();
          const logo = loadedLogoRef.current;
          const wmY = H - 158;

          if (logo) {
            const logoH = 70;
            const logoX = W / 2 - 35;
            const logoY = wmY;

            ctx.save();
            ctx.globalAlpha = 0.15;
            const glowGrad = ctx.createRadialGradient(W / 2, logoY + logoH / 2, logoH / 2, W / 2, logoY + logoH / 2, logoH / 2 + 28);
            glowGrad.addColorStop(0, 'rgba(212,175,55,0.4)');
            glowGrad.addColorStop(1, 'rgba(212,175,55,0)');
            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 28, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();
            ctx.restore();

            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(212,175,55,0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.save();
            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logo, logoX, logoY, logoH, logoH);
            ctx.restore();

            ctx.globalAlpha = 0.75;
            ctx.font = '600 24px Inter, Arial, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(APP_NAME, W / 2, logoY + logoH + 30);

            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 100, logoY + logoH + 42);
            ctx.lineTo(W / 2 + 100, logoY + logoH + 42);
            ctx.stroke();
            ctx.globalAlpha = 1;
          } else {
            ctx.globalAlpha = 0.65;
            ctx.font = '700 28px Inter, Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.textAlign = 'center';
            ctx.fillText(`🕊️ ${APP_NAME}`, W / 2, H - 55);
            ctx.globalAlpha = 1;
          }

          // Colțuri anti-decupare
          ctx.save();
          ctx.globalAlpha = 0.05;
          ctx.font = '600 16px Inter, Arial, sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'left';
          ctx.fillText('popaspentrusuflet.ro', 15, 25);
          ctx.textAlign = 'right';
          ctx.fillText('popaspentrusuflet.ro', W - 15, 25);
          ctx.textAlign = 'left';
          ctx.fillText('popaspentrusuflet.ro', 15, H - 12);
          ctx.textAlign = 'right';
          ctx.fillText('popaspentrusuflet.ro', W - 15, H - 12);
          ctx.restore();

          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setImagine(dataUrl);
          setGenerandImagine(false);
          resolve(dataUrl);

        } catch (e) {
          console.error('Eroare canvas:', e);
          setGenerandImagine(false);
          resolve(null);
        }
      };

      if (useExisting && loadedImgRef.current) {
        draw(loadedImgRef.current);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      const src = tpl.url || tpl.thumbnail;
      img._src = src;
      img.src = src;
      img.onload = () => {
        loadedImgRef.current = img;
        draw(img);
      };
      img.onerror = () => {
        console.error('Eroare imagine template');
        setGenerandImagine(false);
        resolve(null);
      };
    });
  }, [devotional, template, stilText, editedVerseText, editedThoughtText]);

  // Auto-generează imaginea când devoționalul e gata
  useEffect(() => {
    if (devotional && template) {
      genereazaImagine();
    }
  }, [devotional, template]);
  
  
  useEffect(() => {
  if (imagine && devotional) {
    // Trimite silențios la backend ca OG Image — o dată pe zi
    uploadOgImage(imagine);
  }
}, [imagine]);

  // Regenerează când se schimbă stilul
  useEffect(() => {
    if (devotional && template && imagine) {
      const t = setTimeout(() => genereazaImagine(), 300);
      return () => clearTimeout(t);
    }
  }, [stilText]);

  // ═══════════════════════════════════════
  // SHARE ACTIONS
  // ═══════════════════════════════════════
  const getShareText = () =>
    `🕊️ ${devotional?.title}\n\n„${devotional?.verseText}"\n— ${devotional?.verseReference}\n\n✦ ${devotional?.thoughtOfTheDay}\n\n📖 ${APP_URL}/devotional`;

  const handleShareNativ = async () => {
    if (!navigator.share) { handleCopyText(); return; }
    try {
      let img = imagine;
      if (!img) img = await genereazaImagine();

      if (img) {
        try {
          const blob = await fetch(img).then(r => r.blob());
          const file = new File([blob], `devotional-${new Date().toISOString().split('T')[0]}.jpg`, { type: 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ title: devotional.title, text: getShareText(), files: [file] });
            return;
          }
        } catch (e) {}
      }

      await navigator.share({ title: devotional.title, text: getShareText(), url: `${APP_URL}/devotional` });
    } catch (e) {
      if (e.name !== 'AbortError') handleCopyText();
    }
  };

  const handleDownload = async () => {
    let img = imagine;
    if (!img) img = await genereazaImagine();
    if (!img) return;
    const link = document.createElement('a');
    link.download = `devotional-${new Date().toISOString().split('T')[0]}.jpg`;
    link.href = img;
    link.click();
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied('text');
      setTimeout(() => setCopied(''), 2500);
    } catch (e) {}
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `🕊️ *${devotional?.title}*\n\n_„${devotional?.verseText}"_\n— ${devotional?.verseReference}\n\n✦ _${devotional?.thoughtOfTheDay}_\n\n📖 ${APP_URL}/devotional`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(`${APP_URL}/devotional`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  // ── RESET textele editate la originale ──
  const handleResetTexte = () => {
    if (devotional) {
      setEditedVerseText(devotional.verseText || '');
      setEditedThoughtText(devotional.thoughtOfTheDay || '');
    }
  };

  // Template selector
  const CATEGORII = [
    { id: 'all', label: '📋 Toate' },
    { id: 'apus', label: '🌅 Apusuri' },
    { id: 'rasarit', label: '🌄 Răsărituri' },
    { id: 'cer', label: '☁️ Cer' },
    { id: 'munte', label: '🏔️ Munți' },
    { id: 'padure', label: '🌲 Păduri' },
    { id: 'mare', label: '🌊 Mare' },
    { id: 'spiritual', label: '✝️ Spiritual' },
    { id: 'flori', label: '🌸 Flori' },
    { id: 'minimalist', label: '🖤 Minimalist' },
    { id: 'iarna', label: '❄️ Iarnă' },
  ];

  const templatesFiltrate = categorieFiltre === 'all'
    ? DEFAULT_TEMPLATES
    : DEFAULT_TEMPLATES.filter(t => t.categorie === categorieFiltre);

  // ═══════════════════════════════════════
  // DATA
  // ═══════════════════════════════════════
  const azi = new Date().toLocaleDateString('ro-RO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  if (loading) {
    return (
      <div className="dev-loading">
        <div className="dev-loading-icon">🙏</div>
        <div className="dev-loading-text">Se încarcă devoționalul zilei...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dev-error">
        <div className="dev-error-icon">😔</div>
        <h2 className="dev-error-title">Devoțional zilnic</h2>
        <p className="dev-error-text">{error}</p>
        <button className="dev-error-btn" onClick={loadDevotional}>🔄 Reîncearcă</button>
      </div>
    );
  }

  if (!devotional) return null;

  return (
    <div className="dev-page">

      {/* ═══ HERO CU IMAGINE ═══ */}
      <div className="dev-hero-img-wrap">

        {/* Imagine generată */}
        <div className="dev-hero-canvas">
          {generandImagine && (
            <div className="dev-canvas-loading">
              <div className="dev-canvas-loading-icon">🎨</div>
              <div className="dev-canvas-loading-text">Se generează imaginea...</div>
            </div>
          )}

          {imagine && !generandImagine && (
            <img
              src={imagine}
              alt={devotional.title}
              className="dev-canvas-img"
            />
          )}

          {!imagine && !generandImagine && (
            <div className="dev-canvas-placeholder">
              <div>🖼️</div>
              <button
                className="dev-canvas-gen-btn"
                onClick={() => genereazaImagine()}
              >
                ✨ Generează imaginea
              </button>
            </div>
          )}
        </div>

        {/* Butoane imagine */}
        {imagine && (
          <div className="dev-img-actions">
            <button
              className="dev-img-btn"
              onClick={() => setShowEditor(prev => !prev)}
            >
              🎨 {showEditor ? 'Închide editor' : 'Editează'}
            </button>
            <button
              className="dev-img-btn"
              onClick={() => {
                setTemplate(templateAleatoriu());
                setImagine(null);
                loadedImgRef.current = null;
              }}
            >
              🎲 Alt fundal
            </button>
            <button
              className="dev-img-btn"
              onClick={() => setShowTemplateSelector(prev => !prev)}
            >
              🖼️ Alege fundal
            </button>
            <button className="dev-img-btn dev-img-btn-dl" onClick={handleDownload}>
              ⬇️ Descarcă
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* ═══ EDITOR COMPLET CU TEXTURI EDITABILE ═══ */}
        {/* ═══════════════════════════════════════ */}
        {showEditor && (
          <div className="dev-editor">
            <div className="dev-editor-title">🎨 Personalizează imaginea</div>

            {/* ── Secțiune texturi editabile ── */}
            <div className="dev-editor-section">
              <div className="dev-editor-section-title">
                ✏️ Texte din imagine
              </div>

              {/* Verset editabil */}
              <div className="dev-editor-item">
                <label className="dev-editor-label">
                  📜 Versetul din imagine
                  <span className="dev-editor-label-hint">
                    ({editedVerseText.length} caractere)
                  </span>
                </label>
                <textarea
                  className="dev-editor-textarea"
                  value={editedVerseText}
                  onChange={e => setEditedVerseText(e.target.value)}
                  rows={3}
                  placeholder="Editează textul versetului care apare pe imagine..."
                />
                <div className="dev-editor-preview-text">
                  „{editedVerseText.length > 120
                    ? editedVerseText.substring(0, 120) + '...'
                    : editedVerseText}"
                </div>
              </div>

              {/* Gândul zilei editabil */}
              <div className="dev-editor-item">
                <label className="dev-editor-label">
                  ✨ Gândul zilei din imagine
                  <span className="dev-editor-label-hint">
                    ({editedThoughtText.length} caractere)
                  </span>
                </label>
                <textarea
                  className="dev-editor-textarea"
                  value={editedThoughtText}
                  onChange={e => setEditedThoughtText(e.target.value)}
                  rows={3}
                  placeholder="Editează gândul zilei care apare pe imagine..."
                />
                <div className="dev-editor-preview-text">
                  ✦ {editedThoughtText.length > 100
                    ? editedThoughtText.substring(0, 100) + '...'
                    : editedThoughtText}
                </div>
              </div>

              {/* Butoane reset */}
              <div className="dev-editor-reset-row">
                <button
                  className="dev-editor-reset-btn"
                  onClick={handleResetTexte}
                >
                  ↩️ Resetează textele la original
                </button>
                <button
                  className="dev-editor-gen-btn"
                  onClick={() => genereazaImagine()}
                  disabled={generandImagine}
                >
                  {generandImagine ? '⏳ Se generează...' : '🔄 Generează cu textele editate'}
                </button>
              </div>
            </div>

            <div className="dev-editor-divider" />

            {/* ── Secțiune stil ── */}
            <div className="dev-editor-section">
              <div className="dev-editor-section-title">
                🎨 Stil vizual
              </div>

              <div className="dev-editor-grid">
                {/* Font size */}
                <div className="dev-editor-item">
                  <label className="dev-editor-label">
                    Mărime text: {stilText.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="44"
                    step="2"
                    value={stilText.fontSize}
                    onChange={e => setStilText(p => ({ ...p, fontSize: +e.target.value }))}
                    className="dev-editor-slider"
                  />
                </div>

                {/* Poziție */}
                <div className="dev-editor-item">
                  <label className="dev-editor-label">Poziție text</label>
                  <div className="dev-editor-pozitie">
                    {[
                      { id: 'top', label: '⬆ Sus' },
                      { id: 'center', label: '↕ Centru' },
                      { id: 'bottom', label: '⬇ Jos' }
                    ].map(p => (
                      <button
                        key={p.id}
                        className={`dev-editor-poz-btn ${stilText.pozitie === p.id ? 'activ' : ''}`}
                        onClick={() => setStilText(prev => ({ ...prev, pozitie: p.id }))}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div className="dev-editor-item">
                  <label className="dev-editor-label">Font</label>
                  <select
                    className="dev-editor-select"
                    value={stilText.font}
                    onChange={e => setStilText(p => ({ ...p, font: e.target.value }))}
                  >
                    {FONTURI.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.opts.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Culoare */}
                <div className="dev-editor-item">
                  <label className="dev-editor-label">Culoare text</label>
                  <div className="dev-editor-culori">
                    {['#FFFFFF', '#F4D03F', '#FFE4E1', '#E8F5E9', '#E3F2FD', '#000000'].map(c => (
                      <div
                        key={c}
                        className={`dev-editor-culoare ${stilText.culoare === c ? 'activ' : ''}`}
                        style={{ background: c }}
                        onClick={() => setStilText(p => ({ ...p, culoare: c }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              className="dev-editor-regen-btn"
              onClick={() => genereazaImagine()}
              disabled={generandImagine}
            >
              {generandImagine ? '⏳ Se generează...' : '🔄 Actualizează imaginea'}
            </button>
          </div>
        )}

        {/* Template selector */}
        {showTemplateSelector && (
          <div className="dev-tpl-selector">
            <div className="dev-tpl-selector-header">
              <span className="dev-tpl-selector-title">🖼️ Alege fundalul</span>
              <button
                className="dev-tpl-selector-close"
                onClick={() => setShowTemplateSelector(false)}
              >✕</button>
            </div>

            <div className="dev-tpl-cats">
              {CATEGORII.map(cat => (
                <button
                  key={cat.id}
                  className={`dev-tpl-cat-btn ${categorieFiltre === cat.id ? 'activ' : ''}`}
                  onClick={() => setCategorieFiltre(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="dev-tpl-grid">
              {templatesFiltrate.map(tpl => (
                <div
                  key={tpl.id}
                  className={`dev-tpl-item ${template?.id === tpl.id ? 'selectat' : ''}`}
                  onClick={() => {
                    setTemplate(tpl);
                    setImagine(null);
                    loadedImgRef.current = null;
                    setShowTemplateSelector(false);
                    setTimeout(() => genereazaImagine(tpl), 100);
                  }}
                >
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="dev-tpl-item-img"
                    loading="lazy"
                  />
                  <div className="dev-tpl-item-overlay">{tpl.name}</div>
                  {template?.id === tpl.id && (
                    <div className="dev-tpl-item-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share butoane */}
        {imagine && (
          <div className="dev-share-row">
            <button className="dev-share-btn dev-share-nativ" onClick={handleShareNativ}>
              <span>📤</span><span>Share</span>
            </button>
            <button className="dev-share-btn dev-share-wa" onClick={handleWhatsApp}>
              <span>💬</span><span>WhatsApp</span>
            </button>
            <button className="dev-share-btn dev-share-fb" onClick={handleFacebook}>
              <span>📘</span><span>Facebook</span>
            </button>
            <button className="dev-share-btn dev-share-copy" onClick={handleCopyText}>
              <span>{copied === 'text' ? '✅' : '📋'}</span>
              <span>{copied === 'text' ? 'Copiat!' : 'Copiază'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ═══ HEADER TEXT ═══ */}
      <div className="dev-header-text">
        <div className="dev-hero-badges">
          <span className="dev-badge dev-badge-primary">🙏 Devoțional zilnic</span>
          <span className="dev-badge dev-badge-secondary">{devotional.theme}</span>
        </div>
        <h1 className="dev-hero-title">{devotional.title}</h1>
        <p className="dev-hero-date">{azi}</p>
      </div>

      {/* ═══ VERSET ═══ */}
      <div className="dev-content">
        <div className="dev-verse-card">
          <div className="dev-verse-deco-top" />
          <div className="dev-verse-quote">✦</div>
          <blockquote className="dev-verse-text">„{devotional.verseText}"</blockquote>
          <cite className="dev-verse-ref">— {devotional.verseReference}</cite>
          <div className="dev-verse-deco-bottom" />
        </div>

        {/* ═══ SECȚIUNI ═══ */}
        <div className="dev-sections">
          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-section-icon">📖</span>
              <h3 className="dev-section-title">Introducere</h3>
            </div>
            <p className="dev-section-text">{devotional.introduction}</p>
          </div>

          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-section-icon">💡</span>
              <h3 className="dev-section-title">Mesaj</h3>
            </div>
            <p className="dev-section-text">{devotional.reflection}</p>
          </div>

          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-section-icon">🎯</span>
              <h3 className="dev-section-title">Aplică astăzi</h3>
            </div>
            <p className="dev-section-text">{devotional.practicalApplication}</p>
          </div>

          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-section-icon">🙏</span>
              <h3 className="dev-section-title">Rugăciune</h3>
            </div>
            <p className="dev-section-text dev-section-text-prayer">{devotional.prayer}</p>
          </div>

          <div className="dev-section dev-section-highlight">
            <div className="dev-section-header">
              <span className="dev-section-icon">✨</span>
              <h3 className="dev-section-title">Gândul zilei</h3>
            </div>
            <p className="dev-section-text dev-section-text-highlight">
              {devotional.thoughtOfTheDay}
            </p>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="dev-footer">
          <div className="dev-footer-generated">
            <span className="dev-footer-icon">🤖</span>
            <small className="dev-footer-text">
              {devotional.generatedBy === 'ai'
                ? `Generat cu AI (${devotional.aiModel || 'llama'})`
                : 'Conținut editorial'}
            </small>
          </div>
          <div className="dev-footer-brand">🕊️ Popas pentru Suflet</div>
        </div>
      </div>
    </div>
  );
}