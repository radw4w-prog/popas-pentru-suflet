const https = require('https');
const fs = require('fs');
const path = require('path');

// Sursa publica BVDCS
const BIBLE_SOURCES = [
  'https://raw.githubusercontent.com/christos-c/bible-corpus/master/bibles/Romanian.xml',
];

// Vom construi manual structura corecta BVDCS
// Aceasta este structura completa a Bibliei in romana

const bibleStructure = {
  testament_vechi: [
    { abrev: 'Gen', nume: 'Geneza', capitole: 50 },
    { abrev: 'Ex', nume: 'Exodul', capitole: 40 },
    { abrev: 'Lev', nume: 'Leviticul', capitole: 27 },
    { abrev: 'Num', nume: 'Numeri', capitole: 36 },
    { abrev: 'Deut', nume: 'Deuteronomul', capitole: 34 },
    { abrev: 'Ios', nume: 'Iosua', capitole: 24 },
    { abrev: 'Jud', nume: 'Judecători', capitole: 21 },
    { abrev: 'Rut', nume: 'Rut', capitole: 4 },
    { abrev: '1Sam', nume: '1 Samuel', capitole: 31 },
    { abrev: '2Sam', nume: '2 Samuel', capitole: 24 },
    { abrev: '1Imp', nume: '1 Împărați', capitole: 22 },
    { abrev: '2Imp', nume: '2 Împărați', capitole: 25 },
    { abrev: '1Cron', nume: '1 Cronici', capitole: 29 },
    { abrev: '2Cron', nume: '2 Cronici', capitole: 36 },
    { abrev: 'Ezra', nume: 'Ezra', capitole: 10 },
    { abrev: 'Neem', nume: 'Neemia', capitole: 13 },
    { abrev: 'Est', nume: 'Estera', capitole: 10 },
    { abrev: 'Iov', nume: 'Iov', capitole: 42 },
    { abrev: 'Ps', nume: 'Psalmi', capitole: 150 },
    { abrev: 'Prov', nume: 'Proverbe', capitole: 31 },
    { abrev: 'Ecl', nume: 'Eclesiastul', capitole: 12 },
    { abrev: 'Cant', nume: 'Cântarea Cântărilor', capitole: 8 },
    { abrev: 'Is', nume: 'Isaia', capitole: 66 },
    { abrev: 'Ier', nume: 'Ieremia', capitole: 52 },
    { abrev: 'Plang', nume: 'Plângerile', capitole: 5 },
    { abrev: 'Iez', nume: 'Ezechiel', capitole: 48 },
    { abrev: 'Dan', nume: 'Daniel', capitole: 12 },
    { abrev: 'Os', nume: 'Osea', capitole: 14 },
    { abrev: 'Ioel', nume: 'Ioel', capitole: 3 },
    { abrev: 'Amos', nume: 'Amos', capitole: 9 },
    { abrev: 'Obad', nume: 'Obadia', capitole: 1 },
    { abrev: 'Iona', nume: 'Iona', capitole: 4 },
    { abrev: 'Mica', nume: 'Mica', capitole: 7 },
    { abrev: 'Naum', nume: 'Naum', capitole: 3 },
    { abrev: 'Hab', nume: 'Habacuc', capitole: 3 },
    { abrev: 'Tef', nume: 'Țefania', capitole: 3 },
    { abrev: 'Hag', nume: 'Hagai', capitole: 2 },
    { abrev: 'Zah', nume: 'Zaharia', capitole: 14 },
    { abrev: 'Mal', nume: 'Maleahi', capitole: 4 }
  ],
  testament_nou: [
    { abrev: 'Mat', nume: 'Matei', capitole: 28 },
    { abrev: 'Mar', nume: 'Marcu', capitole: 16 },
    { abrev: 'Luc', nume: 'Luca', capitole: 24 },
    { abrev: 'Ioan', nume: 'Ioan', capitole: 21 },
    { abrev: 'FA', nume: 'Faptele Apostolilor', capitole: 28 },
    { abrev: 'Rom', nume: 'Romani', capitole: 16 },
    { abrev: '1Cor', nume: '1 Corinteni', capitole: 16 },
    { abrev: '2Cor', nume: '2 Corinteni', capitole: 13 },
    { abrev: 'Gal', nume: 'Galateni', capitole: 6 },
    { abrev: 'Ef', nume: 'Efeseni', capitole: 6 },
    { abrev: 'Fil', nume: 'Filipeni', capitole: 4 },
    { abrev: 'Col', nume: 'Coloseni', capitole: 4 },
    { abrev: '1Tes', nume: '1 Tesaloniceni', capitole: 5 },
    { abrev: '2Tes', nume: '2 Tesaloniceni', capitole: 3 },
    { abrev: '1Tim', nume: '1 Timotei', capitole: 6 },
    { abrev: '2Tim', nume: '2 Timotei', capitole: 4 },
    { abrev: 'Tit', nume: 'Tit', capitole: 3 },
    { abrev: 'Fil', nume: 'Filimon', capitole: 1 },
    { abrev: 'Evr', nume: 'Evrei', capitole: 13 },
    { abrev: 'Iac', nume: 'Iacov', capitole: 5 },
    { abrev: '1Pet', nume: '1 Petru', capitole: 5 },
    { abrev: '2Pet', nume: '2 Petru', capitole: 3 },
    { abrev: '1Ioan', nume: '1 Ioan', capitole: 5 },
    { abrev: '2Ioan', nume: '2 Ioan', capitole: 1 },
    { abrev: '3Ioan', nume: '3 Ioan', capitole: 1 },
    { abrev: 'Iuda', nume: 'Iuda', capitole: 1 },
    { abrev: 'Apoc', nume: 'Apocalipsa', capitole: 22 }
  ]
};

console.log('📖 Structura Bibliei BVDCS creată!');
console.log(`📚 Cărți VT: ${bibleStructure.testament_vechi.length}`);
console.log(`📚 Cărți NT: ${bibleStructure.testament_nou.length}`);

fs.writeFileSync(
  path.join(__dirname, '../data/bible_structure.json'),
  JSON.stringify(bibleStructure, null, 2)
);

console.log('✅ Salvat în backend/data/bible_structure.json');