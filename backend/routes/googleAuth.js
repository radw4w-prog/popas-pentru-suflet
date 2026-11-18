const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const router = express.Router();
const client = new OAuth2Client();
const limiter = rateLimit({windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false,
  message: {success: false, message: 'Prea multe încercări. Reîncearcă mai târziu.'}});

router.post('/', limiter, async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({success: false, message: 'Autentificarea Google nu este configurată.'});
  const {credential} = req.body || {};
  if (typeof credential !== 'string' || credential.length < 20 || credential.length > 16000) {
    return res.status(400).json({success: false, message: 'Date de autentificare Google invalide.'});
  }
  let profile;
  try {
    const ticket = await client.verifyIdToken({idToken: credential, audience: process.env.GOOGLE_CLIENT_ID});
    profile = ticket.getPayload();
    if (!profile?.sub || !profile.email || profile.email_verified !== true ||
        !['accounts.google.com', 'https://accounts.google.com'].includes(profile.iss)) throw new Error('Invalid identity');
  } catch (_) {
    return res.status(401).json({success: false, message: 'Autentificarea Google nu a putut fi verificată. Încearcă din nou.'});
  }
  try {
    let user = await User.findOne({googleId: profile.sub});
    if (!user) {
      // Never silently merge an existing password/Facebook account by email.
      const existing = await User.findOne({email: profile.email.trim().toLowerCase()});
      if (existing) return res.status(409).json({success: false, message: 'Există deja un cont cu această adresă. Folosește metoda de autentificare existentă sau resetarea parolei. Asocierea Google nu se face automat.'});
      let name = String(profile.name || profile.email.split('@')[0]).trim().slice(0, 50);
      if (name.length < 2) name = 'Utilizator Google';
      user = await User.create({googleId: profile.sub, email: profile.email.trim().toLowerCase(),
        nume: name, avatar: typeof profile.picture === 'string' && profile.picture.startsWith('https://') ? profile.picture : null,
        rol: 'user', activ: true});
    }
    if (!user.activ) return res.status(403).json({success: false, message: 'Contul este dezactivat. Contactează administratorul.'});
    user.lastLogin = new Date();
    await user.save({validateBeforeSave: false});
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '24h'});
    res.set('Cache-Control', 'no-store');
    return res.json({success: true, token, user: {id: user._id, nume: user.nume, email: user.email,
      rol: user.rol, avatar: user.avatar, setari: user.setari, lastLogin: user.lastLogin}});
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({success: false, message: 'Contul a fost creat sau asociat între timp. Reîncearcă autentificarea.'});
    // No credentials, profile, request or token in logs.
    console.error('Google auth: account operation failed');
    return res.status(500).json({success: false, message: 'Nu am putut finaliza autentificarea. Reîncearcă.'});
  }
});
module.exports = router;
