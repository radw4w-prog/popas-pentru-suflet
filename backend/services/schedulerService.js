const cron = require('node-cron');

let initialized = false;
let running = false;
let runningNotif = false;

function init() {
  if (initialized) return;

  // Scheduler doar dacă este activat explicit
  if (process.env.ENABLE_SCHEDULER !== 'true') {
    console.log('⏸️ Scheduler dezactivat pentru această instanță.');
    return;
  }

  initialized = true;

  console.log('🕐 Inițializare scheduler...');

  // ─── Job 1: Publicare postări programate (la fiecare minut) ───
  cron.schedule('* * * * *', async () => {
    await checkAndPublish();
  });

  // ─── Job 2: Notificări dimineața la 08:00 ───
  cron.schedule('0 8 * * *', async () => {
    console.log('🔔 Job notificări dimineață (08:00)...');
    await runNotificationsJob();
  });

  // ─── Job 3: Notificări seara la 21:00 ───
  cron.schedule('0 21 * * *', async () => {
    console.log('🔔 Job notificări seară (21:00)...');
    await runNotificationsJob();
  });

  console.log('✅ Scheduler pornit:');
  console.log('   📅 Publicare postări: la fiecare minut');
  console.log('   🔔 Notificări citire: 08:00 și 21:00');
}

// ═══════════════════════════════════════
// JOB 1: PUBLICARE POSTĂRI
// ═══════════════════════════════════════
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
        // ← LOCK: marchează imediat ca 'publishing' înainte să publice
        const locked = await Post.findOneAndUpdate(
          { _id: post._id, status: 'scheduled', socialPostId: null },
          { status: 'publishing' },
          { new: true }
        );

        // Dacă nu am putut să o lock-uim → altcineva a luat-o deja
        if (!locked) {
          console.log(`⏭️  Skip ${post._id} - deja procesată`);
          continue;
        }

        console.log(`➡️  Publicare: ${post._id}`);

        const result = await facebookService.publishPost(post);

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

// ═══════════════════════════════════════
// JOB 2: NOTIFICĂRI CITIRE
// ═══════════════════════════════════════
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

module.exports = { init, checkAndPublish, runNotificationsJob };