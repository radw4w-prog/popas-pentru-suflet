const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifică dacă utilizatorul este autentificat
const protect = async (req, res, next) => {
  try {
    let token;

    // Caută token în header
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Caută token în cookie (fallback)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acces neautorizat. Te rugăm să te autentifici.'
      });
    }

    // Verifică token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Găsește userul
    const user = await User.findById(decoded.id).select('-parola');

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
        message: 'Token invalid.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesiunea a expirat. Te rugăm să te autentifici din nou.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Eroare server la autentificare.'
    });
  }
};

// Verifică dacă utilizatorul este admin
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acces interzis. Doar administratorii pot accesa această resursă.'
    });
  }
  next();
};

// Middleware opțional - nu blochează, doar atașează userul dacă există token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-parola');
      if (user && user.activ) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignorăm eroarea - userul rămâne null
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };