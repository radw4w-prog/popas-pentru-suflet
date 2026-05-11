const DailyDevotional = require('../models/DailyDevotional');
const Verse = require('../models/Verse');
const geminiService = require('./geminiService');
const { theologicalAIValidator } = require('./theologyValidator');

// ═══════════════════════════════
// CONFIG
// ═══════════════════════════════

const MAX_RETRIES = 3;

const THEMES = [
  'dragoste', 'credinta', 'pace', 'bucurie',
  'speranta', 'rugaciune', 'iertare',
  'putere', 'recunostinta', 'intelepciune'
];

const THEME_KEYWORDS = {
  dragoste: 'dragost|iub',
  credinta: 'credin',
  pace: 'pace',
  bucurie: 'bucur',
  speranta: 'nadejde|speran',
  rugaciune: 'rug',
  iertare: 'ierta',
  putere: 'putere',
  recunostinta: 'multum',
  intelepciune: 'intelep'
};

// ═══════════════════════════════
// DATE
// ═══════════════════════════════

function getRomaniaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bucharest'
  }).format(date);
}

// ═══════════════════════════════
// THEME
// ═══════════════════════════════

function getThemeForDate(dateKey) {
  const sum = dateKey.replace(/-/g, '')
    .split('')
    .reduce((a, b) => a + Number(b), 0);

  return THEMES[sum % THEMES.length];
}

// ═══════════════════════════════
// VERSE
// ═══════════════════════════════

async function getVerseForTheme(theme) {
  const regex = THEME_KEYWORDS[theme] || theme;

  const found = await Verse.aggregate([
    { $match: { text: { $regex: regex, $options: 'i' } } },
    { $sample: { size: 1 } }
  ]);

  const verse = found?.[0] || await Verse.findOne().lean();

  if (!verse) throw new Error("No verse found");

  return {
    text: verse.text,
    reference: verse.referinta || `${verse.carte} ${verse.capitol}:${verse.verset}`,
    book: verse.carte,
    chapter: verse.capitol,
    number: verse.verset
  };
}

// ═══════════════════════════════
// PROMPTS
// ═══════════════════════════════

function buildSchemaPrompt(verse) {
  return `
Extrage STRICT din verset:

"${verse.text}"

Returnează JSON:
{
 "actors": [],
 "actions": [],
 "commands": [],
 "coreExpressions": [],
 "keyMessage": "",
 "spiritualCore": "",
 "scope": ""
}
`;
}

function buildDevotionalPrompt(data, schema) {
  return `
Scrie devoțional creștin profund.

VERSET:
"${data.verseText}"

TEMA:
${data.theme}

SCHEMA:
${JSON.stringify(schema)}

REGULI:
- doar din verset
- fără clișee
- 1 metaforă max

JSON:
{
 "title": "",
 "introduction": "",
 "reflection": "",
 "practicalApplication": "",
 "prayer": "",
 "thoughtOfTheDay": ""
}
`;
}

// ═══════════════════════════════
// PARSER
// ═══════════════════════════════

function extractJson(raw) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid JSON");
  return JSON.parse(match[0]);
}

// ═══════════════════════════════
// FALLBACK
// ═══════════════════════════════

function fallbackDevotional(theme, verse) {
  return {
    title: "Un cuvânt pentru tine",
    introduction: `Astăzi Dumnezeu îți vorbește prin ${theme}.`,
    reflection: verse.text,
    practicalApplication: "Roagă-te 5 minute pe acest verset.",
    prayer: "Doamne, vorbește-mi azi. Amin.",
    thoughtOfTheDay: "Dumnezeu nu tace."
  };
}

// ═══════════════════════════════
// VALIDARE SIMPLĂ
// ═══════════════════════════════

function validate(devotional) {
  if (!devotional) return false;

  const text = Object.values(devotional).join(' ').toLowerCase();

  const banned = [
    'dragi prieteni',
    'în concluzie',
    'în lumea de astăzi',
    'acest verset ne amintește'
  ];

  return !banned.some(b => text.includes(b));
}

// ═══════════════════════════════
// VIRAL ENGINE
// ═══════════════════════════════

function detectEmotion(text) {
  const t = text.toLowerCase();

  if (t.includes('nu te teme')) return 'curaj';
  if (t.includes('pace')) return 'pace';
  if (t.includes('slăbiciune')) return 'slăbiciune';
  if (t.includes('iubire')) return 'dragoste';
  if (t.includes('speran')) return 'speranță';

  return 'reflecție';
}

function generateHook(emotion) {
  const map = {
    curaj: "Nu ai nevoie de mai mult curaj. Ai nevoie de asta.",
    pace: "Există o pace pe care nu o cunoști încă.",
    slăbiciune: "Slăbiciunea nu e finalul tău.",
    dragoste: "Nu ești uitat.",
    speranță: "Nu s-a terminat."
  };

  return map[emotion] || "Citește asta până la capăt.";
}

function viralScore(text) {
  let score = 50;

  if (text.includes('nu te teme')) score += 15;
  if (text.includes('putere')) score += 10;
  if (text.includes('speran')) score += 10;
  if (text.includes('azi')) score += 5;

  if (text.includes('dragi prieteni')) score -= 20;

  return Math.max(0, Math.min(100, score));
}

function enhance(devotional, verse, theme) {
  const emotion = detectEmotion(verse.text);

  return {
    ...devotional,
    viralHook: generateHook(emotion),
    viralTitle: `${theme.toUpperCase()} azi`,
    viralScore: viralScore(verse.text),
    socialCaption: `
${generateHook(emotion)}

📖 ${verse.reference}
"${verse.text}"

💬 ${devotional.thoughtOfTheDay}
    `.trim()
  };
}

// ═══════════════════════════════
// AI CALL
// ═══════════════════════════════

async function callAI(prompt) {
  const raw = await geminiService.generate(prompt, 1800, 0.4);
  return extractJson(raw);
}

// ═══════════════════════════════
// MAIN FLOW
// ═══════════════════════════════

async function createDevotionalForDate(date = new Date()) {
  const dateKey = getRomaniaDateKey(date);

  const existing = await DailyDevotional.findOne({ dateKey }).lean();
  if (existing) return existing;

  const theme = getThemeForDate(dateKey);
  const verse = await getVerseForTheme(theme);

  let schema, devotional;

  // 🔁 AI RETRY LOOP
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      schema = await callAI(buildSchemaPrompt(verse));

      devotional = await callAI(buildDevotionalPrompt(
        { theme, verseText: verse.text, verseReference: verse.reference },
        schema
      ));

      if (validate(devotional)) break;

    } catch (e) {
      console.log("Retry AI:", e.message);
    }
  }

  if (!devotional || !validate(devotional)) {
    devotional = fallbackDevotional(theme, verse);
  }

  // 🧠 CORECTOR TEOLOGIC (CORECT)
  const theologyCheck = theologicalAIValidator(devotional);

  if (!theologyCheck.isValid) {
    console.log("❌ RESPINS TEOLOGIC:", theologyCheck.issues);
    devotional = fallbackDevotional(theme, verse);
  }

  console.log("🧠 Scor teologic:", theologyCheck.score);

  // 🔥 VIRAL ENGINE (ULTIMUL PAS)
  devotional = enhance(devotional, verse, theme);

  // 💾 SAVE
  const saved = await DailyDevotional.create({
    dateKey,
    theme,
    verseText: verse.text,
    verseReference: verse.reference,
    verseBook: verse.book,
    verseChapter: verse.chapter,
    verseNumber: verse.number,

    ...devotional,

    generatedBy: 'ai',
    aiModel: 'gemini'
  });

  return saved.toObject();
}

// ═══════════════════════════════
// API
// ═══════════════════════════════

async function getTodayDevotional() {
  return createDevotionalForDate(new Date());
}

async function getDevotionalByDate(dateKey) {
  let d = await DailyDevotional.findOne({ dateKey }).lean();
  if (!d) d = await createDevotionalForDate(new Date(dateKey));
  return d;
}

async function getRecentDevotionals(limit = 30) {
  return DailyDevotional.find({})
    .sort({ dateKey: -1 })
    .limit(limit)
    .lean();
}

module.exports = {
  getRomaniaDateKey,
  getTodayDevotional,
  getDevotionalByDate,
  getRecentDevotionals,
  createDevotionalForDate
};