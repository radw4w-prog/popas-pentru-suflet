const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/popas-pentru-suflet';
const ATLAS_URI = 'mongodb+srv://popas_admin:L2Wjrw64lDTXySpx@cluster0.1glnnk8.mongodb.net/?appName=Cluster0';

async function migrate() {
  console.log('Conectare locala...');
  const local = await mongoose.createConnection(LOCAL_URI).asPromise();

  console.log('Conectare Atlas...');
  const atlas = await mongoose.createConnection(ATLAS_URI).asPromise();

  const cols = ['versets', 'posts', 'descriptions', 'settings'];

  for (const col of cols) {
    const localCol = local.db.collection(col);
    const atlasCol = atlas.db.collection(col);

    const docs = await localCol.find({}).toArray();
    console.log(`${col}: ${docs.length} documente`);

    if (!docs.length) continue;

    await atlasCol.deleteMany({});

    const batchSize = 500;
    for (let i = 0; i < docs.length; i += batchSize) {
      await atlasCol.insertMany(docs.slice(i, i + batchSize));
      console.log(`  ${Math.min(i + batchSize, docs.length)}/${docs.length}`);
    }

    console.log(`✅ ${col} migrat!`);
  }

  await local.close();
  await atlas.close();
  console.log('\n✅ Migrare completa!');
  process.exit(0);
}

migrate().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});