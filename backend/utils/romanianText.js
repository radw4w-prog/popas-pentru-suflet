// backend/utils/romanianText.js

/**
 * Utilitar pentru procesarea textului în limba română
 * Asigură utilizarea corectă a diacriticelor și formatarea
 */

// Mapare caractere cu diacritice
const diacriticeMap = {
  'ă': 'ă', 'â': 'â', 'î': 'î', 'ș': 'ș', 'ț': 'ț',
  'Ă': 'Ă', 'Â': 'Â', 'Î': 'Î', 'Ș': 'Ș', 'Ț': 'Ț',
  // Variante vechi (cedilla) -> variante corecte (comma below)
  'ş': 'ș', 'ţ': 'ț', 'Ş': 'Ș', 'Ţ': 'Ț'
};

/**
 * Corectează diacriticele românești (cedilla -> comma below)
 */
const fixDiacritice = (text) => {
  if (!text) return '';
  return text.replace(/[şţŞŢ]/g, (char) => diacriticeMap[char] || char);
};

/**
 * Verifică dacă textul conține doar caractere românești valide
 */
const isValidRomanianText = (text) => {
  const romanianPattern = /^[a-zA-ZăâîșțĂÂÎȘȚ0-9\s.,!?;:'"()\-—–„"«»\n\r]+$/;
  return romanianPattern.test(text);
};

/**
 * Formatare text pentru postare social media
 */
const formatForSocialMedia = (text, platform = 'facebook') => {
  let formatted = fixDiacritice(text);
  
  // Limitări de caractere per platformă
  const limits = {
    facebook: 63206,
    instagram: 2200,
    tiktok: 2200
  };
  
  const limit = limits[platform] || 2200;
  
  if (formatted.length > limit) {
    formatted = formatted.substring(0, limit - 3) + '...';
  }
  
  return formatted;
};

/**
 * Generează salut în funcție de ora zilei
 */
const getSalutZilnic = () => {
  const ora = new Date().getHours();
  
  if (ora >= 5 && ora < 12) {
    const saluturi = [
      '🌅 Bună dimineața, drag suflet!',
      '☀️ O dimineață binecuvântată!',
      '🌿 Bună dimineața! Fie ca ziua ta să fie plină de har!',
      '🕊️ Dimineață binecuvântată!',
      '🌸 Bună dimineața! Dumnezeu te iubește!'
    ];
    return saluturi[Math.floor(Math.random() * saluturi.length)];
  } else if (ora >= 12 && ora < 18) {
    const saluturi = [
      '☀️ O zi binecuvântată!',
      '🌿 Dumnezeu să te binecuvânteze în această zi!',
      '✨ Un gând bun pentru sufletul tău!',
      '🕊️ Pace și har în ziua aceasta!'
    ];
    return saluturi[Math.floor(Math.random() * saluturi.length)];
  } else {
    const saluturi = [
      '🌙 Seară binecuvântată!',
      '✨ Seară liniștită!',
      '🌟 Odihnește-te în pacea Domnului!',
      '🕊️ Noapte binecuvântată!'
    ];
    return saluturi[Math.floor(Math.random() * saluturi.length)];
  }
};

/**
 * Formatează referința biblică
 */
const formatReference = (reference) => {
  return `📖 ${fixDiacritice(reference)}`;
};

module.exports = {
  fixDiacritice,
  isValidRomanianText,
  formatForSocialMedia,
  getSalutZilnic,
  formatReference
};