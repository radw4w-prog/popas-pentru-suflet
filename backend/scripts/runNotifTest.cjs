require('dotenv').config({ 
  path: require('path').join(__dirname, '..', '.env') 
});
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectat\n');

  // Șterge notificările vechi pentru test curat
  const Notification = require('../models/Notification');
  await Notification.deleteMany({});
  console.log('🗑️  Notificări vechi șterse\n');

  // Rulează serviciul NOU
  const { runNotificationsJob } = require('../services/notificationService');
  await runNotificationsJob();

  // Verifică rezultatul
  const notif = await Notification.find().lean();
  const User = require('../models/User');

  console.log(`\n📊 Notificări create: ${notif.length}`);
  for (const n of notif) {
    const user = await User.findById(n.userId).lean();
    console.log(`\n  ✅ ${n.titlu}`);
    console.log(`     User: ${user?.email}`);
    console.log(`     Tip: ${n.tip}`);
    console.log(`     Mesaj: ${n.mesaj.substring(0, 60)}...`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Eroare:', err.message);
  process.exit(1);
});