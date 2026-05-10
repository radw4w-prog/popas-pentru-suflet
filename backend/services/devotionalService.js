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
      {
        $match: {
          text: { $regex: regex, $options: 'i' }
        }
      },
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
    introduction: `Versetul de astăzi ne amintește că Dumnezeu este prezent și lucrează în viața noastră chiar și atunci când nu înțelegem totul.`,
    reflection: `Cuvântul lui Dumnezeu nu este doar o promisiune frumoasă, ci o realitate vie. În fiecare încercare, în fiecare întrebare și în fiecare pas, El rămâne credincios. Versetul acesta ne cheamă să ne așezăm inima din nou în mâinile Lui.`,
    practicalApplication: `Alege astăzi să trăiești acest adevăr într-un mod concret: oprește-te câteva minute, citește din nou versetul, roagă-te și întreabă-L pe Dumnezeu cum îl poți aplica în situația ta actuală.`,
    prayer: `Doamne, îți mulțumesc pentru Cuvântul Tău. Ajută-mă să nu rămân doar la citire, ci să trăiesc ceea ce îmi vorbești astăzi. Întărește-mi inima, luminează-mi mintea și călăuzește-mi pașii. Amin.`,
    thoughtOfTheDay: `Dumnezeu vorbește și astăzi inimii tale prin Cuvântul Său.`
  };
}

async function generateDevotionalWithAI({ theme, verseText, verseReference }) {
  const themeContext = {
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

  const prompt = `Ești Andrei Moldovan, un teolog și scriitor creștin român cu 20 de ani de experiență pastorală. 
Scrii devoționale zilnice pentru credincioși simpli din România — oameni cu bucurii și griji reale, nu auditori de conferință.

VERSETUL DE AZI:
"${verseText}"
— ${verseReference}

TEMA ZILEI: ${theme}
CONTEXT TEMĂ: ${themeContext[theme] || theme}

MISIUNEA TA:
Scrie un devoțional care să facă cititorul să simtă că cineva îl înțelege cu adevărat și că Dumnezeu îi vorbește personal.

REGULI ABSOLUTE:
- Scrie exclusiv în română literară naturală
- Ton cald, pastoral, uman — ca o conversație sinceră, nu o predică formală
- Fii specific și concret — evită generalitățile goale
- Folosește imagini și metafore din viața de zi cu zi românească
- Nu repeta același cuvânt de mai mult de 2-3 ori în tot textul
- Nu folosi expresii clișeu: "acest verset ne amintește", "în lumina acestui verset", "Dumnezeu dorește să", "nu este întâmplător că"
- Nu scrie ca un AI — scrie ca un om care crede cu adevărat ce spune
- Titlul să fie poetic și intrigant, nu descriptiv și plat
- Rugăciunea să fie personală și specifică, nu generică
- Gândul zilei să fie memorabil și original — ca un proverb creștin modern
- Lungime naturală: introducere 2-3 propoziții, reflecție 4-5 propoziții, aplicație 2-3 propoziții, rugăciune 3-4 propoziții

Returnează DOAR JSON valid, fără niciun text înainte sau după:
{
  "title": "titlu poetic, intrigant, max 7 cuvinte",
  "introduction": "deschidere caldă care prinde cititorul imediat",
  "reflection": "reflecție profundă, specifică, cu imagini concrete din viață",
  "practicalApplication": "aplicație practică și realistă pentru ziua de azi",
  "prayer": "rugăciune personală, sinceră, specifică temei",
  "thoughtOfTheDay": "gând memorabil, original, max 15 cuvinte"
}`;

  const raw = await geminiService.generate(prompt, 2000);
  return extractJson(raw);
}


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

  // Verifică lungimi minime rezonabile
  if (data.reflection.length < 80) {
    throw new Error('Reflecția e prea scurtă');
  }

  if (data.prayer.length < 40) {
    throw new Error('Rugăciunea e prea scurtă');
  }

  // Detectează clișee AI frecvente
  const clisee = [
    'acest verset ne amintește',
    'în lumina acestui verset',
    'nu este întâmplător',
    'dragi prieteni',
    'în concluzie',
    'ca și concluzie'
  ];

  const textComplet = Object.values(data).join(' ').toLowerCase();
  for (const c of clisee) {
    if (textComplet.includes(c)) {
      console.log(`⚠️ Devoțional conține clișeu detectat: "${c}"`);
    }
  }

  return true;
}


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

      // Validare output
      try {
        validateDevotional(devotionalData);
        console.log('✅ Devoțional validat cu succes');
      } catch (validErr) {
        console.log('⚠️ Validare eșuată:', validErr.message, '— folosesc fallback');
        devotionalData = buildFallbackDevotional({
          theme,
          verseText: verse.text,
          verseReference: verse.reference
        });
        generatedBy = 'fallback';
      }

      if (generatedBy !== 'fallback') {
        generatedBy = 'ai';
        // Detectează modelul real folosit
        const modelsStatus = geminiService.getModelsStatus();
        const lastUsed = modelsStatus.find(m => m.status === 'available');
        aiModel = lastUsed?.model || 'ai';
      }

    } else {
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

    return created.toObject();
  } catch (err) {
    if (err.code === 11000) {
      return await DailyDevotional.findOne({ dateKey }).lean();
    }
    throw err;
  }
}

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