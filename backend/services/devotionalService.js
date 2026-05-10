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
function validateDevotional(data) {
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
async function generateDevotionalWithAI({ theme, verseText, verseReference }) {

  // ── PAS 1: Extrage schema din verset ──
  const schemaPrompt = `Analizează versetul biblic și returnează DOAR JSON valid.

VERSET: "${verseText}"
REFERINȚĂ: ${verseReference}

JSON:
{"actors":["max 3 actori"],"actions":["max 3 verbe/actiuni"],"commands":["porunci directe, sau gol"],"keyMessage":"ideea centrala, max 15 cuvinte","spiritualCore":"adevarul teologic, max 15 cuvinte","scope":"personal sau comunitar sau doctrinar"}

Reguli: doar ce e in text, fara teologie adaugata. Raspuns DOAR JSON, fara backticks.`;

  let schema = null;
  let schemaModel = '';

  try {
    const schemaResult = await geminiService.generateDevotional(schemaPrompt, 800);
    schema = extractJson(schemaResult.text);
    schemaModel = schemaResult.model;
    console.log('✅ Schema extrasă:', JSON.stringify(schema));
  } catch (e) {
    console.log('⚠️ Schema eșuată, merg fără schemă:', e.message);
  }

  // ── PAS 2: Generează devoționalul ──
  const devotionalPrompt = schema
    ? `Scrie un devoțional creștin pastoral în limba română pe baza acestei scheme biblice.

SCHEMA VERSETULUI:
${JSON.stringify(schema, null, 2)}

VERSET ORIGINAL: "${verseText}"
REFERINȚĂ: ${verseReference}
TEMA: ${theme}

Construiește TOTUL din schema versetului.
NU folosi versetul ca inspirație liberă.
NU scrie pe tema generală.
Scrie exclusiv din structura logică extrasă din verset.
Titlul trebuie să fie coerent cu metafora centrală din reflecție.
Nu introduce o imagine diferită în titlu.
Identifică "bijuteria" unică a versetului:
care este partea surprinzătoare sau distinctivă a acestui text?
Aceasta trebuie să ocupe centrul reflecției.


PUBLIC:
cititor român obișnuit, cu lupte reale, griji reale și nevoie reală de adevăr biblic, speranță și mângâiere.

━━━━━━━━━━━━━━
REGULĂ PRINCIPALĂ:
Dacă un element major din schemă lipsește din reflecție, outputul este INVALID.

Reflecția trebuie să includă explicit TOATE acțiunile principale ale versetului.
Dacă versetul conține mai multe verbe importante
(ex: „iertați”, „mângâiați”, „mărturisiți”, „curăță”),
FIECARE trebuie explicat clar.

Nu parafraza doar versetul.
Explică sensul lui.

━━━━━━━━━━━━━━
ANCORARE TEOLOGICĂ OBLIGATORIE:
Reflection trebuie să răspundă explicit la întrebarea:
„Care este afirmația teologică principală a acestui verset?”

Dacă versetul conține:
- o promisiune,
- o poruncă,
- o avertizare,
- o declarație doctrinară,

aceasta trebuie să fie centrul reflecției.

Nu devia spre idei generale despre Dumnezeu.

━━━━━━━━━━━━━━
CONTROL DE FIDELITATE:
Nu introduce idei care NU există în verset sau nu sunt deduse logic din el.

Dacă reflecția poate fi folosită la alt verset fără modificări,
outputul este INVALID.

Devoționalul trebuie să fie imposibil de mutat pe alt verset.

━━━━━━━━━━━━━━
STRUCTURĂ:

- title:
titlu emoțional, poetic, memorabil, max 7 cuvinte

- introduction:
problemă umană reală legată direct de adevărul central al versetului,
2-3 propoziții

- reflection:
explică:
acțiunile principale, poruncile (dacă există),
adevărul spiritual central și aplicarea lui practică
4-5 propoziții
folosește O SINGURĂ metaforă centrală
și păstreaz-o până la final

- practicalApplication:
legat direct de commands sau actions
pas concret imediat SAU întrebare directă
2-3 propoziții

- prayer:
bazată pe spiritualCore
personală
cu „Doamne” sau „Dumnezeu”
3-4 propoziții

- thoughtOfTheDay:
rezumat memorabil al keyMessage
max 15 cuvinte
TREBUIE să fie diferit de titlu

━━━━━━━━━━━━━━
REGULI DE STIL:

- exclusiv română literară naturală
- ton pastoral român matur
- cald, uman, empatic
- fără limbaj robotic

interzis:
"acest verset ne amintește"
"în lumea de astăzi"
"putem alege să"
"Dumnezeu dorește"
"nu este întâmplător"
"în concluzie"

reflection NU începe cu:
"Versetul spune"
"Pavel spune"
"Textul ne arată"

folosește imagini concrete din viața reală

O singură metaforă centrală
NU o schimba

evită:
"inimă de aur"
"punte de aur"
"abis fără fund"
dacă nu sunt absolut naturale

rugăciunea NU folosește:
"Puterea Divină"
"Univers"
"energie"

maxim 500 cuvinte

━━━━━━━━━━━━━━
VALIDARE FINALĂ OBLIGATORIE:

1. elimină orice termen tehnic intern:
("actors", "actions", "scope", "keyMessage", "spiritualCore")

2. verifică gramatica română

3. elimină formulări artificiale sau mecanice

4. verifică dacă textul sună ca predicat de un pastor român matur

5. verifică:
poate fi mutat pe alt verset?
dacă DA → INVALID → regenerează

6. verifică:
toate acțiunile principale ale versetului sunt explicate?
dacă NU → INVALID → regenerează

7. verifică:
există clișee sau text generic?
dacă DA → INVALID → regenerează

Returnează DOAR JSON valid fără backticks, primul caracter { ultimul }:
{"title":"","introduction":"","reflection":"","practicalApplication":"","prayer":"","thoughtOfTheDay":""}`

    : `Scrie un devoțional creștin profund, cald și pastoral în limba română.

VERSETUL: "${verseText}"
REFERINȚĂ: ${verseReference}
TEMA: ${theme}
CONTEXT TEMĂ: ${THEME_CONTEXT[theme] || theme}

Scrie pentru un cititor român obișnuit, cu lupte reale și nevoie de mângâiere.

STRUCTURĂ:
- title: titlu emoțional, poetic, memorabil, max 7 cuvinte
- introduction: hook uman pornind dintr-o luptă reală, 2-3 propoziții
- reflection: mesaj biblic bazat pe contextul exact al versetului, O SINGURĂ metaforă centrală, 4-5 propoziții
- practicalApplication: pas concret SAU întrebare directă, 2-3 propoziții
- prayer: rugăciune personală cu "Dumnezeu" sau "Doamne", 3-4 propoziții
- thoughtOfTheDay: proverb creștin memorabil, max 15 cuvinte, DIFERIT de titlu

REGULI:
- exclusiv română literară naturală
- ton pastoral român matur
- fără clișee: "în lumea de astăzi", "Dumnezeu dorește", "nu este întâmplător"
- maxim 500 cuvinte total


Returnează DOAR JSON valid fără backticks, primul caracter { ultimul }:
{"title":"","introduction":"","reflection":"","practicalApplication":"","prayer":"","thoughtOfTheDay":""}`;

  const result = await geminiService.generateDevotional(devotionalPrompt, 3000);
  const raw = result.text;

  console.log(`🤖 Model folosit: ${result.model} (${result.provider})`);
  console.log('🤖 RAW AI output (primele 500 chars):', raw?.substring(0, 500));

  try {
    const parsed = extractJson(raw);
    console.log('✅ JSON parsed OK:', parsed?.title);
    return {
      data: parsed,
      model: result.model,
      provider: result.provider
    };
  } catch (e) {
    console.log('❌ JSON parse error:', e.message);
    throw e;
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
  let generatedBy = 'fallback';
  let aiModel = '';

  try {
    if (geminiService.isConfigured()) {
      const aiResult = await generateDevotionalWithAI({
  theme,
  verseText: verse.text,
  verseReference: verse.reference
});
devotionalData = aiResult.data;

try {
  validateDevotional(devotionalData);
  console.log('✅ Devoțional validat cu succes');
  generatedBy = 'ai';
  aiModel = aiResult.model || 'gemini';
      } catch (validErr) {
        console.log('⚠️ Validare eșuată:', validErr.message, '— folosesc fallback');
        devotionalData = buildFallbackDevotional({
          theme,
          verseText: verse.text,
          verseReference: verse.reference
        });
        generatedBy = 'fallback';
        aiModel = '';
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
    console.log('⚠️ AI devotional fallback:', err.message);
    devotionalData = buildFallbackDevotional({
      theme,
      verseText: verse.text,
      verseReference: verse.reference
    });
    generatedBy = 'fallback';
    aiModel = '';
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