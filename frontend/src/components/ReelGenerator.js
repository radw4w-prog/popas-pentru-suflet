// frontend/src/components/ReelGenerator.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

// ═══════════════════════════════════════
// CONFIGURARE REEL
// ═══════════════════════════════════════
const REEL_W = 1080;
const REEL_H = 1920;
const DURATA_SEC = 15;
const FPS = 30;
const TOTAL_FRAMES = DURATA_SEC * FPS;

const ReelGenerator = ({
  templateUrl,
  versetText,
  versetReferinta,
  descriere,
  hashtags,
  tema,
  isAdmin
}) => {
  const [status, setStatus] = useState('idle'); // idle | generating | done | error
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const canvasRef = useRef(null);
  const loadedImgRef = useRef(null);
  const loadedLogoRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Preload logo
  useEffect(() => {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/logo.png';
    logo.onload = () => { loadedLogoRef.current = logo; };
    logo.onerror = () => { loadedLogoRef.current = null; };
  }, []);

  // ═══════════════════════════════════════
  // DRAW FRAME
  // ═══════════════════════════════════════
  const drawFrame = useCallback((ctx, img, frameIndex) => {
    const W = REEL_W;
    const H = REEL_H;
    const progress = frameIndex / TOTAL_FRAMES; // 0 → 1
    const t = progress; // alias

    // ── Zoom lent pe imagine ──
    const zoomFactor = 1 + t * 0.06; // 1.0 → 1.06
    const imgR = img.width / img.height;
    const canR = W / H;

    let sw, sh, sx, sy;
    if (imgR > canR) {
      sh = img.height / zoomFactor;
      sw = sh * canR;
      sx = (img.width - sw) / 2;
      sy = (img.height - sh) / 2;
    } else {
      sw = img.width / zoomFactor;
      sh = sw / canR;
      sx = (img.width - sw) / 2;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

    // ── Gradient overlay ──
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0.2)');
    grad.addColorStop(0.3, 'rgba(0,0,0,0.45)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.65)');
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Watermark repetat ──
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.font = '700 32px Inter, Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    for (let y = 80; y < H; y += 140) {
      for (let x = 100; x < W; x += 420) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.35);
        ctx.fillText('popaspentrusuflet.ro', 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();

    // ── Animații text ──
    // Fade-in titlu (0-20% din durată)
    const titleAlpha = Math.min(1, t / 0.2);

    // Fade-in verset (10-40%)
    const versetAlpha = Math.min(1, Math.max(0, (t - 0.1) / 0.3));

    // Fade-in referință (30-50%)
    const refAlpha = Math.min(1, Math.max(0, (t - 0.3) / 0.2));

    // Fade-in descriere (50-70%)
    const descAlpha = Math.min(1, Math.max(0, (t - 0.5) / 0.2));

    // Fade-in logo (80-100%)
    const logoAlpha = Math.min(1, Math.max(0, (t - 0.8) / 0.2));

    // Helper wrap text
    const getLines = (ctx, text, maxW, maxL = 8) => {
      const words = text.split(' ');
      const lines = [];
      let cur = '';
      for (const w of words) {
        const test = cur + w + ' ';
        if (ctx.measureText(test).width > maxW && cur) {
          lines.push(cur.trim());
          cur = w + ' ';
          if (lines.length >= maxL - 1) break;
        } else { cur = test; }
      }
      lines.push(cur.trim());
      return lines.slice(0, maxL);
    };

    // Helper shadow
    const setShadow = (ctx, blur = 20) => {
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = blur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;
    };

    const clearShadow = (ctx) => {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    // ── SEPARATOR SUS ──
    ctx.save();
    ctx.globalAlpha = titleAlpha * 0.6;
    const sepGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
    sepGrad.addColorStop(0, 'transparent');
    sepGrad.addColorStop(0.5, '#D4AF37');
    sepGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 200, 160);
    ctx.lineTo(W / 2 + 200, 160);
    ctx.stroke();
    ctx.restore();

    // ── BADGE POPAS PENTRU SUFLET (sus) ──
    ctx.save();
    ctx.globalAlpha = titleAlpha;
    setShadow(ctx, 10);
    ctx.font = '600 36px Inter, Arial, sans-serif';
    ctx.fillStyle = '#D4AF37';
    ctx.textAlign = 'center';
    ctx.fillText('🕊️ Popas pentru Suflet', W / 2, 130);
    clearShadow(ctx);
    ctx.restore();

    // ── SEPARATOR ──
    ctx.save();
    ctx.globalAlpha = titleAlpha * 0.6;
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 200, 175);
    ctx.lineTo(W / 2 + 200, 175);
    ctx.stroke();
    ctx.restore();

    // ── VERSET TEXT ──
    if (versetText) {
      ctx.save();
      ctx.globalAlpha = versetAlpha;
      setShadow(ctx, 25);

      const fz = 68;
      const lh = fz * 1.5;
      ctx.font = `italic ${fz}px 'Playfair Display', Georgia, serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';

      const versetLines = getLines(ctx, `\u201C${versetText}\u201D`, W * 0.82, 7);
      const versetH = versetLines.length * lh;
      const versetStartY = (H - versetH) / 2 - 120;

      // Linie sus
      clearShadow(ctx);
      ctx.strokeStyle = 'rgba(212,175,55,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 90, versetStartY - 30);
      ctx.lineTo(W / 2 + 90, versetStartY - 30);
      ctx.stroke();

      setShadow(ctx, 25);
      versetLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, versetStartY + i * lh);
      });

      // Linie jos
      clearShadow(ctx);
      ctx.beginPath();
      ctx.moveTo(W / 2 - 90, versetStartY + versetH + 18);
      ctx.lineTo(W / 2 + 90, versetStartY + versetH + 18);
      ctx.stroke();

      ctx.restore();

      // ── REFERINȚĂ ──
      if (versetReferinta) {
        ctx.save();
        ctx.globalAlpha = refAlpha;
        setShadow(ctx, 12);
        ctx.font = `bold ${Math.round(fz * 0.48)}px 'Playfair Display', Georgia, serif`;
        ctx.fillStyle = '#D4AF37';
        ctx.textAlign = 'center';
        ctx.fillText(`\u2014 ${versetReferinta}`, W / 2, versetStartY + versetH + 70);
        ctx.restore();
      }

      // ── DESCRIERE ──
      if (descriere) {
        ctx.save();
        ctx.globalAlpha = descAlpha;
        setShadow(ctx, 12);
        ctx.font = '500 38px Inter, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.textAlign = 'center';

        const descText = descriere.length > 200
  ? descriere.substring(0, 200) + '...'
  : descriere;

const descLines = getLines(ctx, descText, W * 0.82, 5);
descLines.forEach((line, i) => {
  ctx.fillText(line, W / 2, versetStartY + versetH + 140 + i * 50);
});
        ctx.restore();
      }
    }

    // ── LOGO + BRAND (jos) ──
    const logo = loadedLogoRef.current;
    if (logo) {
      ctx.save();
      ctx.globalAlpha = logoAlpha;

      const logoH = 90;
      const logoY = H - 220;

      // Glow
      const glowGrad = ctx.createRadialGradient(W / 2, logoY + logoH / 2, logoH / 2, W / 2, logoY + logoH / 2, logoH / 2 + 40);
      glowGrad.addColorStop(0, 'rgba(212,175,55,0.3)');
      glowGrad.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.beginPath();
      ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 40, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Cerc background
      ctx.beginPath();
      ctx.arc(W / 2, logoY + logoH / 2, logoH / 2 + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212,175,55,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Logo circular
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, logoY + logoH / 2, logoH / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, W / 2 - logoH / 2, logoY, logoH, logoH);
      ctx.restore();

      // Text
      ctx.globalAlpha = logoAlpha * 0.85;
      ctx.font = '600 32px Inter, Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('popaspentrusuflet.ro', W / 2, logoY + logoH + 45);

      ctx.restore();
    }

    // ── WATERMARK COLȚURI ──
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.font = '600 20px Inter, Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('popaspentrusuflet.ro', 20, 30);
    ctx.textAlign = 'right';
    ctx.fillText('popaspentrusuflet.ro', W - 20, 30);
    ctx.textAlign = 'left';
    ctx.fillText('popaspentrusuflet.ro', 20, H - 15);
    ctx.textAlign = 'right';
    ctx.fillText('popaspentrusuflet.ro', W - 20, H - 15);
    ctx.restore();

  }, [versetText, versetReferinta, descriere]);

  // ═══════════════════════════════════════
  // GENERARE VIDEO
  // ═══════════════════════════════════════
  const genereazaReel = useCallback(async () => {
    if (!templateUrl) {
      alert('Selectează mai întâi un template de imagine.');
      return;
    }

    setStatus('generating');
    setProgress(0);
    setVideoUrl(null);
    setVideoBlob(null);
    setScheduleResult(null);
    chunksRef.current = [];

    // Încarcă imaginea
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = templateUrl;
    }).catch(() => null);

    if (!img) {
      setStatus('error');
      return;
    }

    loadedImgRef.current = img;

    const canvas = canvasRef.current;
    canvas.width = REEL_W;
    canvas.height = REEL_H;
    const ctx = canvas.getContext('2d');

    // Configurare MediaRecorder
    const stream = canvas.captureStream(FPS);
    const mimeType = MediaRecorder.isTypeSupported('video/mp4')
  ? 'video/mp4'
  : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

console.log('🎬 Format video ales:', mimeType);
	  

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 4000000 // 4 Mbps
    });

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setVideoBlob(blob);
      setStatus('done');
      setProgress(100);
    };

    recorder.start(100); // chunk la 100ms

    // Animație frame cu frame
    let frameIndex = 0;
    const interval = (DURATA_SEC * 1000) / TOTAL_FRAMES;

    const renderFrame = () => {
      if (frameIndex >= TOTAL_FRAMES) {
        recorder.stop();
        cancelAnimationFrame(animFrameRef.current);
        return;
      }

      drawFrame(ctx, img, frameIndex);
      setProgress(Math.round((frameIndex / TOTAL_FRAMES) * 100));
      frameIndex++;

      animFrameRef.current = setTimeout(renderFrame, interval);
    };

    renderFrame();

  }, [templateUrl, drawFrame]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animFrameRef.current) clearTimeout(animFrameRef.current);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // ═══════════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════════
  const handleDownload = () => {
  if (!videoUrl) return;
  const ext = videoBlob?.type?.includes('mp4') ? 'mp4' : 'webm';
  const link = document.createElement('a');
  link.href = videoUrl;
  link.download = `reel-popas-suflet-${Date.now()}.${ext}`;
  link.click();
};

  // ═══════════════════════════════════════
  // PROGRAMARE FACEBOOK
  // ═══════════════════════════════════════
  const handleSchedule = async () => {
    if (!videoBlob) return;
    if (!scheduledAt) {
      alert('Alege data și ora programării.');
      return;
    }

    setScheduling(true);
    setScheduleResult(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Convertim blob în base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(videoBlob);
      });

      const content = [descriere, hashtags].filter(Boolean).join('\n\n');

      const r = await axios.post(
        `${API}/api/social/schedule`,
        {
          content,
          hashtags,
          videoBase64: base64,
          tipMedia: 'video',
          platform: 'facebook',
          scheduledDate: new Date(scheduledAt).toISOString(),
          tema,
          verset: {
            text: versetText,
            referinta: versetReferinta
          }
        },
        { headers }
      );

      if (r.data.success) {
        setScheduleResult({
          success: true,
          message: `✅ Reel programat pentru ${new Date(scheduledAt).toLocaleString('ro-RO')}`
        });
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

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="reel-wrap">
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="reel-header">
        <div className="reel-header-left">
          <span className="reel-header-icon">🎬</span>
          <div>
            <div className="reel-header-title">Generează Reel</div>
            <div className="reel-header-sub">
              Video 15s · 1080×1920 · Optim Facebook/Instagram
            </div>
          </div>
        </div>
      </div>

      {/* Status idle */}
      {status === 'idle' && (
        <div className="reel-idle">
          <div className="reel-idle-icon">🎬</div>
          <p className="reel-idle-text">
            Generează un video Reel animat cu versetul și imaginea selectată.
            Perfect pentru Facebook Reels și Instagram Reels.
          </p>
          <div className="reel-features">
            <span className="reel-feature">✅ Zoom animat</span>
            <span className="reel-feature">✅ Text fade-in</span>
            <span className="reel-feature">✅ 15 secunde</span>
            <span className="reel-feature">✅ 1080×1920</span>
          </div>
          <button
            className="reel-gen-btn"
            onClick={genereazaReel}
            disabled={!templateUrl || !versetText}
          >
            🎬 Generează Reel
          </button>
          {(!templateUrl || !versetText) && (
            <div className="reel-warning">
              ⚠️ {!templateUrl ? 'Selectează un template' : 'Selectează un verset'}
            </div>
          )}
        </div>
      )}

      {/* Status generating */}
      {status === 'generating' && (
        <div className="reel-generating">
          <div className="reel-gen-icon">🎬</div>
          <div className="reel-gen-title">Se generează Reel-ul...</div>
          <div className="reel-gen-sub">
            {Math.round(progress / (100 / DURATA_SEC))}s / {DURATA_SEC}s procesate
          </div>
          <div className="reel-progress-bar">
            <div
              className="reel-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="reel-progress-pct">{progress}%</div>
          <div className="reel-gen-tip">
            💡 Nu închide pagina în timp ce se generează
          </div>
        </div>
      )}

      {/* Status error */}
      {status === 'error' && (
        <div className="reel-error">
          <div>❌ Eroare la generare</div>
          <button className="reel-gen-btn" onClick={() => setStatus('idle')}>
            🔄 Reîncearcă
          </button>
        </div>
      )}

      {/* Status done */}
      {status === 'done' && videoUrl && (
        <div className="reel-done">

          {/* Preview video */}
          <div className="reel-preview-wrap">
            <video
              src={videoUrl}
              controls
              loop
              className="reel-preview-video"
              style={{ maxHeight: 400 }}
            />
          </div>

          {/* Acțiuni */}
<div className="reel-actions">
  <button className="reel-action-btn reel-dl-btn" onClick={handleDownload}>
    ⬇️ Descarcă Reel
  </button>
  <button
    className="reel-action-btn reel-share-btn"
    onClick={() => {
      if (navigator.share && videoBlob) {
        const file = new File([videoBlob], 'reel-popas-suflet.webm', { type: videoBlob.type });
        navigator.share({
          title: 'Popas pentru Suflet — Reel',
          text: descriere || '',
          files: navigator.canShare && navigator.canShare({ files: [file] }) ? [file] : undefined
        }).catch(() => {});
      } else {
        handleDownload();
      }
    }}
  >
    📤 Share
  </button>
  <button
    className="reel-action-btn reel-regen-btn"
    onClick={() => {
      setStatus('idle');
      setVideoUrl(null);
      setVideoBlob(null);
    }}
  >
    🔄 Regenerează
  </button>
</div>

{/* Info postare manuală */}
<div className="reel-manual-info">
  <div className="reel-manual-title">📱 Cum postezi Reel-ul</div>
  <div className="reel-manual-step">
    <span className="reel-manual-num">1</span>
    <span>Descarcă video-ul pe telefon</span>
  </div>
  <div className="reel-manual-step">
    <span className="reel-manual-num">2</span>
    <span>Deschide Facebook → Creează Reel → selectează video</span>
  </div>
  <div className="reel-manual-step">
    <span className="reel-manual-num">3</span>
    <span>Adaugă textul copiat mai jos și publică</span>
  </div>
  <button
    className="reel-copy-text-btn"
    onClick={async () => {
      const text = [descriere, hashtags].filter(Boolean).join('\n\n');
      await navigator.clipboard.writeText(text);
      alert('✅ Text copiat!');
    }}
  >
    📋 Copiază textul pentru postare
  </button>
</div>

{/* Programare prin scheduler */}
{isAdmin && (
  <div className="reel-schedule-section">
    <button
      className="reel-schedule-toggle"
      onClick={() => setShowSchedule(prev => !prev)}
    >
      📅 {showSchedule ? 'Ascunde programare' : 'Programează pe Facebook'}
    </button>

    {showSchedule && (
      <div className="reel-schedule-form">
        <div className="reel-schedule-info">
          ℹ️ Video-ul va fi trimis automat la Facebook la data selectată prin serverul backend.
        </div>
        <label className="reel-schedule-label">
          Data și ora (ora României):
        </label>
        <input
          type="datetime-local"
          className="reel-schedule-input"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
        />
        <button
          className="reel-schedule-btn"
          onClick={handleSchedule}
          disabled={scheduling || !scheduledAt}
        >
          {scheduling
            ? '⏳ Se programează...'
            : '📅 Programează Reel'
          }
        </button>

        {scheduleResult && (
          <div className={`reel-schedule-result ${scheduleResult.success ? 'success' : 'error'}`}>
            {scheduleResult.message}
          </div>
        )}
      </div>
    )}
  </div>
)}

          {/* Tips */}
          <div className="reel-tips">
            <div className="reel-tip">
              📱 <strong>Facebook Reels:</strong> încarcă manual din aplicație pentru reach maxim
            </div>
            <div className="reel-tip">
              📸 <strong>Instagram Reels:</strong> descarcă și postează din Instagram
            </div>
            <div className="reel-tip">
              🎵 <strong>TikTok:</strong> descarcă și adaugă muzică din TikTok
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReelGenerator;