// backend/services/theologyValidator.js

const THEOLOGY_RULES = {
  STRICT_BIBLICAL_FIDELITY: true,

  forbiddenClaims: [
    "posesiune demonica frecventa in viata cotidiana",
    "diavolul controleaza orice problema",
    "Dumnezeu garanteaza succes material",
    "orice suferinta este lipsa de credinta",
    "credinciosii nu mai trec prin suferinta"
  ],

  softWarnings: [
    "Dumnezeu îți va rezolva orice problemă imediat",
    "nu vei mai avea niciodată dificultăți",
    "credința elimină toate problemele",
    "Dumnezeu îți dă tot ce vrei"
  ],

  theologicalAnchors: {
    godCharacter: [
      "Dumnezeu este suveran",
      "Dumnezeu este iubitor",
      "Dumnezeu este drept",
      "Dumnezeu lucrează în timp și în voia Sa"
    ],

    humanCondition: [
      "omul este limitat",
      "omul are nevoie de har",
      "omul este în proces de transformare"
    ],

    salvationLogic: [
      "mântuirea este prin har",
      "nu prin fapte",
      "prin credință în Hristos"
    ]
  }
};

function checkBibleAlignment(text) {
  const lower = text.toLowerCase();

  const issues = [];

  for (const phrase of THEOLOGY_RULES.forbiddenClaims) {
    if (lower.includes(phrase.toLowerCase())) {
      issues.push({
        type: "ERROR",
        message: `Afirmație teologic incorectă: "${phrase}"`
      });
    }
  }

  for (const phrase of THEOLOGY_RULES.softWarnings) {
    if (lower.includes(phrase.toLowerCase())) {
      issues.push({
        type: "WARNING",
        message: `Posibilă exagerare teologică: "${phrase}"`
      });
    }
  }

  return issues;
}

function checkBiblicalBalance(text) {
  const lower = text.toLowerCase();

  const hasGod = lower.includes("dumnezeu") || lower.includes("domnul");
  const hasHuman = lower.includes("om") || lower.includes("noi") || lower.includes("credincios");

  if (!hasGod) {
    return {
      type: "ERROR",
      message: "Lipsește perspectiva despre Dumnezeu"
    };
  }

  if (!hasHuman) {
    return {
      type: "WARNING",
      message: "Lipsește dimensiunea umană (aplicare personală)"
    };
  }

  return null;
}

function checkGospelBalance(text) {
  const lower = text.toLowerCase();

  const grace = lower.includes("har");
  const faith = lower.includes("credință") || lower.includes("credinta");
  const christ = lower.includes("hristos") || lower.includes("isus");

  if (!christ) {
    return {
      type: "ERROR",
      message: "Lipsește Hristos din mesaj (centru evanghelic absent)"
    };
  }

  if (!grace && !faith) {
    return {
      type: "WARNING",
      message: "Mesaj posibil moralist (lipsește har/credință)"
    };
  }

  return null;
}

function detectManipulativeTone(text) {
  const lower = text.toLowerCase();

  const patterns = [
    "dacă nu faci asta dumnezeu nu",
    "trebuie neapărat să",
    "altfel nu ești credincios",
    "adevărații creștini fac"
  ];

  return patterns
    .filter(p => lower.includes(p))
    .map(p => ({
      type: "ERROR",
      message: `Ton manipulator detectat: "${p}"`
    }));
}

/**
 * MAIN CORECTOR
 */
function theologicalAIValidator(devotional) {
  const fullText = [
    devotional.title,
    devotional.introduction,
    devotional.reflection,
    devotional.practicalApplication,
    devotional.prayer
  ].join(" ");

  let issues = [];

  // 1. Doctrine checks
  issues = issues.concat(checkBibleAlignment(fullText));

  // 2. Gospel center check
  const gospelIssue = checkGospelBalance(fullText);
  if (gospelIssue) issues.push(gospelIssue);

  // 3. Balance check
  const balanceIssue = checkBiblicalBalance(fullText);
  if (balanceIssue) issues.push(balanceIssue);

  // 4. Manipulation detection
  issues = issues.concat(detectManipulativeTone(fullText));

  const isValid = !issues.some(i => i.type === "ERROR");

  return {
    isValid,
    issues,
    score: calculateScore(issues)
  };
}

function calculateScore(issues) {
  let score = 100;

  for (const i of issues) {
    if (i.type === "ERROR") score -= 25;
    if (i.type === "WARNING") score -= 10;
  }

  return Math.max(score, 0);
}

module.exports = {
  theologicalAIValidator
};