// theologyValidatorV9.js

// ═══════════════════════════════
// GENRE DETECTION (Biblical taxonomy)
// ═══════════════════════════════

function detectGenre(verseText = '') {
  const t = verseText.toLowerCase();

  const psalms = ['psalm', 'laudă', 'sufletul meu', 'doamne te laud'];
  const law = ['poruncă', 'legea', 'domnul a zis', 'moise'];
  const prophets = ['vai', 'judecată', 'te-am pedepsit', 'mânia domnului', 'nelegiuire'];
  const gospels = ['isus', 'împărăția cerurilor', 'ferice de', 'vă spun vouă'];
  const epistles = ['fraților', 'har', 'credință', 'apostol', 'biserică'];
  const apocalyptic = ['fiară', 'trâmbiță', 'pecete', 'sfârșitul', 'apocalipsa'];

  if (psalms.some(k => t.includes(k))) return 'PSALMS';
  if (law.some(k => t.includes(k))) return 'LAW';
  if (prophets.some(k => t.includes(k))) return 'PROPHETS';
  if (gospels.some(k => t.includes(k))) return 'GOSPELS';
  if (epistles.some(k => t.includes(k))) return 'EPISTLES';
  if (apocalyptic.some(k => t.includes(k))) return 'APOCALYPTIC';

  return 'UNKNOWN';
}

// ═══════════════════════════════
// RULES PER GENRE
// ═══════════════════════════════

const GENRE_RULES = {
  PSALMS: {
    allowEmotion: true,
    allowPersonalJudgment: false,
    requireHopeBalance: false
  },

  LAW: {
    allowEmotion: false,
    allowPersonalJudgment: false,
    requireReverence: true
  },

  PROPHETS: {
    allowJudgmentLanguage: true,
    allowPersonalApplication: false, // CRITICAL FIX
    requireContextualization: true
  },

  GOSPELS: {
    requireChristFocus: true,
    allowGraceDominant: true
  },

  EPISTLES: {
    allowTeachingTone: true,
    requireGraceBalance: true
  },

  APOCALYPTIC: {
    requireSymbolExplanation: true,
    avoidLiteralFear: true
  },

  UNKNOWN: {
    safeMode: true
  }
};

// ═══════════════════════════════
// CONTEXT VIOLATION DETECTOR
// ═══════════════════════════════

function detectMisapplication(devotional, verseText, genre) {
  const text = JSON.stringify(devotional || {}).toLowerCase();

  const propheticMarkers = [
    'te-am pedepsit',
    'te-am lovit',
    'mânia domnului'
  ];

  const personalizeJudgment = [
    'dumnezeu te pedepsește',
    'păcatele tale',
    'ești condamnat'
  ];

  const isPropheticVerse = genre === 'PROPHETS';

  const misuse = isPropheticVerse && (
    personalizJudgment(text) ||
    propheticMarkers.some(m => text.includes(m))
  );

  return misuse;
}

function personalizJudgment(text) {
  return [
    'dumnezeu te pedepsește',
    'păcatele tale',
    'tu ești vinovat'
  ].some(m => text.includes(m));
}

// ═══════════════════════════════
// SCOR ENGINE
// ═══════════════════════════════

function calculateScore(text, genre) {
  let score = 70;

  const t = (text || '').toLowerCase();

  if (t.includes('har')) score += 10;
  if (t.includes('dragoste')) score += 5;
  if (t.includes('frică')) score -= 10;

  if (genre === 'PROPHETS' && t.includes('tu ești vinovat')) {
    score -= 25;
  }

  if (t.includes('dragi prieteni')) score -= 10;

  return Math.max(0, Math.min(100, score));
}

// ═══════════════════════════════
// AUTO FIX ENGINE
// ═══════════════════════════════

function safeRewrite(devotional, verse, genre) {
  if (!devotional) return devotional;

  const text = JSON.stringify(devotional).toLowerCase();

  const isBad = detectMisapplication(devotional, verse.text, genre);

  if (!isBad) return devotional;

  // FIX for PROPHETS misuse
  if (genre === 'PROPHETS') {
    return {
      ...devotional,

      reflection: `
Acest text profetic reflectă seriozitatea păcatului în contextul istoric al Israelului.
El nu trebuie aplicat direct ca condamnare personală,
ci înțeles în lumina caracterului drept și sfânt al lui Dumnezeu.
      `.trim(),

      practicalApplication:
        'Reflectează la sfințenia lui Dumnezeu și la nevoia de pocăință, dar și la harul Lui.',

      thoughtOfTheDay:
        'Dumnezeu este drept, dar și plin de milă în restaurare.'
    };
  }

  return devotional;
}

// ═══════════════════════════════
// MAIN V9 VALIDATOR
// ═══════════════════════════════

function theologicalAIValidatorV9(devotional, verse = {}, theme = '') {
  try {
    if (!devotional) {
      return {
        isValid: false,
        score: 0,
        issues: ['Devotional missing'],
        fixed: null,
        genre: 'UNKNOWN'
      };
    }

    const genre = detectGenre(verse.text || '');

    const score = calculateScore(JSON.stringify(devotional), genre);

    const issues = [];

    const rules = GENRE_RULES[genre];

    // ❌ PROPHETS RULE CHECK (IMPORTANT FIX)
    if (genre === 'PROPHETS') {
      if (detectMisapplication(devotional, verse.text, genre)) {
        issues.push('Prophetic text misapplied as personal judgment');
      }
    }

    if (score < 60) {
      issues.push('Low theological balance score');
    }

    const isValid = issues.length === 0 && score >= 60;

    let fixed = null;

    if (!isValid) {
      fixed = safeRewrite(devotional, verse, genre);
    }

    return {
      isValid,
      score,
      issues,
      fixed,
      genre
    };

  } catch (err) {
    return {
      isValid: false,
      score: 0,
      issues: [err.message],
      fixed: null,
      genre: 'UNKNOWN'
    };
  }
}

// ═══════════════════════════════
// EXPORT
// ═══════════════════════════════

module.exports = {
  theologicalAIValidatorV9,
  detectGenre,
  calculateScore,
  safeRewrite
};