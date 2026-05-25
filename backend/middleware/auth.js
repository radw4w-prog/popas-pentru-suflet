// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: extrage token din request ─────────────────────────
const extractToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
};

// ── Verifică dacă utilizatorul este autentificat ──────────────
const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acces neautorizat. Te rugăm să te autentifici.'
      });
    }

    // Verifică token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifică că token-ul nu e prea vechi (max 7 zile)
    const tokenAge = Date.now() / 1000 - decoded.iat;
    if (tokenAge > 7 * 24 * 60 * 60) {
      return res.status(401).json({
        success: false,
        message: 'Sesiunea a expirat. Te rugăm să te autentifici din nou.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Găsește userul
    const user = await User.findById(decoded.id).select('-parola').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizatorul nu mai există.'
      });
    }

    if (!user.activ) {
      return res.status(401).json({
        success: false,
        message: 'Contul tău a fost dezactivat. Contactează administratorul.'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalid.',
        code: 'TOKEN_INVALID'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesiunea a expirat. Te rugăm să te autentifici din nou.',
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Eroare server la autentificare.'
    });
  }
};

// ── Verifică dacă utilizatorul este admin ─────────────────────
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    console.warn(`⚠️ Acces admin refuzat pentru user: ${req.user?.email} de la ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Acces interzis.'
    });
  }
  next();
};

// ── Auth opțional ─────────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-parola').lean();
      if (user?.activ) req.user = user;
    }
  } catch {
    // Ignorăm eroarea
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
