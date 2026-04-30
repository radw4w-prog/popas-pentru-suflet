// backend/data/seedVerses.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Verse = require('../models/Verse');
const verseData = require('./versete.json');

const seedVerses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectat la MongoDB');
    
    // Ștergem versetele existente
    await Verse.deleteMany({});
    console.log('Versete existente șterse');
    
    // Inserăm versetele noi
    const result = await Verse.insertMany(verseData.versete);
    console.log(`✅ ${result.length} versete inserate cu succes!`);
    
    // Afișăm statistici
    const stats = await Verse.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Statistici pe categorii:');
    stats.forEach(s => console.log(`  ${s._id}: ${s.count} versete`));
    
    await mongoose.connection.close();
    console.log('\nConexiune închisă.');
  } catch (error) {
    console.error('Eroare la seed:', error);
    process.exit(1);
  }
};

seedVerses();