require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/popas-pentru-suflet'
  );
  console.log('✅ Conectat!\n');

  // Verifica colectia
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('📚 Colectii existente:');
  collections.forEach(c => console.log(`   - ${c.name}`));
  console.log();

  // Cauta colectia de versete
  const verseCollection = db.collection('verses');
  const total = await verseCollection.countDocuments();
  console.log(`📖 Total documente in "verses": ${total}`);
  console.log();

  if (total > 0) {
    // Arata primul document
    const primul = await verseCollection.findOne();
    console.log('📄 Primul document:');
    console.log(JSON.stringify(primul, null, 2));
    console.log();

    // Verifica campurile
    console.log('🔑 Campuri disponibile:', Object.keys(primul));
  }

  // Verifica si alte colectii posibile
  for (const col of ['verse', 'versete', 'bibles', 'verses']) {
    const c = db.collection(col);
    const n = await c.countDocuments();
    if (n > 0) console.log(`✅ "${col}": ${n} documente`);
  }

  await mongoose.disconnect();
}

check().catch(console.error);

// Verifica colectia versets
const versetsColl = db.collection('versets');
const totalVersets = await versetsColl.countDocuments();
console.log(`\n📖 Total documente in "versets": ${totalVersets}`);

if (totalVersets > 0) {
  const primul = await versetsColl.findOne();
  console.log('\n📄 Primul document din versets:');
  console.log(JSON.stringify(primul, null, 2));
}