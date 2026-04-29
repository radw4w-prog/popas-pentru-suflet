// backend/services/imageGenerator.js
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Creăm directoarele necesare
const dirs = ['generated', 'generated/images', 'uploads', 'assets/fonts', 'assets/backgrounds'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

/**
 * Palete de culori pentru diferite stiluri
 */
const colorPalettes = {
  nature: {
    background: '#1a3a2a',
    gradientStart: 'rgba(26, 58, 42, 0.9)',
    gradientEnd: 'rgba(15, 35, 25, 0.95)',
    text: '#FFFFFF',
    accent: '#7CB342',
    reference: '#A5D6A7',
    decorative: 'rgba(124, 179, 66, 0.3)'
  },
  minimalist: {
    background: '#FAFAFA',
    gradientStart: 'rgba(250, 250, 250, 0.95)',
    gradientEnd: 'rgba(240, 240, 240, 0.98)',
    text: '#2C2C2C',
    accent: '#8B6914',
    reference: '#666666',
    decorative: 'rgba(139, 105, 20, 0.15)'
  },
  warm: {
    background: '#3E1F0D',
    gradientStart: 'rgba(62, 31, 13, 0.85)',
    gradientEnd: 'rgba(40, 20, 8, 0.92)',
    text: '#FFF8E1',
    accent: '#FFB74D',
    reference: '#FFCC02',
    decorative: 'rgba(255, 183, 77, 0.2)'
  },
  sunrise: {
    background: '#1A1A2E',
    gradientStart: 'rgba(255, 111, 0, 0.7)',
    gradientEnd: 'rgba(26, 26, 46, 0.9)',
    text: '#FFFFFF',
    accent: '#FF6F00',
    reference: '#FFD54F',
    decorative: 'rgba(255, 213, 79, 0.25)'
  },
  sunset: {
    background: '#1A1A2E',
    gradientStart: 'rgba(156, 39, 176, 0.6)',
    gradientEnd: 'rgba(26, 26, 46, 0.9)',
    text: '#FFFFFF',
    accent: '#CE93D8',
    reference: '#F8BBD9',
    decorative: 'rgba(206, 147, 216, 0.2)'
  },
  sky: {
    background: '#0D47A1',
    gradientStart: 'rgba(13, 71, 161, 0.8)',
    gradientEnd: 'rgba(5, 30, 80, 0.95)',
    text: '#FFFFFF',
    accent: '#64B5F6',
    reference: '#BBDEFB',
    decorative: 'rgba(100, 181, 246, 0.2)'
  },
  floral: {
    background: '#2D1B38',
    gradientStart: 'rgba(45, 27, 56, 0.85)',
    gradientEnd: 'rgba(25, 15, 35, 0.95)',
    text: '#FFFFFF',
    accent: '#F48FB1',
    reference: '#F8BBD0',
    decorative: 'rgba(244, 143, 177, 0.2)'
  },
  mountains: {
    background: '#1B2838',
    gradientStart: 'rgba(27, 40, 56, 0.85)',
    gradientEnd: 'rgba(15, 25, 40, 0.95)',
    text: '#FFFFFF',
    accent: '#78909C',
    reference: '#B0BEC5',
    decorative: 'rgba(120, 144, 156, 0.25)'
  },
  water: {
    background: '#004D40',
    gradientStart: 'rgba(0, 77, 64, 0.85)',
    gradientEnd: 'rgba(0, 45, 38, 0.95)',
    text: '#FFFFFF',
    accent: '#4DD0E1',
    reference: '#B2EBF2',
    decorative: 'rgba(77, 208, 225, 0.2)'
  },
  light: {
    background: '#FFF9C4',
    gradientStart: 'rgba(255, 249, 196, 0.9)',
    gradientEnd: 'rgba(255, 245, 157, 0.95)',
    text: '#3E2723',
    accent: '#F9A825',
    reference: '#5D4037',
    decorative: 'rgba(249, 168, 37, 0.2)'
  }
};

/**
 * Desparte textul în linii care încap pe imagine
 */
const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

/**
 * Desenează decorațiuni pe imagine
 */
const drawDecorations = (ctx, width, height, palette, style) => {
  ctx.save();
  
  // Bordură decorativă
  ctx.strokeStyle = palette.decorative;
  ctx.lineWidth = 3;
  
  // Cadru exterior
  const margin = 30;
  const radius = 15;
  ctx.beginPath();
  ctx.roundRect(margin, margin, width - 2 * margin, height - 2 * margin, radius);
  ctx.stroke();
  
  // Cadru interior subtil
  ctx.strokeStyle = palette.accent + '40';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(margin + 10, margin + 10, width - 2 * (margin + 10), height - 2 * (margin + 10), radius - 5);
  ctx.stroke();
  
  // Decorație colțuri - cruciulițe subtile
  const cornerSize = 25;
  const corners = [
    { x: margin + 20, y: margin + 20 },
    { x: width - margin - 20, y: margin + 20 },
    { x: margin + 20, y: height - margin - 20 },
    { x: width - margin - 20, y: height - margin - 20 }
  ];
  
  ctx.strokeStyle = palette.accent + '60';
  ctx.lineWidth = 2;
  
  corners.forEach(corner => {
    // Cruciuliță simplă
    ctx.beginPath();
    ctx.moveTo(corner.x - cornerSize/3, corner.y);
    ctx.lineTo(corner.x + cornerSize/3, corner.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y - cornerSize/3);
    ctx.lineTo(corner.x, corner.y + cornerSize/3);
    ctx.stroke();
  });
  
  // Simbol porumbel / cruce în partea de sus centrală
  ctx.fillStyle = palette.accent + '80';
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.fillText('✟', width / 2, margin + 28);
  
  // Linie decorativă sub simbol
  ctx.strokeStyle = palette.accent + '50';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, margin + 40);
  ctx.lineTo(width / 2 + 40, margin + 40);
  ctx.stroke();
  
  ctx.restore();
};

/**
 * Generează imagine cu verset biblic
 */
const generateVerseImage = async (verseText, reference, options = {}) => {
  const {
    width = 1080,
    height = 1080,
    style = 'nature',
    showLogo = true,
    fontSize = 0 // 0 = auto
  } = options;

  const palette = colorPalettes[style] || colorPalettes.nature;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // === FUNDAL ===
  // Gradient de fundal
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, palette.gradientStart);
  bgGradient.addColorStop(0.5, palette.background);
  bgGradient.addColorStop(1, palette.gradientEnd);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Efect de textură subtilă
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 100 + 20,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // === DECORAȚIUNI ===
  drawDecorations(ctx, width, height, palette, style);

  // === GHILIMELE DESCHISE ===
  ctx.fillStyle = palette.accent + '40';
  ctx.font = 'bold 120px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('„', 60, 180);

  // === TEXT VERSET ===
  const maxTextWidth = width - 160; // Margini stânga-dreapta
  
  // Calculăm dimensiunea fontului în funcție de lungimea textului
  let textFontSize = fontSize;
  if (textFontSize === 0) {
    if (verseText.length < 50) textFontSize = 42;
    else if (verseText.length < 100) textFontSize = 36;
    else if (verseText.length < 150) textFontSize = 32;
    else if (verseText.length < 200) textFontSize = 28;
    else if (verseText.length < 300) textFontSize = 24;
    else textFontSize = 22;
  }
  
  ctx.font = `italic ${textFontSize}px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = palette.text;
  ctx.textAlign = 'center';
  
  const lines = wrapText(ctx, `„${verseText}"`, maxTextWidth);
  const lineHeight = textFontSize * 1.6;
  const totalTextHeight = lines.length * lineHeight;
  
  // Centrăm vertical textul
  const startY = (height - totalTextHeight) / 2;
  
  // Desenăm fiecare linie
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    
    // Umbră text
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(line, width / 2 + 2, y + 2);
    
    // Text principal
    ctx.fillStyle = palette.text;
    ctx.fillText(line, width / 2, y);
  });

  // === LINIE SEPARATOARE ===
  const separatorY = startY + totalTextHeight + 30;
  ctx.strokeStyle = palette.accent + '60';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, separatorY);
  ctx.lineTo(width / 2 - 10, separatorY);
  ctx.stroke();
  
  // Simbol central pe linie
  ctx.fillStyle = palette.accent;
  ctx.font = '16px serif';
  ctx.textAlign = 'center';
  ctx.fillText('❦', width / 2, separatorY + 5);
  
  ctx.beginPath();
  ctx.moveTo(width / 2 + 10, separatorY);
  ctx.lineTo(width / 2 + 80, separatorY);
  ctx.stroke();

  // === REFERINȚĂ BIBLICĂ ===
  const refY = separatorY + 45;
  ctx.font = `bold ${Math.max(textFontSize - 4, 18)}px Georgia, serif`;
  ctx.fillStyle = palette.reference;
  ctx.textAlign = 'center';
  ctx.fillText(`— ${reference} —`, width / 2, refY);

  // === LOGO / BRANDING ===
  if (showLogo) {
    // Linie de separare
    ctx.strokeStyle = palette.decorative;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, height - 90);
    ctx.lineTo(width / 2 + 100, height - 90);
    ctx.stroke();
    
    // Numele paginii
    ctx.font = `18px Georgia, serif`;
    ctx.fillStyle = palette.accent + 'CC';
    ctx.textAlign = 'center';
    ctx.fillText('🕊️ Popas pentru Suflet', width / 2, height - 60);
    
    // Sub-text
    ctx.font = `12px Georgia, serif`;
    ctx.fillStyle = palette.accent + '80';
    ctx.fillText('www.facebook.com/popaspentrusuflet', width / 2, height - 38);
  }

  // === SALVARE IMAGINE ===
  const timestamp = Date.now();
  const filename = `verse_${timestamp}.png`;
  const filepath = path.join(__dirname, '..', 'generated', 'images', filename);

  // Salvăm cu Canvas
  const buffer = canvas.toBuffer('image/png');
  
  // Optimizăm cu Sharp
  await sharp(buffer)
    .png({ quality: 90, compressionLevel: 6 })
    .toFile(filepath);

  return {
    filename,
    filepath,
    url: `/generated/images/${filename}`,
    width,
    height,
    style
  };
};

/**
 * Generează imagini în multiple formate
 */
const generateMultiFormatImages = async (verseText, reference, options = {}) => {
  const formats = {
    square: { width: 1080, height: 1080 },     // Instagram, Facebook
    portrait: { width: 1080, height: 1350 },    // Instagram portrait
    story: { width: 1080, height: 1920 },       // Stories
    landscape: { width: 1200, height: 630 }     // Facebook link preview
  };

  const results = {};
  
  for (const [format, dimensions] of Object.entries(formats)) {
    if (options.formats && !options.formats.includes(format)) continue;
    
    try {
      results[format] = await generateVerseImage(verseText, reference, {
        ...options,
        ...dimensions
      });
    } catch (error) {
      console.error(`Eroare la generarea formatului ${format}:`, error);
    }
  }

  return results;
};

/**
 * Returnează lista de stiluri disponibile
 */
const getAvailableStyles = () => {
  return Object.keys(colorPalettes).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    colors: colorPalettes[key]
  }));
};

module.exports = {
  generateVerseImage,
  generateMultiFormatImages,
  getAvailableStyles,
  colorPalettes
};