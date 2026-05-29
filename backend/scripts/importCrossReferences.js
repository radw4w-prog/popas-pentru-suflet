// backend/scripts/importCrossReferences.js
// Importă referințele încrucișate din dataset-ul TSK
// Rulează cu: node scripts/importCrossReferences.js

require('dotenv').config();
const mongoose = require('mongoose');
const CrossReference = require('../models/CrossReference');

// Mapare cărți Bible din TSK (abrevieri engleze) → română
const BOOK_MAP = {
  'Gen': 'Geneza', 'Exo': 'Exodul', 'Lev': 'Leviticul', 'Num': 'Numeri',
  'Deu': 'Deuteronom', 'Jos': 'Iosua', 'Jdg': 'Judecători', 'Rut': 'Rut',
  '1Sa': '1 Samuel', '2Sa': '2 Samuel', '1Ki': '1 Împărați', '2Ki': '2 Împărați',
  '1Ch': '1 Cronici', '2Ch': '2 Cronici', 'Ezr': 'Ezra', 'Neh': 'Neemia',
  'Est': 'Estera', 'Job': 'Iov', 'Psa': 'Psalmi', 'Pro': 'Proverbe',
  'Ecc': 'Eclesiastul', 'Sng': 'Cântarea Cântărilor', 'Isa': 'Isaia',
  'Jer': 'Ieremia', 'Lam': 'Plângerile', 'Eze': 'Ezechiel', 'Dan': 'Daniel',
  'Hos': 'Osea', 'Joe': 'Ioel', 'Amo': 'Amos', 'Oba': 'Obadia',
  'Jon': 'Iona', 'Mic': 'Mica', 'Nah': 'Naum', 'Hab': 'Habacuc',
  'Zep': 'Țefania', 'Hag': 'Hagai', 'Zec': 'Zaharia', 'Mal': 'Maleahi',
  'Mat': 'Matei', 'Mrk': 'Marcu', 'Luk': 'Luca', 'Jhn': 'Ioan',
  'Act': 'Faptele Apostolilor', 'Rom': 'Romani', '1Co': '1 Corinteni',
  '2Co': '2 Corinteni', 'Gal': 'Galateni', 'Eph': 'Efeseni', 'Php': 'Filipeni',
  'Col': 'Coloseni', '1Th': '1 Tesaloniceni', '2Th': '2 Tesaloniceni',
  '1Ti': '1 Timotei', '2Ti': '2 Timotei', 'Tit': 'Tit', 'Phm': 'Filimon',
  'Heb': 'Evrei', 'Jas': 'Iacov', '1Pe': '1 Petru', '2Pe': '2 Petru',
  '1Jn': '1 Ioan', '2Jn': '2 Ioan', '3Jn': '3 Ioan', 'Jud': 'Iuda',
  'Rev': 'Apocalipsa'
};

// Dataset TSK complet — subset cu cele mai importante referințe
// Format: { "Gen.1.1": ["Gen.1.2", "Ioan.1.1", ...], ... }
// Folosim un subset reprezentativ pentru cele mai citate versete
const TSK_DATA = {
  // Ioan
  "Jhn.3.16": ["Rom.5.8", "Rom.8.32", "1Jn.4.9", "1Jn.4.10", "Eph.2.4", "Gal.4.4", "Jhn.10.28"],
  "Jhn.3.17": ["Luk.9.56", "Jhn.12.47", "1Jn.4.14"],
  "Jhn.14.6": ["Jhn.10.9", "Act.4.12", "1Ti.2.5", "Heb.10.19"],
  "Jhn.10.10": ["Jhn.6.35", "Jhn.17.3", "1Jn.5.12"],
  "Jhn.11.25": ["Jhn.5.21", "Jhn.6.40", "1Co.15.22", "Rev.1.18"],
  "Jhn.1.1": ["Pro.8.22", "Mic.5.2", "Jhn.17.5", "Col.1.17", "Rev.19.13"],
  "Jhn.1.14": ["Isa.7.14", "Mat.1.23", "Rom.8.3", "Php.2.7"],
  // Psalmi
  "Psa.23.1": ["Isa.40.11", "Eze.34.11", "Jhn.10.11", "Heb.13.20"],
  "Psa.119.105": ["Pro.6.23", "2Pe.1.19", "Psa.19.8"],
  "Psa.27.1": ["Psa.18.2", "Isa.12.2", "Mic.7.8"],
  // Romani
  "Rom.8.28": ["Psa.37.5", "Isa.26.3", "Eph.1.11", "Php.4.6"],
  "Rom.8.38": ["Psa.139.8", "Jhn.10.28", "Eph.8.35", "Heb.13.5"],
  "Rom.3.23": ["Psa.14.3", "Isa.53.6", "Rom.5.12", "1Jn.1.8"],
  "Rom.6.23": ["Eze.18.4", "Jhn.3.16", "Eph.2.8", "1Jn.5.11"],
  "Rom.10.9": ["Mat.10.32", "Act.2.21", "1Co.12.3", "Php.2.11"],
  // Matei
  "Mat.6.33": ["Psa.37.4", "Luk.12.31", "1Ki.3.13", "Php.4.19"],
  "Mat.11.28": ["Isa.55.1", "Jhn.7.37", "Rev.22.17", "Psa.55.22"],
  "Mat.28.19": ["Mar.16.15", "Luk.24.47", "Act.1.8", "Rom.10.14"],
  // Filipeni
  "Php.4.13": ["2Co.12.9", "Eph.6.10", "Col.1.11", "1Ti.1.12"],
  "Php.4.6": ["Psa.55.22", "1Pe.5.7", "Mat.6.25", "Rom.8.28"],
  "Php.4.7": ["Isa.26.3", "Jhn.14.27", "Col.3.15", "Rom.5.1"],
  // Isaia
  "Isa.40.31": ["Psa.27.14", "Lam.3.26", "Hos.12.6", "Mic.7.7"],
  "Isa.53.5": ["Mat.8.17", "Rom.4.25", "1Pe.2.24", "2Co.5.21"],
  "Isa.41.10": ["Deu.31.6", "Psa.27.1", "Rom.8.31", "Heb.13.6"],
  // Ieremia
  "Jer.29.11": ["Rom.8.28", "Eph.2.10", "Psa.40.5", "Pro.16.9"],
  // Proverbe
  "Pro.3.5": ["Psa.37.5", "Isa.26.4", "Mat.6.25", "Php.4.6"],
  "Pro.3.6": ["Psa.32.8", "Isa.30.21", "Jhn.16.13"],
  // Efeseni
  "Eph.2.8": ["Act.15.11", "Rom.3.24", "Tit.3.5", "Jhn.1.17"],
  "Eph.2.9": ["Rom.3.27", "1Co.1.29", "Gal.2.16"],
  // 1 Corinteni
  "1Co.13.4": ["1Pe.4.8", "Rom.13.10", "Col.3.14", "1Jn.4.7"],
  "1Co.10.13": ["Psa.125.3", "Rev.3.10", "2Pe.2.9", "Php.4.13"],
  // Evrei
  "Heb.11.1": ["Rom.8.24", "2Co.4.18", "1Pe.1.8", "Jhn.20.29"],
  "Heb.13.5": ["Deu.31.6", "Jos.1.5", "Mat.28.20", "Rom.8.39"],
  // Apocalipsa
  "Rev.3.20": ["Jhn.14.23", "Luk.19.5", "1Jn.4.15", "Jhn.10.9"],
  // Geneza
  "Gen.1.1": ["Psa.33.6", "Jhn.1.1", "Col.1.16", "Heb.11.3"],
  // Neemia
  "Neh.8.10": ["Psa.16.11", "Php.4.4", "Rom.14.17", "Gal.5.22"],
  // 1 Ioan
  "1Jn.1.9": ["Psa.32.5", "Pro.28.13", "Act.13.38", "Rom.8.1"],
  "1Jn.4.8": ["Jhn.3.16", "Rom.5.8", "Eph.2.4", "1Jn.3.1"],
};

function parseRef(ref) {
  // Format: "Jhn.3.16" sau "1Co.13.4"
  const parts = ref.split('.');
  if (parts.length < 3) return null;

  const bookAb = parts[0];
  const capitol = parseInt(parts[1]);
  const versetPart = parts[2];

  const carteRo = BOOK_MAP[bookAb];
  if (!carteRo) return null;

  // Poate fi range: "16-17"
  let versetStart = parseInt(versetPart);
  let versetEnd = versetStart;

  if (versetPart.includes('-')) {
    const rangeParts = versetPart.split('-');
    versetStart = parseInt(rangeParts[0]);
    versetEnd = parseInt(rangeParts[1]);
  }

  return {
    carte: carteRo,
    capitol,
    versetStart,
    versetEnd,
    referinta: versetStart === versetEnd
      ? `${carteRo} ${capitol}:${versetStart}`
      : `${carteRo} ${capitol}:${versetStart}-${versetEnd}`
  };
}

async function importCrossReferences() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectat');

    // Șterge colecția existentă
    await CrossReference.deleteMany({});
    console.log('🗑️ Colecție curățată');

    const docs = [];

    for (const [sourceRef, targetRefs] of Object.entries(TSK_DATA)) {
      const source = parseRef(sourceRef);
      if (!source) {
        console.warn('⚠️ Ref sursă invalidă:', sourceRef);
        continue;
      }

      const referinte = targetRefs
        .map(r => parseRef(r))
        .filter(Boolean);

      if (referinte.length === 0) continue;

      docs.push({
        carte: source.carte,
        capitol: source.capitol,
        verset: source.versetStart,
        referinte
      });
    }

    await CrossReference.insertMany(docs, { ordered: false });
    console.log(`✅ Import complet: ${docs.length} versete cu referințe`);

    await mongoose.disconnect();
    console.log('✅ Gata!');
  } catch (err) {
    console.error('❌ Eroare import:', err.message);
    process.exit(1);
  }
}

importCrossReferences();
