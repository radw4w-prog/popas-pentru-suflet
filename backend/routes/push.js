const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const PushSubscription = require('../models/PushSubscription');
const { isConfigured, sendNotificationToUser } = require('../services/webPushService');
const { createNotification } = require('../services/notificationService');
const { getTodayDevotional } = require('../services/devotionalService');

router.use(protect);

function validateSubscription(subscription) {
  return Boolean(
    subscription &&
    typeof subscription.endpoint === 'string' &&
    subscription.endpoint &&
    subscription.keys &&
    typeof subscription.keys.p256dh === 'string' &&
    typeof subscription.keys.auth === 'string'
  );
}

// GET /api/push/status
router.get('/status', async (req, res) => {
  try {
    const total = await PushSubscription.countDocuments({ userId: req.user._id, active: true });

    res.json({
      success: true,
      configured: isConfigured(),
      subscribed: total > 0,
      totalSubscriptions: total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Nu am putut verifica statusul notificărilor push.' });
  }
});

// POST /api/push/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!validateSubscription(subscription)) {
      return res.status(400).json({ success: false, message: 'Subscription invalid.' });
    }

    const saved = await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        userId: req.user._id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        active: true,
        userAgent: req.headers['user-agent'] || null,
        lastError: null
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      message: 'Abonarea push a fost salvată.',
      subscriptionId: saved._id,
      configured: isConfigured()
    });
  } catch (error) {
    console.error('Eroare subscribe push:', error.message);
    res.status(500).json({ success: false, message: 'Nu am putut salva abonarea push.' });
  }
});

// POST /api/push/unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const endpoint = req.body?.endpoint;

    if (endpoint) {
      await PushSubscription.findOneAndUpdate(
        { userId: req.user._id, endpoint },
        { active: false, lastError: 'manual-unsubscribe' }
      );
    } else {
      await PushSubscription.updateMany(
        { userId: req.user._id, active: true },
        { active: false, lastError: 'manual-unsubscribe' }
      );
    }

    res.json({ success: true, message: 'Abonarea push a fost dezactivată.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Nu am putut dezactiva abonarea push.' });
  }
});

// POST /api/push/test
router.post('/test', async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Web push nu este configurat încă pe server. Adaugă cheile VAPID în backend.'
      });
    }

    const result = await sendNotificationToUser(req.user._id, {
      title: '🔔 Test notificare',
      body: 'Push notifications funcționează. Dumnezeu să-ți binecuvânteze ziua!',
      tag: 'push-test',
      data: { url: '/notifications' }
    });

    if (!result.delivered) {
      return res.status(400).json({
        success: false,
        message: 'Nu există abonări push active pentru acest cont.'
      });
    }

    res.json({
      success: true,
      message: `Notificare de test trimisă către ${result.delivered} dispozitiv(e).`,
      ...result
    });
  } catch (error) {
    console.error('Eroare test push:', error.message);
    res.status(500).json({ success: false, message: 'Nu am putut trimite notificarea de test.' });
  }
});

// POST /api/push/test-devotional
router.post('/test-devotional', async (req, res) => {
  try {
    const devotional = await getTodayDevotional();
    const titlu = '☀️ Test devoțional zilnic';
    const mesaj = devotional?.title
      ? `${devotional.title} — acesta este un test pentru notificarea de devoțional.`
      : 'Acesta este un test pentru notificarea de devoțional.';

    await createNotification(
      req.user._id,
      'devotional',
      titlu,
      mesaj,
      '☀️',
      { url: '/devotional', tag: 'daily-devotional-test' }
    );

    res.json({ success: true, message: 'Notificarea de test pentru devoțional a fost trimisă.' });
  } catch (error) {
    console.error('Eroare test-devotional:', error.message);
    res.status(500).json({ success: false, message: 'Nu am putut trimite testul pentru devoțional.' });
  }
});

// POST /api/push/test-reading
router.post('/test-reading', async (req, res) => {
  try {
    await createNotification(
      req.user._id,
      'reminder',
      '📖 Test reminder citire',
      'Acesta este un reminder de test pentru planul tău de citire.',
      '📖',
      { url: '/reading', tag: 'reading-reminder-test' }
    );

    res.json({ success: true, message: 'Reminder-ul de test pentru citire a fost trimis.' });
  } catch (error) {
    console.error('Eroare test-reading:', error.message);
    res.status(500).json({ success: false, message: 'Nu am putut trimite testul pentru citire.' });
  }
});

module.exports = router;
