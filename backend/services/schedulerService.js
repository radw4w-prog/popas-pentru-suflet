const cron = require('node-cron');

let initialized = false;
let running = false;
let runningNotif = false;
let runningDevotional = false;

const TZ = 'Europe/Bucharest';

function init() {
  if (initialized) return;

  if (process.env.ENABLE_SCHEDULER !== 'true') {
    console.log('⏸️ Scheduler dezactivat pentru această instanță.');
    return;
  }

  initialized = true;

  console.log('🕐 Inițializare scheduler...');

  cron.schedule('* * * * *', async () => {
    await checkAndPublish();
  });

  cron.schedule('5 7 * * *', async () => {
    console.log('☀️ Job notificări devoțional (07:05)...');
    await runDevotionalNotificationsJob();
  }, { timezone: TZ });

  cron.schedule('0 8 * * *', async () => {
    console.log('🔔 Job notificări dimineață (08:00)...');
    await runNotificationsJob();
  }, { timezone: TZ });

  cron.schedule('0 21 * * *', async () => {
    console.log('🔔 Job notificări seară (21:00)...');
    await runNotificationsJob();
  }, { timezone: TZ });

  console.log('✅ Scheduler pornit:');
  console.log('   📅 Publicare postări: la fiecare minut');
  console.log('   ☀️ Devoțional zilnic: 07:05 (Europe/Bucharest)');
  console.log('   🔔 Notificări citire: 08:00 și 21:00 (Europe/Bucharest)');
}

async function checkAndPublish() {
  if (running) return;
  running = true;

  try {
    const Post = require('../models/Post');
    const facebookService = require('./facebookService');
    const now = new Date();

    const posts = await Post.find({
      status: 'scheduled',
      scheduledDate: { $lte: now },
      socialPostId: null
    }).sort({ scheduledDate: 1 });

    if (!posts.length) return;

    console.log(`\n📅 ${posts.length} postări de publicat`);

    for (const post of posts) {
      try {
        const locked = await Post.findOneAndUpdate(
          { _id: post._id, status: 'scheduled', socialPostId: null },
          { status: 'publishing' },
          { new: true }
        );

        if (!locked) {
          console.log(`⏭️  Skip ${post._id} - deja procesată`);
          continue;
        }

        console.log(`➡️  Publicare: ${post._id} | tip: ${post.tipMedia || 'image'}`);

        let result;
        if (post.tipMedia === 'video' && post.videoBase64) {
          console.log('🎬 Publicare video Reel...');
          result = await facebookService.publishVideo(post);
        } else {
          result = await facebookService.publishPost(post);
        }

        await Post.findByIdAndUpdate(post._id, {
          status: 'published',
          publishedAt: new Date(),
          socialPostId: result.postId,
          publishedPlatform: 'facebook',
          failedReason: null
        });

        console.log(`✅ Publicată: ${post._id}`);
      } catch (err) {
        console.error(`❌ Eroare ${post._id}:`, err.message);
        await Post.findByIdAndUpdate(post._id, {
          status: 'failed',
          failedReason: err.message
        });
      }
    }
  } catch (error) {
    console.error('❌ Scheduler error:', error.message);
  } finally {
    running = false;
  }
}

async function runNotificationsJob() {
  if (runningNotif) return;
  runningNotif = true;

  try {
    const { runNotificationsJob: run } = require('./notificationService');
    await run();
  } catch (error) {
    console.error('❌ Eroare job notificări:', error.message);
  } finally {
    runningNotif = false;
  }
}

async function runDevotionalNotificationsJob() {
  if (runningDevotional) return;
  runningDevotional = true;

  try {
    const { runDevotionalNotificationsJob: run } = require('./notificationService');
    await run();
  } catch (error) {
    console.error('❌ Eroare job devoțional:', error.message);
  } finally {
    runningDevotional = false;
  }
}

module.exports = {
  init,
  checkAndPublish,
  runNotificationsJob,
  runDevotionalNotificationsJob
};
