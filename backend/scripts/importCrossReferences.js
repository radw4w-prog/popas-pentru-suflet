// backend/scripts/importCrossReferences.js
require('dotenv').config();
const mongoose = require('mongoose');
const CrossReference = require('../models/CrossReference');

const BOOK_MAP = {
  'Gen': 'Geneza', 'Exo': 'Exodul', 'Lev': 'Leviticul', 'Num': 'Numeri',
  'Deu': 'Deuteronomul', 'Jos': 'Iosua', 'Jdg': 'Judecători', 'Rut': 'Rut',
  '1Sa': '1 Samuel', '2Sa': '2 Samuel', '1Ki': '1 Împărați', '2Ki': '2 Împărați',
  '1Ch': '1 Cronici', '2Ch': '2 Cronici', 'Ezr': 'Ezra', 'Neh': 'Neemia',
  'Est': 'Estera', 'Job': 'Iov', 'Psa': 'Psalmii', 'Pro': 'Proverbe',
  'Ecc': 'Eclesiastul', 'Sng': 'Cântarea Cântărilor', 'Isa': 'Isaia',
  'Jer': 'Ieremia', 'Lam': 'Plângerile lui Ieremia', 'Eze': 'Ezechiel',
  'Dan': 'Daniel', 'Hos': 'Osea', 'Joe': 'Ioel', 'Amo': 'Amos',
  'Oba': 'Obadia', 'Jon': 'Iona', 'Mic': 'Mica', 'Nah': 'Naum',
  'Hab': 'Habacuc', 'Zep': 'Ţefania', 'Hag': 'Hagai', 'Zec': 'Zaharia',
  'Mal': 'Maleahi', 'Mat': 'Matei', 'Mrk': 'Marcu', 'Luk': 'Luca',
  'Jhn': 'Ioan', 'Act': 'Faptele Apostolilor', 'Rom': 'Romani',
  '1Co': '1 Corinteni', '2Co': '2 Corinteni', 'Gal': 'Galateni',
  'Eph': 'Efeseni', 'Php': 'Filipeni', 'Col': 'Coloseni',
  '1Th': '1 Tesaloniceni', '2Th': '2 Tesaloniceni',
  '1Ti': '1 Timotei', '2Ti': '2 Timotei', 'Tit': 'Tit', 'Phm': 'Filimon',
  'Heb': 'Evrei', 'Jas': 'Iacov', '1Pe': '1 Petru', '2Pe': '2 Petru',
  '1Jn': '1 Ioan', '2Jn': '2 Ioan', '3Jn': '3 Ioan', 'Jud': 'Iuda',
  'Rev': 'Apocalipsa'
};

// Dataset extins — Ioan capitol 3 complet + alte cărți cheie
const TSK_DATA = {
  // ══════════════════════════════════
  // IOAN capitol 3 — COMPLET
  // ══════════════════════════════════
  "Jhn.3.1":  ["Jhn.7.50", "Jhn.19.39", "Act.5.34", "Php.3.5"],
  "Jhn.3.2":  ["Jhn.9.16", "Jhn.9.33", "Act.2.22", "Jhn.11.47"],
  "Jhn.3.3":  ["Mat.18.3", "1Pe.1.23", "1Jn.2.29", "1Jn.3.9", "Jhn.1.13"],
  "Jhn.3.4":  ["Jhn.6.52", "Jhn.8.22", "Jhn.3.9"],
  "Jhn.3.5":  ["Eze.36.25", "Act.2.38", "Tit.3.5", "Rom.6.4", "1Pe.3.21"],
  "Jhn.3.6":  ["Rom.8.5", "1Co.15.47", "Gal.5.17", "Jhn.1.13"],
  "Jhn.3.7":  ["Mat.18.3", "Jhn.3.3", "1Pe.1.23"],
  "Jhn.3.8":  ["Ecc.11.5", "1Co.2.11", "1Jn.2.29"],
  "Jhn.3.9":  ["Jhn.3.4", "Rom.3.4"],
  "Jhn.3.10": ["Eze.36.26", "Jhn.3.1", "Act.5.34"],
  "Jhn.3.11": ["Jhn.7.16", "Jhn.8.38", "1Jn.1.2", "1Jn.4.14"],
  "Jhn.3.12": ["Jhn.6.62", "1Co.15.40"],
  "Jhn.3.13": ["Pro.30.4", "Jhn.1.18", "Jhn.6.62", "Act.2.34", "Eph.4.9"],
  "Jhn.3.14": ["Num.21.8", "Jhn.8.28", "Jhn.12.32", "Jhn.12.34"],
  "Jhn.3.15": ["Jhn.6.40", "Jhn.6.47", "1Jn.5.13", "Jhn.11.25"],
  "Jhn.3.16": ["Rom.5.8", "Rom.8.32", "1Jn.4.9", "1Jn.4.10", "Eph.2.4", "Gal.4.4", "Jhn.10.28", "Jhn.1.18", "1Ti.1.15"],
  "Jhn.3.17": ["Luk.9.56", "Jhn.12.47", "1Jn.4.14", "Jhn.1.29", "Jhn.4.42"],
  "Jhn.3.18": ["Jhn.5.24", "Jhn.6.40", "1Jn.5.10", "Rom.8.1", "Jhn.8.24"],
  "Jhn.3.19": ["Jhn.1.4", "Jhn.1.9", "Jhn.8.12", "Jhn.12.46", "1Jn.3.20"],
  "Jhn.3.20": ["Jhn.3.19", "Eph.5.13", "Job.24.13", "Pro.4.18"],
  "Jhn.3.21": ["1Jn.1.6", "Jhn.3.20", "Eph.5.9"],
  "Jhn.3.22": ["Jhn.4.1", "Jhn.4.2", "Mat.28.19"],
  "Jhn.3.23": ["1Sa.9.4", "Act.8.36"],
  "Jhn.3.24": ["Mat.4.12", "Mat.14.3", "Mrk.6.17", "Luk.3.20"],
  "Jhn.3.25": ["Act.19.4", "Luk.11.38", "Mrk.7.3"],
  "Jhn.3.26": ["Jhn.1.7", "Jhn.1.15", "Jhn.1.26", "Jhn.4.1"],
  "Jhn.3.27": ["1Co.3.5", "1Co.4.7", "Jhn.19.11", "Heb.5.4"],
  "Jhn.3.28": ["Jhn.1.20", "Jhn.1.23", "Mal.3.1"],
  "Jhn.3.29": ["Mat.25.1", "2Co.11.2", "Rev.21.9", "Isa.62.5"],
  "Jhn.3.30": ["Jhn.1.27", "Act.13.25", "Isa.40.3"],
  "Jhn.3.31": ["Jhn.8.23", "1Co.15.47", "Jhn.3.13"],
  "Jhn.3.32": ["Jhn.3.11", "Jhn.8.26", "Jhn.15.15"],
  "Jhn.3.33": ["Jhn.3.11", "Rom.3.4", "1Jn.5.9", "1Jn.5.10"],
  "Jhn.3.34": ["Isa.61.1", "Jhn.7.16", "Jhn.14.10", "Mat.28.18"],
  "Jhn.3.35": ["Mat.11.27", "Mat.28.18", "Jhn.5.20", "Jhn.13.3"],
  "Jhn.3.36": ["Jhn.5.24", "1Jn.5.12", "Hab.2.4", "Rom.1.17", "Jhn.6.47"],

  // ══════════════════════════════════
  // ROMANI capitol 8 — COMPLET
  // ══════════════════════════════════
  "Rom.8.1":  ["Jhn.3.18", "Jhn.5.24", "Rom.5.1", "Gal.3.13", "Col.1.21"],
  "Rom.8.2":  ["Jhn.8.32", "Rom.7.23", "Gal.5.1", "1Co.15.45"],
  "Rom.8.3":  ["Jhn.1.14", "Rom.7.18", "Gal.4.4", "Php.2.7", "Heb.2.14"],
  "Rom.8.4":  ["Mat.5.17", "Rom.13.8", "Gal.5.16", "1Pe.2.24"],
  "Rom.8.5":  ["Jhn.3.6", "Rom.8.13", "Gal.5.17", "Col.3.2"],
  "Rom.8.6":  ["Jhn.14.27", "Rom.8.13", "Php.4.7", "Gal.6.8"],
  "Rom.8.7":  ["1Co.2.14", "Eph.2.3", "Rom.7.18", "Col.1.21"],
  "Rom.8.8":  ["Jhn.8.44", "Rom.7.5", "1Co.2.14", "Eph.2.3"],
  "Rom.8.9":  ["1Co.3.16", "1Co.6.19", "Rom.8.14", "Gal.4.6"],
  "Rom.8.10": ["Jhn.14.20", "Gal.2.20", "Col.3.4", "2Co.5.17"],
  "Rom.8.11": ["Jhn.5.21", "1Co.6.14", "2Co.4.14", "Php.3.21"],
  "Rom.8.12": ["Rom.6.12", "Gal.5.13", "1Pe.2.16"],
  "Rom.8.13": ["Rom.6.12", "Col.3.5", "Gal.5.24", "1Pe.2.11"],
  "Rom.8.14": ["Gal.4.6", "Gal.5.18", "1Jn.3.10", "Jhn.1.12"],
  "Rom.8.15": ["2Ti.1.7", "Gal.4.5", "Gal.4.6", "1Jn.4.18"],
  "Rom.8.16": ["Gal.4.6", "1Jn.3.1", "1Jn.5.10", "2Co.1.22"],
  "Rom.8.17": ["Jhn.17.22", "Gal.4.7", "1Pe.1.4", "Heb.1.2", "Rev.21.7"],
  "Rom.8.18": ["2Co.4.17", "1Pe.5.1", "Mat.13.43", "2Th.1.7"],
  "Rom.8.19": ["Isa.65.17", "Rev.21.1", "2Pe.3.13"],
  "Rom.8.20": ["Gen.3.17", "Ecc.1.2", "Isa.24.5"],
  "Rom.8.21": ["Jhn.8.32", "Gal.5.1", "2Pe.3.13", "Rev.21.1"],
  "Rom.8.22": ["Psa.90.10", "Ecc.1.2", "Gen.3.17"],
  "Rom.8.23": ["2Co.1.22", "2Co.5.5", "Eph.1.13", "Eph.4.30"],
  "Rom.8.24": ["Heb.11.1", "Rom.5.2", "Gal.5.5", "Tit.3.7"],
  "Rom.8.25": ["Psa.27.14", "Psa.130.5", "Lam.3.26", "Heb.10.36"],
  "Rom.8.26": ["Jhn.14.16", "Jhn.16.7", "Eph.6.18", "Zec.12.10"],
  "Rom.8.27": ["1Sa.16.7", "1Ki.8.39", "Psa.139.1", "Rev.2.23"],
  "Rom.8.28": ["Psa.37.5", "Isa.26.3", "Eph.1.11", "Php.4.6", "Jer.29.11"],
  "Rom.8.29": ["Act.13.48", "Rom.9.23", "Eph.1.4", "1Pe.1.2", "Col.1.15"],
  "Rom.8.30": ["Jhn.10.28", "Eph.1.5", "Eph.1.11", "1Th.5.24"],
  "Rom.8.31": ["Psa.118.6", "Isa.50.9", "Heb.13.6", "Rom.8.37"],
  "Rom.8.32": ["Jhn.3.16", "Rom.5.8", "1Jn.4.9", "Gen.22.12", "Isa.53.10"],
  "Rom.8.33": ["Isa.50.8", "Col.3.12", "Act.13.48"],
  "Rom.8.34": ["Isa.50.8", "Heb.7.25", "Heb.9.24", "1Jn.2.1"],
  "Rom.8.35": ["Jhn.10.28", "Rom.8.39", "1Co.15.57", "Rev.1.5"],
  "Rom.8.36": ["Psa.44.22", "1Co.15.31", "2Co.11.23"],
  "Rom.8.37": ["1Jn.4.4", "Jhn.16.33", "1Co.15.57", "Php.4.13"],
  "Rom.8.38": ["Psa.139.8", "Jhn.10.28", "Eph.3.18", "Heb.13.5"],
  "Rom.8.39": ["Jhn.17.23", "Rom.8.35", "1Jn.4.16", "Eph.3.18"],

  // ══════════════════════════════════
  // PSALMII — cele mai citate
  // ══════════════════════════════════
  "Psa.23.1":  ["Isa.40.11", "Eze.34.11", "Jhn.10.11", "Heb.13.20", "1Pe.2.25"],
  "Psa.23.2":  ["Rev.7.17", "Isa.49.10", "Eze.34.14"],
  "Psa.23.3":  ["Isa.43.25", "Jer.31.25", "Mat.11.29"],
  "Psa.23.4":  ["Job.3.5", "Isa.43.2", "Mat.28.20", "Jhn.11.25"],
  "Psa.23.5":  ["Luk.7.46", "Psa.36.8", "Isa.25.6"],
  "Psa.23.6":  ["Psa.27.4", "Jhn.14.2", "Rev.21.3"],
  "Psa.27.1":  ["Psa.18.2", "Isa.12.2", "Mic.7.8", "Jhn.8.12"],
  "Psa.46.1":  ["Psa.27.1", "Isa.41.10", "Heb.13.6", "Rom.8.31"],
  "Psa.91.1":  ["Psa.31.20", "Psa.61.4", "Isa.4.6", "Mat.23.37"],
  "Psa.119.105": ["Pro.6.23", "2Pe.1.19", "Psa.19.8", "Jhn.17.17"],

  // ══════════════════════════════════
  // MATEI capitol 5-7 (Predica de pe munte)
  // ══════════════════════════════════
  "Mat.5.3":  ["Luk.6.20", "Isa.57.15", "Isa.66.2", "Jac.2.5"],
  "Mat.5.4":  ["Luk.6.21", "Isa.61.2", "Isa.66.10", "2Co.1.4"],
  "Mat.5.5":  ["Psa.37.11", "Isa.29.19", "Rom.4.13"],
  "Mat.5.6":  ["Isa.55.1", "Jhn.4.14", "Jhn.6.35", "Rev.22.17"],
  "Mat.5.7":  ["Pro.11.17", "Mic.6.8", "Jac.2.13"],
  "Mat.5.8":  ["Psa.24.4", "Heb.12.14", "1Jn.3.2", "1Jn.3.3"],
  "Mat.5.9":  ["Rom.5.1", "Col.3.15", "Iac.3.18", "Heb.12.14"],
  "Mat.5.10": ["1Pe.3.14", "1Pe.4.14", "Jhn.15.20", "Act.5.41"],
  "Mat.5.14": ["Jhn.8.12", "Jhn.9.5", "Php.2.15", "Eph.5.8"],
  "Mat.5.16": ["1Pe.2.12", "Jhn.15.8", "Tit.2.7"],
  "Mat.6.9":  ["Luk.11.2", "Rom.8.15", "Gal.4.6"],
  "Mat.6.25": ["Luk.12.22", "Php.4.6", "1Pe.5.7", "Psa.55.22"],
  "Mat.6.33": ["Psa.37.4", "Luk.12.31", "1Ki.3.13", "Php.4.19"],
  "Mat.11.28": ["Isa.55.1", "Jhn.7.37", "Rev.22.17", "Psa.55.22"],

  // ══════════════════════════════════
  // FILIPENI 4
  // ══════════════════════════════════
  "Php.4.4":  ["Rom.5.2", "Rom.5.11", "1Th.5.16", "Gal.5.22"],
  "Php.4.5":  ["Jac.5.8", "Rev.22.20", "1Co.16.22"],
  "Php.4.6":  ["Psa.55.22", "1Pe.5.7", "Mat.6.25", "Rom.8.28", "Col.4.2"],
  "Php.4.7":  ["Isa.26.3", "Jhn.14.27", "Col.3.15", "Rom.5.1", "Jhn.16.33"],
  "Php.4.8":  ["Rom.12.17", "2Co.8.21", "1Pe.4.8"],
  "Php.4.9":  ["1Co.11.1", "Php.3.17", "1Th.1.6"],
  "Php.4.11": ["1Ti.6.6", "Heb.13.5", "Job.1.21"],
  "Php.4.12": ["2Co.11.27", "1Ti.6.8", "Heb.13.5"],
  "Php.4.13": ["2Co.12.9", "Eph.6.10", "Col.1.11", "1Ti.1.12"],
  "Php.4.19": ["Mat.6.33", "Rom.8.32", "Eph.1.7", "Col.1.19"],

  // ══════════════════════════════════
  // ISAIA versete cheie
  // ══════════════════════════════════
  "Isa.40.31": ["Psa.27.14", "Lam.3.26", "Hos.12.6", "Mic.7.7"],
  "Isa.41.10": ["Deu.31.6", "Psa.27.1", "Rom.8.31", "Heb.13.6"],
  "Isa.43.2":  ["Psa.23.4", "Dan.3.25", "Act.27.23"],
  "Isa.53.5":  ["Mat.8.17", "Rom.4.25", "1Pe.2.24", "2Co.5.21"],
  "Isa.53.6":  ["Rom.3.23", "1Pe.2.25", "Jhn.1.29"],
  "Isa.55.1":  ["Mat.11.28", "Jhn.7.37", "Rev.22.17"],

  // ══════════════════════════════════
  // IEREMIA
  // ══════════════════════════════════
  "Jer.29.11": ["Rom.8.28", "Eph.2.10", "Psa.40.5", "Pro.16.9"],
  "Jer.31.3":  ["Deu.7.8", "1Jn.4.19", "Eph.1.4", "Jhn.13.1"],

  // ══════════════════════════════════
  // PROVERBE
  // ══════════════════════════════════
  "Pro.3.5":  ["Psa.37.5", "Isa.26.4", "Mat.6.25", "Php.4.6"],
  "Pro.3.6":  ["Psa.32.8", "Isa.30.21", "Jhn.16.13"],
  "Pro.4.23": ["Mat.12.34", "Luk.6.45", "Jac.4.8"],

  // ══════════════════════════════════
  // 1 CORINTENI 13 (dragostea)
  // ══════════════════════════════════
  "1Co.13.1": ["Rom.8.35", "1Jn.4.8", "Mat.22.39"],
  "1Co.13.2": ["Mat.17.20", "1Co.12.8", "Pro.11.2"],
  "1Co.13.3": ["Mat.6.1", "Act.2.45", "Job.31.17"],
  "1Co.13.4": ["1Pe.4.8", "Rom.13.10", "Col.3.14", "1Jn.4.7"],
  "1Co.13.5": ["Jhn.13.34", "1Pe.4.8", "Jhn.15.12"],
  "1Co.13.6": ["2Jn.1.4", "3Jn.1.4", "Eph.5.9"],
  "1Co.13.7": ["Rom.15.1", "Gal.6.2", "1Pe.4.8"],
  "1Co.13.8": ["1Pe.1.4", "Col.3.14", "Jhn.14.16"],
  "1Co.13.13": ["Rom.5.1", "Rom.5.5", "Gal.5.5", "Col.1.5"],

  // ══════════════════════════════════
  // EFESENI
  // ══════════════════════════════════
  "Eph.2.4":  ["Jhn.3.16", "Rom.5.8", "Tit.3.5", "1Jn.4.10"],
  "Eph.2.8":  ["Act.15.11", "Rom.3.24", "Tit.3.5", "Jhn.1.17"],
  "Eph.2.10": ["Jer.29.11", "Tit.3.8", "Jhn.15.16", "Col.1.10"],
  "Eph.6.10": ["Php.4.13", "2Co.12.9", "Col.1.11", "Isa.40.31"],
  "Eph.6.11": ["2Co.10.4", "Rom.13.12", "1Pe.5.8"],
  "Eph.6.17": ["Heb.4.12", "Jhn.17.17", "Isa.49.2"],
  "Eph.6.18": ["Rom.8.26", "Php.4.6", "Col.4.2", "1Th.5.17"],

  // ══════════════════════════════════
  // EVREI
  // ══════════════════════════════════
  "Heb.11.1": ["Rom.8.24", "2Co.4.18", "1Pe.1.8", "Jhn.20.29"],
  "Heb.11.6": ["Rom.14.23", "Mat.21.22", "Jac.1.6"],
  "Heb.12.1": ["1Co.9.24", "Php.3.13", "1Ti.6.12", "Act.20.24"],
  "Heb.12.2": ["Jhn.13.31", "Php.2.8", "Col.1.20"],
  "Heb.13.5": ["Deu.31.6", "Jos.1.5", "Mat.28.20", "Rom.8.39"],
  "Heb.13.8": ["Mal.3.6", "Rev.1.8", "Jhn.1.1", "Col.1.17"],

  // ══════════════════════════════════
  // 1 PETRU
  // ══════════════════════════════════
  "1Pe.5.7":  ["Psa.55.22", "Mat.6.25", "Php.4.6", "Mat.6.31"],
  "1Pe.5.8":  ["Eph.6.11", "1Co.16.13", "1Th.5.6", "Rev.12.9"],
  "1Pe.2.24": ["Isa.53.5", "Col.2.14", "Rom.6.10", "Heb.9.28"],

  // ══════════════════════════════════
  // APOCALIPSA
  // ══════════════════════════════════
  "Rev.3.20": ["Jhn.14.23", "Luk.19.5", "1Jn.4.15", "Jhn.10.9"],
  "Rev.21.4": ["Isa.25.8", "Isa.35.10", "Rev.7.17", "1Co.15.26"],
};

function parseRef(ref) {
  const parts = ref.split('.');
  if (parts.length < 3) return null;
  const bookAb = parts[0];
  const capitol = parseInt(parts[1]);
  const versetPart = parts[2];
  const carteRo = BOOK_MAP[bookAb];
  if (!carteRo) return null;
  let versetStart = parseInt(versetPart);
  let versetEnd = versetStart;
  if (versetPart.includes('-')) {
    const [s, e] = versetPart.split('-');
    versetStart = parseInt(s);
    versetEnd = parseInt(e);
  }
  return {
    carte: carteRo, capitol, versetStart, versetEnd,
    referinta: versetStart === versetEnd
      ? `${carteRo} ${capitol}:${versetStart}`
      : `${carteRo} ${capitol}:${versetStart}-${versetEnd}`
  };
}

async function importCrossReferences() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectat');
    await CrossReference.deleteMany({});
    console.log('🗑️ Colecție curățată');

    const docs = [];
    for (const [sourceRef, targetRefs] of Object.entries(TSK_DATA)) {
      const source = parseRef(sourceRef);
      if (!source) continue;
      const referinte = targetRefs.map(r => parseRef(r)).filter(Boolean);
      if (referinte.length === 0) continue;
      docs.push({ carte: source.carte, capitol: source.capitol, verset: source.versetStart, referinte });
    }

    await CrossReference.insertMany(docs, { ordered: false });
    console.log(`✅ Import complet: ${docs.length} versete cu referințe`);
    await mongoose.disconnect();
    console.log('✅ Gata!');
  } catch (err) {
    console.error('❌ Eroare:', err.message);
    process.exit(1);
  }
}

importCrossReferences();
