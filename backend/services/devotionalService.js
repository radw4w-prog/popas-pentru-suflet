// backend/services/devotionalService.js
const DailyDevotional = require('../models/DailyDevotional');
const Verse = require('../models/Verse');
const geminiService = require('./geminiService');
const { theologicalAIValidatorV9 } = require('./theologyValidatorV9');

// ═══════════════════════════════════════
// CONFIGURARE
// ═══════════════════════════════════════
const MAX_RETRIES = 4;

// ── Tokeni per tip de cerere ──
const TOKEN_LIMITS = {
  schema: 1024,
  devotional: 4096,
  rewrite: 4096
};

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

  if (!verse) {
    throw new Error("Nu s-a putut găsi un verset.");
  }

  return {
    text: verse.text,
    reference: verse.referinta || `${verse.carte} ${verse.capitol}:${verse.verset}`,
    book: verse.carte,
    chapter: verse.capitol,
    number: verse.verset
  };
}

// ═══════════════════════════════════════
// EXTRACT JSON ROBUST (cu recuperare)
// ═══════════════════════════════════════
function extractJson(raw) {
  try {
    let text = raw.trim();

    // Elimină blocuri markdown ```json ... ```
    const block = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (block) text = block[1].trim();

    // Găsește primul {
    const first = text.indexOf('{');
    if (first === -1) {
      throw new Error("Nu s-a găsit '{' în răspuns.");
    }

    text = text.slice(first);

    // Găsește ultimul } valid
    const last = text.lastIndexOf('}');

    if (last !== -1 && last > first) {
      text = text.slice(0, last + 1);
    } else {
      // ── RECUPERARE JSON TĂIAT (truncated) ──
      console.log('🔧 JSON tăiat detectat — încerc recuperare...');

      // Închide stringul deschis (ex: "introduction": "text parțial")
      text = text.replace(/"([^"]*?)$/, '"$1"');

      // Închide array-urile deschise
      const openBrackets = (text.match(/\[/g) || []).length;
      const closeBrackets = (text.match(/]/g) || []).length;
      text += ']'.repeat(Math.max(0, openBrackets - closeBrackets));

      // Închide obiectele deschise
      const openBraces = (text.match(/{/g) || []).length;
      const closeBraces = (text.match(/}/g) || []).length;
      text += '}'.repeat(Math.max(0, openBraces - closeBraces));

      console.log('🔧 Recuperare JSON efectuată.');
    }

    return JSON.parse(text);
  } catch (err) {
    throw new Error("JSON extraction failed: " + err.message);
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
// PROMPTS
// ═══════════════════════════════════════
const SCHEMA_PROMPT_TEMPLATE = (verse) => `
Analizează STRICT versetul biblic.

VERSET:
"${verse.text}"

REFERINȚĂ:
${verse.reference}

Returnează DOAR JSON valid.

FORMAT:
{
  "actors": [],
  "actions": [],
  "commands": [],
  "coreExpressions": [],
  "keyMessage": "",
  "spiritualCore": "",
  "scope": ""
}

REGULI:
1. Extrage DOAR elemente explicite din text.
2. actors = max 3 entități explicite.
3. actions = max 3 verbe/acțiuni explicite.
4. commands = doar imperative; altfel [].
5. coreExpressions = max 3 expresii exacte din verset.
6. keyMessage = max 15 cuvinte.
7. spiritualCore = max 15 cuvinte.
8. scope = personal | comunitar | doctrinar.

DOAR JSON.
`;

const DEVOTIONAL_PROMPT_TEMPLATE = ({ verseText, verseReference, theme, schema }) => `
Scrie un devoțional creștin profund în limba română.

━━━━━━━━━━━━━━
VERSET: "${verseText}"
REFERINȚĂ: ${verseReference}
TEMA: ${theme}

SCHEMA:
keyMessage: ${schema?.keyMessage || ''}
spiritualCore: ${schema?.spiritualCore || ''}
actions: ${schema?.actions?.join(', ') || ''}
commands: ${schema?.commands?.length ? schema.commands.join(', ') : 'none'}
actors: ${schema?.actors?.join(', ') || ''}
coreExpressions: ${schema?.coreExpressions?.join(', ') || ''}

━━━━━━━━━━━━━━
REGULI ABSOLUTE:
1. Scrii EXCLUSIV din acest verset. NU alte versete, NU idei externe.
2. Fiecare propoziție trebuie să poată fi mutată pe acest verset și numai pe acesta.

INTRODUCERE (3-4 propoziții):
- Pornește din tensiunea exactă a versetului
- NU: "Viața este grea", "În momentele dificile", "Cu toții trecem prin"

REFLECȚIE (4-5 propoziții):
- Ce spune versetul, de ce, ce schimbă în om
- Include TOATE actions, commands, minimum 2 coreExpressions, spiritualCore

APLICAȚIE PRACTICĂ:
- Un singur pas CONCRET realizabil azi în sub 5 minute
- SAU o întrebare directă cu ?

RUGĂCIUNE (începe cu "Doamne"):
- Specifică versetului. Personală. Bazată pe spiritualCore.

STIL: Pastor român matur. Cald. Empatic. Natural.
INTERZIS: "acest verset ne amintește", "în concluzie", "dragi prieteni", "nu este întâmplător că", "dumnezeu are un plan"

━━━━━━━━━━━━━━
Returnează DOAR JSON:
{
 "title": "",
 "introduction": "",
 "reflection": "",
 "practicalApplication": "",
 "prayer": "",
 "thoughtOfTheDay": ""
}
`;

// ═══════════════════════════════════════
// GENERARE CU AI
// ═══════════════════════════════════════
async function generateSchema(verse) {
  const prompt = SCHEMA_PROMPT_TEMPLATE(verse);
  const raw = await geminiService.generate(
    prompt,
    TOKEN_LIMITS.schema,   // 1024 (era 700)
    0.2
  );
  return extractJson(raw);
}

async function generateDevotionalWithAI(data, schema) {
  const prompt = DEVOTIONAL_PROMPT_TEMPLATE({
    verseText: data.verseText,
    verseReference: data.verseReference,
    theme: data.theme,
    schema: schema
  });

  const raw = await geminiService.generate(
    prompt,
    TOKEN_LIMITS.devotional,  // 4096 (era 1800 — CAUZA PRINCIPALĂ A EȘECULUI)
    0.45
  );

  console.log('🤖 RAW AI output (primele 500 chars):', raw?.substring(0, 500));

  try {
    const parsed = extractJson(raw);
    console.log('✅ JSON parsed OK:', parsed?.title);
    return parsed;
  } catch (e) {
    console.log('❌ JSON parse error:', e.message);
    throw e;
  }
}

// ═══════════════════════════════════════
// VALIDARE STRUCTURALĂ
// ═══════════════════════════════════════
function validateStructure(schema, devotional) {
  if (!devotional) {
    console.log("❌ [STRUCTURĂ] Devoționalul este gol.");
    return false;
  }

  const requiredFields = [
    'title',
    'introduction',
    'reflection',
    'practicalApplication',
    'prayer',
    'thoughtOfTheDay'
  ];

  for (const field of requiredFields) {
    if (!devotional[field] || devotional[field].trim().length < 15) {
      console.log(`❌ [STRUCTURĂ] Câmpul "${field}" lipsește sau e prea scurt.`);
      return false;
    }
  }

  if (devotional.reflection.length < 80) {
    console.log('❌ [STRUCTURĂ] Reflecția este prea scurtă.');
    return false;
  }

  if (devotional.prayer.length < 40) {
    console.log('❌ [STRUCTURĂ] Rugăciunea este prea scurtă.');
    return false;
  }

  const combinedText = Object.values(devotional).join(' ').toLowerCase();

  const cliseeGrave = [
    'acest verset ne amintește',
    'în lumea de astăzi',
    'nu este întâmplător că',
    'dragi prieteni',
    'în concluzie',
    'dumnezeu dorește să'
  ];

  for (const c of cliseeGrave) {
    if (combinedText.includes(c)) {
      console.log(`❌ [STRUCTURĂ] Clișeu grav: "${c}"`);
      return false;
    }
  }

  if (schema) {
    const reflectionLower = devotional.reflection.toLowerCase();

    if (schema.actions && schema.actions.length > 0) {
      const missingActions = schema.actions.filter(action =>
        !reflectionLower.includes(action.toLowerCase())
      );
      if (missingActions.length > 0) {
        console.log("❌ [STRUCTURĂ] Acțiuni lipsă:", missingActions.join(', '));
        return false;
      }
    }

    if (schema.coreExpressions && schema.coreExpressions.length > 0) {
      let found = 0;
      schema.coreExpressions.forEach(expr => {
        if (combinedText.includes(expr.toLowerCase())) found++;
      });

      const requiredCount = Math.min(2, schema.coreExpressions.length);
      if (found < requiredCount) {
        console.log(`❌ [STRUCTURĂ] Expresii cheie insuficiente (${found}/${requiredCount}).`);
        return false;
      }
    }
  }

  return true;
}

// ═══════════════════════════════════════
// VALIDARE COMPLETĂ (structură + V9)
// ═══════════════════════════════════════
async function validateDevotionalFull(schema, devotional, verse, theme) {
  const structureOk = validateStructure(schema, devotional);
  if (!structureOk) {
    return { isValid: false, devotional: null, theologyScore: null };
  }
  console.log('✅ Validare structurală OK.');

  try {
    const theologyResult = await theologicalAIValidatorV9(devotional, verse, theme);

    console.log(`🔍 [TEOLOGIE V9] Scor: ${theologyResult.score}/100`);

    if (theologyResult.issues && theologyResult.issues.length > 0) {
      theologyResult.issues.forEach(issue => console.log(`   ⚠️ ${issue}`));
    }

    // Valid direct
    if (theologyResult.isValid) {
      return {
        isValid: true,
        devotional,
        theologyScore: theologyResult.score
      };
    }

    // Auto-fix disponibil
    if (!theologyResult.isValid && theologyResult.fixed) {
      console.log('🔧 AUTO-FIX V9 aplicat.');
      const fixedOk = validateStructure(schema, theologyResult.fixed);
      if (fixedOk) {
        return {
          isValid: true,
          devotional: theologyResult.fixed,
          theologyScore: theologyResult.score,
          wasAutoFixed: true
        };
      }
      console.log('❌ Auto-fix nu trece validarea structurală.');
      return { isValid: false, devotional: null, theologyScore: theologyResult.score };
    }

    // Invalid fără fix
    return { isValid: false, devotional: null, theologyScore: theologyResult.score };

  } catch (theologyErr) {
    console.log('⚠️ V9 indisponibil:', theologyErr.message, '— accept pe structural.');
    return { isValid: true, devotional, theologyScore: null, v9Error: theologyErr.message };
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

  let devotionalData = null;
  let generatedBy = 'fallback';
  let aiModel = '';
  let theologyScore = null;
  let wasAutoFixed = false;

  if (geminiService.isConfigured()) {
    let retries = 0;

    while (retries < MAX_RETRIES) {
      console.log(`\n🔄 Încercare AI (${retries + 1}/${MAX_RETRIES}) — ${dateKey} — tema: ${theme}`);

      let schemaResult = null;

      try {
        // Schemă
        try {
          schemaResult = await generateSchema(verse);
          console.log('✅ Schemă OK');
        } catch (schemaErr) {
          console.log('⚠️ Schemă eșuată, continui goală:', schemaErr.message);
          schemaResult = {
            actors: [], actions: [], commands: [],
            coreExpressions: [], keyMessage: '', spiritualCore: '', scope: ''
          };
        }

        // Devoțional
        const aiResult = await generateDevotionalWithAI({
          theme,
          verseText: verse.text,
          verseReference: verse.reference
        }, schemaResult);

        // Validare completă
        const result = await validateDevotionalFull(
          schemaResult, aiResult, verse, theme
        );

        if (result.isValid && result.devotional) {
          devotionalData = result.devotional;
          generatedBy = 'ai';
          aiModel = 'gemini-2.5-flash';
          theologyScore = result.theologyScore;
          wasAutoFixed = result.wasAutoFixed || false;
          console.log(`✅ Acceptat${wasAutoFixed ? ' (auto-fixed)' : ''} — teologie: ${theologyScore || 'N/A'}/100`);
          break;
        }
      } catch (err) {
        console.log('⚠️ Eroare ciclu AI:', err.message);
      }

      retries++;
    }
  }

  if (!devotionalData) {
    console.log('⚠️ Fallback local activat.');
    devotionalData = buildFallbackDevotional({
      theme, verseText: verse.text, verseReference: verse.reference
    });
    generatedBy = 'fallback';
  }

  // Salvare DB
  try {
    const docToSave = {
      dateKey, theme,
      verseText: verse.text,
      verseReference: verse.reference,
      verseBook: verse.book,
      verseChapter: verse.chapter,
      verseNumber: verse.number,
      title: devotionalData.title,
      introduction: devotionalData.introduction,
      reflection: devotionalData.reflection,
      practicalApplication: devotionalData.practicalApplication,
      prayer: devotionalData.prayer,
      thoughtOfTheDay: devotionalData.thoughtOfTheDay,
      generatedBy, aiModel,
      published: true
    };

    if (theologyScore !== null) docToSave.theologyScore = theologyScore;
    if (wasAutoFixed) docToSave.wasAutoFixed = true;

    const created = await DailyDevotional.create(docToSave);
    console.log(`📖 Salvat: "${created.title}" | ${generatedBy}`);
    return created.toObject();
  } catch (err) {
    if (err.code === 11000) {
      console.log('⚠️ Duplicat, preiau existentul.');
      return await DailyDevotional.findOne({ dateKey }).lean();
    }
    throw err;
  }
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
  return DailyDevotional.find({}).sort({ dateKey: -1 }).limit(limit).lean();
}

module.exports = {
  getRomaniaDateKey,
  getTodayDevotional,
  getDevotionalByDate,
  getRecentDevotionals,
  createDevotionalForDate
};