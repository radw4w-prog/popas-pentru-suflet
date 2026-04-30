require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const DescSchema = new mongoose.Schema({
  tema: String,
  text: String,
  stil: { type: String, default: 'inspirational' },
  activ: { type: Boolean, default: true }
}, { collection: 'descriptions' });

const Desc = mongoose.model('Desc', DescSchema);

// ═══════════════════════════════════════
// COMPONENTE PENTRU GENERARE
// ═══════════════════════════════════════

const INTRO = {
  dragoste: [
    'Dragostea lui Dumnezeu este nesfarsita si neconditionata.',
    'Nu exista forta mai mare decat dragostea lui Dumnezeu.',
    'Dragostea adevarata vine de la Dumnezeu.',
    'In dragostea lui Dumnezeu gasim tot ce avem nevoie.',
    'Dragostea divina nu cunoaste limite.',
    'Dumnezeu te iubeste asa cum esti, fara conditii.',
    'Dragostea lui Hristos transforma totul.',
    'Cel mai mare dar al lui Dumnezeu este dragostea Sa.',
    'Fiecare zi este o noua expresie a dragostei lui Dumnezeu.',
    'Dragostea Sa nu se schimba niciodata.',
    'In bratele lui Dumnezeu gasim dragostea perfecta.',
    'Dragostea lui Dumnezeu vindeca orice rana.',
    'Nu exista distanta pe care dragostea lui Dumnezeu sa nu o poata acoperi.',
    'Dragostea divina este ancora sufletului nostru.',
    'Cand te simti singur, aminteste-ti ca esti iubit de Creatorul universului.',
  ],
  credinta: [
    'Credinta nu inseamna absenta indoielii.',
    'Cu credinta, imposibilul devine posibil.',
    'Credinta ta, oricat de mica, misca mana lui Dumnezeu.',
    'Credinta inseamna sa mergi inainte chiar cand nu vezi calea.',
    'Muntele din fata ta nu este mai mare decat Dumnezeul din tine.',
    'Credinta este ancora sufletului in furtuna.',
    'Prin credinta, slabiciunea devine putere.',
    'Un gram de credinta cantareste mai mult decat o tona de indoieli.',
    'Credinta ta determina altitudinea vietii tale.',
    'Dumnezeu nu cauta credinta perfecta, ci credinta sincera.',
    'Credinta inseamna sa te odihnesti in promisiunile lui Dumnezeu.',
    'Chiar si cel mai mic pas de credinta il misca pe Dumnezeu.',
    'Credinta se naste din ascultarea Cuvantului lui Dumnezeu.',
    'Fara credinta este cu neputinta sa fim placuti lui Dumnezeu.',
    'Credinta vede invizibilul, crede incredibilul si primeste imposibilul.',
  ],
  pace: [
    'Pacea lui Dumnezeu intrece orice pricepere.',
    'Adevarata pace vine din prezenta lui Dumnezeu.',
    'Pacea nu este absenta problemelor, ci prezenta lui Dumnezeu in ele.',
    'Dumnezeu vrea sa iti dea pace in mijlocul furtunii.',
    'Pacea interioara este un dar de la Dumnezeu.',
    'Cand ii dai lui Dumnezeu grijile tale, primesti pacea Lui.',
    'Pacea lui Hristos este ancora sufletului tau.',
    'In linistea prezentei lui Dumnezeu gasim pacea adevarata.',
    'Pacea divina nu depinde de circumstante exterioare.',
    'Lasa-L pe Dumnezeu sa fie Domnul pacii tale.',
    'Pacea lui Dumnezeu pazeste inima si gandurile tale.',
    'In bratele Tatalui ceresc, pacea este garantata.',
    'Cand incetezi sa te lupti si te odihnesti in El, vine pacea.',
    'Pacea adevarata se gaseste doar la picioarele crucii.',
    'Dumnezeu este Domnul pacii, iar pacea Lui este vesnica.',
  ],
  bucurie: [
    'Bucuria in Domnul este puterea ta.',
    'Bucuria crestinului nu depinde de imprejurari.',
    'Astazi este o zi pe care Domnul a facut-o.',
    'Bucuria vine din certitudinea ca Dumnezeu este pe tron.',
    'Alege sa te bucuri, chiar si in zilele grele.',
    'Bucuria Domnului este refugiul sufletului tau.',
    'Dumnezeu iti umple inima de bucurie cand te apropii de El.',
    'Fiecare dimineata aduce bucurie noua de la Dumnezeu.',
    'Bucuria adevarata nu se gaseste in lucruri, ci in Dumnezeu.',
    'Zambeste! Esti copilul Regelui Regilor.',
    'Bucuria din Dumnezeu nu poate fi furata de nimeni.',
    'Chiar si lacrimile se transforma in bucurie prin harul Lui.',
    'In prezenta lui Dumnezeu este plinatate de bucurie.',
    'Bucuria credinciosa rasare si in noptile cele mai intunecate.',
    'Cand il ai pe Dumnezeu, ai bucuria vesnica.',
  ],
  speranta: [
    'Speranta crestinului este o certitudine, nu o dorinta vaga.',
    'Chiar si in cele mai intunecate momente, Dumnezeu lucreaza.',
    'Viitorul tau este in mainile lui Dumnezeu.',
    'Dumnezeu are planuri de pace si nu de rau pentru tine.',
    'Nu exista situatie fara iesire cand Dumnezeu este cu tine.',
    'Speranta noastra este in Cel care a invins moartea.',
    'Dumnezeu nu a terminat cu tine. Cel mai bun urmeaza.',
    'In fiecare rasarit, Dumnezeu iti ofera o noua speranta.',
    'Speranta este ancora sufletului, sigura si neclintita.',
    'Cand totul pare pierdut, Dumnezeu pregateste minunea.',
    'Promisiunile lui Dumnezeu nu au termen de expirare.',
    'Tine-ti ochii la Isus, Inceputul si Sfarsitul credintei noastre.',
    'Speranta in Dumnezeu nu dezamageste niciodata.',
    'Chiar si in vale, Dumnezeu pregateste un varf de munte.',
    'Cand nu mai vezi calea, El devine Calea.',
  ],
  rugaciune: [
    'Rugaciunea este puntea dintre problema ta si puterea lui Dumnezeu.',
    'Nu exista rugaciune prea mica sau prea mare pentru Dumnezeu.',
    'Rugaciunea nu schimba doar circumstantele, te schimba pe tine.',
    'Cel mai puternic lucru pe care il poti face este sa te rogi.',
    'Dumnezeu asculta fiecare rugaciune din inima ta.',
    'Rugaciunea este respiratia sufletului.',
    'In rugaciune, cerul se apleca spre pamant.',
    'Genunchii plecati misca mana care conduce universul.',
    'Rugaciunea este cea mai puternica arma a credinciosului.',
    'Dumnezeu nu te lasa niciodata fara raspuns cand te rogi.',
    'Timpul petrecut in rugaciune nu este niciodata pierdut.',
    'Rugaciunea iti deschide usile pe care nimeni nu le poate inchide.',
    'In tacerea rugaciunii, glasul lui Dumnezeu este cel mai clar.',
    'Rugaciunea conecteaza slabiciunea ta la puterea Lui.',
    'Cand nu mai ai cuvinte, Duhul Sfant mijloceste pentru tine.',
  ],
  iertare: [
    'Iertarea aduce libertate sufletului.',
    'Dumnezeu te-a iertat complet prin jertfa lui Isus.',
    'Iertarea nu schimba trecutul, dar elibereaza viitorul.',
    'Cand ierti, nu il eliberezi pe celalalt, ci pe tine insuti.',
    'Harul iertarii este cel mai mare dar pe care il poti oferi.',
    'Iertarea este decizia de a lasa povara in mainile lui Dumnezeu.',
    'Prin iertare, ranile se transforma in vindecari.',
    'Dumnezeu nu iti cere sa ierti in puterea ta, ci in a Lui.',
    'Iertarea este reflexia harului divin in viata ta.',
    'Cine iarta mult, iubeste mult.',
    'Iertarea este un act de curaj, nu de slabiciune.',
    'In iertare gasim pacea pe care o cautam.',
    'Dumnezeu nu tine socoteala pacatelor celor ce se pocaiesc.',
    'Harul Lui iti da puterea sa ierti imposibilul.',
    'Iertarea este cheia care deschide usa libertatii interioare.',
  ],
  putere: [
    'Cand esti slab, El este tare.',
    'Puterea lui Dumnezeu se manifesta in slabiciunea noastra.',
    'Nu esti singur in lupta ta. Dumnezeu merge cu tine.',
    'Obstacolul din fata ta nu este mai mare decat Dumnezeul din tine.',
    'Pot totul in Hristos care ma intareste.',
    'Dumnezeu iti da putere cand fortele tale se sfarsesc.',
    'Taria Domnului este refugiul tau in zi de necaz.',
    'Cel ce este in tine este mai mare decat cel ce este in lume.',
    'Dumnezeu nu te cheama la lucruri usoare, ci iti da putere pentru cele grele.',
    'In slabiciunea ta, harul Lui iti este de ajuns.',
    'Puterea rugaciunii misca munti si schimba destine.',
    'Nu te teme, caci Eu sunt cu tine. Eu te intaresc.',
    'Biruinta vine de la Domnul, nu de la fortele noastre.',
    'Dumnezeu transforma orice batalie intr-o victorie.',
    'Ridica-te! Cel care te cheama iti da si puterea.',
  ],
  recunostinta: [
    'Recunostinta transforma ce avem in suficient.',
    'Un om recunoscator este un om fericit.',
    'Multumeste-I lui Dumnezeu pentru fiecare zi noua.',
    'Recunostinta deschide usile binecuvantarilor.',
    'O inima recunoscatoare vede harul peste tot.',
    'Fiecare respiratie este un dar de la Dumnezeu.',
    'Numara binecuvantarile, nu problemele.',
    'Recunostinta schimba perspectiva si transforma viata.',
    'Cand multumesti, inima ta se umple de pace.',
    'Binecuvantarile lui Dumnezeu sunt noi in fiecare dimineata.',
    'A fi recunoscator nu depinde de circumstante, ci de atitudine.',
    'Multumeste pentru ceea ce ai si vei primi mai mult.',
    'Recunostinta este parfumul sufletului.',
    'In fiecare lucru gasesti un motiv de multumire.',
    'Recunostinta transforma zilele obisnuite in sarbatori.',
  ],
  familie: [
    'Familia este cel mai pretios dar de la Dumnezeu.',
    'O familie care se roaga impreuna ramane impreuna.',
    'Iubeste-i pe ai tai asa cum Dumnezeu te iubeste pe tine.',
    'Dumnezeu a creat familia ca un refugiu de dragoste.',
    'In familie invatam ce inseamna dragostea neconditionata.',
    'Binecuvantarea lui Dumnezeu peste familia ta este vesnica.',
    'Copiii sunt o mostenire de la Domnul.',
    'Familia este biserica mica din casa ta.',
    'Dumnezeu pune temelia familiilor puternice.',
    'In familia ta, fii lumina lui Hristos.',
    'Pacea din familie vine din prezenta lui Dumnezeu.',
    'Iarta, iubeste si construieste punti in familia ta.',
    'Dumnezeu vindeca si restaureaza relatiile din familie.',
    'Cea mai mare investitie este in familia ta.',
    'Rugaciunea familiei uneste inimile si intareste legaturile.',
  ],
  vindecare: [
    'Dumnezeu vindeca nu doar trupul, ci si sufletul.',
    'Prin ranile Lui suntem tamaduiti.',
    'Dumnezeu este Marele Doctor si nimic nu este imposibil.',
    'Vindecarea incepe cand iti pui increderea in Dumnezeu.',
    'El ia asupra Lui durerile noastre si ne da vindecare.',
    'Dumnezeu atinge locurile cele mai adanci ale sufletului.',
    'In mainile lui Dumnezeu, orice rana poate fi vindecata.',
    'Vindecarea divina depaseste orice diagnostic uman.',
    'Dumnezeu restaureaza ceea ce lumea considera pierdut.',
    'Cuvantul lui Dumnezeu este medicament pentru suflet.',
    'El vindeca pe cei cu inima zdrobita si le leaga ranile.',
    'Fiecare lacrim vazuta de Dumnezeu devine vindecare.',
    'Harul Lui vindeca, restaureaza si reinnoieste.',
    'In prezenta Lui, vindecarea este o certitudine.',
    'Dumnezeu nu doar vindeca, ci face toate lucrurile noi.',
  ],
  intelepciune: [
    'Adevarata intelepciune incepe cu frica de Dumnezeu.',
    'Cuvantul lui Dumnezeu este lumina pe cararea ta.',
    'Dumnezeu da intelepciune cu mana larga celor ce o cer.',
    'Intelepciunea divina depaseste orice logica omeneasca.',
    'In Biblie gasesti raspunsuri la toate intrebarile vietii.',
    'Intelepciunea este sa asculti glasul lui Dumnezeu.',
    'Cand nu stii ce sa faci, cauta-L pe Dumnezeu.',
    'Intelepciunea lui Dumnezeu te protejeaza de capcane.',
    'Un om intelept isi construieste viata pe Stanca.',
    'Intelepciunea vine din meditarea la Cuvantul lui Dumnezeu.',
    'Caile lui Dumnezeu sunt mai inalte decat caile noastre.',
    'Intelepciunea cereasca este curata, pasnica si plina de roade.',
    'Cere intelepciune si ti se va da din belsug.',
    'Intelepciunea lui Dumnezeu transforma deciziile in binecuvantari.',
    'Cartea Proverbelor este o comoara de intelepciune divina.',
  ],
};

const DEZVOLTARE = [
  'Astazi, lasa-te cuprins de aceasta realitate divina!',
  'Traieste aceasta realitate in fiecare moment al zilei!',
  'Lasa aceasta incredere sa iti conduca pasii astazi!',
  'Permite acestui adevar sa iti transforme perspectiva!',
  'Deschide-ti inima si primeste acest har!',
  'Mediteaza la acest adevar si vei vedea schimbarea!',
  'Fa din acest adevar fundamentul zilei tale!',
  'Proclama acest adevar peste viata ta!',
  'Imbratiseaza aceasta promisiune cu toata inima!',
  'Alege sa crezi si sa traiesti prin acest adevar!',
  'Lasa Cuvantul lui Dumnezeu sa lucreze in tine!',
  'In fiecare dimineata, reaminteste-ti acest adevar!',
  'Aceasta este promisiunea Lui pentru tine astazi!',
  'Nu lasa nimic sa te desparta de acest adevar!',
  'Tine-te strans de aceasta promisiune!',
  'Aceasta este vocea lui Dumnezeu pentru tine astazi!',
  'Porneste ziua cu acest adevar in inima ta!',
  'Lasa acest mesaj sa iti lumineze drumul!',
  'Dumnezeu iti vorbeste prin acest cuvant astazi!',
  'Primeste cu recunostinta acest dar ceresc!',
];

const CHEMARE = [
  'Apropie-te de El si vei gasi odihna!',
  'El te asteapta cu bratele deschise!',
  'Vino la El asa cum esti!',
  'El nu te respinge niciodata!',
  'Incredinteaza-I totul si vei avea pace!',
  'Da-I Lui grijile tale si vei fi liber!',
  'Cauta-L pe El mai intai si restul va veni!',
  'In bratele Lui gasesti siguranta vesnica!',
  'Striga catre El si te va auzi!',
  'Lasa-L sa scrie povestea vietii tale!',
  'El are un plan minunat pentru viata ta!',
  'Ai incredere in El, chiar cand nu intelegi!',
  'El este tot ce ai nevoie!',
  'Predarea in mainile Lui este cea mai mare victorie!',
  'Alege sa Il urmezi si nu vei regreta niciodata!',
  'El este raspunsul la orice intrebare!',
  'In El gasesti tot ce cauta inima ta!',
  'Odihneste-te in dragostea Lui vesnica!',
  'Fii curajos! El merge inaintea ta!',
  'Astazi este ziua in care Dumnezeu vrea sa te binecuvinteze!',
];

const EMOJI_MAP = {
  dragoste: ['❤️', '💖', '💕', '🌹', '💗', '💝'],
  credinta: ['🙏', '✨', '🦋', '🏔️', '💪', '⭐'],
  pace: ['🕊️', '💙', '🌊', '🌿', '☮️', '💠'],
  bucurie: ['😊', '🎉', '🌅', '🌟', '🥳', '☀️'],
  speranta: ['🌈', '💫', '🌅', '⭐', '🌻', '🔥'],
  rugaciune: ['🙏', '🙌', '🕯️', '✝️', '💒', '🤲'],
  iertare: ['🕊️', '💖', '✨', '🌸', '💝', '🌟'],
  putere: ['💪', '⚡', '🦁', '🔥', '🏔️', '⚔️'],
  recunostinta: ['🌸', '💛', '☀️', '🙏', '🌻', '✨'],
  familie: ['👨‍👩‍👧', '🏠', '💕', '🙏', '❤️', '👪'],
  vindecare: ['🌿', '✨', '💚', '🕊️', '🌺', '💫'],
  intelepciune: ['📖', '🕯️', '🦉', '💎', '📚', '🔮'],
};

// ═══════════════════════════════════════
// GENERARE DESCRIERI
// ═══════════════════════════════════════

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDescription(tema) {
  const intro = getRandom(INTRO[tema] || INTRO.dragoste);
  const dezvoltare = getRandom(DEZVOLTARE);
  const chemare = getRandom(CHEMARE);
  const emoji = getRandom(EMOJI_MAP[tema] || ['✨']);

  // Variante de combinare
  const patterns = [
    `${intro} ${dezvoltare} ${emoji}`,
    `${intro}\n\n${dezvoltare}\n\n${chemare} ${emoji}`,
    `${intro} ${chemare} ${emoji}`,
    `${emoji} ${intro}\n\n${dezvoltare}`,
    `${intro}\n\n${chemare} ${emoji}`,
  ];

  return getRandom(patterns);
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════

async function run() {
  const MONGODB_URI = 'mongodb+srv://popas_admin:L2Wjrw64lDTXySpx@cluster0.1glnnk8.mongodb.net/popas-pentru-suflet?retryWrites=true&w=majority';
  
  console.log('🔌 Conectare MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Conectat!\n');

  const teme = Object.keys(INTRO);
  const DESCRIERI_PER_TEMA = 400;
  const allDescriptions = [];

  for (const tema of teme) {
    console.log(`📝 Generare ${DESCRIERI_PER_TEMA} descrieri pentru: ${tema}`);

    const unique = new Set();

    while (unique.size < DESCRIERI_PER_TEMA) {
      const text = generateDescription(tema);
      if (!unique.has(text)) {
        unique.add(text);
        allDescriptions.push({
          tema,
          text,
          stil: 'inspirational',
          activ: true
        });
      }
    }

    console.log(`   ✅ ${unique.size} descrieri unice generate`);
  }

  // Adaugă și default
  for (let i = 0; i < 50; i++) {
    const tema = teme[Math.floor(Math.random() * teme.length)];
    const text = generateDescription(tema);
    allDescriptions.push({
      tema: 'default',
      text,
      stil: 'inspirational',
      activ: true
    });
  }

  console.log(`\n📊 Total descrieri generate: ${allDescriptions.length}`);

  // Import in DB
  console.log('🗑️ Ștergere descrieri vechi...');
  await Desc.deleteMany({});

  console.log('📥 Import descrieri noi...');
  const batchSize = 200;
  for (let i = 0; i < allDescriptions.length; i += batchSize) {
    const batch = allDescriptions.slice(i, i + batchSize);
    await Desc.insertMany(batch);
    console.log(`   ✅ ${Math.min(i + batchSize, allDescriptions.length)}/${allDescriptions.length}`);
  }

  // Statistici
  const total = await Desc.countDocuments();
  console.log(`\n🎉 IMPORT COMPLET!`);
  console.log(`📊 Total descrieri: ${total}`);

  for (const tema of [...teme, 'default']) {
    const count = await Desc.countDocuments({ tema });
    console.log(`   ${tema}: ${count}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});