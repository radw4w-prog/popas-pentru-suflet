'use client';
// canvasGenerator.js — Generator Canvas premium pentru imagini cu versete
// Produce imagini similare cu cele de pe Facebook creștin

import { CITATE_TEOLOGI } from '../data/templates';

// ── Fonturi disponibile ──────────────────────────────────────
export const FONTURI = [
  { group: 'Elegante', opts: ['Playfair Display', 'Cinzel', 'Cormorant Garamond', 'EB Garamond'] },
  { group: 'Caligrafice', opts: ['Great Vibes', 'Dancing Script', 'Pacifico'] },
  { group: 'Clasice', opts: ['Lora', 'Merriweather', 'Georgia', 'Times New Roman'] },
  { group: 'Moderne', opts: ['Inter', 'Montserrat', 'Arial'] },
];

// ── Scheme de culori ─────────────────────────────────────────
export const SCHEME_CULORI = [
  { id: 'auriu', label: '✨ Auriu clasic', primary: '#F4D03F', secondary: '#FFFFFF', accent: '#FFD700' },
  { id: 'alb', label: '🤍 Alb pur', primary: '#FFFFFF', secondary: '#F0F0F0', accent: '#D4AF37' },
  { id: 'crem', label: '🍂 Crem cald', primary: '#FFF8E7', secondary: '#F5DEB3', accent: '#D4AF37' },
  { id: 'albastru', label: '💙 Albastru ceresc', primary: '#93C5FD', secondary: '#FFFFFF', accent: '#60A5FA' },
  { id: 'violet', label: '💜 Violet regal', primary: '#C4B5FD', secondary: '#FFFFFF', accent: '#A78BFA' },
  { id: 'rosu', label: '❤️ Roșu aprins', primary: '#FCA5A5', secondary: '#FFFFFF', accent: '#EF4444' },
  { id: 'verde', label: '💚 Verde speranță', primary: '#6EE7B7', secondary: '#FFFFFF', accent: '#10B981' },
];

// ── Simboluri creștine ────────────────────────────────────────
const SIMBOLURI = {
  cruce: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x - size * 0.08, y - size * 0.45, size * 0.16, size);
    ctx.fillRect(x - size * 0.35, y - size * 0.2, size * 0.7, size * 0.16);
  },
  stea: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✦', x, y);
  },
  porumbel: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🕊️', x, y);
  },
  floare: (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('❀', x, y);
  },
};

// ── Funcție principală de generare ───────────────────────────
export async function generateVerseImage(options) {
  const {
    template,
    versetText,
    versetRef,
    titlu = '',
    gandZilei = '',
    schema = SCHEME_CULORI[0],
    font = 'Playfair Display',
    fontSize = 28,
    pozitie = 'center',
    umbra = true,
    afiseazaCitat = false,
    afiseazaSimbol = 'cruce',
    stilLayout = 'clasic', // 'clasic' | 'modern' | 'minimalist'
    watermark = true,
  } = options;

  return new Promise((resolve) => {
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = template.url;

    img.onload = () => {
      try {
        // ── 1. Desenează imaginea de fundal ──
        const imgR = img.width / img.height;
        const canR = W / H;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (imgR > canR) { sw = img.height * canR; sx = (img.width - sw) / 2; }
        else { sh = img.width / canR; sy = (img.height - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

        // ── 2. Overlay gradient ──
        drawOverlay(ctx, W, H, stilLayout);

        // ── 3. Watermark discret ──
        if (watermark) drawWatermark(ctx, W, H);

        // ── 4. Decorații ──
        drawDecoratii(ctx, W, H, schema, stilLayout);

        // ── 5. Simbol creștin sus ──
        if (afiseazaSimbol && stilLayout !== 'minimalist') {
          drawSimbol(ctx, W, H, afiseazaSimbol, schema);
        }

        // ── 6. Titlu (dacă există) ──
        if (titlu && stilLayout !== 'minimalist') {
          drawTitlu(ctx, W, titlu, schema, font);
        }

        // ── 7. Text verset principal — cu cuvinte cheie colorate ──
        const versetY = drawVersetPrincipal(ctx, W, H, versetText, versetRef, schema, font, fontSize, pozitie, umbra, stilLayout);

        // ── 8. Gândul zilei (secundar) ──
        if (gandZilei) {
          drawGandSecundar(ctx, W, H, gandZilei, schema, versetY);
        }

        // ── 9. Citat teolog ──
        if (afiseazaCitat) {
          const citat = CITATE_TEOLOGI[Math.floor(Math.random() * CITATE_TEOLOGI.length)];
          drawCitatTeolog(ctx, W, H, citat, schema, font);
        }

        // ── 10. Branding jos ──
        drawBranding(ctx, W, H, schema);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (e) {
        console.error('Canvas error:', e);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
  });
}

// ── Overlay gradient (mai dramatic) ─────────────────────────
function drawOverlay(ctx, W, H, stil) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);

  if (stil === 'modern') {
    grad.addColorStop(0, 'rgba(0,0,0,0.2)');
    grad.addColorStop(0.3, 'rgba(0,0,0,0.45)');
    grad.addColorStop(0.65, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0.88)');
  } else if (stil === 'minimalist') {
    grad.addColorStop(0, 'rgba(0,0,0,0.5)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.55)');
    grad.addColorStop(1, 'rgba(0,0,0,0.75)');
  } else { // clasic
    grad.addColorStop(0, 'rgba(0,0,0,0.1)');
    grad.addColorStop(0.2, 'rgba(0,0,0,0.35)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.55)');
    grad.addColorStop(0.75, 'rgba(0,0,0,0.72)');
    grad.addColorStop(1, 'rgba(0,0,0,0.9)');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// ── Decorații (linii, ornamente) ─────────────────────────────
function drawDecoratii(ctx, W, H, schema, stil) {
  const gold = schema.primary;

  if (stil === 'minimalist') return;

  // Linie decorativă sus
  const gradLine = ctx.createLinearGradient(0, 0, W, 0);
  gradLine.addColorStop(0, 'transparent');
  gradLine.addColorStop(0.3, `${gold}99`);
  gradLine.addColorStop(0.7, `${gold}99`);
  gradLine.addColorStop(1, 'transparent');

  ctx.strokeStyle = gradLine;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W * 0.1, 80); ctx.lineTo(W * 0.9, 80); ctx.stroke();

  // Ornamente colțuri sus
  drawColtOrnament(ctx, 50, 50, 1, 1, gold);
  drawColtOrnament(ctx, W - 50, 50, -1, 1, gold);

  // Linie decorativă jos
  ctx.beginPath(); ctx.moveTo(W * 0.1, H - 80); ctx.lineTo(W * 0.9, H - 80); ctx.stroke();

  // Ornamente colțuri jos
  drawColtOrnament(ctx, 50, H - 50, 1, -1, gold);
  drawColtOrnament(ctx, W - 50, H - 50, -1, -1, gold);
}

function drawColtOrnament(ctx, x, y, dx, dy, color) {
  ctx.strokeStyle = `${color}88`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + dx * 35, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + dy * 35);
  ctx.stroke();

  // Punct decorativ
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

// ── Simbol creștin ───────────────────────────────────────────
function drawSimbol(ctx, W, H, tip, schema) {
  const gold = schema.primary;
  const y = 160;

  ctx.save();
  ctx.shadowColor = `${gold}66`;
  ctx.shadowBlur = 20;

  if (tip === 'cruce') {
    // Cruce stilizată
    const cH = 70, cW = 16, bW = 50, bH = 16;
    const cx = W / 2;
    ctx.fillStyle = gold;
    // Vertical
    ctx.fillRect(cx - cW / 2, y - cH / 2, cW, cH);
    // Orizontal
    ctx.fillRect(cx - bW / 2, y - cH * 0.15, bW, bH);
    // Efect strălucire
    ctx.shadowBlur = 30;
    ctx.shadowColor = `${gold}88`;
    ctx.fillRect(cx - cW / 2, y - cH / 2, cW, cH);
  } else if (tip === 'stea') {
    ctx.font = '60px serif';
    ctx.fillStyle = gold;
    ctx.textAlign = 'center';
    ctx.fillText('✦', W / 2, y + 20);
  } else if (tip === 'floare') {
    ctx.font = '55px serif';
    ctx.fillStyle = gold;
    ctx.textAlign = 'center';
    ctx.fillText('❀', W / 2, y + 20);
  }

  ctx.restore();
}

// ── Titlu ────────────────────────────────────────────────────
function drawTitlu(ctx, W, titlu, schema, font) {
  ctx.save();
  ctx.font = `600 26px '${font}', Georgia, serif`;
  ctx.fillStyle = schema.primary;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '3px';

  // Umbră
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 15;

  const maxW = W * 0.75;
  const lines = wrapText(ctx, titlu.toUpperCase(), maxW);
  let y = 240;
  lines.forEach(line => {
    ctx.fillText(line, W / 2, y);
    y += 34;
  });
  ctx.restore();
}

// ── Text verset principal cu cuvinte cheie colorate ──────────
function drawVersetPrincipal(ctx, W, H, text, ref, schema, font, fontSize, pozitie, umbra, stil) {
  ctx.save();

  const fz = fontSize * 2;
  const maxW = W * 0.82;
  const lh = fz * 1.55;

  // Calculează liniile
  ctx.font = `italic ${fz}px '${font}', Georgia, serif`;
  const versetComplet = `„${text}"`;
  const lines = wrapTextAdvanced(ctx, versetComplet, maxW, 8);
  const totalH = lines.length * lh;

  // Poziție Y
  let startY;
  if (stil === 'modern') {
    startY = H * 0.35;
  } else if (pozitie === 'top') {
    startY = 320;
  } else if (pozitie === 'bottom') {
    startY = H - totalH - 280;
  } else {
    startY = Math.max(320, (H - totalH) / 2 - 40);
  }

  // Linie separatoare sus
  drawSeparator(ctx, W, startY - 30, schema.primary);

  // Text verset — cu highlight pe cuvinte cheie
  if (umbra) {
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
  }

  ctx.font = `italic ${fz}px '${font}', Georgia, serif`;
  ctx.textAlign = 'center';

  lines.forEach((line, i) => {
    // Detectează cuvinte cheie și colorează-le
    drawLineWithHighlight(ctx, line, W / 2, startY + i * lh, schema, fz, font);
  });

  const afterVerset = startY + totalH;

  // Linie separatoare jos
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  drawSeparator(ctx, W, afterVerset + 20, schema.primary);

  // Referință versetul
  ctx.font = `bold ${Math.round(fz * 0.42)}px '${font}', Georgia, serif`;
  ctx.fillStyle = schema.primary;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 15;

  // Liniuță + referință
  ctx.fillText(`— ${ref} —`, W / 2, afterVerset + 65);

  ctx.restore();
  return afterVerset + 65;
}

// ── Desenează o linie cu cuvinte cheie colorate ──────────────
function drawLineWithHighlight(ctx, line, x, y, schema, fz, font) {
  // Cuvinte care primesc culoarea principală (auriu/accent)
  const CUVINTE_CHEIE = [
    'Dumnezeu', 'Domnul', 'Hristos', 'Isus', 'Iisus', 'Tatăl', 'Duhul',
    'iubire', 'dragoste', 'har', 'credință', 'nădejde', 'pace', 'bucurie',
    'mântuire', 'viață', 'adevăr', 'lumină', 'putere', 'slavă',
    'Sfânt', 'veșnic', 'iertare', 'binecuvântare'
  ];

  const words = line.split(' ');
  ctx.textAlign = 'center';

  // Calculează lățimea totală pentru centrare
  ctx.font = `italic ${fz}px '${font}', Georgia, serif`;

  // Desenează simplu — cuvintele cheie vor fi în altă culoare
  // Implementare simplificată: desenăm tot textul normal dar cu umbră
  const isCuvantCheie = words.some(w =>
    CUVINTE_CHEIE.some(ck => w.toLowerCase().includes(ck.toLowerCase()))
  );

  if (isCuvantCheie && line.length < 30) {
    // Linie scurtă cu cuvânt cheie — o colorăm diferit
    ctx.fillStyle = schema.primary;
    ctx.font = `bold italic ${fz * 1.05}px '${font}', Georgia, serif`;
  } else {
    ctx.fillStyle = schema.secondary;
    ctx.font = `italic ${fz}px '${font}', Georgia, serif`;
  }

  ctx.fillText(line, x, y);
}

// ── Gândul zilei (text secundar) ────────────────────────────
function drawGandSecundar(ctx, W, H, gand, schema, afterY) {
  ctx.save();

  const gandY = Math.min(afterY + 100, H - 300);
  const fz = 36;
  const maxW = W * 0.75;

  ctx.font = `500 ${fz}px 'Inter', Arial, sans-serif`;
  ctx.fillStyle = `${schema.primary}CC`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 10;

  ctx.fillText('✦ Gândul zilei ✦', W / 2, gandY);

  ctx.font = `italic ${fz * 0.9}px Georgia, serif`;
  ctx.fillStyle = `${schema.secondary}CC`;

  const lines = wrapText(ctx, gand, maxW, 3);
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, gandY + 50 + i * 46);
  });

  ctx.restore();
}

// ── Citat teolog ─────────────────────────────────────────────
function drawCitatTeolog(ctx, W, H, citat, schema, font) {
  ctx.save();

  const y = H - 220;
  const maxW = W * 0.78;

  // Fundal semitransparent pentru citat
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  const boxH = 120;
  roundRect(ctx, W * 0.08, y - 20, W * 0.84, boxH, 12);
  ctx.fill();

  // Ghilimele decorative
  ctx.font = `bold 36px '${font}', serif`;
  ctx.fillStyle = `${schema.primary}88`;
  ctx.textAlign = 'left';
  ctx.fillText('❝', W * 0.1, y + 20);

  // Text citat
  ctx.font = `italic 28px '${font}', Georgia, serif`;
  ctx.fillStyle = `${schema.secondary}DD`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;

  const lines = wrapText(ctx, citat.text, maxW, 2);
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, y + 30 + i * 38);
  });

  // Autor
  ctx.font = `600 24px 'Inter', Arial, sans-serif`;
  ctx.fillStyle = schema.primary;
  ctx.textAlign = 'center';
  ctx.fillText(`— ${citat.autor}`, W / 2, y + boxH - 15);

  ctx.restore();
}

// ── Branding jos ─────────────────────────────────────────────
function drawBranding(ctx, W, H) {
  ctx.save();

  // Text watermark discret
  ctx.globalAlpha = 0.55;
  ctx.font = '600 22px Inter, Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 10;
  ctx.fillText('🕊️ popas-pentru-suflet.vercel.app', W / 2, H - 35);

  ctx.restore();
}

// ── Watermark repetat discret ─────────────────────────────────
function drawWatermark(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.font = '700 22px Inter, Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  for (let y = 80; y < H; y += 130) {
    for (let x = 60; x < W; x += 400) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.35);
      ctx.fillText('popaspentrusuflet.ro', 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

// ── Separator auriu ──────────────────────────────────────────
function drawSeparator(ctx, W, y, color) {
  const grad = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.3, `${color}88`);
  grad.addColorStop(0.7, `${color}88`);
  grad.addColorStop(1, 'transparent');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.1, y);
  ctx.lineTo(W * 0.9, y);
  ctx.stroke();
}

// ── Helper: wrap text ────────────────────────────────────────
function wrapText(ctx, text, maxW, maxLines = 10) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur + w + ' ';
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur.trim());
      cur = w + ' ';
      if (lines.length >= maxLines - 1) break;
    } else { cur = t; }
  }
  lines.push(cur.trim());
  return lines.slice(0, maxLines);
}

function wrapTextAdvanced(ctx, text, maxW, maxLines = 8) {
  return wrapText(ctx, text, maxW, maxLines);
}

// ── Helper: rounded rect ─────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
