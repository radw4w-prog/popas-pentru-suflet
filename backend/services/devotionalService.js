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
  dragoste: 'dragoste|iubire|iubește',
  credinta: 'credin|încredere',
  pace: 'pace',
  bucurie: 'bucur',
  speranta: 'speran|nădejde|nadejde',
  rugaciune: 'rugă|ruga|roagă',
  iertare: 'ierta|iertare',
  putere: 'putere|tărie',
  recunostinta: 'mulțum|multum|recunoștin',
  intelepciune: 'înțelep|intelep|înțelepciune'
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
    { carte: 'Țefania', capitol: 3, verset: 17 }        // Corectat din "Zaharia"
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

  if (recomandate?.length > 0) {
    const rec = recomandate[Math.floor(Math.random() * recomandate.length)];

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
  }

  // Fallback - căutare după cuvinte cheie
  const regex = THEME_KEYWORDS[theme] || theme;
  
  let verse = await Verse.aggregate([
    { $match: { text: { $regex: regex, $options: 'i' } } },
    { $sample: { size: 1 } }
  ]);

  if (!verse || verse.length === 0) {
    const count = await Verse.countDocuments();
    const random = Math.floor(Math.random() * count);
    verse = [await Verse.findOne().skip(random).lean()];
  }

  const v = verse[0];

  return {
    text: v.text,
    reference: v.referinta || `${v.carte} ${v.capitol}:${v.verset}`,
    book: v.carte,
    chapter: v.capitol,
    number: v.verset
  };
}

function extractJson(raw) {
  if (!raw) throw new Error('Răspuns gol de la AI');

  let text = raw.trim();

  // Elimină blocuri markdown
  const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (blockMatch) text = blockMatch[1].trim();

  // Extrage doar obiectul JSON
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Nu s-a găsit un JSON valid în răspuns');
  }

  text = text.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('JSON parse error:', e.message);
    console.error('Text încercat:', text.substring(0, 300));
    throw new Error('JSON invalid returnat de AI');
  }
}

// ═══════════════════════════════════════
// FALLBACK LOCAL (îmbunătățit)
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
    introduction: `Astăzi, Cuvântul lui Dumnezeu ne vorbește prin versetul: "${verseText}" (${verseReference}).`,
    reflection: `Acest verset ne descoperă o realitate profundă despre ${theme}. El nu este doar o frază frumoasă, ci o ancoră pentru sufletul nostru în mijlocul realităților grele ale vieții. Dumnezeu ne întâlnește exact acolo unde suntem, cu slăbiciunile, întrebările și nevoile noastre.`,
    practicalApplication: `Astăzi, oprește-te deliberat cel puțin 5 minute, recitește versetul de mai sus și întreabă-L pe Dumnezeu: „Doamne, cum vrei să trăiesc acest adevăr astăzi?”`,
    prayer: `Doamne, îți mulțumesc pentru Cuvântul Tău care mă întâlnește exact în punctul în care sunt. Ajută-mă să nu trec superficial peste el, ci să-l las să-mi schimbe inima și viața. Vorbește-mi, Te rog, prin versetul acesta. Amin.`,
    thoughtOfTheDay: `Cuvântul lui Dumnezeu nu ne lasă niciodată așa cum ne găsește.`
  };
}

// ═══════════════════════════════════════
// VALIDARE OUTPUT AI
// ═══════════════════════════════════════
function validateDevotional(data) {
  const required = ['title', 'introduction', 'reflection', 'practicalApplication', 'prayer', 'thoughtOfTheDay'];

  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim().length < 10) {
      throw new Error(`Câmpul "${field}" lipsește sau este prea scurt`);
    }
  }

  if (data.reflection.length < 80) throw new Error('Reflecția este prea scurtă');
  if (data.prayer.length < 40) throw new Error('Rugăciunea este prea scurtă');

  const cliseeGrave = [
    'acest verset ne amintește',
    'în lumea de astăzi',
    'nu este întâmplător',
    'dragi prieteni',
    'în concluzie',
    'dumnezeu dorește să',
    'putem alege să',
    'să ne amintim că'
  ];

  const textComplet = Object.values(data).join(' ').toLowerCase();

  for (const cliseu of cliseeGrave) {
    if (textComplet.includes(cliseu)) {
      throw new Error(`Conține clișeu interzis: "${cliseu}"`);
    }
  }

  return true;
}

// ═══════════════════════════════════════
// GENERARE CU AI
// ═══════════════════════════════════════
async function generateDevotionalWithAI({ theme, verseText, verseReference }) {
  const prompt = `Scrie un devoțional creștin profund, cald și pastoral în limba română.

VERSETUL:
"${verseText}"
REFERINȚĂ: ${verseReference}
TEMA: ${theme}
CONTEXT TEMĂ: ${THEME_CONTEXT[theme] || theme}

Scrie pentru un cititor român obișnuit, cu lupte reale, griji reale și nevoie reală de mângâiere și adevăr biblic.

STRUCTURĂ:
1. titlu emoțional și memorabil
2. introducere cu hook uman și personal
3. mesaj biblic profund bazat EXPLICIT pe sensul și contextul ACESTUI verset specific
4. aplicație practică foarte concretă, personală și directă — cu un pas imediat posibil azi
5. rugăciune caldă, sinceră și specifică acestui verset
6. gândul zilei memorabil ca un proverb creștin

REGULI ABSOLUTE:
- exclusiv în română literară naturală
- ton uman, cald, pastoral — ca un pastor matur vorbind față în față
- interzis: "acest verset ne amintește", "în lumea de astăzi", "putem alege să", "Dumnezeu dorește să", "nu este întâmplător", "în concluzie", "dragi prieteni"
- include o metaforă sau imagine vizuală naturală
- aplicația practică TREBUIE să conțină fie o întrebare directă, fie un pas concret și imediat
- maxim 350 cuvinte total

Returnează DOAR JSON valid, fără niciun text înainte sau după.`;

  const raw = await geminiService.generate(prompt, 2000);

  console.log('🤖 AI raw output (primele 400 chars):', raw?.substring(0, 400));

  const parsed = extractJson(raw);
  console.log('✅ JSON parsat cu succes:', parsed?.title);

  return parsed;
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
  let aiModel = null;

  try {
    if (geminiService.isConfigured()) {
      devotionalData = await generateDevotionalWithAI({
        theme,
        verseText: verse.text,
        verseReference: verse.reference
      });

      validateDevotional(devotionalData);
      
      generatedBy = 'ai';
      aiModel = 'gemini-1.5-flash';        // Actualizat
      console.log(`✅ Devoțional generat cu succes prin AI (${theme})`);
    } else {
      throw new Error('Serviciul Gemini nu este configurat');
    }
  } catch (err) {
    console.log('⚠️ Folosesc fallback local:', err.message);
    devotionalData = buildFallbackDevotional({
      theme,
      verseText: verse.text,
      verseReference: verse.reference
    });
    generatedBy = 'fallback';
    aiModel = null;
  }

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

  console.log(`📖 Devoțional creat: ${created.title} | ${generatedBy}`);
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