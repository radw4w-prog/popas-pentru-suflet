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
// HELPERS
// ═══════════════════════════════════════
function getRomaniaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Bucharest'
  }).format(date);
}

function getThemeForDate(dateKey) {
  const sum = dateKey.split('-').join('').split('').reduce((a, b) => a + Number(b), 0);
  return THEMES[sum % THEMES.length];
}

async function getVerseForTheme(theme) {
  const regex = THEME_KEYWORDS[theme] || theme;

  let verse = null;

  try {
    const found = await Verse.aggregate([
      { $match: { text: { $regex: regex, $options: 'i' } } },
      { $sample: { size: 1 } }
    ]);
    verse = found[0];
  } catch (err) {
    console.log('⚠️ Aggregate pe versete a eșuat, încerc random fallback');
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
// FALLBACK
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

  // Verifică câmpuri obligatorii
  for (const field of required) {
    if (!data[field] || data[field].trim().length < 10) {
      throw new Error(`Câmpul "${field}" lipsește sau e prea scurt`);
    }
  }

  // Lungimi minime
  if (data.reflection.length < 80) {
    throw new Error('Reflecția e prea scurtă');
  }

  if (data.prayer.length < 40) {
    throw new Error('Rugăciunea e prea scurtă');
  }

  // Clișee AI — aruncă eroare la cele grave
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

  // Verifică că aplicația practică e concretă
  const aplicatie = data.practicalApplication.toLowerCase();
  const areConcretetete = [
    '?',           // conține o întrebare
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
  ].some(keyword => aplicatie.includes(keyword));

  if (!areConcretetete) {
    console.log('⚠️ Aplicația practică pare prea vagă');
    // Nu aruncă eroare — doar log
  }

  return true;
}

// ═══════════════════════════════════════
// GENERARE CU AI — prompt premium
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
3. mesaj biblic profund bazat EXPLICIT pe sensul și contextul ACESTUI verset specific, nu pe tema generală
4. aplicație practică foarte concretă, personală și directă — cu un pas imediat posibil azi
5. rugăciune caldă, sinceră și specifică acestui verset
6. gândul zilei memorabil ca un proverb creștin

REGULI ABSOLUTE:
- exclusiv în română literară naturală
- ton uman, cald, pastoral — ca un pastor matur vorbind față în față
- fără limbaj robotic sau de AI
- interzis: "acest verset ne amintește", "în lumea de astăzi", "putem alege să", "Dumnezeu dorește să", "nu este întâmplător", "în concluzie", "dragi prieteni"
- nu moraliza rece — vorbește cu căldură și empatie
- include o metaforă sau imagine vizuală naturală din viața de zi cu zi
- reflecția trebuie să arate EXPLICIT ce spune versetul, nu doar tema generală
- aplicația practică TREBUIE să conțină fie o întrebare directă către cititor, fie un pas concret și imediat
- rugăciunea să fie personală și specifică, nu generică
- maxim 350 cuvinte total
- trebuie să pară scris de un pastor român matur, nu de un program de calculator

Returnează DOAR JSON valid, fără niciun text înainte sau după:
{
  "title": "titlu poetic, emoțional, max 7 cuvinte",
  "introduction": "hook uman și personal, 2-3 propoziții",
  "reflection": "mesaj biblic profund bazat pe contextul exact al versetului, cu metaforă, 4-5 propoziții",
  "practicalApplication": "pas concret și imediat sau întrebare directă către cititor, 2-3 propoziții",
  "prayer": "rugăciune personală și specifică versetului, 3-4 propoziții",
  "thoughtOfTheDay": "gând memorabil ca un proverb creștin modern, max 15 cuvinte"
}`;

  const raw = await geminiService.generate(prompt, 2000);

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

  const existing = await DailyDevotional.findOne({ dateKey }).lean();
  if (existing) return existing;

  const theme = getThemeForDate(dateKey);
  const verse = await getVerseForTheme(theme);

  let devotionalData;
  let generatedBy = 'fallback';
  let aiModel = '';

  try {
    if (geminiService.isConfigured()) {
      devotionalData = await generateDevotionalWithAI({
        theme,
        verseText: verse.text,
        verseReference: verse.reference
      });

      // Validare output AI
      try {
        validateDevotional(devotionalData);
        console.log('✅ Devoțional validat cu succes');
        generatedBy = 'ai';
        aiModel = 'llama-3.3-70b-versatile';
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