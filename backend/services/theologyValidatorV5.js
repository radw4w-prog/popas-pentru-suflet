// ═══════════════════════════════
// THEOLOGY VALIDATOR V5
// Balanced, contextual, non-dogmatic
// ═══════════════════════════════

function normalize(text = "") {
  return text.toLowerCase();
}

// ═══════════════════════════════
// CONTEXT DETECTION
// ═══════════════════════════════

function getBiblicalContext(verse) {
  const book = (verse.book || "").toLowerCase();

  const ntBooks = [
    "matei", "marcu", "luca", "ioan",
    "faptele", "romani", "corinteni",
    "galateni", "efeseni", "filipeni",
    "coloseni", "tesaloniceni", "timotei",
    "evrei", "iacov", "petru", "ioan", "jud"
  ];

  const isNT = ntBooks.some(b => book.includes(b));

  const isWisdom = [
    "proverbe", "psalmi", "iov", "eclesiastul"
  ].some(b => book.includes(b));

  const isProphetic = [
    "isaia", "ieremia", "ezechiel", "daniel"
  ].some(b => book.includes(b));

  return {
    isNT,
    isWisdom,
    isProphetic
  };
}

// ═══════════════════════════════
// CHRIST CENTER CHECK (BALANCED)
// ═══════════════════════════════

function christContextRule(verse, devotionalText) {
  const text = normalize(devotionalText);
  const { isNT, isWisdom, isProphetic } = getBiblicalContext(verse);

  const mentionsChrist =
    text.includes("isus") ||
    text.includes("hristos");

  // ✔ NT doctrinal heavy context → Christ expected
  if (isNT && !isWisdom && !mentionsChrist) {
    return {
      valid: false,
      severity: "medium",
      message: "Context NT doctrinar dar Hristos absent"
    };
  }

  // ✔ Wisdom books → Christ NOT required
  if (isWisdom) {
    return { valid: true };
  }

  // ✔ Psalms/OT poetry → Christ optional
  if (!isNT) {
    return { valid: true };
  }

  return { valid: true };
}

// ═══════════════════════════════
// DOCTRINE GUARD (ANTI-OVERTEACHING)
// ═══════════════════════════════

function doctrineFilter(text) {
  const t = normalize(text);

  const heavyDoctrine = [
    "trinitate",
    "mântuire prin",
    "predestinație",
    "botez necesar pentru mântuire",
    "doctrina bisericii",
    "eschatologie"
  ];

  const violations = heavyDoctrine.filter(d => t.includes(d));

  return {
    valid: violations.length === 0,
    issues: violations
  };
}

// ═══════════════════════════════
// GENERIC BIAS DETECTOR
// ═══════════════════════════════

function detectGenericFluff(text) {
  const t = normalize(text);

  const fluff = [
    "dumnezeu are un plan",
    "în lumea de astăzi",
    "nu este întâmplător",
    "dragă cititorule",
    "acest verset ne amintește"
  ];

  const found = fluff.filter(f => t.includes(f));

  return {
    valid: found.length === 0,
    issues: found
  };
}

// ═══════════════════════════════
// CORE VALIDATOR V5
// ═══════════════════════════════

function theologicalAIValidatorV5(devotional, verse) {
  const text = JSON.stringify(devotional || "");

  const christCheck = christContextRule(verse, text);
  const doctrineCheck = doctrineFilter(text);
  const fluffCheck = detectGenericFluff(text);

  let score = 100;
  const issues = [];

  if (!christCheck.valid) {
    score -= 20;
    issues.push(christCheck.message);
  }

  if (!doctrineCheck.valid) {
    score -= 25;
    issues.push("Doctrină excesivă: " + doctrineCheck.issues.join(", "));
  }

  if (!fluffCheck.valid) {
    score -= 15;
    issues.push("Clișee detectate: " + fluffCheck.issues.join(", "));
  }

  // bonus pentru simplitate biblică
  if (score >= 85) score += 5;

  return {
    isValid: score >= 70,
    score: Math.min(100, score),
    issues
  };
}

module.exports = {
  theologicalAIValidatorV5
};