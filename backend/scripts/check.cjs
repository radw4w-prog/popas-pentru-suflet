const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/popas-pentru-suflet')
  .then(async () => {
    console.log('✅ Conectat!\n');
    const db = mongoose.connection.db;

    const cols = await db.listCollections().toArray();
    console.log('📚 Colectii:');
    cols.forEach(c => console.log('   -', c.name));
    console.log();

    for (const name of ['verses', 'versets', 'verse']) {
      const n = await db.collection(name).countDocuments();
      console.log(`"${name}": ${n} documente`);
      if (n > 0) {
        const doc = await db.collection(name).findOne();
        console.log('   Campuri:', Object.keys(doc).join(', '));
        console.log('   Exemplu referinta:', doc.referinta || doc.reference || '?');
        console.log('   Exemplu carte:', doc.carte || doc.book || '?');
        console.log('   Exemplu text:', (doc.text || '').substring(0, 60) + '...');
      }
      console.log();
    }

    process.exit(0);
  })
  .catch(e => {
    console.error('❌', e.message);
    process.exit(1);
  });