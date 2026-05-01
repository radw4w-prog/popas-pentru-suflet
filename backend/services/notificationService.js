const Notification = require('../models/Notification');
const ReadingPlan = require('../models/ReadingPlan');
const ReadingProgress = require('../models/ReadingProgress');
const User = require('../models/User');

async function createNotification(userId, tip, titlu, mesaj, icon = '🔔') {
  try {
    const acum24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existenta = await Notification.findOne({
      userId,
      tip,
      titlu,
      createdAt: { $gte: acum24h }
    });

    if (existenta) {
      console.log(`   ⏭️  Skip duplicat: ${titlu}`);
      return null;
    }

    const notif = await Notification.create({
      userId, tip, titlu, mesaj, icon, citit: false
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
    const procent = Math.round((totalCitite / 1189) * 100);

    console.log(`   📊 ${user.email}:`);
    console.log(`      citite=${totalCitite}, asteptate=${capitoleAsteptate}`);
    console.log(`      intarziere=${intarziere}, ziua=${zileTrecute}`);

    // ─── CITIT AZI ───
    const azStart = new Date();
    azStart.setHours(0, 0, 0, 0);
    const azEnd = new Date();
    azEnd.setHours(23, 59, 59, 999);

    const cititAzi = await ReadingProgress.countDocuments({
      userId: user._id,
      cititLa: { $gte: azStart, $lte: azEnd }
    });

    console.log(`      cititAzi=${cititAzi}`);

    // ─── 1. NOTIFICARE PROGRES ZI ───
    // Dacă nu a terminat planul zilei (indiferent de zi)
    if (setari.reminderZilnic) {
      const planZiTerminat = cititAzi >= plan.capitolePerZi;

      if (!planZiTerminat) {
        const ramase = plan.capitolePerZi - cititAzi;
        await createNotification(
          user._id,
          'reminder',
          '📖 Continuă planul de citire!',
          `Ai citit ${cititAzi} din ${plan.capitolePerZi} capitol(e) planificate pentru azi. Mai ai ${ramase} de citit! 🙏`,
          '📖'
        );
      } else {
        console.log(`      ⏭️  Reminder skip: plan zilnic terminat`);
      }
    }

    // ─── 2. ÎNTÂRZIERE ───
    if (setari.intarziere && intarziere > 0) {
      await createNotification(
        user._id,
        'intarziere',
        `⚠️ Ești cu ${intarziere} capitol(e) în urmă!`,
        `Planul tău de azi necesită ${capitoleAsteptate} capitole citite, dar ai citit ${totalCitite}. Hai să recuperăm! 💪`,
        '⚠️'
      );
    } else {
      console.log(`      ⏭️  Întârziere skip: intarziere=${intarziere}`);
    }

    // ─── 3. MILESTONE ───
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

      for (const m of milestones) {
        if (totalCitite >= m.prag) {
          const existent = await Notification.findOne({
            userId: user._id,
            tip: 'milestone',
            titlu: m.titlu
          });

          if (!existent) {
            await Notification.create({
              userId: user._id,
              tip: 'milestone',
              titlu: m.titlu,
              mesaj: m.mesaj,
              icon: '🏆',
              citit: false
            });
            console.log(`      ✅ Milestone: ${m.titlu}`);
          }
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

    for (const m of milestones) {
      if (totalCitite >= m.prag) {
        const existent = await Notification.findOne({
          userId,
          tip: 'milestone',
          titlu: m.titlu
        });

        if (!existent) {
          await Notification.create({
            userId,
            tip: 'milestone',
            titlu: m.titlu,
            mesaj: m.mesaj,
            icon: '🏆',
            citit: false
          });
          console.log(`🏆 Milestone: ${m.titlu} → ${userId}`);
        }
      }
    }
  } catch (error) {
    console.error('Eroare checkMilestone:', error.message);
  }
}

module.exports = {
  runNotificationsJob,
  checkMilestoneAfterMark,
  createNotification
};