// backend/services/devotionalService.js
const DailyDevotional = require('../models/DailyDevotional');
const Verse = require('../models/Verse');
const geminiService = require('./geminiService');

const THEMES = [
  'dragoste',
  'credinta',
  'pace',
  'bucurie',
  'speranta',
  'rugaciune',
  'iertare',
  'putere',
  'recunostinta',
  'intelepciune'
];

const THEME_KEYWORDS = {
  dragoste: 'dragoste',
  credinta: 'credin',
  pace: 'pace',
  bucurie: 'bucur',
  speranta: 'nădejde|nadejde|speran',
  rugaciune: 'rugă|ruga',
  iertare: 'ierta',
  putere: 'putere',
  recunostinta: 'mulțum|multum',
  intelepciune: 'înțelep|intelep'
};

const THEME_CONTEXT = {
  dragoste: 'dragostea lui Dumnezeu față de oameni și chemarea la iubire față de aproapele',
  credinta: 'credința autentică, încrederea în Dumnezeu în mijlocul îndoielii și incertitudinii',
  pace: 'pacea care întrece orice înțelegere, liniștea sufletului în mijlocul furtunilor vieții',
  bucurie: 'bucuria profundă care vine din relația cu Dumnezeu, diferită de fericirea lumească',
  speranta: 'speranța vie în Hristos, ancora sufletului în momentele de descurajare',
  rugaciune: 'rugăciunea ca dialog real cu Dumnezeu, nu ritual mecanic',
  iertare: 'iertarea ca eliberare, atât cea primită de la Dumnezeu cât și cea oferită altora',
  putere: 'puterea lui Dumnezeu manifestată în slăbiciunea noastră',
  recunostinta: 'recunoștința ca mod de viață, nu doar sentiment ocazional',
  intelepciune: 'înțelepciunea divină în deciziile zilnice, discernământul spiritual'
};

// ═══════════════════════════════════════
// VERSETE RECOMANDATE PER TEMĂ
// ═══════════════════════════════════════
const VERSETE_RECOMANDATE = {
  iertare: [
    { carte: '1 Ioan', capitol: 1, verset: 9 },
    { carte: 'Efeseni', capitol: 4, verset: 32 },
    { carte: 'Coloseni', capitol: 3, verset: 13 },
    { carte: 'Psalmi', capitol: 103, verset: 12 },
    { carte: 'Matei', capitol: 6, verset: 14 },
    { carte: 'Luca', capitol: 23, verset: 34 },
    { carte: 'Romani', capitol: 8, verset: 1 },
    { carte: '2 Corinteni', capitol: 2, verset: 7 },
    { carte: 'Mica', capitol: 7, verset: 18 },
    { carte: 'Ieremia', capitol: 31, verset: 34 }
  ],
  dragoste: [
    { carte: '1 Corinteni', capitol: 13, verset: 4 },
    { carte: 'Ioan', capitol: 3, verset: 16 },
    { carte: 'Romani', capitol: 8, verset: 38 },
    { carte: '1 Ioan', capitol: 4, verset: 8 },
    { carte: '1 Ioan', capitol: 4, verset: 19 },
    { carte: 'Ioan', capitol: 15, verset: 13 },
    { carte: 'Romani', capitol: 5, verset: 8 },
    { carte: 'Efeseni', capitol: 3, verset: 17 },
    { carte: 'Psalmi', capitol: 136, verset: 1 },
    { carte: 'Zaharia', capitol: 3, verset: 17 }
  ],
  credinta: [
    { carte: 'Evrei', capitol: 11, verset: 1 },
    { carte: 'Romani', capitol: 10, verset: 17 },
    { carte: 'Marcu', capitol: 11, verset: 24 },
    { carte: 'Matei', capitol: 17, verset: 20 },
    { carte: 'Galateni', capitol: 2, verset: 20 },
    { carte: 'Habacuc', capitol: 2, verset: 4 },
    { carte: 'Iacov', capitol: 2, verset: 17 },
    { carte: 'Ioan', capitol: 20, verset: 29 },
    { carte: '2 Corinteni', capitol: 5, verset: 7 },
    { carte: 'Filipeni', capitol: 4, verset: 13 }
  ],
  pace: [
    { carte: 'Filipeni', capitol: 4, verset: 7 },
    { carte: 'Ioan', capitol: 14, verset: 27 },
    { carte: 'Isaia', capitol: 26, verset: 3 },
    { carte: 'Romani', capitol: 5, verset: 1 },
    { carte: 'Psalmi', capitol: 46, verset: 1 },
    { carte: 'Matei', capitol: 11, verset: 28 },
    { carte: '2 Tesaloniceni', capitol: 3, verset: 16 },
    { carte: 'Numeri', capitol: 6, verset: 26 },
    { carte: 'Ioan', capitol: 16, verset: 33 },
    { carte: 'Coloseni', capitol: 3, verset: 15 }
  ],
  bucurie: [
    { carte: 'Nehemia', capitol: 8, verset: 10 },
    { carte: 'Filipeni', capitol: 4, verset: 4 },
    { carte: 'Psalmi', capitol: 16, verset: 11 },
    { carte: 'Ioan', capitol: 15, verset: 11 },
    { carte: 'Romani', capitol: 15, verset: 13 },
    { carte: 'Galateni', capitol: 5, verset: 22 },
    { carte: 'Psalmi', capitol: 30, verset: 5 },
    { carte: '1 Petru', capitol: 1, verset: 8 },
    { carte: 'Isaia', capitol: 61, verset: 10 },
    { carte: 'Luca', capitol: 15, verset: 7 }
  ],
  speranta: [
    { carte: 'Romani', capitol: 15, verset: 13 },
    { carte: 'Ieremia', capitol: 29, verset: 11 },
    { carte: 'Psalmi', capitol: 31, verset: 24 },
    { carte: 'Isaia', capitol: 40, verset: 31 },
    { carte: 'Romani', capitol: 8, verset: 28 },
    { carte: 'Evrei', capitol: 6, verset: 19 },
    { carte: 'Psalmi', capitol: 42, verset: 11 },
    { carte: 'Romani', capitol: 5, verset: 3 },
    { carte: '1 Petru', capitol: 1, verset: 3 },
    { carte: 'Plângerile', capitol: 3, verset: 22 }
  ],
  rugaciune: [
    { carte: 'Filipeni', capitol: 4, verset: 6 },
    { carte: 'Matei', capitol: 7, verset: 7 },
    { carte: '1 Tesaloniceni', capitol: 5, verset: 17 },
    { carte: 'Ieremia', capitol: 33, verset: 3 },
    { carte: 'Psalmi', capitol: 145, verset: 18 },
    { carte: 'Iacov', capitol: 5, verset: 16 },
    { carte: 'Ioan', capitol: 16, verset: 24 },
    { carte: 'Luca', capitol: 18, verset: 1 },
    { carte: 'Romani', capitol: 8, verset: 26 },
    { carte: 'Matei', capitol: 6, verset: 9 }
  ],
  putere: [
    { carte: 'Filipeni', capitol: 4, verset: 13 },
    { carte: 'Isaia', capitol: 40, verset: 31 },
    { carte: '2 Corinteni', capitol: 12, verset: 9 },
    { carte: 'Efeseni', capitol: 6, verset: 10 },
    { carte: 'Psalmi', capitol: 28, verset: 7 },
    { carte: 'Isaia', capitol: 41, verset: 10 },
    { carte: 'Zaharia', capitol: 4, verset: 6 },
    { carte: 'Romani', capitol: 8, verset: 37 },
    { carte: '2 Timotei', capitol: 1, verset: 7 },
    { carte: 'Psalmi', capitol: 46, verset: 1 }
  ],
  recunostinta: [
    { carte: '1 Tesaloniceni', capitol: 5, verset: 18 },
    { carte: 'Psalmi', capitol: 107, verset: 1 },
    { carte: 'Coloseni', capitol: 3, verset: 17 },
    { carte: 'Filipeni', capitol: 4, verset: 6 },
    { carte: 'Psalmi', capitol: 100, verset: 4 },
    { carte: 'Efeseni', capitol: 5, verset: 20 },
    { carte: 'Psalmi', capitol: 136, verset: 1 },
    { carte: 'Luca', capitol: 17, verset: 17 },
    { carte: 'Psalmi', capitol: 103, verset: 2 },
    { carte: 'Romani', capitol: 1, verset: 21 }
  ],
  intelepciune: [
    { carte: 'Iacov', capitol: 1, verset: 5 },
    { carte: 'Proverbe', capitol: 3, verset: 5 },
    { carte: 'Proverbe', capitol: 1, verset: 7 },
    { carte: 'Psalmi', capitol: 111, verset: 10 },
    { carte: 'Proverbe', capitol: 4, verset: 7 },
    { carte: 'Eclesiastul', capitol: 12, verset: 13 },
    { carte: 'Isaia', capitol: 11, verset: 2 },
    { carte: 'Coloseni', capitol: 2, verset: 3 },
    { carte: '1 Corinteni', capitol: 1, verset: 30 },
    { carte: 'Romani', capitol: 11, verset: 33 }
  ]
};

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function getRomaniaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bucharest'
  }).format(date);
}

function getThemeForDate(dateKey) {
  const sum = dateKey
    .split('-')
    .join('')
    .split('')
    .reduce((a, b) => a + Number(b), 0);
  return THEMES[sum % THEMES.length];
}

async function getVerseForTheme(theme) {
  // Încearcă mai întâi din lista de versete recomandate
  const recomandate = VERSETE_RECOMANDATE[theme];

  if (recomandate && recomandate.length > 0) {
    const rec = recomandate[Math.floor(Math.random() * recomandate.length)];

    try {
      const verse = await Verse.findOne({
        carte: rec.carte,
        capitol: rec.capitol,
        verset: rec.verset
      }).lean();

      if (verse) {
        console.log(`📖 Verset recomandat: ${rec.carte} ${rec.capitol}:${rec.verset}`);
        return {
          text: verse.text,
          reference: verse.referinta || `${verse.carte} ${verse.capitol}:${verse.verset}`,
          book: verse.carte,
          chapter: verse.capitol,
          number: verse.verset
        };
      }
    } catch (err) {
      console.log('⚠️ Verset recomandat negăsit, încerc regex');
    }
  }

  // Fallback — regex pe cuvinte cheie
  const regex = THEME_KEYWORDS[theme] || theme;
  let verse = null;

  try {
    const found = await Verse.aggregate([
      { $match: { text: { $regex: regex, $options: 'i' } } },
      { $sample: { size: 1 } }
    ]);
    verse = found[0];
  } catch (err) {
    console.log('⚠️ Aggregate eșuat, încerc random fallback');
  }

  if (!verse) {
    const count = await Verse.countDocuments();
    const random = Math.floor(Math.random() * Math.max(count, 1));
    verse = await Verse.findOne().skip(random).lean();
  }

  return {
    text: verse.text,
    reference: verse.referinta || `${verse.carte} ${verse.capitol}:${verse.verset}`,
    book: verse.carte,
    chapter: verse.capitol,
    number: verse.verset
  };
}

function extractJson(raw) {
  if (!raw) throw new Error('Raw output gol');

  // Elimină BOM
  let text = raw.replace(/^\uFEFF/, '');

  // Elimină ORICE backticks indiferent de format sau spații
  // Acoperă: ```json, ``` json, ```JSON, ` ` ` json etc.
  text = text.replace(/`{3,}[a-z]*\s*/gi, '').replace(/`{3,}\s*/gi, '');

  // Extrage între prima { și ultima }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    console.log('❌ Nu am găsit {}. Text după cleanup:', text.substring(0, 200));
    throw new Error('Nu am găsit JSON valid în răspuns');
  }

  text = text.substring(firstBrace, lastBrace + 1);

  // Curăță caractere control
  text = text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('❌ JSON.parse eșuat:', text.substring(0, 500));
    throw e;
  }
}

// ═══════════════════════════════════════
// FALLBACK LOCAL
// ═══════════════════════════════════════
function buildFallbackDevotional({ theme, verseText, verseReference }) {
  const titles = {
    dragoste: 'Iubirea care nu te lasă',
    credinta: 'Când alegi să crezi',
    pace: 'Pacea din mijlocul furtunii',
    bucurie: 'Bucuria care vine din Domnul',
    speranta: 'Speranță pentru azi',
    rugaciune: 'Puterea unei rugăciuni sincere',
    iertare: 'Libertatea iertării',
    putere: 'Tărie în slăbiciune',
    recunostinta: 'O inimă mulțumitoare',
    intelepciune: 'Lumina unei decizii bune'
  };

  return {
    title: titles[theme] || 'Un gând pentru sufletul tău',
    introduction: `Versetul de astăzi ne cheamă să privim mai adânc în inima noastră și să descoperim ce înseamnă cu adevărat ${theme} în viața de zi cu zi.`,
    reflection: `Cuvântul lui Dumnezeu nu este doar o promisiune frumoasă, ci o realitate vie. În fiecare încercare, în fiecare întrebare și în fiecare pas, El rămâne credincios. Versetul acesta ne cheamă să ne așezăm inima din nou în mâinile Lui și să descoperim profunzimea iubirii Sale pentru noi.`,
    practicalApplication: `Alege astăzi să trăiești acest adevăr într-un mod concret: oprește-te câteva minute, citește din nou versetul, roagă-te și întreabă-L pe Dumnezeu cum îl poți aplica în situația ta actuală.`,
    prayer: `Doamne, îți mulțumesc pentru Cuvântul Tău care vorbește direct inimii mele. Ajută-mă să nu rămân doar la citire, ci să trăiesc ceea ce îmi spui astăzi. Întărește-mi inima și călăuzește-mi pașii. Amin.`,
    thoughtOfTheDay: `Dumnezeu vorbește și astăzi inimii tale prin Cuvântul Său.`
  };
}

// ═══════════════════════════════════════
// VALIDARE OUTPUT AI
// ═══════════════════════════════════════
function validateDevotionalBasic(data) {
  const required = [
    'title',
    'introduction',
    'reflection',
    'practicalApplication',
    'prayer',
    'thoughtOfTheDay'
  ];

  for (const field of required) {
    if (!data[field] || data[field].trim().length < 10) {
      throw new Error(`Câmpul "${field}" lipsește sau e prea scurt`);
    }
  }

  if (data.reflection.length < 80) {
    throw new Error('Reflecția e prea scurtă');
  }

  if (data.prayer.length < 40) {
    throw new Error('Rugăciunea e prea scurtă');
  }

  // Clișee grave — aruncă eroare ca să regenereze
  const cliseeGrave = [
    'acest verset ne amintește',
    'în lumea de astăzi',
    'nu este întâmplător că',
    'dragi prieteni',
    'în concluzie',
    'dumnezeu dorește să'
  ];

  const textComplet = Object.values(data).join(' ').toLowerCase();

  for (const c of cliseeGrave) {
    if (textComplet.includes(c)) {
      console.log(`⚠️ Clișeu grav detectat: "${c}" — regenerez`);
      throw new Error(`Text conține clișeu de evitat: "${c}"`);
    }
  }

  // Verifică că aplicația e concretă — doar log
  const aplicatie = data.practicalApplication.toLowerCase();
  const areConcretetete = [
    '?',
    'azi ',
    'astăzi',
    'acum',
    'încearcă',
    'alege',
    'scrie',
    'sună',
    'vorbește',
    'roagă-te',
    'există',
    'gândește-te'
  ].some(k => aplicatie.includes(k));

  if (!areConcretetete) {
    console.log('⚠️ Aplicația practică pare prea vagă');
  }

  return true;
}

// ═══════════════════════════════════════
// GENERARE CU AI — prompt premium v3
// ═══════════════════════════════════════
async function generateDevotionalWithAI({
  theme,
  verseText,
  verseReference,
  schema,
  geminiService,
  buildFallbackDevotional
}) {

  const prompt = `
Scrie un devoțional creștin STRICT pe baza schemei:

SCHEMA:
${JSON.stringify(schema)}

VERSET: "${verseText}"
REFERINȚĂ: ${verseReference}
TEMA: ${theme}

REGULI:
- folosește DOAR schema
- fără idei externe
- o singură metaforă
- fără clișee religioase
- răspuns DOAR JSON valid

STRUCTURĂ:
{
"title":"",
"introduction":"",
"reflection":"",
"practicalApplication":"",
"prayer":"",
"thoughtOfTheDay":""
}
`;

  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await geminiService.generateDevotional(prompt, 2000);
      const parsed = safeExtractJson(result?.text);

      if (parsed && validateDevotional(schema, parsed)) {
        return {
          data: parsed,
          model: result.model || 'gemini',
          provider: result.provider || 'ai'
        };
      }

      console.log(`⚠️ AI invalid attempt ${attempt + 1}`);
    } catch (e) {
      console.log(`❌ AI error attempt ${attempt + 1}:`, e.message);
    }
  }

  // fallback garantat
  return {
    data: buildFallbackDevotional({
      theme,
      verseText,
      verseReference
    }),
    model: 'fallback',
    provider: 'local'
  };
}

  // ── PAS 2: Generează devoționalul ──
  const devotionalPrompt = schema
  ? `Scrie un devoțional creștin pastoral în limba română pe baza acestei scheme biblice.

SCHEMA VERSETULUI:
${JSON.stringify(schema, null, 2)}

VERSET ORIGINAL: "${verseText}"
REFERINȚĂ: ${verseReference}
TEMA: ${theme}

━━━━━━━━━━━━━━
REGULĂ FUNDAMENTALĂ:
Tot devoționalul trebuie derivat STRICT din:
- actors
- actions
- commands
- keyMessage
- spiritualCore

Dacă adaugi informații externe → INVALID.

━━━━━━━━━━━━━━
STRUCTURĂ OBLIGATORIE:

title:
max 7 cuvinte, bazat pe keyMessage

introduction:
problemă umană direct legată de actions/commands

reflection:
- explică actors + actions + commands
- explică spiritualCore clar
- o singură metaforă (derivată din schema)
- aplicare logică, nu generală
4-5 propoziții

practicalApplication:
pas concret din commands/actions SAU întrebare directă

prayer:
bazată strict pe spiritualCore
cu „Doamne” sau „Dumnezeu”

thoughtOfTheDay:
max 15 cuvinte, diferit de title

━━━━━━━━━━━━━━
REGULI CRITICE:

- fără idei externe versetului
- fără clișee religioase
- fără metafore multiple
- fără interpretări generale

━━━━━━━━━━━━━━
VALIDARE INTERNĂ:

Verifică înainte de răspuns:
✔ toate actions sunt explicate
✔ commands sunt incluse (dacă există)
✔ spiritualCore apare clar
✔ metafora este unică
✔ textul NU poate fi mutat pe alt verset

Returnează DOAR JSON valid:
{"title":"","introduction":"","reflection":"","practicalApplication":"","prayer":"","thoughtOfTheDay":""}`
  : fallbackPrompt;

  let maxRetries = 2;
let result;

for (let i = 0; i < maxRetries; i++) {
  result = await geminiService.generateDevotional(devotionalPrompt, 2000);
  const raw = result.text;

  try {
    const parsed = extractJson(raw);

    const isValid = schema ? validateDevotional(schema, parsed) : true;

    if (isValid) {
      console.log("✅ Valid devotional după", i + 1, "încercări");
      return {
        data: parsed,
        model: result.model,
        provider: result.provider
      };
    }

    console.log("⚠️ Invalid devotional, retry...");
  } catch (e) {
    console.log("❌ JSON invalid, retry...");
  }
}

throw new Error("Devotional invalid după retry-uri");




// ═══════════════════════════════════════
// VALIDARE DEVOTIONAL (AI OUTPUT)
// ═══════════════════════════════════════
function validateDevotional(schema, devo) {
  if (!devo) return false;

  const requiredFields = [
    'title',
    'introduction',
    'reflection',
    'practicalApplication',
    'prayer',
    'thoughtOfTheDay'
  ];

  for (const f of requiredFields) {
    if (!devo[f] || typeof devo[f] !== 'string' || devo[f].trim().length < 10) {
      return false;
    }
  }

  const reflection = devo.reflection.toLowerCase();

  // verifică actions din schema
  const missingActions =
    (schema?.actions || []).filter(a => !reflection.includes(a.toLowerCase()));

  if (missingActions.length > 0) {
    console.log('❌ Missing actions:', missingActions);
    return false;
  }

  // detectare metafore excesive (heuristic)
  const metaphors = (reflection.match(/ca |precum|asemenea|este ca/gi) || []).length;
  if (metaphors > 2) return false;

  // anti-cliseu
  const text = JSON.stringify(devo).toLowerCase();
  const banned = [
    'acest verset ne amintește',
    'în lumea de astăzi',
    'dumnezeu dorește',
    'în concluzie'
  ];

  if (banned.some(b => text.includes(b))) return false;

  return true;
}





function safeExtractJson(raw) {
  if (!raw || typeof raw !== 'string') return null;

  let text = raw
    .replace(/```json|```/gi, '')
    .trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(text.substring(start, end + 1));
  } catch {
    return null;
  }
}





// ═══════════════════════════════════════
// CREARE DEVOȚIONAL PENTRU O ZI
// ═══════════════════════════════════════
async function createDevotionalForDate(date = new Date()) {
  const dateKey = getRomaniaDateKey(date);

  const existing = await DailyDevotional.findOne({ dateKey }).lean();
  if (existing) return existing;

  const theme = getThemeForDate(dateKey);
  const verse = await getVerseForTheme(theme);

  let devotionalData;
  let meta = { generatedBy: 'fallback', aiModel: '' };

  try {
    if (geminiService.isConfigured()) {

      const schemaResult = await geminiService.generateDevotional(
        `Analizează versetul și returnează JSON schema.`,
        800
      );

      const schema = safeExtractJson(schemaResult?.text);

      if (!schema) throw new Error('Schema invalid');

      const aiResult = await generateDevotionalWithAI({
        theme,
        verseText: verse.text,
        verseReference: verse.reference,
        schema,
        geminiService,
        buildFallbackDevotional
      });

      devotionalData = aiResult.data;
      meta.generatedBy = aiResult.provider;
      meta.aiModel = aiResult.model;

    } else {
      throw new Error('AI not configured');
    }

  } catch (err) {
    console.log('⚠️ Fallback triggered:', err.message);

    devotionalData = buildFallbackDevotional({
      theme,
      verseText: verse.text,
      verseReference: verse.reference
    });

    meta = { generatedBy: 'fallback', aiModel: '' };
  }

  const created = await DailyDevotional.create({
    dateKey,
    theme,
    verseText: verse.text,
    verseReference: verse.reference,
    verseBook: verse.book,
    verseChapter: verse.chapter,
    verseNumber: verse.number,

    ...devotionalData,

    generatedBy: meta.generatedBy,
    aiModel: meta.aiModel,
    published: true
  });

  return created.toObject();
}

// ═══════════════════════════════════════
// API PUBLICE
// ═══════════════════════════════════════
async function getTodayDevotional() {
  return createDevotionalForDate(new Date());
}

async function getDevotionalByDate(dateKey) {
  let devotional = await DailyDevotional.findOne({ dateKey }).lean();
  if (!devotional && dateKey === getRomaniaDateKey()) {
    devotional = await createDevotionalForDate(new Date());
  }
  return devotional;
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