// backend/routes/ogImage.js
// Endpoint: GET /api/og-image
// Returnează o imagine PNG 1200x630 cu versetul zilei
// Folosit pentru Open Graph (WhatsApp, Facebook, Twitter preview)

const express = require('express');
const router = express.Router();
const { createCanvas, registerFont } = require('canvas');
const { getTodayDevotional } = require('../services/devotionalService');

// Cache simplu în memorie — regenerează o dată pe zi
let cache = { date: null, buffer: null };

router.get('/', async (req, res) => {
  try {
    const azi = new Date().toISOString().split('T')[0];

    // Returnează din cache dacă e același zi
    if (cache.date === azi && cache.buffer) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(cache.buffer);
    }

    // Ia devoționalul zilei
    const devotional = await getTodayDevotional();
    const verseText = devotional?.verseText || 'Domnul este lumina și mântuirea mea.';
    const verseRef  = devotional?.verseReference || 'Psalmi 27:1';
    const title     = devotional?.title || 'Popas pentru Suflet';

    // ── Canvas 1200x630 (standard OG) ──────────────────────────
    const W = 1200;
    const H = 630;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // ── Fundal ──────────────────────────────────────────────────
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    // ── Gradient overlay decorativ ───────────────────────────────
    const grad = ctx.createRadialGradient(W * 0.15, H * 0.3, 0, W * 0.15, H * 0.3, W * 0.6);
    grad.addColorStop(0, 'rgba(212,175,55,0.12)');
    grad.addColorStop(1, 'rgba(212,175,55,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Border auriu ─────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(212,175,55,0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    // ── Colțuri decorative ───────────────────────────────────────
    const drawCorner = (x, y, dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * 30, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * 30);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    drawCorner(40, 40, 1, 1);
    drawCorner(W - 40, 40, -1, 1);
    drawCorner(40, H - 40, 1, -1);
    drawCorner(W - 40, H - 40, -1, -1);

    // ── Logo / Emoji ─────────────────────────────────────────────
    ctx.font = '52px serif';
    ctx.textAlign = 'left';
    ctx.fillText('🕊️', 70, 105);

    // ── Nume site ─────────────────────────────────────────────────
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.textAlign = 'left';
    ctx.fillText('Popas pentru Suflet', 130, 100);

    // ── Linie separator ───────────────────────────────────────────
    const sepGrad = ctx.createLinearGradient(70, 0, W - 70, 0);
    sepGrad.addColorStop(0, 'rgba(212,175,55,0)');
    sepGrad.addColorStop(0.3, 'rgba(212,175,55,0.6)');
    sepGrad.addColorStop(0.7, 'rgba(212,175,55,0.6)');
    sepGrad.addColorStop(1, 'rgba(212,175,55,0)');
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 125);
    ctx.lineTo(W - 70, 125);
    ctx.stroke();

    // ── Titlu devoțional ─────────────────────────────────────────
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = 'rgba(167,139,250,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(title.length > 50 ? title.substring(0, 50) + '…' : title, W / 2, 185);

    // ── Helper wrapText ───────────────────────────────────────────
    const wrapText = (text, maxW, lineH, startY, maxLines = 5) => {
      const words = text.split(' ');
      let line = '';
      let y = startY;
      let count = 0;
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxW && line) {
          if (count >= maxLines - 1) {
            ctx.fillText(line.trim() + '…', W / 2, y);
            return y;
          }
          ctx.fillText(line.trim(), W / 2, y);
          line = word + ' ';
          y += lineH;
          count++;
        } else {
          line = test;
        }
      }
      ctx.fillText(line.trim(), W / 2, y);
      return y;
    };

    // ── Ghilimele decorative ─────────────────────────────────────
    ctx.font = 'bold 120px serif';
    ctx.fillStyle = 'rgba(212,175,55,0.08)';
    ctx.textAlign = 'left';
    ctx.fillText('\u201C', 55, 320);

    // ── Text verset ──────────────────────────────────────────────
    ctx.font = 'italic 34px serif';
    ctx.fillStyle = '#f0f0f0';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 15;

    const versetDisplay = `\u201C${verseText}\u201D`;
    const lastY = wrapText(versetDisplay, W - 160, 50, 250, 5);

    // ── Referință verset ─────────────────────────────────────────
    ctx.shadowBlur = 0;
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.textAlign = 'center';
    ctx.fillText(`\u2014 ${verseRef}`, W / 2, lastY + 60);

    // ── Footer ───────────────────────────────────────────────────
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'center';
    ctx.fillText('popas-pentru-suflet.vercel.app', W / 2, H - 50);

    // ── Generează buffer PNG ──────────────────────────────────────
    const buffer = canvas.toBuffer('image/png');

    // Salvează în cache
    cache = { date: azi, buffer };

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);

  } catch (err) {
    console.error('❌ OG Image error:', err.message);

    // Fallback — imagine simplă cu text static
    const W = 1200, H = 630;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.textAlign = 'center';
    ctx.fillText('🕊️ Popas pentru Suflet', W / 2, H / 2 - 30);
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText('Biblia online, devoțional zilnic și rugăciuni', W / 2, H / 2 + 30);

    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer('image/png'));
  }
});

module.exports = router;
