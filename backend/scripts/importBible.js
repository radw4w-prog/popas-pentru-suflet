require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const VersetSchema = new mongoose.Schema({
  carte: String,
  abreviere: String,
  testament: { type: String, enum: ['VT', 'NT'] },
  capitol: Number,
  verset: Number,
  text: String,
  referinta: String,
  tema: [String],
  favorit: { type: Boolean, default: false }
});

VersetSchema.index({ carte: 1, capitol: 1, verset: 1 });
VersetSchema.index({ text: 'text' });

const Verset = mongoose.model('Verset', VersetSchema);

async function importBible() {
  try {
    console.log('🔌 Conectare MongoDB...');
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/popas-pentru-suflet'
    );
    console.log('✅ Conectat!');

    // Citeste versete
    const versetsPath = path.join(__dirname, '../data/versete_complete.json');
    const versete = JSON.parse(fs.readFileSync(versetsPath, 'utf8'));

    console.log(`🗑️  Stergere date vechi...`);
    await Verset.deleteMany({});

    console.log(`📥 Import ${versete.length} versete...`);
    
    const batchSize = 50;
    for (let i = 0; i < versete.length; i += batchSize) {
      const batch = versete.slice(i, i + batchSize);
      await Verset.insertMany(batch);
      console.log(`   ✅ ${Math.min(i + batchSize, versete.length)}/${versete.length}`);
    }

    const total = await Verset.countDocuments();
    const vt = await Verset.countDocuments({ testament: 'VT' });
    const nt = await Verset.countDocuments({ testament: 'NT' });

    console.log('\n🎉 Import complet!');
    console.log(`📊 Total: ${total} versete`);
    console.log(`📖 Testament Vechi: ${vt}`);
    console.log(`📖 Testament Nou: ${nt}`);

  } catch (error) {
    console.error('❌ Eroare:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

importBible();