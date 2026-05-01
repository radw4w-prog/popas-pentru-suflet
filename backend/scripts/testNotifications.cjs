require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectat MongoDB\n');

  const User = require('../models/User');
  const ReadingPlan = require('../models/ReadingPlan');
  const ReadingProgress = require('../models/ReadingProgress');
  const Notification = require('../models/Notification');

  const useri = await User.find({ activ: true });

  for (const user of useri) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`👤 User: ${user.email}`);
    console.log(`   setari raw:`, JSON.stringify(user.setari));
    console.log(`   notificari.active: ${user.setari?.notificari?.active}`);

    const plan = await ReadingPlan.findOne({ userId: user._id, activ: true });
    console.log(`   Plan activ: ${plan ? 'DA' : 'NU'}`);

    if (!plan) continue;

    const azi = new Date();
    azi.setHours(0, 0, 0, 0);
    const dataStart = new Date(plan.dataStart);
    dataStart.setHours(0, 0, 0, 0);

    console.log(`   Data start: ${dataStart.toLocaleDateString('ro-RO')}`);
    console.log(`   Azi: ${azi.toLocaleDateString('ro-RO')}`);
    console.log(`   Plan început: ${azi >= dataStart ? 'DA' : 'NU - nu a început încă'}`);

    if (azi < dataStart) continue;

    const totalCitite = await ReadingProgress.countDocuments({ userId: user._id });
    const zileTrecute = Math.floor((azi - dataStart) / 86400000);
    const capitoleAsteptate = Math.min((zileTrecute + 1) * plan.capitolePerZi, 1189);
    const intarziere = capitoleAsteptate - totalCitite;

    console.log(`   Total citite: ${totalCitite}`);
    console.log(`   Zile trecute: ${zileTrecute}`);
    console.log(`   Capitole așteptate: ${capitoleAsteptate}`);
    console.log(`   Întârziere: ${intarziere}`);
    console.log(`   Procent: ${Math.round((totalCitite / 1189) * 100)}%`);

    // Verifică citire azi
    const azStart = new Date(); azStart.setHours(0, 0, 0, 0);
    const azEnd = new Date(); azEnd.setHours(23, 59, 59, 999);
    const cititAzi = await ReadingProgress.countDocuments({
      userId: user._id,
      cititLa: { $gte: azStart, $lte: azEnd }
    });
    console.log(`   Citit azi: ${cititAzi}`);

    // Simulează crearea notificărilor
    console.log(`\n   🔔 Notificări care ar trebui create:`);

    const setari = user.setari?.notificari;
    if (!setari?.active) {
      console.log(`   ❌ Notificările sunt DEZACTIVATE pentru acest user`);
      continue;
    }

    if (setari.reminderZilnic && cititAzi === 0) {
      console.log(`   ✅ REMINDER: Nu ai citit azi`);
    } else {
      console.log(`   ⏭️  Reminder skip (citit azi: ${cititAzi})`);
    }

    if (setari.intarziere && intarziere >= plan.capitolePerZi * 3) {
      const zileLipsa = Math.floor(intarziere / plan.capitolePerZi);
      console.log(`   ✅ ÎNTÂRZIERE: ${zileLipsa} zile în urmă`);
    } else {
      console.log(`   ⏭️  Întârziere skip (intarziere: ${intarziere}, prag: ${plan.capitolePerZi * 3})`);
    }
  }

  // Acum creează efectiv notificările
  console.log(`\n${'='.repeat(50)}`);
  console.log('🚀 Rulez job notificări...');

  const { runNotificationsJob } = require('../services/notificationService');
  await runNotificationsJob();

  const totalNotif = await Notification.countDocuments();
  console.log(`✅ Notificări create: ${totalNotif}`);

  const notif = await Notification.find().lean();
  notif.forEach(n => {
    console.log(`\n - ${n.titlu}`);
    console.log(`   userId: ${n.userId}`);
    console.log(`   tip: ${n.tip}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Eroare:', err.message);
  console.error(err.stack);
  process.exit(1);
});