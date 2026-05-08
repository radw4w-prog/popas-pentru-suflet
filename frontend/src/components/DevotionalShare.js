// frontend/src/components/DevotionalShare.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DEFAULT_TEMPLATES, CATEGORII_TEMPLATES } from '../data/templates';

const APP_URL = 'https://popas-pentru-suflet.vercel.app';
const APP_NAME = 'Popas pentru Suflet';

const FONTURI = [
  { group: 'Elegante', opts: ['Playfair Display', 'Cinzel', 'Cormorant Garamond', 'EB Garamond', 'Libre Baskerville'] },
  { group: 'Romantice', opts: ['Great Vibes', 'Dancing Script'] },
  { group: 'Clasice', opts: ['Lora', 'Merriweather', 'Georgia', 'Times New Roman'] },
  { group: 'Moderne', opts: ['Inter', 'Arial'] },
];

const templateAleatoriu = () =>
  DEFAULT_TEMPLATES[Math.floor(Math.random() * DEFAULT_TEMPLATES.length)];

const DevotionalShare = ({ devotional }) => {
  const [imagineGenerata, setImagineGenerata] = useState(null);
  const [generand, setGenerand] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const [templateCurent, setTemplateCurent] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [categorieFiltre, setCategorieFiltre] = useState('all');
  const fileInputRef = useRef(null);
const [customTemplate, setCustomTemplate] = useState(null);

  // Stiluri text — identice cu GeneratePage
  const [stilText, setStilText] = useState({
    fontSize: 28,
    culoare: '#FFFFFF',
    pozitie: 'center',
    umbra: true,
    font: 'Playfair Display'
  });

  const loadedLogoRef = useRef(null);

  useEffect(() => {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/logo.png';
    logo.onload = () => { loadedLogoRef.current = logo; };
    logo.onerror = () => { loadedLogoRef.current = null; };
  }, []);

  useEffect(() => {
    setTemplateCurent(templateAleatoriu());
  }, []);

  if (!devotional) return null;

  // ═══════════════════════════════════════
  // GENERARE IMAGINE
  // ═══════════════════════════════════════
  const genereazaImagine = useCallback(async (tplOverride = null) => {
    setGenerand(true);
    setImagineGenerata(null);

    const tpl = tplOverride || templateCurent || templateAleatoriu();

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = tpl.url || tpl.thumbnail;

      img.onload = () => {
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
          grad.addColorStop(0, 'rgba(0,0,0,0.05)');
          grad.addColorStop(0.25, 'rgba(0,0,0,0.25)');
          grad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
          grad.addColorStop(0.75, 'rgba(0,0,0,0.68)');
          grad.addColorStop(1, 'rgba(0,0,0,0.85)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // Watermark repetat pe fundal
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

          const sc = 1;
          const fz = Math.round(stilText.fontSize * 2 * sc);
          const lh = fz * 1.5;
          const maxW = W * 0.82;

          // Setup shadow
          const setShadow = (blur = 20) => {
            if (stilText.umbra) {
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

          // Word wrap helper
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

          // ── TITLU DEVOȚIONAL ──
          ctx.font = `600 ${Math.round(fz * 0.6)}px Inter, Arial, sans-serif`;
          ctx.fillStyle = '#D4AF37';
          ctx.textAlign = 'center';
          setShadow(15);

          const titluLines = getLines(devotional.title || '', maxW, 2);
          const titluStartY = 100;
          titluLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, titluStartY + i * Math.round(fz * 0.7));
          });
          const afterTitlu = titluStartY + titluLines.length * Math.round(fz * 0.7) + 20;

          // Separator auriu sub titlu
          clearShadow();
          const drawSeparator = (y, width = 160, opacity = 0.5) => {
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

          drawSeparator(afterTitlu);

          // ── VERSET ──
          ctx.font = `italic ${fz}px '${stilText.font}', Georgia, serif`;
          ctx.fillStyle = stilText.culoare;
          ctx.textAlign = 'center';
          setShadow(25);

          const versetText = `\u201C${devotional.verseText || ''}\u201D`;
          const versetLines = getLines(versetText, maxW, 7);
          const versetH = versetLines.length * lh;

          let versetStartY;
          if (stilText.pozitie === 'top') {
            versetStartY = afterTitlu + 60;
          } else if (stilText.pozitie === 'bottom') {
            versetStartY = H - versetH - 340;
          } else {
            versetStartY = Math.max(afterTitlu + 60, (H - versetH) / 2 - 80);
          }

          // Linie decorativă sus verset
          clearShadow();
          const lineW = 80;
          ctx.strokeStyle = 'rgba(212,175,55,0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(W / 2 - lineW, versetStartY - 28);
          ctx.lineTo(W / 2 + lineW, versetStartY - 28);
          ctx.stroke();

          // Ghilimele decorative
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.font = 'bold 140px Georgia, serif';
          ctx.fillStyle = '#D4AF37';
          ctx.textAlign = 'left';
          ctx.fillText('\u201C', 45, versetStartY + 60);
          ctx.restore();

          // Text verset
          setShadow(25);
          ctx.font = `italic ${fz}px '${stilText.font}', Georgia, serif`;
          ctx.fillStyle = stilText.culoare;
          ctx.textAlign = 'center';
          versetLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, versetStartY + i * lh);
          });

          const afterVerset = versetStartY + versetH;

          // Linie decorativă jos verset
          clearShadow();
          ctx.beginPath();
          ctx.moveTo(W / 2 - lineW, afterVerset + 14);
          ctx.lineTo(W / 2 + lineW, afterVerset + 14);
          ctx.stroke();

          // ── REFERINȚA ──
          setShadow(12);
          ctx.font = `bold ${Math.round(fz * 0.48)}px '${stilText.font}', Georgia, serif`;
          ctx.fillStyle = '#D4AF37';
          ctx.textAlign = 'center';
          ctx.fillText(`\u2014 ${devotional.verseReference}`, W / 2, afterVerset + 55);

          // ── GÂNDUL ZILEI ──
          const gandY = afterVerset + 110;
          clearShadow();

          drawSeparator(gandY, 130, 0.35);

          ctx.font = `500 ${Math.round(fz * 0.38)}px Inter, Arial, sans-serif`;
          ctx.fillStyle = 'rgba(167,139,250,0.9)';
          ctx.textAlign = 'center';
          setShadow(10);
          ctx.fillText('✦ Gândul zilei ✦', W / 2, gandY + 34);

          ctx.font = `italic ${Math.round(fz * 0.43)}px Georgia, serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          setShadow(12);

          const gandLines = getLines(devotional.thoughtOfTheDay || '', maxW, 4);
          gandLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, gandY + 75 + i * Math.round(fz * 0.56));
          });

          // ── WATERMARK LOGO ──
          clearShadow();

          const logo = loadedLogoRef.current;
          const wmY = H - 160;

          if (logo) {
            const logoH = 72;
            const logoW = 72;
            const logoX = W / 2 - logoW / 2;
            const logoY = wmY;

            ctx.save();
            ctx.globalAlpha = 0.15;
            const glowGrad = ctx.createRadialGradient(W / 2, logoY + logoH / 2, logoH / 2, W / 2, logoY + logoH / 2, logoH / 2 + 30);
            glowGrad.addColorStop(0, 'rgba(212,175,55,0.4)');
            glowGrad.addColorStop(1, 'rgba(212,175,55,0)');
            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 30, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();
            ctx.restore();

            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(212,175,55,0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.save();
            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logo, logoX, logoY, logoW, logoH);
            ctx.restore();

            ctx.globalAlpha = 0.75;
            ctx.font = '600 24px Inter, Arial, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(APP_NAME, W / 2, logoY + logoH + 32);

            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 100, logoY + logoH + 44);
            ctx.lineTo(W / 2 + 100, logoY + logoH + 44);
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
          setImagineGenerata(dataUrl);
          setGenerand(false);
          resolve(dataUrl);

        } catch (e) {
          console.error('Eroare canvas:', e);
          setGenerand(false);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.error('Eroare imagine template');
        setGenerand(false);
        resolve(null);
      };
    });
  }, [devotional, templateCurent, stilText]);

  // ═══════════════════════════════════════
  // HELPERS TEMPLATE
  // ═══════════════════════════════════════
  const handleAltTemplate = () => {
    const alt = templateAleatoriu();
    setTemplateCurent(alt);
    setImagineGenerata(null);
  };

  const handleSelectTemplate = (tpl) => {
    setTemplateCurent(tpl);
    setImagineGenerata(null);
    setShowTemplateSelector(false);
  };


const handleUploadTemplate = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    const tpl = {
      id: 'custom_' + Date.now(),
      name: file.name.split('.')[0] || 'Custom',
      url: reader.result,
      thumbnail: reader.result,
      categorie: 'custom',
      custom: true
    };
    setCustomTemplate(tpl);
    setTemplateCurent(tpl);
    setImagineGenerata(null);
    setShowTemplateSelector(false);
  };
  reader.readAsDataURL(file);
};

  // ═══════════════════════════════════════
  // SHARE ACTIONS
  // ═══════════════════════════════════════
  const getShareText = () =>
    `🕊️ ${devotional.title}\n\n„${devotional.verseText}"\n— ${devotional.verseReference}\n\n✦ ${devotional.thoughtOfTheDay}\n\n📖 ${APP_URL}/devotional`;

  const handleShareNativ = async () => {
    if (navigator.share) {
      try {
        let imagine = imagineGenerata;
        if (!imagine) imagine = await genereazaImagine();

        if (imagine) {
          try {
            const blob = await fetch(imagine).then(r => r.blob());
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
    } else {
      handleCopyText();
    }
  };

  const handleDownload = async () => {
    let imagine = imagineGenerata;
    if (!imagine) imagine = await genereazaImagine();
    if (!imagine) return;
    const link = document.createElement('a');
    link.download = `devotional-popas-suflet-${new Date().toISOString().split('T')[0]}.jpg`;
    link.href = imagine;
    link.click();
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied('text');
      setTimeout(() => setCopied(''), 2500);
    } catch (e) {}
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${APP_URL}/devotional`);
      setCopied('link');
      setTimeout(() => setCopied(''), 2500);
    } catch (e) {}
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `🕊️ *${devotional.title}*\n\n_„${devotional.verseText}"_\n— ${devotional.verseReference}\n\n✦ _${devotional.thoughtOfTheDay}_\n\n📖 ${APP_URL}/devotional`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(`${APP_URL}/devotional`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const templatesFiltrate = categorieFiltre === 'all'
    ? DEFAULT_TEMPLATES
    : DEFAULT_TEMPLATES.filter(t => t.categorie === categorieFiltre);

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="ds-wrap">

      {/* ═══ BUTON PRINCIPAL ═══ */}
      <button
  className="ds-main-btn"
  onClick={() => setShareOpen(prev => !prev)}
>
  <span className="ds-main-btn-icon">📤</span>
  <span>Distribuie devoționalul</span>
  <span className="ds-arrow">{shareOpen ? '▲' : '▼'}</span>
</button>

      {shareOpen && (
        <div className="ds-panel">

          {/* ═══ CONTROALE STIL TEXT ═══ */}
          <div className="ds-stil-section">
            <div className="ds-stil-title">🎨 Personalizează imaginea</div>

            <div className="ds-stil-grid">
              {/* Font size */}
              <div className="ds-stil-item">
                <label className="ds-stil-label">
                  Mărime text: {stilText.fontSize}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="44"
                  step="2"
                  value={stilText.fontSize}
                  onChange={e => {
                    setStilText(p => ({ ...p, fontSize: +e.target.value }));
                    setImagineGenerata(null);
                  }}
                  className="ds-slider"
                />
              </div>

              {/* Poziție */}
              <div className="ds-stil-item">
                <label className="ds-stil-label">Poziție text</label>
                <div className="ds-pozitie-btns">
                  {[
                    { id: 'top', label: '⬆ Sus' },
                    { id: 'center', label: '↕ Centru' },
                    { id: 'bottom', label: '⬇ Jos' }
                  ].map(p => (
                    <button
                      key={p.id}
                      className={`ds-pozitie-btn ${stilText.pozitie === p.id ? 'activ' : ''}`}
                      onClick={() => {
                        setStilText(prev => ({ ...prev, pozitie: p.id }));
                        setImagineGenerata(null);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font */}
              <div className="ds-stil-item">
                <label className="ds-stil-label">Font</label>
                <select
                  className="ds-select"
                  value={stilText.font}
                  onChange={e => {
                    setStilText(p => ({ ...p, font: e.target.value }));
                    setImagineGenerata(null);
                  }}
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
              <div className="ds-stil-item">
                <label className="ds-stil-label">Culoare text</label>
                <div className="ds-culori">
                  {['#FFFFFF', '#F4D03F', '#FFE4E1', '#E8F5E9', '#E3F2FD', '#000000'].map(c => (
                    <div
                      key={c}
                      className={`ds-culoare-dot ${stilText.culoare === c ? 'activ' : ''}`}
                      style={{ background: c }}
                      onClick={() => {
                        setStilText(p => ({ ...p, culoare: c }));
                        setImagineGenerata(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ PREVIEW IMAGINE ═══ */}
          <div className="ds-preview-section">
            {imagineGenerata ? (
              <div className="ds-preview-wrap">
                <img
                  src={imagineGenerata}
                  alt="Preview devotional"
                  className="ds-preview-img"
                />
                <div className="ds-preview-actions">
                  <button className="ds-preview-btn" onClick={() => { setImagineGenerata(null); genereazaImagine(); }}>
                    🔄 Regenerează
                  </button>
                  <button className="ds-preview-btn" onClick={handleAltTemplate}>
                    🎲 Alt template
                  </button>
                  <button
                    className={`ds-preview-btn ${showTemplateSelector ? 'ds-preview-btn-active' : ''}`}
                    onClick={() => setShowTemplateSelector(prev => !prev)}
                  >
                    🖼️ {showTemplateSelector ? 'Închide' : 'Alege'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="ds-preview-placeholder">
                {templateCurent && (
                  <div className="ds-template-thumb-wrap">
                    <img
                      src={templateCurent.thumbnail}
                      alt={templateCurent.name}
                      className="ds-template-thumb-img"
                    />
                    <div className="ds-template-thumb-label">{templateCurent.name}</div>
                  </div>
                )}
                <p className="ds-preview-text">
                  Generează o imagine premium cu devoționalul de azi
                </p>
                <div className="ds-preview-btns-row">
                  <button
                    className="ds-gen-btn"
                    onClick={() => genereazaImagine()}
                    disabled={generand}
                  >
                    {generand ? '⏳ Se generează...' : '✨ Generează imagine'}
                  </button>
                  <button
                    className="ds-gen-btn ds-gen-btn-sec"
                    onClick={handleAltTemplate}
                    disabled={generand}
                  >
                    🎲 Alt template
                  </button>
                </div>
                <button
                  className="ds-choose-btn"
                  onClick={() => setShowTemplateSelector(prev => !prev)}
                >
                  🖼️ {showTemplateSelector ? 'Ascunde galerie' : 'Alege din galerie'}
                </button>
              </div>
            )}

            {/* ═══ SELECTOR TEMPLATE ═══ */}
            {showTemplateSelector && (
              <div className="ds-tpl-selector">
                <div className="ds-tpl-selector-header">
				{/* Upload custom */}
<input
  type="file"
  ref={fileInputRef}
  accept="image/*"
  onChange={handleUploadTemplate}
  style={{ display: 'none' }}
/>
<button
  className="ds-gen-btn ds-gen-btn-sec"
  style={{ width: '100%', marginBottom: 10 }}
  onClick={() => fileInputRef.current?.click()}
>
  ⬆️ Încarcă propria imagine
</button>
                  <span className="ds-tpl-selector-title">🖼️ Alege fundalul</span>
                  <button
                    className="ds-tpl-selector-close"
                    onClick={() => setShowTemplateSelector(false)}
                  >✕</button>
                </div>

                {/* Filtre */}
                <div className="ds-cat-filter">
                  {CATEGORII_TEMPLATES.map(cat => (
                    <button
                      key={cat.id}
                      className={`ds-cat-btn ${categorieFiltre === cat.id ? 'activ' : ''}`}
                      onClick={() => setCategorieFiltre(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Grid template-uri */}
                <div className="ds-tpl-grid">
                  {templatesFiltrate.map(tpl => (
                    <div
                      key={tpl.id}
                      className={`ds-tpl-item ${templateCurent?.id === tpl.id ? 'selectat' : ''}`}
                      onClick={() => handleSelectTemplate(tpl)}
                    >
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.name}
                        className="ds-tpl-item-img"
                        loading="lazy"
                      />
                      <div className="ds-tpl-item-overlay">{tpl.name}</div>
                      {templateCurent?.id === tpl.id && (
                        <div className="ds-tpl-item-check">✓</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Generează cu template ales */}
                <button
                  className="ds-gen-btn"
                  style={{ width: '100%', marginTop: 10 }}
                  onClick={() => {
                    setShowTemplateSelector(false);
                    genereazaImagine(templateCurent);
                  }}
                  disabled={generand}
                >
                  {generand ? '⏳ Se generează...' : '✨ Generează cu acest template'}
                </button>
              </div>
            )}
          </div>

          {/* ═══ BUTOANE SHARE ═══ */}
          <div className="ds-share-section">
            <div className="ds-share-title">📲 Distribuie pe:</div>

            <div className="ds-btns-grid">
              <button className="ds-btn ds-btn-nativ" onClick={handleShareNativ}>
                <span className="ds-btn-icon">📤</span>
                <span className="ds-btn-label">Share</span>
                <span className="ds-btn-sub">Nativ</span>
              </button>

              <button className="ds-btn ds-btn-wa" onClick={handleWhatsApp}>
                <span className="ds-btn-icon">💬</span>
                <span className="ds-btn-label">WhatsApp</span>
                <span className="ds-btn-sub">Text + link</span>
              </button>

              <button className="ds-btn ds-btn-fb" onClick={handleFacebook}>
                <span className="ds-btn-icon">📘</span>
                <span className="ds-btn-label">Facebook</span>
                <span className="ds-btn-sub">Share link</span>
              </button>

              <button className="ds-btn ds-btn-dl" onClick={handleDownload}>
                <span className="ds-btn-icon">⬇️</span>
                <span className="ds-btn-label">Descarcă</span>
                <span className="ds-btn-sub">Instagram/TikTok</span>
              </button>

              <button className="ds-btn ds-btn-copy" onClick={handleCopyText}>
                <span className="ds-btn-icon">{copied === 'text' ? '✅' : '📋'}</span>
                <span className="ds-btn-label">{copied === 'text' ? 'Copiat!' : 'Copiază'}</span>
                <span className="ds-btn-sub">Text complet</span>
              </button>

              <button className="ds-btn ds-btn-link" onClick={handleCopyLink}>
                <span className="ds-btn-icon">{copied === 'link' ? '✅' : '🔗'}</span>
                <span className="ds-btn-label">{copied === 'link' ? 'Copiat!' : 'Link'}</span>
                <span className="ds-btn-sub">URL direct</span>
              </button>
            </div>

            <div className="ds-tips">
              <div className="ds-tip-item">📸 <strong>Instagram:</strong> descarcă imaginea → postează din aplicație</div>
              <div className="ds-tip-item">🎵 <strong>TikTok:</strong> descarcă imaginea → adaugă în slideshow</div>
              <div className="ds-tip-item">💬 <strong>WhatsApp:</strong> trimite direct cu text formatat</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default DevotionalShare;