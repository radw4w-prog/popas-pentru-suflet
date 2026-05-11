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

const MAX_RETRIES = 4; // Moved to top-level as it's a configuration

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

  // Ensure a verse is always returned, even if it's the last resort
  if (!verse) {
    throw new Error("Nu s-a putut găsi un verset, chiar și cu fallback-ul aleatoriu.");
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
  let text = raw.trim();

  const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (blockMatch) text = blockMatch[1].trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(text);
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
// NEW: SCHEMA PROMPT AND VALIDATION
// ═══════════════════════════════════════

const SCHEMA_PROMPT_TEMPLATE = (verse) => `
Analizează atent versetul biblic și extrage STRICT elementele explicite din text.

VERSET:
"${verse.text}"

REFERINȚĂ:
${verse.reference}

Returnează DOAR JSON valid.
Fără explicații.
Fără markdown.
Fără backticks.

FORMAT:
{
  "actors": ["max 3 entități explicite"],
  "actions": ["max 3 acțiuni explicite"],
  "commands": ["imperative explicite sau []"],
  "coreExpressions": ["max 3 expresii-cheie exacte din verset"],
  "keyMessage": "max 15 cuvinte",
  "spiritualCore": "max 15 cuvinte",
  "scope": "personal|comunitar|doctrinar"
}

REGULI:
1. Extrage DOAR ce există textual.
2. Nu interpreta.
3. Nu predica.
4. Nu adăuga doctrină.
5. actors = cine apare explicit.
6. actions = verbe/acțiuni clare.
7. commands = doar imperative.
8. coreExpressions = expresii exacte din verset.
9. keyMessage = rezumat literal.
10. spiritualCore = adevărul central.
11. scope:
   - personal
   - comunitar
   - doctrinar

EXEMPLU:
{
  "actors":["Dumnezeu","credincios"],
  "actions":["întărește","susține"],
  "commands":["nu te teme"],
  "coreExpressions":["Harul Meu","îți este de ajuns"],
  "keyMessage":"Dumnezeu susține pe cel slab",
  "spiritualCore":"puterea divină lucrează în slăbiciune",
  "scope":"personal"
}
`;
function validateDevotionalAgainstSchema(schema, devotional) {
  if (!devotional) {
    console.log("❌ Devoționalul este gol.");
    return false;
  }

  const fields = [
    "title",
    "introduction",
    "reflection",
    "practicalApplication",
    "prayer",
    "thoughtOfTheDay"
  ];

  for (const f of fields) {
    if (!devotional[f] || devotional[f].trim().length < 10) {
      console.log(`❌ Câmpul "${f}" lipsește sau e prea scurt.`);
      return false;
    }
  }

  const devotionalTextCombined = Object.values(devotional).join(' ').toLowerCase();

  // Basic validation checks (from previous validateDevotional)
  if (devotional.reflection.length < 80) {
    console.log('❌ Reflecția este prea scurtă');
    return false;
  }

  if (devotional.prayer.length < 40) {
    console.log('❌ Rugăciunea este prea scurtă');
    return false;
  }

  const cliseeGrave = [
    'acest verset ne amintește',
    'în lumea de astăzi',
    'nu este întâmplător că',
    'dragi prieteni',
    'în concluzie',
    'dumnezeu dorește să'
  ];

  for (const c of cliseeGrave) {
    if (devotionalTextCombined.includes(c)) {
      console.log(`⚠️ Clișeu grav detectat în devoțional: "${c}"`);
      return false; // Fail validation if cliché is found
    }
  }

  // Schema-based validation
  const reflectionLower = devotional.reflection.toLowerCase();

  if (schema.actions && schema.actions.length > 0) {
    const missingActions = schema.actions.filter(action =>
      !reflectionLower.includes(action.toLowerCase())
    );
    if (missingActions.length > 0) {
      console.log("❌ Devoționalul nu menționează toate acțiunile din schemă:", missingActions.join(', '));
      return false;
    }
  }

  // Checking keyMessage and spiritualCore could be tricky if they are very short and might be implied
  // For now, let's check if the spiritualCore (or a significant word from it) is present.
  if (schema.spiritualCore) {
    const coreWords = schema.spiritualCore.split(/\s+/).filter(Boolean);
    const hasCore = coreWords.some(word => reflectionLower.includes(word.toLowerCase()));
    if (!hasCore) {
      console.log("❌ Devoționalul nu pare să abordeze 'spiritualCore' din schemă.");
      return false;
    }
  }

  // The 'generic' check for common phrases that might signal lack of depth
  const genericPhrases = [
    "o realitate profundă",
    "ancoră pentru suflet",
    "dumnezeu ne întâlnește",
    "în mijlocul vieții"
  ];
  if (genericPhrases.some(g => devotionalTextCombined.includes(g))) {
    console.log("❌ Devoționalul conține text generic.");
    return false;
  }

  // Additional check for practicalApplication (exists in your original validateDevotional)
  const aplicatie = devotional.practicalApplication.toLowerCase();
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
    console.log('⚠️ Aplicația practică pare prea vagă (nu conține termeni concreți).');
    // Not failing validation, just logging a warning as per original
  }


  return true;
}


// ═══════════════════════════════════════
// GENERARE CU AI — prompt premium v3
// ═══════════════════════════════════════
async function generateDevotionalWithAI({ theme, verseText, verseReference }, schema) {
  const DEVOTIONAL_PROMPT_TEMPLATE = ({
  verseText,
  verseReference,
  theme,
  schema
}) => `
Scrie un devoțional creștin profund, pastoral și profund uman în limba română.

━━━━━━━━━━━━━━
VERSET:
"${verseText}"

REFERINȚĂ:
${verseReference}

TEMA:
${theme}

SCHEMA OBLIGATORIE:
- keyMessage: ${schema.keyMessage}
- spiritualCore: ${schema.spiritualCore}
- actions: ${schema.actions.join(', ')}
- commands: ${schema.commands.length ? schema.commands.join(', ') : 'N/A'}
- actors: ${schema.actors.join(', ')}
- coreExpressions: ${schema.coreExpressions.join(', ')}

━━━━━━━━━━━━━━
REGULA FUNDAMENTALĂ

Scrii EXCLUSIV din acest verset.

Nu din temă.
Nu din alte versete.
Nu din doctrine generale.

Dacă textul poate fi mutat pe alt verset,
este INVALID.

━━━━━━━━━━━━━━
CONTEXT BIBLIC OBLIGATORIU

Explică sensul versetului în contextul lui imediat.

Întreabă implicit:
- cine vorbește?
- cui?
- de ce?
- în ce situație?

Nu transforma versetul în slogan motivațional.

━━━━━━━━━━━━━━
INTRODUCERE

Pornește din tensiunea umană exactă a versetului.

Ex:
biruință → sentiment de înfrângere
pace → anxietate
iertare → vinovăție
putere → slăbiciune

INTERZIS:
"Viața e grea"
"În momentele dificile"
"Cu toții trecem prin"

━━━━━━━━━━━━━━
REFLECȚIE

Trebuie să explice explicit:
- keyMessage
- spiritualCore
- fiecare action
- fiecare command
- minimum 2 coreExpressions

Nu parafraza.
Explică.

Arată:
ce spune,
de ce spune,
ce schimbă.

Exact 4-5 propoziții.

━━━━━━━━━━━━━━
METAFORĂ

Este permisă EXACT UNA.

Trebuie derivată natural din verset.

Nu folosi:
furtuni
oceane
munți
drumuri
ziduri
foc

decât dacă apar în text.

A doua metaforă = INVALID.

━━━━━━━━━━━━━━
APLICAȚIE PRACTICĂ

Obligatoriu:
- un pas concret azi
SAU
- o întrebare directă personală

Trebuie să poată fi făcută în 5 minute.

Nu aplicații vagi.

━━━━━━━━━━━━━━
RUGĂCIUNE

- personală
- caldă
- specifică acestui verset
- bazată pe spiritualCore

Folosește:
"Doamne" sau "Dumnezeu"

Nu generică.

━━━━━━━━━━━━━━
STIL

Scrie ca un pastor român matur,
vorbind față în față.

Ton:
cald
uman
blând
empatic
pastoral

Nu ca profesor.
Nu ca AI.
Nu ca eseu.

━━━━━━━━━━━━━━
INTERZIS

"acest verset ne amintește"
"în lumea de astăzi"
"putem alege să"
"Dumnezeu dorește să"
"nu este întâmplător"
"în concluzie"
"dragi prieteni"

Nu repeta același cuvânt-cheie > 2 ori.

━━━━━━━━━━━━━━
JSON:

{
 "title":"max 7 cuvinte",
 "introduction":"2-3 propoziții",
 "reflection":"4-5 propoziții",
 "practicalApplication":"2-3 propoziții",
 "prayer":"3-4 propoziții",
 "thoughtOfTheDay":"max 15 cuvinte"
}

━━━━━━━━━━━━━━
VALIDARE INTERNĂ

✔ toate actions explicate
✔ toate commands explicate
✔ 2 coreExpressions prezente
✔ spiritualCore clar
✔ o singură metaforă
✔ ancorat în context
✔ nu poate fi mutat pe alt verset
✔ fără clișee
✔ fără repetiții

Dacă una e falsă → regenerează.

Returnează DOAR JSON.
Primul caracter: {
Ultimul caracter: }
`;

  const raw = await geminiService.generate(prompt, 2000, 0.35); // Added temperature

  console.log('🤖 RAW AI output (primele 500 chars):', raw?.substring(0, 500));

  try {
    const parsed = extractJson(raw);
    console.log('✅ JSON parsed OK:', parsed?.title);
    return parsed;
  } catch (e) {
    console.log('❌ JSON parse error:', e.message);
    console.log('🔍 Raw complet:', raw);
    throw e;
  }
}

// ═══════════════════════════════════════
// CREARE DEVOȚIONAL PENTRU O ZI
// ═══════════════════════════════════════
async function createDevotionalForDate(date = new Date()) {
  const dateKey = getRomaniaDateKey(date);
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const existing = await DailyDevotional.findOne({ dateKey }).lean();
    if (existing) return existing;

    const theme = getThemeForDate(dateKey);
    const verse = await getVerseForTheme(theme);

    let devotionalData;
    let generatedBy = 'fallback';
    let aiModel = '';
    let schemaResult = null;

    try {
      if (geminiService.isConfigured()) {
        // Step 1: Generate schema for the verse
        const schemaPrompt = SCHEMA_PROMPT_TEMPLATE(verse);
        const rawSchema = await geminiService.generate(schemaPrompt, 800, 0.35); // Added temperature
        try {
          schemaResult = extractJson(rawSchema);
          console.log('✅ Schema for verse parsed OK:', schemaResult);
        } catch (schemaParseError) {
          console.log('❌ Schema JSON parse error, continuing without schema:', schemaParseParseError.message);
          schemaResult = null; // Proceed without schema if parsing fails
        }

        // Step 2: Generate devotional using the schema (if available)
        devotionalData = await generateDevotionalWithAI({
          theme,
          verseText: verse.text,
          verseReference: verse.reference
        }, schemaResult); // Pass schema to the devotional generation

        try {
          validateDevotionalAgainstSchema(schemaResult, devotionalData); // Pass schema to validation
          console.log('✅ Devoțional validat cu succes împotriva schemei.');
          generatedBy = 'ai';
          // Make sure to use the actual model name if available from geminiService
          aiModel = 'gemini-1.5-pro'; // Changed from 'llama-3.3-70b-versatile' as you're using geminiService
        } catch (validErr) {
          console.log('⚠️ Validare eșuată:', validErr.message, '— reîncercare sau fallback...');
          retries++;
          if (retries < MAX_RETRIES) {
            console.log(`Reîncercare (${retries}/${MAX_RETRIES})...`);
            continue; // Retry the loop
          } else {
            console.log('Toate reîncercările au eșuat. Folosesc fallback.');
            devotionalData = buildFallbackDevotional({
              theme,
              verseText: verse.text,
              verseReference: verse.reference
            });
            generatedBy = 'fallback';
            aiModel = '';
          }
        }

      } else {
        console.log('⚠️ AI neconfigurat — folosesc fallback');
        devotionalData = buildFallbackDevotional({
          theme,
          verseText: verse.text,
          verseReference: verse.reference
        });
      }
    } catch (err) {
      console.log('⚠️ Eroare la generarea AI sau procesarea schemei:', err.message);
      retries++;
      if (retries < MAX_RETRIES) {
        console.log(`Reîncercare (${retries}/${MAX_RETRIES})...`);
        continue; // Retry the loop
      } else {
        console.log('Toate reîncercările AI au eșuat. Folosesc fallback.');
        devotionalData = buildFallbackDevotional({
          theme,
          verseText: verse.text,
          verseReference: verse.reference
        });
        generatedBy = 'fallback';
        aiModel = '';
      }
    }

    try {
      const created = await DailyDevotional.create({
        dateKey,
        theme,
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

        generatedBy,
        aiModel,
        published: true
      });

      console.log(`📖 Devoțional creat: ${created.title} | ${generatedBy} | ${aiModel}`);
      return created.toObject();

    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error, likely another process created it concurrently
        console.log('⚠️ Devoțional duplicat detectat, preiau existentul.');
        return await DailyDevotional.findOne({ dateKey }).lean();
      }
      throw err;
    }
  } // End of while loop

  // If we reach here, it means all retries failed and no devotional could be created.
  // This scenario should ideally be handled by the fallback within the loop,
  // but as a safety measure, we could throw an error or return a default.
  throw new Error(`Failed to create devotional for ${dateKey} after ${MAX_RETRIES} retries.`);
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
