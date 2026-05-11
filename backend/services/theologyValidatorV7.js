// theologyValidatorV7.js

const { theologicalAIValidatorV6 } = require('./theologyValidatorV6');
const geminiService = require('./geminiService');

// ═══════════════════════════════
// CORE ANALYSIS LAYERS
// ═══════════════════════════════

function deepAnalyze(devotional) {
  const text = `
    ${devotional.title || ""}
    ${devotional.introduction || ""}
    ${devotional.reflection || ""}
    ${devotional.prayer || ""}
    ${devotional.thoughtOfTheDay || ""}
  `.toLowerCase();

  return {
    redundancy: detectRedundancy(text),
    exegeticalDepth: checkExegeticalDepth(text),
    structureScore: checkStructure(devotional),
    christBalance: checkChristBalance(text)
  };
}

// ═══════════════════════════════
// 1. REDUNDANCY DETECTION
// ═══════════════════════════════

function detectRedundancy(text) {
  const words = text.split(/\s+/);
  const freq = {};

  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  const repeats = Object.values(freq).filter(v => v > 4).length;

  return Math.max(0, 100 - repeats * 10);
}

// ═══════════════════════════════
// 2. EXEGETICAL DEPTH
// ═══════════════════════════════

function checkExegeticalDepth(text) {
  let score = 50;

  if (text.includes("context")) score += 10;
  if (text.includes("scriptura")) score += 10;
  if (text.includes("în acest verset")) score += 10;
  if (text.includes("paul") || text.includes("pavel")) score += 10;
  if (text.includes("suferință")) score += 10;

  return Math.min(100, score);
}

// ═══════════════════════════════
// 3. STRUCTURE CHECK
// ═══════════════════════════════

function checkStructure(devotional) {
  let score = 50;

  if (devotional.title) score += 10;
  if (devotional.introduction) score += 10;
  if (devotional.reflection) score += 10;
  if (devotional.practicalApplication) score += 10;
  if (devotional.prayer) score += 10;

  return score;
}

// ═══════════════════════════════
// 4. CHRIST BALANCE
// ═══════════════════════════════

function checkChristBalance(text) {
  const hasChrist = text.includes("isus") || text.includes("hristos");

  if (hasChrist) return 80;
  return 60; // nu forțăm Christ in OT contexts
}

// ═══════════════════════════════
// FINAL SCORE
// ═══════════════════════════════

function computeScore(analysis, baseScore = 70) {
  const avg =
    (analysis.redundancy +
      analysis.exegeticalDepth +
      analysis.structureScore +
      analysis.christBalance) / 4;

  return Math.round((avg + baseScore) / 2);
}

// ═══════════════════════════════
// AUTO REWRITE ENGINE
// ═══════════════════════════════

async function rewriteDevotional(devotional, verse, theme, issues) {
  const prompt = `
Rescrie acest devoțional creștin.

REGULI:
- fără repetiții
- mai clar teologic
- mai profund exegetic
- păstrează versetul
- NU adăuga doctrină falsă
- structură clară (introducere, reflecție, aplicație, rugăciune)

VERS:
"${verse.text}"

TEMA:
${theme}

DEVOTIONAL VECHI:
${JSON.stringify(devotional)}

PROBLEME DETECTATE:
${JSON.stringify(issues)}

Returnează JSON:
{
 "title": "",
 "introduction": "",
 "reflection": "",
 "practicalApplication": "",
 "prayer": "",
 "thoughtOfTheDay": ""
}
`;

  const raw = await geminiService.generate(prompt, 1800, 0.4);

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return devotional;

  return JSON.parse(match[0]);
}

// ═══════════════════════════════
// MAIN ENGINE V7
// ═══════════════════════════════

async function theologicalAIValidatorV7(devotional, verse, theme) {
  if (!devotional) {
    return {
      isValid: false,
      score: 0,
      issues: [{ type: "ERROR", message: "No devotional" }],
      fixed: null
    };
  }

  // 1. basic V6 check
  const base = theologicalAIValidatorV6(devotional);

  // 2. deep semantic analysis
  const analysis = deepAnalyze(devotional);

  const score = computeScore(analysis, base.score);

  const issues = [...base.issues];

  if (analysis.redundancy < 50) {
    issues.push({
      type: "REDUNDANCY",
      message: "Text repetitiv / AI loop detected"
    });
  }

  if (analysis.exegeticalDepth < 40) {
    issues.push({
      type: "EXEGETICAL_WEAK",
      message: "Lipsă profunzime biblică"
    });
  }

  if (analysis.structureScore < 60) {
    issues.push({
      type: "STRUCTURE_WEAK",
      message: "Structură incompletă"
    });
  }

  const isValid = score >= 70 && !base.issues.some(i => i.type === "THEOLOGICAL_ERROR");

  let fixed = null;

  // 🔥 AUTO REWRITE FIXER
  if (!isValid || score < 75) {
    fixed = await rewriteDevotional(devotional, verse, theme, issues);
  }

  return {
    isValid,
    score,
    issues,
    fixed
  };
}

module.exports = {
  theologicalAIValidatorV7
};