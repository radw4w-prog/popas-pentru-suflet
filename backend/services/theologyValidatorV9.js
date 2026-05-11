// backend/services/theologyValidatorV9.js

const geminiService = require('./geminiService');

/*
 V9 FINAL
 - verificare teologică
 - verificare semantică
 - detectează repetiții
 - detectează artefacte AI
 - detectează parafrazare excesivă
 - auto-rewrite dacă e nevoie
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

function normalize(text = '') {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, '')
    .trim();
}

function countOccurrences(text, phrase) {
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
  const d = normalize(devotional.reflection || '');
  const v = normalize(verse.text || '');

  const verseWords = v.split(' ');
  let overlap = 0;

  for (const w of verseWords) {
    if (d.includes(w)) overlap++;
  }

  const ratio = overlap / verseWords.length;

  return ratio > 0.72;
}

function genericApplication(devotional) {
  const t = normalize(devotional.practicalApplication || '');

  return GENERIC_PHRASES.some(p => t.includes(p));
}

function christCheck(devotional, verse) {
  const text = normalize(
    Object.values(devotional).join(' ')
  );

  const verseText = normalize(verse.text);

  if (verseText.includes('isus') || verseText.includes('hristos')) {
    return text.includes('isus') || text.includes('hristos');
  }

  return true;
}

function doctrineCheck(devotional, verse) {
  const text = normalize(
    Object.values(devotional).join(' ')
  );

  const verseText = normalize(verse.text);

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

async function autoRewrite(devotional, verse, theme) {
  const prompt = `
Rescrie devoționalul.

STRICT:
- fără repetiții
- fără clișee
- fără artefacte AI
- aplicație practică concretă
- maxim 120 cuvinte per secțiune
- păstrează fidelitatea față de verset

VERS:
"${verse.text}"

DEVOTIONAL:
${JSON.stringify(devotional)}

Returnează JSON:
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
    const raw = await geminiService.generate(prompt, 1800, 0.3);

    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) return null;

    return JSON.parse(match[0]);

  } catch {
    return null;
  }
}

async function theologicalAIValidatorV9(devotional, verse, theme) {
  const issues = [];
  let score = 100;

  if (!christCheck(devotional, verse)) {
    issues.push({
      type: 'ERROR',
      message: 'Lipsește Hristos când versetul este cristologic'
    });
    score -= 20;
  }

  if (!doctrineCheck(devotional, verse)) {
    issues.push({
      type: 'ERROR',
      message: 'Adaugă doctrină externă versetului'
    });
    score -= 20;
  }

  if (hasAIArtifacts(
    Object.values(devotional).join(' ')
  )) {
    issues.push({
      type: 'ERROR',
      message: 'Artefact AI detectat'
    });
    score -= 25;
  }

  if (detectRepetition(
    Object.values(devotional).join(' ')
  )) {
    issues.push({
      type: 'WARNING',
      message: 'Repetiție excesivă'
    });
    score -= 15;
  }

  if (isTooCloseToVerse(devotional, verse)) {
    issues.push({
      type: 'WARNING',
      message: 'Parafrazare prea apropiată de verset'
    });
    score -= 10;
  }

  if (genericApplication(devotional)) {
    issues.push({
      type: 'WARNING',
      message: 'Aplicație prea generică'
    });
    score -= 10;
  }

  score = Math.max(0, score);

  console.log(`🔍 [TEOLOGIE V9] Scor: ${score}/100`);

  if (score >= MIN_SCORE) {
    return {
      isValid: true,
      score,
      issues
    };
  }

  console.log("♻️ Auto rewrite V9...");

  const fixed = await autoRewrite(
    devotional,
    verse,
    theme
  );

  if (!fixed) {
    return {
      isValid: false,
      score,
      issues
    };
  }

  return {
    isValid: false,
    fixed,
    score,
    issues
  };
}

module.exports = {
  theologicalAIValidatorV9
};