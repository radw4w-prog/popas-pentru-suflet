const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/popas-pentru-suflet';
const ATLAS_URI = 'mongodb+srv://popas_admin:L2Wjrw64lDTXySpx@cluster0.1glnnk8.mongodb.net/popas-pentru-suflet?retryWrites=true&w=majority';

async function migrate() {
  console.log('🔌 Conectare la MongoDB local...');
  const local = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✅ Local conectat!');

  console.log('🔌 Conectare la MongoDB Atlas...');
  const atlas = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✅ Atlas conectat!');

  const cols = ['versets', 'posts', 'descriptions', 'settings', 'schedules'];

  for (const col of cols) {
    try {
      const localCol = local.db.collection(col);
      const atlasCol = atlas.db.collection(col);

      const docs = await localCol.find({}).toArray();
      console.log(`\n📦 ${col}: ${docs.length} documente`);

      if (!docs.length) {
        console.log('   ⏩ Skip (goală)');
        continue;
      }

      await atlasCol.deleteMany({});
      console.log('   🗑️ Date vechi șterse');

      const batchSize = 500;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        await atlasCol.insertMany(batch, { ordered: false });
        console.log(`   ✅ ${Math.min(i + batchSize, docs.length)}/${docs.length}`);
      }

      console.log(`   🎉 ${col} migrat cu succes!`);
    } catch (e) {
      console.error(`   ❌ Eroare la ${col}:`, e.message);
    }
  }

  console.log('\n════════════════════════════════');
  console.log('✅ MIGRARE COMPLETĂ!');
  console.log('════════════════════════════════');

  await local.close();
  await atlas.close();
  process.exit(0);
}

migrate().catch(e => {
  console.error('❌ Eroare generală:', e.message);
  process.exit(1);
});