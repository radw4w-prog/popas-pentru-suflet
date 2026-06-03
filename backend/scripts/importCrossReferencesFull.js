// backend/scripts/importCrossReferencesFull.js
//
// Importa setul COMPLET de referinte incrucisate in MongoDB.
//
// Sursa: openbible.info — Treasury of Scripture Knowledge (TSK), licenta CC-BY.
// Datele au fost mapate pe numele romanesti ale cartilor (Cornilescu) si salvate in
// backend/data/crossReferences.json sub forma:
//   [{ carte, capitol, verset, referinte: [{ carte, capitol, versetStart, versetEnd, referinta }] }, ...]
//
// Spre deosebire de vechiul script (importCrossReferences.js) care acoperea doar ~30 de
// capitole scrise manual, acesta acopera ~29.000 de versete cu ~278.000 de referinte.
//
// Rulare:
//   cd backend
//   node scripts/importCrossReferencesFull.js
//
// Necesita variabila de mediu MONGODB_URI (din .env).

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const CrossReference = require('../models/CrossReference');

async function run() {
  const dataPath = path.join(__dirname, '..', 'data', 'crossReferences.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Lipseste fisierul de date:', dataPath);
    process.exit(1);
  }

  console.log('📖 Citesc datele de referinte...');
  const docs = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`   ${docs.length} versete sursa incarcate.`);

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI nu este setat in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB conectat');

  await CrossReference.deleteMany({});
  console.log('🗑️  Colectia crossreferences a fost curatata');

  // Insert in loturi pentru a nu depasi limitele de memorie / payload.
  const BATCH = 2000;
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH);
    await CrossReference.insertMany(batch, { ordered: false });
    inserted += batch.length;
    process.stdout.write(`\r   Inserate: ${inserted}/${docs.length}`);
  }
  process.stdout.write('\n');

  const totalRefs = docs.reduce((sum, d) => sum + (d.referinte ? d.referinte.length : 0), 0);
  console.log(`✅ Import complet: ${inserted} versete, ${totalRefs} referinte`);

  await mongoose.disconnect();
  console.log('✅ Gata!');
}

run().catch((err) => {
  console.error('❌ Eroare:', err.message);
  process.exit(1);
});
