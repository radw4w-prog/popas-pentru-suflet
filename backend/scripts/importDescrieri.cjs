require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const DescSchema = new mongoose.Schema({
  tema: String, text: String, stil: String, activ: { type: Boolean, default: true }
}, { collection: 'descriptions' });

const Desc = mongoose.model('Desc', DescSchema);

const descrieri = [
  // DRAGOSTE
  { tema: 'dragoste', text: 'Dragostea lui Dumnezeu este nesfarsita si neconditionata. Astazi, lasa-te cuprins de aceasta dragoste divina care transforma totul! 💖', stil: 'inspirational' },
  { tema: 'dragoste', text: 'Nu exista forta mai mare in univers decat dragostea lui Dumnezeu. Tu esti iubit complet si pentru totdeauna! ❤️', stil: 'inspirational' },
  { tema: 'dragoste', text: 'Cand simti ca nu esti de ajuns, aminteste-ti: Dumnezeu te-a iubit inainte sa te nasti. Aceasta dragoste nu se schimba niciodata! 🌟', stil: 'inspirational' },
  { tema: 'dragoste', text: 'Dragostea adevarata nu cauta ale sale. Iubeste fara conditii, asa cum Dumnezeu te iubeste pe tine! 💕', stil: 'inspirational' },
  { tema: 'dragoste', text: 'In dragostea lui Dumnezeu gasesti tot ce ai nevoie: acceptare, iertare si speranta. El te iubeste asa cum esti! 🌸', stil: 'devotional' },
  { tema: 'dragoste', text: 'Doamne, umple-mi inima cu dragostea Ta. Ajuta-ma sa iubesc pe cei din jur cu aceeasi dragoste cu care Tu ma iubesti! 🙏', stil: 'devotional' },
  { tema: 'dragoste', text: 'Dragostea lui Dumnezeu e ca un ocean fara margini - nu conteaza cat de departe ai plecat, El te asteapta mereu cu bratele deschise! 🌊', stil: 'poetic' },
  
  // CREDINTA
  { tema: 'credinta', text: 'Credinta nu inseamna absenta indoielii - inseamna sa mergi inainte chiar si cand nu vezi calea! Astazi, fa un pas de credinta! 🦋', stil: 'inspirational' },
  { tema: 'credinta', text: 'Cu credinta, imposibilul devine posibil. Dumnezeu nu cunoaste limitele pe care noi ni le punem! 💪', stil: 'inspirational' },
  { tema: 'credinta', text: 'Credinta ta, oricat de mica, misca mana lui Dumnezeu. Nu subestima puterea unui suflet care crede! ✨', stil: 'inspirational' },
  { tema: 'credinta', text: 'Muntele din fata ta poate parea insurmontabil, dar cu credinta cat un graunte de mustar, el se va muta! 🏔️', stil: 'inspirational' },
  { tema: 'credinta', text: 'Credinta inseamna sa te odihnesti in bratele lui Dumnezeu chiar cand nu intelegi ce se intampla. 🙏', stil: 'devotional' },
  { tema: 'credinta', text: 'Doamne, ajuta-ma sa am credinta chiar si in momentele intunecate. Stiu ca Tu esti cu mine! ✝️', stil: 'devotional' },
  
  // PACE
  { tema: 'pace', text: 'Pacea lui Dumnezeu intrece orice pricepere. Ea nu depinde de circumstante, ci de prezenta Lui in viata ta! 🕊️', stil: 'inspirational' },
  { tema: 'pace', text: 'Cand furtuna bate, pacea lui Dumnezeu este ancora sufletului tau. Lasa-L sa conduca! 🌊', stil: 'inspirational' },
  { tema: 'pace', text: 'Adevarata pace vine din increderea ca Dumnezeu tine totul in mainile Lui. Odihneste-te in El! 💙', stil: 'inspirational' },
  { tema: 'pace', text: 'Pacea nu este absenta problemelor, ci prezenta lui Dumnezeu in mijlocul lor! 🌿', stil: 'inspirational' },
  { tema: 'pace', text: 'Doamne, da-mi pacea Ta care intrece orice pricepere. Ajuta-ma sa aduc totul inaintea Ta! 🙏', stil: 'devotional' },
  { tema: 'pace', text: 'Ca un rau lin ce curge domol, asa e pacea Ta in sufletul meu. Tu umpli fiecare colt cu lumina Ta. 🌅', stil: 'poetic' },
  
  // BUCURIE
  { tema: 'bucurie', text: 'Bucuria crestinului nu depinde de imprejurari - ea vine din certitudinea ca Dumnezeu este pe tron! 🎉', stil: 'inspirational' },
  { tema: 'bucurie', text: 'Astazi este o zi pe care Domnul a facut-o. Alege sa te bucuri si sa te veselesti in ea! 🌅', stil: 'inspirational' },
  { tema: 'bucurie', text: 'Bucuria Ta, Doamne, este puterea mea! Chiar si in zilele grele, pot zambi pentru ca stiu ca Tu esti cu mine! 😊', stil: 'inspirational' },
  { tema: 'bucurie', text: 'Bucurati-va intotdeauna! Nu cand totul merge bine - INTOTDEAUNA! Aceasta este puterea credintei! 🌟', stil: 'inspirational' },
  { tema: 'bucurie', text: 'Doamne, ajuta-ma sa gasesc bucurie in fiecare zi, nu in circumstante, ci in prezenta Ta! 🙏', stil: 'devotional' },
  
  // SPERANTA
  { tema: 'speranta', text: 'Speranta crestinului nu este o dorinta vaga - este o certitudine bazata pe promisiunile lui Dumnezeu! 🌈', stil: 'inspirational' },
  { tema: 'speranta', text: 'Chiar si in cele mai intunecate momente, exista lumina la capatul tunelului. Dumnezeu nu a terminat cu tine! 💫', stil: 'inspirational' },
  { tema: 'speranta', text: 'Viitorul tau este in mainile lui Dumnezeu si acele maini au purtat cuiele de pe cruce pentru tine! 🙏', stil: 'inspirational' },
  { tema: 'speranta', text: 'Cand totul pare pierdut, aminteste-ti: Dumnezeu lucreaza si in tacere. Planul Lui este perfect! ✨', stil: 'inspirational' },
  { tema: 'speranta', text: 'Doamne, cand totul pare fara iesire, reaminteste-mi ca Tu esti Dumnezeul sperantei! 🌅', stil: 'devotional' },
  
  // RUGACIUNE
  { tema: 'rugaciune', text: 'Rugaciunea este puntea dintre problema ta si puterea lui Dumnezeu. Foloseste-o astazi! 🙏', stil: 'inspirational' },
  { tema: 'rugaciune', text: 'Nu exista rugaciune prea mica sau prea mare. Dumnezeu vrea sa auda tot ce ai pe inima! ❤️', stil: 'inspirational' },
  { tema: 'rugaciune', text: 'Rugaciunea nu schimba doar circumstantele - te schimba pe tine! Petrece timp in prezenta Lui! 💫', stil: 'inspirational' },
  { tema: 'rugaciune', text: 'Cel mai puternic lucru pe care il poti face este sa ingenunchezi. Rugaciunea misca munti! 🏔️', stil: 'inspirational' },
  { tema: 'rugaciune', text: 'Doamne, invata-ma sa ma rog. Ajuta-ma sa petrec mai mult timp cu Tine! 🕯️', stil: 'devotional' },
  
  // IERTARE
  { tema: 'iertare', text: 'Iertarea nu inseamna ca ceea ce s-a intamplat a fost ok - inseamna ca nu vei mai fi prizonierul acelui moment! 🕊️', stil: 'inspirational' },
  { tema: 'iertare', text: 'Dumnezeu te-a iertat complet. Astazi, extinde si tu acea iertare celui care te-a ranit! 💖', stil: 'inspirational' },
  { tema: 'iertare', text: 'Iertarea este un cadou pe care ti-l dai tie insuti. Elibereaza povara! 🌟', stil: 'inspirational' },
  { tema: 'iertare', text: 'Doamne, ajuta-ma sa iert din toata inima, asa cum Tu m-ai iertat pe mine! 🙏', stil: 'devotional' },
  
  // PUTERE
  { tema: 'putere', text: 'Cand esti slab, El este tare! Puterea lui Dumnezeu se manifesta cel mai bine in slabiciunea noastra! 💪', stil: 'inspirational' },
  { tema: 'putere', text: 'Nu esti singur in lupta ta. Cel care a creat universul merge alaturi de tine! 🦁', stil: 'inspirational' },
  { tema: 'putere', text: 'Obstacolul din fata ta nu este mai mare decat Dumnezeul care este in tine! Ridica-te si mergi! ⚡', stil: 'inspirational' },
  { tema: 'putere', text: 'Pot totul in Hristos care ma intareste. Aceasta nu e doar o promisiune - e realitate! 🌟', stil: 'inspirational' },
  { tema: 'putere', text: 'Doamne, da-mi puterea Ta in slabiciunea mea. Cand nu mai pot, Tu poti prin mine! 🙏', stil: 'devotional' },
  
  // RECUNOSTINTA
  { tema: 'recunostinta', text: 'Recunostinta transforma ce avem in suficient. Astazi, numara binecuvantarile, nu problemele! 🌸', stil: 'inspirational' },
  { tema: 'recunostinta', text: 'Un om recunoscator este un om fericit. Multumeste-I lui Dumnezeu pentru fiecare respiratie! 🌅', stil: 'inspirational' },
  { tema: 'recunostinta', text: 'Recunostinta deschide usile pentru mai multe binecuvantari! 🙏', stil: 'inspirational' },
  { tema: 'recunostinta', text: 'Doamne, iti multumesc pentru viata mea, pentru fiecare zi pe care mi-o dai! 💛', stil: 'devotional' },
  
  // FAMILIE
  { tema: 'familie', text: 'Familia este cel mai pretios dar de la Dumnezeu. Iubeste-i pe ai tai asa cum El te iubeste pe tine! 👨‍👩‍👧', stil: 'inspirational' },
  { tema: 'familie', text: 'O familie care se roaga impreuna ramane impreuna. Puneti-L pe Dumnezeu in centrul casei voastre! 🏠', stil: 'inspirational' },
  { tema: 'familie', text: 'Doamne, binecuvinteaza familia mea. Protejeaza-i si umple-ne casa cu dragoste si pace! 🙏', stil: 'devotional' },
  
  // VINDECARE
  { tema: 'vindecare', text: 'Dumnezeu vindeca nu doar trupul, ci si sufletul. Incredinteaza-I ranile tale si El le va vindeca! 🌿', stil: 'inspirational' },
  { tema: 'vindecare', text: 'Prin ranile Lui suntem tamaduiti. Aceasta promisiune este pentru tine, astazi! ✨', stil: 'inspirational' },
  { tema: 'vindecare', text: 'Doamne, vindeca-mi inima zdrobita. Tu esti Marele Doctor si nimic nu este imposibil pentru Tine! 🙏', stil: 'devotional' },
  
  // INTELEPCIUNE
  { tema: 'intelepciune', text: 'Adevarata intelepciune incepe cu frica de Dumnezeu. Cauta-L pe El si vei gasi raspunsurile! 📖', stil: 'inspirational' },
  { tema: 'intelepciune', text: 'Cuvantul lui Dumnezeu este lumina pe cararea ta. Lasa-l sa te calauzeasca in fiecare zi! 🕯️', stil: 'inspirational' },
  { tema: 'intelepciune', text: 'Doamne, da-mi intelepciune pentru deciziile pe care trebuie sa le iau. Calauzeste-mi pasii! 🙏', stil: 'devotional' },
  
  // DEFAULT
  { tema: 'default', text: 'Dumnezeu are un plan minunat pentru viata ta. Chiar daca acum nu il vezi, El lucreaza! 🌟', stil: 'inspirational' },
  { tema: 'default', text: 'Astazi este o zi noua, plina de posibilitati. Dumnezeu este cu tine in fiecare moment! ✨', stil: 'inspirational' },
  { tema: 'default', text: 'Cuvantul lui Dumnezeu este viu si lucrator. Lasa-l sa transforme inima ta astazi! 📖', stil: 'inspirational' },
  { tema: 'default', text: 'Nu stii ce aduce ziua de maine, dar stii Cine tine ziua de maine in mainile Lui! 🙏', stil: 'inspirational' },
  { tema: 'default', text: 'Fiecare zi e o noua sansa sa experimentezi harul lui Dumnezeu. Traieste-o din plin! 🌅', stil: 'inspirational' },
  { tema: 'default', text: 'Promisiunile lui Dumnezeu nu au termen de expirare. Ce ti-a promis, va implini! 💫', stil: 'inspirational' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/popas-pentru-suflet');
  console.log('✅ Conectat');
  
  await Desc.deleteMany({});
  await Desc.insertMany(descrieri);
  
  const total = await Desc.countDocuments();
  console.log(`✅ ${total} descrieri importate!`);
  
  const teme = await Desc.distinct('tema');
  teme.forEach(async t => {
    const n = await Desc.countDocuments({ tema: t });
    console.log(`   ${t}: ${n}`);
  });
  
  setTimeout(() => process.exit(0), 1000);
}

run().catch(e => { console.error(e); process.exit(1); });