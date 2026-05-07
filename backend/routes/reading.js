const express = require('express');
const router = express.Router();
const ReadingProgress = require('../models/ReadingProgress');
const ReadingPlan = require('../models/ReadingPlan');
const Verse = require('../models/Verse');
const { protect, optionalAuth } = require('../middleware/auth');
const { checkMilestoneAfterMark } = require('../services/notificationService');

// ═══════════════════════════════════════
// ORDINEA BIBLIEI - toate 1189 capitole
// ═══════════════════════════════════════
const ORDINE_BIBLIE = [
  { carte: 'Geneza', abreviere: 'Gen', capitole: 50, ordine: 1, testament: 'VT' },
  { carte: 'Exodul', abreviere: 'Ex', capitole: 40, ordine: 2, testament: 'VT' },
  { carte: 'Leviticul', abreviere: 'Lev', capitole: 27, ordine: 3, testament: 'VT' },
  { carte: 'Numeri', abreviere: 'Num', capitole: 36, ordine: 4, testament: 'VT' },
  { carte: 'Deuteronomul', abreviere: 'Deut', capitole: 34, ordine: 5, testament: 'VT' },
  { carte: 'Iosua', abreviere: 'Ios', capitole: 24, ordine: 6, testament: 'VT' },
  { carte: 'Judecători', abreviere: 'Jud', capitole: 21, ordine: 7, testament: 'VT' },
  { carte: 'Rut', abreviere: 'Rut', capitole: 4, ordine: 8, testament: 'VT' },
  { carte: '1 Samuel', abreviere: '1Sam', capitole: 31, ordine: 9, testament: 'VT' },
  { carte: '2 Samuel', abreviere: '2Sam', capitole: 24, ordine: 10, testament: 'VT' },
  { carte: '1 Împărați', abreviere: '1Imp', capitole: 22, ordine: 11, testament: 'VT' },
  { carte: '2 Împărați', abreviere: '2Imp', capitole: 25, ordine: 12, testament: 'VT' },
  { carte: '1 Cronici', abreviere: '1Cron', capitole: 29, ordine: 13, testament: 'VT' },
  { carte: '2 Cronici', abreviere: '2Cron', capitole: 36, ordine: 14, testament: 'VT' },
  { carte: 'Ezra', abreviere: 'Ezra', capitole: 10, ordine: 15, testament: 'VT' },
  { carte: 'Neemia', abreviere: 'Neem', capitole: 13, ordine: 16, testament: 'VT' },
  { carte: 'Estera', abreviere: 'Est', capitole: 10, ordine: 17, testament: 'VT' },
  { carte: 'Iov', abreviere: 'Iov', capitole: 42, ordine: 18, testament: 'VT' },
  { carte: 'Psalmii', abreviere: 'Ps', capitole: 150, ordine: 19, testament: 'VT' },
  { carte: 'Proverbe', abreviere: 'Prov', capitole: 31, ordine: 20, testament: 'VT' },
  { carte: 'Eclesiastul', abreviere: 'Ecl', capitole: 12, ordine: 21, testament: 'VT' },
  { carte: 'Cântarea Cântărilor', abreviere: 'Cant', capitole: 8, ordine: 22, testament: 'VT' },
  { carte: 'Isaia', abreviere: 'Isa', capitole: 66, ordine: 23, testament: 'VT' },
  { carte: 'Ieremia', abreviere: 'Ier', capitole: 52, ordine: 24, testament: 'VT' },
  { carte: 'Plângerile lui Ieremia', abreviere: 'Plang', capitole: 5, ordine: 25, testament: 'VT' },
  { carte: 'Ezechiel', abreviere: 'Ezec', capitole: 48, ordine: 26, testament: 'VT' },
  { carte: 'Daniel', abreviere: 'Dan', capitole: 12, ordine: 27, testament: 'VT' },
  { carte: 'Osea', abreviere: 'Osea', capitole: 14, ordine: 28, testament: 'VT' },
  { carte: 'Ioel', abreviere: 'Ioel', capitole: 3, ordine: 29, testament: 'VT' },
  { carte: 'Amos', abreviere: 'Amos', capitole: 9, ordine: 30, testament: 'VT' },
  { carte: 'Obadia', abreviere: 'Obad', capitole: 1, ordine: 31, testament: 'VT' },
  { carte: 'Iona', abreviere: 'Iona', capitole: 4, ordine: 32, testament: 'VT' },
  { carte: 'Mica', abreviere: 'Mica', capitole: 7, ordine: 33, testament: 'VT' },
  { carte: 'Naum', abreviere: 'Naum', capitole: 3, ordine: 34, testament: 'VT' },
  { carte: 'Habacuc', abreviere: 'Hab', capitole: 3, ordine: 35, testament: 'VT' },
  { carte: 'Ţefania', abreviere: 'Tef', capitole: 3, ordine: 36, testament: 'VT' },
  { carte: 'Hagai', abreviere: 'Hag', capitole: 2, ordine: 37, testament: 'VT' },
  { carte: 'Zaharia', abreviere: 'Zah', capitole: 14, ordine: 38, testament: 'VT' },
  { carte: 'Maleahi', abreviere: 'Mal', capitole: 4, ordine: 39, testament: 'VT' },
  { carte: 'Matei', abreviere: 'Mat', capitole: 28, ordine: 40, testament: 'NT' },
  { carte: 'Marcu', abreviere: 'Mar', capitole: 16, ordine: 41, testament: 'NT' },
  { carte: 'Luca', abreviere: 'Luc', capitole: 24, ordine: 42, testament: 'NT' },
  { carte: 'Ioan', abreviere: 'Ioan', capitole: 21, ordine: 43, testament: 'NT' },
  { carte: 'Faptele Apostolilor', abreviere: 'Fapt', capitole: 28, ordine: 44, testament: 'NT' },
  { carte: 'Romani', abreviere: 'Rom', capitole: 16, ordine: 45, testament: 'NT' },
  { carte: '1 Corinteni', abreviere: '1Cor', capitole: 16, ordine: 46, testament: 'NT' },
  { carte: '2 Corinteni', abreviere: '2Cor', capitole: 13, ordine: 47, testament: 'NT' },
  { carte: 'Galateni', abreviere: 'Gal', capitole: 6, ordine: 48, testament: 'NT' },
  { carte: 'Efeseni', abreviere: 'Efes', capitole: 6, ordine: 49, testament: 'NT' },
  { carte: 'Filipeni', abreviere: 'Filip', capitole: 4, ordine: 50, testament: 'NT' },
  { carte: 'Coloseni', abreviere: 'Col', capitole: 4, ordine: 51, testament: 'NT' },
  { carte: '1 Tesaloniceni', abreviere: '1Tes', capitole: 5, ordine: 52, testament: 'NT' },
  { carte: '2 Tesaloniceni', abreviere: '2Tes', capitole: 3, ordine: 53, testament: 'NT' },
  { carte: '1 Timotei', abreviere: '1Tim', capitole: 6, ordine: 54, testament: 'NT' },
  { carte: '2 Timotei', abreviere: '2Tim', capitole: 4, ordine: 55, testament: 'NT' },
  { carte: 'Tit', abreviere: 'Tit', capitole: 3, ordine: 56, testament: 'NT' },
  { carte: 'Filimon', abreviere: 'Flm', capitole: 1, ordine: 57, testament: 'NT' },
  { carte: 'Evrei', abreviere: 'Evr', capitole: 13, ordine: 58, testament: 'NT' },
  { carte: 'Iacov', abreviere: 'Iac', capitole: 5, ordine: 59, testament: 'NT' },
  { carte: '1 Petru', abreviere: '1Pet', capitole: 5, ordine: 60, testament: 'NT' },
  { carte: '2 Petru', abreviere: '2Pet', capitole: 3, ordine: 61, testament: 'NT' },
  { carte: '1 Ioan', abreviere: '1Ioan', capitole: 5, ordine: 62, testament: 'NT' },
  { carte: '2 Ioan', abreviere: '2Ioan', capitole: 1, ordine: 63, testament: 'NT' },
  { carte: '3 Ioan', abreviere: '3Ioan', capitole: 1, ordine: 64, testament: 'NT' },
  { carte: 'Iuda', abreviere: 'Iuda', capitole: 1, ordine: 65, testament: 'NT' },
  { carte: 'Apocalipsa', abreviere: 'Apoc', capitole: 22, ordine: 66, testament: 'NT' },
];

// Generează lista completă a celor 1189 capitole în ordine
function getCapitoleInOrdine() {
  const lista = [];
  let index = 0;
  for (const carte of ORDINE_BIBLIE) {
    for (let cap = 1; cap <= carte.capitole; cap++) {
      lista.push({
        index,
        carte: carte.carte,
        abreviere: carte.abreviere,
        capitol: cap,
        ordineCarte: carte.ordine,
        testament: carte.testament
      });
      index++;
    }
  }
  return lista;
}

const TOATE_CAPITOLELE = getCapitoleInOrdine();

// ─────────────────────────────────────────────
// GET /api/reading/ordine
// Returnează ordinea completă a Bibliei
// ─────────────────────────────────────────────
router.get('/ordine', (req, res) => {
  res.json({
    success: true,
    carti: ORDINE_BIBLIE,
    totalCapitole: TOATE_CAPITOLELE.length
  });
});

// ─────────────────────────────────────────────
// GET /api/reading/plan
// Returnează planul utilizatorului
// ─────────────────────────────────────────────
router.get('/plan', protect, async (req, res) => {
  try {
    const plan = await ReadingPlan.findOne({ userId: req.user._id });

    if (!plan) {
      return res.json({ success: true, plan: null });
    }

    // Calculează statistici plan
    const azi = new Date();
    azi.setHours(0, 0, 0, 0);
    const dataStart = new Date(plan.dataStart);
    dataStart.setHours(0, 0, 0, 0);
    const dataFinal = new Date(plan.dataFinal);

    const zileTrecute = Math.max(0, Math.floor((azi - dataStart) / 86400000));
    const zileRamase = Math.max(0, Math.floor((dataFinal - azi) / 86400000));
    const zileTotal = Math.floor((dataFinal - dataStart) / 86400000);

    // Capitole citite
    const citite = await ReadingProgress.countDocuments({
      userId: req.user._id
    });

    // Capitole așteptate până azi
    const capitoleAsteptate = Math.min(
      (zileTrecute + 1) * plan.capitolePerZi,
      1189
    );

    const intarziere = Math.max(0, capitoleAsteptate - citite);
    const inainte = Math.max(0, citite - capitoleAsteptate);

    res.json({
      success: true,
      plan: {
        ...plan.toObject(),
        zileTrecute,
        zileRamase,
        zileTotal,
        capitoleCitite: citite,
        capitoleAsteptate,
        intarziere,
        inainte,
        procent: Math.round((citite / 1189) * 1000) / 10
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/reading/plan
// Creează sau actualizează planul
// ─────────────────────────────────────────────
router.post('/plan', protect, async (req, res) => {
  try {
    const { dataStart, dataFinal } = req.body;

    if (!dataStart || !dataFinal) {
      return res.status(400).json({
        success: false,
        message: 'Data start și data final sunt obligatorii.'
      });
    }

    const start = new Date(dataStart);
    const final = new Date(dataFinal);

    if (final <= start) {
      return res.status(400).json({
        success: false,
        message: 'Data finală trebuie să fie după data de start.'
      });
    }

    const zileTotale = Math.floor((final - start) / 86400000);
    const capitolePerZi = Math.max(1, Math.ceil(1189 / zileTotale));

    const plan = await ReadingPlan.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        dataStart: start,
        dataFinal: final,
        capitolePerZi,
        totalCapitole: 1189,
        activ: true
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      plan,
      message: `Plan creat! ${capitolePerZi} capitol(e)/zi timp de ${zileTotale} zile.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/reading/plan
// Șterge planul curent
// ─────────────────────────────────────────────
router.delete('/plan', protect, async (req, res) => {
  try {
    await ReadingPlan.deleteOne({ userId: req.user._id });
    res.json({ success: true, message: 'Planul a fost șters.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reading/progress
// Progres general + per carte
// ─────────────────────────────────────────────
router.get('/progress', protect, async (req, res) => {
  try {
    const totalCapitole = 1189;

    const cititeRaw = await ReadingProgress.find({
      userId: req.user._id
    }).lean();

    const citite = cititeRaw.length;
    const procent = Math.round((citite / totalCapitole) * 1000) / 10;

    // Per carte
    const perCarte = {};
    for (const entry of cititeRaw) {
      if (!perCarte[entry.carte]) perCarte[entry.carte] = [];
      perCarte[entry.carte].push(entry.capitol);
    }

    // Ultimele citite
    const ultimeleCitite = cititeRaw
      .sort((a, b) => new Date(b.cititLa) - new Date(a.cititLa))
      .slice(0, 10);

    res.json({
      success: true,
      totalCapitole,
      capitoleCitite: citite,
      procent,
      ultimeleCitite,
      perCarte
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reading/today
// Capitolele de citit azi conform planului
// ─────────────────────────────────────────────
router.get('/today', protect, async (req, res) => {
  try {
    const plan = await ReadingPlan.findOne({ userId: req.user._id });

    if (!plan) {
      return res.json({
        success: true,
        plan: null,
        capitole: [],
        message: 'Nu ai un plan activ.'
      });
    }

    const azi = new Date();
    azi.setHours(0, 0, 0, 0);
    const dataStart = new Date(plan.dataStart);
    dataStart.setHours(0, 0, 0, 0);

    const ziuaCurenta = Math.floor((azi - dataStart) / 86400000);

    if (ziuaCurenta < 0) {
      return res.json({
        success: true,
        capitole: [],
        message: 'Planul nu a început încă.',
        dataStart: plan.dataStart
      });
    }

    // Calculează ce capitole sunt pentru ziua curentă
    const indexStart = ziuaCurenta * plan.capitolePerZi;
    const indexEnd = Math.min(indexStart + plan.capitolePerZi, 1189);

    if (indexStart >= 1189) {
      return res.json({
        success: true,
        capitole: [],
        message: 'Felicitări! Ai terminat planul de citire! 🎉',
        terminat: true
      });
    }

    const capitoleAzi = TOATE_CAPITOLELE.slice(indexStart, indexEnd);

    // Verifică care sunt deja citite
    const cititeAzi = await ReadingProgress.find({
      userId: req.user._id,
      $or: capitoleAzi.map(c => ({
        carte: c.carte,
        capitol: c.capitol
      }))
    }).lean();

    const cititeSet = new Set(
      cititeAzi.map(c => `${c.carte}_${c.capitol}`)
    );

    const capitoleCuStatus = capitoleAzi.map(c => ({
      ...c,
      citit: cititeSet.has(`${c.carte}_${c.capitol}`)
    }));

    const toateCitite = capitoleCuStatus.every(c => c.citit);

    res.json({
      success: true,
      ziuaCurenta: ziuaCurenta + 1,
      capitole: capitoleCuStatus,
      toateCititeAzi: toateCitite,
      totalAzi: capitoleAzi.length,
      citesteAzi: capitoleCuStatus.filter(c => !c.citit).length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reading/mark
router.post('/mark', protect, async (req, res) => {
  try {
    const { carte, capitol, abreviere } = req.body;

    if (!carte || !capitol) {
      return res.status(400).json({
        success: false,
        message: 'Carte și capitol sunt obligatorii.'
      });
    }

    const carteInfo = ORDINE_BIBLIE.find(c => c.carte === carte);
    const ordineBiblie = carteInfo ? (carteInfo.ordine * 1000 + capitol) : 0;

    const existing = await ReadingProgress.findOne({
      userId: req.user._id,
      carte,
      capitol: Number(capitol)
    });

    if (existing) {
      await ReadingProgress.deleteOne({ _id: existing._id });
      res.json({
        success: true,
        action: 'unmarked',
        message: `${carte} ${capitol} — demarcat`
      });
    } else {
      await ReadingProgress.create({
        userId: req.user._id,
        carte,
        abreviere: abreviere || carteInfo?.abreviere || '',
        capitol: Number(capitol),
        ordineBiblie,
        citit: true,
        cititLa: new Date()
      });

      const totalCitite = await ReadingProgress.countDocuments({
        userId: req.user._id
      });

      const procent = Math.round((totalCitite / 1189) * 100);

      // Verifică milestone în background
      checkMilestoneAfterMark(req.user._id, totalCitite).catch(console.error);
	  // Hook spiritual journey
const { markDailyActivity } = require('../utils/spiritualJourneyService');
markDailyActivity(req.user._id, 'citire', { capitoleCitite: 1 }).catch(console.error);

      res.json({
        success: true,
        action: 'marked',
        message: `${carte} ${capitol} — citit! ✅`,
        totalCitite,
        procent
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/reading/mark-today
// Marchează toate capitolele de azi ca citite
// ─────────────────────────────────────────────
router.post('/mark-today', protect, async (req, res) => {
  try {
    const plan = await ReadingPlan.findOne({ userId: req.user._id });

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Nu ai un plan activ.'
      });
    }

    const azi = new Date();
    azi.setHours(0, 0, 0, 0);
    const dataStart = new Date(plan.dataStart);
    dataStart.setHours(0, 0, 0, 0);
    const ziuaCurenta = Math.floor((azi - dataStart) / 86400000);

    const indexStart = ziuaCurenta * plan.capitolePerZi;
    const indexEnd = Math.min(indexStart + plan.capitolePerZi, 1189);
    const capitoleAzi = TOATE_CAPITOLELE.slice(indexStart, indexEnd);

    let marcate = 0;
    for (const cap of capitoleAzi) {
      const carteInfo = ORDINE_BIBLIE.find(c => c.carte === cap.carte);
      const ordineBiblie = carteInfo ? (carteInfo.ordine * 1000 + cap.capitol) : 0;

      try {
        await ReadingProgress.findOneAndUpdate(
          { userId: req.user._id, carte: cap.carte, capitol: cap.capitol },
          {
            userId: req.user._id,
            carte: cap.carte,
            abreviere: cap.abreviere,
            capitol: cap.capitol,
            ordineBiblie,
            citit: true,
            cititLa: new Date()
          },
          { upsert: true }
        );
        marcate++;
      } catch (e) {
        // Skip duplicate
      }
    }

    const totalCitite = await ReadingProgress.countDocuments({
      userId: req.user._id
    });

    res.json({
      success: true,
      marcate,
      message: `${marcate} capitol(e) marcate ca citite! ✅`,
      totalCitite,
      procent: Math.round((totalCitite / 1189) * 100)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reading/capitol/:carte/:capitol
// Textul unui capitol complet
// ─────────────────────────────────────────────
router.get('/capitol/:carte/:capitol', optionalAuth, async (req, res) => {
  try {
    const { carte, capitol } = req.params;
    const numCapitol = parseInt(capitol);

    const versete = await Verse.find({
      carte: decodeURIComponent(carte),
      capitol: numCapitol
    })
      .sort({ verset: 1 })
      .lean();

    if (!versete.length) {
      return res.status(404).json({
        success: false,
        message: 'Capitol negăsit.'
      });
    }

    // Verifică dacă e citit (dacă user logat)
    let citit = false;
    if (req.user) {
      const progress = await ReadingProgress.findOne({
        userId: req.user._id,
        carte: decodeURIComponent(carte),
        capitol: numCapitol
      });
      citit = !!progress;
    }

    // Info carte
    const carteInfo = ORDINE_BIBLIE.find(
      c => c.carte === decodeURIComponent(carte)
    );

    // Capitol anterior și următor
    const indexCurent = TOATE_CAPITOLELE.findIndex(
      c => c.carte === decodeURIComponent(carte) && c.capitol === numCapitol
    );

    const anterior = indexCurent > 0 ? TOATE_CAPITOLELE[indexCurent - 1] : null;
    const urmator = indexCurent < 1188 ? TOATE_CAPITOLELE[indexCurent + 1] : null;

    res.json({
      success: true,
      carte: decodeURIComponent(carte),
      capitol: numCapitol,
      versete,
      totalVersete: versete.length,
      citit,
      abreviere: carteInfo?.abreviere || '',
      testament: carteInfo?.testament || '',
      navigare: { anterior, urmator }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reading/carti
// Lista cărților cu progres per user
// ─────────────────────────────────────────────
router.get('/carti', protect, async (req, res) => {
  try {
    const cititeRaw = await ReadingProgress.find({
      userId: req.user._id
    }).lean();

    const perCarte = {};
    for (const entry of cititeRaw) {
      if (!perCarte[entry.carte]) perCarte[entry.carte] = 0;
      perCarte[entry.carte]++;
    }

    const carti = ORDINE_BIBLIE.map(carte => ({
      ...carte,
      capitoleCitite: perCarte[carte.carte] || 0,
      procent: Math.round(
        ((perCarte[carte.carte] || 0) / carte.capitole) * 100
      ),
      terminata: (perCarte[carte.carte] || 0) >= carte.capitole
    }));

    res.json({
      success: true,
      carti,
      totalCitite: cititeRaw.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reading/calendar
// Ultimele 30 zile de citire
// ─────────────────────────────────────────────
router.get('/calendar', protect, async (req, res) => {
  try {
    const acum30Zile = new Date();
    acum30Zile.setDate(acum30Zile.getDate() - 29);
    acum30Zile.setHours(0, 0, 0, 0);

    const citite = await ReadingProgress.find({
      userId: req.user._id,
      cititLa: { $gte: acum30Zile }
    }).lean();

    // Grupare pe zile
    const perZi = {};
    for (const entry of citite) {
      const zi = new Date(entry.cititLa);
      zi.setHours(0, 0, 0, 0);
      const key = zi.toISOString().split('T')[0];
      if (!perZi[key]) perZi[key] = 0;
      perZi[key]++;
    }

    // Generează ultimele 30 zile
    const zile = [];
    for (let i = 29; i >= 0; i--) {
      const zi = new Date();
      zi.setDate(zi.getDate() - i);
      zi.setHours(0, 0, 0, 0);
      const key = zi.toISOString().split('T')[0];
      zile.push({
        data: key,
        capitole: perZi[key] || 0,
        citit: (perZi[key] || 0) > 0
      });
    }

    res.json({
      success: true,
      zile,
      streakCurent: calculeazaStreak(zile),
      totalZileCuCitire: zile.filter(z => z.citit).length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function calculeazaStreak(zile) {
  let streak = 0;
  const ziInversat = [...zile].reverse();
  for (const zi of ziInversat) {
    if (zi.citit) streak++;
    else break;
  }
  return streak;
}

// ─────────────────────────────────────────────
// GET /api/reading/suggest (backward compat)
// ─────────────────────────────────────────────
router.get('/suggest', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      const plan = await ReadingPlan.findOne({ userId: req.user._id });
      if (plan) {
        const azi = new Date();
        azi.setHours(0, 0, 0, 0);
        const dataStart = new Date(plan.dataStart);
        dataStart.setHours(0, 0, 0, 0);
        const ziuaCurenta = Math.floor((azi - dataStart) / 86400000);
        const indexStart = Math.max(0, ziuaCurenta * plan.capitolePerZi);
        const cap = TOATE_CAPITOLELE[indexStart] || TOATE_CAPITOLELE[0];
        return res.json({
          carte: cap.carte,
          capitol: cap.capitol,
          descriere: `Ziua ${ziuaCurenta + 1} din planul tău`
        });
      }
    }

    // Fallback pentru vizitatori
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    const cap = TOATE_CAPITOLELE[dayOfYear % 1189];
    res.json({
      carte: cap.carte,
      capitol: cap.capitol,
      descriere: 'Sugestie zilnică'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;