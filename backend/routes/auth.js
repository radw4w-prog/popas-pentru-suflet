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

module.exports = router;