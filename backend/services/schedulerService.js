const cron = require('node-cron');

let initialized = false;
let running = false;

function init() {
  if (initialized) return;
  initialized = true;

  console.log('🕐 Inițializare scheduler...');

  cron.schedule('* * * * *', async () => {
    await checkAndPublish();
  });

  console.log('✅ Scheduler pornit - verifică postările la fiecare minut');
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
      scheduledDate: { $lte: now }
    }).sort({ scheduledDate: 1 });

    if (!posts.length) {
      running = false;
      return;
    }

    console.log(`\n📅 ${posts.length} postări de publicat`);

    for (const post of posts) {
      try {
        console.log(`➡️  Publicare: ${post._id}`);
        console.log(`   Data programată: ${post.scheduledDate}`);
        console.log(`   Are imagine: ${post.imageUrl ? 'DA' : 'NU'}`);

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

module.exports = { init, checkAndPublish };