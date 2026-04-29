// backend/utils/hashtags.js

/**
 * Sistem de hashtag-uri pentru Popas pentru Suflet
 */

// Hashtag-uri de bază (folosite mereu)
const baseHashtags = [
  '#PopasPentruSuflet',
  '#VersetulZilei',
  '#CuvântulLuiDumnezeu'
];

// Hashtag-uri pe categorii
const categoryHashtags = {
  dragoste: [
    '#DragosteDivină', '#DumnezeuTeIubește', '#IubireaLuiDumnezeu',
    '#Dragoste', '#IubireFărăCondiții', '#InimaCurată'
  ],
  credință: [
    '#Credință', '#CredințăÎnDumnezeu', '#ViajaDeCredință',
    '#CredințăTare', '#PutereaCurdinței', '#CaleaCredinței'
  ],
  speranță: [
    '#Speranță', '#SperanțăÎnDumnezeu', '#NădejdeVie',
    '#ViitorCuDumnezeu', '#Nădejde', '#PromisiunileLuiDumnezeu'
  ],
  pace: [
    '#PaceaSufletului', '#PaceInterioară', '#PaceaDeLaDumnezeu',
    '#LinișteSufletească', '#PaceaLuiHristos', '#Pace'
  ],
  bucurie: [
    '#BucuriaDomnului', '#Bucurie', '#BucurieÎnHristos',
    '#FericireAdevărată', '#BucurieSufletească'
  ],
  înțelepciune: [
    '#ÎnțelepciuneDivină', '#ÎnțelepciuneaBibliei',
    '#CuvinteDeBnțelepciune', '#ProverbeZilnice'
  ],
  putere: [
    '#PutereDelasDumnezeu', '#Întărire', '#PutereaSufletului',
    '#BiruințăÎnHristos', '#TărieSufletească'
  ],
  rugăciune: [
    '#Rugăciune', '#ViajaDeRugăciune', '#TimpCuDumnezeu',
    '#RugăciuneaZilei', '#MomenteDeRugăciune'
  ],
  binecuvântare: [
    '#Binecuvântare', '#BinecuvântatDeDAumnezeu',
    '#HarulLuiDumnezeu', '#BinecuvântăriZilnice'
  ],
  mângâiere: [
    '#MângâiereSufletească', '#Consolare', '#DumnezeulMângâierii',
    '#AlinareÎnHristos', '#SufleteMângâiate'
  ],
  răbdare: [
    '#Răbdare', '#RăbdareaCuDumnezeu', '#Perseverență',
    '#ÎncredereÎnTimp', '#AșteptareaÎnDumnezeu'
  ],
  iertare: [
    '#Iertare', '#PuteredaIertării', '#IertareDivină',
    '#InimăCurată', '#EliberarePrinIertare'
  ],
  recunoștință: [
    '#Recunoștință', '#Mulțumire', '#RecunoștințăZilnică',
    '#MultiumescDoamne', '#InimăRecunoscătoare'
  ],
  curaj: [
    '#Curaj', '#CurajÎnDumnezeu', '#NuTeTeme',
    '#Îndrăzneală', '#PuternicÎnHristos'
  ],
  protecție: [
    '#ProtecțiaDivină', '#SubAripiLeSale', '#AdăpostÎnDumnezeu',
    '#PazaDomnului', '#Ocrotire'
  ],
  vindecare: [
    '#VindecareSufletească', '#VindecareInterioară',
    '#RestaurareSufletească', '#DumnezeulVindecării'
  ],
  dimineață: [
    '#DimineațăBinecuvântată', '#BunăDimineata',
    '#DimineațaCuDumnezeu', '#ÎnceputDeZi'
  ],
  seară: [
    '#SearăBinecuvântată', '#NoapteLinistită',
    '#SearaCuDumnezeu', '#OdihnaÎnDumnezeu'
  ],
  familie: [
    '#FamiliaCuDumnezeu', '#FamilieBinecuvântată',
    '#CăminCreștin', '#DragosteDeFamilie'
  ],
  general: [
    '#VerseteInspirationale', '#BibliaZilnic', '#CuvinteDeViață',
    '#InspiratieZilnică', '#SufletCurat', '#ViajtaCuDumnezeu'
  ]
};

// Hashtag-uri trending / populare
const trendingHashtags = [
  '#Motivatie', '#Inspiratie', '#GânduriPozitive',
  '#ViataFrumoasă', '#România', '#Biblia',
  '#Dumnezeu', '#Isus', '#Spiritualitate',
  '#CuvinteFrumoase', '#Meditatie', '#GândulZilei'
];

/**
 * Generează hashtag-uri pentru o postare
 * @param {string} category - Categoria postării
 * @param {number} maxCount - Număr maxim de hashtag-uri
 * @param {string} platform - Platforma țintă
 * @returns {string[]} - Lista de hashtag-uri
 */
const generateHashtags = (category = 'general', maxCount = 15, platform = 'instagram') => {
  let hashtags = [...baseHashtags];
  
  // Adaugăm hashtag-uri specifice categoriei
  const catTags = categoryHashtags[category] || categoryHashtags.general;
  const shuffledCatTags = catTags.sort(() => Math.random() - 0.5);
  hashtags.push(...shuffledCatTags.slice(0, 4));
  
  // Adaugăm câteva hashtag-uri trending
  const shuffledTrending = trendingHashtags.sort(() => Math.random() - 0.5);
  hashtags.push(...shuffledTrending.slice(0, 3));
  
  // Adaugăm hashtag-uri generale
  const generalTags = categoryHashtags.general.sort(() => Math.random() - 0.5);
  hashtags.push(...generalTags.slice(0, 3));
  
  // Eliminăm duplicatele
  hashtags = [...new Set(hashtags)];
  
  // Limităm la platforma
  const platformLimits = {
    facebook: 10,
    instagram: 30,
    tiktok: 15
  };
  
  const limit = Math.min(maxCount, platformLimits[platform] || 15);
  
  return hashtags.slice(0, limit);
};

/**
 * Formatează hashtag-urile ca string
 */
const formatHashtagsString = (hashtags) => {
  return hashtags.join(' ');
};

module.exports = {
  generateHashtags,
  formatHashtagsString,
  baseHashtags,
  categoryHashtags,
  trendingHashtags
};