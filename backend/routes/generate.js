const express = require('express');
const router = express.Router();
const Verse = require('../models/Verse');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, optionalAuth } = require('../middleware/auth');
const { checkGenerateLimit, getGenerateStatus, registerGeneration } = require('../middleware/rateLimit');
const geminiService = require('../services/geminiService');




const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

// ✅ TEST ROUTE
router.get('/ai/test', async (req, res) => {
  try {
    console.log('🧪 Test Gemini - Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🧪 Key preview:', process.env.GEMINI_API_KEY?.substring(0, 15));
    
    if (!geminiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'AI nu este configurat. Adaugă GEMINI_API_KEY în .env'
      });
    }
    
    const result = await geminiService.testConnection();
    res.json(result);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

let Description = null;
try {
  Description = require('../models/Description');
} catch (e) {
  console.log('ℹ️ Model Description nu exista încă - folosesc fallback local');
}

// ═══════════════════════════════════════
// ÎNCĂRCARE TEMPLATE-URI DIN templates.json
// ═══════════════════════════════════════
let TEMPLATES_BUILTIN = [];

try {
  const tplPath = path.join(__dirname, '../data/templates.json');
  if (fs.existsSync(tplPath)) {
    const tplData = JSON.parse(fs.readFileSync(tplPath, 'utf8'));
    TEMPLATES_BUILTIN = tplData.templates || [];
    console.log(`✅ ${TEMPLATES_BUILTIN.length} template-uri încărcate din templates.json`);
  } else {
    console.log('⚠️ templates.json nu există');
  }
} catch (e) {
  console.error('❌ Eroare încărcare templates.json:', e.message);
  TEMPLATES_BUILTIN = [];
}

// ═══════════════════════════════════════
// MULTER - UPLOAD TEMPLATE-URI CUSTOM
// ═══════════════════════════════════════
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/templates');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);
    ok ? cb(null, true) : cb(new Error('Doar JPG/PNG/WEBP'));
  }
});

// ═══════════════════════════════════════
// FALLBACK DESCRIERI
// ═══════════════════════════════════════
const DESCRIERI_FALLBACK = {
  dragoste: [
    'Dragostea lui Dumnezeu este nesfârșită și necondiționată. Astăzi, lasă-te cuprins de această dragoste divină! 💖',
    'Nu există forță mai mare decât dragostea lui Dumnezeu pentru tine. El te iubește complet și pentru totdeauna! ❤️',
    'Când simți că nu ești de ajuns, amintește-ți: Dumnezeu te-a iubit înainte să te naști. 🌟'
  ],
  credinta: [
    'Credința nu înseamnă absența îndoielii, ci alegerea de a merge înainte chiar și când nu vezi calea. 🙏',
    'Cu Dumnezeu, imposibilul devine posibil. Fă astăzi un pas de credință! ✨',
    'Credința ta, oricât de mică, poate muta munți. Nu renunța! 🏔️'
  ],
  pace: [
    'Pacea lui Dumnezeu întrece orice pricepere. Odihnește-te în prezența Lui astăzi. 🕊️',
    'Adevărata pace vine când Îi încredințezi lui Dumnezeu toate grijile tale. 💙',
    'Chiar și în furtună, Dumnezeu rămâne ancora sufletului tău. 🌊'
  ],
  bucurie: [
    'Bucuria în Domnul este puterea ta. Alege astăzi să te bucuri în El! 😊',
    'Bucuria creștinului nu depinde de împrejurări, ci de prezența lui Dumnezeu. 🎉',
    'Astăzi este o zi făcută de Domnul — bucură-te și veselește-te în ea! 🌅'
  ],
  speranta: [
    'Speranța creștinului este sigură, pentru că se bazează pe promisiunile lui Dumnezeu. 🌈',
    'Chiar și în cele mai grele momente, Dumnezeu lucrează pentru binele tău. 💫',
    'Viitorul tău este în mâinile lui Dumnezeu. Și acele mâini sunt credincioase. 🙏'
  ],
  rugaciune: [
    'Rugăciunea este puntea dintre problema ta și puterea lui Dumnezeu. 🙌',
    'Nu există rugăciune prea mică sau prea mare pentru Dumnezeu. El te ascultă. ❤️',
    'Petrece timp în prezența lui Dumnezeu și vei vedea cum inima ta se schimbă. 🙏'
  ],
  iertare: [
    'Iertarea aduce libertate sufletului. Lasă-L pe Dumnezeu să vindece ceea ce te apasă. 🕊️',
    'Dumnezeu te-a iertat complet. Astăzi, extinde și tu această iertare mai departe. 💖',
    'Iertarea nu schimbă trecutul, dar eliberează viitorul. ✨'
  ],
  putere: [
    'Când ești slab, Dumnezeu este tare. Puterea Lui se vede cel mai bine în slăbiciunea noastră. 💪',
    'Nu ești singur în luptă. Dumnezeu merge cu tine în fiecare pas. ⚡',
    'Obstacolul din fața ta nu este mai mare decât Dumnezeul din tine. 🌟'
  ],
  recunostinta: [
    'Recunoștința transformă ce avem în suficient. Numără binecuvântările astăzi. 🌸',
    'Mulțumește-I lui Dumnezeu pentru fiecare respirație și fiecare zi nouă. ☀️',
    'O inimă recunoscătoare vede harul lui Dumnezeu peste tot. 💛'
  ],
  default: [
    'Dumnezeu are un plan minunat pentru viața ta. Chiar dacă acum nu îl vezi, El lucrează. 🌟',
    'Astăzi este o nouă oportunitate să trăiești prin harul lui Dumnezeu. ✨',
    'Cuvântul lui Dumnezeu rămâne adevărat în orice vreme. 📖'
  ]
};

const HASHTAGS_GENERAL = [
  '#PopasPentruSuflet',
  '#CuvantulZilei',
  '#Biblia',
  '#Credinta',
  '#Dumnezeu',
  '#Isus',
  '#Rugaciune',
  '#VersetulZilei',
  '#BisericaOnline',
  '#Romania'
];

const HASHTAGS_TEME = {
  dragoste: ['#Dragoste', '#DragosteDumnezeu', '#IubireCrestina'],
  credinta: ['#Credinta', '#CredintaInDumnezeu', '#CredintaMutaMunti'],
  pace: ['#Pace', '#PaceaLuiDumnezeu', '#LinisteSufleteasca'],
  bucurie: ['#Bucurie', '#BucurieInDomnul', '#Fericire'],
  speranta: ['#Speranta', '#Nadejde', '#ViitorCuDumnezeu'],
  rugaciune: ['#Rugaciune', '#PutereaRugaciunii', '#RoagaTe'],
  iertare: ['#Iertare', '#Har', '#VindecareInterioara'],
  putere: ['#PutereaLuiDumnezeu', '#Biruinta', '#Hristos'],
  recunostinta: ['#Recunostinta', '#Multumire', '#Binecuvantare'],
  familie: ['#Familie', '#FamilieCrestina'],
  vindecare: ['#Vindecare', '#DumnezeuVindeca'],
  intelepciune: ['#Intelepciune', '#CuvantulLuiDumnezeu']
};

const HASHTAGS_PLATFORM = {
  facebook: ['#ComunicateCrestine'],
  instagram: ['#Faith', '#BibleVerse', '#Christian', '#InstaFaith'],
  tiktok: ['#FaithTok', '#BibleTok', '#CrestinTikTok', '#fyp']
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateHashtags(tema, platform) {
  const all = [
    ...(HASHTAGS_TEME[tema?.toLowerCase()] || []),
    ...(HASHTAGS_PLATFORM[platform] || []),
    ...HASHTAGS_GENERAL
  ];
  return [...new Set(all)].slice(0, 20).join(' ');
}

async function getDescriptionsForTema(tema) {
  const temaKey = (tema || 'default').toLowerCase();

  if (Description) {
    try {
      let rows = await Description.find({ tema: temaKey, activ: true }).lean();
      if (!rows.length) {
        rows = await Description.find({ tema: 'default', activ: true }).lean();
      }
      if (rows.length) {
        return rows.map(r => r.text);
      }
    } catch (e) {
      console.log('⚠️ Nu pot citi descrieri din DB, folosesc fallback');
    }
  }

  return DESCRIERI_FALLBACK[temaKey] || DESCRIERI_FALLBACK.default;
}

async function getRelevantVerse(tema) {
  const temaKey = (tema || '').toLowerCase();

  const cuvinte = {
    dragoste: 'dragoste',
    credinta: 'credin',
    pace: 'pace',
    bucurie: 'bucuri',
    speranta: 'nadejd',
    rugaciune: 'ruga',
    iertare: 'ierta',
    putere: 'putere',
    recunostinta: 'multumi',
    familie: 'famili',
    vindecare: 'vindec',
    intelepciune: 'intelep'
  };

  const kw = cuvinte[temaKey] || temaKey;

  let verse = null;

  if (kw && kw.length >= 3) {
    const results = await Verse.aggregate([
      { $match: { text: { $regex: kw, $options: 'i' } } },
      { $sample: { size: 1 } }
    ]);
    verse = results[0];
  }

  if (!verse) {
    const count = await Verse.countDocuments();
    const random = Math.floor(Math.random() * count);
    verse = await Verse.findOne().skip(random).lean();
  }

  return {
    text: verse.text,
    referinta: verse.referinta,
    referintaCompleta: `${verse.carte} ${verse.capitol}:${verse.verset}`
  };
}


// GET /api/generate/limit-status - verifică generări rămase
router.get('/limit-status', optionalAuth, getGenerateStatus);

// ═══════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════

// GET /api/generate/templates
router.get('/templates', (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads/templates');
    let uploadate = [];

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      uploadate = files
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .map(f => ({
          id: f,
          name: f.replace(/\.[^.]+$/, ''),
          url: `/uploads/templates/${f}`,
          thumbnail: `/uploads/templates/${f}`,
          categorie: 'custom',
          custom: true
        }));
    }

    res.json({
      builtIn: TEMPLATES_BUILTIN,
      uploadate,
      total: TEMPLATES_BUILTIN.length + uploadate.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/generate/upload
router.post('/upload', upload.single('template'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Niciun fișier uploadat!' });
    }

    res.json({
      success: true,
      file: {
        id: req.file.filename,
        name: req.file.originalname,
        url: `/uploads/templates/${req.file.filename}`,
        thumbnail: `/uploads/templates/${req.file.filename}`,
        categorie: 'custom',
        custom: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/generate/templates/:filename
router.delete('/templates/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads/templates', req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fișierul nu există!' });
    }
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/generate/teme
router.get('/teme', (req, res) => {
  res.json({
    teme: [
      { id: 'dragoste', label: 'Dragoste', icon: '❤️' },
      { id: 'credinta', label: 'Credință', icon: '🙏' },
      { id: 'pace', label: 'Pace', icon: '🕊️' },
      { id: 'bucurie', label: 'Bucurie', icon: '😊' },
      { id: 'speranta', label: 'Speranță', icon: '🌈' },
      { id: 'rugaciune', label: 'Rugăciune', icon: '🙌' },
      { id: 'iertare', label: 'Iertare', icon: '💖' },
      { id: 'putere', label: 'Putere', icon: '💪' },
      { id: 'recunostinta', label: 'Recunoștință', icon: '🌸' },
      { id: 'familie', label: 'Familie', icon: '👨‍👩‍👧' },
      { id: 'vindecare', label: 'Vindecare', icon: '🌿' },
      { id: 'intelepciune', label: 'Înțelepciune', icon: '📖' }
    ]
  });
});

// POST /api/generate
// POST /api/generate
router.post('/', optionalAuth, checkGenerateLimit, async (req, res) => {
  try {
    const { tema = 'default', platform = 'facebook', versetCustom = null } = req.body;

    let verseData = null;

    if (versetCustom) {
      verseData = {
        ...versetCustom,
        referintaCompleta: versetCustom.referintaCompleta || versetCustom.referinta
      };
    } else {
      verseData = await getRelevantVerse(tema);
    }

    const descrieri = await getDescriptionsForTema(tema);
    const ref = verseData.referintaCompleta || verseData.referinta;

    const variante = shuffle(descrieri).map(text =>
      `“${verseData.text}”\n— ${ref}\n\n${text}`
    );

    const descriere = variante[0] || `“${verseData.text}”\n— ${ref}`;
    const hashtags = generateHashtags(tema, platform);

    // Log generare reușită
    await registerGeneration(req, { tema, platform });

    const remainingAfter = req.limitInfo?.type === 'admin'
      ? null
      : Math.max(0, (req.limitInfo?.limit || 0) - ((req.limitInfo?.used || 0) + 1));

    res.json({
      success: true,
      verset: verseData,
      descriere,
      hashtags,
      variante: variante.slice(0, 5),
      tema,
      platform,
      generatLa: new Date().toISOString(),
      limitInfo: {
        type: req.limitInfo?.type || 'guest',
        limit: req.limitInfo?.limit || null,
        used: req.limitInfo?.type === 'admin' ? null : (req.limitInfo.used + 1),
        remaining: remainingAfter
      }
    });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// POST /api/generate/ai
router.post('/ai', optionalAuth, checkGenerateLimit, async (req, res) => {
  try {
    const { tema = 'default', platform = 'facebook', versetCustom = null } = req.body;

    // Verifică dacă AI e configurat
    if (!geminiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'AI nu este configurat. Adaugă GEMINI_API_KEY în .env'
      });
    }

    // Obține verset
    let verseData = null;
    if (versetCustom) {
      verseData = {
        ...versetCustom,
        referintaCompleta: versetCustom.referintaCompleta || versetCustom.referinta
      };
    } else {
      verseData = await getRelevantVerse(tema);
    }

    const ref = verseData.referintaCompleta || verseData.referinta;

    // Generare AI
    console.log(`🤖 AI Generate: ${ref} | ${tema} | ${platform}`);
    const aiContent = await geminiService.generatePostContent(
      verseData.text,
      ref,
      tema,
      platform
    );

    // Log generare
    await registerGeneration(req, { tema, platform });

    const remainingAfter = req.limitInfo?.type === 'admin'
      ? null
      : Math.max(0, (req.limitInfo?.limit || 0) - ((req.limitInfo?.used || 0) + 1));

    res.json({
      success: true,
      verset: verseData,
      ai: aiContent,
      descriere: aiContent.descriere,
      hashtags: aiContent.hashtags,
      variante: [
        aiContent.descriere,
        aiContent.variantaCalda,
        aiContent.variantaPuternica
      ].filter(Boolean),
      tema,
      platform,
      generatLa: new Date().toISOString(),
      limitInfo: {
        type: req.limitInfo?.type || 'guest',
        limit: req.limitInfo?.limit || null,
        used: req.limitInfo?.type === 'admin' ? null : (req.limitInfo.used + 1),
        remaining: remainingAfter
      }
    });
  } catch (error) {
    console.error('AI Generate error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/generate/ai-status
router.get('/ai-status', (req, res) => {
  res.json({
    success: true,
    configured: geminiService.isConfigured(),
    provider: 'Google Gemini'
  });
});



module.exports = router;