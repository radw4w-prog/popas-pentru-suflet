// frontend/src/components/DevotionalShare.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DEFAULT_TEMPLATES, CATEGORII_TEMPLATES } from '../data/templates';

const APP_URL = 'https://popas-pentru-suflet.vercel.app';
const APP_NAME = 'Popas pentru Suflet';

// Alege un template aleatoriu
const templateAleatoriu = () => {
  return DEFAULT_TEMPLATES[Math.floor(Math.random() * DEFAULT_TEMPLATES.length)];
};

// Wrap text helper
const wrapText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 10) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = currentLine + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(currentLine.trim());
      currentLine = words[n] + ' ';
      if (lines.length >= maxLines) break;
    } else {
      currentLine = testLine;
    }
  }
  if (lines.length < maxLines) lines.push(currentLine.trim());

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });

  return y + lines.length * lineHeight;
};

const DevotionalShare = ({ devotional }) => {
  const [imagineGenerata, setImagineGenerata] = useState(null);
  const [generand, setGenerand] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const [templateCurent, setTemplateCurent] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [categorieFiltre, setCategorieFiltre] = useState('all');

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

  // Init template aleatoriu
  useEffect(() => {
    setTemplateCurent(templateAleatoriu());
  }, []);

  if (!devotional) return null;

  // ═══════════════════════════════════════
  // GENERARE IMAGINE PE CANVAS
  // ═══════════════════════════════════════
  const genereazaImagine = useCallback(async (template = null) => {
    setGenerand(true);
    setImagineGenerata(null);

    const tpl = template || templateCurent || templateAleatoriu();

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

          // ── Cover crop imagine ──
          const imgR = img.width / img.height;
          const canR = W / H;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (imgR > canR) {
            sw = img.height * canR;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / canR;
            sy = (img.height - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

          // ── Gradient overlay ──
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'rgba(0,0,0,0.15)');
          grad.addColorStop(0.2, 'rgba(0,0,0,0.35)');
          grad.addColorStop(0.5, 'rgba(0,0,0,0.55)');
          grad.addColorStop(0.75, 'rgba(0,0,0,0.72)');
          grad.addColorStop(1, 'rgba(0,0,0,0.85)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // ── Watermark repetat pe fundal ──
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

          // ── Titlu devoțional ──
          const titlu = devotional.title || '';
          ctx.font = '600 36px Inter, Arial, sans-serif';
          ctx.fillStyle = 'rgba(212,175,55,0.95)';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 2;

          // Wrap titlu
          const titluLines = [];
          const titluWords = titlu.split(' ');
          let titluLine = '';
          for (const word of titluWords) {
            const test = titluLine + word + ' ';
            if (ctx.measureText(test).width > 900 && titluLine) {
              titluLines.push(titluLine.trim());
              titluLine = word + ' ';
              if (titluLines.length >= 2) break;
            } else {
              titluLine = test;
            }
          }
          titluLines.push(titluLine.trim());

          let currentY = 110;
          titluLines.forEach(line => {
            ctx.fillText(line, W / 2, currentY);
            currentY += 46;
          });

          // ── Separator auriu ──
          ctx.shadowBlur = 0;
          const sepGrad = ctx.createLinearGradient(
            W / 2 - 200, 0, W / 2 + 200, 0
          );
          sepGrad.addColorStop(0, 'transparent');
          sepGrad.addColorStop(0.3, 'rgba(212,175,55,0.8)');
          sepGrad.addColorStop(0.7, 'rgba(212,175,55,0.8)');
          sepGrad.addColorStop(1, 'transparent');
          ctx.strokeStyle = sepGrad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(W / 2 - 200, currentY + 10);
          ctx.lineTo(W / 2 + 200, currentY + 10);
          ctx.stroke();

          currentY += 40;

          // ── Ghilimele decorative ──
          ctx.save();
          ctx.globalAlpha = 0.12;
          ctx.font = 'bold 160px Georgia, serif';
          ctx.fillStyle = '#D4AF37';
          ctx.textAlign = 'left';
          ctx.fillText('\u201C', 50, currentY + 80);
          ctx.restore();

          // ── Text verset ──
          const versetText = devotional.verseText || '';
          ctx.font = 'italic 44px \'Playfair Display\', Georgia, serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 3;

          const versetFinal = `\u201C${versetText}\u201D`;
          const versetWords = versetFinal.split(' ');
          const versetLines = [];
          let versetLine = '';

          for (const word of versetWords) {
            const test = versetLine + word + ' ';
            if (ctx.measureText(test).width > 900 && versetLine) {
              versetLines.push(versetLine.trim());
              versetLine = word + ' ';
              if (versetLines.length >= 7) break;
            } else {
              versetLine = test;
            }
          }
          versetLines.push(versetLine.trim());

          const versetLH = 66;
          const versetH = versetLines.length * versetLH;

          // Centrare verticală a versetului (zona 250 - 750)
          const versetStartY = Math.max(currentY, 300 - versetH / 2);

          // Linie decorativă sus verset
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(212,175,55,0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(W / 2 - 80, versetStartY - 25);
          ctx.lineTo(W / 2 + 80, versetStartY - 25);
          ctx.stroke();

          // Desenează versetul
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 20;
          versetLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, versetStartY + i * versetLH);
          });

          const afterVerset = versetStartY + versetH;

          // Linie decorativă jos verset
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(W / 2 - 80, afterVerset + 15);
          ctx.lineTo(W / 2 + 80, afterVerset + 15);
          ctx.stroke();

          // ── Referința ──
          ctx.font = 'bold 36px \'Playfair Display\', Georgia, serif';
          ctx.fillStyle = '#D4AF37';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 15;
          ctx.fillText(
            `\u2014 ${devotional.verseReference}`,
            W / 2,
            afterVerset + 65
          );

          // ── Gândul zilei ──
          const gandText = devotional.thoughtOfTheDay || '';
          if (gandText) {
            const gandY = afterVerset + 120;

            // Separator
            ctx.shadowBlur = 0;
            const gandSepGrad = ctx.createLinearGradient(
              W / 2 - 150, 0, W / 2 + 150, 0
            );
            gandSepGrad.addColorStop(0, 'transparent');
            gandSepGrad.addColorStop(0.5, 'rgba(167,139,250,0.5)');
            gandSepGrad.addColorStop(1, 'transparent');
            ctx.strokeStyle = gandSepGrad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 150, gandY);
            ctx.lineTo(W / 2 + 150, gandY);
            ctx.stroke();

            // Label
            ctx.font = '500 26px Inter, Arial, sans-serif';
            ctx.fillStyle = 'rgba(167,139,250,0.9)';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;
            ctx.fillText('✦ Gândul zilei ✦', W / 2, gandY + 35);

            // Text gând
            ctx.font = 'italic 30px Georgia, serif';
            ctx.fillStyle = 'rgba(255,255,255,0.88)';

            const gandWords = gandText.split(' ');
            const gandLines = [];
            let gandLine = '';

            for (const word of gandWords) {
              const test = gandLine + word + ' ';
              if (ctx.measureText(test).width > 880 && gandLine) {
                gandLines.push(gandLine.trim());
                gandLine = word + ' ';
                if (gandLines.length >= 4) break;
              } else {
                gandLine = test;
              }
            }
            gandLines.push(gandLine.trim());

            gandLines.forEach((line, i) => {
              ctx.fillText(line, W / 2, gandY + 80 + i * 44);
            });
          }

          // ── WATERMARK / BRANDING ──
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';

          const logo = loadedLogoRef.current;
          const wmY = H - 160;

          if (logo) {
            const logoH = 70;
            const logoW = 70;
            const logoX = W / 2 - logoW / 2;
            const logoY = wmY;

            // Glow
            ctx.save();
            ctx.globalAlpha = 0.15;
            const glowGrad = ctx.createRadialGradient(
              W / 2, logoY + logoH / 2, logoH / 2,
              W / 2, logoY + logoH / 2, logoH / 2 + 30
            );
            glowGrad.addColorStop(0, 'rgba(212,175,55,0.4)');
            glowGrad.addColorStop(1, 'rgba(212,175,55,0)');
            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 30, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();
            ctx.restore();

            // Cerc exterior
            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(212,175,55,0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Logo circular
            ctx.save();
            ctx.beginPath();
            ctx.arc(W / 2, logoY + logoH / 2, logoH / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logo, logoX, logoY, logoW, logoH);
            ctx.restore();

            // Text sub logo
            ctx.globalAlpha = 0.8;
            ctx.font = '600 24px Inter, Arial, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(APP_NAME, W / 2, logoY + logoH + 32);

            // Linie decorativă
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 100, logoY + logoH + 44);
            ctx.lineTo(W / 2 + 100, logoY + logoH + 44);
            ctx.stroke();

            ctx.globalAlpha = 1.0;
          } else {
            // Fallback fără logo
            ctx.globalAlpha = 0.7;
            ctx.font = '700 28px Inter, Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.textAlign = 'center';
            ctx.fillText(`🕊️ ${APP_NAME}`, W / 2, H - 60);
            ctx.globalAlpha = 1.0;
          }

          // ── Colțuri anti-decupare ──
          ctx.save();
          ctx.globalAlpha = 0.06;
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

          // ── Salvare ──
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          setImagineGenerata(dataUrl);
          setGenerand(false);
          resolve(dataUrl);

        } catch (e) {
          console.error('Eroare generare imagine devotional:', e);
          setGenerand(false);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.error('Eroare încărcare imagine template');
        setGenerand(false);
        resolve(null);
      };
    });
  }, [devotional, templateCurent]);

  // ═══════════════════════════════════════
  // SCHIMBARE TEMPLATE
  // ═══════════════════════════════════════
  const handleAltTemplate = () => {
    const altTemplate = templateAleatoriu();
    setTemplateCurent(altTemplate);
    setImagineGenerata(null);
  };

  const handleSelectTemplate = (tpl) => {
    setTemplateCurent(tpl);
    setImagineGenerata(null);
    setShowTemplateSelector(false);
  };

  // ═══════════════════════════════════════
  // SHARE NATIV
  // ═══════════════════════════════════════
  const handleShareNativ = async () => {
    const text = `🕊️ ${devotional.title}\n\n„${devotional.verseText}"\n— ${devotional.verseReference}\n\n✦ ${devotional.thoughtOfTheDay}\n\n📖 ${APP_URL}/devotional`;

    if (navigator.share) {
      try {
        let imagine = imagineGenerata;
        if (!imagine) imagine = await genereazaImagine();

        if (imagine) {
          try {
            const blob = await fetch(imagine).then(r => r.blob());
            const file = new File(
              [blob],
              `devotional-${new Date().toISOString().split('T')[0]}.jpg`,
              { type: 'image/jpeg' }
            );

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: devotional.title,
                text,
                files: [file]
              });
              return;
            }
          } catch (e) {}
        }

        await navigator.share({
          title: devotional.title,
          text,
          url: `${APP_URL}/devotional`
        });

      } catch (e) {
        if (e.name !== 'AbortError') {
          handleCopyText();
        }
      }
    } else {
      handleCopyText();
    }
  };

  // ═══════════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════════
  const handleDownload = async () => {
    let imagine = imagineGenerata;
    if (!imagine) imagine = await genereazaImagine();
    if (!imagine) return;

    const link = document.createElement('a');
    link.download = `devotional-popas-suflet-${new Date().toISOString().split('T')[0]}.jpg`;
    link.href = imagine;
    link.click();
  };

  // ═══════════════════════════════════════
  // COPY
  // ═══════════════════════════════════════
  const handleCopyText = async () => {
    const text = `🕊️ ${devotional.title}\n\n„${devotional.verseText}"\n— ${devotional.verseReference}\n\n✦ ${devotional.thoughtOfTheDay}\n\n📖 ${APP_URL}/devotional`;
    try {
      await navigator.clipboard.writeText(text);
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

  // ═══════════════════════════════════════
  // WHATSAPP
  // ═══════════════════════════════════════
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `🕊️ *${devotional.title}*\n\n_„${devotional.verseText}"_\n— ${devotional.verseReference}\n\n✦ _${devotional.thoughtOfTheDay}_\n\n📖 Citește mai mult: ${APP_URL}/devotional`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // ═══════════════════════════════════════
  // FACEBOOK
  // ═══════════════════════════════════════
  const handleFacebook = () => {
    const url = encodeURIComponent(`${APP_URL}/devotional`);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // ═══════════════════════════════════════
  // TEMPLATE FILTRATE
  // ═══════════════════════════════════════
  const templatesFiltrate = categorieFiltre === 'all'
    ? DEFAULT_TEMPLATES
    : DEFAULT_TEMPLATES.filter(t => t.categorie === categorieFiltre);

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="ds-wrap">

      {/* Buton principal */}
      <button
        className="ds-main-btn"
        onClick={() => setShareOpen(prev => !prev)}
      >
        <span>📤</span>
        <span>Distribuie devoționalul</span>
        <span className="ds-arrow">{shareOpen ? '▲' : '▼'}</span>
      </button>

      {shareOpen && (
        <div className="ds-panel">

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
                  <button
                    className="ds-preview-btn"
                    onClick={() => {
                      setImagineGenerata(null);
                      genereazaImagine();
                    }}
                  >
                    🔄 Regenerează
                  </button>
                  <button
                    className="ds-preview-btn"
                    onClick={handleAltTemplate}
                  >
                    🎲 Alt template
                  </button>
                  <button
                    className="ds-preview-btn ds-preview-btn-active"
                    onClick={() => setShowTemplateSelector(prev => !prev)}
                  >
                    🖼️ {showTemplateSelector ? 'Închide' : 'Alege template'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="ds-preview-placeholder">
                {templateCurent && (
                  <div className="ds-template-preview-thumb">
                    <img
                      src={templateCurent.thumbnail}
                      alt={templateCurent.name}
                      className="ds-template-thumb-img"
                    />
                    <div className="ds-template-thumb-overlay">
                      <span>{templateCurent.name}</span>
                    </div>
                  </div>
                )}
                <div className="ds-preview-icon">🖼️</div>
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
                    className="ds-gen-btn ds-gen-btn-secondary"
                    onClick={handleAltTemplate}
                    disabled={generand}
                  >
                    🎲 Alt template
                  </button>
                </div>
                <button
                  className="ds-choose-template-btn"
                  onClick={() => setShowTemplateSelector(prev => !prev)}
                >
                  🖼️ {showTemplateSelector ? 'Ascunde galerie' : 'Alege template din galerie'}
                </button>
              </div>
            )}

            {/* ═══ SELECTOR TEMPLATE ═══ */}
            {showTemplateSelector && (
              <div className="ds-template-selector">
                <div className="ds-template-selector-header">
                  <span className="ds-template-selector-title">
                    🖼️ Alege fundalul
                  </span>
                  <button
                    className="ds-template-selector-close"
                    onClick={() => setShowTemplateSelector(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Filtre categorii */}
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
                <div className="ds-template-grid">
                  {templatesFiltrate.map(tpl => (
                    <div
                      key={tpl.id}
                      className={`ds-template-item ${templateCurent?.id === tpl.id ? 'selectat' : ''}`}
                      onClick={() => handleSelectTemplate(tpl)}
                    >
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.name}
                        className="ds-template-item-img"
                        loading="lazy"
                      />
                      <div className="ds-template-item-overlay">
                        <span>{tpl.name}</span>
                      </div>
                      {templateCurent?.id === tpl.id && (
                        <div className="ds-template-item-check">✓</div>
                      )}
                    </div>
                  ))}
                </div>

                {imagineGenerata && (
                  <button
                    className="ds-gen-btn"
                    style={{ width: '100%', marginTop: 10 }}
                    onClick={() => {
                      setImagineGenerata(null);
                      genereazaImagine(templateCurent);
                      setShowTemplateSelector(false);
                    }}
                    disabled={generand}
                  >
                    {generand ? '⏳ Se generează...' : '✨ Regenerează cu template ales'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ═══ BUTOANE SHARE ═══ */}
          <div className="ds-share-section">
            <div className="ds-share-title">📲 Distribuie pe:</div>

            <div className="ds-btns-grid">

              {/* Share nativ */}
              <button className="ds-btn ds-btn-nativ" onClick={handleShareNativ}>
                <span className="ds-btn-icon">📤</span>
                <span className="ds-btn-label">Share</span>
                <span className="ds-btn-sub">Nativ</span>
              </button>

              {/* WhatsApp */}
              <button className="ds-btn ds-btn-wa" onClick={handleWhatsApp}>
                <span className="ds-btn-icon">💬</span>
                <span className="ds-btn-label">WhatsApp</span>
                <span className="ds-btn-sub">Text + link</span>
              </button>

              {/* Facebook */}
              <button className="ds-btn ds-btn-fb" onClick={handleFacebook}>
                <span className="ds-btn-icon">📘</span>
                <span className="ds-btn-label">Facebook</span>
                <span className="ds-btn-sub">Share link</span>
              </button>

              {/* Download */}
              <button className="ds-btn ds-btn-dl" onClick={handleDownload}>
                <span className="ds-btn-icon">⬇️</span>
                <span className="ds-btn-label">Descarcă</span>
                <span className="ds-btn-sub">Instagram/TikTok</span>
              </button>

              {/* Copy text */}
              <button className="ds-btn ds-btn-copy" onClick={handleCopyText}>
                <span className="ds-btn-icon">
                  {copied === 'text' ? '✅' : '📋'}
                </span>
                <span className="ds-btn-label">
                  {copied === 'text' ? 'Copiat!' : 'Copiază'}
                </span>
                <span className="ds-btn-sub">Text complet</span>
              </button>

              {/* Copy link */}
              <button className="ds-btn ds-btn-link" onClick={handleCopyLink}>
                <span className="ds-btn-icon">
                  {copied === 'link' ? '✅' : '🔗'}
                </span>
                <span className="ds-btn-label">
                  {copied === 'link' ? 'Copiat!' : 'Link'}
                </span>
                <span className="ds-btn-sub">URL direct</span>
              </button>

            </div>

            {/* Sfaturi */}
            <div className="ds-tips">
              <div className="ds-tip-item">
                📸 <strong>Instagram:</strong> descarcă imaginea → postează din aplicație
              </div>
              <div className="ds-tip-item">
                🎵 <strong>TikTok:</strong> descarcă imaginea → adaugă în video sau slideshow
              </div>
              <div className="ds-tip-item">
                💬 <strong>WhatsApp:</strong> trimite direct cu textul formatat
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default DevotionalShare;