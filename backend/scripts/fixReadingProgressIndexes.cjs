require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Import modelul nou
require('../models/ReadingProgress');
const ReadingProgress = mongoose.model('ReadingProgress');

async function run() {
  try {
    console.log('='.repeat(60));
    console.log('🔧 FIX INDEXES reading_progress');
    console.log('='.repeat(60));

    console.log('\n🔌 Conectare MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectat!');

    const collection = mongoose.connection.collection('reading_progress');

    // Vezi indexurile actuale
    const indexesBefore = await collection.indexes();
    console.log('\n📋 Indexuri existente:');
    indexesBefore.forEach(idx => {
      console.log(` - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Șterge indexul vechi dacă există
    const oldIndex = indexesBefore.find(
      idx =>
        idx.name === 'carte_1_capitol_1' ||
        (idx.key && idx.key.carte === 1 && idx.key.capitol === 1 && !idx.key.userId)
    );

    if (oldIndex) {
      console.log(`\n🗑️ Șterg indexul vechi: ${oldIndex.name}`);
      await collection.dropIndex(oldIndex.name);
      console.log('✅ Index vechi șters!');
    } else {
      console.log('\nℹ️ Indexul vechi nu există.');
    }

    // Șterge toate documentele vechi din reading_progress
    const countBefore = await collection.countDocuments();
    console.log(`\n🧹 Documente existente în reading_progress: ${countBefore}`);

    if (countBefore > 0) {
      await collection.deleteMany({});
      console.log('✅ Toate documentele reading_progress au fost șterse.');
    }

    // Rebuild indexuri din model
    console.log('\n🔄 Rebuild indexuri din model...');
    await ReadingProgress.syncIndexes();
    console.log('✅ Indexurile au fost sincronizate.');

    const indexesAfter = await collection.indexes();
    console.log('\n📋 Indexuri finale:');
    indexesAfter.forEach(idx => {
      console.log(` - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✅ FIX COMPLET!');
    console.log('Acum fiecare user poate marca același capitol independent.');
  } catch (error) {
    console.error('\n❌ Eroare:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Deconectat MongoDB');
    process.exit(0);
  }
}

run();