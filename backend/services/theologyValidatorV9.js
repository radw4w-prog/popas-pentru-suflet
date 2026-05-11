// backend/services/theologyValidatorV9.js
const geminiService = require('./geminiService');

/*
 ════════════════════════════════════════════════
 V9 FINAL — TEOLOGIC & SEMANTIC VALIDATOR + AUTO-FIX
 ════════════════════════════════════════════════
 - Verificare teologică (Hristocentrism / Supra-teologizare)
 - Verificare semantică (Aplicații prea vagi)
 - Detectează repetiții
 - Detectează artefacte AI
 - Detectează parafrazare excesivă
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

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function normalize(text = '') {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, '')
    .trim();
}

function extractCleanJson(raw) {
  try {
    let text = raw.trim();

    // Elimină blocuri markdown
    const block = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (block) text = block[1].trim();

    // Găsește primul { și ultimul }
    const first = text.indexOf('{');
    if (first === -1) return null;

    text = text.slice(first);

    const last = text.lastIndexOf('}');
    if (last !== -1 && last > first) {
      text = text.slice(0, last + 1);
    } else {
      // ── RECUPERARE JSON TĂIAT (truncated) ──
      // Închide stringul deschis
      text = text.replace(/"([^"]*?)$/, '"$1"');

      // Număr parantezele deschise și închise
      const openBraces = (text.match(/{/g) || []).length;
      const closeBraces = (text.match(/}/g) || []).length;
      const openBrackets = (text.match(/\[/g) || []).length;
      const closeBrackets = (text.match(/]/g) || []).length;

      // Închide array-urile și obiectele rămase
      text += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
      text += '}'.repeat(Math.max(0, openBraces - closeBraces));

      console.log('🔧 JSON tăiat recuperat automat.');
    }

    return JSON.parse(text);
  } catch (e) {
    return null;
  }
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
    if (w.length < 5) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.values(freq).some(v => v >= 5);
}

function isTooCloseToVerse(devotional, verse) {
  const d = normalize(devotional?.reflection || '');
  const v = normalize(verse?.text || '');

  if (!v || !d) return false;

  const verseWords = v.split(/\s+/);
  let overlap = 0;

  for (const w of verseWords) {
    if (w.length > 3 && d.includes(w)) overlap++;
  }

  const ratio = overlap / verseWords.length;
  return ratio > 0.72;
}

function genericApplication(devotional) {
  const t = normalize(devotional?.practicalApplication || '');
  return GENERIC_PHRASES.some(p => t.includes(p));
}

function christCheck(devotional, verse) {
  const text = normalize(Object.values(devotional || {}).join(' '));
  const verseText = normalize(verse?.text || '');

  if (verseText.includes('isus') || verseText.includes('hristos')) {
    return text.includes('isus') || text.includes('hristos');
  }

  return true;
}

function doctrineCheck(devotional, verse) {
  const text = normalize(Object.values(devotional || {}).join(' '));
  const verseText = normalize(verse?.text || '');

  if (!verseText.includes('isus') && text.includes('isus')) return false;
  if (!verseText.includes('cruce') && text.includes('cruce')) return false;
  if (!verseText.includes('înviere') && text.includes('înviere')) return false;

  return true;
}

// ═══════════════════════════════════════
// AUTO-REWRITE
// ═══════════════════════════════════════
async function autoRewrite(devotional, verse, theme) {
  const prompt = `
Rescrie acest devoțional creștin pentru a corecta erorile semantice/teologice.

STRICT:
- Fără repetiții de cuvinte
- Fără clișee sau fraze generice
- Fără artefacte AI (nume de câmpuri din scheme)
- Aplicație practică concretă și realizabilă azi
- Maxim 120 cuvinte per secțiune
- Păstrează fidelitatea absolută față de verset

VERS:
"${verse?.text || ''}"

DEVOTIONAL ORIGINAL:
${JSON.stringify(devotional)}

Returnează DOAR JSON valid:
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
    const raw = await geminiService.generate(prompt, 4096, 0.3);
    return extractCleanJson(raw);
  } catch (err) {
    console.log('⚠️ Eroare autoRewrite:', err.message);
    return null;
  }
}

// ═══════════════════════════════════════
// VALIDATORUL PRINCIPAL V9
// ═══════════════════════════════════════
async function theologicalAIValidatorV9(devotional, verse, theme) {
  const issues = [];
  let score = 100;

  if (!devotional) {
    return {
      isValid: false,
      score: 0,
      issues: ['[ERROR] Devoționalul primit este gol.']
    };
  }

  if (!christCheck(devotional, verse)) {
    issues.push('[ERROR] Lipsește menționarea lui Hristos (versetul este cristologic).');
    score -= 20;
  }

  if (!doctrineCheck(devotional, verse)) {
    issues.push('[ERROR] Supra-teologizare:概念e externe (Isus/Cruce/Înviere) adăugate peste verset.');
    score -= 20;
  }

  if (hasAIArtifacts(Object.values(devotional).join(' '))) {
    issues.push('[ERROR] Artefact AI detectat în textul final.');
    score -= 25;
  }

  if (detectRepetition(Object.values(devotional).join(' '))) {
    issues.push('[WARNING] Repetiție excesivă a vocabularului.');
    score -= 15;
  }

  if (isTooCloseToVerse(devotional, verse)) {
    issues.push('[WARNING] Parafrazare leneșă: text prea apropiat de verset.');
    score -= 10;
  }

  if (genericApplication(devotional)) {
    issues.push('[WARNING] Aplicația practică conține fraze generice.');
    score -= 10;
  }

  score = Math.max(0, score);

  if (score >= MIN_SCORE) {
    return { isValid: true, score, issues };
  }

  // ── AUTO-FIX ──
  console.log(`♻️ Devoțional respins (scor: ${score}/${MIN_SCORE}). Auto-Rewrite V9...`);

  const fixed = await autoRewrite(devotional, verse, theme);

  if (!fixed) {
    return { isValid: false, score, issues };
  }

  return { isValid: false, fixed, score, issues };
}

module.exports = {
  theologicalAIValidatorV9
};