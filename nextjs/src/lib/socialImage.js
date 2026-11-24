export const SOCIAL_FORMATS = {
  feed: {label: 'Facebook Feed', width: 1080, height: 1350},
  vertical: {label: 'Vertical Reels / TikTok', width: 1080, height: 1920},
};
// Fără eliminare de cuvinte; cuvintele foarte lungi produc avertizare de depășire.
export function wrapSocialText(ctx, text, maxWidth) {
  const lines = []; let line = '';
  for (const word of String(text).trim().split(/\s+/)) {
    if (!word) continue;
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {lines.push(line); line = word;}
    else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}
export function fitSocialText(ctx, text, width, height, font, requested = 60, min = 44) {
  for (let size = Math.max(min, Math.min(90, requested)); size >= min; size -= 2) {
    ctx.font = `italic ${size}px '${font}', Georgia, serif`;
    const lines = wrapSocialText(ctx, text, width);
    const lineHeight = size * 1.5;
    if (lines.length * lineHeight <= height && lines.every(line => ctx.measureText(line).width <= width)) {
      return {lines, size, lineHeight};
    }
  }
  return null;
}
export function drawVerticalSocialImage(ctx, img, options) {
  const W = 1080, H = 1920;
  ctx.canvas.width = W; ctx.canvas.height = H;
  const ratio = Math.max(W / img.width, H / img.height);
  const dw = img.width * ratio, dh = img.height * ratio;
  ctx.drawImage(img, (W-dw)/2, (H-dh)/2, dw, dh);
  const overlay = ctx.createLinearGradient(0,0,0,H);
  overlay.addColorStop(0,'rgba(10,5,9,.48)'); overlay.addColorStop(.5,'rgba(10,5,9,.70)'); overlay.addColorStop(1,'rgba(10,5,9,.85)');
  ctx.fillStyle = overlay; ctx.fillRect(0,0,W,H);
  // Conservative central composition; platform UI/cropping may vary.
  const center = 500, width = 800;
  const fit = fitSocialText(ctx, `„${options.text}”`, width, 790, options.font, options.fontSize * 2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (!fit) {
    ctx.fillStyle = '#ffffff'; ctx.font = '42px Georgia';
    ctx.fillText('Text prea lung pentru acest format.', center, 800);
    return {error: 'Versetul nu încape lizibil în formatul vertical. Alege alt pasaj sau o compoziție pe mai multe slide-uri. Exportul este oprit; textul nu a fost tăiat.'};
  }
  ctx.fillStyle = '#e9c975'; ctx.font = '64px Georgia';
  if (options.symbol !== 'none' && options.symbol) ctx.fillText(options.symbol === 'cruce' ? '✝' : options.symbol === 'porumbel' ? '🕊' : '✦', center, 270);
  const blockH = fit.lines.length * fit.lineHeight;
  const top = options.position === 'top' ? 380 : options.position === 'bottom' ? 1210 - blockH : 380 + (790-blockH)/2;
  ctx.font = `italic ${fit.size}px '${options.font}', Georgia, serif`;
  ctx.fillStyle = options.color || '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 14;
  fit.lines.forEach((line,i)=>ctx.fillText(line,center,top+fit.size+i*fit.lineHeight));
  const refY = top+blockH+65;
  ctx.font = 'bold 34px Georgia'; ctx.fillStyle = '#f2d891';
  const refs = wrapSocialText(ctx, options.reference || '', width);
  if (refs.length > 2 || refs.some(line => ctx.measureText(line).width > width)) return {error: 'Referința este prea lungă. Verifică textul referinței înainte de export.'};
  refs.forEach((line,i)=>ctx.fillText(line,center,refY+i*44));
  const warnings = [];
  const extra = options.quote ? `„${options.quote.text}” — ${options.quote.autor || options.quote.author || ''}` : options.thought;
  if (extra) {
    ctx.font = 'italic 30px Georgia';
    const extraLines = wrapSocialText(ctx,extra,760);
    const extraY = Math.max(1360, refY+refs.length*44+60);
    if (extraY+extraLines.length*42 <= 1550 && extraLines.every(line=>ctx.measureText(line).width<=760)) {
      ctx.fillStyle = '#f4e9d2'; extraLines.forEach((line,i)=>ctx.fillText(line,center,extraY+i*42));
    } else warnings.push('Textul secundar nu încape în zona rezervată și nu este inclus în imaginea verticală. Versetul este păstrat integral.');
    if (options.quote && options.thought) warnings.push('În format vertical, citatul selectat are prioritate față de gândul zilei.');
  }
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2; ctx.beginPath();ctx.moveTo(360,1600);ctx.lineTo(640,1600);ctx.stroke();
  if (options.logo) ctx.drawImage(options.logo,465,1630,70,70);
  ctx.font = '600 28px Georgia';ctx.fillStyle='#f4e9d2';ctx.fillText('Popas pentru Suflet',center,1740);
  return {warnings};
}
