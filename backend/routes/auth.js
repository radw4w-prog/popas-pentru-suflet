const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { verifyFacebookToken } = require('../services/facebookAuthService');

// Helper generare token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Helper response cu token
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      nume: user.nume,
      email: user.email,
      rol: user.rol,
      avatar: user.avatar,
      setari: user.setari,
      lastLogin: user.lastLogin
    }
  });
};

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { nume, email, parola } = req.body;

    if (!nume || !email || !parola) {
      return res.status(400).json({
        success: false,
        message: 'Toate câmpurile sunt obligatorii.'
      });
    }

    if (parola.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Parola trebuie să aibă minim 6 caractere.'
      });
    }

    const userExistent = await User.findOne({ email: email.toLowerCase() });
    if (userExistent) {
      return res.status(400).json({
        success: false,
        message: 'Există deja un cont cu acest email.'
      });
    }

    const user = await User.create({
      nume,
      email,
      parola,
      rol: 'user'
    });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`✅ User nou înregistrat: ${email}`);

    // Email de bun venit (nu blochează răspunsul dacă eșuează)
    const { sendWelcomeEmail } = require('../services/emailService');
    sendWelcomeEmail(user).catch(() => {});

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Eroare register:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Există deja un cont cu acest email.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Eroare la crearea contului. Încearcă din nou.'
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, parola } = req.body;

    if (!email || !parola) {
      return res.status(400).json({
        success: false,
        message: 'Email și parola sunt obligatorii.'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+parola');

    if (!user) {
      // Înregistrează eșecul pentru limitatorul de brute-force
      req.app.locals.recordAuthFailure?.(email.toLowerCase(), req.app.locals.authAttempts);
      return res.status(401).json({
        success: false,
        message: 'Email sau parolă incorectă.'
      });
    }

    if (!user.parola && user.facebookId) {
      return res.status(401).json({
        success: false,
        message: 'Acest cont folosește autentificarea prin Facebook.'
      });
    }

    const parolaCorecta = await user.compareParola(parola);
    if (!parolaCorecta) {
      // Înregistrează eșecul pentru limitatorul de brute-force
      req.app.locals.recordAuthFailure?.(email.toLowerCase(), req.app.locals.authAttempts);
      return res.status(401).json({
        success: false,
        message: 'Email sau parolă incorectă.'
      });
    }

    if (!user.activ) {
      return res.status(401).json({
        success: false,
        message: 'Contul tău a fost dezactivat. Contactează administratorul.'
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`✅ Login reușit: ${email} (${user.rol})`);
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Eroare login:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare server. Încearcă din nou.'
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/facebook
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// POST /api/auth/facebook
// Login/Register securizat cu Facebook
// ─────────────────────────────────────────────
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken, userID } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token Facebook lipsă.'
      });
    }

    // Verifică tokenul direct la Facebook
    const fbProfile = await verifyFacebookToken(accessToken, userID);

    let user = await User.findOne({ facebookId: fbProfile.facebookId });

    // Dacă nu există după facebookId, caută după email
    if (!user && fbProfile.email) {
      user = await User.findOne({ email: fbProfile.email });
    }

    if (user) {
      // Dacă email-ul există deja pe alt facebookId, verificăm
      if (user.facebookId && user.facebookId !== fbProfile.facebookId) {
        return res.status(400).json({
          success: false,
          message: 'Acest email este deja asociat altui cont Facebook.'
        });
      }

      user.facebookId = fbProfile.facebookId;

      if (fbProfile.avatar) {
        user.avatar = fbProfile.avatar;
      }

      if (fbProfile.nume) {
        user.nume = fbProfile.nume;
      }

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // Creează user nou
      user = await User.create({
        nume: fbProfile.nume || 'Utilizator Facebook',
        email: fbProfile.email || `fb_${fbProfile.facebookId}@facebook.ro`,
        facebookId: fbProfile.facebookId,
        avatar: fbProfile.avatar,
        rol: 'user',
        activ: true,
        lastLogin: new Date()
      });
    }

    if (!user.activ) {
      return res.status(401).json({
        success: false,
        message: 'Contul tău a fost dezactivat.'
      });
    }

    console.log(`✅ Facebook login: ${user.email} (${user.rol})`);
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Eroare Facebook auth:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Eroare la autentificarea cu Facebook.'
    });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Eroare server.'
    });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/update-profile
// ─────────────────────────────────────────────
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { nume, setari } = req.body;
    
    const updateData = {};
    if (nume) updateData.nume = nume;
    if (setari) updateData.setari = setari;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user,
      message: 'Profilul a fost actualizat.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea profilului.'
    });
  }
});

// ─────────────────────────────────────────────
// PUT /api/auth/change-password
// ─────────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { parolaVeche, parolaNoua } = req.body;

    if (!parolaNoua || parolaNoua.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Parola nouă trebuie să aibă minim 6 caractere.'
      });
    }

    const user = await User.findById(req.user.id).select('+parola');

    if (user.parola) {
      if (!parolaVeche) {
        return res.status(400).json({
          success: false,
          message: 'Parola veche este obligatorie.'
        });
      }

      const corecta = await user.compareParola(parolaVeche);
      if (!corecta) {
        return res.status(401).json({
          success: false,
          message: 'Parola veche este incorectă.'
        });
      }
    }

    user.parola = parolaNoua;
    await user.save();

    res.json({
      success: true,
      message: 'Parola a fost schimbată cu succes.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Eroare la schimbarea parolei.'
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Deconectat cu succes.'
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// Generează token de resetare (valabil 1 oră)
// NOTĂ: trimiterea email-ului necesită configurare serviciu email
// (ex: nodemailer + SMTP). Token-ul e logat în consolă pentru dev.
// ─────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email-ul este obligatoriu.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Răspuns generic (nu dezvăluim dacă email-ul există)
    if (!user) {
      return res.json({ success: true, message: 'Dacă există un cont cu acest email, vei primi instrucțiuni de resetare.' });
    }

    // Generează token aleatoriu și stochează doar hash-ul lui
    const crypto = require('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 oră
    await user.save({ validateBeforeSave: false });

    // Trimite email cu link-ul de resetare în FUNDAL (nu blochează răspunsul)
    const { sendPasswordResetEmail } = require('../services/emailService');
    sendPasswordResetEmail(email.toLowerCase(), rawToken)
      .then((result) => {
        if (!result.sent) {
          console.log(`🔑 Reset parolă pentru ${email}: token=${rawToken} (valabil 1h) [email neconfigurat]`);
        }
      })
      .catch(() => {});

    res.json({ success: true, message: 'Dacă există un cont cu acest email, vei primi instrucțiuni de resetare.' });
  } catch (error) {
    console.error('Eroare forgot-password:', error);
    res.status(500).json({ success: false, message: 'Eroare server. Încearcă din nou.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// Resetează parola cu token-ul primit
// ─────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, parolaNoua } = req.body;
    if (!token || !parolaNoua) {
      return res.status(400).json({ success: false, message: 'Token-ul și parola nouă sunt obligatorii.' });
    }
    if (parolaNoua.length < 6) {
      return res.status(400).json({ success: false, message: 'Parola trebuie să aibă minim 6 caractere.' });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    }).select('+resetToken +resetTokenExpiry');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token invalid sau expirat. Cere un nou link de resetare.' });
    }

    user.parola = parolaNoua; // hook-ul pre('save') face hash
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Parola a fost resetată cu succes. Te poți autentifica acum.' });
  } catch (error) {
    console.error('Eroare reset-password:', error);
    res.status(500).json({ success: false, message: 'Eroare server. Încearcă din nou.' });
  }
});

module.exports = router;