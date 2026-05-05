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
  const prompt = `Ești un autor creștin evanghelic din România și scrii un devoțional zilnic cald, profund și practic.

VERSSET:
"${verseText}"
REFERINȚĂ:
${verseReference}
TEMA:
${theme}

Generează DOAR JSON valid, fără text înainte sau după, în această structură exactă:
{
  "title": "titlu scurt, profund, max 8 cuvinte",
  "introduction": "2-3 propoziții introductive",
  "reflection": "un paragraf clar și profund, 4-6 propoziții",
  "practicalApplication": "2-4 propoziții aplicate vieții de zi cu zi",
  "prayer": "o rugăciune scurtă, sinceră, 3-5 propoziții",
  "thoughtOfTheDay": "o idee scurtă, memorabilă, max 20 cuvinte"
}

REGULI:
- exclusiv în română
- ton cald, biblic, practic
- fără limbaj artificial
- fără markdown
- fără liste
- fără \`\`\`
- răspuns DOAR JSON`;

  const raw = await geminiService.generate(prompt, 1800);
  return extractJson(raw);
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
      generatedBy = 'ai';
      aiModel = 'gemma/gemini';
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