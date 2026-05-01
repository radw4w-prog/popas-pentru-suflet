require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;

const verseSchema = new mongoose.Schema({
  carte: String,
  abreviere: String,
  capitol: Number,
  verset: Number,
  text: String,
  testament: String,
  referinta: String,
  ordine: Number
}, { collection: 'versets' });

const Verse = mongoose.model('Verse', verseSchema);

// Mapare nume românesc → abreviere + testament + ordine
const CARTI_META = {
  'Geneza':                  { ab: 'Gen',   testament: 'VT', ordine: 1  },
  'Exodul':                  { ab: 'Ex',    testament: 'VT', ordine: 2  },
  'Leviticul':               { ab: 'Lev',   testament: 'VT', ordine: 3  },
  'Numeri':                  { ab: 'Num',   testament: 'VT', ordine: 4  },
  'Deuteronomul':            { ab: 'Deut',  testament: 'VT', ordine: 5  },
  'Iosua':                   { ab: 'Ios',   testament: 'VT', ordine: 6  },
  'Judecători':              { ab: 'Jud',   testament: 'VT', ordine: 7  },
  'Judecătorii':             { ab: 'Jud',   testament: 'VT', ordine: 7  },
  'Rut':                     { ab: 'Rut',   testament: 'VT', ordine: 8  },
  '1 Samuel':                { ab: '1Sam',  testament: 'VT', ordine: 9  },
  '2 Samuel':                { ab: '2Sam',  testament: 'VT', ordine: 10 },
  '1 Împărați':              { ab: '1Imp',  testament: 'VT', ordine: 11 },
  '2 Împărați':              { ab: '2Imp',  testament: 'VT', ordine: 12 },
  '1 Cronici':               { ab: '1Cron', testament: 'VT', ordine: 13 },
  '2 Cronici':               { ab: '2Cron', testament: 'VT', ordine: 14 },
  'Ezra':                    { ab: 'Ezra',  testament: 'VT', ordine: 15 },
  'Neemia':                  { ab: 'Neem',  testament: 'VT', ordine: 16 },
  'Estera':                  { ab: 'Est',   testament: 'VT', ordine: 17 },
  'Iov':                     { ab: 'Iov',   testament: 'VT', ordine: 18 },
  'Psalmi':                  { ab: 'Ps',    testament: 'VT', ordine: 19 },
  'Psalmii':                 { ab: 'Ps',    testament: 'VT', ordine: 19 },
  'Proverbe':                { ab: 'Prov',  testament: 'VT', ordine: 20 },
  'Proverbele':              { ab: 'Prov',  testament: 'VT', ordine: 20 },
  'Eclesiastul':             { ab: 'Ecl',   testament: 'VT', ordine: 21 },
  'Cântarea Cântărilor':     { ab: 'Cant',  testament: 'VT', ordine: 22 },
  'Isaia':                   { ab: 'Isa',   testament: 'VT', ordine: 23 },
  'Ieremia':                 { ab: 'Ier',   testament: 'VT', ordine: 24 },
  'Plângerile lui Ieremia':  { ab: 'Plang', testament: 'VT', ordine: 25 },
  'Plângerile':              { ab: 'Plang', testament: 'VT', ordine: 25 },
  'Ezechiel':                { ab: 'Ezec',  testament: 'VT', ordine: 26 },
  'Daniel':                  { ab: 'Dan',   testament: 'VT', ordine: 27 },
  'Osea':                    { ab: 'Osea',  testament: 'VT', ordine: 28 },
  'Ioel':                    { ab: 'Ioel',  testament: 'VT', ordine: 29 },
  'Amos':                    { ab: 'Amos',  testament: 'VT', ordine: 30 },
  'Obadia':                  { ab: 'Obad',  testament: 'VT', ordine: 31 },
  'Iona':                    { ab: 'Iona',  testament: 'VT', ordine: 32 },
  'Mica':                    { ab: 'Mica',  testament: 'VT', ordine: 33 },
  'Naum':                    { ab: 'Naum',  testament: 'VT', ordine: 34 },
  'Habacuc':                 { ab: 'Hab',   testament: 'VT', ordine: 35 },
  'Țefania':                 { ab: 'Tef',   testament: 'VT', ordine: 36 },
  'Ţefania':                 { ab: 'Tef',   testament: 'VT', ordine: 36 },
  'Hagai':                   { ab: 'Hag',   testament: 'VT', ordine: 37 },
  'Zaharia':                 { ab: 'Zah',   testament: 'VT', ordine: 38 },
  'Maleahi':                 { ab: 'Mal',   testament: 'VT', ordine: 39 },
  'Matei':                   { ab: 'Mat',   testament: 'NT', ordine: 40 },
  'Marcu':                   { ab: 'Mar',   testament: 'NT', ordine: 41 },
  'Luca':                    { ab: 'Luc',   testament: 'NT', ordine: 42 },
  'Ioan':                    { ab: 'Ioan',  testament: 'NT', ordine: 43 },
  'Faptele Apostolilor':     { ab: 'Fapt',  testament: 'NT', ordine: 44 },
  'Romani':                  { ab: 'Rom',   testament: 'NT', ordine: 45 },
  '1 Corinteni':             { ab: '1Cor',  testament: 'NT', ordine: 46 },
  '2 Corinteni':             { ab: '2Cor',  testament: 'NT', ordine: 47 },
  'Galateni':                { ab: 'Gal',   testament: 'NT', ordine: 48 },
  'Efeseni':                 { ab: 'Efes',  testament: 'NT', ordine: 49 },
  'Filipeni':                { ab: 'Filip', testament: 'NT', ordine: 50 },
  'Coloseni':                { ab: 'Col',   testament: 'NT', ordine: 51 },
  '1 Tesaloniceni':          { ab: '1Tes',  testament: 'NT', ordine: 52 },
  '2 Tesaloniceni':          { ab: '2Tes',  testament: 'NT', ordine: 53 },
  '1 Timotei':               { ab: '1Tim',  testament: 'NT', ordine: 54 },
  '2 Timotei':               { ab: '2Tim',  testament: 'NT', ordine: 55 },
  'Tit':                     { ab: 'Tit',   testament: 'NT', ordine: 56 },
  'Titus':                   { ab: 'Tit',   testament: 'NT', ordine: 56 },
  'Filimon':                 { ab: 'Flm',   testament: 'NT', ordine: 57 },
  'Evrei':                   { ab: 'Evr',   testament: 'NT', ordine: 58 },
  'Iacov':                   { ab: 'Iac',   testament: 'NT', ordine: 59 },
  '1 Petru':                 { ab: '1Pet',  testament: 'NT', ordine: 60 },
  '2 Petru':                 { ab: '2Pet',  testament: 'NT', ordine: 61 },
  '1 Ioan':                  { ab: '1Ioan', testament: 'NT', ordine: 62 },
  '2 Ioan':                  { ab: '2Ioan', testament: 'NT', ordine: 63 },
  '3 Ioan':                  { ab: '3Ioan', testament: 'NT', ordine: 64 },
  'Iuda':                    { ab: 'Iuda',  testament: 'NT', ordine: 65 },
  'Apocalipsa':              { ab: 'Apoc',  testament: 'NT', ordine: 66 },
};

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Găsește meta pentru un nume de carte (cu fallback fuzzy)
function getMeta(numeCarte) {
  // Căutare exactă
  if (CARTI_META[numeCarte]) return CARTI_META[numeCarte];

  // Căutare case-insensitive
  const numeLC = numeCarte.toLowerCase();
  for (const [key, val] of Object.entries(CARTI_META)) {
    if (key.toLowerCase() === numeLC) return val;
  }

  // Căutare parțială
  for (const [key, val] of Object.entries(CARTI_META)) {
    if (numeLC.includes(key.toLowerCase()) || key.toLowerCase().includes(numeLC)) {
      return val;
    }
  }

  return null;
}

async function importBible() {
  console.log('='.repeat(60));
  console.log('📖 IMPORT BIBLIA CORNILESCU (getbible.net v2)');
  console.log('='.repeat(60));

  try {
    console.log('\n🔌 Conectare MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectat!');

    const filePath = path.join(__dirname, '..', 'data', 'cornilescu.json');
    if (!fs.existsSync(filePath)) {
      console.error('❌ cornilescu.json nu există în backend/data/');
      process.exit(1);
    }

    console.log('\n📂 Citire cornilescu.json...');
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    console.log('✅ Fișier citit!');

    // ═══ DETECTARE STRUCTURĂ ═══
    console.log('\n🔍 Detectez structura JSON...');

    // Structura nouă: { translation, books: [ { nr, name, chapters: [ { chapter, verses: [ { verse, text } ] } ] } ] }
    const books = data.books;

    if (!books || !Array.isArray(books)) {
      console.error('❌ Nu găsesc array-ul "books" în JSON!');
      console.log('   Keys disponibile:', Object.keys(data));
      process.exit(1);
    }

    console.log(`   ✅ Structură detectată: { books: [...] }`);
    console.log(`   Cărți în JSON: ${books.length}`);
    console.log(`   Prima carte: "${books[0]?.name}"`);
    console.log(`   Sample verset: "${books[0]?.chapters?.[0]?.verses?.[0]?.text?.substring(0, 60)}..."`);

    // ═══ CONVERSIE ═══
    console.log('\n🔄 Conversie versete...');
    const allVerses = [];
    const negasite = [];

    for (const book of books) {
      const numeCarte = book.name || '';
      const meta = getMeta(numeCarte);

      if (!meta) {
        negasite.push(numeCarte);
        console.log(`   ⚠️  Carte negăsită în mapare: "${numeCarte}"`);
        continue;
      }

      let verseteCarteCount = 0;
      const chapters = book.chapters || [];

      for (const chapterData of chapters) {
        const capitol = chapterData.chapter || 0;
        const verses = chapterData.verses || [];

        for (const verseData of verses) {
          const verset = verseData.verse || 0;
          const text = cleanText(verseData.text || '');

          if (!text || !capitol || !verset) continue;

          allVerses.push({
            carte: meta.ab === 'Ps' ? 'Psalmii' : numeCarte,
            abreviere: meta.ab,
            capitol,
            verset,
            text,
            testament: meta.testament,
            referinta: `${meta.ab} ${capitol}:${verset}`,
            ordine: meta.ordine
          });
          verseteCarteCount++;
        }
      }

      console.log(`   ✅ ${numeCarte}: ${verseteCarteCount} versete`);
    }

    console.log(`\n📊 Total versete convertite: ${allVerses.length}`);

    if (allVerses.length === 0) {
      console.error('❌ Nu s-au extras versete!');
      process.exit(1);
    }

    if (negasite.length > 0) {
      console.log(`\n⚠️  Cărți negăsite în mapare (${negasite.length}):`);
      negasite.forEach(n => console.log(`   - "${n}"`));
    }

    // ═══ IMPORT ═══
    const oldCount = await Verse.countDocuments();
    console.log(`\n🗑️  Șterg ${oldCount} versete vechi...`);
    await Verse.deleteMany({});
    console.log('✅ Șterse!');

    const batchSize = 500;
    let imported = 0;

    console.log('\n📥 Import versete...');
    for (let i = 0; i < allVerses.length; i += batchSize) {
      const batch = allVerses.slice(i, i + batchSize);
      await Verse.insertMany(batch, { ordered: false });
      imported += batch.length;
      const pct = Math.round((imported / allVerses.length) * 100);
      process.stdout.write(`\r   Progress: ${imported}/${allVerses.length} (${pct}%)`);
    }
    console.log('\n');

    // ═══ VERIFICARE ═══
    const newCount = await Verse.countDocuments();
    const vtCount = await Verse.countDocuments({ testament: 'VT' });
    const ntCount = await Verse.countDocuments({ testament: 'NT' });
    const carti = await Verse.distinct('carte');

    console.log('='.repeat(60));
    console.log('✅ IMPORT COMPLET!');
    console.log('='.repeat(60));
    console.log(`   Versiune:          Cornilescu (VDCC)`);
    console.log(`   Total versete:     ${newCount}`);
    console.log(`   Vechiul Testament: ${vtCount}`);
    console.log(`   Noul Testament:    ${ntCount}`);
    console.log(`   Cărți importate:   ${carti.length}/66`);

    // Sample
    console.log('\n📋 Verificare versete cheie:');
    const teste = [
      { carte: 'Geneza', capitol: 1, verset: 1 },
      { abreviere: 'Ps', capitol: 23, verset: 1 },
      { carte: 'Ioan', capitol: 3, verset: 16 },
      { carte: 'Romani', capitol: 8, verset: 28 },
      { carte: 'Apocalipsa', capitol: 22, verset: 21 },
    ];

    for (const t of teste) {
      const v = await Verse.findOne(t);
      if (v) {
        console.log(`   ✅ ${v.referinta}: "${v.text.substring(0, 70)}"`);
      } else {
        console.log(`   ❌ ${JSON.stringify(t)} - NU GĂSIT`);
      }
    }

    // Listă cărți importate
    console.log('\n📚 Cărți importate:');
    const cartiSortate = await Verse.aggregate([
      { $group: { _id: '$carte', count: { $sum: 1 }, ordine: { $first: '$ordine' } } },
      { $sort: { ordine: 1 } }
    ]);
    cartiSortate.forEach(c => console.log(`   ${c.ordine}. ${c._id}: ${c.count} versete`));

  } catch (error) {
    console.error('\n❌ Eroare:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Deconectat MongoDB');
    process.exit(0);
  }
}

importBible();