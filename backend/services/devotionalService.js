// backend/services/devotionalService.js
const DailyDevotional = require('../models/DailyDevotional');
const Verse = require('../models/Verse');
const geminiService = require('./geminiService');

// ═══════════════════════════════════════
// CONFIGURARE
// ═══════════════════════════════════════
const MAX_RETRIES = 2;

const THEMES = [
  'dragoste', 'credinta', 'pace', 'bucurie', 'speranta',
  'rugaciune', 'iertare', 'putere', 'recunostinta', 'intelepciune'
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
    { carte: 'Psalmii', capitol: 103, verset: 12 },
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
    { carte: 'Psalmii', capitol: 136, verset: 1 },
    { carte: 'Zaharia', capitol: 8, verset: 19 }
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
    { carte: 'Psalmii', capitol: 46, verset: 1 },
    { carte: 'Matei', capitol: 11, verset: 28 },
    { carte: '2 Tesaloniceni', capitol: 3, verset: 16 },
    { carte: 'Numeri', capitol: 6, verset: 26 },
    { carte: 'Ioan', capitol: 16, verset: 33 },
    { carte: 'Coloseni', capitol: 3, verset: 15 }
  ],
  bucurie: [
    { carte: 'Nehemia', capitol: 8, verset: 10 },
    { carte: 'Filipeni', capitol: 4, verset: 4 },
    { carte: 'Psalmii', capitol: 16, verset: 11 },
    { carte: 'Ioan', capitol: 15, verset: 11 },
    { carte: 'Romani', capitol: 15, verset: 13 },
    { carte: 'Galateni', capitol: 5, verset: 22 },
    { carte: 'Psalmii', capitol: 30, verset: 5 },
    { carte: '1 Petru', capitol: 1, verset: 8 },
    { carte: 'Isaia', capitol: 61, verset: 10 },
    { carte: 'Luca', capitol: 15, verset: 7 }
  ],
  speranta: [
    { carte: 'Romani', capitol: 15, verset: 13 },
    { carte: 'Ieremia', capitol: 29, verset: 11 },
    { carte: 'Psalmii', capitol: 31, verset: 24 },
    { carte: 'Isaia', capitol: 40, verset: 31 },
    { carte: 'Romani', capitol: 8, verset: 28 },
    { carte: 'Evrei', capitol: 6, verset: 19 },
    { carte: 'Psalmii', capitol: 42, verset: 11 },
    { carte: 'Romani', capitol: 5, verset: 3 },
    { carte: '1 Petru', capitol: 1, verset: 3 },
    { carte: 'Plângerile lui Ieremia', capitol: 3, verset: 22 }
  ],
  rugaciune: [
    { carte: 'Filipeni', capitol: 4, verset: 6 },
    { carte: 'Matei', capitol: 7, verset: 7 },
    { carte: '1 Tesaloniceni', capitol: 5, verset: 17 },
    { carte: 'Ieremia', capitol: 33, verset: 3 },
    { carte: 'Psalmii', capitol: 145, verset: 18 },
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
    { carte: 'Psalmii', capitol: 28, verset: 7 },
    { carte: 'Isaia', capitol: 41, verset: 10 },
    { carte: 'Zaharia', capitol: 4, verset: 6 },
    { carte: 'Romani', capitol: 8, verset: 37 },
    { carte: '2 Timotei', capitol: 1, verset: 7 },
    { carte: 'Psalmii', capitol: 46, verset: 1 }
  ],
  recunostinta: [
    { carte: '1 Tesaloniceni', capitol: 5, verset: 18 },
    { carte: 'Psalmii', capitol: 107, verset: 1 },
    { carte: 'Coloseni', capitol: 3, verset: 17 },
    { carte: 'Filipeni', capitol: 4, verset: 6 },
    { carte: 'Psalmii', capitol: 100, verset: 4 },
    { carte: 'Efeseni', capitol: 5, verset: 20 },
    { carte: 'Psalmii', capitol: 136, verset: 1 },
    { carte: 'Luca', capitol: 17, verset: 17 },
    { carte: 'Psalmii', capitol: 103, verset: 2 },
    { carte: 'Romani', capitol: 1, verset: 21 }
  ],
  intelepciune: [
    { carte: 'Iacov', capitol: 1, verset: 5 },
    { carte: 'Proverbe', capitol: 3, verset: 5 },
    { carte: 'Proverbe', capitol: 1, verset: 7 },
    { carte: 'Psalmii', capitol: 111, verset: 10 },
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
    .split('-').join('')
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

  if (!verse) throw new Error('Nu s-a putut găsi un verset.');

  return {
    text: verse.text,
    reference: verse.referinta || `${verse.carte} ${verse.capitol}:${verse.verset}`,
    book: verse.carte,
    chapter: verse.capitol,
    number: verse.verset
  };
}

// ═══════════════════════════════════════
// EXTRACT JSON ROBUST
// ═══════════════════════════════════════
function extractJson(raw) {
  if (!raw) throw new Error('Raw output gol');

  let text = raw.replace(/^\uFEFF/, '');

  // Elimină orice formă de backticks
  text = text.replace(/`{3,}[a-z]*\s*/gi, '').replace(/`{3,}\s*/gi, '');

  // Găsește { și }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1) {
    throw new Error('Nu am găsit { în răspuns');
  }

  if (lastBrace === -1 || lastBrace <= firstBrace) {
    // JSON trunchiat — încearcă recuperare
    console.log('🔧 JSON trunchiat — încerc recuperare...');
    text = text.slice(firstBrace);
    text = text.replace(/"([^"]*?)$/, '"$1"');
    const ob = (text.match(/{/g) || []).length;
    const cb = (text.match(/}/g) || []).length;
    text += '}'.repeat(Math.max(0, ob - cb));
    console.log('🔧 Recuperare efectuată.');
  } else {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // Curăță caractere control
  text = text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('❌ JSON.parse eșuat:', text.substring(0, 200));
    throw new Error('JSON parse eșuat: ' + e.message);
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
    introduction: `Există momente când viața ne pune în față întrebări grele și inima caută un punct de sprijin. Versetul de astăzi vine tocmai în astfel de momente.`,
    reflection: `Cuvântul lui Dumnezeu nu este doar o promisiune frumoasă, ci o realitate vie. În fiecare încercare, în fiecare întrebare și în fiecare pas, El rămâne credincios. Versetul acesta ne cheamă să ne așezăm inima din nou în mâinile Lui și să descoperim profunzimea iubirii Sale pentru noi.`,
    practicalApplication: `Oprește-te azi câteva minute, citește din nou versetul cu voce tare și întreabă-L pe Dumnezeu: "Doamne, ce vrei să fac eu astăzi cu acest adevăr?"`,
    prayer: `Doamne, îți mulțumesc pentru Cuvântul Tău care vorbește direct inimii mele. Ajută-mă să nu rămân doar la citire, ci să trăiesc ceea ce îmi spui astăzi. Întărește-mi inima și călăuzește-mi pașii. Amin.`,
    thoughtOfTheDay: `Dumnezeu vorbește și astăzi inimii tale prin Cuvântul Său.`
  };
}

// ═══════════════════════════════════════
// VALIDARE SIMPLĂ ȘI EFICIENTĂ
// ═══════════════════════════════════════
function validateDevotional(data) {
  if (!data) return false;

  const required = [
    'title', 'introduction', 'reflection',
    'practicalApplication', 'prayer', 'thoughtOfTheDay'
  ];

  for (const field of required) {
    if (!data[field] || data[field].trim().length < 10) {
      console.log(`❌ Câmp lipsă sau prea scurt: ${field}`);
      return false;
    }
  }

  if (data.reflection.length < 80) {
    console.log('❌ Reflecția prea scurtă');
    return false;
  }

  if (data.prayer.length < 40) {
    console.log('❌ Rugăciunea prea scurtă');
    return false;
  }

  // Clișee grave — respinge
  const cliseeGrave = [
    'acest verset ne amintește',
    'în lumea de astăzi',
    'nu este întâmplător că',
    'dragi prieteni',
    'dumnezeu dorește să'
  ];

  const text = Object.values(data).join(' ').toLowerCase();
  for (const c of cliseeGrave) {
    if (text.includes(c)) {
      console.log(`❌ Clișeu detectat: "${c}"`);
      return false;
    }
  }

  // Artefacte AI
  const aiArtifacts = ['spiritualcore', 'keymessage', 'coreexpressions'];
  for (const a of aiArtifacts) {
    if (text.includes(a)) {
      console.log(`❌ Artefact AI detectat: "${a}"`);
      return false;
    }
  }

  return true;
}

// ═══════════════════════════════════════
// GENERARE SCHEMĂ (opțional — 1 apel mic)
// ═══════════════════════════════════════
async function generateSchema(verse) {
  const prompt = `Analizează versetul biblic și returnează DOAR JSON.

VERSET: "${verse.text}"
REFERINȚĂ: ${verse.reference}

{"actors":["max 3"],"actions":["max 3 verbe"],"commands":[],"keyMessage":"max 15 cuvinte","spiritualCore":"max 15 cuvinte","scope":"personal sau comunitar"}

Reguli: doar ce e explicit în text. DOAR JSON fără backticks.`;

  const raw = await geminiService.generateDevotional(prompt, 600);
  return extractJson(raw.text);
}

// ═══════════════════════════════════════
// GENERARE DEVOȚIONAL (1 apel principal)
// ═══════════════════════════════════════
async function generateDevotionalText({ theme, verseText, verseReference, schema }) {
  const schemaContext = schema
    ? `\nSCHEMA VERSET:\nkeyMessage: ${schema.keyMessage}\nspiritualCore: ${schema.spiritualCore}\nactions: ${(schema.actions || []).join(', ')}\n`
    : '';

  const prompt = `Scrie un devoțional creștin profund, cald și pastoral în limba română.

VERSETUL: "${verseText}"
REFERINȚĂ: ${verseReference}
TEMA: ${theme}
CONTEXT: ${THEME_CONTEXT[theme] || theme}
${schemaContext}
PUBLIC: cititor român cu lupte reale, nevoie de mângâiere și adevăr biblic.

STRUCTURĂ:
- title: titlu poetic, emoțional, memorabil, max 7 cuvinte
- introduction: hook uman pornind dintr-o luptă reală (vinovăție, frică, durere, singurătate), 2-3 propoziții
- reflection: mesaj profund bazat pe contextul exact al versetului, O SINGURĂ metaforă centrală păstrată de la început până la final, 4-5 propoziții
- practicalApplication: pas concret realizabil azi SAU întrebare directă cu ?, 2-3 propoziții
- prayer: rugăciune personală cu "Doamne" sau "Dumnezeu", specifică versetului, 3-4 propoziții
- thoughtOfTheDay: proverb creștin memorabil, max 15 cuvinte, DIFERIT de titlu

REGULI ABSOLUTE:
- exclusiv română literară naturală
- ton pastoral român matur, cald, empatic
- fără clișee: "acest verset ne amintește", "în lumea de astăzi", "Dumnezeu dorește să", "nu este întâmplător", "dragi prieteni"
- reflection nu începe cu "Versetul spune", "Pavel spune", "Textul ne arată"
- rugăciunea NU folosește "Puterea Divină", "Univers", "energie"
- maxim 450 cuvinte total

Returnează DOAR JSON valid, primul caracter { ultimul }, fără backticks:
{"title":"","introduction":"","reflection":"","practicalApplication":"","prayer":"","thoughtOfTheDay":""}`;

  const result = await geminiService.generateDevotional(prompt, 3000);
  const raw = result.text;

  console.log('🤖 Model:', result.model, '| RAW (300 chars):', raw?.substring(0, 300));

  const parsed = extractJson(raw);
  return { data: parsed, model: result.model, provider: result.provider };
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

  if (geminiService.isConfigured()) {
    let retries = 0;

    while (retries < MAX_RETRIES && !devotionalData) {
      console.log(`\n🔄 Încercare AI (${retries + 1}/${MAX_RETRIES}) — ${dateKey} — tema: ${theme}`);

      try {
        // Pas 1: Schemă opțională (1 apel mic)
        let schema = null;
        try {
          schema = await generateSchema(verse);
          console.log('✅ Schemă OK:', schema?.keyMessage);
        } catch (schemaErr) {
          console.log('⚠️ Schemă eșuată, continui fără:', schemaErr.message);
        }

        // Pas 2: Generează devoționalul (1 apel principal)
        const result = await generateDevotionalText({
          theme,
          verseText: verse.text,
          verseReference: verse.reference,
          schema
        });

        // Pas 3: Validare simplă
        if (validateDevotional(result.data)) {
          devotionalData = result.data;
          generatedBy = 'ai';
          aiModel = result.model || 'gemini-2.5-flash';
          console.log(`✅ Devoțional acceptat — model: ${aiModel}`);
        } else {
          console.log('❌ Validare eșuată — reîncerc...');
        }

      } catch (err) {
        console.log('⚠️ Eroare ciclu AI:', err.message);
      }

      retries++;
    }
  }

  // Fallback dacă AI a eșuat
  if (!devotionalData) {
    console.log('⚠️ Fallback local activat.');
    devotionalData = buildFallbackDevotional({
      theme,
      verseText: verse.text,
      verseReference: verse.reference
    });
    generatedBy = 'fallback';
    aiModel = '';
  }

  // Salvare în DB
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

    console.log(`📖 Salvat: "${created.title}" | ${generatedBy} | ${aiModel}`);
    return created.toObject();

  } catch (err) {
    if (err.code === 11000) {
      console.log('⚠️ Duplicat — preiau existentul.');
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