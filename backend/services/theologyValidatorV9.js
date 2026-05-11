// backend/services/theologyValidatorV9.js
const geminiService = require('./geminiService');

/*
 ════════════════════════════════════════════════
 V9 FINAL — TEOLOGIC & SEMANTIC VALIDATOR + AUTO-FIX
 ════════════════════════════════════════════════
 - Verificare teologică (Hristocentrism / Supra-teologizare)
 - Verificare semantică (Aplicații prea vagi)
 - Detectează repetiții de cuvinte
 - Detectează artefacte AI (scăpări ale schemei JSON în text)
 - Detectează parafrazare excesivă (copierea versetului)
 - Auto-Rewrite via Gemini dacă scorul scade sub MIN_SCORE
*/

const MIN_SCORE = 80;

const AI_ARTIFACTS = [
  'spiritualcore',
  'spiritualcore-ul',
  'keymessage',
  'coreexpressions',
  'scope',
  'actors',
  'actions',
  'commands'
];

const GENERIC_PHRASES = [
  'dumnezeu îți vorbește azi',
  'ia un moment azi',
  'citește până la capăt',
  'reflectează la',
  'în lumea de azi'
];

// ── Helpers ──
function normalize(text = '') {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, '')
    .trim();
}

function countOccurrences(text, phrase) {
  if (!text || !phrase) return 0;
  const regex = new RegExp(phrase, 'gi');
  return (text.match(regex) || []).length;
}

function hasAIArtifacts(text) {
  const t = normalize(text);
  return AI_ARTIFACTS.some(a => t.includes(a));
}

function detectRepetition(text) {
  const words = normalize(text).split(/\s+/);
  const freq = {};

  for (const w of words) {
    if (w.length < 5) continue; // ignorăm cuvinte scurte (de, la, prin, etc.)
    freq[w] = (freq[w] || 0) + 1;
  }

  // Dacă un cuvânt lung apare de 5 sau mai multe ori, e o repetiție deranjantă
  return Object.values(freq).some(v => v >= 5);
}

function isTooCloseToVerse(devotional, verse) {
  const d = normalize(devotional.reflection || '');
  const v = normalize(verse?.text || '');

  if (!v || !d) return false;

  const verseWords = v.split(/\s+/);
  let overlap = 0;

  for (const w of verseWords) {
    if (w.length > 3 && d.includes(w)) overlap++;
  }

  const ratio = overlap / verseWords.length;
  return ratio > 0.72; // Dacă a copiat >72% din cuvintele versetului
}

function genericApplication(devotional) {
  const t = normalize(devotional.practicalApplication || '');
  return GENERIC_PHRASES.some(p => t.includes(p));
}

// ── Verificări Teologice ──
function christCheck(devotional, verse) {
  const text = normalize(Object.values(devotional).join(' '));
  const verseText = normalize(verse?.text || '');

  // Dacă versetul îl menționează pe Isus/Hristos, devoționalul TREBUIE să o facă
  if (verseText.includes('isus') || verseText.includes('hristos')) {
    return text.includes('isus') || text.includes('hristos');
  }

  return true;
}

function doctrineCheck(devotional, verse) {
  const text = normalize(Object.values(devotional).join(' '));
  const verseText = normalize(verse?.text || '');

  // Regula: "Scrii EXCLUSIV din acest verset". Nu aducem elemente externe majore.
  if (!verseText.includes('isus') && text.includes('isus')) {
    return false;
  }
  if (!verseText.includes('cruce') && text.includes('cruce')) {
    return false;
  }
  if (!verseText.includes('înviere') && text.includes('înviere')) {
    return false;
  }

  return true;
}

// Helper robust de parsare JSON pentru Auto-Rewrite
function extractCleanJson(raw) {
  try {
    let text = raw.trim();
    const block = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (block) text = block[1];

    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1) {
      text = text.slice(first, last + 1);
    }
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

// ── Funcția de Auto-Reparare (Rewrite) ──
async function autoRewrite(devotional, verse, theme) {
  const prompt = `
Rescrie acest devoțional creștin pentru a corecta erorile semantice/teologice.

STRICT:
- Fără repetiții de cuvinte
- Fără clișee sau fraze generice
- Fără artefacte AI (nume de câmpuri din scheme)
- Aplicație practică concretă și realizabilă azi
- Maxim 120 cuvinte per secțiune
- Păstrează fidelitatea absolută față de verset (nu adăuga concepte externe)

VERS:
"${verse?.text || ''}"

DEVOTIONAL ORIGINAL (cu defecte):
${JSON.stringify(devotional)}

Returnează DOAR un obiect JSON valid, formatat astfel:
{
 "title":"",
 "introduction":"",
 "reflection":"",
 "practicalApplication":"",
 "prayer":"",
 "thoughtOfTheDay":""
}
`;

  try {
    // Apelăm Gemini cu o temperatură mică (0.3) pentru precizie și respectarea formatului
    const raw = await geminiService.generate(prompt, 1800, 0.3);
    return extractCleanJson(raw);
  } catch (err) {
    console.log('⚠️ Eroare în timpul procesului de autoRewrite AI:', err.message);
    return null;
  }
}

// ── Validatorul Principal V9 ──
async function theologicalAIValidatorV9(devotional, verse, theme) {
  const issues = [];
  let score = 100;

  if (!devotional) {
    return { isValid: false, score: 0, issues: ['[ERROR] Devoționalul primit este gol.'] };
  }

  // 1. Verificări Teologice
  if (!christCheck(devotional, verse)) {
    issues.push('[ERROR] Lipsește menționarea lui Hristos, deși versetul este explicit cristologic.');
    score -= 20;
  }

  if (!doctrineCheck(devotional, verse)) {
    issues.push('[ERROR] Supra-teologizare: Adaugă concepte (Isus/Cruce/Înviere) care nu apar în textul versetului.');
    score -= 20;
  }

  // 2. Verificări de Artefacte
  if (hasAIArtifacts(Object.values(devotional).join(' '))) {
    issues.push('[ERROR] Artefact AI detectat (scăpări ale denumirilor din prompt/schemă în textul final).');
    score -= 25;
  }

  // 3. Verificări Stilistice și Semantice
  if (detectRepetition(Object.values(devotional).join(' '))) {
    issues.push('[WARNING] Repetiție excesivă a aceluiași vocabular.');
    score -= 15;
  }

  if (isTooCloseToVerse(devotional, verse)) {
    issues.push('[WARNING] Parafrazare leneșă: Textul este prea apropiat de formularea exactă a versetului.');
    score -= 10;
  }

  if (genericApplication(devotional)) {
    issues.push('[WARNING] Aplicația practică conține fraze generice sau clișee.');
    score -= 10;
  }

  score = Math.max(0, score);

  // ── Cazul A: Trece validarea ──
  if (score >= MIN_SCORE) {
    return {
      isValid: true,
      score,
      issues
    };
  }

  // ── Cazul B: Eșuează -> Declanșăm Auto-Fix (Rewrite) ──
  console.log(`⚠️ Devoțional respins (scor: ${score}/${MIN_SCORE}). ♻️ Se declanșează Auto-Rewrite V9...`);

  const fixedDevotional = await autoRewrite(devotional, verse, theme);

  if (!fixedDevotional) {
    console.log('❌ Auto-Rewrite a eșuat. Devoționalul rămâne invalid.');
    return {
      isValid: false,
      score,
      issues
    };
  }

  console.log('✅ Auto-Rewrite executat cu succes.');
  return {
    isValid: false, // Rămâne false pentru a indica că originalul a eșuat
    fixed: fixedDevotional, // Propagăm varianta reparată
    score,
    issues
  };
}

module.exports = {
  theologicalAIValidatorV9
};