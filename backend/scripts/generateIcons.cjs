const fs = require('fs');
const path = require('path');

// Creează folderul icons
const iconsDir = path.join(__dirname, '../../frontend/public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG simplu pentru icon (fallback dacă nu ai sharp)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0a0f"/>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <defs>
    <radialGradient id="grad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0a0a0f"/>
    </radialGradient>
  </defs>
  <text x="50%" y="52%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle">🕊️</text>
  <text x="50%" y="82%" font-size="${size * 0.1}" text-anchor="middle" fill="#d4af37" font-family="serif" font-weight="bold">POPAS</text>
</svg>`;

sizes.forEach(size => {
  const svgPath = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svgIcon(size));
  console.log(`✅ Creat: icon-${size}.svg`);
});

console.log('\n📌 IMPORTANT:');
console.log('   Convertește SVG-urile în PNG manual sau cu un tool online:');
console.log('   https://svgtopng.com sau https://cloudconvert.com');
console.log('\n   SAU instalează sharp și rulează scriptul cu conversie automată:');
console.log('   npm install sharp');
console.log('\n   Fișierele SVG sunt în:');
console.log(`   ${iconsDir}`);