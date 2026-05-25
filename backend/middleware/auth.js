// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const extractToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acces neautorizat. Te rugăm să te autentifici.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Folosim findById fără .lean() — păstrează metodele Mongoose și .id virtual
    const user = await User.findById(decoded.id).select('-parola');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizatorul nu mai există.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.activ) {
      return res.status(401).json({
        success: false,
        message: 'Contul tău a fost dezactivat.',
        code: 'ACCOUNT_DISABLED'
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
        message: 'Sesiunea a expirat.',
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

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    console.warn(`⚠️ Acces admin refuzat: ${req.user?.email} de la ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Acces interzis.'
    });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-parola');
      if (user?.activ) req.user = user;
    }
  } catch {
    // ignorăm
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
