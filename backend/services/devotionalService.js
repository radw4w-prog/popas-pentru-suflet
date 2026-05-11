const DailyDevotional = require('../models/DailyDevotional');
const Verse = require('../models/Verse');
const geminiService = require('./geminiService');
const { theologicalAIValidator } = require('./theologyValidator');

// ═══════════════════════════════
// CONFIG V3
// ═══════════════════════════════

const MAX_AI_RETRIES = 3;
const MAX_THEO_FIXES = 2;

const THEMES = [
  'dragoste','credinta','pace','bucurie',
  'speranta','rugaciune','iertare',
  'putere','recunostinta','intelepciune'
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
// DATE + THEME ENGINE
// ═══════════════════════════════

function getRomaniaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bucharest'
  }).format(date);
}

function getThemeForDate(dateKey) {
  const sum = dateKey.replace(/-/g, '')
    .split('')
    .reduce((a, b) => a + Number(b), 0);

  return THEMES[sum % THEMES.length];
}

// ═══════════════════════════════
// VERSE ENGINE
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
// 🧠 V3: SEMANTIC SCHEMA ENGINE
// ═══════════════════════════════

function buildSchemaPrompt(verse) {
  return `
EXTRAGE SEMANTIC DIN TEXT BIBLIC:

"${verse.text}"

RETURN JSON STRICT:

{
  "themeEmotion": "",
  "spiritualTone": "lamentatie | promisiune | avertizare | lauda | rugaciune",
  "actors": [],
  "actions": [],
  "commands": [],
  "coreMeaning": "",
  "spiritualCore": "",
  "interpretation": "",
  "scope": "personal | comunitar | profetic"
}

REGULI:
- NU copia versetul
- IDENTIFICĂ sensul, nu cuvinte
- 1 idee centrală
`;
}

// ═══════════════════════════════
// DEVOTIONAL PROMPT V3 (FORȚE INTERPRETARE)
// ═══════════════════════════════

function buildDevotionalPrompt(data, schema) {
  return `
Scrie devoțional CREȘTIN PROFUND.

VERSET:
"${data.verseText}"

TEMA:
${data.theme}

SCHEMA:
${JSON.stringify(schema)}

🔥 REGULI CRITICE V3:
- NU repeta versetul
- NU parafraza versetul
- TREBUIE interpretare (obligatoriu)
- TREBUIE explicație spirituală
- ZERO fraze generale

❌ INTERZIS:
"acest verset ne amintește"
"în lumea de astăzi"
"Dumnezeu îți vorbește prin..."

STRUCTURĂ:

{
 "title": "",
 "introduction": "",
 "reflection": "",
 "practicalApplication": "",
 "prayer": "",
 "thoughtOfTheDay": ""
}

REQUIREMENT:
- introducerea = interpretare, NU introducere generică
- reflecția = analiză teologică
- aplicația = concretă, 1 acțiune reală
`;
}

// ═══════════════════════════════
// PARSER SAFE
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
    title: "Cuvânt pentru suflet",
    introduction: `Acest text biblic reflectă o realitate spirituală profundă.`,
    reflection: verse.text,
    practicalApplication: "Meditează 5 minute la acest verset.",
    prayer: "Doamne, luminează-mi inima. Amin.",
    thoughtOfTheDay: "Dumnezeu lucrează chiar și în tăcere."
  };
}

// ═══════════════════════════════
// VALIDARE V3 (STRICTĂ)
// ═══════════════════════════════

function validate(devotional) {
  if (!devotional) return false;

  const text = Object.values(devotional).join(' ').toLowerCase();

  const banned = [
    'dragi prieteni',
    'în concluzie',
    'în lumea de astăzi',
    'acest verset ne amintește',
    'dumnezeu îți vorbește prin'
  ];

  if (banned.some(b => text.includes(b))) return false;

  // must contain interpretation signal
  if (!text.includes('pentru că') && !text.includes('înseamnă')) {
    return false;
  }

  return true;
}

// ═══════════════════════════════
// VIRAL ENGINE V3 (SAFE)
// ═══════════════════════════════

function detectEmotion(text) {
  const t = text.toLowerCase();

  if (t.includes('nu te teme')) return 'curaj';
  if (t.includes('tăcere')) return 'tăcere';
  if (t.includes('durere')) return 'durere';
  if (t.includes('speran')) return 'speranță';
  if (t.includes('iubire')) return 'dragoste';

  return 'reflecție';
}

function generateHook(emotion) {
  const map = {
    curaj: "Nu ai nevoie de mai mult curaj.",
    tăcere: "Când Dumnezeu tace, El tot lucrează.",
    durere: "Durerea ta nu e ignorată.",
    speranță: "Nu s-a terminat.",
    dragoste: "Ești văzut."
  };

  return map[emotion] || "Citește până la capăt.";
}

function enhance(devotional, verse, theme) {
  const emotion = detectEmotion(devotional.reflection || verse.text);

  return {
    ...devotional,
    viralHook: generateHook(emotion),
    viralTitle: `${theme.toUpperCase()} - adevărul zilei`,
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
  const raw = await geminiService.generate(prompt, 1800, 0.45);
  return extractJson(raw);
}

// ═══════════════════════════════
// 🧠 THEOLOGICAL FIX ENGINE V3
// ═══════════════════════════════

async function theologicalFixLoop(devotional, verse) {
  let current = devotional;

  for (let i = 0; i < MAX_THEO_FIXES; i++) {
    const check = theologicalAIValidator(current);

    if (check.isValid && check.score >= 85) {
      return current;
    }

    const fixPrompt = `
Corectează DOAR teologic acest devoțional.

VERS:
"${verse.text}"

PROBLEME:
${JSON.stringify(check.issues)}

DEVOTIONAL:
${JSON.stringify(current)}

REGULI:
- nu adăuga idei externe
- întărește interpretarea
- elimină generalizări
- fă-l biblic exact

Return JSON.
`;

    try {
      current = await callAI(fixPrompt);
    } catch (e) {
      break;
    }
  }

  return current;
}

// ═══════════════════════════════
// MAIN ENGINE V3
// ═══════════════════════════════

async function createDevotionalForDate(date = new Date()) {
  const dateKey = getRomaniaDateKey(date);

  const existing = await DailyDevotional.findOne({ dateKey }).lean();
  if (existing) return existing;

  const theme = getThemeForDate(dateKey);
  const verse = await getVerseForTheme(theme);

  let devotional = null;
  let schema = null;

  // AI LOOP
  for (let i = 0; i < MAX_AI_RETRIES; i++) {
    try {
      schema = await callAI(buildSchemaPrompt(verse));

      devotional = await callAI(buildDevotionalPrompt(
        { theme, verseText: verse.text },
        schema
      ));

      if (validate(devotional)) break;

    } catch (e) {}
  }

  if (!devotional) {
    devotional = fallbackDevotional(theme, verse);
  }

  // 🧠 THEOLOGY REPAIR LAYER
  devotional = await theologicalFixLoop(devotional, verse);

  const finalCheck = theologicalAIValidator(devotional);

  if (!finalCheck.isValid) {
    devotional = fallbackDevotional(theme, verse);
  }

  // 🔥 VIRAL LAST
  devotional = enhance(devotional, verse, theme);

  // SAVE
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
    aiModel: 'gemini-v3-engine'
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