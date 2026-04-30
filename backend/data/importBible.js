require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ═══ MODEL VERSET ═══
const VersetSchema = new mongoose.Schema({
  carte: String,
  abreviere: String,
  testament: { type: String, enum: ['VT', 'NT'] },
  capitol: Number,
  verset: Number,
  text: String,
  referinta: String,
  tema: [String],
  cuvinteCheie: [String]
});

VersetSchema.index({ carte: 1, capitol: 1, verset: 1 });
VersetSchema.index({ text: 'text' }); // Full-text search
VersetSchema.index({ tema: 1 });

const Verset = mongoose.model('Verset', VersetSchema);

// ═══ IMPORT ═══
async function importBible() {
  try {
    console.log('🔌 Conectare MongoDB...');
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/popas-pentru-suflet'
    );
    console.log('✅ Conectat!');

    // Citeste fisierul
    const biblePath = path.join(__dirname, '../data/biblia_bvdcs.json');
    const bibliaData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));

    console.log('🗑️  Ștergere date vechi...');
    await Verset.deleteMany({});

    let totalVersete = 0;
    const verseteDeImportat = [];

    // Procesează fiecare carte
    for (const carte of bibliaData.carti) {
      for (const [capitalStr, versete] of Object.entries(carte.capitole)) {
        const capitol = parseInt(capitalStr);

        for (const [versetStr, text] of Object.entries(versete)) {
          const versetNr = parseInt(versetStr);
          const referinta = `${carte.abreviere} ${capitol}:${versetNr}`;

          verseteDeImportat.push({
            carte: carte.nume,
            abreviere: carte.abreviere,
            testament: carte.testament,
            capitol,
            verset: versetNr,
            text,
            referinta,
            tema: [],
            cuvinteCheie: []
          });

          totalVersete++;
        }
      }
    }

    // Import în batch-uri
    console.log(`📥 Import ${totalVersete} versete...`);
    const batchSize = 100;
    for (let i = 0; i < verseteDeImportat.length; i += batchSize) {
      const batch = verseteDeImportat.slice(i, i + batchSize);
      await Verset.insertMany(batch);
      process.stdout.write(`\r   Progress: ${Math.min(i + batchSize, verseteDeImportat.length)}/${totalVersete}`);
    }

    console.log('\n');
    console.log('✅ Import complet!');
    console.log(`📊 Total versete importate: ${totalVersete}`);

    // Statistici
    const vtCount = await Verset.countDocuments({ testament: 'VT' });
    const ntCount = await Verset.countDocuments({ testament: 'NT' });
    console.log(`📖 Testament Vechi: ${vtCount} versete`);
    console.log(`📖 Testament Nou: ${ntCount} versete`);

  } catch (error) {
    console.error('❌ Eroare:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Deconectat MongoDB');
    process.exit(0);
  }
}

importBible();