// backend/scripts/migrateJournalVerset.cjs
// Migrează câmpul vechi `vpierset` → `verset` în colecția journal_entries.
// Rulează o singură dată după deploy-ul Pasului 5:
//   node backend/scripts/migrateJournalVerset.cjs
// Necesită MONGO_URI în mediu (sau .env în backend/).

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGO_URI nu e setat');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const col = mongoose.connection.collection('journal_entries');

  const res = await col.updateMany(
    { vpierset: { $exists: true } },
    [{ $set: { verset: '$vpierset' } }, { $unset: ['vpierset'] }]
  );
  console.log(`✅ Migrare completă: ${res.modifiedCount} documente actualizate`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('❌ Eroare migrare:', e.message);
  process.exit(1);
});
