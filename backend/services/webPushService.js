const webPush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@popas-pentru-suflet.ro';

let configured = false;

function isConfigured() {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

function ensureConfigured() {
  if (!isConfigured()) return false;
  if (configured) return true;

  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

function normalizePayload(payload = {}) {
  return JSON.stringify({
    title: payload.title || 'Popas pentru Suflet',
    body: payload.body || 'Ai o notificare nouă!',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-72.png',
    tag: payload.tag || 'popas-notif',
    data: payload.data || { url: '/dashboard' }
  });
}

async function deactivateSubscription(subscriptionId, reason = 'inactive') {
  try {
    await PushSubscription.findByIdAndUpdate(subscriptionId, {
      active: false,
      lastError: reason
    });
  } catch (error) {
    console.error('Eroare deactivateSubscription:', error.message);
  }
}

async function sendNotificationToSubscription(subscriptionDoc, payload = {}) {
  if (!ensureConfigured()) {
    return { success: false, skipped: true, reason: 'VAPID_NOT_CONFIGURED' };
  }

  try {
    await webPush.sendNotification(
      {
        endpoint: subscriptionDoc.endpoint,
        keys: {
          p256dh: subscriptionDoc.keys.p256dh,
          auth: subscriptionDoc.keys.auth
        }
      },
      normalizePayload(payload)
    );

    await PushSubscription.findByIdAndUpdate(subscriptionDoc._id, {
      lastUsedAt: new Date(),
      lastSuccessAt: new Date(),
      lastError: null,
      active: true
    });

    return { success: true };
  } catch (error) {
    const statusCode = error.statusCode || error.status || 0;
    const reason = error.body || error.message;

    if (statusCode === 404 || statusCode === 410) {
      await deactivateSubscription(subscriptionDoc._id, `expired:${statusCode}`);
    } else {
      await PushSubscription.findByIdAndUpdate(subscriptionDoc._id, {
        lastUsedAt: new Date(),
        lastError: String(reason).slice(0, 500)
      });
    }

    console.error('Eroare sendNotificationToSubscription:', reason);
    return { success: false, error: reason, statusCode };
  }
}

async function sendNotificationToUser(userId, payload = {}) {
  const subscriptions = await PushSubscription.find({ userId, active: true }).lean();

  if (!subscriptions.length) {
    return { success: true, delivered: 0, total: 0 };
  }

  let delivered = 0;

  for (const subscription of subscriptions) {
    const result = await sendNotificationToSubscription(subscription, payload);
    if (result.success) delivered += 1;
  }

  return {
    success: delivered > 0,
    delivered,
    total: subscriptions.length
  };
}

module.exports = {
  isConfigured,
  ensureConfigured,
  sendNotificationToSubscription,
  sendNotificationToUser,
  VAPID_PUBLIC_KEY
};
