const Notification = require('../models/Notification');
const ReadingPlan = require('../models/ReadingPlan');
const ReadingProgress = require('../models/ReadingProgress');
const User = require('../models/User');
const { getTodayDevotional } = require('./devotionalService');
const { sendNotificationToUser } = require('./webPushService');

function getNotificationUrl(tip) {
  switch (tip) {
    case 'reminder':
    case 'intarziere':
    case 'milestone':
      return '/reading';
    case 'devotional':
      return '/devotional';
    default:
      return '/notifications';
  }
}

async function createNotification(userId, tip, titlu, mesaj, icon = '🔔', options = {}) {
  try {
    const acum24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicateQuery = options.onceEver
      ? { userId, tip, titlu }
      : { userId, tip, titlu, createdAt: { $gte: acum24h } };

    const existenta = await Notification.findOne(duplicateQuery);

    if (existenta) {
      console.log(`   ⏭️  Skip duplicat: ${titlu}`);
      return null;
    }

    const notif = await Notification.create({
      userId,
      tip,
      titlu,
      mesaj,
      icon,
      citit: false
    });

    await sendNotificationToUser(userId, {
      title: titlu,
      body: mesaj,
      tag: options.tag || `notif-${tip}`,
      data: { url: options.url || getNotificationUrl(tip) }
    });

    console.log(`   ✅ Creat: ${titlu}`);
    return notif;
  } catch (error) {
    console.error('Eroare createNotification:', error.message);
    return null;
  }
}

async function verificaUserNotificari(user) {
  try {
    const setari = user.setari?.notificari;
    if (!setari?.active) {
      console.log(`   ⏭️  ${user.email}: notificări dezactivate`);
      return;
    }

    const plan = await ReadingPlan.findOne({
      userId: user._id,
      activ: true
    });

    if (!plan) {
      console.log(`   ⏭️  ${user.email}: fără plan activ`);
      return;
    }

    const azi = new Date();
    azi.setHours(0, 0, 0, 0);

    const dataStart = new Date(plan.dataStart);
    dataStart.setHours(0, 0, 0, 0);

    if (azi < dataStart) {
      console.log(`   ⏭️  ${user.email}: plan nu a început`);
      return;
    }

    const totalCitite = await ReadingProgress.countDocuments({
      userId: user._id
    });

    const zileTrecute = Math.floor((azi - dataStart) / 86400000);
    const capitoleAsteptate = Math.min(
      (zileTrecute + 1) * plan.capitolePerZi,
      1189
    );
    const intarziere = Math.max(0, capitoleAsteptate - totalCitite);

    console.log(`   📊 ${user.email}:`);
    console.log(`      citite=${totalCitite}, asteptate=${capitoleAsteptate}`);
    console.log(`      intarziere=${intarziere}, ziua=${zileTrecute}`);

    const azStart = new Date();
    azStart.setHours(0, 0, 0, 0);
    const azEnd = new Date();
    azEnd.setHours(23, 59, 59, 999);

    const cititAzi = await ReadingProgress.countDocuments({
      userId: user._id,
      cititLa: { $gte: azStart, $lte: azEnd }
    });

    console.log(`      cititAzi=${cititAzi}`);

    if (setari.reminderZilnic) {
      const planZiTerminat = cititAzi >= plan.capitolePerZi;

      if (!planZiTerminat) {
        const ramase = plan.capitolePerZi - cititAzi;
        await createNotification(
          user._id,
          'reminder',
          '📖 Continuă planul de citire!',
          `Ai citit ${cititAzi} din ${plan.capitolePerZi} capitol(e) planificate pentru azi. Mai ai ${ramase} de citit! 🙏`,
          '📖',
          { url: '/reading', tag: 'reading-reminder' }
        );
      } else {
        console.log('      ⏭️  Reminder skip: plan zilnic terminat');
      }
    }

    if (setari.intarziere && intarziere > 0) {
      await createNotification(
        user._id,
        'intarziere',
        `⚠️ Ești cu ${intarziere} capitol(e) în urmă!`,
        `Planul tău de azi necesită ${capitoleAsteptate} capitole citite, dar ai citit ${totalCitite}. Hai să recuperăm! 💪`,
        '⚠️',
        { url: '/reading', tag: 'reading-delay' }
      );
    } else {
      console.log(`      ⏭️  Întârziere skip: intarziere=${intarziere}`);
    }

    if (setari.milestones && totalCitite > 0) {
      const milestones = [
        {
          prag: 1,
          titlu: '🎉 Primul capitol citit!',
          mesaj: 'Ai citit primul capitol! Fiecare călătorie începe cu primul pas. Continuă! 🌟'
        },
        {
          prag: 119,
          titlu: '🏆 10% din Biblie citit!',
          mesaj: 'Ai citit 10% din Biblie! Continuă tot așa! 🌟'
        },
        {
          prag: 297,
          titlu: '🏆 25% din Biblie citit!',
          mesaj: 'Un sfert din Biblie citit! Extraordinar! 🎉'
        },
        {
          prag: 595,
          titlu: '🏆 50% din Biblie citit!',
          mesaj: 'Jumătate din Biblie citită! Ești la mijlocul drumului! 🏆'
        },
        {
          prag: 892,
          titlu: '🏆 75% din Biblie citit!',
          mesaj: 'Trei sferturi citite! Aproape ai terminat! 🔥'
        },
        {
          prag: 1189,
          titlu: '🎊 Biblia citită integral!',
          mesaj: 'Ai citit TOATĂ Biblia! Un achievement incredibil! 🎊🙏'
        }
      ];

      for (const milestone of milestones) {
        if (totalCitite >= milestone.prag) {
          await createNotification(
            user._id,
            'milestone',
            milestone.titlu,
            milestone.mesaj,
            '🏆',
            { url: '/reading', tag: `milestone-${milestone.prag}`, onceEver: true }
          );
        }
      }
    }
  } catch (error) {
    console.error(`Eroare verificaUser (${user._id}):`, error.message);
  }
}

async function runNotificationsJob() {
  try {
    console.log('🔔 Rulare job notificări citire...');
    const useri = await User.find({ activ: true });

    for (const user of useri) {
      await verificaUserNotificari(user);
    }

    console.log(`✅ Notificări procesate pentru ${useri.length} useri.`);
  } catch (error) {
    console.error('❌ Eroare job notificări:', error.message);
  }
}

async function runDevotionalNotificationsJob() {
  try {
    console.log('☀️ Rulare job notificări devoțional...');
    const devotional = await getTodayDevotional();
    const useri = await User.find({ activ: true });

    for (const user of useri) {
      const setari = user.setari?.notificari;
      if (!setari?.active || setari?.devotional === false) continue;

      const titlu = '☀️ Devoționalul zilei este pregătit';
      const mesaj = devotional?.title
        ? `${devotional.title} — intră să citești devoționalul de astăzi.`
        : 'Intră să citești devoționalul de astăzi.';

      await createNotification(
        user._id,
        'devotional',
        titlu,
        mesaj,
        '☀️',
        { url: '/devotional', tag: 'daily-devotional' }
      );
    }

    console.log(`✅ Notificări devoțional procesate pentru ${useri.length} useri.`);
  } catch (error) {
    console.error('❌ Eroare job devoțional:', error.message);
  }
}

async function checkMilestoneAfterMark(userId, totalCitite) {
  try {
    const user = await User.findById(userId);
    if (!user?.setari?.notificari?.active) return;
    if (!user?.setari?.notificari?.milestones) return;

    const milestones = [
      { prag: 1, titlu: '🎉 Primul capitol citit!', mesaj: 'Ai citit primul capitol! Fiecare călătorie începe cu primul pas. Continuă! 🌟' },
      { prag: 119, titlu: '🏆 10% din Biblie citit!', mesaj: 'Ai citit 10% din Biblie! Continuă tot așa! 🌟' },
      { prag: 297, titlu: '🏆 25% din Biblie citit!', mesaj: 'Un sfert din Biblie citit! Extraordinar! 🎉' },
      { prag: 595, titlu: '🏆 50% din Biblie citit!', mesaj: 'Jumătate din Biblie citită! 🏆' },
      { prag: 892, titlu: '🏆 75% din Biblie citit!', mesaj: 'Trei sferturi citite! Aproape ai terminat! 🔥' },
      { prag: 1189, titlu: '🎊 Biblia citită integral!', mesaj: 'Ai citit TOATĂ Biblia! 🎊🙏' }
    ];

    for (const milestone of milestones) {
      if (totalCitite >= milestone.prag) {
        await createNotification(
          userId,
          'milestone',
          milestone.titlu,
          milestone.mesaj,
          '🏆',
          { url: '/reading', tag: `milestone-${milestone.prag}`, onceEver: true }
        );
      }
    }
  } catch (error) {
    console.error('Eroare checkMilestone:', error.message);
  }
}

module.exports = {
  runNotificationsJob,
  runDevotionalNotificationsJob,
  checkMilestoneAfterMark,
  createNotification
};
