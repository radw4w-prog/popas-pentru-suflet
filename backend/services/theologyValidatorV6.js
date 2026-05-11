// theologyValidatorV6.js

// ═══════════════════════════════
// CONFIG
// ═══════════════════════════════

const WEAK_THEOLOGY_MARKERS = [
  "universul îți va da",
  "energia divină",
  "puterea din tine",
  "totul depinde de tine",
  "gândește pozitiv și se va întâmpla"
];

const STRONG_BIBLICAL_MARKERS = [
  "dumnezeu",
  "domnul",
  "scriptura",
  "credință",
  "har",
  "rugăciune"
];

const CHRIST_CENTER_MARKERS = [
  "isus",
  "hristos",
  "mântuire",
  "cruce",
  "evanghelie"
];

// ═══════════════════════════════
// CORE ANALYSIS
// ═══════════════════════════════

function analyzeText(text = "") {
  const t = text.toLowerCase();

  let score = 70;
  let issues = [];

  // ❌ 1. New Age / self-power theology detection
  for (const bad of WEAK_THEOLOGY_MARKERS) {
    if (t.includes(bad)) {
      score -= 40;
      issues.push({
        type: "THEOLOGICAL_ERROR",
        message: `Posibilă auto-putere / New Age: "${bad}"`
      });
    }
  }

  // ⚠️ 2. No biblical grounding
  const hasBiblicalLanguage = STRONG_BIBLICAL_MARKERS.some(m => t.includes(m));

  if (!hasBiblicalLanguage) {
    score -= 20;
    issues.push({
      type: "WARNING",
      message: "Lipsă limbaj biblic clar (Dumnezeu / Scriptură / credință)"
    });
  }

  // ✝️ 3. Christ filter (contextual, not forced)
  const mentionsChrist = CHRIST_CENTER_MARKERS.some(m => t.includes(m));

  if (mentionsChrist) {
    score += 10;
  }

  // ⚠️ 4. Moralism detection
  if (
    t.includes("trebuie să fii bun") &&
    !t.includes("har")
  ) {
    score -= 15;
    issues.push({
      type: "MORALISM",
      message: "Moralism fără har sau Evanghelie"
    });
  }

  // ⚠️ 5. Over-interpretation detection
  if (t.includes("acest verset înseamnă că Dumnezeu îți garantează")) {
    score -= 25;
    issues.push({
      type: "INTERPRETATION_ERROR",
      message: "Promisiune absolută nejustificată din text"
    });
  }

  // 🧠 6. Positive theological structure bonus
  if (t.includes("credință") && t.includes("dumnezeu")) {
    score += 5;
  }

  if (t.includes("rugăciune")) {
    score += 3;
  }

  // clamp
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: score >= 65 && issues.filter(i => i.type === "THEOLOGICAL_ERROR").length === 0,
    score,
    issues
  };
}

// ═══════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════

function theologicalAIValidatorV6(devotional) {
  if (!devotional) {
    return {
      isValid: false,
      score: 0,
      issues: [{ type: "ERROR", message: "Devotional null/undefined" }]
    };
  }

  const combinedText = `
    ${devotional.title || ""}
    ${devotional.introduction || ""}
    ${devotional.reflection || ""}
    ${devotional.prayer || ""}
    ${devotional.thoughtOfTheDay || ""}
  `;

  return analyzeText(combinedText);
}

module.exports = {
  theologicalAIValidatorV6
};