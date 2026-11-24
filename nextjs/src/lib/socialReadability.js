// Estimare prin eșantionarea fundalului înainte de desenarea versetului.
// Nu este audit WCAG complet, OCR sau verificarea tuturor pixelilor/glifelor.
export function hexRgb(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return null;
  return [1,3,5].map(index => parseInt(hex.slice(index,index+2),16));
}
export function relativeLuminance(rgb) {
  const channels = rgb.map(value => {const s = value/255; return s <= .04045 ? s/12.92 : ((s+.055)/1.055)**2.4;});
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
}
export function contrastRatio(a,b) {
  const x=relativeLuminance(a),y=relativeLuminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function sampleTextContrast(ctx, area, colors) {
  const x=Math.max(0,Math.floor(area.x)), y=Math.max(0,Math.floor(area.y));
  const width=Math.min(ctx.canvas.width-x, Math.ceil(area.width));
  const height=Math.min(ctx.canvas.height-y, Math.ceil(area.height));
  const parsed=colors.map(hexRgb);
  if (width<=0 || height<=0 || parsed.some(color=>!color)) return null;
  const {data}=ctx.getImageData(x,y,width,height);
  let lowest=21;
  const stride=16;
  for(let py=0;py<height;py+=stride) for(let px=0;px<width;px+=stride) {
    const index=(py*width+px)*4;
    const rgb=[data[index],data[index+1],data[index+2]];
    for(const color of parsed) lowest=Math.min(lowest,contrastRatio(color,rgb));
  }
  return lowest;
}
export function checkVerseReadability(ctx, area, color, autoCorrect=false, accents=[]) {
  let before;
  try {before=sampleTextContrast(ctx,area,[color,...accents]);}
  catch (_) {return {color, before:null, after:null, corrected:false, warning:'Contrastul nu poate fi estimat pentru acest fundal (acces canvas restricționat).'};}
  if (before === null) return {color,before:null,after:null,corrected:false,warning:'Contrastul nu a putut fi estimat.'};
  let after=before,corrected=false,effectiveColor=color;
  if(before<4.5 && autoCorrect) {
    ctx.save();ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
    ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(area.x-16,area.y-16,area.width+32,area.height+32);ctx.restore();
    effectiveColor='#FFFFFF';corrected=true;
    try {after=sampleTextContrast(ctx,area,[effectiveColor,...accents]);} catch (_) {after=null;}
  }
  return {color:effectiveColor,before,after,corrected,
    warning:after===null?'Contrastul final nu a putut fi estimat.':after<4.5?'Contrast estimat redus: schimbă fundalul/culoarea sau activează corectarea automată.':null};
}
export function readabilityMessages(report,fontSize) {
  const messages=[];
  if(report.after!==null) messages.push(`Contrast estimat al versetului: ${report.after.toFixed(1)}:1 (prag orientativ 4,5:1, eșantionare fundal).`);
  if(report.corrected) messages.push('Corectare aplicată: panou întunecat și text alb. Culoarea aleasă rămâne salvată în editor; corectarea se poate dezactiva.');
  if(report.warning) messages.push(report.warning);
  const phoneSize=fontSize*320/1080;
  if(phoneSize<14) messages.push(`Versetul ar avea aproximativ ${phoneSize.toFixed(1)} px într-o imagine lată de 320 px. Verifică dacă se citește confortabil; acesta nu este un prag universal.`);
  return messages;
}
