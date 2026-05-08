// frontend/src/components/DevotionalShare.js
import React, { useState, useRef, useCallback } from 'react';

const APP_URL = 'https://popas-pentru-suflet.vercel.app';
const APP_NAME = 'Popas pentru Suflet';

const DevotionalShare = ({ devotional }) => {
  const canvasRef = useRef(null);
  const [imagineGenerata, setImagineGenerata] = useState(null);
  const [generand, setGenerand] = useState(false);
  const [copied, setCopied] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  if (!devotional) return null;

  // ═══════════════════════════════════════
  // GENERARE IMAGINE PE CANVAS
  // ═══════════════════════════════════════
  const genereazaImagine = useCallback(async () => {
    setGenerand(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      // ── Fundal gradient premium ──
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#0a0a1a');
      grad.addColorStop(0.4, '#0f0f2e');
      grad.addColorStop(0.7, '#1a0a2e');
      grad.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // ── Cercuri decorative ──
      const drawCircle = (x, y, r, color) => {
        const cg = ctx.createRadialGradient(x, y, 0, x, y, r);
        cg.addColorStop(0, color);
        cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawCircle(200, 200, 300, 'rgba(108,99,255,0.12)');
      drawCircle(900, 800, 350, 'rgba(212,175,55,0.08)');
      drawCircle(1000, 100, 200, 'rgba(167,139,250,0.06)');

      // ── Linie aurie sus ──
      const lineGrad = ctx.createLinearGradient(80, 0, 1000, 0);
      lineGrad.addColorStop(0, 'transparent');
      lineGrad.addColorStop(0.3, '#d4af37');
      lineGrad.addColorStop(0.7, '#f7c59f');
      lineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 120);
      ctx.lineTo(1000, 120);
      ctx.stroke();

      // ── Linie aurie jos ──
      ctx.beginPath();
      ctx.moveTo(80, 960);
      ctx.lineTo(1000, 960);
      ctx.stroke();

      // ── Porumbel / icon ──
      ctx.font = '72px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🕊️', 540, 200);

      // ── APP NAME ──
      ctx.font = 'bold 32px Georgia, serif';
      ctx.fillStyle = '#d4af37';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText(APP_NAME.toUpperCase(), 540, 260);

      // ── Separator ──
      ctx.fillStyle = 'rgba(212,175,55,0.4)';
      ctx.fillRect(440, 280, 200, 1);

      // ── Ghilimele decorative ──
      ctx.font = 'bold 120px Georgia, serif';
      ctx.fillStyle = 'rgba(212,175,55,0.15)';
      ctx.textAlign = 'left';
      ctx.fillText('\u201C', 60, 420);

      // ── Text verset ──
      const versetText = devotional.verseText || '';
      const maxWidth = 860;
      const lineHeight = 68;
      ctx.font = 'italic 44px Georgia, serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';

      // Wrap text
      const wrapText = (text, x, y, maxW, lh) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxW && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lh;
            if (currentY > 700) break;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
        return currentY;
      };

      const versetY = wrapText(
        `„${versetText}"`,
        540,
        380,
        maxWidth,
        lineHeight
      );

      // ── Referința ──
      ctx.font = 'bold 36px Georgia, serif';
      ctx.fillStyle = '#d4af37';
      ctx.textAlign = 'center';
      ctx.fillText(`— ${devotional.verseReference}`, 540, versetY + 80);

      // ── Titlu devoțional ──
      const titluText = devotional.title || '';
      ctx.font = '28px Arial, sans-serif';
      ctx.fillStyle = 'rgba(167,139,250,0.9)';
      ctx.textAlign = 'center';

      // Wrap titlu
      if (titluText.length > 50) {
        const half = Math.ceil(titluText.split(' ').length / 2);
        const words = titluText.split(' ');
        ctx.fillText(words.slice(0, half).join(' '), 540, versetY + 160);
        ctx.fillText(words.slice(half).join(' '), 540, versetY + 196);
      } else {
        ctx.fillText(titluText, 540, versetY + 160);
      }

      // ── Data ──
      const azi = new Date().toLocaleDateString('ro-RO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      ctx.font = '24px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(azi, 540, 980);

      // ── URL ──
      ctx.font = '22px Arial, sans-serif';
      ctx.fillStyle = 'rgba(212,175,55,0.5)';
      ctx.fillText(APP_URL, 540, 1040);

      // ── Convertire la URL ──
      const dataUrl = canvas.toDataURL('image/png');
      setImagineGenerata(dataUrl);
      return dataUrl;

    } catch (e) {
      console.error('Eroare generare imagine:', e);
    } finally {
      setGenerand(false);
    }
  }, [devotional]);

  // ═══════════════════════════════════════
  // SHARE NATIV
  // ═══════════════════════════════════════
  const handleShareNativ = async () => {
    const text = `🕊️ ${devotional.title}\n\n„${devotional.verseText}"\n— ${devotional.verseReference}\n\n${devotional.thoughtOfTheDay}\n\n📖 Citește mai mult pe ${APP_URL}/devotional`;

    if (navigator.share) {
      try {
        // Încearcă cu imagine
        let imagine = imagineGenerata;
        if (!imagine) imagine = await genereazaImagine();

        if (imagine) {
          try {
            const blob = await fetch(imagine).then(r => r.blob());
            const file = new File([blob], 'devotional-popas-suflet.png', { type: 'image/png' });

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

        // Fallback fără imagine
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
  // DOWNLOAD IMAGINE
  // ═══════════════════════════════════════
  const handleDownload = async () => {
    let imagine = imagineGenerata;
    if (!imagine) imagine = await genereazaImagine();
    if (!imagine) return;

    const link = document.createElement('a');
    link.download = `devotional-${new Date().toISOString().split('T')[0]}.png`;
    link.href = imagine;
    link.click();
  };

  // ═══════════════════════════════════════
  // COPY TEXT
  // ═══════════════════════════════════════
  const handleCopyText = async () => {
    const text = `🕊️ ${devotional.title}\n\n„${devotional.verseText}"\n— ${devotional.verseReference}\n\n${devotional.thoughtOfTheDay}\n\n📖 ${APP_URL}/devotional`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied('text');
      setTimeout(() => setCopied(''), 2500);
    } catch (e) {}
  };

  // ═══════════════════════════════════════
  // COPY LINK
  // ═══════════════════════════════════════
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
      `🕊️ *${devotional.title}*\n\n_„${devotional.verseText}"_\n— ${devotional.verseReference}\n\n${devotional.thoughtOfTheDay}\n\n📖 Citește pe: ${APP_URL}/devotional`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // ═══════════════════════════════════════
  // FACEBOOK
  // ═══════════════════════════════════════
  const handleFacebook = () => {
    const url = encodeURIComponent(`${APP_URL}/devotional`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="ds-wrap">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Buton principal */}
      <button
        className="ds-main-btn"
        onClick={() => setShareOpen(prev => !prev)}
      >
        📤 Distribuie devoționalul
        <span className="ds-arrow">{shareOpen ? '▲' : '▼'}</span>
      </button>

      {shareOpen && (
        <div className="ds-panel">

          {/* Preview imagine */}
          <div className="ds-preview-section">
            {imagineGenerata ? (
              <div className="ds-preview-wrap">
                <img
                  src={imagineGenerata}
                  alt="Preview devotional"
                  className="ds-preview-img"
                />
                <div className="ds-preview-badge">✅ Imagine generată</div>
              </div>
            ) : (
              <div className="ds-preview-placeholder">
                <div className="ds-preview-icon">🖼️</div>
                <p className="ds-preview-text">
                  Generează o imagine premium pentru social media
                </p>
                <button
                  className="ds-gen-btn"
                  onClick={genereazaImagine}
                  disabled={generand}
                >
                  {generand ? '⏳ Se generează...' : '✨ Generează imagine'}
                </button>
              </div>
            )}
          </div>

          {/* Butoane share */}
          <div className="ds-btns-grid">

            {/* Share nativ */}
            <button className="ds-btn ds-btn-nativ" onClick={handleShareNativ}>
              <span className="ds-btn-icon">📤</span>
              <span className="ds-btn-label">Distribuie</span>
              <span className="ds-btn-sub">WhatsApp, FB, etc.</span>
            </button>

            {/* WhatsApp direct */}
            <button className="ds-btn ds-btn-wa" onClick={handleWhatsApp}>
              <span className="ds-btn-icon">💬</span>
              <span className="ds-btn-label">WhatsApp</span>
              <span className="ds-btn-sub">Trimite direct</span>
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
              <span className="ds-btn-sub">Instagram / TikTok</span>
            </button>

            {/* Copy text */}
            <button className="ds-btn ds-btn-copy" onClick={handleCopyText}>
              <span className="ds-btn-icon">
                {copied === 'text' ? '✅' : '📋'}
              </span>
              <span className="ds-btn-label">
                {copied === 'text' ? 'Copiat!' : 'Copiază text'}
              </span>
              <span className="ds-btn-sub">în clipboard</span>
            </button>

            {/* Copy link */}
            <button className="ds-btn ds-btn-link" onClick={handleCopyLink}>
              <span className="ds-btn-icon">
                {copied === 'link' ? '✅' : '🔗'}
              </span>
              <span className="ds-btn-label">
                {copied === 'link' ? 'Copiat!' : 'Copiază link'}
              </span>
              <span className="ds-btn-sub">URL devotional</span>
            </button>

          </div>

          {/* Sfat */}
          <div className="ds-tip">
            💡 <strong>Instagram / TikTok:</strong> descarcă imaginea și
            posteaz-o manual din aplicație.
          </div>

        </div>
      )}
    </div>
  );
};

export default DevotionalShare;