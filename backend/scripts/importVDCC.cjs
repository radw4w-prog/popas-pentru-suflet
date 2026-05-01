require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/popas-pentru-suflet';

// Schema simplă pentru import
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

const Verse = mongoose.model('VerseImport', verseSchema);

async function importBible() {
  console.log('=' .repeat(60));
  console.log('📖 IMPORT BIBLIA VDCC ÎN MONGODB');
  console.log('=' .repeat(60));

  try {
    // Conectare
    console.log('\n🔌 Conectare la MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectat!');

    // Citește fișierul
    const filePath = path.join(__dirname, '..', 'data', 'biblia_vdcc.json');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ Fișierul biblia_vdcc.json nu există!');
      console.error('   Rulează mai întâi: python scripts/downloadVDCC.py');
      process.exit(1);
    }

    console.log('\n📂 Citire fișier biblia_vdcc.json...');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const versete = data.versete || data;

    if (!Array.isArray(versete) || versete.length === 0) {
      console.error('❌ Fișierul nu conține versete valide!');
      process.exit(1);
    }

    console.log(`   Found: ${versete.length} versete`);

    // Backup - contorizare veche
    const oldCount = await Verse.countDocuments();
    console.log(`\n📊 Versete vechi în DB: ${oldCount}`);

    // Ștergere versete vechi
    if (oldCount > 0) {
      console.log('🗑️  Șterg versetele vechi (VDC)...');
      await Verse.deleteMany({});
      console.log('   ✅ Șterse!');
    }

    // Import în batch-uri de 500
    const batchSize = 500;
    let imported = 0;

    console.log('\n📥 Import versete VDCC...');

    for (let i = 0; i < versete.length; i += batchSize) {
      const batch = versete.slice(i, i + batchSize);
      await Verse.insertMany(batch, { ordered: false });
      imported += batch.length;

      const pct = Math.round((imported / versete.length) * 100);
      process.stdout.write(`\r   Progress: ${imported}/${versete.length} (${pct}%)`);
    }

    console.log('\n');

    // Verificare
    const newCount = await Verse.countDocuments();
    const vtCount = await Verse.countDocuments({ testament: 'VT' });
    const ntCount = await Verse.countDocuments({ testament: 'NT' });
    const carti = await Verse.distinct('carte');

    console.log('=' .repeat(60));
    console.log('✅ IMPORT COMPLET!');
    console.log('=' .repeat(60));
    console.log(`   Versiune: VDCC (Cornilescu Corectată)`);
    console.log(`   Total versete: ${newCount}`);
    console.log(`   Vechiul Testament: ${vtCount}`);
    console.log(`   Noul Testament: ${ntCount}`);
    console.log(`   Cărți: ${carti.length}`);
    console.log('');

    // Verificare câteva versete
    console.log('📋 Verificare sample:');
    const samples = [
      { carte: 'Geneza', capitol: 1, verset: 1 },
      { carte: 'Psalmii', capitol: 23, verset: 1 },
      { carte: 'Ioan', capitol: 3, verset: 16 },
      { carte: 'Romani', capitol: 8, verset: 28 },
      { carte: 'Apocalipsa', capitol: 22, verset: 21 }
    ];

    for (const s of samples) {
      const v = await Verse.findOne(s);
      if (v) {
        console.log(`   ✅ ${v.referinta}: "${v.text.substring(0, 60)}..."`);
      } else {
        console.log(`   ❌ ${s.carte} ${s.capitol}:${s.verset} - NU GĂSIT!`);
      }
    }

  } catch (error) {
    console.error('\n❌ Eroare:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Deconectat MongoDB');
    process.exit(0);
  }
}

importBible();