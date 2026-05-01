const GenerationLog = require('../models/GenerationLog');

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextMidnight() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d;
}

async function checkGenerateLimit(req, res, next) {
  try {
    // ADMIN = nelimitat
    if (req.user && req.user.rol === 'admin') {
      req.limitInfo = {
        type: 'admin',
        limit: null,
        used: 0,
        remaining: null
      };
      return next();
    }

    // USER LOGAT = 5 / oră
    if (req.user) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const used = await GenerationLog.countDocuments({
        userId: req.user._id,
        type: 'user',
        action: 'generate',
        createdAt: { $gte: oneHourAgo }
      });

      if (used >= 5) {
        return res.status(429).json({
          success: false,
          message: 'Ai atins limita de 5 generări/oră. Încearcă din nou mai târziu.',
          type: 'user',
          limit: 5,
          used,
          remaining: 0
        });
      }

      req.limitInfo = {
        type: 'user',
        limit: 5,
        used,
        remaining: 5 - used
      };

      return next();
    }

    // GUEST = 3 / zi
    const ip = getClientIp(req);
    const today = startOfToday();

    const used = await GenerationLog.countDocuments({
      ip,
      type: 'guest',
      action: 'generate',
      createdAt: { $gte: today }
    });

    if (used >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Ai atins limita de 3 generări/zi. Creează un cont gratuit pentru mai multe generări.',
        type: 'guest',
        limit: 3,
        used,
        remaining: 0,
        needAccount: true
      });
    }

    req.limitInfo = {
      type: 'guest',
      limit: 3,
      used,
      remaining: 3 - used,
      ip
    };

    next();
  } catch (error) {
    console.error('Eroare checkGenerateLimit:', error.message);
    next();
  }
}

async function registerGeneration(req, meta = {}) {
  const ip = getClientIp(req);

  const doc = {
    action: 'generate',
    ip,
    userAgent: req.headers['user-agent'] || null,
    meta: {
      tema: meta.tema || '',
      platform: meta.platform || ''
    }
  };

  if (req.user?.rol === 'admin') {
    doc.type = 'admin';
    doc.userId = req.user._id;
  } else if (req.user) {
    doc.type = 'user';
    doc.userId = req.user._id;
  } else {
    doc.type = 'guest';
  }

  await GenerationLog.create(doc);
}

async function getGenerateStatus(req, res) {
  try {
    // ADMIN
    if (req.user && req.user.rol === 'admin') {
      return res.json({
        success: true,
        type: 'admin',
        limit: null,
        used: 0,
        remaining: null,
        label: 'Nelimitat'
      });
    }

    // USER
    if (req.user) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const used = await GenerationLog.countDocuments({
        userId: req.user._id,
        type: 'user',
        action: 'generate',
        createdAt: { $gte: oneHourAgo }
      });

      return res.json({
        success: true,
        type: 'user',
        limit: 5,
        used,
        remaining: Math.max(0, 5 - used),
        resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      });
    }

    // GUEST
    const ip = getClientIp(req);
    const today = startOfToday();

    const used = await GenerationLog.countDocuments({
      ip,
      type: 'guest',
      action: 'generate',
      createdAt: { $gte: today }
    });

    return res.json({
      success: true,
      type: 'guest',
      limit: 3,
      used,
      remaining: Math.max(0, 3 - used),
      resetAt: nextMidnight().toISOString()
    });
  } catch (error) {
    console.error('Eroare getGenerateStatus:', error.message);
    res.status(500).json({
      success: false,
      message: 'Eroare la verificarea limitelor.'
    });
  }
}

module.exports = {
  checkGenerateLimit,
  registerGeneration,
  getGenerateStatus
};