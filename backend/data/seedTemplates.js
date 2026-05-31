// backend/data/seedTemplates.js
// Rulează o singură dată: node data/seedTemplates.js
// Importă toate template-urile din templates.json în MongoDB

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Template = require('../models/Template');

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI nu este setat în .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Conectat la MongoDB');

    // Citește templates.json
    const tplPath = path.join(__dirname, 'templates.json');
    const raw = fs.readFileSync(tplPath, 'utf-8');
    const data = JSON.parse(raw);
    const templates = data.templates || data;

    console.log(`📦 Găsite ${templates.length} template-uri în templates.json`);

    // Verifică câte există deja
    const existente = await Template.countDocuments();
    if (existente > 0) {
      console.log(`⚠️  Deja ${existente} template-uri în DB.`);
      const raspuns = process.argv.includes('--force');
      if (!raspuns) {
        console.log('   Folosește --force pentru a le înlocui.');
        console.log('   Ieșire fără modificări.');
        process.exit(0);
      }
      console.log('🗑️  --force detectat. Șterg toate template-urile existente...');
      await Template.deleteMany({});
    }

    // Pregătește documentele
    const docs = templates.map((t, index) => ({
      templateId: t.id,
      name: t.name,
      url: t.url,
      thumbnail: t.thumbnail,
      categorie: t.categorie || 'spiritual',
      activ: true,
      ordine: index,
      sursa: 'builtin'
    }));

    // Insert batch
    const result = await Template.insertMany(docs, { ordered: false });
    console.log(`✅ ${result.length} template-uri importate cu succes!`);

    // Statistici pe categorii
    const stats = await Template.aggregate([
      { $match: { activ: true } },
      { $group: { _id: '$categorie', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\n📊 Template-uri pe categorii:');
    stats.forEach(s => console.log(`   ${s._id}: ${s.count}`));

  } catch (error) {
    console.error('❌ Eroare seed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Deconectat de la MongoDB');
  }
}

seed();
