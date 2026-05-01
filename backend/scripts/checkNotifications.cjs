require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectat MongoDB\n');

  const Notification = require('../models/Notification');
  const User = require('../models/User');
  const ReadingPlan = require('../models/ReadingPlan');

  // Toate notificările
  const notif = await Notification.find().lean();
  console.log('📊 Total notificări în DB:', notif.length);

  if (notif.length === 0) {
    console.log('❌ Nu există notificări!\n');
  } else {
    for (const n of notif) {
      const user = await User.findById(n.userId).lean();
      console.log(`\n - ${n.titlu}`);
      console.log(`   userId: ${n.userId}`);
      console.log(`   user:   ${user ? user.email : 'NEGĂSIT'}`);
      console.log(`   tip:    ${n.tip}`);
      console.log(`   citit:  ${n.citit}`);
    }
  }

  // Toți userii
  console.log('\n👥 Useri în sistem:');
  const useri = await User.find().lean();
  for (const u of useri) {
    const plan = await ReadingPlan.findOne({ userId: u._id }).lean();
    console.log(`\n - ${u.email} (${u.rol})`);
    console.log(`   ID: ${u._id}`);
    console.log(`   Notificări active: ${u.setari?.notificari?.active}`);
    console.log(`   Are plan citire: ${plan ? 'DA' : 'NU'}`);
    if (plan) {
      console.log(`   Plan: ${new Date(plan.dataStart).toLocaleDateString('ro-RO')} → ${new Date(plan.dataFinal).toLocaleDateString('ro-RO')}`);
      console.log(`   Cap/zi: ${plan.capitolePerZi}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Eroare:', err.message);
  process.exit(1);
});